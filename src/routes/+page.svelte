<!-- src/routes/+page.svelte - Refined Professional Design with Improved Form -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore, isAuthenticated } from '$lib/stores/auth';
  import { onMount, onDestroy } from 'svelte';
  import { validateEmail, validatePassword, sanitizeUsername } from '$lib/utils/security';
  import { auth } from '$lib/firebase';
  import { sendPasswordResetEmail } from 'firebase/auth';
  import LandingNav from '$lib/components/LandingNav.svelte';
  import LandingFooter from '$lib/components/LandingFooter.svelte';
  import SEO from '$lib/components/SEO.svelte';
  
  let loading = false;
  let error = '';
  let mode: 'signin' | 'signup' | 'reset' = 'signin';
  
  let email = '';
  let password = '';
  let username = '';
  let passwordConfirm = '';
  let showPassword = false;
  let showPasswordConfirm = false;
  let passwordErrors: string[] = [];
  let formErrors: { [key: string]: string } = {};
  
  // Password reset states
  let resetEmail = '';
  let resetLoading = false;
  let resetSuccess = false;
  let resetError = '';
  
  // Security enhancements
  let honeypot = ''; // Honeypot field for bot detection
  let formSubmitTime = 0; // Track form submission time
  let failedAttempts = 0; // Track failed attempts
  const MAX_FAILED_ATTEMPTS = 5;
  
  let unsubscribe: (() => void) | undefined;

  onMount(() => {
    // Set form load time for timing attack prevention
    formSubmitTime = Date.now();
    
    // Redirect if already authenticated
    unsubscribe = isAuthenticated.subscribe(auth => {
      if (auth) {
        goto('/dashboard');
      }
    });
    
    // Clear sensitive data from browser autocomplete
    return () => {
      email = '';
      password = '';
      passwordConfirm = '';
      username = '';
    };
  });
  
  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
    // Clear all sensitive data
    email = '';
    password = '';
    passwordConfirm = '';
    username = '';
    resetEmail = '';
  });

  // Real-time password validation
  $: if (mode === 'signup' && password) {
    const validation = validatePassword(password);
    passwordErrors = validation.errors;
  } else {
    passwordErrors = [];
  }

  // Enhanced form validation with security checks
  function validateForm(): boolean {
    formErrors = {};
    
    // Honeypot check (hidden field that bots might fill)
    if (honeypot) {
      console.warn('Bot detection triggered');
      return false;
    }
    
    // Timing attack prevention (form submitted too quickly)
    const submitTime = Date.now() - formSubmitTime;
    if (submitTime < 1000) { // Less than 1 second
      formErrors.general = 'Please take your time filling out the form';
      return false;
    }
    
    // Check failed attempts
    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      formErrors.general = 'Too many failed attempts. Please try again later.';
      return false;
    }
    
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
      
      // Check for common passwords
      const commonPasswords = ['password', '12345678', 'qwerty', 'admin', 'letmein', '123456'];
      if (commonPasswords.includes(password.toLowerCase())) {
        formErrors.password = 'This password is too common. Please choose a stronger password.';
      }
      
      // Check if password contains username or email
      if (password.toLowerCase().includes(username.toLowerCase()) || 
          password.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
        formErrors.password = 'Password should not contain your username or email';
      }
    }
    
    return Object.keys(formErrors).length === 0;
  }

  async function handleSubmit() {
    loading = true;
    error = '';
    
    // Validate form with security checks
    if (!validateForm()) {
      loading = false;
      return;
    }
    
    try {
      if (mode === 'signup') {
        await authStore.signUp(email.trim(), password, username.trim());
        // Clear sensitive data after successful signup
        password = '';
        passwordConfirm = '';
      } else {
        await authStore.signIn(email.trim(), password);
        // Clear password after successful signin
        password = '';
      }
      failedAttempts = 0; // Reset failed attempts on success
      // Redirect handled by subscription
    } catch (err: any) {
      failedAttempts++;
      error = err.message || 'An error occurred';
      
      // Add delay after failed attempt to prevent brute force
      if (failedAttempts > 2) {
        loading = true;
        setTimeout(() => {
          loading = false;
        }, failedAttempts * 1000); // Exponential backoff
      }
    } finally {
      if (failedAttempts <= 2) {
        loading = false;
      }
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
      
      await sendPasswordResetEmail(auth, resetEmail.trim(), {
        url: window.location.origin + '/signin', // Explicit redirect URL
        handleCodeInApp: false
      });
      
      resetSuccess = true;
      
      // Clear email for security
      setTimeout(() => {
        mode = 'signin';
        email = resetEmail;
        resetEmail = '';
        resetSuccess = false;
      }, 5000);
      
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      // Generic error message to prevent user enumeration
      resetError = 'If an account exists with this email, you will receive a password reset link.';
      
      // Still show success to prevent user enumeration
      setTimeout(() => {
        resetSuccess = true;
        resetError = '';
      }, 1000);
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
    formSubmitTime = Date.now(); // Reset form timer
    // Clear sensitive fields when switching
    password = '';
    passwordConfirm = '';
    if (newMode === 'signup') {
      email = '';
      username = '';
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      if (mode === 'reset') {
        handlePasswordReset();
      } else {
        handleSubmit();
      }
    }
  }
  
  // Prevent paste in password confirm field
  function handlePasswordConfirmPaste(event: ClipboardEvent) {
    if (mode === 'signup') {
      event.preventDefault();
      formErrors.passwordConfirm = 'Please type your password again';
    }
  }
</script>

<!-- SEO Meta Tags -->
<SEO seo={{
  title: mode === 'signup' ? 'Sign Up - Start Your Journal' : mode === 'reset' ? 'Reset Password' : 'Sign In',
  description: mode === 'signup' 
    ? 'Create your AXIONARK account and start journaling your ethical hacking journey. Your private, encrypted diary for security research.'
    : 'Sign in to AXIONARK to access your encrypted ethical hacking journal and track your security research progress.',
  noindex: false,
  nofollow: true
}} />

<LandingNav />

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black overflow-hidden relative">
  <!-- Subtle animated background -->
  <div class="absolute inset-0">
    <!-- Gradient meshes -->
    <div class="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full filter blur-3xl animate-drift"></div>
    <div class="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full filter blur-3xl animate-drift" style="animation-delay: 3s; animation-duration: 25s;"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/10 rounded-full filter blur-3xl animate-drift" style="animation-delay: 6s; animation-duration: 30s;"></div>
    
    <!-- Subtle grid pattern -->
    <div class="absolute inset-0 opacity-30" style="background-image: url(&quot;data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='rgba(255,255,255,0.02)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E&quot;);"></div>
  </div>

  <div class="relative min-h-screen flex">
    <!-- Left Side - Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 z-10">
      <div class="w-full max-w-md space-y-8 animate-fade-in">
        
        <!-- Improved Form Container -->
        <div class="backdrop-blur-xl bg-gray-900/70 rounded-2xl p-8 border border-gray-800 shadow-2xl">
          <!-- Form Header with Tabs -->
          <div class="mb-8">
            {#if mode !== 'reset'}
              <!-- Tab Navigation -->
              <div class="flex rounded-xl bg-gray-800/50 p-1 mb-6">
                <button
                  on:click={() => switchMode('signin')}
                  class="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 {mode === 'signin' ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-400 hover:text-white'}"
                >
                  Sign In
                </button>
                <button
                  on:click={() => switchMode('signup')}
                  class="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 {mode === 'signup' ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-400 hover:text-white'}"
                >
                  Sign Up
                </button>
              </div>
            {:else}
              <h2 class="text-2xl font-semibold text-white text-center mb-2">Reset Password</h2>
              <p class="text-sm text-gray-400 text-center">Enter your email to receive reset instructions</p>
            {/if}
          </div>
          
          {#if error}
            <div class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-shake" role="alert">
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm text-red-400">{error}</span>
              </div>
            </div>
          {/if}
          
          {#if formErrors.general}
            <div class="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl" role="alert">
              <div class="flex items-center">
                <svg class="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span class="text-sm text-yellow-400">{formErrors.general}</span>
              </div>
            </div>
          {/if}

          {#if mode === 'reset'}
            <!-- Password Reset Form -->
            {#if resetSuccess}
              <div class="text-center py-8 animate-fade-in">
                <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-white mb-2">Check your email!</h3>
                <p class="text-sm text-gray-400">We've sent password reset instructions to your email address.</p>
              </div>
            {:else}
              <form on:submit|preventDefault={handlePasswordReset} class="space-y-5" novalidate>
                {#if resetError}
                  <div class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm" role="alert">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {resetError}
                    </div>
                  </div>
                {/if}
                
                <div>
                  <label for="reset-email" class="block text-sm font-medium text-gray-300 mb-2">
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
                      class="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="your@email.com"
                      disabled={resetLoading}
                      autocomplete="email"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {#if resetLoading}
                    <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
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
                    Back to Sign In
                  </button>
                </div>
              </form>
            {/if}
          {:else}
            <!-- Sign In / Sign Up Form -->
            <form on:submit|preventDefault={handleSubmit} class="space-y-5" novalidate>
              <!-- Honeypot field (hidden from users) -->
              <input
                type="text"
                bind:value={honeypot}
                tabindex="-1"
                autocomplete="off"
                style="position: absolute; left: -9999px;"
                aria-hidden="true"
              />
              
              {#if mode === 'signup'}
                <div>
                  <label for="username" class="block text-sm font-medium text-gray-300 mb-2">
                    Username
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
                      class="w-full pl-10 pr-4 py-3 bg-gray-800/50 border {formErrors.username ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="Choose a username"
                      disabled={loading}
                      autocomplete="username"
                      maxlength="50"
                      required
                      aria-invalid={!!formErrors.username}
                      aria-describedby={formErrors.username ? 'username-error' : undefined}
                    />
                  </div>
                  {#if formErrors.username}
                    <p id="username-error" class="mt-1.5 text-xs text-red-400">{formErrors.username}</p>
                  {/if}
                </div>
              {/if}

              <div>
                <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
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
                    class="w-full pl-10 pr-4 py-3 bg-gray-800/50 border {formErrors.email ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="your@email.com"
                    disabled={loading}
                    autocomplete="email"
                    maxlength="254"
                    required
                    aria-invalid={!!formErrors.email}
                    aria-describedby={formErrors.email ? 'email-error' : undefined}
                  />
                </div>
                {#if formErrors.email}
                  <p id="email-error" class="mt-1.5 text-xs text-red-400">{formErrors.email}</p>
                {/if}
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <label for="password" class="block text-sm font-medium text-gray-300">
                    Password
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
                    class="w-full pl-10 pr-12 py-3 bg-gray-800/50 border {formErrors.password ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder={mode === 'signin' ? '••••••••' : 'Minimum 8 characters'}
                    disabled={loading}
                    autocomplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    maxlength="128"
                    required
                    aria-invalid={!!formErrors.password}
                    aria-describedby={formErrors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    on:click={() => showPassword = !showPassword}
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                    tabindex="-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p id="password-error" class="mt-1.5 text-xs text-red-400">{formErrors.password}</p>
                {/if}
                {#if mode === 'signup' && passwordErrors.length > 0}
                  <div class="mt-3 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                    <p class="text-xs font-medium text-yellow-400 mb-2">Password must include:</p>
                    <ul class="space-y-1">
                      {#each passwordErrors as error}
                        <li class="text-xs text-gray-400 flex items-start">
                          <span class="text-yellow-500 mr-1.5 mt-0.5">•</span>
                          <span>{error}</span>
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/if}
              </div>

              {#if mode === 'signup'}
                <div>
                  <label for="passwordConfirm" class="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      id="passwordConfirm"
                      type={showPasswordConfirm ? 'text' : 'password'}
                      bind:value={passwordConfirm}
                      on:keydown={handleKeydown}
                      on:paste={handlePasswordConfirmPaste}
                      class="w-full pl-10 pr-12 py-3 bg-gray-800/50 border {formErrors.passwordConfirm ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      placeholder="Confirm your password"
                      disabled={loading}
                      autocomplete="new-password"
                      maxlength="128"
                      required
                      aria-invalid={!!formErrors.passwordConfirm}
                      aria-describedby={formErrors.passwordConfirm ? 'password-confirm-error' : undefined}
                    />
                    <button
                      type="button"
                      on:click={() => showPasswordConfirm = !showPasswordConfirm}
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                      tabindex="-1"
                      aria-label={showPasswordConfirm ? 'Hide password' : 'Show password'}
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {#if showPasswordConfirm}
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        {:else}
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        {/if}
                      </svg>
                    </button>
                  </div>
                  {#if formErrors.passwordConfirm}
                    <p id="password-confirm-error" class="mt-1.5 text-xs text-red-400">{formErrors.passwordConfirm}</p>
                  {/if}
                </div>
              {/if}

              <button
                type="submit"
                disabled={loading || failedAttempts >= MAX_FAILED_ATTEMPTS}
                class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {#if loading}
                  <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {failedAttempts > 2 ? `Please wait ${failedAttempts}s...` : 'Processing...'}
                {:else}
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                {/if}
              </button>
            </form>
          {/if}

          {#if mode !== 'reset'}
            <div class="mt-6">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-700/50"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-gray-900/70 text-gray-400">
                    {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                  </span>
                </div>
              </div>

              <button
                on:click={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                class="w-full mt-4 text-center text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {mode === 'signin' ? 'Create an account' : 'Sign in instead'}
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Right Side - Experience Showcase -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-12 items-center justify-center relative overflow-hidden backdrop-blur-sm">
      <!-- Subtle pattern overlay -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0" style="background-image: url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='dots' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='30' cy='30' r='1' fill='rgba(255,255,255,0.2)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23dots)'/%3E%3C/svg%3E&quot;);"></div>
      </div>
      
      <div class="relative z-10 max-w-lg">
        <div class="mb-10">
          <h2 class="text-4xl font-bold text-white mb-4">
            Where <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Hackers</span> Write Their Story
          </h2>
          <p class="text-lg text-gray-300 leading-relaxed">
            More than a journal—it's your personal hacking memoir. Capture breakthroughs, 
            celebrate victories, and transform your journey into a legacy.
          </p>
        </div>
        
        <!-- Experience features -->
        <div class="space-y-5">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-white mb-1">Capture Every "Eureka!" Moment</h3>
              <p class="text-sm text-gray-400">From first successful exploit to complex vulnerability chains—document your breakthroughs as they happen.</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-white mb-1">Build Your Hacking Portfolio</h3>
              <p class="text-sm text-gray-400">Create a living resume of your skills. Perfect for reflecting on growth or showcasing expertise.</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-white mb-1">Learn From Your Past Self</h3>
              <p class="text-sm text-gray-400">Revisit old techniques, see how far you've come, and discover patterns in your problem-solving approach.</p>
            </div>
          </div>
          
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-white mb-1">Join a Community of Legends</h3>
              <p class="text-sm text-gray-400">You're not alone. Be part of a growing community of ethical hackers documenting their journey.</p>
            </div>
          </div>
        </div>
        
        <!-- Inspiring quote -->
        <div class="mt-10 p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50">
          <blockquote class="text-gray-300 italic">
            "Every expert was once a beginner. Every master was once a disaster. Your journey matters."
          </blockquote>
          <div class="mt-3 flex items-center space-x-3">
            <div class="flex -space-x-2">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-gray-800"></div>
              <div class="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full border-2 border-gray-800"></div>
              <div class="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-gray-800"></div>
            </div>
            <span class="text-sm text-gray-400">Join hackers already journaling</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<LandingFooter />

<style>
  /* Subtle animations */
  @keyframes drift {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    33% {
      transform: translate(30px, -30px) scale(1.05);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.95);
    }
  }
  
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-2px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(2px);
    }
  }
  
  .animate-drift {
    animation: drift 20s ease-in-out infinite;
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out;
  }

  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
</style>