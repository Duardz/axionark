<!-- src/lib/components/EncryptionStatus.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { authStore } from '$lib/stores/auth';
  import { userStore, journalStore, bugStore } from '$lib/stores/user';
  import { isEncryptionAvailable, getEncryptionKey } from '$lib/utils/encryption';
  import { 
    checkMigrationStatus, 
    migrateAllUserData,
    type MigrationResult 
  } from '$lib/utils/encryption-migration';
  
  let encryptionEnabled = false;
  let encryptionKeyPresent = false;
  let migrationStatus = {
    needsMigration: false,
    unencryptedJournalCount: 0,
    unencryptedBugCount: 0
  };
  let migrating = false;
  let migrationResults: {
    journal?: MigrationResult;
    bugs?: MigrationResult;
  } = {};
  let showDetails = false;
  let checkingStatus = true;
  let keyCheckInterval: NodeJS.Timeout | null = null;
  
  onMount(async () => {
    // Start monitoring encryption key availability
    checkEncryptionStatus();
    keyCheckInterval = setInterval(checkEncryptionStatus, 1000);
    
    if ($authStore && $userStore) {
      try {
        migrationStatus = await checkMigrationStatus($authStore.uid);
      } catch (error) {
        console.error('Error checking migration status:', error);
      }
    }
    
    checkingStatus = false;
  });
  
  onDestroy(() => {
    if (keyCheckInterval) {
      clearInterval(keyCheckInterval);
      keyCheckInterval = null;
    }
  });
  
  function checkEncryptionStatus() {
    encryptionEnabled = isEncryptionAvailable();
    encryptionKeyPresent = !!getEncryptionKey();
  }
  
  async function startMigration() {
    if (!$authStore || migrating) return;
    
    migrating = true;
    
    try {
      const results = await migrateAllUserData($authStore.uid);
      migrationResults = results;
      
      // Refresh migration status
      migrationStatus = await checkMigrationStatus($authStore.uid);
      
      // Reload data to show decrypted content
      await journalStore.loadEntries($authStore.uid);
      await bugStore.loadBugs($authStore.uid);
      
      // Show success message
      if (results.journal.success && results.bugs.success) {
        alert('Data encryption completed successfully!');
      } else {
        alert('Some data could not be encrypted. Check the details for more information.');
      }
    } catch (error) {
      console.error('Migration error:', error);
      alert('Error during encryption. Please try again.');
    } finally {
      migrating = false;
    }
  }
  
  async function refreshData() {
    if (!$authStore) return;
    
    try {
      await journalStore.loadEntries($authStore.uid);
      await bugStore.loadBugs($authStore.uid);
      alert('Data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Error refreshing data. Please try again.');
    }
  }
  
  function getStatusColor() {
    if (!encryptionEnabled || !encryptionKeyPresent) return 'text-red-600 dark:text-red-400';
    if (migrationStatus.needsMigration) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  }
  
  function getStatusIcon() {
    if (!encryptionEnabled || !encryptionKeyPresent) return 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z';
    if (migrationStatus.needsMigration) return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
    return 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z';
  }
  
  function getStatusText() {
    if (!encryptionEnabled || !encryptionKeyPresent) return 'Encryption Key Missing';
    if (migrationStatus.needsMigration) return 'Migration Available';
    return 'Fully Encrypted';
  }
</script>

<div class="bg-gray-800 rounded-2xl border border-gray-700 p-6">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-white flex items-center gap-2">
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      Data Encryption Status
    </h3>
    
    <button
      on:click={() => showDetails = !showDetails}
      class="text-sm text-gray-400 hover:text-white transition-colors"
    >
      {showDetails ? 'Hide' : 'Show'} Details
    </button>
  </div>
  
  {#if checkingStatus}
    <div class="flex items-center justify-center py-8">
      <div class="text-center">
        <div class="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm text-gray-400">Checking encryption status...</p>
      </div>
    </div>
  {:else}
    <!-- Main Status -->
    <div class="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg mb-4">
      <div class="flex items-center gap-3">
        <div class={`w-12 h-12 rounded-lg flex items-center justify-center ${
          encryptionEnabled && encryptionKeyPresent
            ? migrationStatus.needsMigration 
              ? 'bg-yellow-500/20' 
              : 'bg-green-500/20'
            : 'bg-red-500/20'
        }`}>
          <svg class={`w-6 h-6 ${getStatusColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getStatusIcon()} />
          </svg>
        </div>
        <div>
          <p class={`font-medium ${getStatusColor()}`}>{getStatusText()}</p>
          <p class="text-sm text-gray-400 mt-0.5">
            {#if !encryptionEnabled || !encryptionKeyPresent}
              Please sign in again to enable encryption
            {:else if migrationStatus.needsMigration}
              {migrationStatus.unencryptedJournalCount + migrationStatus.unencryptedBugCount} items need encryption
            {:else}
              All data is encrypted
            {/if}
          </p>
        </div>
      </div>
      
      <div class="flex gap-2">
        {#if encryptionEnabled && encryptionKeyPresent && migrationStatus.needsMigration}
          <button
            on:click={startMigration}
            disabled={migrating}
            class="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
          >
            {#if migrating}
              <span class="flex items-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Encrypting...
              </span>
            {:else}
              Encrypt Now
            {/if}
          </button>
        {/if}
        
        <button
          on:click={refreshData}
          class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all font-medium text-sm"
          title="Refresh encrypted data"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
    
    {#if showDetails}
      <div class="space-y-3">
        <!-- Encryption Key Status -->
        <div class="p-4 bg-gray-700/20 rounded-lg">
          <h4 class="text-sm font-medium text-white mb-3">System Status</h4>
          
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-400">Encryption Available</span>
              <span class={`font-medium ${encryptionEnabled ? 'text-green-400' : 'text-red-400'}`}>
                {encryptionEnabled ? 'Yes' : 'No'}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-400">Encryption Key Present</span>
              <span class={`font-medium ${encryptionKeyPresent ? 'text-green-400' : 'text-red-400'}`}>
                {encryptionKeyPresent ? 'Yes' : 'No'}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-400">User Authenticated</span>
              <span class={`font-medium ${$authStore ? 'text-green-400' : 'text-red-400'}`}>
                {$authStore ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Encryption Details -->
        <div class="p-4 bg-gray-700/20 rounded-lg">
          <h4 class="text-sm font-medium text-white mb-3">Encryption Details</h4>
          
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-400">Encryption Method</span>
              <span class="text-gray-300">AES-256-GCM</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-400">Key Derivation</span>
              <span class="text-gray-300">PBKDF2 (100k iterations)</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-400">Protected Fields</span>
              <span class="text-gray-300">Journal content, Bug details</span>
            </div>
          </div>
        </div>
        
        <!-- Migration Status -->
        {#if migrationStatus.needsMigration}
          <div class="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <h4 class="text-sm font-medium text-yellow-400 mb-2">Unencrypted Data</h4>
            <div class="space-y-1 text-sm">
              {#if migrationStatus.unencryptedJournalCount > 0}
                <div class="flex items-center justify-between">
                  <span class="text-gray-300">Journal Entries</span>
                  <span class="text-yellow-400">{migrationStatus.unencryptedJournalCount}</span>
                </div>
              {/if}
              {#if migrationStatus.unencryptedBugCount > 0}
                <div class="flex items-center justify-between">
                  <span class="text-gray-300">Bug Reports</span>
                  <span class="text-yellow-400">{migrationStatus.unencryptedBugCount}</span>
                </div>
              {/if}
            </div>
          </div>
        {/if}
        
        <!-- Migration Results -->
        {#if migrationResults.journal || migrationResults.bugs}
          <div class="p-4 bg-gray-700/20 rounded-lg">
            <h4 class="text-sm font-medium text-white mb-2">Last Migration Results</h4>
            <div class="space-y-2 text-sm">
              {#if migrationResults.journal}
                <div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-300">Journal Entries</span>
                    <span class={migrationResults.journal.success ? 'text-green-400' : 'text-red-400'}>
                      {migrationResults.journal.totalEncrypted}/{migrationResults.journal.totalProcessed} encrypted
                    </span>
                  </div>
                  {#if migrationResults.journal.errors.length > 0}
                    <div class="mt-1 text-xs text-red-400">
                      {migrationResults.journal.errors.length} error(s)
                    </div>
                  {/if}
                </div>
              {/if}
              
              {#if migrationResults.bugs}
                <div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-300">Bug Reports</span>
                    <span class={migrationResults.bugs.success ? 'text-green-400' : 'text-red-400'}>
                      {migrationResults.bugs.totalEncrypted}/{migrationResults.bugs.totalProcessed} encrypted
                    </span>
                  </div>
                  {#if migrationResults.bugs.errors.length > 0}
                    <div class="mt-1 text-xs text-red-400">
                      {migrationResults.bugs.errors.length} error(s)
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {/if}
        
        <!-- Security Info -->
        <div class="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div class="flex items-start gap-2">
            <svg class="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm">
              <p class="text-blue-400 font-medium mb-1">Security Information</p>
              <p class="text-gray-300 text-xs leading-relaxed">
                Your data is encrypted using your password. Only you can decrypt it. 
                We never store your password or encryption keys on our servers.
              </p>
              {#if !encryptionKeyPresent && $authStore}
                <p class="text-yellow-400 text-xs mt-2">
                  <strong>Action Required:</strong> Please sign out and sign in again to restore encryption functionality.
                </p>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>