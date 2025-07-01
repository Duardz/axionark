<!-- src/routes/tasks/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { userStore, userProgress } from '$lib/stores/user';
  import { roadmapData } from '$lib/data/roadmap';
  import Navbar from '$lib/components/Navbar.svelte';
  import type { Task } from '$lib/data/roadmap';
  import SEO from '$lib/components/SEO.svelte';

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
      // Don't cleanup stores here - keep data persistent
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
      icon: string;
      bgPattern: string;
      accentColor: string;
      lightBg: string;
      darkBg: string;
      name: string;
    }> = {
      foundation: {
        gradient: 'from-emerald-400 via-green-500 to-teal-600',
        icon: '🌱',
        bgPattern: 'from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20',
        accentColor: 'emerald',
        lightBg: 'bg-emerald-100',
        darkBg: 'dark:bg-emerald-900/20',
        name: 'Foundation'
      },
      pentesting: {
        gradient: 'from-blue-400 via-indigo-500 to-purple-600',
        icon: '🚀',
        bgPattern: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
        accentColor: 'blue',
        lightBg: 'bg-blue-100',
        darkBg: 'dark:bg-blue-900/20',
        name: 'Pentesting'
      },
      advanced: {
        gradient: 'from-purple-400 via-pink-500 to-rose-600',
        icon: '💎',
        bgPattern: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
        accentColor: 'purple',
        lightBg: 'bg-purple-100',
        darkBg: 'dark:bg-purple-900/20',
        name: 'Advanced'
      },
      redteam: {
        gradient: 'from-red-400 via-orange-500 to-amber-600',
        icon: '🔥',
        bgPattern: 'from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20',
        accentColor: 'red',
        lightBg: 'bg-red-100',
        darkBg: 'dark:bg-red-900/20',
        name: 'Red Team'
      },
      elite: {
        gradient: 'from-amber-400 via-yellow-500 to-orange-600',
        icon: '👑',
        bgPattern: 'from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20',
        accentColor: 'amber',
        lightBg: 'bg-amber-100',
        darkBg: 'dark:bg-amber-900/20',
        name: 'Elite'
      }
    };
    return configs[phase] || configs.foundation;
  }

  function getCategoryIcon(categoryId: string): string {
    const icons: Record<string, string> = {
      'system-fundamentals': 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
      'networking-core': 'M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z',
      'programming-foundations': 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      'security-basics': 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      'web-foundations': 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'practice-foundation': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
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
    if (!$userStore) return { next: null, percentage: 0, completed: 0, total: 0 };
    
    const allTasks = getFilteredTasks();
    const incompleteTasks = allTasks.filter(task => !isTaskCompleted(task.id));
    const nextTask = incompleteTasks.length > 0 ? incompleteTasks[0] : null;
    const totalTasks = allTasks.length;
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
  $: taskProgress = $userStore && filteredTasks ? getTaskProgress() : { next: null, percentage: 0, completed: 0, total: 0 };
  
  // Force reactivity on filter changes and task completions
  $: searchQuery, selectedCategory, selectedPhase, showCompleted, $userStore?.completedTasks, filteredTasks = $userStore ? getFilteredTasks() : [];
  $: $userStore?.completedTasks, taskProgress = $userStore && filteredTasks ? getTaskProgress() : { next: null, percentage: 0, completed: 0, total: 0 };
</script>

<Navbar />

<SEO seo={{
  noindex: true,
  nofollow: true
}} />

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
  <!-- Hero Section with Dynamic Background -->
  <div class="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-violet-900/10 border-b border-gray-200 dark:border-gray-700">
    <!-- Animated Background Pattern -->
    <div class="absolute inset-0 opacity-5 dark:opacity-10">
      <div class="absolute inset-0" style='background-image: url("data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fill-opacity=&quot;0.2&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");'></div>
    </div>
    
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      <!-- Header -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center p-2 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
          <span class="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Level Up Your Skills
          </span>
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
          <span class="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
            Task Manager
          </span>
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Complete tasks, earn XP, and watch your cybersecurity skills grow
        </p>
      </div>

      <!-- Progress Dashboard - Enhanced Design -->
      {#if $userStore && $userProgress}
        <div class="max-w-5xl mx-auto">
          <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            <!-- Gradient Border -->
            <div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1">
              <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8">
                <!-- Level & XP Section -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <!-- Level Display -->
                  <div class="lg:col-span-2">
                    <div class="flex items-center gap-6 mb-6">
                      <div class="relative">
                        <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                          <span class="text-3xl sm:text-4xl font-bold text-white">{$userProgress.level}</span>
                        </div>
                        <div class="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-white text-xs font-bold shadow-lg">
                          LEVEL
                        </div>
                      </div>
                      <div>
                        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          Level {$userProgress.level} Hacker
                        </h2>
                        <p class="text-gray-600 dark:text-gray-400">
                          {$userProgress.level < 10 ? 'Beginner' : $userProgress.level < 20 ? 'Intermediate' : $userProgress.level < 30 ? 'Advanced' : 'Elite'} - Keep grinding!
                        </p>
                      </div>
                    </div>
                    
                    <!-- XP Progress Bar -->
                    <div>
                      <div class="flex justify-between items-baseline mb-3">
                        <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Level Progress</span>
                        <span class="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {$userProgress.currentLevelXP}/{$userProgress.xpPerLevel} XP
                        </span>
                      </div>
                      <div class="relative">
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                          <div 
                            class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                            style="width: {$userProgress.percentage}%"
                          >
                            <div class="absolute inset-0 bg-white/30 animate-shimmer"></div>
                          </div>
                        </div>
                        <div class="absolute inset-0 flex items-center justify-center">
                          <span class="text-xs font-bold text-white drop-shadow-md">
                            {$userProgress.percentage}%
                          </span>
                        </div>
                      </div>
                      <p class="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span class="font-medium">{$userProgress.xpPerLevel - $userProgress.currentLevelXP} XP</span> to Level {$userProgress.level + 1}
                      </p>
                    </div>
                  </div>
                  
                  <!-- Total XP Display -->
                  <div class="flex items-center justify-center">
                    <div class="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl">
                      <div class="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        {$userStore.totalXP.toLocaleString()}
                      </div>
                      <div class="text-sm font-medium text-gray-600 dark:text-gray-400">Total XP Earned</div>
                      <div class="mt-3 text-2xl">⚡</div>
                    </div>
                  </div>
                </div>
                
                <!-- Stats Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                  <div class="group bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800 hover:scale-105 transition-transform duration-300">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                          {$userStore.completedTasks.length}
                        </div>
                        <div class="text-sm font-medium text-emerald-600 dark:text-emerald-500">Tasks Completed</div>
                      </div>
                      <div class="p-3 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <svg class="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div class="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform duration-300">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="text-3xl font-bold text-blue-700 dark:text-blue-400">
                          {taskProgress.percentage}%
                        </div>
                        <div class="text-sm font-medium text-blue-600 dark:text-blue-500">Current Progress</div>
                      </div>
                      <div class="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div class="group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="text-3xl font-bold text-purple-700 dark:text-purple-400">
                          {#if taskProgress.next}
                            +{taskProgress.next.xp}
                          {:else}
                            ∞
                          {/if}
                        </div>
                        <div class="text-sm font-medium text-purple-600 dark:text-purple-500">Next Task XP</div>
                      </div>
                      <div class="p-3 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <svg class="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
    <!-- Filters Section - Enhanced Design -->
    <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 sm:p-8 mb-8">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            Find Your Next Challenge
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Filter and search through {allCategories.length} categories
          </p>
        </div>
        
        <!-- View Mode Toggle -->
        <div class="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1.5">
          <button
            on:click={() => viewMode = 'list'}
            class={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
              viewMode === 'list' 
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            aria-label="List view"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            on:click={() => viewMode = 'grid'}
            class={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
              viewMode === 'grid' 
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            aria-label="Grid view"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="lg:col-span-2">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search tasks by title, description..."
              class="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        <!-- Phase Filter -->
        <div>
          <select
            bind:value={selectedPhase}
            class="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
          >
            <option value="all">All Phases</option>
            <option value="foundation">🌱 Foundation</option>
            <option value="pentesting">🚀 Pentesting</option>
            <option value="advanced">💎 Advanced</option>
            <option value="redteam">🔥 Red Team</option>
            <option value="elite">👑 Elite</option>
          </select>
        </div>

        <!-- Category Filter -->
        <div>
          <select
            bind:value={selectedCategory}
            class="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            {#each allCategories as category}
              <option value={category.id}>{category.title}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Toggle and Stats -->
      <div class="mt-6 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-6">
          <label class="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              bind:checked={showCompleted}
              class="w-5 h-5 text-indigo-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <span class="ml-3 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              Show completed tasks
            </span>
          </label>
          
          {#if searchQuery || selectedCategory !== 'all' || selectedPhase !== 'all' || !showCompleted}
            <button
              on:click={clearFilters}
              class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filters
            </button>
          {/if}
        </div>
        
        <div class="flex items-center gap-4 text-sm">
          <span class="text-gray-600 dark:text-gray-400">
            Showing <span class="font-bold text-gray-900 dark:text-white">{filteredTasks.length}</span> tasks
          </span>
          {#if filteredTasks.length > 0}
            <span class="text-gray-400 dark:text-gray-600">•</span>
            <span class="text-gray-600 dark:text-gray-400">
              <span class="font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</span> completed
            </span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Next Task Suggestion - Enhanced Design -->
    {#if taskProgress.next && !searchQuery}
      <div class="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 sm:p-8 mb-8 text-white shadow-2xl">
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute inset-0" style="background-image: url(&quot;data:image/svg+xml,%3Csvg width=&quot;40&quot; height=&quot;40&quot; viewBox=&quot;0 0 40 40&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;1&quot;%3E%3Cpath d=&quot;M0 40L40 0H20L0 20M40 40V20L20 40&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;);"></div>
        </div>
        
        <div class="relative flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div class="text-sm font-medium text-white/80 mb-1">Recommended Next</div>
              <div class="text-xl font-bold">{taskProgress.next.title}</div>
              <div class="text-sm text-white/80 mt-1">+{taskProgress.next.xp} XP • {getPhaseConfig(taskProgress.next.phase).name}</div>
            </div>
          </div>
          <button
            on:click={() => {
              if (taskProgress.next) {
                const el = document.getElementById(`task-${taskProgress.next.id}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el.classList.add('highlight-task');
                  setTimeout(() => el.classList.remove('highlight-task'), 2000);
                }
              }
            }}
            class="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            Jump to Task →
          </button>
        </div>
      </div>
    {/if}

    <!-- Tasks List/Grid -->
    <div class={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
      {#if filteredTasks.length === 0}
        <div class="col-span-full">
          <div class="bg-white dark:bg-gray-800 rounded-3xl p-16 text-center shadow-xl">
            <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">No tasks found</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Try adjusting your filters or search terms to find more tasks
            </p>
            <button
              on:click={clearFilters}
              class="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Clear All Filters
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
            class="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden {
              completed ? 'opacity-80' : ''
            }"
            class:highlight-task={false}
            style="animation: slideIn {Math.min(index * 50, 300)}ms ease-out"
          >
            <!-- Gradient Top Bar -->
            <div class="h-1 bg-gradient-to-r {phaseConfig.gradient}"></div>
            
            <!-- Task Content -->
            <div class="p-6">
              <div class="flex items-start gap-4">
                <!-- Checkbox/Status -->
                <div class="flex-shrink-0 mt-1">
                  {#if isProcessing}
                    <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <div class="spinner w-8 h-8"></div>
                    </div>
                  {:else if completed}
                    <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  {:else}
                    <button
                      on:click={() => completeTask(task)}
                      class="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-full hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300 group/checkbox flex items-center justify-center"
                      aria-label="Mark task as complete"
                    >
                      <svg class="w-6 h-6 text-gray-400 group-hover/checkbox:text-indigo-600 dark:group-hover/checkbox:text-indigo-400 transition-colors opacity-0 group-hover/checkbox:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  {/if}
                </div>
                
                <!-- Task Details -->
                <div class="flex-1">
                  <div class="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 class={`text-xl font-bold mb-2 transition-colors ${
                        completed 
                          ? 'text-gray-500 dark:text-gray-500 line-through' 
                          : 'text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                      }`}>
                        {task.title}
                      </h3>
                      <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                    
                    <!-- XP Badge -->
                    <div class="flex-shrink-0">
                      <div class="px-4 py-2 bg-gradient-to-r {phaseConfig.gradient} text-white rounded-xl font-bold shadow-lg">
                        +{task.xp.toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                  
                  <!-- Tags & Actions -->
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium {phaseConfig.lightBg} {phaseConfig.darkBg} border border-gray-200 dark:border-gray-700">
                        {phaseConfig.icon} {getPhaseConfig(task.phase).name}
                      </span>
                      <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        <svg class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getCategoryIcon(task.category)} />
                        </svg>
                        {task.category.replace(/-/g, ' ')}
                      </span>
                      <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
                        #{task.order}
                      </span>
                    </div>
                    
                    {#if !completed && !isProcessing}
                      <button
                        on:click={() => completeTask(task)}
                        class="px-5 py-2 bg-gradient-to-r {phaseConfig.gradient} text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        Complete Task
                      </button>
                    {:else if completed && !isProcessing}
                      <div class="text-center">
                        <div class="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Completed
                        </div>
                        <button
                          on:click={() => uncompleteTask(task)}
                          class="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 mt-1 transition-colors"
                        >
                          Mark as incomplete
                        </button>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <!-- Progress Summary -->
    {#if filteredTasks.length > 0}
      <div class="mt-16">
        {#if completedCount < totalFilteredTasks}
          <div class="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-pink-900/10 rounded-3xl p-8 sm:p-12 border border-indigo-200 dark:border-indigo-800 text-center">
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Keep Going! You're {completionPercentage}% There! 🚀
            </h3>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              You've conquered {completedCount} out of {totalFilteredTasks} tasks. 
              Every completed task is a step closer to becoming an elite hacker!
            </p>
            
            <!-- Visual Progress -->
            <div class="max-w-2xl mx-auto mb-8">
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style="width: {completionPercentage}%"
                >
                  <div class="absolute inset-0 bg-white/30 animate-shimmer"></div>
                </div>
              </div>
            </div>
            
            <div class="inline-flex items-center gap-8">
              <div class="text-center">
                <div class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {totalFilteredTasks - completedCount}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">Tasks Remaining</div>
              </div>
              <div class="w-px h-16 bg-gray-300 dark:bg-gray-600"></div>
              <div class="text-center">
                <div class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {filteredTasks.filter(t => !isTaskCompleted(t.id)).reduce((sum, t) => sum + t.xp, 0).toLocaleString()}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">XP Available</div>
              </div>
            </div>
          </div>
        {:else}
          <div class="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/10 dark:via-green-900/10 dark:to-teal-900/10 rounded-3xl p-8 sm:p-12 border border-emerald-200 dark:border-emerald-800 text-center">
            <div class="text-7xl mb-6">🎉</div>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Incredible! All Tasks Complete!
            </h3>
            <p class="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              You've mastered all {totalFilteredTasks} tasks in this selection. You're a true cybersecurity warrior!
              Time to take on new challenges or help others on their journey.
            </p>
            <div class="mt-8">
              <div class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-bold text-xl shadow-xl">
                <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Master Status Achieved!
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
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
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.5);
    transform: scale(1.02);
  }
  
  @keyframes taskComplete {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 30px rgba(34, 197, 94, 0.4);
    }
    100% {
      transform: scale(1);
    }
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
</style>