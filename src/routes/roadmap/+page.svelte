<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { userStore } from '$lib/stores/user';
  import { roadmapData } from '$lib/data/roadmap';
  import Navbar from '$lib/components/Navbar.svelte';

  let selectedPhase = 'beginner';
  let expandedCategories = new Set(['foundations']); // Start with first category expanded
  let showTaskDetails = new Set();

  onMount(() => {
    const unsubscribe = authStore.subscribe(async (user) => {
      if (!user) {
        goto('/');
        return;
      }
      
      // Load user profile data so navbar has access to it
      await userStore.loadProfile(user.uid);
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
        if ($userStore!.completedTasks.includes(task.id)) {
          completed++;
        }
      });
    });
    
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }

  function getCategoryStats(categoryId: string, phaseId: string) {
    const phase = roadmapData.find(p => p.id === phaseId);
    const category = phase?.categories.find(c => c.id === categoryId);
    if (!category || !$userStore) return { total: 0, completed: 0, percentage: 0 };
    
    const total = category.tasks.length;
    const completed = category.tasks.filter(task => 
      $userStore!.completedTasks.includes(task.id)
    ).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  }

  function isTaskCompleted(taskId: string) {
    return $userStore?.completedTasks.includes(taskId) || false;
  }

  function toggleCategory(categoryId: string) {
    if (expandedCategories.has(categoryId)) {
      expandedCategories.delete(categoryId);
    } else {
      expandedCategories.add(categoryId);
    }
    expandedCategories = expandedCategories; // Trigger reactivity
  }

  function toggleTaskDetails(taskId: string) {
    if (showTaskDetails.has(taskId)) {
      showTaskDetails.delete(taskId);
    } else {
      showTaskDetails.add(taskId);
    }
    showTaskDetails = showTaskDetails; // Trigger reactivity
  }

  function getPhaseColor(phaseId: string) {
    switch (phaseId) {
      case 'beginner':
        return {
          bg: 'from-green-500 to-emerald-600',
          text: 'text-green-600 dark:text-green-400',
          badge: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
          border: 'border-green-200 dark:border-green-800'
        };
      case 'intermediate':
        return {
          bg: 'from-blue-500 to-indigo-600',
          text: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-800'
        };
      case 'advanced':
        return {
          bg: 'from-purple-500 to-pink-600',
          text: 'text-purple-600 dark:text-purple-400',
          badge: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
          border: 'border-purple-200 dark:border-purple-800'
        };
      default:
        return {
          bg: 'from-gray-500 to-gray-600',
          text: 'text-gray-600 dark:text-gray-400',
          badge: 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400',
          border: 'border-gray-200 dark:border-gray-800'
        };
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

  $: currentPhase = roadmapData.find(p => p.id === selectedPhase);
  $: phaseStats = getPhaseStats(selectedPhase);
  $: phaseColor = getPhaseColor(selectedPhase);
</script>

<Navbar />

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
          🗺️ Ethical Hacking Roadmap
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Your structured path from beginner to elite bug hunter
        </p>
      </div>

      <!-- Phase Selector -->
      <div class="card p-2 mb-8">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {#each roadmapData as phase}
            {@const stats = getPhaseStats(phase.id)}
            {@const colors = getPhaseColor(phase.id)}
            <button
              on:click={() => selectedPhase = phase.id}
              class={`relative p-6 rounded-xl font-medium transition-all duration-300 ${
                selectedPhase === phase.id 
                  ? `bg-gradient-to-r ${colors.bg} text-white shadow-lg scale-105` 
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div class="flex flex-col items-center text-center">
                <div class="text-2xl mb-2">
                  {#if phase.id === 'foundation'}🌱
                  {:else if phase.id === 'pentesting'}🚀
                  {:else}👑{/if}
                </div>
                <div class="text-lg font-bold mb-1">{phase.title}</div>
                <div class="text-sm opacity-80 mb-3">{phase.duration}</div>
                
                {#if $userStore}
                  <div class="w-full">
                    <div class="text-xs mb-1">{stats.completed}/{stats.total} tasks</div>
                    <div class="w-full bg-black/20 rounded-full h-2">
                      <div 
                        class="bg-white h-2 rounded-full transition-all duration-500"
                        style="width: {stats.percentage}%"
                      ></div>
                    </div>
                    <div class="text-xs mt-1 opacity-80">{stats.percentage}%</div>
                  </div>
                {/if}
              </div>
              
              {#if selectedPhase === phase.id}
                <div class="absolute inset-0 rounded-xl ring-4 ring-white/30 pointer-events-none"></div>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Phase Overview -->
      {#if currentPhase && $userStore}
        <div class={`card p-6 mb-8 border-l-4 ${phaseColor.border}`}>
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-4">
                <div class={`p-3 bg-gradient-to-r ${phaseColor.bg} rounded-xl text-white`}>
                  <div class="text-2xl">
                    {#if currentPhase.id === 'foundation'}🌱
                    {:else if currentPhase.id === 'pentesting'}🚀
                    {:else}👑{/if}
                  </div>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{currentPhase.title}</h2>
                  <p class="text-gray-600 dark:text-gray-400">{currentPhase.duration}</p>
                </div>
              </div>
              <p class="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {currentPhase.description}
              </p>
            </div>
            
            <div class="text-center lg:text-right">
              <div class={`text-4xl font-bold ${phaseColor.text} mb-2`}>
                {phaseStats.percentage}%
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {phaseStats.completed} of {phaseStats.total} completed
              </div>
              <div class="w-32 h-32 mx-auto lg:mx-0 relative">
                <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="text-gray-200 dark:text-gray-700"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-dasharray="{phaseStats.percentage}, 100"
                    class={phaseColor.text}
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <div class="text-lg font-bold text-gray-900 dark:text-white">
                      {phaseStats.completed}
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      tasks
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Categories -->
      {#if currentPhase}
        <div class="space-y-6">
          {#each currentPhase.categories as category, categoryIndex}
            {@const categoryStats = getCategoryStats(category.id, currentPhase.id)}
            {@const isExpanded = expandedCategories.has(category.id)}
            
            <div class="card overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <!-- Category Header -->
              <button
                on:click={() => toggleCategory(category.id)}
                class="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class={`p-3 bg-gradient-to-r ${phaseColor.bg} rounded-xl text-white`}>
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getCategoryIcon(category.id)} />
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-gray-900 dark:text-white">{category.title}</h3>
                      <div class="text-sm text-gray-600 dark:text-gray-400">
                        {categoryStats.completed}/{categoryStats.total} tasks completed
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-4">
                    <!-- Progress Badge -->
                    <span class={`badge ${phaseColor.badge} px-4 py-2 text-lg font-bold`}>
                      {categoryStats.percentage}%
                    </span>
                    
                    <!-- Expand/Collapse Icon -->
                    <svg
                      class={`w-6 h-6 text-gray-400 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                <!-- Progress Bar -->
                <div class="mt-4">
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      class={`h-3 rounded-full bg-gradient-to-r ${phaseColor.bg} transition-all duration-700`}
                      style="width: {categoryStats.percentage}%"
                    ></div>
                  </div>
                </div>
              </button>
              
              <!-- Category Tasks -->
              {#if isExpanded}
                <div class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div class="p-6">
                    <div class="space-y-4">
                      {#each category.tasks as task, taskIndex}
                        {@const isCompleted = isTaskCompleted(task.id)}
                        {@const showDetails = showTaskDetails.has(task.id)}
                        
                        <div 
                          class={`border rounded-xl p-4 transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                          style="animation-delay: {taskIndex * 100}ms;"
                        >
                          <div class="flex items-start gap-4">
                            <!-- Task Status -->
                            <div class="flex-shrink-0 mt-1">
                              {#if isCompleted}
                                <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              {:else}
                                <div class="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                              {/if}
                            </div>
                            
                            <!-- Task Content -->
                            <div class="flex-1 min-w-0">
                              <div class="flex items-start justify-between gap-4">
                                <div class="flex-1">
                                  <h4 class={`font-semibold mb-2 ${
                                    isCompleted 
                                      ? 'text-gray-600 dark:text-gray-400 line-through' 
                                      : 'text-gray-900 dark:text-white'
                                  }`}>
                                    {task.title}
                                  </h4>
                                  
                                  <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                                    {task.description}
                                  </p>
                                  
                                  <div class="flex items-center gap-3">
                                    <span class={`badge ${phaseColor.badge} flex items-center`}>
                                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                      {task.xp} XP
                                    </span>
                                    
                                    <button
                                      on:click={() => toggleTaskDetails(task.id)}
                                      class="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                                    >
                                      {showDetails ? 'Hide details' : 'Show details'}
                                    </button>
                                  </div>
                                </div>
                                
                                <!-- Task Actions -->
                                <div class="flex items-center gap-2">
                                  {#if isCompleted}
                                    <span class="text-xs text-green-600 dark:text-green-400 font-medium flex items-center">
                                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                      </svg>
                                      Completed
                                    </span>
                                  {:else}
                                    <a 
                                      href="/tasks" 
                                      class="btn btn-primary btn-sm"
                                    >
                                      Start Task
                                    </a>
                                  {/if}
                                </div>
                              </div>
                              
                              <!-- Task Details (Expandable) -->
                              {#if showDetails}
                                <div class="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 animate-slide-up">
                                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <div class="font-medium text-gray-900 dark:text-white mb-2">Task Information</div>
                                      <div class="space-y-1 text-gray-600 dark:text-gray-400">
                                        <div><span class="font-medium">Phase:</span> {task.phase}</div>
                                        <div><span class="font-medium">Category:</span> {task.category.replace('-', ' ')}</div>
                                        <div><span class="font-medium">Order:</span> #{task.order}</div>
                                        <div><span class="font-medium">XP Reward:</span> {task.xp} points</div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <div class="font-medium text-gray-900 dark:text-white mb-2">Progress Status</div>
                                      <div class="space-y-1 text-gray-600 dark:text-gray-400">
                                        <div>
                                          <span class="font-medium">Status:</span> 
                                          <span class={isCompleted ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>
                                            {isCompleted ? 'Completed ✓' : 'Pending'}
                                          </span>
                                        </div>
                                        {#if isCompleted}
                                          <div><span class="font-medium">XP Earned:</span> {task.xp}</div>
                                        {:else}
                                          <div><span class="font-medium">Potential XP:</span> {task.xp}</div>
                                        {/if}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <!-- Quick Actions -->
                                  <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div class="flex flex-wrap gap-2">
                                      <a href="/tasks" class="btn btn-secondary btn-sm">
                                        View in Tasks
                                      </a>
                                      {#if !isCompleted}
                                        <a href="/journal" class="btn btn-secondary btn-sm">
                                          Document Progress
                                        </a>
                                      {/if}
                                    </div>
                                  </div>
                                </div>
                              {/if}
                            </div>
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}

      <!-- Call to Action -->
      <div class="mt-12 text-center">
        <div class="card p-8 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
          <div class="max-w-2xl mx-auto">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🎯 Ready to Continue Your Journey?
            </h3>
            <p class="text-gray-600 dark:text-gray-400 text-lg mb-6">
              Each task on this roadmap is designed to build your skills systematically. 
              Start with the fundamentals and work your way up to become an elite bug hunter.
            </p>
            
            <div class="flex flex-col sm:flex-row justify-center gap-4">
              <a href="/tasks" class="btn btn-primary btn-lg">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Start Learning
              </a>
              
              <a href="/journal" class="btn btn-secondary btn-lg">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Document Progress
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Tips Section -->
      <div class="mt-12 card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Roadmap Tips
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Follow the Order</div>
                <div class="text-gray-600 dark:text-gray-400">Tasks are arranged in logical progression. Complete them in order for best results.</div>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Practice Regularly</div>
                <div class="text-gray-600 dark:text-gray-400">Consistent practice is key. Aim to complete at least one task per week.</div>
              </div>
            </div>
          </div>
          
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <div class="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Document Everything</div>
                <div class="text-gray-600 dark:text-gray-400">Use the journal feature to record your learning and breakthroughs.</div>
              </div>
            </div>
            
            <div class="flex items-start gap-3">
              <div class="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Don't Rush</div>
                <div class="text-gray-600 dark:text-gray-400">Take time to truly understand each concept before moving to the next level.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>