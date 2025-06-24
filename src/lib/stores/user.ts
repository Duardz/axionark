// src/lib/stores/user.ts - Real-time version with working undo
import { writable, derived, get } from 'svelte/store';
import { db } from '$lib/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  type FieldValue,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import type { Task } from '$lib/data/roadmap';
import {
  sanitizeText,
  sanitizeHtml,
  validateBountyAmount,
  validateXP,
  validateSeverity,
  validateStatus,
  validateMood,
  checkRateLimit,
  firebaseTimestampToDate
} from '$lib/utils/security';

export interface JournalEntry {
  id?: string;
  uid: string;
  title: string;
  content: string;
  date: Date | Timestamp;
  mood?: 'great' | 'good' | 'okay' | 'bad';
  tags?: string[];
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

export interface Bug {
  id?: string;
  uid: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  program: string;
  bounty: number;
  status: 'reported' | 'triaged' | 'resolved' | 'duplicate' | 'rejected';
  dateFound: Date | Timestamp;
  description?: string;
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  totalXP: number;
  completedTasks: string[];
  currentPhase: 'beginner' | 'intermediate' | 'advanced';
  totalBounty?: number;
  bugsFound?: number;
  createdAt: any;
  updatedAt?: Timestamp | FieldValue;
}

// Error handling wrapper
async function handleFirestoreOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }
}

// User Store with real-time updates
function createUserStore() {
  const { subscribe, set, update } = writable<UserProfile | null>(null);
  let unsubscribe: Unsubscribe | null = null;

  return {
    subscribe,
    
    // Load profile with real-time listener
    loadProfile: async (uid: string) => {
      if (!db || !uid) return;
      
      // Clean up previous listener
      if (unsubscribe) {
        unsubscribe();
      }
      
      return handleFirestoreOperation(async () => {
        const docRef = doc(db!, 'users', uid);
        
        // Set up real-time listener
        unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            set(data);
          } else {
            // Create default profile if doesn't exist
            const defaultProfile = {
              uid,
              email: '',
              username: 'Anonymous',
              totalXP: 0,
              completedTasks: [],
              currentPhase: 'beginner' as const,
              totalBounty: 0,
              bugsFound: 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            
            setDoc(docRef, defaultProfile).then(() => {
              set(defaultProfile as UserProfile);
            });
          }
        }, (error) => {
          console.error('Error listening to user profile:', error);
        });
        
        // Initial load
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          set(data);
          return data;
        }
      }, 'Error loading user profile');
    },
    
    // Cleanup listener
    cleanup: () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    },
    
    completeTask: async (uid: string, taskId: string, xp: number) => {
      if (!db || !uid || !taskId) return;
      
      // Validate XP
      if (!validateXP(xp)) {
        throw new Error('Invalid XP value');
      }
      
      // Rate limiting
      if (!checkRateLimit(`complete_task_${uid}`, 30, 60000)) {
        throw new Error('Too many task completions. Please slow down.');
      }
      
      return handleFirestoreOperation(async () => {
        const userRef = doc(db!, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          
          // Prevent duplicate completion
          if (!userData.completedTasks.includes(taskId)) {
            const updatedTasks = [...userData.completedTasks, taskId];
            const updatedXP = userData.totalXP + xp;
            
            await updateDoc(userRef, {
              completedTasks: updatedTasks,
              totalXP: updatedXP,
              updatedAt: serverTimestamp()
            });
            
            // Note: Real-time listener will automatically update the store
          }
        }
      }, 'Error completing task');
    },
    
    uncompleteTask: async (uid: string, taskId: string, xp: number) => {
      if (!db || !uid || !taskId) {
        console.error('Missing required parameters:', { db: !!db, uid, taskId });
        throw new Error('Missing required parameters');
      }
      
      // Validate XP
      if (!validateXP(xp)) {
        console.error('Invalid XP value:', xp);
        throw new Error('Invalid XP value');
      }
      
      // Rate limiting
      if (!checkRateLimit(`uncomplete_task_${uid}`, 10, 60000)) {
        throw new Error('Too many operations. Please slow down.');
      }
      
      try {
        const userRef = doc(db!, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          console.error('User document not found:', uid);
          throw new Error('User profile not found');
        }
        
        const userData = userDoc.data() as UserProfile;
        console.log('Current user data:', userData);
        
        if (!userData.completedTasks || !Array.isArray(userData.completedTasks)) {
          console.error('Invalid completedTasks:', userData.completedTasks);
          throw new Error('Invalid user data structure');
        }
        
        if (userData.completedTasks.includes(taskId)) {
          const updatedTasks = userData.completedTasks.filter(id => id !== taskId);
          const updatedXP = Math.max(0, (userData.totalXP || 0) - xp);
          
          console.log('Updating user with:', { 
            completedTasks: updatedTasks, 
            totalXP: updatedXP,
            previousTasks: userData.completedTasks,
            previousXP: userData.totalXP
          });
          
          await updateDoc(userRef, {
            completedTasks: updatedTasks,
            totalXP: updatedXP,
            updatedAt: serverTimestamp()
          });
          
          console.log('Task uncompleted successfully');
        } else {
          console.warn('Task not in completed list:', taskId);
        }
      } catch (error) {
        console.error('Error in uncompleteTask:', error);
        throw error;
      }
    },
    
    updatePhase: async (uid: string, phase: 'beginner' | 'intermediate' | 'advanced') => {
      if (!db || !uid) return;
      
      // Validate phase
      const validPhases = ['beginner', 'intermediate', 'advanced'];
      if (!validPhases.includes(phase)) {
        throw new Error('Invalid phase');
      }
      
      return handleFirestoreOperation(async () => {
        await updateDoc(doc(db!, 'users', uid), {
          currentPhase: phase,
          updatedAt: serverTimestamp()
        });
      }, 'Error updating phase');
    },
    
    updateUsername: async (uid: string, username: string) => {
      if (!db || !uid) return;
      
      return handleFirestoreOperation(async () => {
        await updateDoc(doc(db!, 'users', uid), {
          username: username,
          updatedAt: serverTimestamp()
        });
      }, 'Error updating username');
    }
  };
}

// Journal Store with real-time updates
function createJournalStore() {
  const { subscribe, set, update } = writable<JournalEntry[]>([]);
  let unsubscribe: Unsubscribe | null = null;

  return {
    subscribe,
    
    loadEntries: async (uid: string) => {
      if (!db || !uid) return [];
      
      // Clean up previous listener
      if (unsubscribe) {
        unsubscribe();
      }
      
      return handleFirestoreOperation(async () => {
        const q = query(
          collection(db!, 'journal'), 
          where('uid', '==', uid),
          orderBy('date', 'desc'),
          limit(100)
        );
        
        // Set up real-time listener
        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const entries: JournalEntry[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            entries.push({ 
              id: doc.id, 
              ...data,
              date: firebaseTimestampToDate(data.date)
            } as JournalEntry);
          });
          set(entries);
        }, (error) => {
          console.error('Error listening to journal entries:', error);
        });
        
        // Initial load
        const querySnapshot = await getDocs(q);
        const entries: JournalEntry[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          entries.push({ 
            id: doc.id, 
            ...data,
            date: firebaseTimestampToDate(data.date)
          } as JournalEntry);
        });
        
        set(entries);
        return entries;
      }, 'Error loading journal entries');
    },
    
    cleanup: () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    },
    
    addEntry: async (entry: JournalEntry) => {
      if (!db) return;
      
      // Rate limiting
      if (!checkRateLimit(`add_journal_${entry.uid}`, 10, 3600000)) {
        throw new Error('Too many journal entries. Please try again later.');
      }
      
      // Sanitize input
      const sanitizedEntry = {
        uid: entry.uid,
        title: sanitizeText(entry.title).slice(0, 200),
        content: sanitizeHtml(entry.content).slice(0, 5000),
        date: entry.date instanceof Date ? Timestamp.fromDate(entry.date) : entry.date,
        ...(entry.mood && validateMood(entry.mood) ? { mood: entry.mood } : {}),
        ...(entry.tags ? { tags: entry.tags.map(tag => sanitizeText(tag).slice(0, 50)).slice(0, 10) } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      return handleFirestoreOperation(async () => {
        const docRef = await addDoc(collection(db!, 'journal'), sanitizedEntry);
        // Real-time listener will automatically update the store
        return docRef.id;
      }, 'Error adding journal entry');
    },
    
    deleteEntry: async (entryId: string) => {
      if (!db || !entryId) return;
      
      // Rate limiting
      if (!checkRateLimit(`delete_journal_${entryId}`, 5, 3600000)) {
        throw new Error('Too many deletions. Please try again later.');
      }
      
      return handleFirestoreOperation(async () => {
        await deleteDoc(doc(db!, 'journal', entryId));
        // Real-time listener will automatically update the store
      }, 'Error deleting journal entry');
    }
  };
}

// Bug Store with real-time updates
function createBugStore() {
  const { subscribe, set, update } = writable<Bug[]>([]);
  let unsubscribe: Unsubscribe | null = null;
  let userStatsUnsubscribe: Unsubscribe | null = null;

  return {
    subscribe,
    
    loadBugs: async (uid: string) => {
      if (!db || !uid) return [];
      
      // Clean up previous listeners
      if (unsubscribe) {
        unsubscribe();
      }
      if (userStatsUnsubscribe) {
        userStatsUnsubscribe();
      }
      
      return handleFirestoreOperation(async () => {
        const q = query(
          collection(db!, 'bugs'), 
          where('uid', '==', uid),
          orderBy('dateFound', 'desc'),
          limit(200)
        );
        
        // Set up real-time listener for bugs
        unsubscribe = onSnapshot(q, async (querySnapshot) => {
          const bugs: Bug[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            bugs.push({ 
              id: doc.id, 
              ...data,
              dateFound: firebaseTimestampToDate(data.dateFound)
            } as Bug);
          });
          set(bugs);
          
          // Update user stats
          const totalBounty = bugs.reduce((sum, bug) => sum + bug.bounty, 0);
          const bugsFound = bugs.length;
          
          const userRef = doc(db!, 'users', uid);
          await updateDoc(userRef, {
            totalBounty,
            bugsFound,
            updatedAt: serverTimestamp()
          });
        }, (error) => {
          console.error('Error listening to bugs:', error);
        });
        
        // Initial load
        const querySnapshot = await getDocs(q);
        const bugs: Bug[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          bugs.push({ 
            id: doc.id, 
            ...data,
            dateFound: firebaseTimestampToDate(data.dateFound)
          } as Bug);
        });
        
        set(bugs);
        return bugs;
      }, 'Error loading bugs');
    },
    
    cleanup: () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      if (userStatsUnsubscribe) {
        userStatsUnsubscribe();
        userStatsUnsubscribe = null;
      }
    },
    
    addBug: async (bug: Bug) => {
      if (!db) return;
      
      // Rate limiting
      if (!checkRateLimit(`add_bug_${bug.uid}`, 20, 3600000)) {
        throw new Error('Too many bug reports. Please try again later.');
      }
      
      // Validate input
      if (!validateSeverity(bug.severity)) {
        throw new Error('Invalid severity level');
      }
      
      if (!validateStatus(bug.status)) {
        throw new Error('Invalid bug status');
      }
      
      if (!validateBountyAmount(bug.bounty)) {
        throw new Error('Invalid bounty amount');
      }
      
      // Sanitize input
      const sanitizedBug = {
        uid: bug.uid,
        type: sanitizeText(bug.type).slice(0, 100),
        severity: bug.severity,
        program: sanitizeText(bug.program).slice(0, 100),
        bounty: bug.bounty,
        status: bug.status,
        dateFound: bug.dateFound instanceof Date ? Timestamp.fromDate(bug.dateFound) : bug.dateFound,
        ...(bug.description ? { description: sanitizeHtml(bug.description).slice(0, 2000) } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      return handleFirestoreOperation(async () => {
        const docRef = await addDoc(collection(db!, 'bugs'), sanitizedBug);
        // Real-time listener will automatically update the store and user stats
        return docRef.id;
      }, 'Error adding bug report');
    },
    
    updateBug: async (bugId: string, updates: Partial<Bug>) => {
      if (!db || !bugId) return;
      
      // Rate limiting
      if (!checkRateLimit(`update_bug_${bugId}`, 10, 3600000)) {
        throw new Error('Too many updates. Please try again later.');
      }
      
      // Validate and sanitize updates
      const sanitizedUpdates: any = { updatedAt: serverTimestamp() };
      
      if (updates.type !== undefined) {
        sanitizedUpdates.type = sanitizeText(updates.type).slice(0, 100);
      }
      
      if (updates.program !== undefined) {
        sanitizedUpdates.program = sanitizeText(updates.program).slice(0, 100);
      }
      
      if (updates.description !== undefined) {
        sanitizedUpdates.description = sanitizeHtml(updates.description).slice(0, 2000);
      }
      
      if (updates.severity !== undefined) {
        if (!validateSeverity(updates.severity)) {
          throw new Error('Invalid severity level');
        }
        sanitizedUpdates.severity = updates.severity;
      }
      
      if (updates.status !== undefined) {
        if (!validateStatus(updates.status)) {
          throw new Error('Invalid bug status');
        }
        sanitizedUpdates.status = updates.status;
      }
      
      if (updates.bounty !== undefined) {
        if (!validateBountyAmount(updates.bounty)) {
          throw new Error('Invalid bounty amount');
        }
        sanitizedUpdates.bounty = updates.bounty;
      }
      
      if (updates.dateFound !== undefined) {
        sanitizedUpdates.dateFound = updates.dateFound instanceof Date ? 
          Timestamp.fromDate(updates.dateFound) : updates.dateFound;
      }
      
      return handleFirestoreOperation(async () => {
        await updateDoc(doc(db!, 'bugs', bugId), sanitizedUpdates);
        // Real-time listener will automatically update the store
      }, 'Error updating bug report');
    },
    
    deleteBug: async (bugId: string, uid: string, bounty: number) => {
      if (!db || !bugId || !uid) return;
      
      // Rate limiting
      if (!checkRateLimit(`delete_bug_${bugId}`, 5, 3600000)) {
        throw new Error('Too many deletions. Please try again later.');
      }
      
      return handleFirestoreOperation(async () => {
        await deleteDoc(doc(db!, 'bugs', bugId));
        // Real-time listener will automatically update the store and user stats
      }, 'Error deleting bug report');
    }
  };
}

export const userStore = createUserStore();
export const journalStore = createJournalStore();
export const bugStore = createBugStore();

// Derived stores with additional validation
export const userProgress = derived(userStore, $user => {
  if (!$user) return { percentage: 0, level: 1, currentLevelXP: 0, xpPerLevel: 1000 };
  
  const xpPerLevel = 1000;
  const level = Math.min(100, Math.floor($user.totalXP / xpPerLevel) + 1); // Cap at level 100
  const currentLevelXP = $user.totalXP % xpPerLevel;
  const percentage = Math.min(100, (currentLevelXP / xpPerLevel) * 100);
  
  return { percentage, level, currentLevelXP, xpPerLevel };
});