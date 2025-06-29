<!-- src/routes/dashboard/+page.svelte - Fixed Text Overflow Version -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { userStore, journalStore, bugStore, userProgress } from '$lib/stores/user';
  import Navbar from '$lib/components/Navbar.svelte';
  import { roadmapData } from '$lib/data/roadmap';
  import type { Task } from '$lib/data/roadmap';
  import { firebaseTimestampToDate } from '$lib/utils/security';

  let currentUser: any = null;
  let loading = false;
  let showNewUserWelcome = false;

  // Store unsubscribe function
  let authUnsubscribe: (() => void) | null = null;

  // Reactive statements
  $: completedTaskIds = $userStore?.completedTasks || [];
  $: totalCompletedTasks = completedTaskIds.length;
  $: totalTasks = roadmapData.reduce((acc, phase) => 
    acc + phase.categories.reduce((catAcc, cat) => catAcc + cat.tasks.length, 0), 0
  );
  
  $: completionPercentage = totalTasks > 0 
    ? Math.round((totalCompletedTasks / totalTasks) * 100) 
    : 0;

  $: recentJournalEntries = $journalStore?.slice(0, 3) || [];
  $: recentBugs = $bugStore?.slice(0, 3) || [];

  onMount(() => {
    const unsubscribeAuth = authStore.subscribe(async (user) => {
      if (!user) {
        goto('/');
        return;
      }
      
      if (!currentUser) {
        currentUser = user;
        loading = true;
        
        try {
          await userStore.loadProfile(user.uid);
          await journalStore.loadEntries(user.uid);
          await bugStore.loadBugs(user.uid);
          
          // Check if new user
          if (!$userStore || $userStore.totalXP === 0) {
            showNewUserWelcome = true;
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          loading = false;
        }
      }
    });
    
    authUnsubscribe = unsubscribeAuth;

    return () => {
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    };
  });

  function getPhaseProgress(phaseId: string) {
    const phase = roadmapData.find(p => p.id === phaseId);
    if (!phase) return 0;
    
    const phaseTasks = phase.categories.reduce((acc, cat) => acc + cat.tasks.length, 0);
    const completedPhaseTasks = phase.categories.reduce((acc, cat) => 
      acc + cat.tasks.filter(task => completedTaskIds.includes(task.id)).length, 0
    );
    
    return phaseTasks > 0 ? Math.round((completedPhaseTasks / phaseTasks) * 100) : 0;
  }

  function getCurrentPhase() {
    for (const phase of roadmapData) {
      const progress = getPhaseProgress(phase.id);
      if (progress < 100) return phase.id;
    }
    return 'elite';
  }

  function getNextTasks() {
    const tasks: Task[] = [];
    for (const phase of roadmapData) {
      for (const category of phase.categories) {
        for (const task of category.tasks) {
          if (!completedTaskIds.includes(task.id)) {
            tasks.push(task);
            if (tasks.length >= 3) return tasks;
          }
        }
      }
    }
    return tasks;
  }

  function getMoodEmoji(mood?: string) {
    const moods: Record<string, string> = {
      great: '😄',
      good: '🙂',
      okay: '😐',
      bad: '😔'
    };
    return moods[mood || 'good'];
  }

  function getSeverityConfig(severity: string) {
    const configs: Record<string, { emoji: string; color: string }> = {
      critical: { emoji: '🔴', color: 'text-red-600 dark:text-red-400' },
      high: { emoji: '🟠', color: 'text-orange-600 dark:text-orange-400' },
      medium: { emoji: '🟡', color: 'text-yellow-600 dark:text-yellow-400' },
      low: { emoji: '🟢', color: 'text-green-600 dark:text-green-400' }
    };
    return configs[severity] || configs.medium;
  }

  function formatDate(date: any) {
    return firebaseTimestampToDate(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  function getGreeting() {
    const timeOfDay = getTimeOfDay();
    const greetings = {
      morning: '🌅 Good morning',
      afternoon: '☀️ Good afternoon',
      evening: '🌙 Good evening'
    };
    return greetings[timeOfDay];
  }

  function closeWelcome() {
    showNewUserWelcome = false;
  }

  // Helper function to truncate text
  function truncateText(text: string, maxLength: number = 50) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  // Helper function to format large numbers
  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return '$' + (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return '$' + (num / 1000).toFixed(1) + 'K';
    }
    return '$' + num.toLocaleString();
  }

  $: nextTasks = getNextTasks();
  $: currentPhaseId = getCurrentPhase();
</script>

<Navbar />

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  <!-- New User Welcome Modal -->
  {#if showNewUserWelcome}
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl animate-scale-in">
        <div class="text-center">
          <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center animate-bounce-subtle">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Your Bug Hunting Journey! 🎯
          </h2>
          
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            You're about to embark on an exciting adventure in ethical hacking. 
            Let's get you started on the right path!
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <div class="text-3xl mb-3">📚</div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Learn & Practice</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Follow our structured roadmap from basics to advanced techniques
              </p>
            </div>
            
            <div class="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <div class="text-3xl mb-3">📝</div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Document Progress</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Keep a journal of your learning journey and discoveries
              </p>
            </div>
            
            <div class="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
              <div class="text-3xl mb-3">🐛</div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Track Findings</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Record and analyze your bug bounty submissions
              </p>
            </div>
          </div>
          
          <button
            on:click={closeWelcome}
            class="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Start My Journey
          </button>
        </div>
      </div>
    </div>
  {/if}

  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div class="spinner w-12 h-12"></div>
      </div>
    {:else if $userStore}
      <!-- Greeting Header -->
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {getGreeting()}, <span class="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{$userStore.username}</span>!
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Ready to level up your skills today? Your dedication is paying off! 🚀
        </p>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Level & XP -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-gray-900 dark:text-white">
                {$userProgress.level}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Level</div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Progress</span>
              <span class="font-medium text-gray-900 dark:text-white">{$userStore.totalXP} XP</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                class="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style="width: {$userProgress.percentage}%"
              ></div>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 text-right">
              {$userProgress.xpPerLevel - $userProgress.currentLevelXP} XP to next level
            </div>
          </div>
        </div>

        <!-- Tasks Progress -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-gray-900 dark:text-white">
                {totalCompletedTasks}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Tasks Done</div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Total Progress</span>
              <span class="font-medium text-emerald-600 dark:text-emerald-400">{completionPercentage}%</span>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {totalTasks - totalCompletedTasks} tasks remaining
            </div>
          </div>
        </div>

        <!-- Bug Bounty Stats -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-gray-900 dark:text-white">
                {$userStore.bugsFound || 0}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Bugs Found</div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Total Bounty</span>
              <span class="font-medium text-green-600 dark:text-green-400">
                {formatNumber($userStore.totalBounty || 0)}
              </span>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Keep hunting! 🎯
            </div>
          </div>
        </div>

        <!-- Journal Entries -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold text-gray-900 dark:text-white">
                {$journalStore?.length || 0}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Entries</div>
            </div>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Document your journey 📝
          </div>
        </div>
      </div>

      <!-- Current Phase Progress -->
      <div class="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-3xl p-8 mb-8 text-white shadow-xl">
        <h2 class="text-2xl font-bold mb-6">📈 Your Learning Path</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Phase Progress -->
          <div>
            <h3 class="text-lg font-medium mb-4 opacity-90">Phase Progress</h3>
            <div class="space-y-4">
              {#each roadmapData.slice(0, 3) as phase}
                {@const progress = getPhaseProgress(phase.id)}
                <div>
                  <div class="flex justify-between text-sm mb-2">
                    <span class="font-medium">{phase.title}</span>
                    <span class="opacity-90">{progress}%</span>
                  </div>
                  <div class="w-full bg-white/20 rounded-full h-3">
                    <div 
                      class="bg-white h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                      style="width: {progress}%"
                    >
                      <div class="absolute inset-0 bg-white/30 animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
          
          <!-- Next Tasks -->
          <div>
            <h3 class="text-lg font-medium mb-4 opacity-90">🎯 Next Up</h3>
            <div class="space-y-3">
              {#each nextTasks as task}
                <a 
                  href="/roadmap" 
                  class="block bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all group"
                >
                  <h4 class="font-semibold mb-1 group-hover:translate-x-1 transition-transform truncate">
                    {truncateText(task.title, 40)}
                  </h4>
                  <div class="flex items-center justify-between">
                    <span class="text-sm opacity-75">{task.xp} XP</span>
                    <span class="text-xs bg-white/20 px-3 py-1 rounded-full">
                      {task.phase}
                    </span>
                  </div>
                </a>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Journal Entries -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <span class="text-2xl mr-3">📔</span>
                Recent Journal Entries
              </h2>
              <a 
                href="/journal" 
                class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center group"
              >
                View all
                <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
          
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            {#if recentJournalEntries.length > 0}
              {#each recentJournalEntries as entry}
                <a 
                  href="/journal" 
                  class="block p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h3 class="font-semibold text-gray-900 dark:text-white mb-2 truncate" title={entry.title}>
                    {truncateText(entry.title, 50)}
                  </h3>
                  <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    {#if entry.mood}
                      <span>{getMoodEmoji(entry.mood)}</span>
                    {/if}
                    <p class="flex-1 truncate" title={entry.content}>
                      {truncateText(entry.content, 60)}
                    </p>
                  </div>
                  <div class="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-500">
                    <span>{formatDate(entry.date)}</span>
                    {#if entry.tags && Array.isArray(entry.tags) && entry.tags.length > 0}
                      <span class="truncate" title={entry.tags.join(', ')}>
                        #{truncateText(entry.tags[0], 15)}
                        {#if entry.tags.length > 1}
                          <span class="text-gray-400"> +{entry.tags.length - 1}</span>
                        {/if}
                      </span>
                    {/if}
                  </div>
                </a>
              {/each}
            {:else}
              <div class="p-12 text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p class="text-gray-500 dark:text-gray-400 mb-4">No journal entries yet</p>
                <a 
                  href="/journal" 
                  class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  Write your first entry
                </a>
              </div>
            {/if}
          </div>
        </div>

        <!-- Recent Bug Findings -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <span class="text-2xl mr-3">🐛</span>
                Recent Findings
              </h2>
              <a 
                href="/bugs" 
                class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center group"
              >
                View all
                <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
          
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            {#if recentBugs.length > 0}
              {#each recentBugs as bug}
                {@const severityConfig = getSeverityConfig(bug.severity)}
                <a 
                  href="/bugs" 
                  class="block p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div class="flex items-start justify-between mb-2">
                    <h3 class="font-semibold text-gray-900 dark:text-white truncate flex-1 mr-2" title={bug.type}>
                      {truncateText(bug.type, 40)}
                    </h3>
                    <span class={`flex items-center text-sm font-medium ${severityConfig.color}`}>
                      {severityConfig.emoji} {bug.severity}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate" title={bug.program}>
                    {truncateText(bug.program, 50)}
                  </p>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-green-600 dark:text-green-400 font-semibold">
                      {formatNumber(bug.bounty)}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-500">
                      {formatDate(bug.dateFound)}
                    </span>
                  </div>
                </a>
              {/each}
            {:else}
              <div class="p-12 text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="text-gray-500 dark:text-gray-400 mb-4">No bugs reported yet</p>
                <a 
                  href="/bugs" 
                  class="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Report your first bug
                </a>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-6">⚡ Quick Actions</h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a 
            href="/roadmap" 
            class="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all group"
          >
            <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Continue Learning</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">View your roadmap</p>
          </a>
          
          <a 
            href="/journal" 
            class="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all group"
          >
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Write Entry</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Journal today's progress</p>
          </a>
          
          <a 
            href="/bugs" 
            class="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all group"
          >
            <div class="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Report Bug</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Track new finding</p>
          </a>
          
          <a 
            href="/tasks" 
            class="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all group"
          >
            <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">View Tasks</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Check progress</p>
          </a>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .animate-shimmer {
    animation: shimmer 2s linear infinite;
  }
  
  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animate-scale-in {
    animation: scale-in 0.2s ease-out;
  }
  
  @keyframes bounce-subtle {
    0%, 20%, 53%, 80%, 100% {
      transform: translateY(0);
    }
    40%, 43% {
      transform: translateY(-8px);
    }
    70% {
      transform: translateY(-4px);
    }
    90% {
      transform: translateY(-2px);
    }
  }
  
  .animate-bounce-subtle {
    animation: bounce-subtle 2s infinite;
  }
  
  .spinner {
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>