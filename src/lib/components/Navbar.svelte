<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { userStore, userProgress } from '$lib/stores/user';
  import { onMount } from 'svelte';
  
  let mobileMenuOpen = false;
  let profileMenuOpen = false;
  let showProgressTooltip = false;
  
  // Auto-close mobile menu on route change
  $: if ($page.url.pathname) {
    mobileMenuOpen = false;
  }
  
  // Close menus when clicking outside
  onMount(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        mobileMenuOpen = false;
      }
      if (!target.closest('.profile-menu') && !target.closest('.profile-menu-button')) {
        profileMenuOpen = false;
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });
  
  async function handleSignOut() {
    try {
      await authStore.signOut();
      goto('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
  
  function isActive(path: string) {
    return $page.url.pathname === path;
  }
  
  function getActiveClass(path: string) {
    return isActive(path) 
      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105' 
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800';
  }
  
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    profileMenuOpen = false;
  }
  
  function toggleProfileMenu() {
    profileMenuOpen = !profileMenuOpen;
    mobileMenuOpen = false;
  }
</script>

<nav class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-all duration-300">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <a href="/dashboard" class="flex items-center space-x-3 group">
        <div class="relative">
          <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-all duration-300 shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-bounce-subtle opacity-80"></div>
        </div>
        <div class="hidden sm:block">
          <span class="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AXIONARK
          </span>
          <div class="text-xs text-gray-500 dark:text-gray-400 -mt-1">Elite Training</div>
        </div>
      </a>
      
      <!-- Desktop Navigation -->
      <div class="hidden lg:flex items-center space-x-2">
        {#each [
          { href: '/dashboard', label: 'Dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z' },
          { href: '/roadmap', label: 'Roadmap', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
          { href: '/tasks', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          { href: '/journal', label: 'Journal', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
          { href: '/bugs', label: 'Bugs', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }
        ] as navItem}
          <a 
            href={navItem.href} 
            class={`flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-300 ${getActiveClass(navItem.href)}`}
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={navItem.icon} />
            </svg>
            {navItem.label}
          </a>
        {/each}
      </div>
      
      <!-- User Progress & Profile (Desktop) -->
      <div class="hidden lg:flex items-center space-x-4">
        {#if $userStore && $userProgress}
          <!-- Progress Display -->
          <div 
            class="relative flex items-center space-x-3 text-sm bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-2 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
            on:mouseenter={() => showProgressTooltip = true}
            on:mouseleave={() => showProgressTooltip = false}
          >
            <div class="text-right">
              <div class="font-semibold text-gray-900 dark:text-white">Level {$userProgress.level}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{$userStore.totalXP} XP</div>
            </div>
            <div class="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000 animate-progress-fill"
                style="--progress-width: {$userProgress.percentage}%; width: {$userProgress.percentage}%"
              ></div>
            </div>
            
            <!-- Progress Tooltip -->
            {#if showProgressTooltip}
              <div class="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg z-50">
                {$userProgress.currentLevelXP}/{$userProgress.xpPerLevel} XP to next level
                <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
              </div>
            {/if}
          </div>
          
          <!-- Profile Menu -->
          <div class="relative profile-menu">
            <button
              class="profile-menu-button flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl px-4 py-2 font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              on:click={toggleProfileMenu}
            >
              <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm font-bold">
                {$userStore.username.charAt(0).toUpperCase()}
              </div>
              <span class="hidden xl:block">{$userStore.username}</span>
              <svg class="w-4 h-4 transform transition-transform {profileMenuOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {#if profileMenuOpen}
              <div class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-scale-in">
                <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {$userStore.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div class="font-semibold text-gray-900 dark:text-white">{$userStore.username}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">{$userStore.email}</div>
                    </div>
                  </div>
                </div>
                
                <div class="py-2">
                  <a href="/profile" class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </a>
                  
                  <div class="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                    <div class="flex justify-between mb-1">
                      <span>Bugs Found:</span>
                      <span class="font-semibold">{$userStore.bugsFound || 0}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Total Earnings:</span>
                      <span class="font-semibold text-green-600 dark:text-green-400">${$userStore.totalBounty || 0}</span>
                    </div>
                  </div>
                  
                  <button
                    on:click={handleSignOut}
                    class="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-200 dark:border-gray-700 mt-2"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
      
      <!-- Mobile menu button -->
      <button
        class="mobile-menu-button lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
        on:click={toggleMobileMenu}
      >
        <svg class="h-6 w-6 transform transition-transform duration-300 {mobileMenuOpen ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {#if mobileMenuOpen}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          {/if}
        </svg>
      </button>
    </div>
    
    <!-- Mobile Navigation -->
    {#if mobileMenuOpen}
      <div class="mobile-menu lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg animate-slide-up">
        <div class="px-4 py-4 space-y-2">
          <!-- Mobile Progress -->
          {#if $userStore && $userProgress}
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 mb-4">
              <div class="flex items-center justify-between text-white mb-3">
                <div>
                  <div class="font-bold text-lg">Level {$userProgress.level}</div>
                  <div class="text-sm opacity-90">{$userStore.totalXP} XP</div>
                </div>
                <div class="text-right">
                  <div class="font-semibold">{$userStore.username}</div>
                  <div class="text-sm opacity-90">{$userStore.bugsFound || 0} bugs • ${$userStore.totalBounty || 0}</div>
                </div>
              </div>
              <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-white rounded-full transition-all duration-1000"
                  style="width: {$userProgress.percentage}%"
                ></div>
              </div>
            </div>
          {/if}
          
          <!-- Mobile Navigation Links -->
          {#each [
            { href: '/dashboard', label: 'Dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z' },
            { href: '/roadmap', label: 'Roadmap', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
            { href: '/tasks', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { href: '/journal', label: 'Journal', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
            { href: '/bugs', label: 'Bugs', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
            { href: '/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
          ] as navItem}
            <a 
              href={navItem.href} 
              class={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${getActiveClass(navItem.href)}`}
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={navItem.icon} />
              </svg>
              {navItem.label}
            </a>
          {/each}
          
          <!-- Mobile Sign Out -->
          <button
            on:click={handleSignOut}
            class="w-full flex items-center px-4 py-3 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 border-t border-gray-200 dark:border-gray-700 mt-4 pt-4"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    {/if}
  </div>
</nav>

<style>
  .animate-progress-fill {
    animation: progressFill 1s ease-out forwards;
  }
  
  @keyframes progressFill {
    from {
      width: 0%;
    }
    to {
      width: var(--progress-width);
    }
  }
</style>