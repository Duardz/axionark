// src/lib/stores/auth.ts - Fixed version with better error handling for account deletion
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
  getUserMasterKey,
  storeEncryptionKey,
  clearEncryptionKey,
  permanentlyDeleteEncryptionKey,
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
  encryptedFields?: string[];
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

  function startSessionCheck(uid: string) {
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
    }

    sessionCheckInterval = setInterval(async () => {
      const hasKey = await isEncryptionAvailableAsync(uid);
      if (!hasKey) {
        console.log('Encryption key lost, attempting to restore from IndexedDB...');
        const restored = await checkAndRestoreEncryption(uid);
        if (!restored) {
          console.warn('Could not restore encryption key. User may need to re-authenticate.');
        }
      }
    }, 5 * 60 * 1000);
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
        if (unsubscribe) {
          unsubscribe();
        }
        
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          set(user);
          
          if (!user) {
            stopSessionCheck();
            return;
          }
          
          if (user && db && !isInitializing) {
            isInitializing = true;
            
            try {
              startSessionCheck(user.uid);
              
              let encryptionRestored = false;
              
              encryptionRestored = await restoreEncryptionFromSession(user.uid);
              
              if (!encryptionRestored) {
                encryptionRestored = await initializeEncryption(user.uid);
              }
              
              if (!encryptionRestored) {
                encryptionRestored = await checkAndRestoreEncryption(user.uid);
              }
              
              if (!encryptionRestored) {
                console.log('No encryption key found. User data may appear encrypted.');
              }
              
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                const updates: any = {
                  lastLogin: serverTimestamp()
                };
                
                if (!userData.email || userData.email !== user.email) {
                  updates.email = user.email;
                }
                
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
      clearEncryptionKey();
    },
    
    signUp: async (email: string, password: string, username: string) => {
      if (!auth || !db) throw new Error('Firebase not initialized');

      if (!checkRateLimit(`signup_${email}`, 10, 3600000)) {
        throw new Error('Too many signup attempts. Please try again later.');
      }

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
        const usernameDoc = await getDoc(doc(db, 'usernames', sanitizedUsername.toLowerCase()));
        if (usernameDoc.exists()) {
          throw new Error('Username already taken');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;

        // Generate a master encryption key (NOT based on password)
        const masterKey = await getUserMasterKey(user.uid);
        await storeEncryptionKey(masterKey, user.uid, 8760); // Store for 1 year

        await user.getIdToken(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const encryptionAvailable = await isEncryptionAvailable();
        if (!encryptionAvailable) {
          console.warn('Encryption key not immediately available, retrying...');
          await storeEncryptionKey(masterKey, user.uid, 8760);
          await new Promise(resolve => setTimeout(resolve, 500));
        }

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
          encryptedFields: []
        };

        try {
          await setDoc(doc(db, 'users', user.uid), userData);

          await setDoc(doc(db, 'usernames', sanitizedUsername.toLowerCase()), {
            uid: user.uid,
            createdAt: serverTimestamp()
          });

          startSessionCheck(user.uid);

        } catch (profileError) {
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
            await user.delete();
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
      
      if (!checkRateLimit(`signin_${email}`, 5, 300000)) {
        throw new Error('Too many login attempts. Please try again later.');
      }
      
      if (!validateEmail(email)) {
        throw new Error('Invalid email address');
      }
      
      if (password.length < 6 || password.length > 128) {
        throw new Error('Invalid password');
      }
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get or create the master encryption key (NOT based on password)
        const masterKey = await getUserMasterKey(user.uid);
        await storeEncryptionKey(masterKey, user.uid, 8760); // Store for 1 year
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const encryptionAvailable = await isEncryptionAvailableAsync(user.uid);
        if (!encryptionAvailable) {
          console.warn('Encryption key not immediately available, retrying...');
          await storeEncryptionKey(masterKey, user.uid, 8760);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const finalCheck = await getEncryptionKeyAsync(user.uid);
        if (!finalCheck) {
          console.error('Failed to store encryption key properly');
        }
        
        startSessionCheck(user.uid);
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
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
          
          const updates: any = {
            lastLogin: serverTimestamp(),
            loginAttempts: 0
          };
          
          if (!userData.email || userData.email !== user.email) {
            updates.email = user.email;
          }
          
          if (userData.totalBounty === undefined) updates.totalBounty = 0;
          if (userData.bugsFound === undefined) updates.bugsFound = 0;
          if (userData.updatedAt === undefined) updates.updatedAt = serverTimestamp();
          if (userData.totalXP === undefined) updates.totalXP = 0;
          if (!Array.isArray(userData.completedTasks)) updates.completedTasks = [];
          if (userData.currentPhase === undefined) updates.currentPhase = 'beginner';
          
          if (userData.encryptionEnabled === undefined) {
            updates.encryptionEnabled = true;
            updates.encryptedFields = [];
          }
          
          if (userData.accountLocked) {
            await signOut(auth);
            await clearEncryptionKey(user.uid);
            throw new Error('Account is locked. Please contact support.');
          }
          
          await updateDoc(doc(db, 'users', user.uid), updates);
        }
        
        const { userStore, journalStore, bugStore } = await import('$lib/stores/user');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return user;
      } catch (error: any) {
        await clearEncryptionKey();
        stopSessionCheck();
        
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
        const currentUser = auth.currentUser;
        const userId = currentUser?.uid;
        
        stopSessionCheck();
        
        // Don't permanently delete the key on logout, just clear from session
        await clearEncryptionKey(userId);
        
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
        const usernameDoc = await getDoc(doc(db, 'usernames', sanitizedUsername.toLowerCase()));
        if (usernameDoc.exists() && usernameDoc.data().uid !== uid) {
          throw new Error('Username already taken');
        }
        
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) {
          throw new Error('User not found');
        }
        
        const oldUsername = userDoc.data().username;
        
        const batch = writeBatch(db);
        
        batch.update(doc(db, 'users', uid), {
          username: sanitizedUsername,
          updatedAt: serverTimestamp()
        });
        
        batch.set(doc(db, 'usernames', sanitizedUsername.toLowerCase()), { 
          uid,
          updatedAt: serverTimestamp()
        });
        
        if (oldUsername && oldUsername.toLowerCase() !== sanitizedUsername.toLowerCase()) {
          batch.delete(doc(db, 'usernames', oldUsername.toLowerCase()));
        }
        
        await batch.commit();
        
      } catch (error: any) {
        throw new Error(error.message || 'Failed to update username');
      }
    },
    
    sendPasswordReset: async (email: string) => {
      if (!auth) throw new Error('Firebase not initialized');
      
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
    
    // No need to re-encrypt data anymore since key is not based on password
    reEncryptData: async (oldPassword: string, newPassword: string) => {
      // This function is now a no-op since encryption key is not based on password
      return true;
    },
    
    deleteAccount: async (password: string) => {
      if (!auth || !db || !auth.currentUser) {
        throw new Error('Not authenticated');
      }
      
      const user = auth.currentUser;
      const uid = user.uid;
      
      try {
        // First, re-authenticate the user
        const credential = EmailAuthProvider.credential(user.email!, password);
        await reauthenticateWithCredential(user, credential);
        
        const { userStore, journalStore, bugStore } = await import('$lib/stores/user');
        
        // Set deleting flag to prevent reactive updates
        userStore.setDeleting(true);
        
        // Stop session check
        stopSessionCheck();
        
        // Get username for cleanup
        const userDoc = await getDoc(doc(db, 'users', uid));
        const username = userDoc.exists() ? userDoc.data().username : null;
        
        // Cleanup stores
        userStore.cleanup();
        journalStore.cleanup();
        bugStore.cleanup();
        
        // Delete journal entries using queries instead of transactions
        console.log('Deleting journal entries...');
        try {
          const journalQuery = query(collection(db, 'journal'), where('uid', '==', uid));
          const journalSnapshot = await getDocs(journalQuery);
          
          // Delete in smaller batches to avoid hitting limits
          const deletePromises: Promise<void>[] = [];
          journalSnapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
          });
          
          // Execute deletions in chunks
          const chunkSize = 20;
          for (let i = 0; i < deletePromises.length; i += chunkSize) {
            const chunk = deletePromises.slice(i, i + chunkSize);
            await Promise.all(chunk);
            // Small delay between chunks
            if (i + chunkSize < deletePromises.length) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
          
          console.log(`Deleted ${journalSnapshot.size} journal entries`);
        } catch (error) {
          console.error('Error deleting journal entries:', error);
          // Continue with deletion even if some entries fail
        }
        
        // Delete bug reports
        console.log('Deleting bug reports...');
        try {
          const bugsQuery = query(collection(db, 'bugs'), where('uid', '==', uid));
          const bugsSnapshot = await getDocs(bugsQuery);
          
          const deletePromises: Promise<void>[] = [];
          bugsSnapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
          });
          
          // Execute deletions in chunks
          const chunkSize = 20;
          for (let i = 0; i < deletePromises.length; i += chunkSize) {
            const chunk = deletePromises.slice(i, i + chunkSize);
            await Promise.all(chunk);
            // Small delay between chunks
            if (i + chunkSize < deletePromises.length) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
          
          console.log(`Deleted ${bugsSnapshot.size} bug reports`);
        } catch (error) {
          console.error('Error deleting bug reports:', error);
          // Continue with deletion even if some entries fail
        }
        
        // Delete user profile and related data
        console.log('Deleting user profile and related data...');
        try {
          // Delete username mapping first (while user still exists for auth check)
          if (username) {
            try {
              await deleteDoc(doc(db, 'usernames', username.toLowerCase()));
              console.log('Deleted username mapping');
            } catch (error) {
              console.error('Error deleting username:', error);
              // Continue even if username deletion fails
            }
          }
          
          // Delete preferences if exists
          try {
            await deleteDoc(doc(db, 'preferences', uid));
            console.log('Deleted preferences');
          } catch (error) {
            // Preferences might not exist, that's okay
            console.log('No preferences to delete');
          }
          
          // Delete user document last (this affects auth checks in Firestore rules)
          await deleteDoc(doc(db, 'users', uid));
          console.log('Deleted user document');
          
        } catch (error) {
          console.error('Error deleting user data:', error);
          throw new Error('Failed to delete user data. Please try again.');
        }
        
        // Permanently delete encryption key
        console.log('Deleting encryption key...');
        await permanentlyDeleteEncryptionKey(uid);
        
        // Small delay before deleting auth user
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Finally, delete the Firebase Auth user
        console.log('Deleting authentication account...');
        await deleteUser(user);
        
        console.log('Account deletion completed successfully');
        
      } catch (error: any) {
        // Reset deletion state if error occurs
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
        } else if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
          throw new Error('Permission error. Please try signing out and signing in again.');
        }
        
        const authError = handleAuthError(error);
        throw new Error(authError.message);
      }
    }
  };
}

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
    'auth/requires-recent-login': 'Please sign out and sign in again to perform this action',
    'permission-denied': 'Permission denied. Please try again.',
    'auth/popup-closed-by-user': 'Sign in was cancelled',
    'auth/cancelled-popup-request': 'Another sign in request is already in progress'
  };
  
  return {
    code: error.code || 'unknown',
    message: errorMap[error.code] || error.message || 'An unexpected error occurred'
  };
}

export const authStore = createAuthStore();
export const isAuthenticated = derived(authStore, $auth => !!$auth);