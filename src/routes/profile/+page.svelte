<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { userStore, userProgress } from '$lib/stores/user';
  import Navbar from '$lib/components/Navbar.svelte';
  import type { User } from 'firebase/auth';

  let user: User | null = null;
  let loading = false;
  let editingUsername = false;
  let newUsername = '';
  let error = '';
  let success = '';

  onMount(() => {
    const unsubscribe = authStore.subscribe(async (authUser) => {
      if (!authUser) {
        goto('/');
        return;
      }
      user = authUser;
      await userStore.loadProfile(authUser.uid);
      
      if ($userStore) {
        newUsername = $userStore.username;
      }
    });

    return unsubscribe;
  });

  async function updateUsername() {
    if (!user || !newUsername.trim()) return;
    
    error = '';
    success = '';
    
    if (newUsername.length < 3) {
      error = 'Username must be at least 3 characters';
      return;
    }
    
    loading = true;
    try {
      await userStore.updateUsername(user.uid, newUsername.trim());
      success = 'Username updated successfully!';
      editingUsername = false;
      
      setTimeout(() => {
        success = '';
      }, 3000);
    } catch (err: any) {
      error = err.message || 'Failed to update username';
    } finally {
      loading = false;
    }
  }

  function cancelEdit() {
    editingUsername = false;
    if ($userStore) {
      newUsername = $userStore.username;
    }
    error = '';
  }

  function getAchievementBadge(xp: number) {
    if (xp >= 10000) return { name: 'Elite Hunter', color: 'text-purple-600 bg-purple-100' };
    if (xp >= 5000) return { name: 'Advanced Hunter', color: 'text-blue-600 bg-blue-100' };
    if (xp >= 1000) return { name: 'Intermediate Hunter', color: 'text-green-600 bg-green-100' };
    return { name: 'Beginner Hunter', color: 'text-gray-600 bg-gray-100' };
  }
</script>

<Navbar />

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
      <p class="text-gray-600">Manage your account and view your achievements</p>
    </div>

    {#if $userStore}
      <!-- Profile Card -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 p-8">
          <div class="flex items-center">
            <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-blue-600">
              {$userStore.username.charAt(0).toUpperCase()}
            </div>
            <div class="ml-6 text-white">
              <h2 class="text-2xl font-bold">{$userStore.username}</h2>
              <p class="text-blue-100">{$userStore.email}</p>
              {#if true}
                {@const badge = getAchievementBadge($userStore.totalXP)}
                <span class={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${badge.color}`}>
                  {badge.name}
                </span>
              {/if}
            </div>
          </div>
        </div>
        
        <div class="p-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p class="text-2xl font-bold text-gray-900">{$userProgress.level}</p>
              <p class="text-sm text-gray-600">Level</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{$userStore.totalXP}</p>
              <p class="text-sm text-gray-600">Total XP</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{$userStore.bugsFound || 0}</p>
              <p class="text-sm text-gray-600">Bugs Found</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">${$userStore.totalBounty || 0}</p>
              <p class="text-sm text-gray-600">Total Earnings</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Settings -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
        
        {#if error}
          <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        {/if}
        
        {#if success}
          <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            {success}
          </div>
        {/if}
        
        <div class="space-y-4">
          <!-- Email (read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={$userStore.email}
              disabled
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
          </div>
          
          <!-- Username -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            {#if editingUsername}
              <div class="flex gap-2">
                <input
                  type="text"
                  bind:value={newUsername}
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new username"
                />
                <button
                  on:click={updateUsername}
                  disabled={loading}
                  class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  on:click={cancelEdit}
                  class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            {:else}
              <div class="flex gap-2">
                <input
                  type="text"
                  value={$userStore.username}
                  disabled
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                />
                <button
                  on:click={() => editingUsername = true}
                  class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Edit
                </button>
              </div>
            {/if}
          </div>
          
          <!-- Member Since -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Member Since
            </label>
            <input
              type="text"
              value={$userStore.createdAt ? new Date($userStore.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}
              disabled
              class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
          </div>
        </div>
      </div>

      <!-- Progress Overview -->
      <div class="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
        
        <div class="space-y-6">
          <!-- Current Level Progress -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700">Level {$userProgress.level} Progress</span>
              <span class="text-sm text-gray-600">{$userProgress.currentLevelXP}/{$userProgress.xpPerLevel} XP</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style="width: {$userProgress.percentage}%"
              ></div>
            </div>
          </div>
          
          <!-- Phase Progress -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-3">Phase Completion</h4>
            <div class="space-y-3">
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm text-gray-600">Beginner</span>
                  <span class="text-sm font-medium text-gray-900">
                    {$userStore.completedTasks.filter(id => id.includes('beginner')).length} tasks
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full" style="width: 45%"></div>
                </div>
              </div>
              
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm text-gray-600">Intermediate</span>
                  <span class="text-sm font-medium text-gray-900">
                    {$userStore.completedTasks.filter(id => id.includes('intermediate')).length} tasks
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-500 h-2 rounded-full" style="width: 20%"></div>
                </div>
              </div>
              
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm text-gray-600">Advanced</span>
                  <span class="text-sm font-medium text-gray-900">
                    {$userStore.completedTasks.filter(id => id.includes('advanced')).length} tasks
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-purple-500 h-2 rounded-full" style="width: 5%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>