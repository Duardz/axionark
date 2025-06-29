<!-- src/lib/components/EncryptionDebug.svelte -->
<!-- This component helps debug encryption issues in development -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { authStore } from '$lib/stores/auth';
  import { getEncryptionKeyAsync, isEncryptionAvailableAsync, initializeEncryption } from '$lib/utils/encryption';
  
  let encryptionKey: string | null = null;
  let keyAvailable = false;
  let sessionStorageKey: string | null = null;
  let indexedDBKey: string | null = null;
  let currentUser: any = null;
  let checkInterval: NodeJS.Timeout | null = null;
  let attemptCount = 0;
  
  onMount(() => {
    checkEncryptionStatus();
    
    // Check every second
    checkInterval = setInterval(checkEncryptionStatus, 1000);
    
    const unsubscribe = authStore.subscribe(user => {
      currentUser = user;
      if (user) {
        checkEncryptionStatus();
      }
    });
    
    return () => {
      unsubscribe();
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  });
  
  async function checkEncryptionStatus() {
    if (!currentUser) return;
    
    attemptCount++;
    
    // Check various sources
    sessionStorageKey = sessionStorage.getItem('_ek');
    encryptionKey = await getEncryptionKeyAsync(currentUser.uid);
    keyAvailable = await isEncryptionAvailableAsync(currentUser.uid);
    
    // Try to get from IndexedDB directly
    try {
      const db = await openDB();
      const tx = db.transaction(['encryption_keys'], 'readonly');
      const store = tx.objectStore('encryption_keys');
      const result = await new Promise<any>((resolve) => {
        const request = store.get(`key_${currentUser.uid}`);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });
      db.close();
      
      if (result && result.key) {
        indexedDBKey = result.key.substring(0, 20) + '...'; // Show partial key for security
      }
    } catch (error) {
      console.error('Error checking IndexedDB:', error);
    }
  }
  
  async function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('axionark_secure', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async function attemptRestore() {
    if (!currentUser) return;
    
    try {
      await initializeEncryption(currentUser.uid);
      await checkEncryptionStatus();
      alert('Encryption restore attempted!');
    } catch (error) {
      console.error('Failed to restore encryption:', error);
      alert('Failed to restore encryption: ' + error);
    }
  }
  
  function clearAllKeys() {
    if (confirm('This will clear all encryption keys. You will need to sign in again. Continue?')) {
      sessionStorage.removeItem('_ek');
      localStorage.removeItem('_ek'); // Just in case
      
      // Clear IndexedDB
      indexedDB.deleteDatabase('axionark_secure');
      
      alert('All encryption keys cleared. Please sign out and sign in again.');
      checkEncryptionStatus();
    }
  }
</script>

{#if process.env.NODE_ENV === 'development'}
  <div class="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-sm text-xs font-mono">
    <h3 class="font-bold mb-2 text-yellow-400">🔐 Encryption Debug</h3>
    
    <div class="space-y-1">
      <div>User: {currentUser ? currentUser.email : 'Not logged in'}</div>
      <div>UID: {currentUser ? currentUser.uid.substring(0, 10) + '...' : 'N/A'}</div>
      <div class="border-t pt-1 mt-1">
        <div class={keyAvailable ? 'text-green-400' : 'text-red-400'}>
          Key Available: {keyAvailable ? '✓' : '✗'}
        </div>
        <div class={sessionStorageKey ? 'text-green-400' : 'text-red-400'}>
          Session Storage: {sessionStorageKey ? '✓' : '✗'}
        </div>
        <div class={indexedDBKey ? 'text-green-400' : 'text-red-400'}>
          IndexedDB: {indexedDBKey || '✗'}
        </div>
        <div class={encryptionKey ? 'text-green-400' : 'text-red-400'}>
          Encryption Key: {encryptionKey ? encryptionKey.substring(0, 20) + '...' : '✗'}
        </div>
      </div>
      <div class="border-t pt-1 mt-1">
        <div>Check Count: {attemptCount}</div>
      </div>
    </div>
    
    <div class="flex gap-2 mt-3">
      <button
        on:click={attemptRestore}
        class="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
      >
        Restore Key
      </button>
      <button
        on:click={clearAllKeys}
        class="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
      >
        Clear All
      </button>
    </div>
  </div>
{/if}