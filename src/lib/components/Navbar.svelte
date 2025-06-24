<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { userStore } from '$lib/stores/user';
  
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

<nav class="bg-white shadow-lg sticky top-0 z-50">
  <div class="container mx-auto px-4">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <a href="/dashboard" class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <span class="font-bold text-xl text-gray-900">BugHunter</span>
      </a>
      
      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-8">
        <a 
          href="/dashboard" 
          class={`font-medium transition-colors ${isActive('/dashboard') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
        >
          Dashboard
        </a>
        <a 
          href="/roadmap" 
          class={`font-medium transition-colors ${isActive('/roadmap') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
        >
          Roadmap
        </a>
        <a 
          href="/tasks" 
          class={`font-medium transition-colors ${isActive('/tasks') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
        >
          Tasks
        </a>
        <a 
          href="/journal" 
          class={`font-medium transition-colors ${isActive('/journal') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
        >
          Journal
        </a>
        <a 
          href="/bugs" 
          class={`font-medium transition-colors ${isActive('/bugs') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
        >
          Bugs
        </a>
        <a 
          href="/profile" 
          class={`font-medium transition-colors ${isActive('/profile') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
        >
          Profile
        </a>
      </div>
      
      <!-- User Menu -->
      <div class="hidden md:flex items-center space-x-4">
        {#if $userStore}
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">Level {Math.floor($userStore.totalXP / 1000) + 1}</span>
            <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span class="text-sm font-medium text-gray-900">{$userStore.username}</span>
          </div>
        {/if}
        <button
          on:click={handleSignOut}
          class="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
      
      <!-- Mobile menu button -->
      <button
        on:click={() => mobileMenuOpen = !mobileMenuOpen}
        class="md:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none"
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
      <div class="md:hidden border-t border-gray-200 py-2">
        <div class="space-y-1">
          <a 
            href="/dashboard" 
            class={`block px-4 py-2 text-sm font-medium rounded-md ${isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
            on:click={() => mobileMenuOpen = false}
          >
            Dashboard
          </a>
          <a 
            href="/roadmap" 
            class={`block px-4 py-2 text-sm font-medium rounded-md ${isActive('/roadmap') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
            on:click={() => mobileMenuOpen = false}
          >
            Roadmap
          </a>
          <a 
            href="/tasks" 
            class={`block px-4 py-2 text-sm font-medium rounded-md ${isActive('/tasks') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
            on:click={() => mobileMenuOpen = false}
          >
            Tasks
          </a>
          <a 
            href="/journal" 
            class={`block px-4 py-2 text-sm font-medium rounded-md ${isActive('/journal') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
            on:click={() => mobileMenuOpen = false}
          >
            Journal
          </a>
          <a 
            href="/bugs" 
            class={`block px-4 py-2 text-sm font-medium rounded-md ${isActive('/bugs') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
            on:click={() => mobileMenuOpen = false}
          >
            Bugs
          </a>
          <a 
            href="/profile" 
            class={`block px-4 py-2 text-sm font-medium rounded-md ${isActive('/profile') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
            on:click={() => mobileMenuOpen = false}
          >
            Profile
          </a>
          <div class="border-t border-gray-200 mt-2 pt-2">
            {#if $userStore}
              <div class="px-4 py-2">
                <p class="text-sm text-gray-600">Signed in as</p>
                <p class="text-sm font-medium text-gray-900">{$userStore.username}</p>
              </div>
            {/if}
            <button
              on:click={handleSignOut}
              class="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</nav>