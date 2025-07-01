// src/lib/utils/encryption.ts - Complete fixed version
import { browser } from '$app/environment';

// IndexedDB setup for secure key storage
const DB_NAME = 'axionark_secure';
const DB_VERSION = 1;
const STORE_NAME = 'encryption_keys';

// In-memory cache for the encryption key
let encryptionKeyCache: string | null = null;
let currentUserId: string | null = null;

// Initialize IndexedDB
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
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
    // Fallback to sessionStorage
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
      // Key expired, remove it
      await removeKeyFromDB(uid);
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get key from IndexedDB:', error);
    // Fallback to sessionStorage
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

// Generate a unique encryption key for each user
export async function generateUserKey(uid: string, password: string): Promise<string> {
  if (!browser) throw new Error('Encryption only available in browser');
  
  const encoder = new TextEncoder();
  const salt = encoder.encode(uid); // Use UID as salt for consistency
  const key = await deriveKey(password, salt);
  
  // Export key to store it securely
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
}

// Store user's encryption key with caching - Updated with longer default expiration
export async function storeEncryptionKey(key: string, uid?: string, expirationHours: number = 720): Promise<void> {
  if (!browser) return;
  
  // Update cache
  encryptionKeyCache = key;
  if (uid) {
    currentUserId = uid;
  }
  
  // Always store in sessionStorage for immediate access
  sessionStorage.setItem('_ek', key);
  if (uid) {
    sessionStorage.setItem('_ek_uid', uid);
  }
  
  // Also store in IndexedDB for persistence if uid is provided
  if (uid) {
    await storeKeyInDB(uid, key, expirationHours);
  }
}

// Retrieve user's encryption key (async version that checks IndexedDB)
export async function getEncryptionKeyAsync(uid?: string): Promise<string | null> {
  if (!browser) return null;
  
  // First check cache
  if (encryptionKeyCache) {
    return encryptionKeyCache;
  }
  
  // Then check sessionStorage (fastest)
  const sessionKey = sessionStorage.getItem('_ek');
  if (sessionKey) {
    encryptionKeyCache = sessionKey;
    return sessionKey;
  }
  
  // If not in session and uid provided, check IndexedDB
  if (uid) {
    const dbKey = await getKeyFromDB(uid);
    if (dbKey) {
      // Restore to cache and sessionStorage for faster access
      encryptionKeyCache = dbKey;
      sessionStorage.setItem('_ek', dbKey);
      sessionStorage.setItem('_ek_uid', uid);
      return dbKey;
    }
  }
  
  return null;
}

// For backwards compatibility, keep getEncryptionKey as async
export const getEncryptionKey = getEncryptionKeyAsync;

// Clear encryption key from all storages
export async function clearEncryptionKey(uid?: string): Promise<void> {
  if (!browser) return;
  
  // Clear cache
  encryptionKeyCache = null;
  currentUserId = null;
  
  // Clear sessionStorage
  sessionStorage.removeItem('_ek');
  sessionStorage.removeItem('_ek_uid');
  
  // Clear from IndexedDB if uid provided
  if (uid) {
    await removeKeyFromDB(uid);
  }
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
    
    // Generate random IV for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    // Return base64 encoded string
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
    
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);
    
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );
    
    const decryptedString = decoder.decode(decryptedData);
    
    // Try to parse as JSON, otherwise return as string
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
        // Keep original value if decryption fails
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

// Synchronous version for compatibility (checks cache and sessionStorage only)
export function isEncryptionAvailable(): boolean {
  if (!browser) return false;
  return !!encryptionKeyCache || !!sessionStorage.getItem('_ek');
}

// Get current encryption key synchronously (from cache only)
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
    const encryptionKey = await generateUserKey(uid, password);
    await storeEncryptionKey(encryptionKey, uid, 720); // 30 days
    currentUserId = uid;
    return true;
  } catch (error) {
    console.error('Failed to restore encryption key:', error);
    return false;
  }
}

// Initialize encryption for a user (call after auth state changes)
export async function initializeEncryption(uid: string): Promise<boolean> {
  if (!browser) return false;
  
  currentUserId = uid;
  
  // First check if we already have a key in cache or session
  if (encryptionKeyCache) {
    return true;
  }
  
  const sessionKey = sessionStorage.getItem('_ek');
  const sessionUid = sessionStorage.getItem('_ek_uid');
  
  // Verify the session key belongs to the current user
  if (sessionKey && (!sessionUid || sessionUid === uid)) {
    encryptionKeyCache = sessionKey;
    // Also store in IndexedDB for persistence
    await storeKeyInDB(uid, sessionKey, 720); // 30 days
    return true;
  }
  
  // Try to restore key from IndexedDB
  const storedKey = await getKeyFromDB(uid);
  if (storedKey) {
    encryptionKeyCache = storedKey;
    sessionStorage.setItem('_ek', storedKey);
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
    // Store in IndexedDB for persistence if not already there
    const dbKey = await getKeyFromDB(uid);
    if (!dbKey) {
      await storeKeyInDB(uid, sessionKey, 720); // 30 days
    }
    return true;
  }
  
  return false;
}

// Check and restore encryption from all available sources
export async function checkAndRestoreEncryption(uid: string): Promise<boolean> {
  if (!browser) return false;
  
  // 1. Check cache
  if (encryptionKeyCache && currentUserId === uid) {
    return true;
  }
  
  // 2. Check session storage
  const sessionRestored = await restoreEncryptionFromSession(uid);
  if (sessionRestored) {
    return true;
  }
  
  // 3. Check IndexedDB
  const initialized = await initializeEncryption(uid);
  if (initialized) {
    return true;
  }
  
  return false;
}