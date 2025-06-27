// src/lib/components/PasswordChange.svelte
<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { auth } from '$lib/firebase';
  import { 
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    type User
  } from 'firebase/auth';
  import { generateUserKey, storeEncryptionKey } from '$lib/utils/encryption';
  
  export let user: User;
  export let onSuccess: () => void = () => {};
  export let onCancel: () => void = () => {};
  
  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let loading = false;
  let error = '';
  let success = '';
  let showPasswords = false;
  
  // Password strength indicator
  let passwordStrength = 0;
  let passwordStrengthText = '';
  let passwordStrengthColor = '';
  
  function checkPasswordStrength(password: string) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    passwordStrength = Math.min(Math.round((strength / 6) * 100), 100);
    
    if (passwordStrength < 40) {
      passwordStrengthText = 'Weak';
      passwordStrengthColor = 'from-red-500 to-red-600';
    } else if (passwordStrength < 70) {
      passwordStrengthText = 'Fair';
      passwordStrengthColor = 'from-yellow-500 to-orange-600';
    } else if (passwordStrength < 90) {
      passwordStrengthText = 'Good';
      passwordStrengthColor = 'from-blue-500 to-indigo-600';
    } else {
      passwordStrengthText = 'Strong';
      passwordStrengthColor = 'from-green-500 to-emerald-600';
    }
  }
  
  async function handlePasswordChange() {
    error = '';
    success = '';
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      error = 'Please fill in all fields';
      return;
    }
    
    if (newPassword !== confirmPassword) {
      error = 'New passwords do not match';
      return;
    }
    
    if (newPassword.length < 8) {
      error = 'Password must be at least 8 characters long';
      return;
    }
    
    if (currentPassword === newPassword) {
      error = 'New password must be different from current password';
      return;
    }
    
    loading = true;
    
    try {
      // Step 1: Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Step 2: Update password
      await updatePassword(user, newPassword);
      
      // Step 3: Generate new encryption key with new password
      const newEncryptionKey = await generateUserKey(user.uid, newPassword);
      storeEncryptionKey(newEncryptionKey);
      
      // Note: In a production system, you would need to:
      // 1. Decrypt all encrypted data with the old key
      // 2. Re-encrypt with the new key
      // 3. Update all encrypted documents in Firestore
      // This would require storing the old key temporarily or implementing
      // a key rotation mechanism
      
      success = 'Password updated successfully!';
      
      // Clear form
      currentPassword = '';
      newPassword = '';
      confirmPassword = '';
      passwordStrength = 0;
      
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (err: any) {
      console.error('Password change error:', err);
      
      if (err.code === 'auth/wrong-password') {
        error = 'Current password is incorrect';
      } else if (err.code === 'auth/weak-password') {
        error = 'New password is too weak';
      } else if (err.code === 'auth/requires-recent-login') {
        error = 'Please sign out and sign in again before changing your password';
      } else {
        error = err.message || 'Failed to update password';
      }
    } finally {
      loading = false;
    }
  }
  
  $: if (newPassword) {
    checkPasswordStrength(newPassword);
  }
</script>

<div class="max-w-md w-full">
  <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
    Change Password
  </h3>
  
  {#if error}
    <div class="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
      <p class="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </p>
    </div>
  {/if}
  
  {#if success}
    <div class="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg">
      <p class="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {success}
      </p>
    </div>
  {/if}
  
  <form on:submit|preventDefault={handlePasswordChange} class="space-y-4">
    <!-- Current Password -->
    <div>
      <label for="current-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Current Password
      </label>
      <div class="relative">
        <input
          id="current-password"
          type={showPasswords ? 'text' : 'password'}
          bind:value={currentPassword}
          class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>
    </div>
    
    <!-- New Password -->
    <div>
      <label for="new-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        New Password
      </label>
      <div class="relative">
        <input
          id="new-password"
          type={showPasswords ? 'text' : 'password'}
          bind:value={newPassword}
          class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>
      
      {#if newPassword}
        <div class="mt-2">
          <div class="flex justify-between text-xs mb-1">
            <span class="text-gray-600 dark:text-gray-400">Password Strength</span>
            <span class="font-medium text-gray-700 dark:text-gray-300">{passwordStrengthText}</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              class="bg-gradient-to-r {passwordStrengthColor} h-2 rounded-full transition-all duration-300"
              style="width: {passwordStrength}%"
            ></div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Confirm Password -->
    <div>
      <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Confirm New Password
      </label>
      <div class="relative">
        <input
          id="confirm-password"
          type={showPasswords ? 'text' : 'password'}
          bind:value={confirmPassword}
          class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>
      {#if confirmPassword && newPassword && confirmPassword !== newPassword}
        <p class="text-xs text-red-600 dark:text-red-400 mt-1">Passwords do not match</p>
      {/if}
    </div>
    
    <!-- Show/Hide Password Toggle -->
    <div class="flex items-center">
      <input
        id="show-passwords"
        type="checkbox"
        bind:checked={showPasswords}
        class="w-4 h-4 text-indigo-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500"
      />
      <label for="show-passwords" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
        Show passwords
      </label>
    </div>
    
    <!-- Note about encryption -->
    <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div class="flex items-start gap-2">
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-sm text-blue-700 dark:text-blue-300">
          <p class="font-medium mb-1">Encryption Notice</p>
          <p class="text-xs">Your password is used to encrypt your sensitive data. After changing your password, you'll need to sign in again for the encryption to update.</p>
        </div>
      </div>
    </div>
    
    <!-- Buttons -->
    <div class="flex gap-3 pt-4">
      <button
        type="submit"
        disabled={loading || !currentPassword || !newPassword || !confirmPassword || (newPassword !== confirmPassword)}
        class="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
      >
        {#if loading}
          <span class="flex items-center justify-center">
            <svg class="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Updating...
          </span>
        {:else}
          Update Password
        {/if}
      </button>
      <button
        type="button"
        on:click={onCancel}
        class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
      >
        Cancel
      </button>
    </div>
  </form>
</div>