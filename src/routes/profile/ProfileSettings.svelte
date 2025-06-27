<!-- src/routes/profile/ProfileSettings.svelte -->
<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { userStore } from '$lib/stores/user';
  import { auth } from '$lib/firebase';
  import { 
    sendPasswordResetEmail
  } from 'firebase/auth';
  import { goto } from '$app/navigation';
  import EncryptionStatus from '$lib/components/EncryptionStatus.svelte';
  
  export let userStoreData: any;
  
  let loading = false;
  let error = '';
  let success = '';
  let showSuccessToast = false;
  
  // Form states
  let editingUsername = false;
  let newUsername = userStoreData.username;
  
  // Settings states
  let showAchievements = true;
  let enableSounds = false;
  let showOnLeaderboard = true;
  
  // Delete account states
  let showDeleteModal = false;
  let deleteConfirmPassword = '';
  let deleteConfirmText = '';
  let deleteError = '';
  
  // Password reset state
  let showPasswordResetSuccess = false;
  let resetLoading = false;
  
  async function updateUsername() {
    if (!newUsername.trim()) return;
    
    error = '';
    success = '';
    
    if (newUsername.length < 3) {
      error = 'Username must be at least 3 characters';
      return;
    }
    
    loading = true;
    try {
      await userStore.updateUsername(userStoreData.uid, newUsername.trim());
      success = 'Username updated successfully!';
      editingUsername = false;
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
    } catch (err: any) {
      error = err.message || 'Failed to update username';
    } finally {
      loading = false;
    }
  }
  
  function cancelEdit() {
    editingUsername = false;
    newUsername = userStoreData.username;
    error = '';
  }
  
  async function sendPasswordReset() {
    if (!auth?.currentUser?.email) return;
    
    resetLoading = true;
    error = '';
    
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      showPasswordResetSuccess = true;
      setTimeout(() => showPasswordResetSuccess = false, 5000);
    } catch (err: any) {
      error = 'Failed to send password reset email. Please try again.';
    } finally {
      resetLoading = false;
    }
  }
  
  async function handleDeleteAccount() {
    if (!auth?.currentUser) return;
    
    deleteError = '';
    
    // Validate confirmation text
    if (deleteConfirmText !== 'DELETE') {
      deleteError = 'Please type DELETE to confirm';
      return;
    }
    
    // Validate password
    if (!deleteConfirmPassword) {
      deleteError = 'Please enter your password';
      return;
    }
    
    loading = true;
    
    try {
      // Call the deleteAccount method from authStore
      await authStore.deleteAccount(deleteConfirmPassword);
      
      // The user will be automatically logged out and redirected by the auth state listener
      
    } catch (err: any) {
      deleteError = err.message || 'Failed to delete account';
      loading = false;
    }
  }
  
  function toggleSetting(setting: string) {
    // In a real app, you'd save these preferences to Firestore
    switch(setting) {
      case 'achievements':
        showAchievements = !showAchievements;
        break;
      case 'sounds':
        enableSounds = !enableSounds;
        break;
      case 'leaderboard':
        showOnLeaderboard = !showOnLeaderboard;
        break;
    }
  }
</script>

<!-- Success Toast -->
{#if showSuccessToast}
  <div class="fixed top-20 right-4 z-50 animate-slide-in">
    <div class="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      {success}
    </div>
  </div>
{/if}

<!-- Password Reset Success -->
{#if showPasswordResetSuccess}
  <div class="fixed top-20 right-4 z-50 animate-slide-in">
    <div class="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      Password reset email sent!
    </div>
  </div>
{/if}

<div class="max-w-4xl mx-auto">
  <!-- Settings Header -->
  <div class="mb-8">
    <h2 class="text-2xl font-bold text-white flex items-center gap-3">
      <span class="text-3xl">⚙️</span>
      Account Settings
    </h2>
    <p class="text-gray-400 mt-2">Manage your account preferences and security settings</p>
  </div>
  
  {#if error && !deleteError}
    <div class="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
      <p class="text-sm text-red-400 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </p>
    </div>
  {/if}
  
  <!-- Account Information Section -->
  <div class="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-6">
    <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      Account Information
    </h3>
    
    <div class="space-y-6">
      <!-- Email Field -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="email"
            value={userStoreData.email}
            disabled
            class="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-400"
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-500">Email cannot be changed for security reasons</p>
      </div>
      
      <!-- Username Field -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Username
        </label>
        {#if editingUsername}
          <div class="space-y-3">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                bind:value={newUsername}
                class="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="Enter new username"
                maxlength="50"
              />
            </div>
            <div class="flex flex-col sm:flex-row gap-2">
              <button
                on:click={updateUsername}
                disabled={loading}
                class="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all font-medium"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                on:click={cancelEdit}
                class="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        {:else}
          <div class="flex flex-col sm:flex-row gap-2">
            <div class="relative flex-1">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                value={userStoreData.username}
                disabled
                class="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <button
              on:click={() => editingUsername = true}
              class="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Security Section -->
  <div class="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-6">
    <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      Security
    </h3>
    
    <div class="space-y-4">
      <!-- Password Reset -->
      <div class="p-4 bg-gray-700/30 rounded-lg">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 class="font-medium text-white">Password</h4>
            <p class="text-sm text-gray-400 mt-1">Reset your account password via email</p>
          </div>
          <button
            on:click={sendPasswordReset}
            disabled={resetLoading}
            class="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
          >
            {#if resetLoading}
              <div class="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              Sending...
            {:else}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Reset Email
            {/if}
          </button>
        </div>
      </div>
      
      <!-- Note about encryption -->
      <div class="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div class="flex items-start gap-2">
          <svg class="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="text-sm">
            <p class="text-blue-400 font-medium mb-1">Password & Encryption</p>
            <p class="text-gray-300 text-xs leading-relaxed">
              When you reset your password, you'll need to sign in again. Your data will automatically be re-encrypted with your new password.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Data Encryption Status Section -->
  <div class="mb-6">
    <EncryptionStatus />
  </div>
  
  <!-- Game Preferences Section -->
  <div class="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-6">
    <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
      <span class="text-xl">🎮</span>
      Game Preferences
    </h3>
    
    <div class="space-y-2">
      <!-- Achievement Toggle -->
      <button
        on:click={() => toggleSetting('achievements')}
        class="w-full p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <span class="text-lg">🏆</span>
            </div>
            <div class="text-left">
              <p class="text-white font-medium">Show achievements in profile</p>
              <p class="text-sm text-gray-400">Display your earned achievements publicly</p>
            </div>
          </div>
          <div class="relative">
            <input
              type="checkbox"
              checked={showAchievements}
              class="sr-only"
            />
            <div class="w-11 h-6 bg-gray-600 rounded-full {showAchievements ? 'bg-cyan-500' : ''}"></div>
            <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform {showAchievements ? 'translate-x-5' : ''}"></div>
          </div>
        </div>
      </button>
      
      <!-- Sound Effects Toggle -->
      <button
        on:click={() => toggleSetting('sounds')}
        class="w-full p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <span class="text-lg">🔊</span>
            </div>
            <div class="text-left">
              <p class="text-white font-medium">Enable sound effects</p>
              <p class="text-sm text-gray-400">Play sounds for achievements and actions</p>
            </div>
          </div>
          <div class="relative">
            <input
              type="checkbox"
              checked={enableSounds}
              class="sr-only"
            />
            <div class="w-11 h-6 bg-gray-600 rounded-full {enableSounds ? 'bg-cyan-500' : ''}"></div>
            <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform {enableSounds ? 'translate-x-5' : ''}"></div>
          </div>
        </div>
      </button>
      
      <!-- Leaderboard Toggle -->
      <button
        on:click={() => toggleSetting('leaderboard')}
        class="w-full p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <span class="text-lg">🏅</span>
            </div>
            <div class="text-left">
              <p class="text-white font-medium">Show on leaderboard</p>
              <p class="text-sm text-gray-400">Appear in global rankings</p>
            </div>
          </div>
          <div class="relative">
            <input
              type="checkbox"
              checked={showOnLeaderboard}
              class="sr-only"
            />
            <div class="w-11 h-6 bg-gray-600 rounded-full {showOnLeaderboard ? 'bg-cyan-500' : ''}"></div>
            <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform {showOnLeaderboard ? 'translate-x-5' : ''}"></div>
          </div>
        </div>
      </button>
    </div>
  </div>
  
  <!-- Danger Zone -->
  <div class="bg-gray-800 rounded-2xl border border-red-500/30 p-6">
    <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
      <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      Danger Zone
    </h3>
    
    <div class="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
      <h4 class="font-medium text-white mb-2">Delete Account</h4>
      <p class="text-sm text-gray-400 mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      <button
        on:click={() => showDeleteModal = true}
        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
      >
        Delete Account
      </button>
    </div>
  </div>
</div>

<!-- Delete Account Modal -->
{#if showDeleteModal}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-700">
      <h3 class="text-xl font-bold text-white mb-4">Delete Account</h3>
      
      {#if deleteError}
        <div class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p class="text-sm text-red-400">{deleteError}</p>
        </div>
      {/if}
      
      <p class="text-gray-400 mb-6">
        This will permanently delete your account and all your data. This action cannot be undone.
      </p>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Type <span class="font-mono bg-gray-700 px-2 py-1 rounded">DELETE</span> to confirm
          </label>
          <input
            type="text"
            bind:value={deleteConfirmText}
            placeholder="Type DELETE"
            class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Enter your password
          </label>
          <input
            type="password"
            bind:value={deleteConfirmPassword}
            placeholder="Your password"
            class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div class="flex gap-3 mt-6">
        <button
          on:click={handleDeleteAccount}
          disabled={loading || deleteConfirmText !== 'DELETE' || !deleteConfirmPassword}
          class="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          {loading ? 'Deleting...' : 'Delete Account'}
        </button>
        <button
          on:click={() => {
            showDeleteModal = false;
            deleteConfirmText = '';
            deleteConfirmPassword = '';
            deleteError = '';
          }}
          class="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
</style>