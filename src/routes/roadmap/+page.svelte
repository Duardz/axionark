<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { userStore } from '$lib/stores/user';
  import { roadmapData } from '$lib/data/roadmap';
  import Navbar from '$lib/components/Navbar.svelte';
  import SEO from '$lib/components/SEO.svelte';

  let selectedPhase = 'foundation';
  let expandedCategories = new Set(['system-fundamentals']); // Start with first category expanded
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

  function getPhaseConfig(phaseId: string) {
    const configs: Record<string, {
      gradient: string;
      icon: string;
      bgPattern: string;
      accentColor: string;
      lightBg: string;
      darkBg: string;
    }> = {
      foundation: {
        gradient: 'from-emerald-500 to-green-600',
        icon: '🌱',
        bgPattern: 'from-emerald-50/50 to-green-50/50 dark:from-emerald-950/10 dark:to-green-950/10',
        accentColor: 'emerald',
        lightBg: 'bg-emerald-50',
        darkBg: 'dark:bg-emerald-950/10'
      },
      pentesting: {
        gradient: 'from-blue-500 to-indigo-600',
        icon: '🚀',
        bgPattern: 'from-blue-50/50 to-indigo-50/50 dark:from-blue-950/10 dark:to-indigo-950/10',
        accentColor: 'blue',
        lightBg: 'bg-blue-50',
        darkBg: 'dark:bg-blue-950/10'
      },
      advanced: {
        gradient: 'from-purple-500 to-pink-600',
        icon: '💎',
        bgPattern: 'from-purple-50/50 to-pink-50/50 dark:from-purple-950/10 dark:to-pink-950/10',
        accentColor: 'purple',
        lightBg: 'bg-purple-50',
        darkBg: 'dark:bg-purple-950/10'
      },
      redteam: {
        gradient: 'from-red-500 to-orange-600',
        icon: '🔥',
        bgPattern: 'from-red-50/50 to-orange-50/50 dark:from-red-950/10 dark:to-orange-950/10',
        accentColor: 'red',
        lightBg: 'bg-red-50',
        darkBg: 'dark:bg-red-950/10'
      },
      elite: {
        gradient: 'from-amber-500 to-yellow-600',
        icon: '👑',
        bgPattern: 'from-amber-50/50 to-yellow-50/50 dark:from-amber-950/10 dark:to-yellow-950/10',
        accentColor: 'amber',
        lightBg: 'bg-amber-50',
        darkBg: 'dark:bg-amber-950/10'
      }
    };
    return configs[phaseId] || configs.foundation;
  }

  function getCategoryIcon(categoryId: string): string {
    const icons: Record<string, string> = {
      'system-fundamentals': 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
      'networking-core': 'M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z',
      'programming-foundations': 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      'security-basics': 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      'web-foundations': 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'practice-foundation': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      'web-pentest': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      'system-exploitation': 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      'active-directory': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      'network-pentesting': 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0',
      'tool-development': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      'certifications-practice': 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
      'advanced-web': 'M13 10V3L4 14h7v7l9-11h-7z',
      'cloud-security': 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
      'mobile-security': 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
      'exploit-dev-advanced': 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'bug-bounty-mastery': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'hardware-iot': 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
      'redteam-fundamentals': 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
      'c2-infrastructure': 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
      'implant-development': 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
      'social-engineering': 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
      'advanced-techniques': 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      'redteam-ops': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      'vulnerability-research': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      'malware-development': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      'research-development': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      'industry-impact': 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z',
      'specialized-expertise': 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
      'legendary-achievements': 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
    };
    return icons[categoryId] || 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2';
  }

  $: currentPhase = roadmapData.find(p => p.id === selectedPhase);
  $: phaseStats = getPhaseStats(selectedPhase);
  $: phaseConfig = getPhaseConfig(selectedPhase);
</script>

<Navbar />

<SEO seo={{
  noindex: true,
  nofollow: true
}} />

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  <!-- Hero Section -->
  <div class="relative overflow-hidden bg-gradient-to-br {phaseConfig.bgPattern} border-b border-gray-200 dark:border-gray-700 transition-all duration-700">
    <!-- Animated Background Pattern -->
    <div class="absolute inset-0 opacity-5 dark:opacity-10">
      <div class="absolute inset-0" style="background-image: url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;);"></div>
    </div>
    
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      <!-- Header -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center p-2 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
          <span class="px-4 py-2 text-sm font-medium bg-gradient-to-r {phaseConfig.gradient} bg-clip-text text-transparent">
            Your Path to Mastery
          </span>
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
          <span class="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Ethical Hacking Roadmap
          </span>
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Master cybersecurity through structured learning, practical challenges, and real-world applications
        </p>
      </div>

      <!-- Phase Selector - Enhanced Mobile Design -->
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {#each roadmapData as phase}
            {@const stats = getPhaseStats(phase.id)}
            {@const config = getPhaseConfig(phase.id)}
            
            <button
              on:click={() => selectedPhase = phase.id}
              class="group relative p-4 sm:p-6 rounded-2xl transition-all duration-500 transform hover:scale-105 {
                selectedPhase === phase.id 
                  ? 'bg-gradient-to-br ' + config.gradient + ' text-white shadow-2xl scale-105' 
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md'
              }"
            >
              <!-- Background Glow Effect -->
              {#if selectedPhase === phase.id}
                <div class="absolute inset-0 bg-gradient-to-br {config.gradient} rounded-2xl blur-xl opacity-25 -z-10"></div>
              {/if}
              
              <div class="relative z-10">
                <!-- Icon -->
                <div class="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                  {config.icon}
                </div>
                
                <!-- Title & Duration -->
                <h3 class="text-lg font-bold mb-1 {selectedPhase !== phase.id ? 'text-gray-900 dark:text-white' : ''}">
                  {phase.title}
                </h3>
                <p class="text-sm mb-3 {selectedPhase === phase.id ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}">
                  {phase.duration}
                </p>
                
                <!-- Progress -->
                {#if $userStore}
                  <div class="space-y-2">
                    <div class="flex justify-between items-center text-xs">
                      <span class="{selectedPhase === phase.id ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}">
                        Progress
                      </span>
                      <span class="font-bold {selectedPhase === phase.id ? '' : 'text-gray-900 dark:text-white'}">
                        {stats.percentage}%
                      </span>
                    </div>
                    <div class="w-full bg-black/20 dark:bg-white/20 rounded-full h-2 overflow-hidden">
                      <div 
                        class="h-full rounded-full transition-all duration-1000 ease-out {
                          selectedPhase === phase.id 
                            ? 'bg-white dark:bg-white' 
                            : 'bg-gradient-to-r ' + config.gradient
                        }"
                        style="width: {stats.percentage}%"
                      ></div>
                    </div>
                    <p class="text-xs {selectedPhase === phase.id ? 'text-white/70' : 'text-gray-500 dark:text-gray-500'}">
                      {stats.completed}/{stats.total} tasks
                    </p>
                  </div>
                {/if}
              </div>
              
              <!-- Selection Indicator -->
              {#if selectedPhase === phase.id}
                <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white dark:border-t-gray-800"></div>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
    <!-- Phase Overview Card -->
    {#if currentPhase && $userStore}
      <div class="mb-10 bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
        <!-- Gradient Header -->
        <div class="bg-gradient-to-r {phaseConfig.gradient} p-1">
          <div class="bg-white dark:bg-gray-800 rounded-t-3xl p-6 sm:p-8">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <!-- Phase Info -->
              <div class="flex-1">
                <div class="flex items-center gap-4 mb-6">
                  <div class="relative">
                    <div class="w-20 h-20 bg-gradient-to-br {phaseConfig.gradient} rounded-2xl flex items-center justify-center shadow-lg">
                      <span class="text-4xl">{phaseConfig.icon}</span>
                    </div>
                    <div class="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md">
                      <span class="text-xs font-bold bg-gradient-to-r {phaseConfig.gradient} bg-clip-text text-transparent">
                        #{roadmapData.findIndex(p => p.id === currentPhase.id) + 1}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{currentPhase.title}</h2>
                    <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {currentPhase.duration}
                      </span>
                      <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {phaseStats.total} tasks
                      </span>
                    </div>
                  </div>
                </div>
                <p class="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  {currentPhase.description}
                </p>
              </div>
              
              <!-- Progress Circle -->
              <div class="flex flex-col items-center">
                <div class="relative w-40 h-40">
                  <!-- Background Circle -->
                  <svg class="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      stroke-width="12"
                      fill="none"
                      class="text-gray-200 dark:text-gray-700"
                    />
                    <!-- Progress Circle -->
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="url(#gradient-{currentPhase.id})"
                      stroke-width="12"
                      fill="none"
                      stroke-dasharray="{440 * phaseStats.percentage / 100}, 440"
                      stroke-linecap="round"
                      class="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient-{currentPhase.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" class="stop-color-start-{phaseConfig.accentColor}" />
                        <stop offset="100%" class="stop-color-end-{phaseConfig.accentColor}" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <!-- Center Content -->
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <div class="text-4xl font-bold bg-gradient-to-r {phaseConfig.gradient} bg-clip-text text-transparent">
                      {phaseStats.percentage}%
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Complete
                    </div>
                  </div>
                </div>
                
                <!-- Stats -->
                <div class="mt-6 flex gap-6 text-center">
                  <div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">{phaseStats.completed}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">Completed</div>
                  </div>
                  <div class="w-px bg-gray-300 dark:bg-gray-600"></div>
                  <div>
                    <div class="text-2xl font-bold text-gray-900 dark:text-white">{phaseStats.total - phaseStats.completed}</div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">Remaining</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Categories Grid -->
    {#if currentPhase}
      <div class="space-y-6">
        {#each currentPhase.categories as category, categoryIndex}
          {@const categoryStats = getCategoryStats(category.id, currentPhase.id)}
          {@const isExpanded = expandedCategories.has(category.id)}
          
          <div 
            class="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            style="animation: slideIn {categoryIndex * 100}ms ease-out"
          >
            <!-- Category Header -->
            <button
              on:click={() => toggleCategory(category.id)}
              class="w-full p-6 sm:p-8 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300"
            >
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <!-- Icon -->
                  <div class="relative flex-shrink-0">
                    <div class="w-14 h-14 bg-gradient-to-br {phaseConfig.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getCategoryIcon(category.id)} />
                      </svg>
                    </div>
                    {#if categoryStats.percentage === 100}
                      <div class="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    {/if}
                  </div>
                  
                  <!-- Title & Progress -->
                  <div class="flex-1 min-w-0">
                    <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 truncate">
                      {category.title}
                    </h3>
                    <div class="flex items-center gap-3 text-sm">
                      <span class="text-gray-600 dark:text-gray-400">
                        {categoryStats.completed}/{categoryStats.total} tasks
                      </span>
                      <span class="text-gray-400 dark:text-gray-600">•</span>
                      <span class="font-medium bg-gradient-to-r {phaseConfig.gradient} bg-clip-text text-transparent">
                        {categoryStats.percentage}% complete
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Expand Icon -->
                <div class="flex items-center gap-3">
                  <div class="hidden sm:flex items-center gap-2">
                    {#each Array(5) as _, i}
                      <div class="w-2 h-2 rounded-full {i < Math.ceil(categoryStats.percentage / 20) ? 'bg-gradient-to-r ' + phaseConfig.gradient : 'bg-gray-300 dark:bg-gray-600'}"></div>
                    {/each}
                  </div>
                  <div class="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                    <svg
                      class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform duration-300 {isExpanded ? 'rotate-180' : ''}"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <!-- Progress Bar -->
              <div class="mt-6">
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r {phaseConfig.gradient} rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                    style="width: {categoryStats.percentage}%"
                  >
                    <div class="absolute inset-0 bg-white/20 animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </button>
            
            <!-- Tasks List -->
            {#if isExpanded}
              <div class="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                <div class="p-6 sm:p-8">
                  <div class="space-y-4">
                    {#each category.tasks as task, taskIndex}
                      {@const isCompleted = isTaskCompleted(task.id)}
                      {@const showDetails = showTaskDetails.has(task.id)}
                      
                      <div 
                        class="group/task relative bg-white dark:bg-gray-800 rounded-xl border-2 p-5 transition-all duration-300 {
                          isCompleted 
                            ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                        }"
                        style="animation: slideIn {taskIndex * 50}ms ease-out"
                      >
                        <div class="flex items-start gap-4">
                          <!-- Checkbox -->
                          <div class="flex-shrink-0 mt-1">
                            <div class="relative">
                              {#if isCompleted}
                                <div class="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              {:else}
                                <div class="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full group-hover/task:border-gray-400 dark:group-hover/task:border-gray-500 transition-colors"></div>
                              {/if}
                            </div>
                          </div>
                          
                          <!-- Task Content -->
                          <div class="flex-1">
                            <div class="flex items-start justify-between gap-4 mb-3">
                              <div class="flex-1">
                                <h4 class="text-lg font-semibold mb-2 {isCompleted ? 'text-gray-500 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}">
                                  {task.title}
                                </h4>
                                <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {task.description}
                                </p>
                              </div>
                              
                              <!-- XP Badge -->
                              <div class="flex-shrink-0">
                                <div class="px-3 py-1.5 bg-gradient-to-r {phaseConfig.gradient} text-white rounded-lg font-medium text-sm shadow-sm">
                                  +{task.xp.toLocaleString()} XP
                                </div>
                              </div>
                            </div>
                            
                            <!-- Actions -->
                            <div class="flex items-center justify-between gap-4">
                              <button
                                on:click={() => toggleTaskDetails(task.id)}
                                class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium flex items-center gap-1 transition-colors"
                              >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {showDetails ? 'Hide' : 'View'} details
                              </button>
                              
                              {#if !isCompleted}
                                <a 
                                  href="/tasks" 
                                  class="px-4 py-2 bg-gradient-to-r {phaseConfig.gradient} text-white rounded-lg font-medium text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                >
                                  Start Task
                                </a>
                              {:else}
                                <span class="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 font-medium">
                                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Completed
                                </span>
                              {/if}
                            </div>
                            
                            <!-- Task Details -->
                            {#if showDetails}
                              <div class="mt-4 p-4 bg-gray-100 dark:bg-gray-900/50 rounded-xl animate-slideDown">
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                  <div class="space-y-2">
                                    <div class="flex items-center gap-2">
                                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                      </svg>
                                      <span class="text-gray-600 dark:text-gray-400">
                                        Task #{task.order}
                                      </span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                      </svg>
                                      <span class="text-gray-600 dark:text-gray-400">
                                        Category: {task.category.replace(/-/g, ' ')}
                                      </span>
                                    </div>
                                  </div>
                                  <div class="space-y-2">
                                    <div class="flex items-center gap-2">
                                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                      <span class="text-gray-600 dark:text-gray-400">
                                        XP Reward: {task.xp.toLocaleString()} points
                                      </span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                      </svg>
                                      <span class="text-gray-600 dark:text-gray-400">
                                        Status: {isCompleted ? 'Completed ✓' : 'Pending'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <!-- Quick Actions -->
                                <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                                  <a 
                                    href="/tasks" 
                                    class="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                  >
                                    View in Tasks
                                  </a>
                                  {#if !isCompleted}
                                    <a 
                                      href="/journal" 
                                      class="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    >
                                      Document Progress
                                    </a>
                                  {/if}
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
    <div class="mt-16">
      <div class="relative overflow-hidden bg-gradient-to-r {phaseConfig.gradient} rounded-3xl shadow-xl">
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-5">
          <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;40&quot; height=&quot;40&quot; viewBox=&quot;0 0 40 40&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;1&quot;%3E%3Cpath d=&quot;M0 40L40 0H20L0 20M40 40V20L20 40&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"></div>
        </div>
        
        <div class="relative p-8 sm:p-12 text-center">
          <h3 class="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Level Up? 🚀
          </h3>
          <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Every expert was once a beginner. Start your journey today and unlock your potential in cybersecurity.
          </p>
          
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/tasks" 
              class="inline-flex items-center px-8 py-4 bg-white/95 text-gray-900 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-white transform hover:scale-105 transition-all duration-300"
            >
              <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Learning
            </a>
            
            <a 
              href="/journal" 
              class="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-2xl font-semibold text-lg hover:bg-white/20 transform hover:scale-105 transition-all duration-300"
            >
              <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Track Progress
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Tips Cards -->
    <div class="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each [
        { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', title: 'Follow the Path', desc: 'Complete tasks in order for optimal learning progression', color: 'blue' },
        { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Consistent Practice', desc: 'Dedicate time daily to practice and reinforce concepts', color: 'green' },
        { icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', title: 'Document Everything', desc: 'Keep detailed notes of your learning journey', color: 'purple' },
        { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', title: 'Join Community', desc: 'Connect with peers and mentors for support', color: 'orange' }
      ] as tip, i}
        <div class="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div class="w-12 h-12 bg-gradient-to-br from-{tip.color}-400 to-{tip.color}-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={tip.icon} />
            </svg>
          </div>
          <h4 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{tip.title}</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">{tip.desc}</p>
        </div>
      {/each}
    </div>
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
  
  @keyframes slideDown {
    from {
      opacity: 0;
      max-height: 0;
    }
    to {
      opacity: 1;
      max-height: 500px;
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
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
  
  /* Dynamic gradient stop colors */
  .stop-color-start-emerald { stop-color: #10b981; }
  .stop-color-end-emerald { stop-color: #059669; }
  .stop-color-start-blue { stop-color: #3b82f6; }
  .stop-color-end-blue { stop-color: #2563eb; }
  .stop-color-start-purple { stop-color: #a855f7; }
  .stop-color-end-purple { stop-color: #9333ea; }
  .stop-color-start-red { stop-color: #ef4444; }
  .stop-color-end-red { stop-color: #dc2626; }
  .stop-color-start-amber { stop-color: #f59e0b; }
  .stop-color-end-amber { stop-color: #d97706; }
</style>