<!-- src/lib/components/LandingNavbar.svelte -->
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

<nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 {scrolled ? 'bg-black/90 backdrop-blur-xl shadow-2xl' : 'bg-transparent'}">
  <!-- Futuristic Top Bar -->
  <div class="h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
  
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16 lg:h-20">
      <!-- Logo -->
      <a href="/" class="flex items-center space-x-2 sm:space-x-4 group">
        <div class="relative">
          <!-- Logo Container -->
          <div class="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14">
            <!-- Rotating Ring -->
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-xl sm:rounded-2xl opacity-20 group-hover:opacity-30 animate-spin-slow"></div>
            
            <!-- Main Logo -->
            <div class="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-500 shadow-lg shadow-cyan-500/50">
              <!-- Hexagon Shape -->
              <svg class="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" viewBox="0 0 24 24" fill="none">
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
            <span class="font-black text-lg sm:text-xl lg:text-2xl tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              AXIONARK
            </span>
            <div class="text-[10px] font-medium tracking-[0.3em] text-gray-400 uppercase">
              Elite Bug Bounty Training
            </div>
          </div>
        </div>
      </a>
      
      <!-- Desktop Navigation -->
      <div class="hidden lg:flex items-center space-x-8">
        {#each navLinks as link}
          <a 
            href={link.href} 
            class="relative text-gray-300 hover:text-white transition-colors duration-300 font-medium group {isActive(link.href) ? 'text-white' : ''}"
          >
            {link.label}
            <span class="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300 {isActive(link.href) ? 'w-full' : ''}"></span>
          </a>
        {/each}
      </div>
      
      <!-- CTA Buttons (Desktop) -->
      <div class="hidden lg:flex items-center space-x-4">
        <!-- Ko-fi Support Button -->
        <a 
          href="https://ko-fi.com/yourusername" 
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.189-.096-.323-.378-.323-.378s-.045-4.906-.025-7.602c.02-2.696-.516-3.227-.516-3.227l7.838.023s2.657.334 2.657 3.556c0 3.222-5.31 3.629-5.31 3.629z"/>
          </svg>
          <span>Support</span>
        </a>
        
        <!-- Get Started Button -->
        <a 
          href="/signin" 
          class="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
        >
          Get Started
        </a>
      </div>
      
      <!-- Mobile menu button -->
      <button
        class="lg:hidden relative w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group hover:bg-white/20 transition-all duration-300"
        on:click={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        <div class="relative w-5 h-4 flex flex-col justify-between">
          <span class="block h-0.5 bg-white rounded-full transition-all duration-300 {mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}"></span>
          <span class="block h-0.5 bg-white rounded-full transition-all duration-300 {mobileMenuOpen ? 'opacity-0' : ''}"></span>
          <span class="block h-0.5 bg-white rounded-full transition-all duration-300 {mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}"></span>
        </div>
      </button>
    </div>
    
    <!-- Mobile Navigation -->
    {#if mobileMenuOpen}
      <div class="lg:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl animate-slide-down">
        <div class="px-4 py-6 space-y-4">
          <!-- Mobile Nav Links -->
          {#each navLinks as link}
            <a 
              href={link.href} 
              class="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 font-medium {isActive(link.href) ? 'bg-white/10 text-white' : ''}"
            >
              {link.label}
            </a>
          {/each}
          
          <div class="border-t border-white/10 pt-4 space-y-3">
            <!-- Ko-fi Support Button (Mobile) -->
            <a 
              href="https://ko-fi.com/yourusername" 
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-medium"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.189-.096-.323-.378-.323-.378s-.045-4.906-.025-7.602c.02-2.696-.516-3.227-.516-3.227l7.838.023s2.657.334 2.657 3.556c0 3.222-5.31 3.629-5.31 3.629z"/>
              </svg>
              <span>Support the Developer</span>
            </a>
            
            <!-- Get Started Button (Mobile) -->
            <a 
              href="/signin" 
              class="block w-full text-center px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Bottom Gradient Line -->
  <div class="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
</nav>

<!-- Spacer for fixed navbar -->
<div class="h-16 lg:h-20"></div>

<style>
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
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
  
  .animate-spin-slow {
    animation: spin-slow 20s linear infinite;
  }
  
  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }
</style>