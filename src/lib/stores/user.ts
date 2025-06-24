// src/lib/stores/user.ts
import { writable, derived } from 'svelte/store';
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
  type FieldValue
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

function createUserStore() {
  const { subscribe, set, update } = writable<UserProfile | null>(null);

  return {
    subscribe,
    
    loadProfile: async (uid: string) => {
      if (!db || !uid) return;
      
      return handleFirestoreOperation(async () => {
        const docRef = doc(db!, 'users', uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          set(data);
          return data;
        } else {
          // Create default profile with server timestamp
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
          
          await setDoc(docRef, defaultProfile);
          set(defaultProfile as UserProfile);
          return defaultProfile as UserProfile;
        }
      }, 'Error loading user profile');
    },
    
    completeTask: async (uid: string, taskId: string, xp: number) => {
      if (!db || !uid || !taskId) return;
      
      // Validate XP
      if (!validateXP(xp)) {
        throw new Error('Invalid XP value');
      }
      
      // Rate limiting
      if (!checkRateLimit(`complete_task_${uid}`, 30, 60000)) { // 30 tasks per minute max
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
            
            update(profile => {
              if (profile) {
                profile.completedTasks = updatedTasks;
                profile.totalXP = updatedXP;
              }
              return profile;
            });
          }
        }
      }, 'Error completing task');
    },
    
    uncompleteTask: async (uid: string, taskId: string, xp: number) => {
      if (!db || !uid || !taskId) return;
      
      // Validate XP
      if (!validateXP(xp)) {
        throw new Error('Invalid XP value');
      }
      
      // Rate limiting
      if (!checkRateLimit(`uncomplete_task_${uid}`, 10, 60000)) { // 10 per minute max
        throw new Error('Too many operations. Please slow down.');
      }
      
      return handleFirestoreOperation(async () => {
        const userRef = doc(db!, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          
          if (userData.completedTasks.includes(taskId)) {
            const updatedTasks = userData.completedTasks.filter(id => id !== taskId);
            const updatedXP = Math.max(0, userData.totalXP - xp);
            
            await updateDoc(userRef, {
              completedTasks: updatedTasks,
              totalXP: updatedXP,
              updatedAt: serverTimestamp()
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
      }, 'Error removing task completion');
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
        
        update(profile => {
          if (profile) {
            profile.currentPhase = phase;
          }
          return profile;
        });
      }, 'Error updating phase');
    },
    
    updateUsername: async (uid: string, username: string) => {
      if (!db || !uid) return;
      
      // Username validation is handled in auth store
      return handleFirestoreOperation(async () => {
        await updateDoc(doc(db!, 'users', uid), {
          username: username,
          updatedAt: serverTimestamp()
        });
        
        update(profile => {
          if (profile) {
            profile.username = username;
          }
          return profile;
        });
      }, 'Error updating username');
    }
  };
}

function createJournalStore() {
  const { subscribe, set, update } = writable<JournalEntry[]>([]);

  return {
    subscribe,
    
    loadEntries: async (uid: string) => {
      if (!db || !uid) return [];
      
      return handleFirestoreOperation(async () => {
        const q = query(
          collection(db!, 'journal'), 
          where('uid', '==', uid),
          orderBy('date', 'desc'),
          limit(100) // Limit to prevent loading too many entries
        );
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
    
    addEntry: async (entry: JournalEntry) => {
      if (!db) return;
      
      // Rate limiting
      if (!checkRateLimit(`add_journal_${entry.uid}`, 10, 3600000)) { // 10 entries per hour
        throw new Error('Too many journal entries. Please try again later.');
      }
      
      // Sanitize input
      const sanitizedEntry = {
        ...entry,
        title: sanitizeText(entry.title).slice(0, 200),
        content: sanitizeHtml(entry.content).slice(0, 5000),
        tags: entry.tags?.map(tag => sanitizeText(tag).slice(0, 50)).slice(0, 10), // Max 10 tags
        mood: entry.mood && validateMood(entry.mood) ? entry.mood : undefined,
        date: entry.date instanceof Date ? Timestamp.fromDate(entry.date) : entry.date,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      return handleFirestoreOperation(async () => {
        const docRef = await addDoc(collection(db!, 'journal'), sanitizedEntry);
        
        update(entries => [...entries, { ...entry, id: docRef.id }]);
        return docRef.id;
      }, 'Error adding journal entry');
    },
    
    deleteEntry: async (entryId: string) => {
      if (!db || !entryId) return;
      
      // Rate limiting
      if (!checkRateLimit(`delete_journal_${entryId}`, 5, 3600000)) { // 5 deletions per hour
        throw new Error('Too many deletions. Please try again later.');
      }
      
      return handleFirestoreOperation(async () => {
        await deleteDoc(doc(db!, 'journal', entryId));
        update(entries => entries.filter(e => e.id !== entryId));
      }, 'Error deleting journal entry');
    }
  };
}

function createBugStore() {
  const { subscribe, set, update } = writable<Bug[]>([]);

  return {
    subscribe,
    
    loadBugs: async (uid: string) => {
      if (!db || !uid) return [];
      
      return handleFirestoreOperation(async () => {
        const q = query(
          collection(db!, 'bugs'), 
          where('uid', '==', uid),
          orderBy('dateFound', 'desc'),
          limit(200) // Limit to prevent loading too many bugs
        );
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
        
        // Update user stats
        const totalBounty = bugs.reduce((sum, bug) => sum + bug.bounty, 0);
        const bugsFound = bugs.length;
        
        const userRef = doc(db!, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          await updateDoc(userRef, {
            totalBounty,
            bugsFound,
            updatedAt: serverTimestamp()
          });
        }
        
        return bugs;
      }, 'Error loading bugs');
    },
    
    addBug: async (bug: Bug) => {
      if (!db) return;
      
      // Rate limiting
      if (!checkRateLimit(`add_bug_${bug.uid}`, 20, 3600000)) { // 20 bugs per hour
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
        ...bug,
        type: sanitizeText(bug.type).slice(0, 100),
        program: sanitizeText(bug.program).slice(0, 100),
        description: bug.description ? sanitizeHtml(bug.description).slice(0, 2000) : undefined,
        dateFound: bug.dateFound instanceof Date ? Timestamp.fromDate(bug.dateFound) : bug.dateFound,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      return handleFirestoreOperation(async () => {
        const docRef = await addDoc(collection(db!, 'bugs'), sanitizedBug);
        
        update(bugs => [...bugs, { ...bug, id: docRef.id }]);
        
        // Update user stats
        const userRef = doc(db!, 'users', bug.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          await updateDoc(userRef, {
            totalBounty: (userData.totalBounty || 0) + bug.bounty,
            bugsFound: (userData.bugsFound || 0) + 1,
            updatedAt: serverTimestamp()
          });
        }
        
        return docRef.id;
      }, 'Error adding bug report');
    },
    
    updateBug: async (bugId: string, updates: Partial<Bug>) => {
      if (!db || !bugId) return;
      
      // Rate limiting
      if (!checkRateLimit(`update_bug_${bugId}`, 10, 3600000)) { // 10 updates per hour
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
      
      return handleFirestoreOperation(async () => {
        await updateDoc(doc(db!, 'bugs', bugId), sanitizedUpdates);
        
        update(bugs => {
          return bugs.map(bug => 
            bug.id === bugId ? { ...bug, ...sanitizedUpdates } : bug
          );
        });
      }, 'Error updating bug report');
    },
    
    deleteBug: async (bugId: string, uid: string, bounty: number) => {
      if (!db || !bugId || !uid) return;
      
      // Rate limiting
      if (!checkRateLimit(`delete_bug_${bugId}`, 5, 3600000)) { // 5 deletions per hour
        throw new Error('Too many deletions. Please try again later.');
      }
      
      return handleFirestoreOperation(async () => {
        await deleteDoc(doc(db!, 'bugs', bugId));
        
        update(bugs => bugs.filter(b => b.id !== bugId));
        
        // Update user stats
        const userRef = doc(db!, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          await updateDoc(userRef, {
            totalBounty: Math.max(0, (userData.totalBounty || 0) - bounty),
            bugsFound: Math.max(0, (userData.bugsFound || 0) - 1),
            updatedAt: serverTimestamp()
          });
        }
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