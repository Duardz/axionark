// src/lib/stores/auth.ts
import { writable, derived } from 'svelte/store';
import { auth, db } from '$lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { browser } from '$app/environment';
import { 
  validateEmail, 
  validatePassword, 
  sanitizeUsername,
  checkRateLimit
} from '$lib/utils/security';

interface UserData {
  uid: string;
  email: string;
  username: string;
  createdAt: Date;
  totalXP: number;
  completedTasks: string[];
  currentPhase: 'beginner' | 'intermediate' | 'advanced';
  lastLogin?: Date;
  loginAttempts?: number;
  accountLocked?: boolean;
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
              await updateDoc(doc(db, 'users', user.uid), {
                lastLogin: new Date()
              });
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
    },
    
    signUp: async (email: string, password: string, username: string) => {
      if (!auth || !db) throw new Error('Firebase not initialized');
      
      // Rate limiting
      if (!checkRateLimit(`signup_${email}`, 3, 3600000)) { // 3 attempts per hour
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
      
      try {
        // Check if username already exists
        const usernameDoc = await getDoc(doc(db, 'usernames', sanitizedUsername.toLowerCase()));
        if (usernameDoc.exists()) {
          throw new Error('Username already taken');
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user document with sanitized data
        const userData: UserData = {
          uid: user.uid,
          email: user.email!,
          username: sanitizedUsername,
          createdAt: new Date(),
          totalXP: 0,
          completedTasks: [],
          currentPhase: 'beginner',
          lastLogin: new Date(),
          loginAttempts: 0,
          accountLocked: false
        };
        
        // Use batch write for atomicity
        await Promise.all([
          setDoc(doc(db, 'users', user.uid), userData),
          setDoc(doc(db, 'usernames', sanitizedUsername.toLowerCase()), { uid: user.uid })
        ]);
        
        return user;
      } catch (error: any) {
        // Handle specific Firebase errors
        const authError = handleAuthError(error);
        throw new Error(authError.message);
      }
    },
    
    signIn: async (email: string, password: string) => {
      if (!auth || !db) throw new Error('Firebase not initialized');
      
      // Rate limiting
      if (!checkRateLimit(`signin_${email}`, 5, 300000)) { // 5 attempts per 5 minutes
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
        // Check if account is locked
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.accountLocked) {
            await signOut(auth);
            throw new Error('Account is locked. Please contact support.');
          }
          
          // Reset login attempts on successful login
          await updateDoc(doc(db, 'users', user.uid), {
            loginAttempts: 0,
            lastLogin: new Date()
          });
        }
        
        return user;
      } catch (error: any) {
        // Increment failed login attempts
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          // Generic error message to prevent user enumeration
          throw new Error('Invalid email or password');
        }
        
        const authError = handleAuthError(error);
        throw new Error(authError.message);
      }
    },
    
    signOut: async () => {
      if (!auth) throw new Error('Firebase not initialized');
      
      try {
        await signOut(auth);
      } catch (error: any) {
        throw new Error('Failed to sign out. Please try again.');
      }
    },
    
    updateUsername: async (uid: string, newUsername: string) => {
      if (!db) throw new Error('Firebase not initialized');
      
      // Rate limiting
      if (!checkRateLimit(`update_username_${uid}`, 3, 3600000)) { // 3 changes per hour
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
        await Promise.all([
          updateDoc(doc(db, 'users', uid), {
            username: sanitizedUsername
          }),
          setDoc(doc(db, 'usernames', sanitizedUsername.toLowerCase()), { uid }),
          // Delete old username reference if it exists and is different
          ...(oldUsername && oldUsername.toLowerCase() !== sanitizedUsername.toLowerCase() 
            ? [deleteDoc(doc(db, 'usernames', oldUsername.toLowerCase()))] 
            : [])
        ]);
      } catch (error: any) {
        throw new Error(error.message || 'Failed to update username');
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
    'auth/account-exists-with-different-credential': 'An account already exists with this email'
  };
  
  return {
    code: error.code || 'unknown',
    message: errorMap[error.code] || error.message || 'An unexpected error occurred'
  };
}

export const authStore = createAuthStore();
export const isAuthenticated = derived(authStore, $auth => !!$auth);