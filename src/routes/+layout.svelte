// src/routes/+layout.svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { authStore } from '$lib/stores/auth';
  import { userStore, journalStore, bugStore } from '$lib/stores/user';
  import { browser } from '$app/environment';
  import '../app.css';

  let darkMode = false;
  let activityTimer: NodeJS.Timeout | null = null;
  let lastActivity = Date.now();
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  onMount(() => {
    // Initialize auth store
    authStore.initialize();
    
    // Check for saved theme preference or default to light mode
    if (browser) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        darkMode = true;
        document.documentElement.classList.add('dark');
      }
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('theme')) {
          darkMode = e.matches;
          document.documentElement.classList.toggle('dark', darkMode);
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      // Activity monitoring for auto-logout
      const updateActivity = () => {
        lastActivity = Date.now();
      };
      
      const checkInactivity = () => {
        if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
          authStore.signOut();
          alert('You have been logged out due to inactivity.');
        }
      };
      
      // Monitor user activity
      document.addEventListener('mousedown', updateActivity);
      document.addEventListener('keydown', updateActivity);
      document.addEventListener('touchstart', updateActivity);
      
      // Check for inactivity every minute
      activityTimer = setInterval(checkInactivity, 60000);
      
      // Cleanup function
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
        document.removeEventListener('mousedown', updateActivity);
        document.removeEventListener('keydown', updateActivity);
        document.removeEventListener('touchstart', updateActivity);
        if (activityTimer) {
          clearInterval(activityTimer);
        }
      };
    }
  });

  onDestroy(() => {
    // Clean up all subscriptions and listeners
    authStore.cleanup();
    userStore.cleanup();
    journalStore.cleanup();
    bugStore.cleanup();
    
    // Clear activity timer
    if (activityTimer) {
      clearInterval(activityTimer);
    }
  });

  function toggleDarkMode() {
    if (!browser) return;
    
    darkMode = !darkMode;
    document.documentElement.classList.toggle('dark', darkMode);
    
    try {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
  <!-- Theme toggle button -->
  <button
    on:click={toggleDarkMode}
    class="fixed bottom-4 right-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    aria-label="Toggle dark mode"
  >
    {#if darkMode}
      <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    {:else}
      <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    {/if}
  </button>
  
  <!-- Skip to main content for accessibility -->
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-indigo-600 text-white px-4 py-2 rounded-md">
    Skip to main content
  </a>
  
  <main id="main-content">
    <slot />
  </main>
</div>