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
  let weeklyProgress = 0;
  let currentStreak = 0;
  let upcomingTasks: any[] = [];

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
      
      // Don't reset stores - just load data if needed
      // Removed: userStore.reset();
      // Removed: journalStore.reset();
      // Removed: bugStore.reset();
      
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
      // Don't cleanup stores here - keep data persistent
    };
  });

  async function loadDashboardData(uid: string) {
    try {
      // Load all user data (will use cached data if already loaded)
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
      
      // Calculate upcoming tasks
      calculateUpcomingTasks();
      
      // Calculate weekly progress
      weeklyProgress = Math.min(100, (completedTasks / 7) * 100); // Replace with actual logic
      
      // Calculate streak
      currentStreak = calculateStreak(entries);
      
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

  function calculateUpcomingTasks() {
    if (!$userStore) return;
    
    const incompleteTasks: any[] = [];
    roadmapData.forEach(phase => {
      phase.categories.forEach(category => {
        category.tasks.forEach(task => {
          if (!$userStore!.completedTasks.includes(task.id)) {
            incompleteTasks.push({
              ...task,
              phaseId: phase.id,
              phaseTitle: phase.title,
              categoryTitle: category.title
            });
          }
        });
      });
    });
    
    upcomingTasks = incompleteTasks.slice(0, 3);
  }

  function calculateStreak(entries: any[]): number {
    if (!entries || entries.length === 0) return 0;
    
    const sortedEntries = [...entries].sort((a, b) => {
      const dateA = firebaseTimestampToDate(a.date).getTime();
      const dateB = firebaseTimestampToDate(b.date).getTime();
      return dateB - dateA;
    });
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = firebaseTimestampToDate(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  function firebaseTimestampToDate(timestamp: any): Date {
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp);
  }

  $: if ($userStore) {
    completedTasks = $userStore.completedTasks.length;
  }

  function getPhaseConfig(phase: string) {
    const configs: Record<string, {
      gradient: string;
      badge: string;
      icon: string;
      color: string;
    }> = {
      beginner: {
        gradient: 'from-emerald-500 to-green-600',
        badge: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        icon: '🌱',
        color: 'text-emerald-600 dark:text-emerald-400'
      },
      intermediate: {
        gradient: 'from-blue-500 to-indigo-600',
        badge: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        icon: '🚀',
        color: 'text-blue-600 dark:text-blue-400'
      },
      advanced: {
        gradient: 'from-purple-500 to-pink-600',
        badge: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        icon: '⚡',
        color: 'text-purple-600 dark:text-purple-400'
      }
    };
    return configs[phase] || configs.beginner;
  }

  function getSeverityConfig(severity: string) {
    const configs: Record<string, {
      color: string;
      bg: string;
      icon: string;
    }> = {
      critical: {
        color: 'text-red-700 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        icon: '🔴'
      },
      high: {
        color: 'text-orange-700 dark:text-orange-400',
        bg: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        icon: '🟠'
      },
      medium: {
        color: 'text-yellow-700 dark:text-yellow-400',
        bg: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        icon: '🟡'
      },
      low: {
        color: 'text-green-700 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        icon: '🟢'
      }
    };
    return configs[severity] || configs.low;
  }

  function formatDate(date: any) {
    return firebaseTimestampToDate(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
    return { text: 'Good evening', emoji: '🌙' };
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

  function getMoodEmoji(mood: string) {
    const moods: Record<string, string> = {
      great: '😄',
      good: '🙂',
      okay: '😐',
      bad: '😔'
    };
    return moods[mood] || '🙂';
  }
</script>

<Navbar />

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  {#if loading}
    <div class="flex justify-center items-center h-screen">
      <div class="text-center">
        <div class="spinner w-16 h-16 mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
      </div>
    </div>
  {:else if $userStore}
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <div class="absolute inset-0">
        <div class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style="animation-delay: 0s;"></div>
        <div class="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" style="animation-delay: 2s;"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-float" style="animation-delay: 4s;"></div>
      </div>
      
      <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-white">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div class="flex-1">
              <h1 class="text-4xl sm:text-5xl font-bold mb-3 animate-fade-in">
                {getGreeting().text}, {$userStore.username}! {getGreeting().emoji}
              </h1>
              <p class="text-xl opacity-90 mb-6">
                Ready to level up your bug hunting skills today?
              </p>
              
              <!-- Quick Stats Pills -->
              <div class="flex flex-wrap gap-3">
                <div class="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                  <span class="font-semibold">{currentStreak} day streak</span>
                </div>
                <div class="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span class="font-semibold">Level {$userProgress.level}</span>
                </div>
                <div class="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                  <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span class="text-sm">Live Dashboard</span>
                </div>
              </div>
            </div>
            
            <!-- Level Progress Circle -->
            <div class="flex-shrink-0">
              <div class="relative w-40 h-40">
                <svg class="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    class="text-white/20"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-dasharray="{$userProgress.percentage}, 100"
                    class="text-white transition-all duration-1000"
                  />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <div class="text-3xl font-bold">Level</div>
                  <div class="text-5xl font-bold">{$userProgress.level}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Main Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- XP Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 {animateStats ? 'animate-pulse-once' : ''}">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{$userStore.totalXP}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Total XP</div>
          <div class="mt-3">
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Level {$userProgress.level}</span>
              <span>{$userProgress.percentage}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                class="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                style="width: {$userProgress.percentage}%"
              ></div>
            </div>
          </div>
        </div>

        <!-- Tasks Progress Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {Math.round((completedTasks / totalTasks) * 100)}%
            </div>
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{completedTasks}/{totalTasks}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
          <div class="mt-3">
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                class="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                style="width: {(completedTasks / totalTasks) * 100}%"
              ></div>
            </div>
          </div>
        </div>

        <!-- Bugs Found Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            {#if ($userStore.bugsFound || 0) > 0}
              <div class="text-xs font-medium text-red-600 dark:text-red-400">
                🔥 Active Hunter
              </div>
            {/if}
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{$userStore.bugsFound || 0}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Bugs Found</div>
        </div>

        <!-- Earnings Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {#if ($userStore.totalBounty || 0) > 0}
              <div class="text-xs font-medium text-green-600 dark:text-green-400">
                💰 Earning
              </div>
            {/if}
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white mb-1">${$userStore.totalBounty || 0}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Total Earnings</div>
        </div>
      </div>

      <!-- Current Phase & Upcoming Tasks -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Current Phase Card -->
        <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div class="bg-gradient-to-r {getPhaseConfig($userStore.currentPhase).gradient} p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold mb-2">Current Learning Phase</h2>
                <div class="flex items-center gap-3">
                  <span class="text-4xl">{getPhaseConfig($userStore.currentPhase).icon}</span>
                  <div>
                    <div class="text-3xl font-bold capitalize">{$userStore.currentPhase} Hunter</div>
                    <p class="opacity-90">
                      {#if $userStore.currentPhase === 'beginner'}
                        Building strong foundations for your journey
                      {:else if $userStore.currentPhase === 'intermediate'}
                        Developing advanced skills and techniques
                      {:else}
                        Mastering elite-level security research
                      {/if}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Upcoming Tasks</h3>
            {#if upcomingTasks.length > 0}
              <div class="space-y-3">
                {#each upcomingTasks as task}
                  <a href="/tasks?task={task.id}" class="block p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <h4 class="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                        <div class="flex items-center gap-3 mt-1 text-sm">
                          <span class="text-gray-500 dark:text-gray-400">{task.categoryTitle}</span>
                          <span class="text-indigo-600 dark:text-indigo-400 font-medium">+{task.xp} XP</span>
                        </div>
                      </div>
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                {/each}
              </div>
            {:else}
              <p class="text-gray-500 dark:text-gray-400 text-center py-8">
                All tasks completed! You're a true master! 🎉
              </p>
            {/if}
            
            <div class="mt-6 text-center">
              <a href="/tasks" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all">
                View All Tasks
                <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          
          <div class="space-y-3">
            <a href="/journal" class="group flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all">
              <div class="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div class="ml-4 flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Write Journal Entry</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Document today's progress</p>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
            
            <a href="/bugs" class="group flex items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 transition-all">
              <div class="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg text-white group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="ml-4 flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400">Report New Bug</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Add vulnerability finding</p>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
            
            <a href="/roadmap" class="group flex items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-900/30 dark:hover:to-green-900/30 transition-all">
              <div class="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg text-white group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div class="ml-4 flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">View Roadmap</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Plan your journey</p>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Journal Entries -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <span class="text-2xl mr-3">📔</span>
              Recent Journal Entries
            </h2>
            <a href="/journal" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium">
              View all →
            </a>
          </div>
          
          {#if recentJournalEntries.length > 0}
            <div class="space-y-4">
              {#each recentJournalEntries as entry}
                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                  <div class="flex items-start justify-between mb-2">
                    <h3 class="font-semibold text-gray-900 dark:text-white flex-1 pr-3">
                      {entry.title}
                    </h3>
                    {#if entry.mood}
                      <span class="text-xl">{getMoodEmoji(entry.mood)}</span>
                    {/if}
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {entry.content}
                  </p>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-500 dark:text-gray-400">{formatDate(entry.date)}</span>
                    {#if entry.tags && Array.isArray(entry.tags) && entry.tags.length > 0}
                      <div class="flex gap-1">
                        {#each entry.tags.slice(0, 2) as tag}
                          <span class="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-full">
                            #{tag}
                          </span>
                        {/each}
                        {#if entry.tags.length > 2}
                          <span class="px-2 py-1 text-gray-500 dark:text-gray-400">
                            +{entry.tags.length - 2}
                          </span>
                        {/if}
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-8">
              <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p class="text-gray-500 dark:text-gray-400 mb-4">Start documenting your journey!</p>
              <a href="/journal" class="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300">
                Write your first entry →
              </a>
            </div>
          {/if}
        </div>

        <!-- Recent Bugs -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <span class="text-2xl mr-3">🐛</span>
              Recent Findings
            </h2>
            <a href="/bugs" class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium">
              View all →
            </a>
          </div>
          
          {#if recentBugs.length > 0}
            <div class="space-y-4">
              {#each recentBugs as bug}
                <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <h3 class="font-semibold text-gray-900 dark:text-white">{bug.type}</h3>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{bug.program}</p>
                    </div>
                    <span class={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityConfig(bug.severity).bg} border`}>
                      {getSeverityConfig(bug.severity).icon} {bug.severity}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xl font-bold text-green-600 dark:text-green-400">${bug.bounty}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{formatDate(bug.dateFound)}</span>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-8">
              <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p class="text-gray-500 dark:text-gray-400 mb-4">No bugs reported yet!</p>
              <a href="/bugs" class="text-red-600 dark:text-red-400 font-medium hover:text-red-700 dark:hover:text-red-300">
                Report your first bug →
              </a>
            </div>
          {/if}
        </div>
      </div>

      <!-- Motivational Footer -->
      <div class="mt-12 text-center">
        <div class="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-pink-900/10 rounded-3xl p-8 border border-indigo-200 dark:border-indigo-800">
          <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Keep pushing forward! 🚀
          </h3>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Every day is a new opportunity to learn, grow, and discover. Your journey to becoming an elite security researcher continues!
          </p>
          
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div class="text-center">
              <div class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {Math.round((completedTasks / totalTasks) * 100)}%
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Progress</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {$userProgress.level}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Level</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                {$userStore.bugsFound || 0}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Bugs</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {currentStreak}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Streak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  @keyframes float {
    0%, 100% {
      transform: translateY(0) translateX(0);
    }
    25% {
      transform: translateY(-20px) translateX(10px);
    }
    50% {
      transform: translateY(10px) translateX(-10px);
    }
    75% {
      transform: translateY(-10px) translateX(5px);
    }
  }
  
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse-once {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  .animate-float {
    animation: float 20s ease-in-out infinite;
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out;
  }
  
  .animate-pulse-once {
    animation: pulse-once 0.6s ease-out;
  }
  
  .spinner {
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>