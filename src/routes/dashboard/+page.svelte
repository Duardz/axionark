<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore, isAuthenticated } from '$lib/stores/auth';
  import { userStore, userProgress, journalStore, bugStore } from '$lib/stores/user';
  import { roadmapData } from '$lib/data/roadmap';
  import Navbar from '$lib/components/Navbar.svelte';
  import type { User } from 'firebase/auth';

  let user: User | null = null;
  let loading = true;
  let showWelcomeAnimation = false;

  // Stats
  let totalTasks = 0;
  let completedTasks = 0;
  let recentJournalEntries: any[] = [];
  let recentBugs: any[] = [];
  let todayXP = 0;
  let weeklyProgress = 0;

  // Real-time update tracking
  let lastUpdateTime = Date.now();
  let animateStats = false;

  onMount(() => {
    const unsubscribe = authStore.subscribe(async (authUser) => {
      if (!authUser) {
        goto('/');
        return;
      }
      
      user = authUser;
      showWelcomeAnimation = true;
      
      // Load user data with loading states
      await loadDashboardData(authUser.uid);
      
      loading = false;
    });

    // Auto-refresh data every 30 seconds
    const refreshInterval = setInterval(() => {
      if (user) {
        refreshDashboardData();
      }
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  });

  async function loadDashboardData(uid: string) {
    try {
      // Load all user data
      await userStore.loadProfile(uid);
      const entries = await journalStore.loadEntries(uid);
      const bugs = await bugStore.loadBugs(uid);
      
      // Calculate total tasks
      totalTasks = roadmapData.reduce((total, phase) => {
        return total + phase.categories.reduce((catTotal, category) => {
          return catTotal + category.tasks.length;
        }, 0);
      }, 0);
      
      // Get recent items
      recentJournalEntries = entries ? entries.slice(0, 3) : [];
      recentBugs = bugs ? bugs.slice(0, 3) : [];
      
      // Calculate today's XP (mock calculation - you might want to track this properly)
      todayXP = Math.floor(Math.random() * 200); // Replace with actual logic
      
      // Calculate weekly progress
      weeklyProgress = Math.min(100, (completedTasks / 7) * 100); // Replace with actual logic
      
      lastUpdateTime = Date.now();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  async function refreshDashboardData() {
    if (!user) return;
    
    try {
      // Silently refresh data without showing loading
      await userStore.loadProfile(user.uid);
      const entries = await journalStore.loadEntries(user.uid);
      const bugs = await bugStore.loadBugs(user.uid);
      
      recentJournalEntries = entries ? entries.slice(0, 3) : [];
      recentBugs = bugs ? bugs.slice(0, 3) : [];
      
      // Trigger stats animation if data changed
      animateStats = true;
      setTimeout(() => animateStats = false, 600);
      
      lastUpdateTime = Date.now();
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    }
  }

  $: if ($userStore) {
    completedTasks = $userStore.completedTasks.length;
  }

  function getPhaseColor(phase: string) {
    switch (phase) {
      case 'beginner':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'intermediate':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'advanced':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  }

  function formatDate(date: any) {
    if (date?.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function getTimeAgo(timestamp: number) {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
</script>

<Navbar />

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div class="spinner animate-spin"></div>
      </div>
    {:else if $userStore}
      <div class="space-y-8">
        <!-- Welcome Section with Animation -->
        <div class="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl {showWelcomeAnimation ? 'animate-fade-in-up' : ''}">
          <div class="relative z-10">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h1 class="text-3xl sm:text-4xl font-bold mb-2">
                  {getGreeting()}, {$userStore.username}! 👋
                </h1>
                <p class="text-lg opacity-90 mb-4">
                  Ready to hunt some bugs today? Let's level up your skills!
                </p>
                <div class="flex items-center space-x-4 text-sm opacity-80">
                  <span>Last updated: {getTimeAgo(lastUpdateTime)}</span>
                  <div class="flex items-center space-x-1">
                    <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Live</span>
                  </div>
                </div>
              </div>
              <div class="mt-4 sm:mt-0 flex-shrink-0">
                <div class="text-center">
                  <div class="text-3xl font-bold">Level {$userProgress.level}</div>
                  <div class="text-sm opacity-80">Current Level</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Animated Background Elements -->
          <div class="absolute inset-0 overflow-hidden">
            <div class="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-bounce-subtle" style="animation-delay: 0s;"></div>
            <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full animate-bounce-subtle" style="animation-delay: 2s;"></div>
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/5 rounded-full animate-bounce-subtle" style="animation-delay: 4s;"></div>
          </div>
        </div>

        <!-- Stats Grid with Real-time Updates -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- XP Card -->
          <div class="stat-card hover:scale-105 transition-transform duration-300 {animateStats ? 'animate-success-pulse' : ''}">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900 dark:text-white update-indicator">{$userStore.totalXP}</div>
                <div class="text-xs text-green-600 dark:text-green-400 font-medium">+{todayXP} today</div>
              </div>
            </div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total XP</h3>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                style="width: {$userProgress.percentage}%"
              ></div>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {$userProgress.currentLevelXP}/{$userProgress.xpPerLevel} to Level {$userProgress.level + 1}
            </div>
          </div>

          <!-- Progress Card -->
          <div class="stat-card hover:scale-105 transition-transform duration-300">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{completedTasks}/{totalTasks}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{Math.round((completedTasks / totalTasks) * 100)}% complete</div>
              </div>
            </div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Tasks Progress</h3>
            <div class="progress-bar">
              <div 
                class="progress-fill bg-gradient-to-r from-green-500 to-emerald-500"
                style="width: {(completedTasks / totalTasks) * 100}%"
              ></div>
            </div>
          </div>

          <!-- Bugs Found Card -->
          <div class="stat-card hover:scale-105 transition-transform duration-300">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{$userStore.bugsFound || 0}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">vulnerabilities</div>
              </div>
            </div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Bugs Found</h3>
          </div>

          <!-- Earnings Card -->
          <div class="stat-card hover:scale-105 transition-transform duration-300">
            <div class="flex items-center justify-between mb-4">
              <div class="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">${$userStore.totalBounty || 0}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">total earned</div>
              </div>
            </div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Bounty Earnings</h3>
          </div>
        </div>

        <!-- Current Phase Card -->
        <div class="card p-6 hover:shadow-xl transition-all duration-300">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-1">Current Learning Phase</h2>
                <span class={`badge ${getPhaseColor($userStore.currentPhase)} text-lg px-4 py-2`}>
                  {$userStore.currentPhase.charAt(0).toUpperCase() + $userStore.currentPhase.slice(1)} Hunter
                </span>
                <p class="mt-2 text-gray-600 dark:text-gray-400">
                  {#if $userStore.currentPhase === 'beginner'}
                    🌱 You're building strong foundations. Every expert was once a beginner!
                  {:else if $userStore.currentPhase === 'intermediate'}
                    🚀 Great progress! You're developing advanced skills and finding real vulnerabilities.
                  {:else}
                    👑 Elite hunter status! You're among the top security researchers.
                  {/if}
                </p>
              </div>
            </div>
            <div class="mt-4 sm:mt-0">
              <a href="/roadmap" class="btn btn-primary">
                View Roadmap
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4 4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Recent Activity Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Recent Journal Entries -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Journal</h2>
              </div>
              <a href="/journal" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 text-sm font-medium flex items-center">
                View all
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4 4H3" />
                </svg>
              </a>
            </div>
            
            {#if recentJournalEntries.length > 0}
              <div class="space-y-4">
                {#each recentJournalEntries as entry, index}
                  <div class="group p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all duration-300 card-interactive" style="animation-delay: {index * 100}ms;">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {entry.title}
                        </h3>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {entry.content.substring(0, 100)}{entry.content.length > 100 ? '...' : ''}
                        </p>
                        <div class="flex items-center space-x-3 mt-2">
                          <span class="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(entry.date)}
                          </span>
                          {#if entry.mood}
                            <span class="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                              {entry.mood === 'great' ? '😄' : entry.mood === 'good' ? '🙂' : entry.mood === 'okay' ? '😐' : '😔'}
                              {entry.mood}
                            </span>
                          {/if}
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="text-center py-12">
                <div class="w-16 h-16 mx-auto mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <svg class="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No journal entries yet</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-4">Start documenting your learning journey!</p>
                <a href="/journal" class="btn btn-primary">
                  Write First Entry
                </a>
              </div>
            {/if}
          </div>

          <!-- Recent Bugs -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg text-white">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Bugs</h2>
              </div>
              <a href="/bugs" class="text-red-600 dark:text-red-400 hover:text-red-500 text-sm font-medium flex items-center">
                View all
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4 4H3" />
                </svg>
              </a>
            </div>
            
            {#if recentBugs.length > 0}
              <div class="space-y-4">
                {#each recentBugs as bug, index}
                  <div class="group p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-300 dark:hover:border-red-600 hover:shadow-md transition-all duration-300 card-interactive" style="animation-delay: {index * 100}ms;">
                    <div class="flex items-center justify-between mb-2">
                      <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {bug.type}
                      </h3>
                      <span class={`badge ${getSeverityColor(bug.severity)}`}>
                        {bug.severity}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{bug.program}</p>
                    <div class="flex items-center justify-between">
                      <span class="text-lg font-bold text-green-600 dark:text-green-400">${bug.bounty}</span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(bug.dateFound)}
                      </span>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="text-center py-12">
                <div class="w-16 h-16 mx-auto mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <svg class="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No bugs reported yet</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-4">Start hunting and reporting vulnerabilities!</p>
                <a href="/bugs" class="btn btn-primary">
                  Report First Bug
                </a>
              </div>
            {/if}
          </div>
        </div>

        <!-- Quick Actions Section -->
        <div class="card p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <div class="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg text-white mr-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            Quick Actions
          </h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Continue Tasks -->
            <a href="/tasks" class="group card p-6 hover:shadow-lg transition-all duration-300 card-interactive text-center">
              <div class="w-12 h-12 mx-auto mb-4 p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Continue Learning
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Complete your next task</p>
            </a>
            
            <!-- Write Journal -->
            <a href="/journal" class="group card p-6 hover:shadow-lg transition-all duration-300 card-interactive text-center">
              <div class="w-12 h-12 mx-auto mb-4 p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Document Progress
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Write a journal entry</p>
            </a>
            
            <!-- Report Bug -->
            <a href="/bugs" class="group card p-6 hover:shadow-lg transition-all duration-300 card-interactive text-center">
              <div class="w-12 h-12 mx-auto mb-4 p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl text-white group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                Report Bug
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Add a new finding</p>
            </a>
            
            <!-- View Roadmap -->
            <a href="/roadmap" class="group card p-6 hover:shadow-lg transition-all duration-300 card-interactive text-center">
              <div class="w-12 h-12 mx-auto mb-4 p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl text-white group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                Study Roadmap
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Plan your learning</p>
            </a>
          </div>
        </div>

        <!-- Motivational Footer -->
        <div class="text-center py-8">
          <div class="max-w-2xl mx-auto">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🎯 Keep pushing forward!
            </h3>
            <p class="text-gray-600 dark:text-gray-400 text-lg">
              Every bug you find, every skill you learn, and every challenge you overcome brings you closer to becoming an elite security researcher.
            </p>
            <div class="mt-6 flex justify-center space-x-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{Math.round((completedTasks / totalTasks) * 100)}%</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Progress</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">{$userProgress.level}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Level</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{$userStore.bugsFound || 0}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Bugs Found</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>