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

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
  <div class="max-w-md w-full space-y-8 animate-slide-up">
    <!-- Logo and Title -->
    <div class="text-center">
      <div class="flex justify-center mb-4">
        <div class="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Bug Bounty Roadmap</h1>
      <p class="text-gray-600">Your journey from beginner to elite bug hunter</p>
    </div>

    <!-- Auth Form -->
    <div class="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
      <h2 class="text-2xl font-semibold text-gray-900 mb-6 text-center">
        {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
      </h2>
      
      {#if error}
        <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit} class="space-y-4">
        {#if mode === 'signup'}
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              bind:value={username}
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Choose a username"
              disabled={loading}
            />
          </div>
        {/if}

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            bind:value={email}
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Email address"
            disabled={loading}
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            bind:value={password}
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder={mode === 'signin' ? 'Enter your password' : 'Choose a password (min 6 characters)'}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {#if loading}
            <div class="spinner w-5 h-5 mr-2"></div>
          {/if}
          {mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            </span>
          </div>
        </div>

        <div class="mt-6">
          <button
            on:click={switchMode}
            class="w-full text-center text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            {mode === 'signin' ? 'Create new account' : 'Sign in instead'}
          </button>
        </div>
      </div>
    </div>

    <!-- Features -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
      <div class="text-center">
        <div class="bg-white rounded-lg p-4 shadow-md">
          <svg class="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 class="font-semibold text-gray-900">Track Progress</h3>
          <p class="text-sm text-gray-600 mt-1">Monitor your journey with XP system</p>
        </div>
      </div>
      
      <div class="text-center">
        <div class="bg-white rounded-lg p-4 shadow-md">
          <svg class="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 class="font-semibold text-gray-900">Learn Daily</h3>
          <p class="text-sm text-gray-600 mt-1">Journal your learning journey</p>
        </div>
      </div>
      
      <div class="text-center">
        <div class="bg-white rounded-lg p-4 shadow-md">
          <svg class="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="font-semibold text-gray-900">Track Earnings</h3>
          <p class="text-sm text-gray-600 mt-1">Monitor your bug bounty rewards</p>
        </div>
      </div>
    </div>
  </div>
</div>