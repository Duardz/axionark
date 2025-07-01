<!-- src/lib/components/LandingNav.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  let mobileMenuOpen = false;
  let scrolled = false;
  
  // Track scroll for navbar effects
  onMount(() => {
    const handleScroll = () => {
      scrolled = window.scrollY > 20;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
  
  // Close mobile menu on route change
  $: if ($page.url.pathname) {
    mobileMenuOpen = false;
  }
  
  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
  
  function isActive(path: string) {
    return $page.url.pathname === path;
  }
  
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/sponsors', label: 'Sponsors' },
  ];
</script>

<nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 {scrolled ? 'bg-gray-900/95 backdrop-blur-2xl shadow-lg border-b border-gray-800' : 'bg-gray-900/50 backdrop-blur-md border-b border-gray-800/50'}">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-20">
      <!-- Logo -->
      <a href="/" class="flex items-center space-x-2 sm:space-x-4 group">
        <div class="relative">
          <!-- Logo Container -->
          <div class="relative w-10 h-10 sm:w-12 sm:h-12">
            <!-- Rotating Ring -->
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-xl sm:rounded-2xl opacity-20 group-hover:opacity-30 animate-spin-slow"></div>
            
            <!-- Main Logo -->
            <div class="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-500 shadow-lg shadow-cyan-500/50">
              <!-- Hexagon Shape -->
              <svg class="w-6 h-6 sm:w-7 sm:h-7 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 7L16 10V14L12 17L8 14V10L12 7Z" fill="currentColor" opacity="0.8"/>
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
              </svg>
            </div>
            
            <!-- Glow Effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl sm:rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity animate-pulse"></div>
          </div>
        </div>
        
        <div class="hidden sm:block">
          <div class="relative">
            <span class="font-black text-lg sm:text-xl tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              AXIONARK
            </span>
            <div class="text-[10px] font-medium tracking-[0.3em] text-gray-500 uppercase">
              Ethical Hacking Journal
            </div>
          </div>
        </div>
      </a>
      
      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-2">
        {#each navLinks as link}
          <a 
            href={link.href} 
            class="relative px-5 py-2.5 text-gray-300 hover:text-white transition-all duration-300 text-sm font-medium rounded-xl hover:bg-white/5 {isActive(link.href) ? 'text-white bg-white/10' : ''}"
          >
            {link.label}
            {#if isActive(link.href)}
              <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-500 rounded-full"></div>
            {/if}
          </a>
        {/each}
        
        <div class="ml-4 h-8 w-px bg-gray-800"></div>
        
        <!-- Ko-fi Support Button -->
        <a 
          href="https://ko-fi.com/duardz" 
          target="_blank"
          rel="noopener noreferrer"
          class="ml-4 h-10 flex items-center"
        >
          <img 
            src='https://storage.ko-fi.com/cdn/kofi5.png?v=3' 
            alt='Buy Me a Coffee at ko-fi.com'
            class="h-full hover:opacity-90 transition-opacity"
          />
        </a>
      </div>
      
      <!-- Mobile menu button -->
      <button
        class="md:hidden relative w-12 h-12 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-800 flex items-center justify-center hover:bg-gray-800/50 transition-all duration-300"
        on:click={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        <div class="relative w-6 h-5 flex flex-col justify-between">
          <span class="block h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300 {mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}"></span>
          <span class="block h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 {mobileMenuOpen ? 'opacity-0 scale-0' : ''}"></span>
          <span class="block h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 {mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}"></span>
        </div>
      </button>
    </div>
    
    <!-- Mobile Navigation -->
    {#if mobileMenuOpen}
      <div class="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-gray-800/50 animate-slide-down">
        <div class="container mx-auto px-4 py-6">
          <div class="space-y-2">
            {#each navLinks as link}
              <a 
                href={link.href} 
                class="block px-5 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 text-sm font-medium {isActive(link.href) ? 'bg-white/10 text-white' : ''}"
              >
                {link.label}
              </a>
            {/each}
            
            <div class="pt-4 mt-4 border-t border-gray-800/50 space-y-2">
              <a 
                href="https://ko-fi.com/duardz" 
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center w-full py-3"
              >
                <img 
                  src='https://storage.ko-fi.com/cdn/kofi5.png?v=3' 
                  alt='Buy Me a Coffee at ko-fi.com'
                  class="h-9"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</nav>

<!-- Spacer for fixed navbar -->
<div class="h-20"></div>

<style>
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .animate-spin-slow {
    animation: spin-slow 20s linear infinite;
  }
  
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }
</style>