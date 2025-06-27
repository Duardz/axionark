
// src/lib/utils/encryption.ts
import { browser } from '$app/environment';

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

// Store user's encryption key in sessionStorage (cleared on browser close)
export function storeEncryptionKey(key: string): void {
  if (!browser) return;
  sessionStorage.setItem('_ek', key);
}

// Retrieve user's encryption key
export function getEncryptionKey(): string | null {
  if (!browser) return null;
  return sessionStorage.getItem('_ek');
}

// Clear encryption key on logout
export function clearEncryptionKey(): void {
  if (!browser) return;
  sessionStorage.removeItem('_ek');
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
  
  const storedKey = keyString || getEncryptionKey();
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
  
  const storedKey = keyString || getEncryptionKey();
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

// Check if encryption key is available
export function isEncryptionAvailable(): boolean {
  return !!getEncryptionKey();
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