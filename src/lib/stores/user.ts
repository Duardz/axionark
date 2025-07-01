// src/lib/stores/user.ts - Fixed version with better encryption handling
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
import {
  encryptData,
  decryptData,
  encryptFields,
  decryptFields,
  isEncryptionAvailable,
  batchDecrypt,
  getEncryptionKeySync,
  initializeEncryption,
  checkAndRestoreEncryption
} from '$lib/utils/encryption';

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
  encrypted?: boolean;
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
  encrypted?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  avatar?: string; // Avatar ID
  totalXP: number;
  completedTasks: string[];
  currentPhase: 'beginner' | 'intermediate' | 'advanced';
  totalBounty?: number;
  bugsFound?: number;
  createdAt: any;
  updatedAt?: Timestamp | FieldValue;
  encryptionEnabled?: boolean;
  encryptedFields?: string[];
}

// Fields to encrypt for journal entries
const JOURNAL_ENCRYPTED_FIELDS: (keyof JournalEntry)[] = ['title', 'content', 'tags'];

// Fields to encrypt for bug reports
const BUG_ENCRYPTED_FIELDS: (keyof Bug)[] = ['description', 'program'];

// Error handling wrapper
async function handleFirestoreOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new Error(errorMessage);
  }
}

// Helper to decrypt a single journal entry with error handling
async function decryptJournalEntry(data: any, docId: string): Promise<JournalEntry> {
  let entry: JournalEntry = { 
    id: docId, 
    ...data,
    date: firebaseTimestampToDate(data.date)
  } as JournalEntry;
  
  // Only decrypt if marked as encrypted AND we have an encryption key
  if (data.encrypted) {
    const hasKey = getEncryptionKeySync();
    if (!hasKey) {
      // Return encrypted data if no key available
      console.warn('No encryption key available for decrypting journal entry');
      return entry;
    }
    
    try {
      // Decrypt each field individually to handle partial failures
      const decrypted: any = { ...entry };
      
      for (const field of JOURNAL_ENCRYPTED_FIELDS) {
        if (data[field] && typeof data[field] === 'string' && data[field].length > 0) {
          try {
            decrypted[field] = await decryptData(data[field]);
          } catch (fieldError) {
            console.warn(`Failed to decrypt journal field ${field}:`, fieldError);
            // Keep encrypted value if decryption fails
          }
        }
      }
      
      entry = decrypted;
    } catch (error) {
      console.error('Failed to decrypt journal entry:', error);
      // Return entry with encrypted data if full decryption fails
    }
  }
  
  return entry;
}

// Helper to decrypt a single bug with error handling
async function decryptBugEntry(data: any, docId: string): Promise<Bug> {
  let bug: Bug = { 
    id: docId, 
    ...data,
    dateFound: firebaseTimestampToDate(data.dateFound)
  } as Bug;
  
  // Only decrypt if marked as encrypted AND we have an encryption key
  if (data.encrypted) {
    const hasKey = getEncryptionKeySync();
    if (!hasKey) {
      // Return encrypted data if no key available
      console.warn('No encryption key available for decrypting bug entry');
      return bug;
    }
    
    try {
      // Decrypt each field individually to handle partial failures
      const decrypted: any = { ...bug };
      
      for (const field of BUG_ENCRYPTED_FIELDS) {
        if (data[field] && typeof data[field] === 'string' && data[field].length > 0) {
          try {
            decrypted[field] = await decryptData(data[field]);
          } catch (fieldError) {
            console.warn(`Failed to decrypt bug field ${field}:`, fieldError);
            // Keep encrypted value if decryption fails
          }
        }
      }
      
      bug = decrypted;
    } catch (error) {
      console.error('Failed to decrypt bug entry:', error);
      // Return bug with encrypted data if full decryption fails
    }
  }
  
  return bug;
}

// User Store with real-time updates and persistent state
function createUserStore() {
  const { subscribe, set, update } = writable<UserProfile | null>(null);
  let unsubscribe: Unsubscribe | null = null;
  let isDeleting = false;
  let currentUid: string | null = null;
  let isInitialized = false;
  let isLoading = false;

  return {
    subscribe,
    
    // Load profile with real-time listener
    loadProfile: async (uid: string) => {
      if (!db || !uid) return;
      
      // Check and restore encryption if needed
      await checkAndRestoreEncryption(uid);
      
      // If already loaded for this user and initialized, don't reload
      if (currentUid === uid && isInitialized && get({ subscribe })) {
        return get({ subscribe });
      }
      
      // If already loading, wait for it to complete
      if (isLoading && currentUid === uid) {
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!isLoading) {
              clearInterval(checkInterval);
              resolve(get({ subscribe }));
            }
          }, 50);
        });
      }
      
      isLoading = true;
      
      // Clean up previous listener only if uid changed
      if (unsubscribe && currentUid !== uid) {
        unsubscribe();
        unsubscribe = null;
        isInitialized = false;
      }
      
      currentUid = uid;
      
      return handleFirestoreOperation(async () => {
        const docRef = doc(db!, 'users', uid);
        
        // Set up real-time listener only if not already set
        if (!unsubscribe) {
          unsubscribe = onSnapshot(docRef, async (docSnap) => {
            if (isDeleting) {
              return;
            }
            
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              
              // If the data shows anonymous/default values, check if we need to restore encryption
              if (data.username === 'Anonymous' && data.totalXP === 0 && data.encryptionEnabled) {
                const restored = await checkAndRestoreEncryption(uid);
                if (!restored) {
                  console.warn('User appears to have default values - encryption key may be missing');
                }
              }
              
              set(data);
              isInitialized = true;
              isLoading = false;
            } else {
              // Check if the auth user still exists before creating a default profile
              const { auth } = await import('$lib/firebase');
              const { getAuth } = await import('firebase/auth');
              
              const currentAuth = getAuth();
              const currentUser = currentAuth?.currentUser;
              
              if (auth && currentUser && currentUser.uid === uid && !isDeleting) {
                // Only create default profile if auth user exists and we're not deleting
                console.warn('User profile missing, this should not happen for existing users');
                // Don't create a new profile - this might overwrite existing data
                set(null);
              } else {
                set(null);
              }
              isLoading = false;
            }
          }, (error) => {
            console.error('User profile listener error:', error);
            set(null);
            isLoading = false;
          });
        }
        
        // Initial load - check if we already have data
        const currentData = get({ subscribe });
        if (currentData && currentData.uid === uid) {
          isLoading = false;
          return currentData;
        }
        
        // Otherwise, do initial fetch
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          set(data);
          isInitialized = true;
          isLoading = false;
          return data;
        }
        
        isLoading = false;
      }, 'Error loading user profile');
    },
    
    // Set deletion flag
    setDeleting: (value: boolean) => {
      isDeleting = value;
    },
    
    // Cleanup listener
    cleanup: () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      isDeleting = false;
      currentUid = null;
      isInitialized = false;
      isLoading = false;
      set(null);
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
          }
        }
      }, 'Error completing task');
    },
    
    uncompleteTask: async (uid: string, taskId: string, xp: number) => {
      if (!db || !uid || !taskId) {
        throw new Error('Missing required parameters');
      }
      
      // Validate XP
      if (!validateXP(xp)) {
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
          throw new Error('User profile not found');
        }
        
        const userData = userDoc.data() as UserProfile;
        
        if (!userData.completedTasks || !Array.isArray(userData.completedTasks)) {
          throw new Error('Invalid user data structure');
        }
        
        if (userData.completedTasks.includes(taskId)) {
          const updatedTasks = userData.completedTasks.filter(id => id !== taskId);
          const updatedXP = Math.max(0, (userData.totalXP || 0) - xp);
          
          await updateDoc(userRef, {
            completedTasks: updatedTasks,
            totalXP: updatedXP,
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
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

// Journal Store with persistent listeners and proper decryption
function createJournalStore() {
  const { subscribe, set, update } = writable<JournalEntry[]>([]);
  let unsubscribe: Unsubscribe | null = null;
  let currentUid: string | null = null;
  let isInitialized = false;
  let isLoading = false;
  let encryptionCheckInterval: NodeJS.Timeout | null = null;
  let lastDecryptAttempt = 0;

  // Function to check for encryption key and re-decrypt if needed
  async function checkAndReDecrypt() {
    if (!currentUid) return;
    
    // Rate limit decryption attempts
    const now = Date.now();
    if (now - lastDecryptAttempt < 5000) return; // Wait at least 5 seconds between attempts
    lastDecryptAttempt = now;
    
    const restored = await checkAndRestoreEncryption(currentUid);
    if (!restored) {
      return;
    }
    
    const currentEntries = get({ subscribe });
    if (currentEntries.length === 0) return;
    
    // Check if any entries might need decryption
    const needsDecryption = currentEntries.some(entry => {
      // If title or content looks encrypted (base64-like pattern)
      return entry.title && /^[A-Za-z0-9+/]+=*$/.test(entry.title) && entry.title.length > 50;
    });
    
    if (needsDecryption && currentUid) {
      // Reload entries to decrypt them
      await loadEntries(currentUid);
    }
  }

  async function loadEntries(uid: string) {
    if (!db || !uid) return [];
    
    // Check and restore encryption if needed
    await checkAndRestoreEncryption(uid);
    
    // If already loaded for this user and initialized, check if we need to re-decrypt
    if (currentUid === uid && isInitialized) {
      await checkAndReDecrypt();
      return get({ subscribe }) as JournalEntry[];
    }
    
    // If already loading, wait for it to complete
    if (isLoading && currentUid === uid) {
      return new Promise<JournalEntry[]>((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isLoading) {
            clearInterval(checkInterval);
            resolve(get({ subscribe }) as JournalEntry[]);
          }
        }, 50);
      });
    }
    
    isLoading = true;
    
    // Clean up previous listener only if uid changed
    if (unsubscribe && currentUid !== uid) {
      unsubscribe();
      unsubscribe = null;
      isInitialized = false;
    }
    
    // Clear encryption check interval
    if (encryptionCheckInterval) {
      clearInterval(encryptionCheckInterval);
      encryptionCheckInterval = null;
    }
    
    currentUid = uid;
    
    return handleFirestoreOperation(async () => {
      const q = query(
        collection(db!, 'journal'), 
        where('uid', '==', uid),
        orderBy('date', 'desc'),
        limit(100)
      );
      
      // Set up real-time listener only if not already set
      if (!unsubscribe) {
        unsubscribe = onSnapshot(q, async (querySnapshot) => {
          const entries: JournalEntry[] = [];
          
          // Process all entries with proper decryption
          for (const doc of querySnapshot.docs) {
            const entry = await decryptJournalEntry(doc.data(), doc.id);
            entries.push(entry);
          }
          
          set(entries);
          isInitialized = true;
          isLoading = false;
        }, (error) => {
          console.error('Journal snapshot error:', error);
          isLoading = false;
        });
      }
      
      // Initial load
      const querySnapshot = await getDocs(q);
      const entries: JournalEntry[] = [];
      
      for (const doc of querySnapshot.docs) {
        const entry = await decryptJournalEntry(doc.data(), doc.id);
        entries.push(entry);
      }
      
      set(entries);
      isInitialized = true;
      isLoading = false;
      
      // Set up periodic check for encryption key availability
      if (!encryptionCheckInterval) {
        encryptionCheckInterval = setInterval(() => {
          checkAndReDecrypt();
        }, 30000); // Check every 30 seconds instead of every 3 seconds
      }
      
      return entries;
    }, 'Error loading journal entries');
  }

  return {
    subscribe,
    
    loadEntries,
    
    cleanup: () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      if (encryptionCheckInterval) {
        clearInterval(encryptionCheckInterval);
        encryptionCheckInterval = null;
      }
      currentUid = null;
      isInitialized = false;
      isLoading = false;
      lastDecryptAttempt = 0;
      set([]);
    },
    
    addEntry: async (entry: JournalEntry) => {
      if (!db) return;
      
      // Rate limiting
      if (!checkRateLimit(`add_journal_${entry.uid}`, 10, 3600000)) {
        throw new Error('Too many journal entries. Please try again later.');
      }
      
      // Sanitize input
      let sanitizedEntry: any = {
        uid: entry.uid,
        title: sanitizeText(entry.title).slice(0, 200),
        content: sanitizeHtml(entry.content).slice(0, 5000),
        date: entry.date instanceof Date ? Timestamp.fromDate(entry.date) : entry.date,
        ...(entry.mood && validateMood(entry.mood) ? { mood: entry.mood } : {}),
        ...(entry.tags ? { tags: entry.tags.map(tag => sanitizeText(tag).slice(0, 50)).slice(0, 10) } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        encrypted: false
      };
      
      // Encrypt sensitive fields if encryption is available
      const hasKey = getEncryptionKeySync();
      if (hasKey) {
        try {
          // Encrypt each field individually
          const encryptedData: any = { ...sanitizedEntry };
          
          if (sanitizedEntry.title) {
            encryptedData.title = await encryptData(sanitizedEntry.title);
          }
          
          if (sanitizedEntry.content) {
            encryptedData.content = await encryptData(sanitizedEntry.content);
          }
          
          if (sanitizedEntry.tags && Array.isArray(sanitizedEntry.tags)) {
            encryptedData.tags = await encryptData(sanitizedEntry.tags);
          }
          
          encryptedData.encrypted = true;
          sanitizedEntry = encryptedData;
        } catch (error) {
          console.error('Encryption failed:', error);
          // Continue without encryption
        }
      }
      
      return handleFirestoreOperation(async () => {
        const docRef = await addDoc(collection(db!, 'journal'), sanitizedEntry);
        return docRef.id;
      }, 'Error adding journal entry');
    },
    
    updateEntry: async (entryId: string, updates: Partial<JournalEntry>) => {
      if (!db || !entryId) return;
      
      // Rate limiting
      if (!checkRateLimit(`update_journal_${entryId}`, 10, 3600000)) {
        throw new Error('Too many updates. Please try again later.');
      }
      
      // Validate and sanitize updates
      const sanitizedUpdates: any = { updatedAt: serverTimestamp() };
      
      if (updates.title !== undefined) {
        sanitizedUpdates.title = sanitizeText(updates.title).slice(0, 200);
      }
      
      if (updates.content !== undefined) {
        sanitizedUpdates.content = sanitizeHtml(updates.content).slice(0, 5000);
      }
      
      if (updates.mood !== undefined) {
        if (validateMood(updates.mood)) {
          sanitizedUpdates.mood = updates.mood;
        }
      }
      
      if (updates.tags !== undefined) {
        sanitizedUpdates.tags = updates.tags.map(tag => sanitizeText(tag).slice(0, 50)).slice(0, 10);
      }
      
      if (updates.date !== undefined) {
        sanitizedUpdates.date = updates.date instanceof Date ? 
          Timestamp.fromDate(updates.date) : updates.date;
      }
      
      // Encrypt updated fields if encryption is available
      const hasKey = getEncryptionKeySync();
      if (hasKey) {
        try {
          const encryptedUpdates: any = { ...sanitizedUpdates };
          
          if (sanitizedUpdates.title !== undefined) {
            encryptedUpdates.title = await encryptData(sanitizedUpdates.title);
          }
          
          if (sanitizedUpdates.content !== undefined) {
            encryptedUpdates.content = await encryptData(sanitizedUpdates.content);
          }
          
          if (sanitizedUpdates.tags !== undefined) {
            encryptedUpdates.tags = await encryptData(sanitizedUpdates.tags);
          }
          
          encryptedUpdates.encrypted = true;
          Object.assign(sanitizedUpdates, encryptedUpdates);
        } catch (error) {
          console.error('Encryption failed:', error);
          // Continue without encryption
        }
      }
      
      return handleFirestoreOperation(async () => {
        await updateDoc(doc(db!, 'journal', entryId), sanitizedUpdates);
      }, 'Error updating journal entry');
    },
    
    deleteEntry: async (entryId: string) => {
      if (!db || !entryId) return;
      
      // Rate limiting
      if (!checkRateLimit(`delete_journal_${entryId}`, 5, 3600000)) {
        throw new Error('Too many deletions. Please try again later.');
      }
      
      return handleFirestoreOperation(async () => {
        await deleteDoc(doc(db!, 'journal', entryId));
      }, 'Error deleting journal entry');
    }
  };
}

// Bug Store with persistent listeners and proper decryption
function createBugStore() {
  const { subscribe, set, update } = writable<Bug[]>([]);
  let unsubscribe: Unsubscribe | null = null;
  let userStatsUnsubscribe: Unsubscribe | null = null;
  let currentUid: string | null = null;
  let isInitialized = false;
  let isLoading = false;
  let encryptionCheckInterval: NodeJS.Timeout | null = null;
  let lastDecryptAttempt = 0;

  // Function to check for encryption key and re-decrypt if needed
  async function checkAndReDecrypt() {
    if (!currentUid) return;
    
    // Rate limit decryption attempts
    const now = Date.now();
    if (now - lastDecryptAttempt < 5000) return; // Wait at least 5 seconds between attempts
    lastDecryptAttempt = now;
    
    const restored = await checkAndRestoreEncryption(currentUid);
    if (!restored) {
      return;
    }
    
    const currentBugs = get({ subscribe });
    if (currentBugs.length === 0) return;
    
    // Check if any bugs might need decryption
    const needsDecryption = currentBugs.some(bug => {
      // If program or description looks encrypted (base64-like pattern)
      return (bug.program && /^[A-Za-z0-9+/]+=*$/.test(bug.program) && bug.program.length > 50) ||
             (bug.description && /^[A-Za-z0-9+/]+=*$/.test(bug.description) && bug.description.length > 50);
    });
    
    if (needsDecryption && currentUid) {
      // Reload bugs to decrypt them
      await loadBugs(currentUid);
    }
  }

  async function loadBugs(uid: string) {
    if (!db || !uid) return [];
    
    // Check and restore encryption if needed
    await checkAndRestoreEncryption(uid);
    
    // If already loaded for this user and initialized, check if we need to re-decrypt
    if (currentUid === uid && isInitialized) {
      await checkAndReDecrypt();
      return get({ subscribe }) as Bug[];
    }
    
    // If already loading, wait for it to complete
    if (isLoading && currentUid === uid) {
      return new Promise<Bug[]>((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isLoading) {
            clearInterval(checkInterval);
            resolve(get({ subscribe }) as Bug[]);
          }
        }, 50);
      });
    }
    
    isLoading = true;
    
    // Clean up previous listeners only if uid changed
    if (currentUid !== uid) {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      if (userStatsUnsubscribe) {
        userStatsUnsubscribe();
        userStatsUnsubscribe = null;
      }
      isInitialized = false;
    }
    
    // Clear encryption check interval
    if (encryptionCheckInterval) {
      clearInterval(encryptionCheckInterval);
      encryptionCheckInterval = null;
    }
    
    currentUid = uid;
    
    return handleFirestoreOperation(async () => {
      const q = query(
        collection(db!, 'bugs'), 
        where('uid', '==', uid),
        orderBy('dateFound', 'desc'),
        limit(200)
      );
      
      // Set up real-time listener only if not already set
      if (!unsubscribe) {
        unsubscribe = onSnapshot(q, async (querySnapshot) => {
          const bugs: Bug[] = [];
          
          // Process all bugs with proper decryption
          for (const doc of querySnapshot.docs) {
            const bug = await decryptBugEntry(doc.data(), doc.id);
            bugs.push(bug);
          }
          
          set(bugs);
          isInitialized = true;
          isLoading = false;
          
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
          console.error('Bug snapshot error:', error);
          isLoading = false;
        });
      }
      
      // Initial load
      const querySnapshot = await getDocs(q);
      const bugs: Bug[] = [];
      
      for (const doc of querySnapshot.docs) {
        const bug = await decryptBugEntry(doc.data(), doc.id);
        bugs.push(bug);
      }
      
      set(bugs);
      isInitialized = true;
      isLoading = false;
      
      // Set up periodic check for encryption key availability
      if (!encryptionCheckInterval) {
        encryptionCheckInterval = setInterval(() => {
          checkAndReDecrypt();
        }, 30000); // Check every 30 seconds instead of every 3 seconds
      }
      
      return bugs;
    }, 'Error loading bugs');
  }

  return {
    subscribe,
    
    loadBugs,
    
    cleanup: () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      if (userStatsUnsubscribe) {
        userStatsUnsubscribe();
        userStatsUnsubscribe = null;
      }
      if (encryptionCheckInterval) {
        clearInterval(encryptionCheckInterval);
        encryptionCheckInterval = null;
      }
      currentUid = null;
      isInitialized = false;
      isLoading = false;
      lastDecryptAttempt = 0;
      set([]);
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
      let sanitizedBug: any = {
        uid: bug.uid,
        type: sanitizeText(bug.type).slice(0, 100),
        severity: bug.severity,
        program: sanitizeText(bug.program).slice(0, 100),
        bounty: bug.bounty,
        status: bug.status,
        dateFound: bug.dateFound instanceof Date ? Timestamp.fromDate(bug.dateFound) : bug.dateFound,
        ...(bug.description ? { description: sanitizeHtml(bug.description).slice(0, 2000) } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        encrypted: false
      };
      
      // Encrypt sensitive fields if encryption is available
      const hasKey = getEncryptionKeySync();
      if (hasKey) {
        try {
          // Encrypt each field individually
          const encryptedData: any = { ...sanitizedBug };
          
          if (sanitizedBug.program) {
            encryptedData.program = await encryptData(sanitizedBug.program);
          }
          
          if (sanitizedBug.description) {
            encryptedData.description = await encryptData(sanitizedBug.description);
          }
          
          encryptedData.encrypted = true;
          sanitizedBug = encryptedData;
        } catch (error) {
          console.error('Encryption failed:', error);
          // Continue without encryption
        }
      }
      
      return handleFirestoreOperation(async () => {
        const docRef = await addDoc(collection(db!, 'bugs'), sanitizedBug);
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
      
      // Encrypt updated fields if encryption is available
      const hasKey = getEncryptionKeySync();
      if (hasKey) {
        try {
          const encryptedUpdates: any = { ...sanitizedUpdates };
          
          if (sanitizedUpdates.program !== undefined) {
            encryptedUpdates.program = await encryptData(sanitizedUpdates.program);
          }
          
          if (sanitizedUpdates.description !== undefined) {
            encryptedUpdates.description = await encryptData(sanitizedUpdates.description);
          }
          
          encryptedUpdates.encrypted = true;
          Object.assign(sanitizedUpdates, encryptedUpdates);
        } catch (error) {
          console.error('Encryption failed:', error);
          // Continue without encryption
        }
      }
      
      return handleFirestoreOperation(async () => {
        await updateDoc(doc(db!, 'bugs', bugId), sanitizedUpdates);
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