<!-- src/lib/components/Footer.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import LegalModals from './LegalModals.svelte';
  
  const currentYear = new Date().getFullYear();
  
  // Modal states
  let showPrivacyPolicy = false;
  let showTermsOfService = false;
  let showCookiePolicy = false;
  
  const footerLinks = {
    learning: [
      { href: '/roadmap', label: 'Roadmap', icon: '🗺️' },
      { href: '/tasks', label: 'Tasks', icon: '🎯' },
      { href: '/journal', label: 'Journal', icon: '📔' }
    ],
    tracking: [
      { href: '/bugs', label: 'Bug Tracker', icon: '🐛' },
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/profile', label: 'Profile', icon: '👤' }
    ],
    resources: [
      { href: 'https://github.com/Duardz/axionark', label: 'Documentation', icon: '📚' },
      { href: 'https://ko-fi.com/duardz', label: 'Support', icon: '💬' }
    ]
  };
  
  const socialLinks = [
    { href: 'https://github.com/Duardz', icon: 'github', path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' }
  ];
  
  function isActive(path: string) {
    return $page.url.pathname === path;
  }
</script>

<!-- Legal Modals Component -->
<LegalModals 
  bind:showPrivacyPolicy 
  bind:showTermsOfService 
  bind:showCookiePolicy 
/>

<footer class="relative mt-auto overflow-hidden bg-gradient-to-b from-gray-900 via-gray-950 to-black">
  <!-- Futuristic Grid Pattern -->
  <div class="absolute inset-0 opacity-10">
    <div class="absolute inset-0" style="background-image: url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;);"></div>
  </div>
  
  <!-- Animated Background Elements -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
    <div class="absolute top-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float"></div>
  </div>

  <div class="relative">
    <!-- Top Gradient Line -->
    <div class="h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
    
    <!-- Main Footer Content -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
        <!-- Brand Section -->
        <div class="lg:col-span-2">
          <!-- Futuristic Logo -->
          <div class="flex items-center space-x-4 mb-6">
            <div class="relative w-16 h-16">
              <!-- Rotating Ring -->
              <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl opacity-20 animate-spin-slow"></div>
              
              <!-- Main Logo -->
              <div class="relative w-16 h-16 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                <!-- Hexagon Shape -->
                <svg class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 7L16 10V14L12 17L8 14V10L12 7Z" fill="currentColor" opacity="0.8"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
              </div>
              
              <!-- Glow Effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
            </div>
            
            <div>
              <h3 class="text-3xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                AXIONARK
              </h3>
              <p class="text-xs font-medium tracking-[0.3em] text-gray-500 uppercase">Cyber Elite Training</p>
            </div>
          </div>
          
          <p class="text-gray-400 text-sm leading-relaxed mb-8 max-w-md">
            Master the art of cybersecurity with our cutting-edge training platform. 
            Join the next generation of elite security researchers and bug bounty hunters.
          </p>
          
          <!-- Social Links -->
          <div class="flex space-x-3">
            {#each socialLinks as social}
              <a 
                href={social.href}
                class="relative w-12 h-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:border-cyan-500/50 group"
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
        
        <!-- Learning Links -->
        <div>
          <h4 class="text-white font-bold mb-6 flex items-center">
            <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
              <span class="text-sm">📚</span>
            </div>
            Learning
          </h4>
          <ul class="space-y-3">
            {#each footerLinks.learning as link}
              <li>
                <a 
                  href={link.href}
                  class={`group flex items-center text-sm transition-all duration-300 ${
                    isActive(link.href) 
                      ? 'text-cyan-400' 
                      : 'text-gray-400 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <span class="mr-2 opacity-70 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                  {link.label}
                  {#if isActive(link.href)}
                    <span class="ml-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  {/if}
                </a>
              </li>
            {/each}
          </ul>
        </div>
        
        <!-- Tracking Links -->
        <div>
          <h4 class="text-white font-bold mb-6 flex items-center">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <span class="text-sm">📊</span>
            </div>
            Tracking
          </h4>
          <ul class="space-y-3">
            {#each footerLinks.tracking as link}
              <li>
                <a 
                  href={link.href}
                  class={`group flex items-center text-sm transition-all duration-300 ${
                    isActive(link.href) 
                      ? 'text-cyan-400' 
                      : 'text-gray-400 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <span class="mr-2 opacity-70 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                  {link.label}
                  {#if isActive(link.href)}
                    <span class="ml-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  {/if}
                </a>
              </li>
            {/each}
          </ul>
        </div>
        
        <!-- Resources Links -->
        <div>
          <h4 class="text-white font-bold mb-6 flex items-center">
            <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
              <span class="text-sm">🔧</span>
            </div>
            Resources
          </h4>
          <ul class="space-y-3">
            {#each footerLinks.resources as link}
              <li>
                <a 
                  href={link.href}
                  class="group flex items-center text-sm text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1"
                >
                  <span class="mr-2 opacity-70 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                  {link.label}
                  <svg class="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Futuristic Bottom Bar -->
    <div class="relative bg-black/50 backdrop-blur-xl border-t border-gray-800/50">
      <!-- Animated Line -->
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
            <span>STUDY.</span>
            <div class="relative">
              HACK.
              <div class="absolute inset-0 bg-red-500 blur-xl opacity-50 animate-pulse"></div>
            </div>
            <span>REPEAT.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</footer>

<style>
  @keyframes float {
    0%, 100% {
      transform: translateY(0) translateX(-50%);
    }
    50% {
      transform: translateY(-20px) translateX(-50%);
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