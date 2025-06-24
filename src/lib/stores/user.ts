import { writable, derived } from 'svelte/store';
import { db } from '$lib/firebase';
import { doc, getDoc, updateDoc, setDoc, collection, addDoc, query, where, getDocs, deleteDoc, orderBy } from 'firebase/firestore';
import type { Task } from '$lib/data/roadmap';

export interface JournalEntry {
  id?: string;
  uid: string;
  title: string;
  content: string;
  date: Date;
  mood?: 'great' | 'good' | 'okay' | 'bad';
  tags?: string[];
}

export interface Bug {
  id?: string;
  uid: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  program: string;
  bounty: number;
  status: 'reported' | 'triaged' | 'resolved' | 'duplicate' | 'rejected';
  dateFound: Date;
  description?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  totalXP: number;
  completedTasks: string[];
  currentPhase: 'beginner' | 'intermediate' | 'advanced';
  totalBounty: number;
  bugsFound: number;
  createdAt: any; // Firebase Timestamp
}

function createUserStore() {
  const { subscribe, set, update } = writable<UserProfile | null>(null);

  return {
    subscribe,
    loadProfile: async (uid: string) => {
      if (!db) return;
      
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          set(data);
          return data;
        } else {
          // If document doesn't exist, create it with default values
          const defaultProfile: UserProfile = {
            uid,
            email: '', // Will be updated by auth
            username: 'Anonymous',
            totalXP: 0,
            completedTasks: [],
            currentPhase: 'beginner',
            totalBounty: 0,
            bugsFound: 0,
            createdAt: new Date()
          };
          
          await setDoc(docRef, defaultProfile);
          set(defaultProfile);
          return defaultProfile;
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    },
    completeTask: async (uid: string, taskId: string, xp: number) => {
      if (!db) return;
      
      try {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          
          if (!userData.completedTasks.includes(taskId)) {
            const updatedTasks = [...userData.completedTasks, taskId];
            const updatedXP = userData.totalXP + xp;
            
            await updateDoc(userRef, {
              completedTasks: updatedTasks,
              totalXP: updatedXP
            });
            
            update(profile => {
              if (profile) {
                profile.completedTasks = updatedTasks;
                profile.totalXP = updatedXP;
              }
              return profile;
            });
          }
        }
      } catch (error) {
        console.error('Error completing task:', error);
        throw error;
      }
    },
    uncompleteTask: async (uid: string, taskId: string, xp: number) => {
      if (!db) return;
      
      try {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          
          if (userData.completedTasks.includes(taskId)) {
            const updatedTasks = userData.completedTasks.filter(id => id !== taskId);
            const updatedXP = Math.max(0, userData.totalXP - xp);
            
            await updateDoc(userRef, {
              completedTasks: updatedTasks,
              totalXP: updatedXP
            });
            
            update(profile => {
              if (profile) {
                profile.completedTasks = updatedTasks;
                profile.totalXP = updatedXP;
              }
              return profile;
            });
          }
        }
      } catch (error) {
        console.error('Error uncompleting task:', error);
        throw error;
      }
    },
    updatePhase: async (uid: string, phase: 'beginner' | 'intermediate' | 'advanced') => {
      if (!db) return;
      
      try {
        await updateDoc(doc(db, 'users', uid), {
          currentPhase: phase
        });
        
        update(profile => {
          if (profile) {
            profile.currentPhase = phase;
          }
          return profile;
        });
      } catch (error) {
        console.error('Error updating phase:', error);
        throw error;
      }
    },
    updateUsername: async (uid: string, username: string) => {
      if (!db) return;
      
      try {
        await updateDoc(doc(db, 'users', uid), {
          username: username
        });
        
        update(profile => {
          if (profile) {
            profile.username = username;
          }
          return profile;
        });
      } catch (error) {
        console.error('Error updating username:', error);
        throw error;
      }
    }
  };
}

function createJournalStore() {
  const { subscribe, set, update } = writable<JournalEntry[]>([]);

  return {
    subscribe,
    loadEntries: async (uid: string) => {
      if (!db) return;
      
      try {
        const q = query(
          collection(db, 'journal'), 
          where('uid', '==', uid),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const entries: JournalEntry[] = [];
        querySnapshot.forEach((doc) => {
          entries.push({ id: doc.id, ...doc.data() } as JournalEntry);
        });
        
        set(entries);
        return entries;
      } catch (error) {
        console.error('Error loading journal entries:', error);
        return [];
      }
    },
    addEntry: async (entry: JournalEntry) => {
      if (!db) return;
      
      try {
        const docRef = await addDoc(collection(db, 'journal'), {
          ...entry,
          date: entry.date
        });
        
        update(entries => [...entries, { ...entry, id: docRef.id }]);
        return docRef.id;
      } catch (error) {
        console.error('Error adding journal entry:', error);
        throw error;
      }
    },
    deleteEntry: async (entryId: string) => {
      if (!db) return;
      
      try {
        await deleteDoc(doc(db, 'journal', entryId));
        update(entries => entries.filter(e => e.id !== entryId));
      } catch (error) {
        console.error('Error deleting journal entry:', error);
        throw error;
      }
    }
  };
}

function createBugStore() {
  const { subscribe, set, update } = writable<Bug[]>([]);

  return {
    subscribe,
    loadBugs: async (uid: string) => {
      if (!db) return;
      
      try {
        const q = query(
          collection(db, 'bugs'), 
          where('uid', '==', uid),
          orderBy('dateFound', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const bugs: Bug[] = [];
        querySnapshot.forEach((doc) => {
          bugs.push({ id: doc.id, ...doc.data() } as Bug);
        });
        
        set(bugs);
        
        // Update user's total bounty and bugs found
        const totalBounty = bugs.reduce((sum, bug) => sum + bug.bounty, 0);
        const bugsFound = bugs.length;
        
        // Check if user document exists before updating
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          await updateDoc(userRef, {
            totalBounty,
            bugsFound
          });
        } else {
          // Create user document if it doesn't exist
          await setDoc(userRef, {
            uid,
            totalBounty,
            bugsFound,
            totalXP: 0,
            completedTasks: [],
            currentPhase: 'beginner',
            createdAt: new Date()
          }, { merge: true });
        }
        
        return bugs;
      } catch (error) {
        console.error('Error loading bugs:', error);
        return [];
      }
    },
    addBug: async (bug: Bug) => {
      if (!db) return;
      
      try {
        const docRef = await addDoc(collection(db, 'bugs'), {
          ...bug,
          dateFound: bug.dateFound
        });
        
        update(bugs => [...bugs, { ...bug, id: docRef.id }]);
        
        // Update user stats
        const userRef = doc(db, 'users', bug.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          await updateDoc(userRef, {
            totalBounty: (userData.totalBounty || 0) + bug.bounty,
            bugsFound: (userData.bugsFound || 0) + 1
          });
        } else {
          // Create user document if it doesn't exist
          await setDoc(userRef, {
            uid: bug.uid,
            totalBounty: bug.bounty,
            bugsFound: 1,
            totalXP: 0,
            completedTasks: [],
            currentPhase: 'beginner',
            createdAt: new Date()
          }, { merge: true });
        }
        
        return docRef.id;
      } catch (error) {
        console.error('Error adding bug:', error);
        throw error;
      }
    },
    updateBug: async (bugId: string, updates: Partial<Bug>) => {
      if (!db) return;
      
      try {
        await updateDoc(doc(db, 'bugs', bugId), updates);
        
        update(bugs => {
          return bugs.map(bug => 
            bug.id === bugId ? { ...bug, ...updates } : bug
          );
        });
      } catch (error) {
        console.error('Error updating bug:', error);
        throw error;
      }
    },
    deleteBug: async (bugId: string, uid: string, bounty: number) => {
      if (!db) return;
      
      try {
        await deleteDoc(doc(db, 'bugs', bugId));
        
        update(bugs => bugs.filter(b => b.id !== bugId));
        
        // Update user stats
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          await updateDoc(userRef, {
            totalBounty: Math.max(0, (userData.totalBounty || 0) - bounty),
            bugsFound: Math.max(0, (userData.bugsFound || 0) - 1)
          });
        }
      } catch (error) {
        console.error('Error deleting bug:', error);
        throw error;
      }
    }
  };
}

export const userStore = createUserStore();
export const journalStore = createJournalStore();
export const bugStore = createBugStore();

// Derived stores
export const userProgress = derived(userStore, $user => {
  if (!$user) return { percentage: 0, level: 1, currentLevelXP: 0, xpPerLevel: 1000 };
  
  const xpPerLevel = 1000;
  const level = Math.floor($user.totalXP / xpPerLevel) + 1;
  const currentLevelXP = $user.totalXP % xpPerLevel;
  const percentage = (currentLevelXP / xpPerLevel) * 100;
  
  return { percentage, level, currentLevelXP, xpPerLevel };
});