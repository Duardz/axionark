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

  // Stats
  let totalTasks = 0;
  let completedTasks = 0;
  let recentJournalEntries: any[] = [];
  let recentBugs: any[] = [];

  onMount(() => {
    const unsubscribe = authStore.subscribe(async (authUser) => {
      if (!authUser) {
        goto('/');
        return;
      }
      
      user = authUser;
      
      // Load user data
      await userStore.loadProfile(authUser.uid);
      const entries = await journalStore.loadEntries(authUser.uid);
      const bugs = await bugStore.loadBugs(authUser.uid);
      
      // Calculate total tasks
      totalTasks = roadmapData.reduce((total, phase) => {
        return total + phase.categories.reduce((catTotal, category) => {
          return catTotal + category.tasks.length;
        }, 0);
      }, 0);
      
      // Get recent items
      recentJournalEntries = entries ? entries.slice(0, 3) : [];
      recentBugs = bugs ? bugs.slice(0, 3) : [];
      
      loading = false;
    });

    return unsubscribe;
  });

  $: if ($userStore) {
    completedTasks = $userStore.completedTasks.length;
  }

  function getPhaseColor(phase: string) {
    switch (phase) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<Navbar />

<div class="container mx-auto px-4 py-8 max-w-7xl">
  {#if loading}
    <div class="flex justify-center items-center h-64">
      <div class="spinner"></div>
    </div>
  {:else if $userStore}
    <div class="animate-fade-in">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {$userStore.username}! 👋
        </h1>
        <p class="text-gray-600">
          Keep pushing forward on your bug bounty journey.
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- XP Card -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-600">Total XP</h3>
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p class="text-2xl font-bold text-gray-900">{$userStore.totalXP}</p>
          <div class="mt-2">
            <div class="text-sm text-gray-600">Level {$userProgress.level}</div>
            <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                class="bg-blue-600 h-2 rounded-full progress-fill"
                style="width: {$userProgress.percentage}%"
              ></div>
            </div>
          </div>
        </div>

        <!-- Progress Card -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-600">Progress</h3>
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-2xl font-bold text-gray-900">{completedTasks}/{totalTasks}</p>
          <div class="mt-2 text-sm text-gray-600">
            Tasks completed ({Math.round((completedTasks / totalTasks) * 100)}%)
          </div>
        </div>

        <!-- Bugs Found Card -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-600">Bugs Found</h3>
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="text-2xl font-bold text-gray-900">{$userStore.bugsFound || 0}</p>
          <div class="mt-2 text-sm text-gray-600">Total vulnerabilities</div>
        </div>

        <!-- Earnings Card -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-600">Total Earnings</h3>
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-2xl font-bold text-gray-900">${$userStore.totalBounty || 0}</p>
          <div class="mt-2 text-sm text-gray-600">From bug bounties</div>
        </div>
      </div>

      <!-- Current Phase -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Current Phase</h2>
        <div class="flex items-center justify-between">
          <div>
            <span class={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPhaseColor($userStore.currentPhase)}`}>
              {$userStore.currentPhase.charAt(0).toUpperCase() + $userStore.currentPhase.slice(1)} Hunter
            </span>
            <p class="mt-2 text-gray-600">
              {#if $userStore.currentPhase === 'beginner'}
                You're learning the fundamentals. Keep practicing!
              {:else if $userStore.currentPhase === 'intermediate'}
                Great progress! You're developing advanced skills.
              {:else}
                Elite hunter status! You're among the best.
              {/if}
            </p>
          </div>
          <a href="/roadmap" class="text-blue-600 hover:text-blue-500 font-medium">
            View Roadmap →
          </a>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Journal Entries -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Recent Journal</h2>
            <a href="/journal" class="text-blue-600 hover:text-blue-500 text-sm font-medium">
              View all →
            </a>
          </div>
          {#if recentJournalEntries.length > 0}
            <div class="space-y-3">
              {#each recentJournalEntries as entry}
                <div class="border-l-4 border-blue-400 pl-4 py-2">
                  <h3 class="font-medium text-gray-900">{entry.title}</h3>
                  <p class="text-sm text-gray-600 mt-1 line-clamp-2">{entry.content}</p>
                  <p class="text-xs text-gray-500 mt-1">
                    {new Date(entry.date.seconds * 1000).toLocaleDateString()}
                  </p>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-gray-500 text-center py-8">
              No journal entries yet. Start documenting your journey!
            </p>
          {/if}
        </div>

        <!-- Recent Bugs -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Recent Bugs</h2>
            <a href="/bugs" class="text-blue-600 hover:text-blue-500 text-sm font-medium">
              View all →
            </a>
          </div>
          {#if recentBugs.length > 0}
            <div class="space-y-3">
              {#each recentBugs as bug}
                <div class="border rounded-lg p-3">
                  <div class="flex items-center justify-between">
                    <h3 class="font-medium text-gray-900">{bug.type}</h3>
                    <span class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(bug.severity)}`}>
                      {bug.severity}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mt-1">{bug.program}</p>
                  <p class="text-sm font-medium text-green-600 mt-1">${bug.bounty}</p>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-gray-500 text-center py-8">
              No bugs reported yet. Happy hunting!
            </p>
          {/if}
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/tasks" class="bg-white rounded-lg p-4 hover:shadow-md transition-shadow text-center">
            <svg class="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span class="text-sm font-medium text-gray-900">Continue Tasks</span>
          </a>
          
          <a href="/journal" class="bg-white rounded-lg p-4 hover:shadow-md transition-shadow text-center">
            <svg class="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span class="text-sm font-medium text-gray-900">Write Journal</span>
          </a>
          
          <a href="/bugs" class="bg-white rounded-lg p-4 hover:shadow-md transition-shadow text-center">
            <svg class="w-8 h-8 text-red-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="text-sm font-medium text-gray-900">Report Bug</span>
          </a>
          
          <a href="/roadmap" class="bg-white rounded-lg p-4 hover:shadow-md transition-shadow text-center">
            <svg class="w-8 h-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span class="text-sm font-medium text-gray-900">View Roadmap</span>
          </a>
        </div>
      </div>
    </div>
  {/if}
</div>