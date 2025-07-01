<!-- src/routes/+page.svelte - Updated with Personal Journal Focus -->
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

<div class="min-h-screen bg-black overflow-hidden relative">
  <!-- Animated background -->
  <div class="absolute inset-0">
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float"></div>
    <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float" style="animation-delay: 2s;"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-float" style="animation-delay: 4s;"></div>
  </div>

  <!-- Grid pattern overlay -->
  <div class="absolute inset-0 opacity-50" style="background-image: url(&quot;data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E&quot;);"></div>

  <div class="relative min-h-screen flex">
    <!-- Left Side - Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md space-y-8 animate-fade-in">
        <!-- Form Container -->
        <div class="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-800/50 shadow-2xl">
          <h2 class="text-2xl font-bold text-white mb-8 text-center">
            {#if mode === 'signin'}
              Booting AXIONARK...
            {:else if mode === 'signup'}
              Start your journal
            {:else}
              Reset your password
            {/if}
          </h2>
          
          {#if error}
            <div class="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm mb-6 animate-slide-up" role="alert">
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          {/if}
          
          {#if formErrors.general}
            <div class="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl text-yellow-400 text-sm mb-6" role="alert">
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {formErrors.general}
              </div>
            </div>
          {/if}

          {#if mode === 'reset'}
            <!-- Password Reset Form -->
            {#if resetSuccess}
              <div class="p-4 bg-green-500/10 border border-green-500/50 rounded-xl animate-slide-up">
                <div class="flex items-start">
                  <svg class="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="text-green-400 font-medium">Check your email!</p>
                    <p class="text-sm text-gray-400 mt-1">If an account exists with this email, you will receive password reset instructions.</p>
                    <p class="text-xs text-gray-500 mt-2">Redirecting to login...</p>
                  </div>
                </div>
              </div>
            {:else}
              <form on:submit|preventDefault={handlePasswordReset} class="space-y-6" novalidate>
                {#if resetError}
                  <div class="p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm" role="alert">
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
                  <input
                    id="reset-email"
                    type="email"
                    bind:value={resetEmail}
                    on:keydown={handleKeydown}
                    class="block w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    placeholder="Enter your email address"
                    disabled={resetLoading}
                    autocomplete="email"
                    required
                  />
                  <p class="mt-2 text-xs text-gray-500">
                    We'll send you instructions to reset your password
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  class="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
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
            <form on:submit|preventDefault={handleSubmit} class="space-y-6" novalidate>
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
                  <input
                    id="username"
                    type="text"
                    bind:value={username}
                    on:keydown={handleKeydown}
                    class="block w-full px-4 py-3 bg-black/50 border {formErrors.username ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    placeholder="Choose your username"
                    disabled={loading}
                    autocomplete="username"
                    maxlength="50"
                    required
                    aria-invalid={!!formErrors.username}
                    aria-describedby={formErrors.username ? 'username-error' : undefined}
                  />
                  {#if formErrors.username}
                    <p id="username-error" class="mt-1 text-xs text-red-400">{formErrors.username}</p>
                  {/if}
                </div>
              {/if}

              <div>
                <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  bind:value={email}
                  on:keydown={handleKeydown}
                  class="block w-full px-4 py-3 bg-black/50 border {formErrors.email ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="you@example.com"
                  disabled={loading}
                  autocomplete="email"
                  maxlength="254"
                  required
                  aria-invalid={!!formErrors.email}
                  aria-describedby={formErrors.email ? 'email-error' : undefined}
                />
                {#if formErrors.email}
                  <p id="email-error" class="mt-1 text-xs text-red-400">{formErrors.email}</p>
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
                      class="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  {/if}
                </div>
                <div class="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    bind:value={password}
                    on:keydown={handleKeydown}
                    class="block w-full px-4 py-3 pr-10 bg-black/50 border {formErrors.password ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    placeholder={mode === 'signin' ? '••••••••' : 'Min 8 characters'}
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
                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                    tabindex="-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                  <p id="password-error" class="mt-1 text-xs text-red-400">{formErrors.password}</p>
                {/if}
                {#if mode === 'signup' && passwordErrors.length > 0}
                  <div class="mt-3 space-y-1">
                    {#each passwordErrors as error}
                      <p class="flex items-center text-xs text-gray-400">
                        <svg class="w-3 h-3 mr-1 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {error}
                      </p>
                    {/each}
                  </div>
                {/if}
              </div>

              {#if mode === 'signup'}
                <div>
                  <label for="passwordConfirm" class="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="passwordConfirm"
                    type={showPassword ? 'text' : 'password'}
                    bind:value={passwordConfirm}
                    on:keydown={handleKeydown}
                    on:paste={handlePasswordConfirmPaste}
                    class="block w-full px-4 py-3 bg-black/50 border {formErrors.passwordConfirm ? 'border-red-500' : 'border-gray-700'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    placeholder="Confirm your password"
                    disabled={loading}
                    autocomplete="new-password"
                    maxlength="128"
                    required
                    aria-invalid={!!formErrors.passwordConfirm}
                    aria-describedby={formErrors.passwordConfirm ? 'password-confirm-error' : undefined}
                  />
                  {#if formErrors.passwordConfirm}
                    <p id="password-confirm-error" class="mt-1 text-xs text-red-400">{formErrors.passwordConfirm}</p>
                  {/if}
                </div>
              {/if}

              <button
                type="submit"
                disabled={loading || failedAttempts >= MAX_FAILED_ATTEMPTS}
                class="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
              >
                {#if loading}
                  <div class="flex items-center justify-center">
                    <div class="spinner w-5 h-5 mr-2"></div>
                    {failedAttempts > 2 ? `Please wait ${failedAttempts}s...` : 'Processing...'}
                  </div>
                {:else}
                  {mode === 'signin' ? 'Sign In' : 'Create Journal'}
                {/if}
              </button>
            </form>
          {/if}

          <div class="mt-8">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-800"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-gray-900/50 text-gray-400">
                  {mode === 'signin' ? "Don't have a journal yet?" : mode === 'signup' ? 'Already have a journal?' : 'Remember your password?'}
                </span>
              </div>
            </div>

            <button
              on:click={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              class="w-full mt-4 text-center text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              {mode === 'signin' ? 'Create your journal' : 'Sign in instead'}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Side - Feature Showcase -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 to-black p-12 items-center justify-center relative">
      <div class="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-purple-600/20"></div>
      
      <div class="relative z-10 max-w-lg">
        <h2 class="text-5xl font-bold text-white mb-6">
          Your personal <span class="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">hacking journal</span>
        </h2>
        
        <p class="text-xl text-gray-300 mb-12">
          A private, encrypted space to document your ethical hacking journey. Write about your experiences, track discoveries, and reflect on your growth - all in one secure journal.
        </p>
        
        <div class="grid grid-cols-2 gap-6">
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div class="text-3xl mb-3">📔</div>
            <h3 class="font-semibold text-white mb-2">Daily Journal</h3>
            <p class="text-sm text-gray-400">Write encrypted entries about your journey</p>
          </div>
          
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div class="text-3xl mb-3">🔒</div>
            <h3 class="font-semibold text-white mb-2">100% Private</h3>
            <p class="text-sm text-gray-400">Only you can decrypt your entries</p>
          </div>
          
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div class="text-3xl mb-3">📊</div>
            <h3 class="font-semibold text-white mb-2">Track Progress</h3>
            <p class="text-sm text-gray-400">Monitor your growth and achievements</p>
          </div>
          
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div class="text-3xl mb-3">🎯</div>
            <h3 class="font-semibold text-white mb-2">Personal Goals</h3>
            <p class="text-sm text-gray-400">Set and track your learning objectives</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<LandingFooter />

<style>
  @keyframes float {
    0%, 100% {
      transform: translateY(0) translateX(0) scale(1);
    }
    33% {
      transform: translateY(-30px) translateX(20px) scale(1.05);
    }
    66% {
      transform: translateY(20px) translateX(-20px) scale(0.95);
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
  
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-float {
    animation: float 20s ease-in-out infinite;
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out;
  }
  
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
  
  .spinner {
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>