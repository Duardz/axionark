<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore, isAuthenticated } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  
  let loading = false;
  let error = '';
  let mode: 'signin' | 'signup' = 'signin';
  
  let email = '';
  let password = '';
  let username = '';

  onMount(() => {
    // Redirect if already authenticated
    isAuthenticated.subscribe(auth => {
      if (auth) {
        goto('/dashboard');
      }
    });
  });

  async function handleSubmit() {
    loading = true;
    error = '';
    
    // Basic validation
    if (!email || !password || (mode === 'signup' && !username)) {
      error = 'Please fill in all fields';
      loading = false;
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      error = 'Please enter a valid email';
      loading = false;
      return;
    }
    
    // Password validation
    if (password.length < 6) {
      error = 'Password must be at least 6 characters';
      loading = false;
      return;
    }
    
    try {
      if (mode === 'signup') {
        // Username validation
        if (username.length < 3) {
          error = 'Username must be at least 3 characters';
          loading = false;
          return;
        }
        
        await authStore.signUp(email, password, username);
      } else {
        await authStore.signIn(email, password);
      }
      goto('/dashboard');
    } catch (err: any) {
      error = err.message || 'An error occurred';
    } finally {
      loading = false;
    }
  }

  function switchMode() {
    mode = mode === 'signin' ? 'signup' : 'signin';
    error = '';
  }
</script>

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
          {mode === 'signin' ? 'Access Terminal' : 'Initialize Profile'}
        </h2>
        
        {#if error}
          <div class="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm animate-slide-up">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        {/if}

        <form on:submit|preventDefault={handleSubmit} class="space-y-5">
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
                  class="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </div>
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
                class="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="hacker@example.com"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-400 mb-2">
              Access Code
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                type="password"
                bind:value={password}
                class="block w-full pl-10 pr-3 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder={mode === 'signin' ? '••••••••' : 'Min 6 characters'}
                disabled={loading}
              />
            </div>
          </div>

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

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-900/50 text-gray-400">
              {mode === 'signin' ? "New to AXIONARK?" : 'Already initialized?'}
            </span>
          </div>
        </div>

        <button
          on:click={switchMode}
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
    </div>
  </div>
</div>