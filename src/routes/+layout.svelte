<!-- src/routes/+layout.svelte - Fixed Version with Proper Encryption Initialization -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { authStore } from '$lib/stores/auth';
  import { userStore, journalStore, bugStore } from '$lib/stores/user';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { 
    getEncryptionKeyAsync, 
    storeEncryptionKey, 
    initializeEncryption,
    restoreEncryptionFromSession,
    generateUserKey 
  } from '$lib/utils/encryption';
  import Footer from '$lib/components/Footer.svelte';
  import '../app.css';
  import { injectAnalytics } from '@vercel/analytics/sveltekit';
  import { dev } from '$app/environment';

  let darkMode = false;
  let activityTimer: NodeJS.Timeout | null = null;
  let lastActivity = Date.now();
  let warningTimer: NodeJS.Timeout | null = null;
  let showInactivityWarning = false;
  let storesInitialized = false;
  let showReAuthModal = false;
  let reAuthPassword = '';
  let reAuthLoading = false;
  let reAuthError = '';
  let encryptionInitialized = false;
  let encryptionCheckAttempts = 0;
  
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000; // Show warning 5 minutes before timeout
  const MAX_ENCRYPTION_CHECK_ATTEMPTS = 3;
  
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
    
    // Subscribe to auth changes and initialize stores once
    const authUnsubscribe = authStore.subscribe(async (user) => {
      if (user && !storesInitialized && !encryptionInitialized) {
        // Reset encryption check attempts for new user
        encryptionCheckAttempts = 0;
        
        // Try to initialize encryption
        await tryInitializeEncryption(user);
      } else if (!user) {
        // Clean up stores when user logs out
        userStore.cleanup();
        journalStore.cleanup();
        bugStore.cleanup();
        storesInitialized = false;
        encryptionInitialized = false;
        showReAuthModal = false;
        encryptionCheckAttempts = 0;
      }
    });
    
    // Only inject analytics in production
    if (!dev) {
      injectAnalytics({ mode: 'production' });
    }

    // Security: Prevent clickjacking
    if (browser && window.self !== window.top) {
      console.warn('Potential clickjacking attempt detected');
      document.body.style.display = 'none';
    }
    
    // Security: Clear sensitive data from console
    if (browser && import.meta.env.PROD) {
      console.log = () => {};
      console.debug = () => {};
      console.info = () => {};
    }
    
    // Scroll progress indicator
    const updateScrollProgress = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      scrollProgress = (winScroll / height) * 100;
      showScrollTop = winScroll > 300;
    };
    
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    
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
      
      // Enhanced activity monitoring for auto-logout
      const updateActivity = () => {
        lastActivity = Date.now();
        showInactivityWarning = false;
        
        // Clear warning timer if user is active
        if (warningTimer) {
          clearTimeout(warningTimer);
          warningTimer = null;
        }
      };
      
      const checkInactivity = () => {
        const inactiveTime = Date.now() - lastActivity;
        
        // Show warning before timeout
        if (inactiveTime > (INACTIVITY_TIMEOUT - WARNING_BEFORE_TIMEOUT) && !showInactivityWarning && $authStore) {
          showInactivityWarning = true;
          
          // Set timer for actual logout
          warningTimer = setTimeout(() => {
            if (Date.now() - lastActivity >= INACTIVITY_TIMEOUT) {
              handleInactivityLogout();
            }
          }, WARNING_BEFORE_TIMEOUT);
        }
        
        // Force logout if timeout exceeded
        if (inactiveTime > INACTIVITY_TIMEOUT && $authStore) {
          handleInactivityLogout();
        }
      };
      
      const handleInactivityLogout = async () => {
        showInactivityWarning = false;
        await authStore.signOut();
        alert('You have been logged out due to inactivity.');
      };
      
      // Monitor user activity with passive listeners for better performance
      const activityEvents = ['mousedown', 'keydown', 'touchstart', 'mousemove'];
      activityEvents.forEach(event => {
        document.addEventListener(event, updateActivity, { passive: true });
      });
      
      // Check for inactivity every minute
      activityTimer = setInterval(checkInactivity, 60000);
      
      // Security: Warn about unsaved changes when leaving
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        // Only warn if user is authenticated and might have unsaved data
        if ($authStore && (window.location.pathname.includes('/journal') || 
            window.location.pathname.includes('/bugs'))) {
          e.preventDefault();
          e.returnValue = '';
        }
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Security: Monitor for suspicious activity
      let rapidClickCount = 0;
      let rapidClickTimer: NodeJS.Timeout | null = null;
      
      const monitorRapidClicks = () => {
        rapidClickCount++;
        
        if (rapidClickCount > 50) {
          console.warn('Suspicious rapid clicking detected');
          // Could implement additional security measures here
        }
        
        if (!rapidClickTimer) {
          rapidClickTimer = setTimeout(() => {
            rapidClickCount = 0;
            rapidClickTimer = null;
          }, 1000);
        }
      };
      
      document.addEventListener('click', monitorRapidClicks, { passive: true });
      
      // Cleanup function
      return () => {
        authUnsubscribe();
        window.removeEventListener('scroll', updateScrollProgress);
        mediaQuery.removeEventListener('change', handleChange);
        activityEvents.forEach(event => {
          document.removeEventListener(event, updateActivity);
        });
        document.removeEventListener('click', monitorRapidClicks);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        
        if (activityTimer) {
          clearInterval(activityTimer);
        }
        if (warningTimer) {
          clearTimeout(warningTimer);
        }
        if (rapidClickTimer) {
          clearTimeout(rapidClickTimer);
        }
      };
    }
  });

  onDestroy(() => {
    // Only cleanup auth store on component destroy
    // Don't cleanup user stores here as they should persist during navigation
    authStore.cleanup();
    
    // Clear timers
    if (activityTimer) {
      clearInterval(activityTimer);
    }
    if (warningTimer) {
      clearTimeout(warningTimer);
    }
  });
  
  async function tryInitializeEncryption(user: any) {
    encryptionCheckAttempts++;
    
    try {
      // Step 1: Check if we have an encryption key in sessionStorage
      const sessionRestored = await restoreEncryptionFromSession(user.uid);
      
      if (sessionRestored) {
        console.log('Encryption restored from session');
        encryptionInitialized = true;
        await initializeUserStores(user.uid);
        return;
      }
      
      // Step 2: Try to initialize from IndexedDB
      const initialized = await initializeEncryption(user.uid);
      
      if (initialized) {
        console.log('Encryption initialized from IndexedDB');
        encryptionInitialized = true;
        await initializeUserStores(user.uid);
        return;
      }
      
      // Step 3: Check one more time with a delay (sometimes IndexedDB is slow)
      if (encryptionCheckAttempts < MAX_ENCRYPTION_CHECK_ATTEMPTS) {
        setTimeout(() => tryInitializeEncryption(user), 1000);
        return;
      }
      
      // Step 4: If we're not on a public page and still no key, show re-auth modal
      if (!isPublicPage) {
        showReAuthModal = true;
      } else {
        // On public pages, just initialize stores without encryption
        await initializeUserStores(user.uid);
      }
      
    } catch (error) {
      console.error('Error initializing encryption:', error);
      
      // If error and not on public page, show re-auth modal
      if (!isPublicPage) {
        showReAuthModal = true;
      }
    }
  }
  
  async function initializeUserStores(uid: string) {
    try {
      await userStore.loadProfile(uid);
      await journalStore.loadEntries(uid);
      await bugStore.loadBugs(uid);
      storesInitialized = true;
    } catch (error) {
      console.error('Error initializing stores:', error);
    }
  }
  
  async function handleReAuth() {
    if (!$authStore || !reAuthPassword) return;
    
    reAuthLoading = true;
    reAuthError = '';
    
    try {
      // Generate encryption key
      const encryptionKey = await generateUserKey($authStore.uid, reAuthPassword);
      
      // Store it persistently
      await storeEncryptionKey(encryptionKey, $authStore.uid);
      
      // Wait a moment for storage to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify it was stored
      const verified = await initializeEncryption($authStore.uid);
      
      if (!verified) {
        throw new Error('Failed to store encryption key');
      }
      
      // Clear the password
      reAuthPassword = '';
      
      // Hide modal
      showReAuthModal = false;
      encryptionInitialized = true;
      
      // Initialize stores
      await initializeUserStores($authStore.uid);
      
    } catch (error) {
      console.error('Re-authentication error:', error);
      reAuthError = 'Invalid password. Please try again.';
    } finally {
      reAuthLoading = false;
    }
  }

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
  
  function continueSession() {
    lastActivity = Date.now();
    showInactivityWarning = false;
    if (warningTimer) {
      clearTimeout(warningTimer);
      warningTimer = null;
    }
  }
</script>

<svelte:head>
  <!-- Security Headers via meta tags (actual headers should be set server-side) -->
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  
  <!-- Additional security meta tags -->
  {#if !isPublicPage}
    <meta name="robots" content="noindex, nofollow" />
  {/if}
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors flex flex-col">
  <!-- Re-authentication Modal -->
  {#if showReAuthModal && $authStore}
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Password Required for Decryption
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Your data is encrypted. Please enter your password to decrypt it.
          </p>
        </div>
        
        {#if reAuthError}
          <div class="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-700 dark:text-red-400">{reAuthError}</p>
          </div>
        {/if}
        
        <form on:submit|preventDefault={handleReAuth}>
          <div class="mb-4">
            <label for="reauth-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              id="reauth-password"
              type="password"
              bind:value={reAuthPassword}
              class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your password"
              required
              disabled={reAuthLoading}
            />
          </div>
          
          <div class="flex gap-3">
            <button
              type="submit"
              disabled={reAuthLoading || !reAuthPassword}
              class="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {reAuthLoading ? 'Decrypting...' : 'Decrypt Data'}
            </button>
            <button
              type="button"
              on:click={() => authStore.signOut()}
              class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
  
  <!-- Inactivity Warning Modal -->
  {#if showInactivityWarning}
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div class="text-center">
          <div class="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Session Timeout Warning
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            You will be logged out in 5 minutes due to inactivity. 
            Click continue to stay logged in.
          </p>
          <div class="flex gap-3">
            <button
              on:click={continueSession}
              class="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Continue Session
            </button>
            <button
              on:click={() => authStore.signOut()}
              class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
  
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
  
  /* Security: Prevent text selection on sensitive UI elements */
  button {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
</style>