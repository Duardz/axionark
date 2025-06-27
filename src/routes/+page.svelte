<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore, isAuthenticated } from '$lib/stores/auth';
  import { onMount, onDestroy } from 'svelte';
  import { validateEmail, validatePassword, sanitizeUsername } from '$lib/utils/security';
  import { auth } from '$lib/firebase';
  import { sendPasswordResetEmail } from 'firebase/auth';
  import LandingNav from '$lib/components/LandingNav.svelte';
  import LandingFooter from '$lib/components/LandingFooter.svelte';
  
  let loading = false;
  let error = '';
  let mode: 'signin' | 'signup' | 'reset' = 'signin';
  
  let email = '';
  let password = '';
  let username = '';
  let passwordConfirm = '';
  let showPassword = false;
  let passwordErrors: string[] = [];
  let formErrors: { [key: string]: string } = {};
  
  // Password reset states
  let resetEmail = '';
  let resetLoading = false;
  let resetSuccess = false;
  let resetError = '';
  
  let unsubscribe: (() => void) | undefined;

  onMount(() => {
    // Redirect if already authenticated
    unsubscribe = isAuthenticated.subscribe(auth => {
      if (auth) {
        goto('/dashboard');
      }
    });
  });
  
  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  // Real-time password validation
  $: if (mode === 'signup' && password) {
    const validation = validatePassword(password);
    passwordErrors = validation.errors;
  } else {
    passwordErrors = [];
  }

  // Form field validation
  function validateForm(): boolean {
    formErrors = {};
    
    // Email validation
    if (!email.trim()) {
      formErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      formErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      formErrors.password = 'Password is required';
    } else if (password.length < 6) {
      formErrors.password = 'Password must be at least 6 characters';
    }
    
    if (mode === 'signup') {
      // Username validation
      if (!username.trim()) {
        formErrors.username = 'Username is required';
      } else if (username.length < 3) {
        formErrors.username = 'Username must be at least 3 characters';
      } else if (username.length > 50) {
        formErrors.username = 'Username must be less than 50 characters';
      } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        formErrors.username = 'Username can only contain letters, numbers, underscores, and dashes';
      }
      
      // Password confirmation
      if (password !== passwordConfirm) {
        formErrors.passwordConfirm = 'Passwords do not match';
      }
      
      // Strong password validation
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        formErrors.password = passwordValidation.errors[0];
      }
    }
    
    return Object.keys(formErrors).length === 0;
  }

  async function handleSubmit() {
    loading = true;
    error = '';
    
    // Validate form
    if (!validateForm()) {
      loading = false;
      return;
    }
    
    try {
      if (mode === 'signup') {
        await authStore.signUp(email.trim(), password, username.trim());
      } else {
        await authStore.signIn(email.trim(), password);
      }
      // Redirect handled by subscription
    } catch (err: any) {
      error = err.message || 'An error occurred';
    } finally {
      loading = false;
    }
  }

  async function handlePasswordReset() {
    resetError = '';
    resetSuccess = false;
    
    if (!resetEmail.trim()) {
      resetError = 'Email is required';
      return;
    }
    
    if (!validateEmail(resetEmail)) {
      resetError = 'Please enter a valid email address';
      return;
    }
    
    resetLoading = true;
    
    try {
      if (!auth) throw new Error('Authentication not initialized');
      
      console.log('Sending password reset email to:', resetEmail.trim());
      
      await sendPasswordResetEmail(auth, resetEmail.trim(), {
        url: window.location.origin, // Redirect back to your app after reset
        handleCodeInApp: false
      });
      
      console.log('Password reset email sent successfully');
      resetSuccess = true;
      
      // Auto-switch back to signin after 5 seconds
      setTimeout(() => {
        mode = 'signin';
        email = resetEmail; // Pre-fill email
        resetEmail = '';
        resetSuccess = false;
      }, 5000);
      
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      if (err.code === 'auth/user-not-found') {
        resetError = 'No account found with this email address';
      } else if (err.code === 'auth/too-many-requests') {
        resetError = 'Too many attempts. Please try again later';
      } else if (err.code === 'auth/invalid-email') {
        resetError = 'Invalid email address';
      } else if (err.code === 'auth/missing-email') {
        resetError = 'Email address is required';
      } else {
        resetError = err.message || 'Failed to send reset email';
      }
    } finally {
      resetLoading = false;
    }
  }

  function switchMode(newMode: 'signin' | 'signup' | 'reset') {
    mode = newMode;
    error = '';
    formErrors = {};
    passwordErrors = [];
    resetError = '';
    resetSuccess = false;
    // Clear sensitive fields when switching
    if (newMode !== 'signin') {
      password = '';
      passwordConfirm = '';
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (mode === 'reset') {
        handlePasswordReset();
      } else {
        handleSubmit();
      }
    }
  }
</script>

<LandingNav />

<div class="min-h-screen bg-black cyber-grid overflow-hidden">
  <!-- Animated background elements -->
  <div class="absolute inset-0 overflow-hidden">
    <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-xl opacity-20 animate-float"></div>
    <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-screen filter blur-xl opacity-20 animate-float" style="animation-delay: 2s;"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-screen filter blur-xl opacity-10 animate-pulse-glow"></div>
  </div>

  <div class="relative min-h-screen flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full space-y-8 animate-slide-up">
      <!-- Logo and Title -->
      <div class="text-center">
        <div class="flex justify-center mb-6">
          <div class="relative">
            <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform rotate-45 neon-glow">
              <svg class="w-14 h-14 text-white transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div class="absolute -bottom-2 -right-2 w-6 h-6 bg-pink-500 rounded-full animate-pulse-glow"></div>
          </div>
        </div>
        <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
          AXIONARK
        </h1>
        <p class="mt-2 text-gray-400">Elite Bug Bounty Training Platform</p>
      </div>

      <!-- Auth Form -->
      <div class="glass rounded-2xl p-8 space-y-6 card-hover">
        <h2 class="text-2xl font-semibold text-white text-center neon-text">
          {#if mode === 'signin'}
            Access Terminal
          {:else if mode === 'signup'}
            Initialize Profile
          {:else}
            Reset Password
          {/if}
        </h2>
        
        {#if error}
          <div class="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm animate-slide-up" role="alert">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        {/if}

        {#if mode === 'reset'}
          <!-- Password Reset Form -->
          {#if resetSuccess}
            <div class="p-4 bg-green-500/20 border border-green-500/50 rounded-lg animate-slide-up">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-green-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="text-green-400 font-medium">Password reset email sent!</p>
                  <p class="text-sm text-gray-400 mt-1">Check your inbox for instructions to reset your password.</p>
                  <p class="text-xs text-gray-500 mt-2">Redirecting to login in 5 seconds...</p>
                </div>
              </div>
            </div>
          {:else}
            <form on:submit|preventDefault={handlePasswordReset} class="space-y-5" novalidate>
              {#if resetError}
                <div class="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm" role="alert">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {resetError}
                  </div>
                </div>
              {/if}
              
              <div>
                <label for="reset-email" class="block text-sm font-medium text-gray-400 mb-2">
                  Email Address
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    bind:value={resetEmail}
                    on:keydown={handleKeydown}
                    class="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="Enter your email address"
                    disabled={resetLoading}
                    autocomplete="email"
                  />
                </div>
                <p class="mt-2 text-xs text-gray-500">
                  We'll send you instructions to reset your password
                </p>
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                class="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 btn-cyber neon-glow"
              >
                {#if resetLoading}
                  <div class="flex items-center justify-center">
                    <div class="spinner w-5 h-5 mr-2"></div>
                    Sending...
                  </div>
                {:else}
                  Send Reset Email
                {/if}
              </button>
              
              <div class="text-center">
                <button
                  type="button"
                  on:click={() => switchMode('signin')}
                  class="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Back to login
                </button>
              </div>
            </form>
          {/if}
        {:else}
          <!-- Sign In / Sign Up Form -->
          <form on:submit|preventDefault={handleSubmit} class="space-y-5" novalidate>
            {#if mode === 'signup'}
              <div>
                <label for="username" class="block text-sm font-medium text-gray-400 mb-2">
                  Hacker Handle
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    bind:value={username}
                    on:keydown={handleKeydown}
                    class="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border {formErrors.username ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="Enter your username"
                    disabled={loading}
                    autocomplete="username"
                    maxlength="50"
                  />
                </div>
                {#if formErrors.username}
                  <p class="mt-1 text-xs text-red-400">{formErrors.username}</p>
                {/if}
              </div>
            {/if}

            <div>
              <label for="email" class="block text-sm font-medium text-gray-400 mb-2">
                Email Interface
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  bind:value={email}
                  on:keydown={handleKeydown}
                  class="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border {formErrors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="hacker@example.com"
                  disabled={loading}
                  autocomplete="email"
                  maxlength="254"
                />
              </div>
              {#if formErrors.email}
                <p class="mt-1 text-xs text-red-400">{formErrors.email}</p>
              {/if}
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label for="password" class="block text-sm font-medium text-gray-400">
                  Access Code
                </label>
                {#if mode === 'signin'}
                  <button
                    type="button"
                    on:click={() => switchMode('reset')}
                    class="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                {/if}
              </div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  bind:value={password}
                  on:keydown={handleKeydown}
                  class="block w-full pl-10 pr-10 py-3 bg-gray-900/50 border {formErrors.password ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder={mode === 'signin' ? '••••••••' : 'Min 8 characters'}
                  disabled={loading}
                  autocomplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  maxlength="128"
                />
                <button
                  type="button"
                  on:click={() => showPassword = !showPassword}
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  tabindex="-1"
                >
                  <svg class="h-5 w-5 text-gray-500 hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {#if showPassword}
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    {:else}
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    {/if}
                  </svg>
                </button>
              </div>
              {#if formErrors.password}
                <p class="mt-1 text-xs text-red-400">{formErrors.password}</p>
              {/if}
              {#if mode === 'signup' && passwordErrors.length > 0}
                <div class="mt-2 text-xs text-gray-400">
                  <p class="font-medium mb-1">Password must contain:</p>
                  <ul class="space-y-1">
                    {#each passwordErrors as error}
                      <li class="flex items-center text-red-400">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {error}
                      </li>
                    {/each}
                  </ul>
                </div>
              {/if}
            </div>

            {#if mode === 'signup'}
              <div>
                <label for="passwordConfirm" class="block text-sm font-medium text-gray-400 mb-2">
                  Confirm Access Code
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="passwordConfirm"
                    type={showPassword ? 'text' : 'password'}
                    bind:value={passwordConfirm}
                    on:keydown={handleKeydown}
                    class="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border {formErrors.passwordConfirm ? 'border-red-500' : 'border-gray-700'} rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    placeholder="Confirm your password"
                    disabled={loading}
                    autocomplete="new-password"
                    maxlength="128"
                  />
                </div>
                {#if formErrors.passwordConfirm}
                  <p class="mt-1 text-xs text-red-400">{formErrors.passwordConfirm}</p>
                {/if}
              </div>
            {/if}

            <button
              type="submit"
              disabled={loading}
              class="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 btn-cyber neon-glow"
            >
              {#if loading}
                <div class="flex items-center justify-center">
                  <div class="spinner w-5 h-5 mr-2"></div>
                  Processing...
                </div>
              {:else}
                {mode === 'signin' ? 'Access System' : 'Create Profile'}
              {/if}
            </button>
          </form>
        {/if}

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-900/50 text-gray-400">
              {mode === 'signin' ? "New to AXIONARK?" : mode === 'signup' ? 'Already initialized?' : 'Remember your password?'}
            </span>
          </div>
        </div>

        <button
          on:click={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
          class="w-full text-center text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          {mode === 'signin' ? 'Initialize New Profile' : 'Access Existing Profile'}
        </button>
      </div>

      <!-- Features -->
      <div class="grid grid-cols-3 gap-4 mt-8">
        <div class="text-center group">
          <div class="glass rounded-xl p-4 card-hover">
            <div class="w-10 h-10 mx-auto mb-2 text-blue-400 group-hover:text-blue-300 transition-colors">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xs font-medium text-gray-300">XP System</h3>
          </div>
        </div>
        
        <div class="text-center group">
          <div class="glass rounded-xl p-4 card-hover">
            <div class="w-10 h-10 mx-auto mb-2 text-purple-400 group-hover:text-purple-300 transition-colors">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="text-xs font-medium text-gray-300">Progress Tracking</h3>
          </div>
        </div>
        
        <div class="text-center group">
          <div class="glass rounded-xl p-4 card-hover">
            <div class="w-10 h-10 mx-auto mb-2 text-pink-400 group-hover:text-pink-300 transition-colors">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xs font-medium text-gray-300">Bounty Tracker</h3>
          </div>
        </div>
      </div>

      <!-- Security Notice -->
      <div class="text-center text-xs text-gray-500">
        <p>🔒 Secured with AES-256-GCM encryption</p>
        <p class="mt-1">Your data is encrypted with your password - only you can decrypt it</p>
      </div>
    </div>
  </div>
</div>

<LandingFooter />