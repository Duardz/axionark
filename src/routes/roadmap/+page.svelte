<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { userStore } from '$lib/stores/user';
  import { roadmapData } from '$lib/data/roadmap';
  import Navbar from '$lib/components/Navbar.svelte';

  let selectedPhase = 'beginner';

  onMount(() => {
    const unsubscribe = authStore.subscribe((user) => {
      if (!user) {
        goto('/');
      }
    });

    return unsubscribe;
  });

  function getPhaseStats(phaseId: string) {
    const phase = roadmapData.find(p => p.id === phaseId);
    if (!phase || !$userStore) return { total: 0, completed: 0, percentage: 0 };
    
    let total = 0;
    let completed = 0;
    
    phase.categories.forEach(category => {
      category.tasks.forEach(task => {
        total++;
        if ($userStore.completedTasks.includes(task.id)) {
          completed++;
        }
      });
    });
    
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }

  function isTaskCompleted(taskId: string) {
    return $userStore?.completedTasks.includes(taskId) || false;
  }

  $: currentPhase = roadmapData.find(p => p.id === selectedPhase);
  $: phaseStats = getPhaseStats(selectedPhase);
</script>

<Navbar />

<div class="container mx-auto px-4 py-8 max-w-7xl">
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Bug Bounty Roadmap</h1>
      <p class="text-gray-600">Your structured path from beginner to elite bug hunter</p>
    </div>

    <!-- Phase Selector -->
    <div class="bg-white rounded-lg shadow-md p-1 mb-8">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-1">
        {#each roadmapData as phase}
          <button
            on:click={() => selectedPhase = phase.id}
            class={`px-4 py-3 rounded-md font-medium transition-all ${
              selectedPhase === phase.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div class="flex flex-col items-center">
              <span class="text-lg">{phase.title}</span>
              <span class="text-sm opacity-80 mt-1">{phase.duration}</span>
              {#if $userStore}
                {@const stats = getPhaseStats(phase.id)}
                <div class="mt-2">
                  <span class="text-xs">{stats.completed}/{stats.total} tasks</span>
                </div>
              {/if}
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Phase Progress -->
    {#if currentPhase && $userStore}
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">{currentPhase.title} Progress</h2>
          <span class="text-2xl font-bold text-blue-600">{phaseStats.percentage}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-4">
          <div 
            class="bg-blue-600 h-4 rounded-full transition-all duration-500"
            style="width: {phaseStats.percentage}%"
          ></div>
        </div>
        <p class="mt-4 text-gray-600">{currentPhase.description}</p>
      </div>
    {/if}

    <!-- Phase Content -->
    {#if currentPhase}
      <div class="space-y-8">
        {#each currentPhase.categories as category}
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">{category.title}</h3>
            </div>
            
            <div class="divide-y divide-gray-200">
              {#each category.tasks as task}
                <div class="p-6 hover:bg-gray-50 transition-colors">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center">
                        {#if isTaskCompleted(task.id)}
                          <svg class="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        {:else}
                          <div class="w-6 h-6 border-2 border-gray-300 rounded-full mr-3 flex-shrink-0"></div>
                        {/if}
                        <h4 class={`text-lg font-medium ${isTaskCompleted(task.id) ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </h4>
                      </div>
                      <p class="mt-2 text-gray-600 ml-9">{task.description}</p>
                    </div>
                    
                    <div class="ml-4 flex-shrink-0 flex items-center">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {task.xp} XP
                      </span>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Navigation Hint -->
    <div class="mt-12 bg-blue-50 rounded-lg p-6 text-center">
      <p class="text-gray-700">
        Ready to start completing tasks? 
        <a href="/tasks" class="font-medium text-blue-600 hover:text-blue-500">
          Go to Tasks →
        </a>
      </p>
    </div>
  </div>
</div>