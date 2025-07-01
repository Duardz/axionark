// src/lib/stores/auth.ts - Complete fixed version
import { writable, derived } from 'svelte/store';
import { auth, db } from '$lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { browser } from '$app/environment';
import { 
  validateEmail, 
  validatePassword, 
  sanitizeUsername,
  checkRateLimit
} from '$lib/utils/security';
import {
  generateUserKey,
  storeEncryptionKey,
  clearEncryptionKey,
  generateSecurePassword,
  encryptData,
  isEncryptionAvailableAsync,
  initializeEncryption,
  getEncryptionKeyAsync,
  restoreEncryptionFromSession,
  isEncryptionAvailable,
  checkAndRestoreEncryption
} from '$lib/utils/encryption';

interface UserData {
  uid: string;
  email: string;
  username: string;
  createdAt: Date | Timestamp | any;
  totalXP: number;
  completedTasks: string[];
  currentPhase: 'beginner' | 'intermediate' | 'advanced';
  totalBounty: number;
  bugsFound: number;
  lastLogin?: Date | Timestamp | any;
  loginAttempts?: number;
  accountLocked?: boolean;
  updatedAt?: Date | Timestamp | any;
  encryptionEnabled?: boolean;
  encryptedFields?: string[]; // Track which fields are encrypted
}

interface AuthError {
  code: string;
  message: string;
}

function createAuthStore() {
  const { subscribe, set } = writable<User | null>(null);
  let unsubscribe: (() => void) | null = null;
  let isInitializing = false;
  let sessionCheckInterval: NodeJS.Timeout | null = null;

  // Periodically check and restore encryption if needed
  function startSessionCheck(uid: string) {
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
    }

    // Check every 5 minutes
    sessionCheckInterval = setInterval(async () => {
      const hasKey = await isEncryptionAvailableAsync(uid);
      if (!hasKey) {
        console.log('Encryption key lost, attempting to restore from IndexedDB...');
        const restored = await checkAndRestoreEncryption(uid);
        if (!restored) {
          console.warn('Could not restore encryption key. User may need to re-authenticate.');
          // You could show a notification here asking user to re-enter password
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  function stopSessionCheck() {
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
      sessionCheckInterval = null;
    }
  }

  return {
    subscribe,
    initialize: () => {
      if (browser && auth) {
        // Clean up previous subscription
        if (unsubscribe) {
          unsubscribe();
        }
        
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          set(user);
          
          // Clear session check if no user
          if (!user) {
            stopSessionCheck();
            return;
          }
          
          // If user is authenticated, ensure we have encryption
          if (user && db && !isInitializing) {
            isInitializing = true;
            
            try {
              // Start session check for this user
              startSessionCheck(user.uid);
              
              // Try to restore encryption in order of preference
              let encryptionRestored = false;
              
              // 1. Try session storage first (fastest)
              encryptionRestored = await restoreEncryptionFromSession(user.uid);
              
              // 2. Try IndexedDB if session storage failed
              if (!encryptionRestored) {
                encryptionRestored = await initializeEncryption(user.uid);
              }
              
              // 3. Check one more time with the full restore function
              if (!encryptionRestored) {
                encryptionRestored = await checkAndRestoreEncryption(user.uid);
              }
              
              if (!encryptionRestored) {
                console.log('No encryption key found. User data may appear encrypted.');
              }
              
              // Check if user document exists and update last login
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                const updates: any = {
                  lastLogin: serverTimestamp()
                };
                
                // IMPORTANT: Always sync email from auth to user profile
                if (!userData.email || userData.email !== user.email) {
                  updates.email = user.email;
                }
                
                // Don't update if we can't decrypt - this prevents overwriting with bad data
                if (encryptionRestored || !userData.encryptionEnabled) {
                  await updateDoc(doc(db, 'users', user.uid), updates);
                }
              }
            } catch (error) {
              console.error('Error initializing user session:', error);
            } finally {
              isInitializing = false;
            }
          }
        });
      }
    },
    
    cleanup: () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      stopSessionCheck();
      clearEncryptionKey(); // Clear encryption key on cleanup
    },
    
    signUp: async (email: string, password: string, username: string) => {
      if (!auth || !db) throw new Error('Firebase not initialized');

      // Rate limiting
      if (!checkRateLimit(`signup_${email}`, 10, 3600000)) {
        throw new Error('Too many signup attempts. Please try again later.');
      }

      // Input validation
      if (!validateEmail(email)) {
        throw new Error('Invalid email address');
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.errors[0]);
      }

      const sanitizedUsername = sanitizeUsername(username);
      if (sanitizedUsername.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      if (sanitizedUsername.length > 50) {
        throw new Error('Username must be less than 50 characters');
      }

      let user: User | null = null;

      try {
        // Check if username already exists BEFORE creating the auth user
        const usernameDoc = await getDoc(doc(db, 'usernames', sanitizedUsername.toLowerCase()));
        if (usernameDoc.exists()) {
          throw new Error('Username already taken');
        }

        // Step 1: Create the authentication user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;

        // Step 2: Generate encryption key for the user
        const encryptionKey = await generateUserKey(user.uid, password);
        await storeEncryptionKey(encryptionKey, user.uid, 720); // Store for 30 days

        // Step 3: Force refresh ID token to ensure Firestore has access to request.auth
        await user.getIdToken(true);

        // Step 4: Wait to ensure encryption key is properly stored
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 5: Verify encryption is available
        const encryptionAvailable = await isEncryptionAvailable();
        if (!encryptionAvailable) {
          console.warn('Encryption key not immediately available, retrying...');
          await storeEncryptionKey(encryptionKey, user.uid, 720);
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Step 6: Create user document with encryption enabled
        const userData: UserData = {
          uid: user.uid,
          email: user.email!, // Ensure email is always set
          username: sanitizedUsername,
          createdAt: serverTimestamp(),
          totalXP: 0,
          completedTasks: [],
          currentPhase: 'beginner',
          totalBounty: 0,
          bugsFound: 0,
          lastLogin: serverTimestamp(),
          loginAttempts: 0,
          accountLocked: false,
          updatedAt: serverTimestamp(),
          encryptionEnabled: true,
          encryptedFields: [] // Will be populated as fields are encrypted
        };

        try {
          // Create user profile
          await setDoc(doc(db, 'users', user.uid), userData);

          // Create username mapping
          await setDoc(doc(db, 'usernames', sanitizedUsername.toLowerCase()), {
            uid: user.uid,
            createdAt: serverTimestamp()
          });

          // Start session check
          startSessionCheck(user.uid);

        } catch (profileError) {
          // Rollback if profile creation fails
          if (user) {
            await user.delete();
          }
          await clearEncryptionKey(user.uid);
          throw new Error('Failed to create user profile. Please try again.');
        }

        return user;

      } catch (error: any) {
        if (user) {
          try {
            await user.delete(); // Cleanup
          } catch (deleteError) {
            // Silent fail
          }
        }
        await clearEncryptionKey(user?.uid);

        const authError = handleAuthError(error);
        throw new Error(authError.message);
      }
    },

    signIn: async (email: string, password: string) => {
      if (!auth || !db) throw new Error('Firebase not initialized');
      
      // Rate limiting
      if (!checkRateLimit(`signin_${email}`, 5, 300000)) {
        throw new Error('Too many login attempts. Please try again later.');
      }
      
      // Input validation
      if (!validateEmail(email)) {
        throw new Error('Invalid email address');
      }
      
      if (password.length < 6 || password.length > 128) {
        throw new Error('Invalid password');
      }
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Generate and store encryption key BEFORE any data loading
        const encryptionKey = await generateUserKey(user.uid, password);
        await storeEncryptionKey(encryptionKey, user.uid, 720); // Store for 30 days
        
        // Wait to ensure the key is properly stored
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify encryption is available
        const encryptionAvailable = await isEncryptionAvailableAsync(user.uid);
        if (!encryptionAvailable) {
          console.warn('Encryption key not immediately available, retrying...');
          await storeEncryptionKey(encryptionKey, user.uid, 720);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Double-check encryption key is available
        const finalCheck = await getEncryptionKeyAsync(user.uid);
        if (!finalCheck) {
          console.error('Failed to store encryption key properly');
        }
        
        // Start session check
        startSessionCheck(user.uid);
        
        // Check if user profile exists
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          // Create profile for users who signed up before profile creation was implemented
          const userData: UserData = {
            uid: user.uid,
            email: user.email!, // Ensure email is always set
            username: user.email!.split('@')[0] || 'User',
            createdAt: serverTimestamp(),
            totalXP: 0,
            completedTasks: [],
            currentPhase: 'beginner',
            totalBounty: 0,
            bugsFound: 0,
            lastLogin: serverTimestamp(),
            loginAttempts: 0,
            accountLocked: false,
            updatedAt: serverTimestamp(),
            encryptionEnabled: true,
            encryptedFields: []
          };
          
          await setDoc(doc(db, 'users', user.uid), userData);
        } else {
          const userData = userDoc.data();
          
          // Check if missing required fields and add them
          const updates: any = {
            lastLogin: serverTimestamp(),
            loginAttempts: 0
          };
          
          // CRITICAL: Always ensure email is synchronized
          if (!userData.email || userData.email !== user.email) {
            updates.email = user.email;
          }
          
          // Add missing fields if they don't exist
          if (userData.totalBounty === undefined) updates.totalBounty = 0;
          if (userData.bugsFound === undefined) updates.bugsFound = 0;
          if (userData.updatedAt === undefined) updates.updatedAt = serverTimestamp();
          if (userData.totalXP === undefined) updates.totalXP = 0;
          if (!Array.isArray(userData.completedTasks)) updates.completedTasks = [];
          if (userData.currentPhase === undefined) updates.currentPhase = 'beginner';
          
          // Enable encryption for existing users
          if (userData.encryptionEnabled === undefined) {
            updates.encryptionEnabled = true;
            updates.encryptedFields = [];
          }
          
          if (userData.accountLocked) {
            await signOut(auth);
            await clearEncryptionKey(user.uid);
            throw new Error('Account is locked. Please contact support.');
          }
          
          // Update user document
          await updateDoc(doc(db, 'users', user.uid), updates);
        }
        
        // Force initialize encryption in stores
        const { userStore, journalStore, bugStore } = await import('$lib/stores/user');
        
        // Wait a bit more to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return user;
      } catch (error: any) {
        await clearEncryptionKey();
        stopSessionCheck();
        
        // Generic error message to prevent user enumeration
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          throw new Error('Invalid email or password');
        }
        
        const authError = handleAuthError(error);
        throw new Error(authError.message);
      }
    },
    
    signOut: async () => {
      if (!auth) throw new Error('Firebase not initialized');
      
      try {
        // Get current user ID before signing out
        const currentUser = auth.currentUser;
        const userId = currentUser?.uid;
        
        // Stop session check
        stopSessionCheck();
        
        // Clear encryption key before signing out
        await clearEncryptionKey(userId);
        
        // Clean up stores
        const { userStore, journalStore, bugStore } = await import('$lib/stores/user');
        userStore.cleanup();
        journalStore.cleanup();
        bugStore.cleanup();
        
        await signOut(auth);
      } catch (error: any) {
        throw new Error('Failed to sign out. Please try again.');
      }
    },
    
    updateUsername: async (uid: string, newUsername: string) => {
      if (!db) throw new Error('Firebase not initialized');
      
      // Rate limiting
      if (!checkRateLimit(`update_username_${uid}`, 3, 3600000)) {
        throw new Error('Too many username changes. Please try again later.');
      }
      
      const sanitizedUsername = sanitizeUsername(newUsername);
      if (sanitizedUsername.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }
      
      if (sanitizedUsername.length > 50) {
        throw new Error('Username must be less than 50 characters');
      }
      
      try {
        // Check if new username is available
        const usernameDoc = await getDoc(doc(db, 'usernames', sanitizedUsername.toLowerCase()));
        if (usernameDoc.exists() && usernameDoc.data().uid !== uid) {
          throw new Error('Username already taken');
        }
        
        // Get old username to delete the reference
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) {
          throw new Error('User not found');
        }
        
        const oldUsername = userDoc.data().username;
        
        // Update username with transaction-like behavior
        const batch = writeBatch(db);
        
        // Update user document
        batch.update(doc(db, 'users', uid), {
          username: sanitizedUsername,
          updatedAt: serverTimestamp()
        });
        
        // Set new username document
        batch.set(doc(db, 'usernames', sanitizedUsername.toLowerCase()), { 
          uid,
          updatedAt: serverTimestamp()
        });
        
        // Delete old username reference if it exists and is different
        if (oldUsername && oldUsername.toLowerCase() !== sanitizedUsername.toLowerCase()) {
          batch.delete(doc(db, 'usernames', oldUsername.toLowerCase()));
        }
        
        // Commit the batch
        await batch.commit();
        
      } catch (error: any) {
        throw new Error(error.message || 'Failed to update username');
      }
    },
    
    sendPasswordReset: async (email: string) => {
      if (!auth) throw new Error('Firebase not initialized');
      
      // Rate limiting
      if (!checkRateLimit(`password_reset_${email}`, 3, 3600000)) {
        throw new Error('Too many password reset attempts. Please try again later.');
      }
      
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error: any) {
        const authError = handleAuthError(error);
        throw new Error(authError.message);
      }
    },
    
    // Re-encrypt data with new password (after password change)
    reEncryptData: async (oldPassword: string, newPassword: string) => {
      if (!auth || !auth.currentUser) throw new Error('Not authenticated');
      
      const uid = auth.currentUser.uid;
      
      try {
        // Generate new encryption key
        const newEncryptionKey = await generateUserKey(uid, newPassword);
        
        // Store the new key with extended expiration
        await storeEncryptionKey(newEncryptionKey, uid, 720); // 30 days
        
        // Wait to ensure it's stored
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Note: In a real implementation, you would need to:
        // 1. Decrypt all encrypted data with the old key
        // 2. Re-encrypt with the new key
        // 3. Update all encrypted documents in Firestore
        
        return true;
      } catch (error) {
        throw new Error('Failed to re-encrypt data');
      }
    },
    
    deleteAccount: async (password: string) => {
      if (!auth || !db || !auth.currentUser) {
        throw new Error('Not authenticated');
      }
      
      const user = auth.currentUser;
      const uid = user.uid;
      
      try {
        // Re-authenticate user FIRST before any other operations
        const credential = EmailAuthProvider.credential(user.email!, password);
        await reauthenticateWithCredential(user, credential);
        
        // Import user store to set deletion flag
        const { userStore, journalStore, bugStore } = await import('$lib/stores/user');
        
        // Set deletion flag to prevent re-creation
        userStore.setDeleting(true);
        
        // Stop session check
        stopSessionCheck();
        
        // Get user data to clean up username reference BEFORE cleaning stores
        const userDoc = await getDoc(doc(db, 'users', uid));
        const username = userDoc.exists() ? userDoc.data().username : null;
        
        // Clean up store listeners
        userStore.cleanup();
        journalStore.cleanup();
        bugStore.cleanup();
        
        // Clear encryption key
        await clearEncryptionKey(uid);
        
        // Small delay to ensure all listeners are cleaned up
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Delete all journal entries first
        const journalQuery = query(collection(db, 'journal'), where('uid', '==', uid));
        const journalSnapshot = await getDocs(journalQuery);
        
        // Delete in batches of 500 (Firestore limit)
        let journalBatch = writeBatch(db);
        let journalCount = 0;
        
        for (const doc of journalSnapshot.docs) {
          journalBatch.delete(doc.ref);
          journalCount++;
          
          if (journalCount === 500) {
            await journalBatch.commit();
            journalBatch = writeBatch(db);
            journalCount = 0;
          }
        }
        
        if (journalCount > 0) {
          await journalBatch.commit();
        }
        
        // Delete all bugs
        const bugsQuery = query(collection(db, 'bugs'), where('uid', '==', uid));
        const bugsSnapshot = await getDocs(bugsQuery);
        
        let bugsBatch = writeBatch(db);
        let bugsCount = 0;
        
        for (const doc of bugsSnapshot.docs) {
          bugsBatch.delete(doc.ref);
          bugsCount++;
          
          if (bugsCount === 500) {
            await bugsBatch.commit();
            bugsBatch = writeBatch(db);
            bugsCount = 0;
          }
        }
        
        if (bugsCount > 0) {
          await bugsBatch.commit();
        }
        
        // Delete user document and username reference
        const finalBatch = writeBatch(db);
        
        // Delete user document
        finalBatch.delete(doc(db, 'users', uid));
        
        // Delete username reference
        if (username) {
          finalBatch.delete(doc(db, 'usernames', username.toLowerCase()));
        }
        
        // Delete user preferences if exists
        finalBatch.delete(doc(db, 'preferences', uid));
        
        // Commit final batch
        await finalBatch.commit();
        
        // Small delay before deleting auth user
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Finally, delete the auth user
        await deleteUser(user);
        
        // The auth state change listener will handle the redirect
        
      } catch (error: any) {
        // Reset deletion flag on error
        try {
          const { userStore } = await import('$lib/stores/user');
          userStore.setDeleting(false);
        } catch (e) {
          // Ignore import errors during cleanup
        }
        
        console.error('Delete account error:', error);
        
        if (error.code === 'auth/wrong-password') {
          throw new Error('Incorrect password');
        } else if (error.code === 'auth/requires-recent-login') {
          throw new Error('Please sign out and sign in again before deleting your account');
        } else if (error.code === 'auth/network-request-failed') {
          throw new Error('Network error. Please check your connection and try again.');
        }
        
        const authError = handleAuthError(error);
        throw new Error(authError.message);
      }
    }
  };
}

// Handle Firebase Auth errors with user-friendly messages
function handleAuthError(error: any): AuthError {
  const errorMap: { [key: string]: string } = {
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/weak-password': 'Password is too weak',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'Invalid email or password',
    'auth/wrong-password': 'Invalid email or password',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/invalid-credential': 'Invalid login credentials',
    'auth/account-exists-with-different-credential': 'An account already exists with this email',
    'auth/requires-recent-login': 'Please sign out and sign in again to perform this action'
  };
  
  return {
    code: error.code || 'unknown',
    message: errorMap[error.code] || error.message || 'An unexpected error occurred'
  };
}

export const authStore = createAuthStore();
export const isAuthenticated = derived(authStore, $auth => !!$auth);