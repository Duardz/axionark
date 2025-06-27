// src/lib/utils/encryption-migration.ts
// This script helps migrate existing unencrypted data to encrypted format

import { db } from '$lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  writeBatch,
  type QuerySnapshot,
  type DocumentData
} from 'firebase/firestore';
import {
  encryptFields,
  isEncryptionAvailable
} from './encryption';

// Fields to encrypt for different collections
const ENCRYPTION_CONFIG = {
  journal: {
    fields: ['title', 'content', 'tags'],
    batchSize: 50
  },
  bugs: {
    fields: ['description', 'program'],
    batchSize: 100
  }
} as const;

export interface MigrationResult {
  success: boolean;
  totalProcessed: number;
  totalEncrypted: number;
  errors: string[];
}

/**
 * Migrate user's journal entries to encrypted format
 */
export async function migrateJournalEntries(uid: string): Promise<MigrationResult> {
  if (!db || !isEncryptionAvailable()) {
    return {
      success: false,
      totalProcessed: 0,
      totalEncrypted: 0,
      errors: ['Database or encryption not available']
    };
  }

  const result: MigrationResult = {
    success: true,
    totalProcessed: 0,
    totalEncrypted: 0,
    errors: []
  };

  try {
    // Query unencrypted entries
    const q = query(
      collection(db, 'journal'),
      where('uid', '==', uid),
      where('encrypted', '!=', true)
    );

    const snapshot = await getDocs(q);
    result.totalProcessed = snapshot.size;

    if (snapshot.empty) {
      console.log('No unencrypted journal entries found');
      return result;
    }

    // Process in batches
    const batches: any[][] = [];
    let currentBatch: any[] = [];

    snapshot.forEach((doc) => {
      currentBatch.push({ id: doc.id, data: doc.data() });
      
      if (currentBatch.length >= ENCRYPTION_CONFIG.journal.batchSize) {
        batches.push(currentBatch);
        currentBatch = [];
      }
    });

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    // Encrypt and update each batch
    for (const batch of batches) {
      const writeBatchOp = writeBatch(db);

      for (const item of batch) {
        try {
          // Encrypt fields
          const encryptedData = await encryptFields(
            item.data,
            ENCRYPTION_CONFIG.journal.fields as any
          );

          // Update document
          writeBatchOp.update(doc(db, 'journal', item.id), {
            ...encryptedData,
            encrypted: true
          });

          result.totalEncrypted++;
        } catch (error) {
          console.error(`Failed to encrypt journal entry ${item.id}:`, error);
          result.errors.push(`Journal ${item.id}: ${error}`);
          result.success = false;
        }
      }

      // Commit batch
      try {
        await writeBatchOp.commit();
      } catch (error) {
        console.error('Failed to commit batch:', error);
        result.errors.push(`Batch commit failed: ${error}`);
        result.success = false;
      }
    }

  } catch (error) {
    console.error('Migration error:', error);
    result.errors.push(`Migration failed: ${error}`);
    result.success = false;
  }

  return result;
}

/**
 * Migrate user's bug reports to encrypted format
 */
export async function migrateBugReports(uid: string): Promise<MigrationResult> {
  if (!db || !isEncryptionAvailable()) {
    return {
      success: false,
      totalProcessed: 0,
      totalEncrypted: 0,
      errors: ['Database or encryption not available']
    };
  }

  const result: MigrationResult = {
    success: true,
    totalProcessed: 0,
    totalEncrypted: 0,
    errors: []
  };

  try {
    // Query unencrypted bugs
    const q = query(
      collection(db, 'bugs'),
      where('uid', '==', uid),
      where('encrypted', '!=', true)
    );

    const snapshot = await getDocs(q);
    result.totalProcessed = snapshot.size;

    if (snapshot.empty) {
      console.log('No unencrypted bug reports found');
      return result;
    }

    // Process in batches
    const batches: any[][] = [];
    let currentBatch: any[] = [];

    snapshot.forEach((doc) => {
      currentBatch.push({ id: doc.id, data: doc.data() });
      
      if (currentBatch.length >= ENCRYPTION_CONFIG.bugs.batchSize) {
        batches.push(currentBatch);
        currentBatch = [];
      }
    });

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    // Encrypt and update each batch
    for (const batch of batches) {
      const writeBatchOp = writeBatch(db);

      for (const item of batch) {
        try {
          // Only encrypt if fields exist
          const fieldsToEncrypt = ENCRYPTION_CONFIG.bugs.fields.filter(
            field => item.data[field] !== undefined && item.data[field] !== null
          );

          if (fieldsToEncrypt.length > 0) {
            const encryptedData = await encryptFields(
              item.data,
              fieldsToEncrypt as any
            );

            // Update document
            writeBatchOp.update(doc(db, 'bugs', item.id), {
              ...encryptedData,
              encrypted: true
            });

            result.totalEncrypted++;
          } else {
            // Mark as encrypted even if no fields to encrypt
            writeBatchOp.update(doc(db, 'bugs', item.id), {
              encrypted: true
            });
          }
        } catch (error) {
          console.error(`Failed to encrypt bug report ${item.id}:`, error);
          result.errors.push(`Bug ${item.id}: ${error}`);
          result.success = false;
        }
      }

      // Commit batch
      try {
        await writeBatchOp.commit();
      } catch (error) {
        console.error('Failed to commit batch:', error);
        result.errors.push(`Batch commit failed: ${error}`);
        result.success = false;
      }
    }

  } catch (error) {
    console.error('Migration error:', error);
    result.errors.push(`Migration failed: ${error}`);
    result.success = false;
  }

  return result;
}

/**
 * Migrate all user data to encrypted format
 */
export async function migrateAllUserData(uid: string): Promise<{
  journal: MigrationResult;
  bugs: MigrationResult;
}> {
  console.log(`Starting encryption migration for user ${uid}`);

  const journalResult = await migrateJournalEntries(uid);
  console.log('Journal migration result:', journalResult);

  const bugsResult = await migrateBugReports(uid);
  console.log('Bugs migration result:', bugsResult);

  // Update user document to indicate encryption is enabled
  if (db && journalResult.success && bugsResult.success) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        encryptionEnabled: true,
        encryptedFields: ['journal', 'bugs'],
        encryptionMigratedAt: new Date()
      });
    } catch (error) {
      console.error('Failed to update user encryption status:', error);
    }
  }

  return {
    journal: journalResult,
    bugs: bugsResult
  };
}

/**
 * Check if user data needs migration
 */
export async function checkMigrationStatus(uid: string): Promise<{
  needsMigration: boolean;
  unencryptedJournalCount: number;
  unencryptedBugCount: number;
}> {
  if (!db) {
    return {
      needsMigration: false,
      unencryptedJournalCount: 0,
      unencryptedBugCount: 0
    };
  }

  try {
    // Check journal entries
    const journalQuery = query(
      collection(db, 'journal'),
      where('uid', '==', uid),
      where('encrypted', '!=', true)
    );
    const journalSnapshot = await getDocs(journalQuery);

    // Check bug reports
    const bugsQuery = query(
      collection(db, 'bugs'),
      where('uid', '==', uid),
      where('encrypted', '!=', true)
    );
    const bugsSnapshot = await getDocs(bugsQuery);

    const unencryptedJournalCount = journalSnapshot.size;
    const unencryptedBugCount = bugsSnapshot.size;

    return {
      needsMigration: unencryptedJournalCount > 0 || unencryptedBugCount > 0,
      unencryptedJournalCount,
      unencryptedBugCount
    };
  } catch (error) {
    console.error('Error checking migration status:', error);
    return {
      needsMigration: false,
      unencryptedJournalCount: 0,
      unencryptedBugCount: 0
    };
  }
}