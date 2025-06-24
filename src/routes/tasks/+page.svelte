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
        button.classList.add('glow-effect');
        setTimeout(() => button.classList.remove('glow-effect'), 2000);
      }
    } catch (error) {
      console.error('Error completing task:', error);
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

  $: filteredTasks = getFilteredTasks();
  $: allCategories = getAllCategories();
</script>

<Navbar />

<div class="container mx-auto px-4 py-8 max-w-7xl">
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
      <p class="text-gray-600">Complete tasks to earn XP and track your progress</p>
    </div>

    <!-- Progress Overview -->
    {#if $userStore && $userProgress}
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-2xl font-bold">Level {$userProgress.level}</h2>
            <p class="text-blue-100">Total XP: {$userStore.totalXP}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-blue-100">Next level</p>
            <p class="text-xl font-semibold">{$userProgress.currentLevelXP}/{$userProgress.xpPerLevel} XP</p>
          </div>
        </div>
        <div class="w-full bg-blue-400 bg-opacity-30 rounded-full h-3">
          <div 
            class="bg-white h-3 rounded-full transition-all duration-500"
            style="width: {$userProgress.percentage}%"
          ></div>
        </div>
      </div>
    {/if}

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Phase Filter -->
        <div>
          <label for="phase-filter" class="block text-sm font-medium text-gray-700 mb-2">
            Phase
          </label>
          <select
            id="phase-filter"
            bind:value={selectedPhase}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Phases</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <!-- Category Filter -->
        <div>
          <label for="category-filter" class="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category-filter"
            bind:value={selectedCategory}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {#each allCategories as category}
              <option value={category.id}>{category.title}</option>
            {/each}
          </select>
        </div>

        <!-- Show Completed Toggle -->
        <div class="flex items-end">
          <label class="flex items-center cursor-pointer">
            <input
              type="checkbox"
              bind:checked={showCompleted}
              class="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700">Show completed tasks</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Tasks List -->
    <div class="space-y-4">
      {#if filteredTasks.length === 0}
        <div class="bg-white rounded-lg shadow-md p-8 text-center">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-500">No tasks found. Try adjusting your filters.</p>
        </div>
      {:else}
        {#each filteredTasks as task}
          <div
            id="task-{task.id}"
            class="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
            class:opacity-60={isTaskCompleted(task.id)}
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-start">
                  <div class="flex-shrink-0 mr-4">
                    {#if isTaskCompleted(task.id)}
                      <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    {:else}
                      <div class="w-8 h-8 border-3 border-gray-300 rounded-full"></div>
                    {/if}
                  </div>
                  
                  <div class="flex-1">
                    <h3 class={`text-lg font-semibold ${isTaskCompleted(task.id) ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    <p class="mt-1 text-gray-600">{task.description}</p>
                    
                    <div class="mt-3 flex items-center flex-wrap gap-2">
                      <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.phase === 'beginner' ? 'bg-green-100 text-green-800' :
                        task.phase === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {task.phase}
                      </span>
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {task.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="ml-4 flex-shrink-0 flex flex-col items-end">
                <div class="text-center mb-2">
                  <p class="text-2xl font-bold text-blue-600">{task.xp}</p>
                  <p class="text-xs text-gray-500">XP</p>
                </div>
                
                {#if !isTaskCompleted(task.id)}
                  <button
                    on:click={() => completeTask(task)}
                    disabled={loading}
                    class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Completing...' : 'Complete'}
                  </button>
                {:else}
                  <span class="text-sm text-green-600 font-medium">Completed</span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>