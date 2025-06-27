<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { authStore } from '$lib/stores/auth';
  import { userStore, journalStore, bugStore } from '$lib/stores/user';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import Footer from '$lib/components/Footer.svelte';
  import '../app.css';

  let darkMode = false;
  let activityTimer: NodeJS.Timeout | null = null;
  let lastActivity = Date.now();
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  let scrollProgress = 0;
  let showScrollTop = false;

  // Check if we're on a public page (landing, about, sponsors)
  $: isPublicPage = $page.url.pathname === '/' || 
                    $page.url.pathname === '/about' || 
                    $page.url.pathname === '/sponsors' ||
                    $page.url.pathname === '/signin';
  
  // Show authenticated footer only on authenticated pages
  $: showAuthenticatedFooter = !isPublicPage && $page.url.pathname !== '/';

  onMount(() => {
    // Initialize auth store
    authStore.initialize();
    
    // Scroll progress indicator
    const updateScrollProgress = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      scrollProgress = (winScroll / height) * 100;
      showScrollTop = winScroll > 300;
    };
    
    window.addEventListener('scroll', updateScrollProgress);
    
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
        window.removeEventListener('scroll', updateScrollProgress);
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
  
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors flex flex-col">
  <!-- Scroll Progress Bar -->
  <div class="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-[60]">
    <div 
      class="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
      style="width: {scrollProgress}%"
    ></div>
  </div>
  
  <!-- Scroll to Top Button -->
  {#if showScrollTop}
    <button
      on:click={scrollToTop}
      class="fixed bottom-20 right-4 z-50 p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 animate-fade-in-up"
      aria-label="Scroll to top"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  {/if}
  
  <!-- Skip to main content for accessibility -->
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-indigo-600 text-white px-4 py-2 rounded-md z-50">
    Skip to main content
  </a>
  
  <main id="main-content" class="flex-grow">
    <slot />
  </main>
  
  <!-- Footer - Only show authenticated footer on authenticated pages -->
  {#if showAuthenticatedFooter}
    <Footer />
  {/if}
</div>

<style>
  /* Add fade in animation for scroll button */
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.3s ease-out;
  }
</style>