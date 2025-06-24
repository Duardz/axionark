<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { userStore, userProgress } from '$lib/stores/user';
  import { roadmapData } from '$lib/data/roadmap';
  import Navbar from '$lib/components/Navbar.svelte';
  import type { Task } from '$lib/data/roadmap';

  let loading = false;
  let selectedCategory = 'all';
  let selectedPhase = 'all';
  let showCompleted = true;
  let currentUser: any = null;
  let searchQuery = '';
  let completingTasks = new Set<string>();
  let recentlyCompleted = new Set<string>();
  let showSuccessToast = false;
  let lastCompletedTask: Task | null = null;

  // Real-time stats
  let todayCompleted = 0;
  let streakDays = 0;
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

    return unsubscribe;
  });

  function calculateStats() {
    if (!$userStore) return;
    
    // Calculate today's completed tasks (mock - you might want to track timestamps)
    todayCompleted = Math.floor(Math.random() * 5);
    
    // Calculate streak (mock)
    streakDays = Math.floor(Math.random() * 30) + 1;
    
    // Calculate total XP earned
    totalXPEarned = $userStore.totalXP;
  }

  async function completeTask(task: Task) {
    if (!currentUser || !$userStore || completingTasks.has(task.id)) return;
    
    completingTasks.add(task.id);
    loading = true;
    
    try {
      await userStore.completeTask(currentUser.uid, task.id, task.xp);
      
      // Add to recently completed for animation
      recentlyCompleted.add(task.id);
      lastCompletedTask = task;
      
      // Show success toast
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
      
      // Update stats
      todayCompleted++;
      calculateStats();
      
      // Trigger task completion animation
      const taskElement = document.getElementById(`task-${task.id}`);
      if (taskElement) {
        taskElement.classList.add('task-completed');
        setTimeout(() => {
          taskElement.classList.remove('task-completed');
          recentlyCompleted.delete(task.id);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      completingTasks.delete(task.id);
      loading = false;
    }
  }

  async function uncompleteTask(task: Task) {
    if (!currentUser || !$userStore || completingTasks.has(task.id)) return;
    
    if (!confirm('Are you sure you want to mark this task as incomplete? You will lose the XP.')) {
      return;
    }
    
    completingTasks.add(task.id);
    loading = true;
    
    try {
      await userStore.uncompleteTask(currentUser.uid, task.id, task.xp);
      calculateStats();
    } catch (error) {
      console.error('Error uncompleting task:', error);
    } finally {
      completingTasks.delete(task.id);
      loading = false;
    }
  }

  function isTaskCompleted(taskId: string) {
    return $userStore?.completedTasks.includes(taskId) || false;
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

    return allTasks.sort((a, b) => a.order - b.order);
  }

  function getAllCategories() {
    const categories = new Set<{id: string, title: string}>();
    roadmapData.forEach(phase => {
      phase.categories.forEach(category => {
        categories.add({ id: category.id, title: category.title });
      });
    });
    return Array.from(categories);
  }

  function getPhaseColor(phase: string) {
    switch (phase) {
      case 'beginner':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'intermediate':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'advanced':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  }

  function getCategoryIcon(categoryId: string): string {
    const icons: Record<string, string> = {
      'foundations': 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      'practice-platforms': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      'core-vulnerabilities': 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      'first-hunting': 'M13 10V3L4 14h7v7l9-11h-7z',
      'programming': 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      'advanced-vulns': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      'automation': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      'specialization': 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
      'consistency': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      'elite-techniques': 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      'research': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      'business': 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
      'mastery': 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
    };
    return icons[categoryId] || 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2';
  }

  $: filteredTasks = getFilteredTasks();
  $: allCategories = getAllCategories();
  $: completedCount = filteredTasks.filter(task => isTaskCompleted(task.id)).length;
  $: completionPercentage = filteredTasks.length > 0 ? Math.round((completedCount / filteredTasks.length) * 100) : 0;
</script>

<Navbar />

<!-- Success Toast -->
{#if showSuccessToast && lastCompletedTask}
  <div class="toast toast-success animate-slide-up">
    <div class="flex items-center">
      <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <div class="font-semibold">Task Completed! 🎉</div>
        <div class="text-sm opacity-90">+{lastCompletedTask.xp} XP earned</div>
      </div>
    </div>
  </div>
{/if}

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="animate-fade-in-up">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          🎯 Task Manager
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Complete tasks to earn XP and master bug bounty hunting
        </p>
      </div>

      <!-- Progress Overview -->
      {#if $userStore && $userProgress}
        <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-2xl">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Current Level -->
            <div class="text-center sm:text-left">
              <div class="flex items-center justify-center sm:justify-start mb-2">
                <div class="p-2 bg-white/20 rounded-lg mr-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <div class="text-2xl font-bold">Level {$userProgress.level}</div>
                  <div class="text-sm opacity-80">Current Level</div>
                </div>
              </div>
            </div>

            <!-- Total XP -->
            <div class="text-center sm:text-left">
              <div class="flex items-center justify-center sm:justify-start mb-2">
                <div class="p-2 bg-white/20 rounded-lg mr-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div class="text-2xl font-bold">{$userStore.totalXP}</div>
                  <div class="text-sm opacity-80">Total XP</div>
                </div>
              </div>
            </div>

            <!-- Today's Progress -->
            <div class="text-center sm:text-left">
              <div class="flex items-center justify-center sm:justify-start mb-2">
                <div class="p-2 bg-white/20 rounded-lg mr-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div class="text-2xl font-bold">{todayCompleted}</div>
                  <div class="text-sm opacity-80">Today's Tasks</div>
                </div>
              </div>
            </div>

            <!-- Streak -->
            <div class="text-center sm:text-left">
              <div class="flex items-center justify-center sm:justify-start mb-2">
                <div class="p-2 bg-white/20 rounded-lg mr-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <div>
                  <div class="text-2xl font-bold">{streakDays}</div>
                  <div class="text-sm opacity-80">Day Streak</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-6">
            <div class="flex justify-between text-sm mb-2">
              <span>Progress to Level {$userProgress.level + 1}</span>
              <span>{$userProgress.currentLevelXP}/{$userProgress.xpPerLevel} XP</span>
            </div>
            <div class="w-full bg-white/20 rounded-full h-3">
              <div 
                class="bg-white h-3 rounded-full transition-all duration-1000 animate-progress-fill"
                style="--progress-width: {$userProgress.percentage}%; width: {$userProgress.percentage}%"
              ></div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Filters Section -->
      <div class="card p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
          Filters & Search
        </h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="lg:col-span-2">
            <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Tasks
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                bind:value={searchQuery}
                placeholder="Search by title, description, or category..."
                class="input pl-10"
              />
            </div>
          </div>

          <!-- Phase Filter -->
          <div>
            <label for="phase-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phase
            </label>
            <select
              id="phase-filter"
              bind:value={selectedPhase}
              class="input"
            >
              <option value="all">All Phases</option>
              <option value="beginner">🌱 Beginner</option>
              <option value="intermediate">🚀 Intermediate</option>
              <option value="advanced">👑 Advanced</option>
            </select>
          </div>

          <!-- Category Filter -->
          <div>
            <label for="category-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              id="category-filter"
              bind:value={selectedCategory}
              class="input"
            >
              <option value="all">All Categories</option>
              {#each allCategories as category}
                <option value={category.id}>{category.title}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Toggle Options -->
        <div class="mt-4 flex flex-wrap items-center gap-4">
          <label class="flex items-center cursor-pointer bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <input
              type="checkbox"
              bind:checked={showCompleted}
              class="w-4 h-4 text-indigo-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <span class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Show completed tasks</span>
          </label>
          
          <!-- Results Summary -->
          <div class="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
            Showing {filteredTasks.length} tasks • {completedCount} completed ({completionPercentage}%)
          </div>
        </div>
      </div>

      <!-- Tasks List -->
      <div class="space-y-4">
        {#if filteredTasks.length === 0}
          <div class="card p-12 text-center">
            <div class="w-20 h-20 mx-auto mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
              <svg class="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tasks found</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery ? 'Try adjusting your search terms or filters' : 'Try enabling completed tasks or changing your filters'}
            </p>
            <button
              on:click={() => {
                searchQuery = '';
                selectedCategory = 'all';
                selectedPhase = 'all';
                showCompleted = true;
              }}
              class="btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        {:else}
          {#each filteredTasks as task, index}
            <div
              id="task-{task.id}"
              class="card p-6 hover:shadow-xl transition-all duration-300 group {recentlyCompleted.has(task.id) ? 'ring-2 ring-green-500' : ''}"
              class:opacity-75={isTaskCompleted(task.id)}
              style="animation-delay: {index * 50}ms;"
            >
              <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                <!-- Checkbox & Icon -->
                <div class="flex items-center space-x-4 flex-shrink-0">
                  <div class="relative">
                    {#if isTaskCompleted(task.id)}
                      <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    {:else}
                      <div class="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer group-hover:scale-110 group-hover:border-indigo-500"></div>
                    {/if}
                    
                    {#if recentlyCompleted.has(task.id)}
                      <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-bounce-subtle"></div>
                    {/if}
                  </div>
                  
                  <!-- Category Icon -->
                  <div class="p-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl">
                    <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getCategoryIcon(task.category)} />
                    </svg>
                  </div>
                </div>
                
                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div class="flex-1">
                      <h3 class={`text-lg sm:text-xl font-semibold mb-2 transition-colors ${
                        isTaskCompleted(task.id) 
                          ? 'text-gray-500 dark:text-gray-500 line-through' 
                          : 'text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                      }`}>
                        {task.title}
                      </h3>
                      <p class="text-gray-600 dark:text-gray-400 mb-3 text-sm sm:text-base leading-relaxed">
                        {task.description}
                      </p>
                      
                      <div class="flex flex-wrap items-center gap-2">
                        <span class={`badge border ${getPhaseColor(task.phase)}`}>
                          {#if task.phase === 'beginner'}🌱{:else if task.phase === 'intermediate'}🚀{:else}👑{/if}
                          {task.phase}
                        </span>
                        <span class="badge bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                          {task.category.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <!-- XP and Action -->
                    <div class="flex items-center gap-4 flex-shrink-0">
                      <div class="text-center">
                        <div class="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                          {task.xp}
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">XP</div>
                      </div>
                      
                      {#if !isTaskCompleted(task.id)}
                        <button
                          on:click={() => completeTask(task)}
                          disabled={completingTasks.has(task.id)}
                          class="btn btn-success btn-lg group-hover:scale-105 shadow-lg"
                        >
                          {#if completingTasks.has(task.id)}
                            <div class="spinner w-4 h-4 mr-2"></div>
                            Completing...
                          {:else}
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Complete
                          {/if}
                        </button>
                      {:else}
                        <div class="flex flex-col items-end gap-2">
                          <div class="flex items-center text-green-600 dark:text-green-400 font-semibold text-sm">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Completed
                          </div>
                          <button
                            on:click={() => uncompleteTask(task)}
                            disabled={completingTasks.has(task.id)}
                            class="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
                          >
                            Undo
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

      <!-- Motivation Footer -->
      {#if filteredTasks.length > 0}
        <div class="text-center py-12">
          <div class="max-w-2xl mx-auto">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🎯 Keep Learning, Keep Growing!
            </h3>
            <p class="text-gray-600 dark:text-gray-400 text-lg mb-6">
              Every task completed brings you one step closer to becoming an elite bug hunter. 
              Your dedication today shapes your expertise tomorrow.
            </p>
            <div class="flex justify-center space-x-8">
              <div class="text-center">
                <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{completedCount}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600 dark:text-green-400">{completionPercentage}%</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Progress</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{$userStore?.totalXP || 0}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Total XP</div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>