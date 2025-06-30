<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { userStore, userProgress } from '$lib/stores/user';
  import { getAvatarById, DEFAULT_AVATAR_ID } from '$lib/data/avatars';
  import { onMount } from 'svelte';
  
  let mobileMenuOpen = false;
  let profileMenuOpen = false;
  let showProgressTooltip = false;
  let scrolled = false;
  
  // Get current avatar emoji
  $: currentAvatar = $userStore?.avatar ? getAvatarById($userStore.avatar) : getAvatarById(DEFAULT_AVATAR_ID);
  $: avatarEmoji = currentAvatar?.emoji || '🐱';
  
  // Track scroll for navbar effects
  onMount(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 20;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
  
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
      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25' 
      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50';
  }
  
  function getActiveMobileClass(path: string) {
    return isActive(path) 
      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800';
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

<nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 {scrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl' : 'bg-transparent'}">
  <!-- Futuristic Top Bar -->
  <div class="h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
  
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16 lg:h-20">
      <!-- Enhanced Futuristic Logo - Smaller on mobile -->
      <a href="/dashboard" class="flex items-center space-x-2 sm:space-x-4 group">
        <div class="relative">
          <!-- Logo Container -->
          <div class="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14">
            <!-- Rotating Ring -->
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-xl sm:rounded-2xl opacity-20 group-hover:opacity-30 animate-spin-slow"></div>
            
            <!-- Main Logo -->
            <div class="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-500 shadow-lg shadow-cyan-500/50">
              <!-- Hexagon Shape -->
              <svg class="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 7L16 10V14L12 17L8 14V10L12 7Z" fill="currentColor" opacity="0.8"/>
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
              </svg>
            </div>
            
            <!-- Glow Effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl sm:rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity animate-pulse"></div>
            
            <!-- Corner Accents - Hidden on mobile -->
            <div class="hidden sm:block absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg"></div>
            <div class="hidden sm:block absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-purple-400 rounded-tr-lg"></div>
            <div class="hidden sm:block absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-blue-400 rounded-bl-lg"></div>
            <div class="hidden sm:block absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-pink-400 rounded-br-lg"></div>
          </div>
        </div>
        
        <div class="hidden sm:block">
          <div class="relative">
            <span class="font-black text-lg sm:text-xl lg:text-2xl tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              AXIONARK
            </span>
            <div class="text-[10px] font-medium tracking-[0.3em] text-gray-500 dark:text-gray-400 uppercase">
              Study. Hack. Repeat.
            </div>
            <!-- Underline Effect -->
            <div class="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
          </div>
        </div>
      </a>
      
      <!-- Desktop Navigation -->
      <div class="hidden lg:flex items-center space-x-1">
        {#each [
          { href: '/dashboard', label: 'Dashboard', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
          { href: '/roadmap', label: 'Roadmap', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
          { href: '/tasks', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          { href: '/journal', label: 'Journal', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
          { href: '/bugs', label: 'Bugs', icon: 'M12 8a4 4 0 100 8 4 4 0 000-8zM2 12a10 10 0 1110 10A10 10 0 012 12z' }
        ] as navItem}
          <a 
            href={navItem.href} 
            class={`relative flex items-center px-5 py-2.5 rounded-2xl font-medium transition-all duration-300 ${getActiveClass(navItem.href)} group`}
          >
            {#if isActive(navItem.href)}
              <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-2xl blur-xl"></div>
            {/if}
            <svg class="w-4 h-4 mr-2.5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={navItem.icon} />
            </svg>
            <span class="relative z-10">{navItem.label}</span>
            {#if isActive(navItem.href)}
              <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500"></div>
            {/if}
          </a>
        {/each}
      </div>
      
      <!-- User Progress & Profile (Desktop) -->
      <div class="hidden lg:flex items-center space-x-4">
        {#if $userStore && $userProgress}
          <!-- Futuristic Progress Display -->
          <div 
            class="relative flex items-center space-x-3 text-sm bg-gray-900/5 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl px-5 py-2.5 cursor-pointer transition-all hover:bg-gray-900/10 dark:hover:bg-white/10"
            on:mouseenter={() => showProgressTooltip = true}
            on:mouseleave={() => showProgressTooltip = false}
            role="button"
            tabindex="0"
          >
            <div class="text-right">
              <div class="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                <span class="text-xs text-cyan-500">LVL</span>
                {$userProgress.level}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 font-mono">{$userStore.totalXP} XP</div>
            </div>
            <div class="relative w-28 h-4 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                class="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full transition-all duration-1000 shadow-lg shadow-cyan-500/50"
                style="width: {$userProgress.percentage}%"
              >
                <div class="absolute inset-0 bg-white/20 animate-shimmer"></div>
              </div>
              <!-- Progress Segments -->
              <div class="absolute inset-0 flex">
                {#each Array(10) as _, i}
                  <div class="flex-1 border-r border-gray-300/30 dark:border-gray-600/30 last:border-r-0"></div>
                {/each}
              </div>
            </div>
            
            <!-- Progress Tooltip -->
            {#if showProgressTooltip}
              <div class="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-800 backdrop-blur-xl text-white text-xs rounded-xl px-4 py-3 whitespace-nowrap shadow-2xl z-50 border border-gray-700">
                <div class="font-mono text-cyan-400">{$userProgress.currentLevelXP}/{$userProgress.xpPerLevel} XP</div>
                <div class="text-gray-400 mt-1">Next level in {$userProgress.xpPerLevel - $userProgress.currentLevelXP} XP</div>
                <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-900 dark:bg-gray-800 rotate-45 border-l border-t border-gray-700"></div>
              </div>
            {/if}
          </div>
          
          <!-- Futuristic Profile Menu -->
          <div class="relative profile-menu">
            <button
              class="profile-menu-button flex items-center space-x-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white rounded-2xl px-5 py-2.5 font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 group"
              on:click={toggleProfileMenu}
            >
              <div class="relative">
                <div class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-lg ring-2 ring-white/30">
                  {avatarEmoji}
                </div>
                <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white"></div>
              </div>
              <span class="hidden xl:block">{$userStore.username}</span>
              <svg class="w-4 h-4 transform transition-transform {profileMenuOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {#if profileMenuOpen}
              <div class="absolute right-0 mt-3 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-scale-in">
                <!-- Profile Header -->
                <div class="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 p-5">
                  <div class="flex items-center space-x-4">
                    <div class="relative">
                      <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl ring-2 ring-white/30">
                        {avatarEmoji}
                      </div>
                      <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full ring-2 ring-white"></div>
                    </div>
                    <div class="text-white">
                      <div class="font-bold text-lg">{$userStore.username}</div>
                      <div class="text-sm opacity-90">{$userStore.email}</div>
                    </div>
                  </div>
                </div>
                
                <!-- Stats Grid -->
                <div class="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 p-px">
                  <div class="bg-white dark:bg-gray-800 p-4 text-center">
                    <div class="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{$userStore.bugsFound || 0}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Bugs Found</div>
                  </div>
                  <div class="bg-white dark:bg-gray-800 p-4 text-center">
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">${$userStore.totalBounty || 0}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Earnings</div>
                  </div>
                </div>
                
                <!-- Menu Items -->
                <div class="p-2">
                  <a href="/profile" class="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group">
                    <div class="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span class="font-medium">Profile Settings</span>
                    <svg class="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  
                  <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  
                  <button
                    on:click={handleSignOut}
                    class="w-full flex items-center px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors group"
                  >
                    <div class="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <span class="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
      
      <!-- Mobile: Compact User Info & Menu Button -->
      <div class="flex lg:hidden items-center space-x-2">
        {#if $userStore && $userProgress}
          <!-- Mobile Progress Badge -->
          <div class="flex items-center bg-gray-900/5 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-full px-3 py-1.5">
            <span class="text-xs font-bold text-gray-900 dark:text-white">
              LV{$userProgress.level}
            </span>
            <div class="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2"></div>
            <span class="text-xs text-gray-600 dark:text-gray-400 font-mono">
              {Math.round($userStore.totalXP / 1000)}K
            </span>
          </div>
        {/if}
        
        <!-- Mobile menu button -->
        <button
          class="mobile-menu-button relative w-10 h-10 rounded-xl bg-gray-900/5 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center group hover:bg-gray-900/10 dark:hover:bg-white/10 transition-all duration-300"
          on:click={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <div class="relative w-5 h-4 flex flex-col justify-between">
            <span class="block h-0.5 bg-gray-600 dark:bg-gray-400 rounded-full transition-all duration-300 {mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}"></span>
            <span class="block h-0.5 bg-gray-600 dark:bg-gray-400 rounded-full transition-all duration-300 {mobileMenuOpen ? 'opacity-0' : ''}"></span>
            <span class="block h-0.5 bg-gray-600 dark:bg-gray-400 rounded-full transition-all duration-300 {mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}"></span>
          </div>
        </button>
      </div>
    </div>
    
    <!-- Mobile Navigation -->
    {#if mobileMenuOpen}
      <div class="mobile-menu lg:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl animate-slide-down">
        <div class="px-4 py-4 space-y-2">
          <!-- Compact Mobile Progress Card -->
          {#if $userStore && $userProgress}
            <div class="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-xl p-4 mb-4">
              <div class="flex items-center justify-between text-white">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl ring-2 ring-white/30">
                    {avatarEmoji}
                  </div>
                  <div>
                    <div class="text-lg font-bold">Level {$userProgress.level}</div>
                    <div class="text-xs opacity-90">{$userStore.totalXP} XP</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-semibold">{$userStore.username}</div>
                  <div class="text-xs opacity-90">${$userStore.totalBounty || 0}</div>
                </div>
              </div>
              <div class="mt-3 relative w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  class="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-1000"
                  style="width: {$userProgress.percentage}%"
                >
                  <div class="absolute inset-0 bg-white/30 animate-shimmer"></div>
                </div>
              </div>
            </div>
          {/if}
          
          <!-- Mobile Navigation Links - Grid Layout for Compactness -->
          <div class="grid grid-cols-2 gap-2">
            {#each [
              { href: '/dashboard', label: 'Dashboard', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
              { href: '/roadmap', label: 'Roadmap', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
              { href: '/tasks', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { href: '/journal', label: 'Journal', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
              { href: '/bugs', label: 'Bugs', icon: 'M12 8a4 4 0 100 8 4 4 0 000-8zM2 12a10 10 0 1110 10A10 10 0 012 12z' },
              { href: '/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
            ] as navItem}
              <a 
                href={navItem.href} 
                class={`flex flex-col items-center justify-center px-4 py-4 rounded-xl font-medium text-sm transition-all duration-300 ${getActiveMobileClass(navItem.href)} backdrop-blur-sm`}
              >
                <svg class="w-5 h-5 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={navItem.icon} />
                </svg>
                <span>{navItem.label}</span>
                {#if isActive(navItem.href)}
                  <div class="w-1 h-1 bg-cyan-400 rounded-full mt-1 animate-pulse"></div>
                {/if}
              </a>
            {/each}
          </div>
          
          <!-- Mobile Sign Out - Full Width -->
          <button
            on:click={handleSignOut}
            class="w-full flex items-center justify-center px-4 py-3 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 border border-red-200 dark:border-red-800 mt-3"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Bottom Gradient Line -->
  <div class="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
</nav>

<!-- Spacer for fixed navbar -->
<div class="h-16 lg:h-20"></div>

<style>
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
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
  
  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-spin-slow {
    animation: spin-slow 20s linear infinite;
  }
  
  .animate-shimmer {
    animation: shimmer 2s linear infinite;
  }
  
  .animate-scale-in {
    animation: scale-in 0.2s ease-out;
  }
  
  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }
</style>