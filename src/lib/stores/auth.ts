import { writable, derived } from 'svelte/store';
import { auth, db } from '$lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { browser } from '$app/environment';

interface UserData {
  uid: string;
  email: string;
  username: string;
  createdAt: Date;
  totalXP: number;
  completedTasks: string[];
  currentPhase: 'beginner' | 'intermediate' | 'advanced';
}

function createAuthStore() {
  const { subscribe, set } = writable<User | null>(null);

  return {
    subscribe,
    initialize: () => {
      if (browser && auth) {
        onAuthStateChanged(auth, (user) => {
          set(user);
        });
      }
    },
    signUp: async (email: string, password: string, username: string) => {
      if (!auth || !db) throw new Error('Firebase not initialized');
      
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user document in Firestore
        const userData: UserData = {
          uid: user.uid,
          email: user.email!,
          username,
          createdAt: new Date(),
          totalXP: 0,
          completedTasks: [],
          currentPhase: 'beginner'
        };
        
        await setDoc(doc(db, 'users', user.uid), userData);
        return user;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    signIn: async (email: string, password: string) => {
      if (!auth) throw new Error('Firebase not initialized');
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    signOut: async () => {
      if (!auth) throw new Error('Firebase not initialized');
      
      try {
        await signOut(auth);
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    updateUsername: async (uid: string, newUsername: string) => {
      if (!db) throw new Error('Firebase not initialized');
      
      try {
        await updateDoc(doc(db, 'users', uid), {
          username: newUsername
        });
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  };
}

export const authStore = createAuthStore();
export const isAuthenticated = derived(authStore, $auth => !!$auth);