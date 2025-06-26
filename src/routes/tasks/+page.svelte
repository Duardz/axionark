<!-- src/routes/tasks/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { userStore, userProgress } from '$lib/stores/user';
  import { roadmapData } from '$lib/data/roadmap';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import type { Task } from '$lib/data/roadmap';

  let loading = false;
  let selectedCategory = 'all';
  let selectedPhase = 'all';
  let showCompleted = true;
  let currentUser: any = null;
  let searchQuery = '';
  let processingTasks = new Set<string>();
  let recentlyCompleted = new Set<string>();
  let showSuccessToast = false;
  let lastCompletedTask: Task | null = null;
  let toastMessage = '';
  let viewMode: 'grid' | 'list' = 'list';

  // Real-time stats
  let totalXPEarned = 0;

  onMount(() => {
    const unsubscribe = authStore.subscribe(async (user) => {
      if (!user) {
        goto('/');
        return;
      }
      currentUser = user;
      await userStore.loadProfile(user.uid);
      calculateStats();
    });

    // Check URL params
    const urlParams = new URLSearchParams(window.location.search);
    const phaseParam = urlParams.get('phase');
    const taskParam = urlParams.get('task');
    
    if (phaseParam) {
      selectedPhase = phaseParam;
    }
    
    if (taskParam) {
      // Scroll to specific task
      setTimeout(() => {
        const taskElement = document.getElementById(`task-${taskParam}`);
        if (taskElement) {
          taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          taskElement.classList.add('highlight-task');
          setTimeout(() => taskElement.classList.remove('highlight-task'), 2000);
        }
      }, 500);
    }

    return () => {
      unsubscribe();
      userStore.cleanup();
    };
  });

  function calculateStats() {
    if (!$userStore) return;
    totalXPEarned = $userStore.totalXP;
  }

  async function completeTask(task: Task) {
    if (!currentUser || !$userStore || processingTasks.has(task.id)) return;
    
    processingTasks.add(task.id);
    processingTasks = processingTasks;
    
    try {
      await userStore.completeTask(currentUser.uid, task.id, task.xp);
      
      recentlyCompleted.add(task.id);
      recentlyCompleted = recentlyCompleted;
      lastCompletedTask = task;
      
      toastMessage = `Task Completed! 🎉 +${task.xp} XP earned`;
      showSuccessToast = true;
      setTimeout(() => {
        showSuccessToast = false;
        recentlyCompleted.delete(task.id);
        recentlyCompleted = recentlyCompleted;
      }, 3000);
      
      calculateStats();
      
      const taskElement = document.getElementById(`task-${task.id}`);
      if (taskElement) {
        taskElement.classList.add('task-completed');
        setTimeout(() => {
          taskElement.classList.remove('task-completed');
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error completing task:', error);
      toastMessage = 'Error completing task. Please try again.';
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
    } finally {
      processingTasks.delete(task.id);
      processingTasks = processingTasks;
    }
  }

  async function uncompleteTask(task: Task) {
    if (!currentUser || !$userStore || processingTasks.has(task.id)) return;
    
    if (!confirm('Are you sure you want to mark this task as incomplete? You will lose the XP.')) {
      return;
    }
    
    processingTasks.add(task.id);
    processingTasks = processingTasks;
    
    try {
      await userStore.uncompleteTask(currentUser.uid, task.id, task.xp);
      
      toastMessage = `Task marked incomplete. -${task.xp} XP`;
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
      
      calculateStats();
      
    } catch (error: any) {
      console.error('Error uncompleting task:', error);
      toastMessage = error.message || 'Error removing task completion. Please try again.';
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
    } finally {
      processingTasks.delete(task.id);
      processingTasks = processingTasks;
    }
  }

  function isTaskCompleted(taskId: string) {
    if (processingTasks.has(taskId)) {
      return false;
    }
    return $userStore?.completedTasks.includes(taskId) || false;
  }

  function isTaskProcessing(taskId: string) {
    return processingTasks.has(taskId);
  }

  function getFilteredTasks() {
    let allTasks: Task[] = [];
    
    roadmapData.forEach(phase => {
      if (selectedPhase === 'all' || phase.id === selectedPhase) {
        phase.categories.forEach(category => {
          if (selectedCategory === 'all' || category.id === selectedCategory) {
            category.tasks.forEach(task => {
              allTasks.push(task);
            });
          }
        });
      }
    });

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      allTasks = allTasks.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query)
      );
    }

    // Apply completion filter
    if (!showCompleted) {
      allTasks = allTasks.filter(task => !isTaskCompleted(task.id));
    }

    return allTasks.sort((a, b) => {
      if (showCompleted) {
        const aCompleted = isTaskCompleted(a.id);
        const bCompleted = isTaskCompleted(b.id);
        if (aCompleted && !bCompleted) return 1;
        if (!aCompleted && bCompleted) return -1;
      }
      return a.order - b.order;
    });
  }

  function getAllCategories() {
    const categories = new Map<string, string>();
    roadmapData.forEach(phase => {
      phase.categories.forEach(category => {
        categories.set(category.id, category.title);
      });
    });
    return Array.from(categories, ([id, title]) => ({ id, title }));
  }

  function getPhaseConfig(phase: string) {
    const configs: Record<string, {
      gradient: string;
      badge: string;
      icon: string;
      name: string;
    }> = {
      foundation: {
        gradient: 'from-emerald-500 to-green-600',
        badge: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        icon: '🌱',
        name: 'Foundation'
      },
      pentesting: {
        gradient: 'from-blue-500 to-indigo-600',
        badge: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        icon: '🚀',
        name: 'Pentesting'
      },
      advanced: {
        gradient: 'from-purple-500 to-pink-600',
        badge: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        icon: '⚡',
        name: 'Advanced'
      },
      redteam: {
        gradient: 'from-red-500 to-orange-600',
        badge: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        icon: '🎯',
        name: 'Red Team'
      },
      elite: {
        gradient: 'from-yellow-500 to-amber-600',
        badge: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-amber-400 border-yellow-200 dark:border-yellow-800',
        icon: '👑',
        name: 'Elite'
      }
    };
    return configs[phase] || configs.foundation;
  }

  function getCategoryIcon(categoryId: string): string {
    const icons: Record<string, string> = {
      'system-fundamentals': 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
      'networking-core': 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
      'programming-foundations': 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      'security-basics': 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      'web-foundations': 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
    };
    return icons[categoryId] || 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2';
  }

  function clearFilters() {
    searchQuery = '';
    selectedCategory = 'all';
    selectedPhase = 'all';
    showCompleted = true;
  }

  function getTaskProgress() {
    if (!$userStore) return { next: null, percentage: 0 };
    
    const incompleteTasks = getFilteredTasks().filter(task => !isTaskCompleted(task.id));
    const nextTask = incompleteTasks[0] || null;
    const totalTasks = getFilteredTasks().length;
    const completedTasks = totalTasks - incompleteTasks.length;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return { next: nextTask, percentage, completed: completedTasks, total: totalTasks };
  }

  // Reactive statements
  $: filteredTasks = $userStore ? getFilteredTasks() : [];
  $: allCategories = getAllCategories();
  $: completedCount = $userStore ? filteredTasks.filter(task => isTaskCompleted(task.id)).length : 0;
  $: totalFilteredTasks = filteredTasks.length;
  $: completionPercentage = totalFilteredTasks > 0 ? Math.round((completedCount / totalFilteredTasks) * 100) : 0;
  $: taskProgress = getTaskProgress();
  
  // Force reactivity on filter changes
  $: searchQuery, selectedCategory, selectedPhase, showCompleted, filteredTasks = $userStore ? getFilteredTasks() : [];
</script>

<Navbar />

<!-- Success Toast -->
{#if showSuccessToast}
  <div class="fixed top-20 right-4 z-50 animate-slide-in">
    <div class={`flex items-center p-4 rounded-xl shadow-2xl backdrop-blur-sm ${
      toastMessage.includes('Error') || toastMessage.includes('incomplete') 
        ? 'bg-red-500/90 text-white' 
        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
    }`}>
      <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {#if toastMessage.includes('Error')}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        {/if}
      </svg>
      <div class="font-semibold">{toastMessage}</div>
    </div>
  </div>
{/if}

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  <!-- Hero Section -->
  <div class="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border-b border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          <span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Task Manager
          </span>
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400">
          Complete tasks to earn XP and level up your skills
        </p>
      </div>

      <!-- Progress Dashboard -->
      {#if $userStore && $userProgress}
        <div class="max-w-4xl mx-auto">
          <div class="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl">
            <!-- Level Progress -->
            <div class="mb-8">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {$userProgress.level}
                  </div>
                  <div>
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Level {$userProgress.level}</h3>
                    <p class="text-gray-600 dark:text-gray-400">Keep pushing forward!</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {$userStore.totalXP} XP
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">Total Earned</div>
                </div>
              </div>
              
              <!-- XP Progress Bar -->
              <div class="relative">
                <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Current Progress</span>
                  <span>{$userProgress.currentLevelXP}/{$userProgress.xpPerLevel} XP</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000 relative overflow-hidden"
                    style="width: {$userProgress.percentage}%"
                  >
                    <div class="absolute inset-0 bg-white/20 animate-shimmer"></div>
                  </div>
                </div>
                <div class="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {100 - $userProgress.percentage}% to next level
                </div>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                      {$userStore.completedTasks.length}
                    </div>
                    <div class="text-sm text-emerald-600 dark:text-emerald-500">Tasks Done</div>
                  </div>
                  <svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {taskProgress.percentage}%
                    </div>
                    <div class="text-sm text-blue-600 dark:text-blue-500">Progress</div>
                  </div>
                  <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              
              <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-2xl font-bold text-purple-700 dark:text-purple-400">
                      {#if taskProgress.next}
                        {taskProgress.next.xp}
                      {:else}
                        0
                      {/if}
                    </div>
                    <div class="text-sm text-purple-600 dark:text-purple-500">Next Task XP</div>
                  </div>
                  <svg class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Filters Section -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Filter Tasks
        </h3>
        
        <!-- View Mode Toggle -->
        <div class="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            on:click={() => viewMode = 'list'}
            class={`px-3 py-1.5 rounded-md font-medium text-sm transition-all ${
              viewMode === 'list' 
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
            aria-label="List view"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            on:click={() => viewMode = 'grid'}
            class={`px-3 py-1.5 rounded-md font-medium text-sm transition-all ${
              viewMode === 'grid' 
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400'
            }`}
            aria-label="Grid view"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="lg:col-span-2">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search tasks..."
              class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <!-- Phase Filter -->
        <div>
          <select
            bind:value={selectedPhase}
            class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="all">All Phases</option>
            <option value="foundation">🌱 Foundation</option>
            <option value="pentesting">🚀 Pentesting</option>
            <option value="advanced">⚡ Advanced</option>
            <option value="redteam">🎯 Red Team</option>
            <option value="elite">👑 Elite</option>
          </select>
        </div>

        <!-- Category Filter -->
        <div>
          <select
            bind:value={selectedCategory}
            class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="all">All Categories</option>
            {#each allCategories as category}
              <option value={category.id}>{category.title}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Toggle and Actions -->
      <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <label class="flex items-center cursor-pointer">
            <input
              type="checkbox"
              bind:checked={showCompleted}
              class="w-5 h-5 text-indigo-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500"
            />
            <span class="ml-2 text-gray-700 dark:text-gray-300">Show completed</span>
          </label>
          
          {#if searchQuery || selectedCategory !== 'all' || selectedPhase !== 'all' || !showCompleted}
            <button
              on:click={clearFilters}
              class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
              Clear filters
            </button>
          {/if}
        </div>
      </div>
    </div>

    <!-- Next Task Suggestion -->
    {#if taskProgress.next && !taskProgress.next.id.includes(searchQuery)}
      <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 mb-8 text-white shadow-xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div class="font-semibold text-lg">Suggested Next Task</div>
              <div class="opacity-90">{taskProgress.next.title}</div>
            </div>
          </div>
          <button
            on:click={() => {
              const el = document.getElementById(`task-${taskProgress.next.id}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('highlight-task');
                setTimeout(() => el.classList.remove('highlight-task'), 2000);
              }
            }}
            class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium backdrop-blur-sm transition-all"
          >
            View Task
          </button>
        </div>
      </div>
    {/if}

    <!-- Tasks List/Grid -->
    <div class={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
      {#if filteredTasks.length === 0}
        <div class="col-span-full">
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-lg">
            <div class="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tasks found</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              on:click={clearFilters}
              class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>
      {:else}
        {#each filteredTasks as task, index (task.id)}
          {@const completed = isTaskCompleted(task.id)}
          {@const isProcessing = isTaskProcessing(task.id)}
          {@const phaseConfig = getPhaseConfig(task.phase)}
          
          <div
            id="task-{task.id}"
            class={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
              completed ? 'opacity-75' : ''
            } ${viewMode === 'grid' ? 'flex flex-col' : ''}`}
            class:highlight-task={false}
            style="animation-delay: {Math.min(index * 50, 300)}ms;"
          >
            <!-- Task Header -->
            <div class={`p-6 ${completed ? 'bg-gray-50 dark:bg-gray-900/50' : ''}`}>
              <div class={`flex ${viewMode === 'grid' ? 'flex-col' : 'items-start'} gap-4`}>
                <!-- Status & Icon -->
                <div class={`flex items-center gap-3 ${viewMode === 'grid' ? 'mb-2' : ''}`}>
                  <div class="relative">
                    {#if isProcessing}
                      <div class="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center">
                        <div class="spinner w-6 h-6"></div>
                      </div>
                    {:else if completed}
                      <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    {:else}
                      <button
                        on:click={() => completeTask(task)}
                        class="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
                        aria-label="Mark task as complete"
                      >
                        <svg class="w-6 h-6 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    {/if}
                  </div>
                  
                  {#if viewMode === 'grid'}
                    <div class="flex-1">
                      <span class={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${phaseConfig.badge} border`}>
                        {phaseConfig.icon} {phaseConfig.name}
                      </span>
                    </div>
                  {/if}
                </div>
                
                <!-- Content -->
                <div class="flex-1">
                  <h3 class={`text-lg font-semibold mb-2 ${
                    completed ? 'text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'
                  }`}>
                    {task.title}
                  </h3>
                  
                  <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                    {task.description}
                  </p>
                  
                  <div class="flex flex-wrap items-center gap-2">
                    {#if viewMode === 'list'}
                      <span class={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${phaseConfig.badge} border`}>
                        {phaseConfig.icon} {phaseConfig.name}
                      </span>
                    {/if}
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {task.category.replace(/-/g, ' ')}
                    </span>
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {task.xp} XP
                    </span>
                  </div>
                </div>
                
                <!-- Actions -->
                {#if viewMode === 'list'}
                  <div class="flex items-center gap-3">
                    {#if !completed && !isProcessing}
                      <button
                        on:click={() => completeTask(task)}
                        disabled={isProcessing}
                        class="px-6 py-2.5 bg-gradient-to-r {phaseConfig.gradient} text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all"
                      >
                        Complete
                      </button>
                    {:else if completed && !isProcessing}
                      <div class="text-center">
                        <div class="text-green-600 dark:text-green-400 font-medium mb-1">
                          ✓ Completed
                        </div>
                        <button
                          on:click={() => uncompleteTask(task)}
                          class="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          Undo
                        </button>
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
            
            {#if viewMode === 'grid' && !completed}
              <div class="px-6 pb-6">
                <button
                  on:click={() => completeTask(task)}
                  disabled={isProcessing}
                  class="w-full px-4 py-2.5 bg-gradient-to-r {phaseConfig.gradient} text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Complete Task
                </button>
              </div>
            {:else if viewMode === 'grid' && completed}
              <div class="px-6 pb-6 text-center">
                <div class="text-green-600 dark:text-green-400 font-medium mb-1">
                  ✓ Completed
                </div>
                <button
                  on:click={() => uncompleteTask(task)}
                  class="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  Mark as incomplete
                </button>
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>

    <!-- Motivation Section -->
    {#if filteredTasks.length > 0 && completedCount < totalFilteredTasks}
      <div class="mt-16 text-center">
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-3xl p-8 border border-indigo-200 dark:border-indigo-800">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Keep Going! You're Making Great Progress 🚀
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-lg mb-6 max-w-2xl mx-auto">
            You've completed {completedCount} out of {totalFilteredTasks} tasks. 
            Every task brings you closer to mastery!
          </p>
          <div class="flex justify-center">
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div class="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {completionPercentage}%
              </div>
              <div class="text-gray-600 dark:text-gray-400">Overall Progress</div>
            </div>
          </div>
        </div>
      </div>
    {:else if completedCount === totalFilteredTasks && totalFilteredTasks > 0}
      <div class="mt-16 text-center">
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-3xl p-8 border border-green-200 dark:border-green-800">
          <div class="text-6xl mb-4">🎉</div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Congratulations! All Tasks Complete!
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            You've completed all {totalFilteredTasks} tasks in this selection. 
            Time to take on new challenges!
          </p>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
  
  .task-completed {
    animation: taskComplete 0.6s ease-out;
  }
  
  .highlight-task {
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5);
    transform: scale(1.02);
  }
  
  @keyframes taskComplete {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
    }
    100% {
      transform: scale(1);
    }
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