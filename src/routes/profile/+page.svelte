<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { userStore, userProgress } from '$lib/stores/user';
  import { roadmapData } from '$lib/data/roadmap';
  import { getAvatarById, DEFAULT_AVATAR_ID } from '$lib/data/avatars';
  import Navbar from '$lib/components/Navbar.svelte';
  import ProfileSettings from './ProfileSettings.svelte';
  import type { User } from 'firebase/auth';

  interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    points: number;
    earned: boolean;
    progress?: number;
    maxProgress?: number;
  }

  interface Skill {
    name: string;
    level: number;
    xp: number;
    nextLevelXp: number;
    icon: string;
    color: string;
  }

  let user: User | null = null;
  let activeTab: 'overview' | 'skills' | 'achievements' | 'leaderboard' | 'settings' = 'overview';
  let showLevelUpAnimation = false;
  let unlockedAchievement: Achievement | null = null;

  // Profile stats
  let totalTasks = 0;
  let completedTasks = 0;
  let phaseProgress: { [key: string]: number } = {};
  let achievements: Achievement[] = [];
  let memberSince = '';
  let skills: Skill[] = [];
  let powerLevel = 0;

  // Get current avatar emoji
  $: currentAvatar = $userStore?.avatar ? getAvatarById($userStore.avatar) : getAvatarById(DEFAULT_AVATAR_ID);
  $: avatarEmoji = currentAvatar?.emoji || '🐱';

  onMount(() => {
    const unsubscribe = authStore.subscribe(async (authUser) => {
      if (!authUser) {
        goto('/');
        return;
      }
      user = authUser;
      await userStore.loadProfile(authUser.uid);
      
      if ($userStore) {
        calculateStats();
      }
    });

    return unsubscribe;
  });

  function calculateStats() {
    if (!$userStore) return;

    totalTasks = roadmapData.reduce((total, phase) => {
      return total + phase.categories.reduce((catTotal, category) => {
        return catTotal + category.tasks.length;
      }, 0);
    }, 0);
    
    completedTasks = $userStore.completedTasks.length;

    roadmapData.forEach(phase => {
      let phaseTotal = 0;
      let phaseCompleted = 0;
      
      phase.categories.forEach(category => {
        category.tasks.forEach(task => {
          phaseTotal++;
          if ($userStore!.completedTasks.includes(task.id)) {
            phaseCompleted++;
          }
        });
      });
      
      phaseProgress[phase.id] = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
    });

    achievements = getAchievements();
    skills = calculateSkills();
    powerLevel = calculatePowerLevel();

    if ($userStore.createdAt) {
      memberSince = new Date($userStore.createdAt.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  function calculateSkills(): Skill[] {
    if (!$userStore) return [];
    
    // Helper function to calculate proper level and XP within current level
    function calculateSkillLevel(totalXp: number, xpPerLevel: number) {
      const level = Math.floor(totalXp / xpPerLevel) + 1;
      const xpInCurrentLevel = totalXp % xpPerLevel;
      return { level, xpInCurrentLevel };
    }
    
    // Web Security - based on foundation phase progress
    const webSecurityTotalXp = (phaseProgress.foundation || 0) * 10;
    const webSecurityData = calculateSkillLevel(webSecurityTotalXp, 200);
    
    // Network Hacking - based on pentesting phase progress
    const networkHackingTotalXp = (phaseProgress.pentesting || 0) * 8;
    const networkHackingData = calculateSkillLevel(networkHackingTotalXp, 200);
    
    // Exploit Dev - based on advanced phase progress
    const exploitDevTotalXp = (phaseProgress.advanced || 0) * 5;
    const exploitDevData = calculateSkillLevel(exploitDevTotalXp, 150);
    
    // Bug Hunting - based on bugs found
    const bugHuntingTotalXp = ($userStore.bugsFound || 0) * 50;
    const bugHuntingData = calculateSkillLevel(bugHuntingTotalXp, 150);
    
    return [
      {
        name: 'Web Security',
        level: Math.min(webSecurityData.level, 20), // Cap at level 20
        xp: webSecurityData.xpInCurrentLevel,
        nextLevelXp: 200,
        icon: '🌐',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        name: 'Network Hacking',
        level: Math.min(networkHackingData.level, 20),
        xp: networkHackingData.xpInCurrentLevel,
        nextLevelXp: 200,
        icon: '🔌',
        color: 'from-purple-500 to-pink-500'
      },
      {
        name: 'Exploit Dev',
        level: Math.min(exploitDevData.level, 20),
        xp: exploitDevData.xpInCurrentLevel,
        nextLevelXp: 150,
        icon: '💉',
        color: 'from-red-500 to-orange-500'
      },
      {
        name: 'Bug Hunting',
        level: Math.min(bugHuntingData.level, 20),
        xp: bugHuntingData.xpInCurrentLevel,
        nextLevelXp: 150,
        icon: '🐛',
        color: 'from-green-500 to-emerald-500'
      }
    ];
  }

  function calculatePowerLevel(): number {
    if (!$userStore) return 0;
    const xpScore = $userStore.totalXP * 0.1;
    const taskScore = completedTasks * 50;
    const bugScore = ($userStore.bugsFound || 0) * 200;
    const bountyScore = ($userStore.totalBounty || 0) * 0.5;
    return Math.floor(xpScore + taskScore + bugScore + bountyScore);
  }

  function getRarityColor(rarity: string) {
    const colors = {
      common: 'from-gray-500 to-gray-600',
      rare: 'from-blue-500 to-blue-600',
      epic: 'from-purple-500 to-purple-600',
      legendary: 'from-yellow-500 to-orange-600'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  }

  function getRarityGlow(rarity: string) {
    const glows = {
      common: '',
      rare: 'shadow-lg shadow-blue-500/25',
      epic: 'shadow-lg shadow-purple-500/25',
      legendary: 'shadow-xl shadow-yellow-500/30 animate-pulse-glow'
    };
    return glows[rarity as keyof typeof glows] || '';
  }

  function getAchievements(): Achievement[] {
    const achievementsList: Achievement[] = [];
    
    // Common achievements
    achievementsList.push({
      id: 'first-steps',
      title: 'First Steps',
      description: 'Complete your first task',
      icon: '🌱',
      rarity: 'common',
      points: 10,
      earned: completedTasks >= 1,
      progress: Math.min(completedTasks, 1),
      maxProgress: 1
    });
    
    achievementsList.push({
      id: 'dedicated',
      title: 'Dedicated Learner',
      description: 'Complete 25 tasks',
      icon: '📚',
      rarity: 'rare',
      points: 50,
      earned: completedTasks >= 25,
      progress: Math.min(completedTasks, 25),
      maxProgress: 25
    });
    
    // Epic achievements
    achievementsList.push({
      id: 'xp-hunter',
      title: 'XP Hunter',
      description: 'Earn 5000 XP',
      icon: '⚡',
      rarity: 'epic',
      points: 100,
      earned: !!($userStore && $userStore.totalXP >= 5000),
      progress: $userStore?.totalXP || 0,
      maxProgress: 5000
    });
    
    achievementsList.push({
      id: 'bug-slayer',
      title: 'Bug Slayer',
      description: 'Find 10 vulnerabilities',
      icon: '🗡️',
      rarity: 'epic',
      points: 150,
      earned: !!($userStore && ($userStore.bugsFound || 0) >= 10),
      progress: $userStore?.bugsFound || 0,
      maxProgress: 10
    });
    
    // Legendary achievements
    achievementsList.push({
      id: 'bounty-master',
      title: 'Bounty Master',
      description: 'Earn $1000 in bounties',
      icon: '💎',
      rarity: 'legendary',
      points: 500,
      earned: !!($userStore && ($userStore.totalBounty || 0) >= 1000),
      progress: $userStore?.totalBounty || 0,
      maxProgress: 1000
    });
    
    achievementsList.push({
      id: 'completionist',
      title: 'The Completionist',
      description: 'Complete 100% of all tasks',
      icon: '👑',
      rarity: 'legendary',
      points: 1000,
      earned: completedTasks === totalTasks && totalTasks > 0,
      progress: completedTasks,
      maxProgress: totalTasks
    });

    return achievementsList;
  }

  function getPlayerTitle(level: number) {
    if (level >= 50) return '🏆 Legendary Hacker';
    if (level >= 30) return '⚔️ Elite Hunter';
    if (level >= 20) return '🎯 Skilled Researcher';
    if (level >= 10) return '🚀 Rising Star';
    if (level >= 5) return '🌟 Apprentice';
    return '🌱 Newcomer';
  }

  function unlockAchievement(achievement: Achievement) {
    unlockedAchievement = achievement;
    setTimeout(() => unlockedAchievement = null, 5000);
  }

  // Create enhanced user data with auth email fallback
  $: enhancedUserData = $userStore ? {
    ...$userStore,
    email: $userStore.email || user?.email || 'No email available'
  } : null;

  $: totalAchievementPoints = achievements.reduce((sum, a) => a.earned ? sum + a.points : sum, 0);
  $: achievementProgress = achievements.filter(a => a.earned).length / achievements.length * 100;
</script>

<Navbar />

<!-- Achievement Unlocked Animation -->
{#if unlockedAchievement}
  <div class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
    <div class="bg-gradient-to-r {getRarityColor(unlockedAchievement.rarity)} p-6 rounded-2xl shadow-2xl text-white">
      <div class="flex items-center gap-4">
        <div class="text-5xl animate-spin-slow">{unlockedAchievement.icon}</div>
        <div>
          <p class="text-sm opacity-90">Achievement Unlocked!</p>
          <h3 class="text-xl font-bold">{unlockedAchievement.title}</h3>
          <p class="text-sm opacity-90">+{unlockedAchievement.points} points</p>
        </div>
      </div>
    </div>
  </div>
{/if}

<div class="min-h-screen bg-gray-900">
  {#if $userStore}
    <!-- Gamified Header with Parallax Effect -->
    <div class="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 overflow-hidden">
      <!-- Animated Background -->
      <div class="absolute inset-0">
        <div class="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style="animation-delay: 2s;"></div>
        <div class="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style="animation-delay: 4s;"></div>
      </div>
      
      <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div class="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
          <!-- Avatar with Level Ring -->
          <div class="relative group">
            <div class="relative">
              <!-- Animated ring -->
              <svg class="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  stroke-width="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  stroke-width="3"
                  stroke-dasharray="{$userProgress?.percentage || 0}, 100"
                  class="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient">
                    <stop offset="0%" stop-color="#06b6d4" />
                    <stop offset="100%" stop-color="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              
              <!-- Avatar -->
              <div class="absolute inset-2 sm:inset-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-4xl sm:text-5xl font-bold text-white shadow-2xl group-hover:scale-110 transition-transform">
                {avatarEmoji}
              </div>
              
              <!-- Level Badge -->
              <div class="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full px-3 py-1 text-white font-bold text-sm shadow-lg">
                LV {$userProgress?.level || 1}
              </div>
            </div>
          </div>
          
          <!-- User Info & Stats -->
          <div class="flex-1 text-center lg:text-left">
            <div class="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-4">
              <div>
                <h1 class="text-3xl sm:text-4xl font-bold text-white mb-1">{$userStore.username}</h1>
                <p class="text-lg text-cyan-400 font-medium mb-2">{getPlayerTitle($userProgress?.level || 1)}</p>
                <p class="text-gray-400">{enhancedUserData?.email}</p>
              </div>
              
              <!-- Power Level Display -->
              <div class="bg-gray-800/50 backdrop-blur rounded-xl px-6 py-3 border border-gray-700">
                <div class="text-center">
                  <p class="text-xs text-gray-400 uppercase tracking-wider">Power Level</p>
                  <p class="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {powerLevel.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Quick Stats Bar -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div class="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
                <p class="text-2xl font-bold text-cyan-400">{$userStore.totalXP.toLocaleString()}</p>
                <p class="text-xs text-gray-400">Total XP</p>
              </div>
              <div class="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
                <p class="text-2xl font-bold text-green-400">{completedTasks}</p>
                <p class="text-xs text-gray-400">Tasks Done</p>
              </div>
              <div class="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
                <p class="text-2xl font-bold text-purple-400">{$userStore.bugsFound || 0}</p>
                <p class="text-xs text-gray-400">Bugs Found</p>
              </div>
              <div class="bg-gray-800/50 backdrop-blur rounded-lg p-3 text-center">
                <p class="text-2xl font-bold text-yellow-400">${($userStore.totalBounty || 0).toLocaleString()}</p>
                <p class="text-xs text-gray-400">Earned</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gamified Tab Navigation -->
    <div class="bg-gray-800 border-b border-gray-700 sticky top-16 z-40">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex overflow-x-auto no-scrollbar">
          {#each [
            { id: 'overview', label: 'Overview', icon: '🎮' },
            { id: 'skills', label: 'Skills', icon: '⚔️' },
            { id: 'achievements', label: 'Achievements', icon: '🏆' },
            { id: 'leaderboard', label: 'Leaderboard', icon: '🏅' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ] as tab}
            <button
              on:click={() => activeTab = tab.id as typeof activeTab}
              class="flex items-center gap-2 px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap transition-all {
                activeTab === tab.id
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-gray-700/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }"
            >
              <span class="text-lg">{tab.icon}</span>
              <span class="hidden sm:inline">{tab.label}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {#if activeTab === 'overview'}
        <!-- Overview Tab Content (keeping same as before) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <!-- Stats Cards -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Achievement Progress Card -->
            <div class="bg-gray-800 rounded-2xl p-6 border border-gray-700 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <span class="text-2xl">🏆</span> Achievement Points
                  </h3>
                  <span class="text-2xl font-bold text-yellow-400">{totalAchievementPoints}</span>
                </div>
                <div class="mb-2">
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-400">Achievement Completion</span>
                    <span class="text-cyan-400">{Math.round(achievementProgress)}%</span>
                  </div>
                  <div class="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      class="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 relative overflow-hidden"
                      style="width: {achievementProgress}%"
                    >
                      <div class="absolute inset-0 bg-white/20 animate-shimmer"></div>
                    </div>
                  </div>
                </div>
                <p class="text-sm text-gray-400 mt-3">
                  {achievements.filter(a => a.earned).length} of {achievements.length} achievements unlocked
                </p>
              </div>
            </div>

            <!-- Daily Quests Card -->
            <div class="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span class="text-2xl">🎯</span> Daily Quests
              </h3>
              <div class="space-y-3">
                {#each [
                  { name: 'Complete 3 tasks', progress: 2, max: 3, xp: 100, icon: '✅' },
                  { name: 'Earn 500 XP', progress: 350, max: 500, xp: 150, icon: '⚡' },
                  { name: 'Study for 2 hours', progress: 1.5, max: 2, xp: 200, icon: '📚' }
                ] as quest}
                  <div class="bg-gray-700/50 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <span class="text-xl">{quest.icon}</span>
                        <span class="text-white font-medium">{quest.name}</span>
                      </div>
                      <span class="text-sm text-cyan-400">+{quest.xp} XP</span>
                    </div>
                    <div class="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style="width: {Math.min((quest.progress / quest.max) * 100, 100)}%"
                      ></div>
                    </div>
                    <p class="text-xs text-gray-400 mt-1">{quest.progress}/{quest.max}</p>
                  </div>
                {/each}
              </div>
            </div>

            <!-- Learning Streak -->
            <div class="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-500/30">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-bold text-white mb-1">🚀 Keep Learning!</h3>
                  <p class="text-2xl font-bold text-orange-400">Level {$userProgress?.level || 1}</p>
                  <p class="text-sm text-gray-400 mt-1">Continue your journey to mastery</p>
                </div>
                <div class="text-6xl animate-pulse">🎯</div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-6">
            <!-- Next Rewards -->
            <div class="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 class="text-lg font-bold text-white mb-4">🎁 Next Rewards</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">🎖️</span>
                    <div>
                      <p class="text-sm text-white">Level {($userProgress?.level || 0) + 1}</p>
                      <p class="text-xs text-gray-400">{$userProgress?.xpPerLevel - $userProgress?.currentLevelXP || 0} XP</p>
                    </div>
                  </div>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <div class="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">💎</span>
                    <div>
                      <p class="text-sm text-white">Elite Badge</p>
                      <p class="text-xs text-gray-400">10 more bugs</p>
                    </div>
                  </div>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 class="text-lg font-bold text-white mb-4">⚡ Quick Actions</h3>
              <div class="grid grid-cols-2 gap-3">
                <a href="/tasks" class="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg p-4 text-center hover:scale-105 transition-transform">
                  <span class="text-2xl block mb-1">📋</span>
                  <span class="text-sm text-white font-medium">Tasks</span>
                </a>
                <a href="/journal" class="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-4 text-center hover:scale-105 transition-transform">
                  <span class="text-2xl block mb-1">📔</span>
                  <span class="text-sm text-white font-medium">Journal</span>
                </a>
                <a href="/bugs" class="bg-gradient-to-r from-red-500 to-orange-600 rounded-lg p-4 text-center hover:scale-105 transition-transform">
                  <span class="text-2xl block mb-1">🐛</span>
                  <span class="text-sm text-white font-medium">Bugs</span>
                </a>
                <a href="/roadmap" class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-center hover:scale-105 transition-transform">
                  <span class="text-2xl block mb-1">🗺️</span>
                  <span class="text-sm text-white font-medium">Roadmap</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      {/if}

      {#if activeTab === 'skills'}
        <!-- Skills Tab Content (FIXED) -->
        <div class="max-w-4xl mx-auto">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {#each skills as skill}
              <div class="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-cyan-500/50 transition-all">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <span class="text-3xl">{skill.icon}</span>
                    <div>
                      <h3 class="font-bold text-white">{skill.name}</h3>
                      <p class="text-sm text-gray-400">Level {skill.level}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-cyan-400 font-medium">{skill.xp} XP</p>
                    <p class="text-xs text-gray-500">{skill.nextLevelXp - skill.xp} to next</p>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      class="bg-gradient-to-r {skill.color} h-3 rounded-full transition-all duration-1000 relative overflow-hidden"
                      style="width: {Math.min((skill.xp / skill.nextLevelXp) * 100, 100)}%"
                    >
                      <div class="absolute inset-0 bg-white/20 animate-shimmer"></div>
                    </div>
                  </div>
                  <div class="flex justify-between text-xs">
                    <span class="text-gray-500">Progress</span>
                    <span class="text-gray-400">{Math.round(Math.min((skill.xp / skill.nextLevelXp) * 100, 100))}%</span>
                  </div>
                </div>
                {#if skill.level >= 20}
                  <div class="mt-3 text-xs text-yellow-400 flex items-center gap-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    MAX LEVEL
                  </div>
                {/if}
              </div>
            {/each}
          </div>
          
          <!-- Skill Tree Preview -->
          <div class="mt-8 bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 class="text-xl font-bold text-white mb-4">🌳 Skill Tree Preview</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {#each ['Web Exploitation', 'Binary Exploitation', 'Cloud Security'] as branch}
                <div class="bg-gray-700/50 rounded-lg p-4 text-center hover:bg-gray-700 transition-colors">
                  <div class="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 class="text-white font-medium mb-1">{branch}</h4>
                  <p class="text-xs text-gray-400">Unlock at Level 15</p>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      {#if activeTab === 'achievements'}
        <!-- Achievements Tab Content (keeping same as before) -->
        <div class="max-w-6xl mx-auto">
          <!-- Achievement Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
              <p class="text-3xl font-bold text-yellow-400">{totalAchievementPoints}</p>
              <p class="text-sm text-gray-400">Total Points</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
              <p class="text-3xl font-bold text-cyan-400">{achievements.filter(a => a.earned).length}</p>
              <p class="text-sm text-gray-400">Unlocked</p>
            </div>
            <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
              <p class="text-3xl font-bold text-purple-400">{Math.round(achievementProgress)}%</p>
              <p class="text-sm text-gray-400">Completion</p>
            </div>
          </div>
          
          <!-- Achievement Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each achievements as achievement}
              <div class="relative group">
                <div class={`bg-gray-800 rounded-2xl p-6 border-2 transition-all h-full ${
                  achievement.earned 
                    ? `border-transparent bg-gradient-to-br ${getRarityColor(achievement.rarity)} p-[2px]` 
                    : 'border-gray-700 opacity-60'
                } ${getRarityGlow(achievement.rarity)}`}>
                  <div class="bg-gray-800 rounded-2xl p-6 h-full flex flex-col">
                    <div class="flex items-start justify-between mb-4">
                      <div class="text-4xl {achievement.earned ? '' : 'grayscale opacity-50'}">{achievement.icon}</div>
                      <div class="text-right">
                        <p class="text-2xl font-bold text-yellow-400">+{achievement.points}</p>
                        <p class="text-xs text-gray-400 capitalize">{achievement.rarity}</p>
                      </div>
                    </div>
                    <h3 class="font-bold text-white mb-1">{achievement.title}</h3>
                    <p class="text-sm text-gray-400 mb-3 flex-grow">{achievement.description}</p>
                    
                    {#if achievement.maxProgress}
                      <div class="mt-auto">
                        <div class="flex justify-between text-xs mb-1">
                          <span class="text-gray-500">Progress</span>
                          <span class="text-gray-400">{achievement.progress || 0}/{achievement.maxProgress}</span>
                        </div>
                        <div class="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            class="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                            style="width: {Math.min(((achievement.progress || 0) / achievement.maxProgress) * 100, 100)}%"
                          ></div>
                        </div>
                      </div>
                    {:else if achievement.earned}
                      <div class="flex items-center text-xs text-green-400">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Completed
                      </div>
                    {:else}
                      <div class="text-xs text-gray-500">🔒 Locked</div>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      {#if activeTab === 'leaderboard'}
        <!-- Leaderboard Tab Content (keeping same as before) -->
        <div class="max-w-4xl mx-auto">
          <div class="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div class="p-8 text-center">
              <div class="text-6xl mb-4">🏆</div>
              <h3 class="text-2xl font-bold text-white mb-2">Leaderboard Coming Soon!</h3>
              <p class="text-gray-400 max-w-md mx-auto">
                Compete with other bug hunters worldwide. Track your global ranking, compare stats, and climb to the top!
              </p>
              <div class="mt-6 inline-flex items-center gap-2 text-sm text-cyan-400">
                <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Under Development</span>
              </div>
            </div>
          </div>
        </div>
      {/if}

      {#if activeTab === 'settings'}
        <!-- Settings Tab - IMPORTANT: Pass the enhanced user data -->
        <ProfileSettings userStoreData={enhancedUserData} />
      {/if}
    </div>
  {/if}
</div>

<style>
  @keyframes float {
    0%, 100% { transform: translateY(0) translateX(0); }
    25% { transform: translateY(-20px) translateX(10px); }
    50% { transform: translateY(10px) translateX(-10px); }
    75% { transform: translateY(-10px) translateX(5px); }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes bounce-in {
    0% { transform: scale(0) translateX(-50%); opacity: 0; }
    50% { transform: scale(1.1) translateX(-50%); }
    100% { transform: scale(1) translateX(-50%); opacity: 1; }
  }
  
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.3); }
    50% { box-shadow: 0 0 30px rgba(234, 179, 8, 0.5); }
  }
  
  .animate-float {
    animation: float 20s ease-in-out infinite;
  }
  
  .animate-shimmer {
    animation: shimmer 2s linear infinite;
  }
  
  .animate-bounce-in {
    animation: bounce-in 0.5s ease-out;
  }
  
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  /* Hide scrollbar for tab navigation */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>