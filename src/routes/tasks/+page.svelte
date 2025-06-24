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

  onMount(() => {
    const unsubscribe = authStore.subscribe(async (user) => {
      if (!user) {
        goto('/');
        return;
      }
      currentUser = user;
      await userStore.loadProfile(user.uid);
    });

    return unsubscribe;
  });

  async function completeTask(task: Task) {
    if (!currentUser || !$userStore) return;
    
    loading = true;
    try {
      await userStore.completeTask(currentUser.uid, task.id, task.xp);
      
      // Show success animation
      const button = document.getElementById(`task-${task.id}`);
      if (button) {
        button.classList.add('animate-scaleIn');
        setTimeout(() => button.classList.remove('animate-scaleIn'), 500);
      }
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      loading = false;
    }
  }

  async function uncompleteTask(task: Task) {
    if (!currentUser || !$userStore) return;
    
    if (!confirm('Are you sure you want to mark this task as incomplete? You will lose the XP.')) {
      return;
    }
    
    loading = true;
    try {
      await userStore.uncompleteTask(currentUser.uid, task.id, task.xp);
    } catch (error) {
      console.error('Error uncompleting task:', error);
    } finally {
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
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'intermediate':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'advanced':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400';
    }
  }

  $: filteredTasks = getFilteredTasks();
  $: allCategories = getAllCategories();
</script>

<Navbar />

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="animate-fadeIn">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tasks</h1>
        <p class="text-gray-600 dark:text-gray-400">Complete tasks to earn XP and level up your skills</p>
      </div>

      <!-- Progress Overview -->
      {#if $userStore && $userProgress}
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h2 class="text-lg font-medium opacity-90 mb-1">Current Level</h2>
              <p class="text-3xl font-bold">Level {$userProgress.level}</p>
            </div>
            <div>
              <h2 class="text-lg font-medium opacity-90 mb-1">Total XP</h2>
              <p class="text-3xl font-bold">{$userStore.totalXP} XP</p>
            </div>
            <div>
              <h2 class="text-lg font-medium opacity-90 mb-1">Progress to Next Level</h2>
              <div class="mt-2">
                <div class="flex justify-between text-sm mb-1">
                  <span>{$userProgress.currentLevelXP} XP</span>
                  <span>{$userProgress.xpPerLevel} XP</span>
                </div>
                <div class="w-full bg-white/20 rounded-full h-3">
                  <div 
                    class="bg-white h-3 rounded-full transition-all duration-500"
                    style="width: {$userProgress.percentage}%"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Filters -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
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

          <!-- Show Completed Toggle -->
          <div class="flex items-end">
            <label class="flex items-center cursor-pointer bg-gray-50 dark:bg-gray-700/50 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                bind:checked={showCompleted}
                class="w-4 h-4 text-indigo-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
              />
              <span class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Show completed tasks</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Tasks List -->
      <div class="space-y-4">
        {#if filteredTasks.length === 0}
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
            <p class="text-gray-500 dark:text-gray-400">Try adjusting your filters or enabling completed tasks</p>
          </div>
        {:else}
          {#each filteredTasks as task}
            <div
              id="task-{task.id}"
              class="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all p-6"
              class:opacity-60={isTaskCompleted(task.id)}
            >
              <div class="flex flex-col sm:flex-row sm:items-start gap-4">
                <!-- Checkbox -->
                <div class="flex-shrink-0">
                  {#if isTaskCompleted(task.id)}
                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  {:else}
                    <div class="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-full hover:border-indigo-500 transition-colors"></div>
                  {/if}
                </div>
                
                <!-- Content -->
                <div class="flex-1">
                  <h3 class={`text-lg font-semibold mb-2 ${isTaskCompleted(task.id) ? 'text-gray-500 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                    {task.title}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                  
                  <div class="flex flex-wrap items-center gap-2">
                    <span class={`badge ${getPhaseColor(task.phase)}`}>
                      {task.phase}
                    </span>
                    <span class="badge bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {task.category}
                    </span>
                    <div class="ml-auto flex items-center gap-3">
                      <div class="text-center">
                        <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{task.xp}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">XP</p>
                      </div>
                      
                      {#if !isTaskCompleted(task.id)}
                        <button
                          on:click={() => completeTask(task)}
                          disabled={loading}
                          class="btn btn-primary"
                        >
                          {loading ? 'Completing...' : 'Complete'}
                        </button>
                      {:else}
                        <div class="flex flex-col items-end gap-1">
                          <span class="text-sm text-green-600 dark:text-green-400 font-medium flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Completed
                          </span>
                          <button
                            on:click={() => uncompleteTask(task)}
                            disabled={loading}
                            class="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
    </div>
  </div>
</div>