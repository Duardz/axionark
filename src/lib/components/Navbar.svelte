<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { userStore, userProgress } from '$lib/stores/user';
  
  let mobileMenuOpen = false;
  
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
</script>

<nav class="bg-black/90 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
  <div class="container mx-auto px-4">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <a href="/dashboard" class="flex items-center space-x-3 group">
        <div class="relative">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform neon-glow">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <span class="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AXIONARK
        </span>
      </a>
      
      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-1">
        <a 
          href="/dashboard" 
          class={`px-4 py-2 rounded-lg font-medium transition-all ${
            isActive('/dashboard') 
              ? 'bg-blue-500/20 text-blue-400 neon-text' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          Dashboard
        </a>
        <a 
          href="/roadmap" 
          class={`px-4 py-2 rounded-lg font-medium transition-all ${
            isActive('/roadmap') 
              ? 'bg-blue-500/20 text-blue-400 neon-text' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          Roadmap
        </a>
        <a 
          href="/tasks" 
          class={`px-4 py-2 rounded-lg font-medium transition-all ${
            isActive('/tasks') 
              ? 'bg-blue-500/20 text-blue-400 neon-text' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          Tasks
        </a>
        <a 
          href="/journal" 
          class={`px-4 py-2 rounded-lg font-medium transition-all ${
            isActive('/journal') 
              ? 'bg-blue-500/20 text-blue-400 neon-text' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          Journal
        </a>
        <a 
          href="/bugs" 
          class={`px-4 py-2 rounded-lg font-medium transition-all ${
            isActive('/bugs') 
              ? 'bg-blue-500/20 text-blue-400 neon-text' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          Bugs
        </a>
        <a 
          href="/profile" 
          class={`px-4 py-2 rounded-lg font-medium transition-all ${
            isActive('/profile') 
              ? 'bg-blue-500/20 text-blue-400 neon-text' 
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          Profile
        </a>
      </div>
      
      <!-- User Menu -->
      <div class="hidden md:flex items-center space-x-4">
        {#if $userStore && $userProgress}
          <div class="flex items-center space-x-3 text-sm">
            <div class="text-right">
              <div class="text-gray-400">Level {$userProgress.level}</div>
              <div class="text-xs text-gray-500">{$userStore.totalXP} XP</div>
            </div>
            <div class="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style="width: {$userProgress.percentage}%"
              ></div>
            </div>
            <div class="h-8 w-px bg-gray-700"></div>
            <div class="text-gray-300 font-medium">{$userStore.username}</div>
          </div>
        {/if}
        <button
          on:click={handleSignOut}
          class="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
        >
          Logout
        </button>
      </div>
      
      <!-- Mobile menu button -->
      <button
        on:click={() => mobileMenuOpen = !mobileMenuOpen}
        class="md:hidden rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
      >
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div class="md:hidden border-t border-gray-800 py-4 animate-slide-up">
        <div class="space-y-1">
          <a 
            href="/dashboard" 
            class={`block px-4 py-2 rounded-lg text-sm font-medium ${
              isActive('/dashboard') 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
            on:click={() => mobileMenuOpen = false}
          >
            Dashboard
          </a>
          <a 
            href="/roadmap" 
            class={`block px-4 py-2 rounded-lg text-sm font-medium ${
              isActive('/roadmap') 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
            on:click={() => mobileMenuOpen = false}
          >
            Roadmap
          </a>
          <a 
            href="/tasks" 
            class={`block px-4 py-2 rounded-lg text-sm font-medium ${
              isActive('/tasks') 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
            on:click={() => mobileMenuOpen = false}
          >
            Tasks
          </a>
          <a 
            href="/journal" 
            class={`block px-4 py-2 rounded-lg text-sm font-medium ${
              isActive('/journal') 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
            on:click={() => mobileMenuOpen = false}
          >
            Journal
          </a>
          <a 
            href="/bugs" 
            class={`block px-4 py-2 rounded-lg text-sm font-medium ${
              isActive('/bugs') 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
            on:click={() => mobileMenuOpen = false}
          >
            Bugs
          </a>
          <a 
            href="/profile" 
            class={`block px-4 py-2 rounded-lg text-sm font-medium ${
              isActive('/profile') 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
            on:click={() => mobileMenuOpen = false}
          >
            Profile
          </a>
          <div class="border-t border-gray-800 mt-4 pt-4">
            {#if $userStore}
              <div class="px-4 py-2 space-y-1">
                <p class="text-sm text-gray-400">Signed in as</p>
                <p class="text-sm font-medium text-gray-200">{$userStore.username}</p>
                <p class="text-xs text-gray-500">Level {$userProgress.level} • {$userStore.totalXP} XP</p>
              </div>
            {/if}
            <button
              on:click={handleSignOut}
              class="block w-full text-left px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</nav>