// src/lib/stores/auth.ts - Enhanced version with encryption
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
  encryptData
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
          
          // Update last login time if user is authenticated
          if (user && db) {
            try {
              // Check if user document exists
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists()) {
                await updateDoc(doc(db, 'users', user.uid), {
                  lastLogin: serverTimestamp()
                });
              }
            } catch (error) {
              console.error('Error updating last login:', error);
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
        storeEncryptionKey(encryptionKey);

        // Step 3: Force refresh ID token to ensure Firestore has access to request.auth
        await user.getIdToken(true);

        // Step 4: Wait briefly (optional)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 5: Create user document with encryption enabled
        const userData: UserData = {
          uid: user.uid,
          email: user.email!,
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

          console.log('User profile created successfully with encryption enabled for:', user.uid);
        } catch (profileError) {
          // Rollback if profile creation fails
          console.error('Error creating user profile:', profileError);
          if (user) {
            await user.delete();
          }
          clearEncryptionKey();
          throw new Error('Failed to create user profile. Please try again.');
        }

        return user;

      } catch (error: any) {
        if (user) {
          try {
            await user.delete(); // Cleanup
          } catch (deleteError) {
            console.error('Error deleting user after failed profile creation:', deleteError);
          }
        }
        clearEncryptionKey();

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
        
        // Generate and store encryption key
        const encryptionKey = await generateUserKey(user.uid, password);
        storeEncryptionKey(encryptionKey);
        
        // Check if user profile exists
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          console.log('User profile not found, creating one...');
          // Create profile for users who signed up before profile creation was implemented
          const userData: UserData = {
            uid: user.uid,
            email: user.email!,
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
            clearEncryptionKey();
            throw new Error('Account is locked. Please contact support.');
          }
          
          // Update user document
          await updateDoc(doc(db, 'users', user.uid), updates);
        }
        
        return user;
      } catch (error: any) {
        clearEncryptionKey();
        
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
        clearEncryptionKey(); // Clear encryption key before signing out
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
        
        // Store the new key
        storeEncryptionKey(newEncryptionKey);
        
        // Note: In a real implementation, you would need to:
        // 1. Decrypt all encrypted data with the old key
        // 2. Re-encrypt with the new key
        // 3. Update all encrypted documents in Firestore
        
        return true;
      } catch (error) {
        console.error('Error re-encrypting data:', error);
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
        // Import user store to set deletion flag
        const { userStore, journalStore, bugStore } = await import('$lib/stores/user');
        
        // Set deletion flag to prevent re-creation
        userStore.setDeleting(true);
        
        // Re-authenticate user before deletion
        const credential = EmailAuthProvider.credential(user.email!, password);
        await reauthenticateWithCredential(user, credential);
        
        console.log('Starting account deletion for user:', uid);
        
        // Clean up store listeners first
        userStore.cleanup();
        journalStore.cleanup();
        bugStore.cleanup();
        
        // Clear encryption key
        clearEncryptionKey();
        
        // Get user data to clean up username reference
        const userDoc = await getDoc(doc(db, 'users', uid));
        const username = userDoc.exists() ? userDoc.data().username : null;
        
        // Delete all journal entries first
        console.log('Deleting journal entries...');
        const journalQuery = query(collection(db, 'journal'), where('uid', '==', uid));
        const journalSnapshot = await getDocs(journalQuery);
        console.log(`Found ${journalSnapshot.size} journal entries to delete`);
        
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
        console.log('Deleting bug reports...');
        const bugsQuery = query(collection(db, 'bugs'), where('uid', '==', uid));
        const bugsSnapshot = await getDocs(bugsQuery);
        console.log(`Found ${bugsSnapshot.size} bug reports to delete`);
        
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
        console.log('Deleting user profile and username...');
        const finalBatch = writeBatch(db);
        
        // Delete user document
        finalBatch.delete(doc(db, 'users', uid));
        
        // Delete username reference
        if (username) {
          console.log(`Deleting username reference: ${username.toLowerCase()}`);
          finalBatch.delete(doc(db, 'usernames', username.toLowerCase()));
        }
        
        // Delete user preferences if exists
        finalBatch.delete(doc(db, 'preferences', uid));
        
        // Commit final batch
        await finalBatch.commit();
        
        console.log('All Firestore data deleted, now deleting auth user...');
        
        // Finally, delete the auth user
        await deleteUser(user);
        
        console.log('Account deletion completed successfully');
        
      } catch (error: any) {
        console.error('Error during account deletion:', error);
        
        // Reset deletion flag on error
        const { userStore } = await import('$lib/stores/user');
        userStore.setDeleting(false);
        
        if (error.code === 'auth/wrong-password') {
          throw new Error('Incorrect password');
        } else if (error.code === 'auth/requires-recent-login') {
          throw new Error('Please sign out and sign in again before deleting your account');
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