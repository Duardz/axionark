// src/lib/utils/encryption.ts - Updated with persistent master key
import { browser } from '$app/environment';

// IndexedDB setup for secure key storage
const DB_NAME = 'axionark_secure';
const STORE_NAME = 'encryption_keys';

// In-memory cache for the encryption key
let encryptionKeyCache: string | null = null;
let currentUserId: string | null = null;

// Get current DB version dynamically
async function getCurrentDBVersion(): Promise<number> {
  return new Promise((resolve) => {
    const checkRequest = indexedDB.open(DB_NAME);
    
    checkRequest.onsuccess = () => {
      const db = checkRequest.result;
      const version = db.version;
      db.close();
      resolve(version || 1);
    };
    
    checkRequest.onerror = () => {
      resolve(1);
    };
    
    checkRequest.onupgradeneeded = () => {
      resolve(1);
    };
  });
}

// Initialize IndexedDB with dynamic version handling
async function initDB(): Promise<IDBDatabase> {
  const currentVersion = await getCurrentDBVersion();
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, currentVersion);
    
    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.close();
        
        const upgradeRequest = indexedDB.open(DB_NAME, currentVersion + 1);
        
        upgradeRequest.onerror = () => reject(upgradeRequest.error);
        upgradeRequest.onsuccess = () => resolve(upgradeRequest.result);
        
        upgradeRequest.onupgradeneeded = (event) => {
          const upgradedDb = (event.target as IDBOpenDBRequest).result;
          if (!upgradedDb.objectStoreNames.contains(STORE_NAME)) {
            const store = upgradedDb.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('uid', 'uid', { unique: true });
          }
        };
      } else {
        resolve(db);
      }
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('uid', 'uid', { unique: true });
      }
    };
  });
}

// Store encryption key in IndexedDB with expiration
export async function storeKeyInDB(uid: string, key: string, expirationHours: number = 720): Promise<void> {
  if (!browser) return;
  
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const expirationTime = Date.now() + (expirationHours * 60 * 60 * 1000);
    
    await new Promise((resolve, reject) => {
      const request = store.put({
        id: `key_${uid}`,
        uid,
        key,
        expirationTime,
        createdAt: Date.now()
      });
      request.onsuccess = () => resolve(undefined);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
  } catch (error) {
    console.error('Failed to store key in IndexedDB:', error);
    sessionStorage.setItem('_ek', key);
  }
}

// Retrieve encryption key from IndexedDB
async function getKeyFromDB(uid: string): Promise<string | null> {
  if (!browser) return null;
  
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const result = await new Promise<any>((resolve, reject) => {
      const request = store.get(`key_${uid}`);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    
    if (result && result.expirationTime > Date.now()) {
      return result.key;
    } else if (result) {
      await removeKeyFromDB(uid);
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get key from IndexedDB:', error);
    return sessionStorage.getItem('_ek');
  }
}

// Remove encryption key from IndexedDB
async function removeKeyFromDB(uid: string): Promise<void> {
  if (!browser) return;
  
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise((resolve, reject) => {
      const request = store.delete(`key_${uid}`);
      request.onsuccess = () => resolve(undefined);
      request.onerror = () => reject(request.error);
    });
    
    db.close();
  } catch (error) {
    console.error('Failed to remove key from IndexedDB:', error);
  }
}

// Generate a cryptographic key from user's password and uid
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Generate a unique master encryption key for each user (NOT based on password)
export async function generateMasterKey(): Promise<string> {
  if (!browser) throw new Error('Encryption only available in browser');
  
  // Generate a truly random 256-bit key
  const keyData = crypto.getRandomValues(new Uint8Array(32));
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode(...keyData));
}

// Generate or retrieve the user's master encryption key
export async function getUserMasterKey(uid: string): Promise<string> {
  if (!browser) throw new Error('Encryption only available in browser');
  
  // Check if we already have a master key stored
  const existingKey = await getKeyFromDB(uid);
  if (existingKey) {
    return existingKey;
  }
  
  // Generate a new master key if none exists
  const newMasterKey = await generateMasterKey();
  await storeKeyInDB(uid, newMasterKey, 8760); // Store for 1 year
  
  return newMasterKey;
}

// DEPRECATED: Keep for backward compatibility but use getUserMasterKey instead
export async function generateUserKey(uid: string, password: string): Promise<string> {
  // For new users or first-time setup, generate a master key
  return getUserMasterKey(uid);
}

// Store user's encryption key with caching
export async function storeEncryptionKey(key: string, uid?: string, expirationHours: number = 720): Promise<void> {
  if (!browser) return;
  
  encryptionKeyCache = key;
  if (uid) {
    currentUserId = uid;
  }
  
  sessionStorage.setItem('_ek', key);
  if (uid) {
    sessionStorage.setItem('_ek_uid', uid);
  }
  
  if (uid) {
    await storeKeyInDB(uid, key, expirationHours);
  }
}

// Retrieve user's encryption key (async version that checks IndexedDB)
export async function getEncryptionKeyAsync(uid?: string): Promise<string | null> {
  if (!browser) return null;
  
  if (encryptionKeyCache) {
    return encryptionKeyCache;
  }
  
  const sessionKey = sessionStorage.getItem('_ek');
  if (sessionKey) {
    encryptionKeyCache = sessionKey;
    return sessionKey;
  }
  
  if (uid) {
    const dbKey = await getKeyFromDB(uid);
    if (dbKey) {
      encryptionKeyCache = dbKey;
      sessionStorage.setItem('_ek', dbKey);
      sessionStorage.setItem('_ek_uid', uid);
      return dbKey;
    }
  }
  
  return null;
}

export const getEncryptionKey = getEncryptionKeyAsync;

// Clear encryption key from all storages
export async function clearEncryptionKey(uid?: string): Promise<void> {
  if (!browser) return;
  
  encryptionKeyCache = null;
  currentUserId = null;
  
  sessionStorage.removeItem('_ek');
  sessionStorage.removeItem('_ek_uid');
  
  // Note: We don't remove from IndexedDB on logout to preserve the master key
  // Only remove if explicitly deleting the account
}

// Import key from stored base64 string
async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data using AES-GCM
export async function encryptData(data: any, keyString?: string): Promise<string> {
  if (!browser) throw new Error('Encryption only available in browser');
  
  const storedKey = keyString || await getEncryptionKey(currentUserId || undefined);
  if (!storedKey) throw new Error('No encryption key available');
  
  try {
    const key = await importKey(storedKey);
    const encoder = new TextEncoder();
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const encodedData = encoder.encode(dataString);
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );
    
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

// Decrypt data using AES-GCM
export async function decryptData(encryptedString: string, keyString?: string): Promise<any> {
  if (!browser) throw new Error('Decryption only available in browser');
  
  const storedKey = keyString || await getEncryptionKey(currentUserId || undefined);
  if (!storedKey) throw new Error('No encryption key available');
  
  try {
    const key = await importKey(storedKey);
    const decoder = new TextDecoder();
    
    const combined = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));
    
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);
    
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );
    
    const decryptedString = decoder.decode(decryptedData);
    
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

// Encrypt specific fields in an object
export async function encryptFields<T extends Record<string, any>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[],
  keyString?: string
): Promise<T> {
  const encrypted = { ...obj };
  
  for (const field of fieldsToEncrypt) {
    if (obj[field] !== undefined && obj[field] !== null) {
      encrypted[field] = await encryptData(obj[field], keyString) as any;
    }
  }
  
  return encrypted;
}

// Decrypt specific fields in an object
export async function decryptFields<T extends Record<string, any>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[],
  keyString?: string
): Promise<T> {
  const decrypted = { ...obj };
  
  for (const field of fieldsToDecrypt) {
    if (obj[field] && typeof obj[field] === 'string') {
      try {
        decrypted[field] = await decryptData(obj[field], keyString);
      } catch (error) {
        console.error(`Failed to decrypt field ${String(field)}:`, error);
      }
    }
  }
  
  return decrypted;
}

// Generate a secure random password for initial encryption
export function generateSecurePassword(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// Check if encryption key is available (async version)
export async function isEncryptionAvailableAsync(uid?: string): Promise<boolean> {
  const key = await getEncryptionKeyAsync(uid);
  return !!key;
}

// Synchronous version for compatibility
export function isEncryptionAvailable(): boolean {
  if (!browser) return false;
  return !!encryptionKeyCache || !!sessionStorage.getItem('_ek');
}

// Get current encryption key synchronously
export function getEncryptionKeySync(): string | null {
  if (!browser) return null;
  return encryptionKeyCache || sessionStorage.getItem('_ek');
}

// Batch encrypt multiple items
export async function batchEncrypt<T extends Record<string, any>>(
  items: T[],
  fieldsToEncrypt: (keyof T)[],
  keyString?: string
): Promise<T[]> {
  return Promise.all(
    items.map(item => encryptFields(item, fieldsToEncrypt, keyString))
  );
}

// Batch decrypt multiple items
export async function batchDecrypt<T extends Record<string, any>>(
  items: T[],
  fieldsToDecrypt: (keyof T)[],
  keyString?: string
): Promise<T[]> {
  return Promise.all(
    items.map(item => decryptFields(item, fieldsToDecrypt, keyString))
  );
}

// Re-authenticate user to restore encryption key
export async function restoreEncryptionKey(uid: string, password: string): Promise<boolean> {
  try {
    // For existing users, just restore their master key
    const masterKey = await getUserMasterKey(uid);
    await storeEncryptionKey(masterKey, uid, 720);
    currentUserId = uid;
    return true;
  } catch (error) {
    console.error('Failed to restore encryption key:', error);
    return false;
  }
}

// Initialize encryption for a user
export async function initializeEncryption(uid: string): Promise<boolean> {
  if (!browser) return false;
  
  currentUserId = uid;
  
  if (encryptionKeyCache) {
    return true;
  }
  
  const sessionKey = sessionStorage.getItem('_ek');
  const sessionUid = sessionStorage.getItem('_ek_uid');
  
  if (sessionKey && (!sessionUid || sessionUid === uid)) {
    encryptionKeyCache = sessionKey;
    await storeKeyInDB(uid, sessionKey, 720);
    return true;
  }
  
  // Try to get the master key
  const masterKey = await getUserMasterKey(uid);
  if (masterKey) {
    encryptionKeyCache = masterKey;
    sessionStorage.setItem('_ek', masterKey);
    sessionStorage.setItem('_ek_uid', uid);
    return true;
  }
  
  return false;
}

// Restore encryption key from session storage
export async function restoreEncryptionFromSession(uid: string): Promise<boolean> {
  if (!browser) return false;
  
  currentUserId = uid;
  
  const sessionKey = sessionStorage.getItem('_ek');
  const sessionUid = sessionStorage.getItem('_ek_uid');
  
  if (sessionKey && (!sessionUid || sessionUid === uid)) {
    encryptionKeyCache = sessionKey;
    const dbKey = await getKeyFromDB(uid);
    if (!dbKey) {
      await storeKeyInDB(uid, sessionKey, 720);
    }
    return true;
  }
  
  return false;
}

// Check and restore encryption from all available sources
export async function checkAndRestoreEncryption(uid: string): Promise<boolean> {
  if (!browser) return false;
  
  if (encryptionKeyCache && currentUserId === uid) {
    return true;
  }
  
  const sessionRestored = await restoreEncryptionFromSession(uid);
  if (sessionRestored) {
    return true;
  }
  
  const initialized = await initializeEncryption(uid);
  if (initialized) {
    return true;
  }
  
  return false;
}

// Special function to permanently delete encryption key (only for account deletion)
export async function permanentlyDeleteEncryptionKey(uid: string): Promise<void> {
  if (!browser || !uid) return;
  
  // Clear all caches
  encryptionKeyCache = null;
  currentUserId = null;
  
  // Clear session storage
  sessionStorage.removeItem('_ek');
  sessionStorage.removeItem('_ek_uid');
  
  // Remove from IndexedDB
  await removeKeyFromDB(uid);
}