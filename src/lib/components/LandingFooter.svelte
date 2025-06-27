<!-- src/lib/components/LandingFooter.svelte -->
<script lang="ts">
  import { browser } from '$app/environment';
  import LegalModals from './LegalModals.svelte';
  
  const currentYear = new Date().getFullYear();
  
  // Modal states
  let showPrivacyPolicy = false;
  let showTermsOfService = false;
  let showCookiePolicy = false;
  
  const footerLinks = {
    product: [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About' },
      { href: '/sponsors', label: 'Sponsors' },
      { href: '/signin', label: 'Sign In' }
    ],
    support: [
      { href: 'https://ko-fi.com/yourusername', label: 'Support Us', external: true },
      { href: 'mailto:support@axionark.com', label: 'Contact' },
      { href: 'https://github.com/Duardz/axionark', label: 'GitHub', external: true }
    ]
  };
  
  const socialLinks = [
    { 
      href: 'https://github.com/Duardz', 
      icon: 'github', 
      path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' 
    },
    { 
      href: 'https://twitter.com/axionark', 
      icon: 'twitter', 
      path: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' 
    },
    { 
      href: 'https://discord.gg/axionark', 
      icon: 'discord', 
      path: 'M13.545 2.907a13.227 13.227 0 00-3.257-1.011.05.05 0 00-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 00-3.658 0 8.258 8.258 0 00-.412-.833.051.051 0 00-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 00-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 003.995 2.02.05.05 0 00.056-.019c.308-.42.582-.863.818-1.329a.05.05 0 00-.01-.059.051.051 0 00-.018-.011 8.875 8.875 0 01-1.248-.595.05.05 0 01-.02-.066.051.051 0 01.015-.019c.084-.063.168-.129.248-.195a.05.05 0 01.051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 01.053.007c.08.066.164.132.248.195a.051.051 0 01-.004.085 8.254 8.254 0 01-1.249.594.05.05 0 00-.03.03.052.052 0 00.003.041c.24.465.515.909.817 1.329a.05.05 0 00.056.019 13.235 13.235 0 004.001-2.02.049.049 0 00.021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 00-.02-.019zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612z' 
    }
  ];
</script>

<!-- Legal Modals Component -->
<LegalModals 
  bind:showPrivacyPolicy 
  bind:showTermsOfService 
  bind:showCookiePolicy 
/>

<footer class="relative bg-black overflow-hidden">
  <!-- Animated Background -->
  <div class="absolute inset-0 opacity-20">
    <div class="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full blur-3xl animate-float"></div>
    <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full blur-3xl animate-float" style="animation-delay: 2s;"></div>
  </div>
  
  <!-- Cyber Grid Pattern -->
  <div class="absolute inset-0 opacity-10">
    <div class="absolute inset-0" style="background-image: url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;);"></div>
  </div>

  <div class="relative">
    <!-- Top Gradient Line -->
    <div class="h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
    
    <!-- Main Footer Content -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        <!-- Brand Section -->
        <div class="lg:col-span-2">
          <!-- Logo -->
          <div class="flex items-center space-x-4 mb-6">
            <div class="relative w-16 h-16">
              <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl opacity-20 animate-spin-slow"></div>
              <div class="relative w-16 h-16 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                <svg class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 7L16 10V14L12 17L8 14V10L12 7Z" fill="currentColor" opacity="0.8"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
              </div>
              <div class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
            </div>
            
            <div>
              <h3 class="text-3xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                AXIONARK
              </h3>
              <p class="text-xs font-medium tracking-[0.3em] text-gray-500 uppercase">Elite Bug Bounty Training</p>
            </div>
          </div>
          
          <p class="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
            Join the next generation of elite security researchers. Master bug bounty hunting with our comprehensive training platform and track your journey to the top.
          </p>
          
          <!-- Social Links -->
          <div class="flex space-x-3">
            {#each socialLinks as social}
              <a 
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                class="relative w-12 h-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:border-cyan-500/50 group"
                aria-label={social.icon}
              >
                <svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d={social.path} />
                </svg>
                <div class="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
              </a>
            {/each}
          </div>
        </div>
        
        <!-- Navigation Links -->
        <div>
          <h4 class="text-white font-bold mb-6 flex items-center">
            <div class="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span class="text-sm">🚀</span>
            </div>
            Navigation
          </h4>
          <ul class="space-y-3">
            {#each footerLinks.product as link}
              <li>
                <a 
                  href={link.href}
                  class="group flex items-center text-sm text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1"
                >
                  <span class="mr-2 opacity-70 group-hover:opacity-100 transition-opacity">→</span>
                  {link.label}
                </a>
              </li>
            {/each}
          </ul>
        </div>
        
        <!-- Support Links -->
        <div>
          <h4 class="text-white font-bold mb-6 flex items-center">
            <div class="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
              <span class="text-sm">☕</span>
            </div>
            Support
          </h4>
          <ul class="space-y-3">
            {#each footerLinks.support as link}
              <li>
                <a 
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  class="group flex items-center text-sm text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1"
                >
                  <span class="mr-2 opacity-70 group-hover:opacity-100 transition-opacity">→</span>
                  {link.label}
                  {#if link.external}
                    <svg class="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  {/if}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </div>
      
      <!-- CTA Section -->
      <div class="mt-12 p-8 bg-gradient-to-r from-cyan-900/20 via-blue-900/20 to-purple-900/20 rounded-3xl border border-cyan-500/20 backdrop-blur-sm">
        <div class="text-center">
          <h3 class="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey? 🎯
          </h3>
          <p class="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of security researchers who are leveling up their skills and earning bounties with AXIONARK.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/signin" 
              class="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105 text-lg"
            >
              Get Started Free →
            </a>
            <a 
              href="https://ko-fi.com/yourusername" 
              target="_blank"
              rel="noopener noreferrer"
              class="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105 text-lg flex items-center justify-center gap-2"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.189-.096-.323-.378-.323-.378s-.045-4.906-.025-7.602c.02-2.696-.516-3.227-.516-3.227l7.838.023s2.657.334 2.657 3.556c0 3.222-5.31 3.629-5.31 3.629z"/>
              </svg>
              Support Development
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bottom Bar -->
    <div class="relative bg-black/80 backdrop-blur-xl border-t border-gray-800">
      <div class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-slide"></div>
      
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6">
          <!-- Copyright -->
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <div class="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
            <span>© {currentYear} AXIONARK</span>
            <span class="text-gray-700">|</span>
            <span>All rights reserved</span>
          </div>
          
          <!-- Legal Links -->
          <div class="flex flex-wrap items-center gap-6 text-sm">
            <button 
              on:click={() => showPrivacyPolicy = true}
              class="text-gray-500 hover:text-cyan-400 transition-colors relative group"
            >
              Privacy Policy
              <span class="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </button>
            
            <button 
              on:click={() => showTermsOfService = true}
              class="text-gray-500 hover:text-cyan-400 transition-colors relative group"
            >
              Terms of Service
              <span class="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </button>
            
            <button 
              on:click={() => showCookiePolicy = true}
              class="text-gray-500 hover:text-cyan-400 transition-colors relative group"
            >
              Cookie Policy
              <span class="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </button>
          </div>
          
          <!-- Made with Love -->
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <span>Made with</span>
            <div class="relative">
              <svg class="w-4 h-4 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
              </svg>
              <div class="absolute inset-0 bg-red-500 blur-xl opacity-50 animate-pulse"></div>
            </div>
            <span>by developers, for hackers</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</footer>

<style>
  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes slide {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-spin-slow {
    animation: spin-slow 20s linear infinite;
  }
  
  .animate-slide {
    animation: slide 3s linear infinite;
  }
</style>