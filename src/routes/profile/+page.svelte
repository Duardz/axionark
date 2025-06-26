<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { userStore, userProgress } from '$lib/stores/user';
  import { roadmapData } from '$lib/data/roadmap';
  import Navbar from '$lib/components/Navbar.svelte';
  import type { User } from 'firebase/auth';

  interface Achievement {
    title: string;
    description: string;
    icon: string;
    color: string;
    earned: boolean;
  }

  let user: User | null = null;
  let loading = false;
  let editingUsername = false;
  let editingEmail = false;
  let newUsername = '';
  let error = '';
  let success = '';
  let showSuccessToast = false;

  // Profile stats
  let totalTasks = 0;
  let completedTasks = 0;
  // Use an index signature to allow any string key for phaseProgress
  let phaseProgress: { [key: string]: number } = {};
  let achievements: Achievement[] = [];
  let memberSince = '';
  let learningStreak = 0;
  let favoriteCategory = '';

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
        calculateStats();
      }
    });

    return unsubscribe;
  });

  function calculateStats() {
    if (!$userStore) return;

    // Calculate total tasks and completion
    totalTasks = roadmapData.reduce((total, phase) => {
      return total + phase.categories.reduce((catTotal, category) => {
        return catTotal + category.tasks.length;
      }, 0);
    }, 0);
    
    completedTasks = $userStore.completedTasks.length;

    // Calculate phase progress
    roadmapData.forEach(phase => {
      let phaseTotal = 0;
      let phaseCompleted = 0;
      
      phase.categories.forEach(category => {
        category.tasks.forEach(task => {
          phaseTotal++;
          if ($userStore!.completedTasks.includes(task.id)) {
            phaseCompleted++;
          }
        });
      });
      
      phaseProgress[phase.id] = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
    });

    // Generate achievements
    achievements = getAchievements();

    // Format member since date
    if ($userStore.createdAt) {
      memberSince = new Date($userStore.createdAt.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    // Calculate learning streak (mock data - you might want to implement proper tracking)
    learningStreak = Math.min(Math.floor($userStore.totalXP / 100), 100);

    // Find favorite category (mock logic)
    favoriteCategory = 'Web Security Fundamentals';
  }

  function getAchievements(): Achievement[] {
    const achievementsList: Achievement[] = [];
    
    if (completedTasks >= 1) {
      achievementsList.push({
        title: 'First Steps',
        description: 'Complete your first task',
        icon: '🌱',
        color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
        earned: true
      });
    }
    
    if (completedTasks >= 10) {
      achievementsList.push({
        title: 'Learning Momentum',
        description: 'Complete 10 tasks',
        icon: '🚀',
        color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
        earned: true
      });
    }
    
    if (completedTasks >= 25) {
      achievementsList.push({
        title: 'Dedicated Learner',
        description: 'Complete 25 tasks',
        icon: '⭐',
        color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
        earned: true
      });
    }
    
    if ($userStore && $userStore.totalXP >= 1000) {
      achievementsList.push({
        title: 'XP Milestone',
        description: 'Earn 1000 XP',
        icon: '💎',
        color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
        earned: true
      });
    }
    
    if ($userStore && ($userStore.bugsFound || 0) >= 1) {
      achievementsList.push({
        title: 'Bug Hunter',
        description: 'Find your first bug',
        icon: '🐛',
        color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
        earned: true
      });
    }
    
    if ($userStore && ($userStore.totalBounty || 0) >= 100) {
      achievementsList.push({
        title: 'First Bounty',
        description: 'Earn $100 in bounties',
        icon: '💰',
        color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
        earned: true
      });
    }

    // Add some locked achievements
    if (completedTasks < 50) {
      achievementsList.push({
        title: 'Half Century',
        description: 'Complete 50 tasks',
        icon: '🏆',
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
        earned: false
      });
    }
    
    if (!$userStore || $userStore.totalXP < 5000) {
      achievementsList.push({
        title: 'XP Master',
        description: 'Earn 5000 XP',
        icon: '👑',
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
        earned: false
      });
    }

    return achievementsList;
  }

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
    editingEmail = false;
    if ($userStore) {
      newUsername = $userStore.username;
    }
    error = '';
  }

  function getAchievementBadge(xp: number) {
    if (xp >= 10000) return { name: 'Elite Hunter', color: 'from-purple-500 to-pink-600', textColor: 'text-purple-600 dark:text-purple-400' };
    if (xp >= 5000) return { name: 'Advanced Hunter', color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-600 dark:text-blue-400' };
    if (xp >= 1000) return { name: 'Intermediate Hunter', color: 'from-green-500 to-emerald-600', textColor: 'text-green-600 dark:text-green-400' };
    return { name: 'Beginner Hunter', color: 'from-gray-500 to-gray-600', textColor: 'text-gray-600 dark:text-gray-400' };
  }

  function getNextLevelXP() {
    if (!$userProgress) return 1000;
    return $userProgress.xpPerLevel - $userProgress.currentLevelXP;
  }

  function getLevelBenefits(level: number) {
    const benefits = [];
    if (level >= 5) benefits.push('Access to intermediate challenges');
    if (level >= 10) benefits.push('Premium learning resources');
    if (level >= 15) benefits.push('Community mentor status');
    if (level >= 20) benefits.push('Elite hunter recognition');
    return benefits;
  }

  $: nextLevelBenefits = $userProgress ? getLevelBenefits($userProgress.level + 1) : [];
  $: badge = $userStore ? getAchievementBadge($userStore.totalXP) : getAchievementBadge(0);
</script>

<Navbar />

<!-- Success Toast -->
{#if showSuccessToast}
  <div class="toast toast-success animate-slide-up">
    <div class="flex items-center">
      <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="font-semibold">{success}</span>
    </div>
  </div>
{/if}

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          👤 Profile
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Manage your account and view your achievements
        </p>
      </div>

      {#if $userStore}
        <!-- Profile Hero Card -->
        <div class="card overflow-hidden mb-8 shadow-xl">
          <!-- Cover Background -->
          <div class={`bg-gradient-to-r ${badge.color} p-8 sm:p-12 relative overflow-hidden`}>
            <!-- Background Pattern -->
            <div class="absolute inset-0 opacity-10">
              <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px); background-size: 50px 50px;"></div>
            </div>
            
            <div class="relative flex flex-col sm:flex-row items-center gap-6">
              <!-- Avatar -->
              <div class="flex-shrink-0">
                <div class="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-bold text-white border-4 border-white/30">
                  {$userStore.username.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <!-- Profile Info -->
              <div class="flex-1 text-center sm:text-left text-white">
                <h2 class="text-3xl sm:text-4xl font-bold mb-2">{$userStore.username}</h2>
                <p class="text-lg opacity-90 mb-4">{$userStore.email}</p>
                
                <div class="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                  <div class="flex items-center bg-white/20 rounded-lg px-3 py-1">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Member since {memberSince}
                  </div>
                  
                  <div class="flex items-center bg-white/20 rounded-lg px-3 py-1">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                    {learningStreak} day streak
                  </div>
                  
                  <div class="flex items-center bg-white/20 rounded-lg px-3 py-1">
                    <span class="text-lg mr-1">🎯</span>
                    {badge.name}
                  </div>
                </div>
              </div>
              
              <!-- Level Info -->
              {#if $userProgress}
                <div class="flex-shrink-0 text-center text-white">
                  <div class="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div class="text-3xl font-bold mb-1">Level {$userProgress.level}</div>
                    <div class="text-sm opacity-80 mb-3">{$userStore.totalXP} XP</div>
                    
                    <!-- Progress Ring -->
                    <div class="relative w-16 h-16 mx-auto">
                      <svg class="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          class="opacity-30"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-dasharray="{$userProgress.percentage}, 100"
                          class="opacity-100"
                        />
                      </svg>
                      <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-xs font-bold">{Math.round($userProgress.percentage)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Level Progress -->
          <div class="stat-card hover:scale-105 transition-transform duration-300">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">Level {$userProgress?.level || 1}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{getNextLevelXP()} XP to next</div>
              </div>
            </div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Current Level</h3>
            <div class="progress-bar">
              <div class="progress-fill" style="width: {$userProgress?.percentage || 0}%"></div>
            </div>
          </div>

          <!-- Total XP -->
          <div class="stat-card hover:scale-105 transition-transform duration-300">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{$userStore.totalXP}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">experience points</div>
              </div>
            </div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total XP</h3>
          </div>

          <!-- Tasks Progress -->
          <div class="stat-card hover:scale-105 transition-transform duration-300">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{completedTasks}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">of {totalTasks} total</div>
              </div>
            </div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Tasks Completed</h3>
            <div class="progress-bar">
              <div class="progress-fill bg-gradient-to-r from-green-500 to-emerald-500" style="width: {(completedTasks / totalTasks) * 100}%"></div>
            </div>
          </div>

          <!-- Bug Bounty Stats -->
          <div class="stat-card hover:scale-105 transition-transform duration-300">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">${$userStore.totalBounty || 0}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{$userStore.bugsFound || 0} bugs found</div>
              </div>
            </div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</h3>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Account Settings -->
            <div class="card p-6">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                Account Settings
              </h3>
              
              {#if error}
                <div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              {/if}
              
              <div class="space-y-6">
                <!-- Email (read-only) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div class="relative">
                    <input
                      type="email"
                      value={$userStore.email}
                      disabled
                      class="input bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    />
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                
                <!-- Username -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  {#if editingUsername}
                    <div class="flex gap-2">
                      <input
                        type="text"
                        bind:value={newUsername}
                        class="input flex-1"
                        placeholder="Enter new username"
                        maxlength="50"
                      />
                      <button
                        on:click={updateUsername}
                        disabled={loading}
                        class="btn btn-primary"
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        on:click={cancelEdit}
                        class="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Username must be at least 3 characters long
                    </p>
                  {:else}
                    <div class="flex gap-2">
                      <input
                        type="text"
                        value={$userStore.username}
                        disabled
                        class="input flex-1 bg-gray-50 dark:bg-gray-800"
                      />
                      <button
                        on:click={() => editingUsername = true}
                        class="btn btn-secondary"
                      >
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    </div>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Learning Progress -->
            <div class="card p-6">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Learning Progress
              </h3>
              
              <div class="space-y-6">
                <!-- Phase Progress -->
                {#each Object.entries(phaseProgress) as [phase, progress]}
                  <div>
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize flex items-center">
                        {#if phase === 'beginner'}🌱{:else if phase === 'intermediate'}🚀{:else}👑{/if}
                        <span class="ml-2">{phase} Phase</span>
                      </span>
                      <span class="text-sm font-bold text-gray-900 dark:text-white">{progress}%</span>
                    </div>
                    <div class="progress-bar">
                      <div 
                        class={`progress-fill ${
                          phase === 'beginner' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          phase === 'intermediate' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                          'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}
                        style="width: {progress}%"
                      ></div>
                    </div>
                  </div>
                {/each}
                
                <!-- Overall Progress -->
                <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-medium text-gray-900 dark:text-white">Overall Progress</span>
                    <span class="font-bold text-gray-900 dark:text-white">
                      {Math.round((completedTasks / totalTasks) * 100)}%
                    </span>
                  </div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill bg-gradient-to-r from-indigo-500 to-purple-500"
                      style="width: {(completedTasks / totalTasks) * 100}%"
                    ></div>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {completedTasks} of {totalTasks} tasks completed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-8">
            <!-- Next Level Benefits -->
            {#if $userProgress && nextLevelBenefits.length > 0}
              <div class="card p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Level {$userProgress.level + 1} Benefits
                </h3>
                
                <div class="text-center mb-4">
                  <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    {getNextLevelXP()} XP
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">to unlock</div>
                </div>
                
                <ul class="space-y-2">
                  {#each nextLevelBenefits as benefit}
                    <li class="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <svg class="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {benefit}
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}

            <!-- Achievements -->
            <div class="card p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Achievements
              </h3>
              
              <div class="space-y-3">
                {#each achievements as achievement}
                  <div class={`p-3 rounded-lg border transition-all ${
                    achievement.earned 
                      ? `${achievement.color} border-current hover:scale-105` 
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
                  }`}>
                    <div class="flex items-center gap-3">
                      <div class="text-2xl">{achievement.icon}</div>
                      <div class="flex-1 min-w-0">
                        <div class="font-medium text-sm">{achievement.title}</div>
                        <div class="text-xs opacity-80">{achievement.description}</div>
                      </div>
                      {#if achievement.earned}
                        <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      {:else}
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="card p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
              
              <div class="space-y-4 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Learning Streak</span>
                  <span class="font-medium text-gray-900 dark:text-white">{learningStreak} days</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Favorite Category</span>
                  <span class="font-medium text-gray-900 dark:text-white">{favoriteCategory}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Current Phase</span>
                  <span class={`font-medium capitalize ${badge.textColor}`}>
                    {$userStore.currentPhase}
                  </span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {($userStore.bugsFound || 0) > 0 ? Math.round((($userStore.totalBounty || 0) / ($userStore.bugsFound || 1)) * 100) / 100 : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>