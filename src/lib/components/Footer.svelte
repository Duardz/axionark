<!-- src/lib/components/Footer.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  
  const currentYear = new Date().getFullYear();
  
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
      { href: '#', label: 'Documentation', icon: '📚' },
      { href: '#', label: 'Community', icon: '👥' },
      { href: '#', label: 'Support', icon: '💬' }
    ]
  };
  
  const socialLinks = [
    { href: '#', icon: 'github', path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' },
    { href: '#', icon: 'twitter', path: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
    { href: '#', icon: 'discord', path: 'M13.545 2.907a13.227 13.227 0 00-3.257-1.011.05.05 0 00-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 00-3.658 0 8.258 8.258 0 00-.412-.833.051.051 0 00-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 00-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 003.995 2.02.05.05 0 00.056-.019c.308-.42.582-.863.818-1.329a.05.05 0 00-.01-.059.051.051 0 00-.018-.011 8.875 8.875 0 01-1.248-.595.05.05 0 01-.02-.066.051.051 0 01.015-.019c.084-.063.168-.129.248-.195a.05.05 0 01.051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 01.053.007c.08.066.164.132.248.195a.051.051 0 01-.004.085 8.254 8.254 0 01-1.249.594.05.05 0 00-.03.03.052.052 0 00.003.041c.24.465.515.909.817 1.329a.05.05 0 00.056.019 13.235 13.235 0 004.001-2.02.049.049 0 00.021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 00-.02-.019zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612z' }
  ];
  
  function isActive(path: string) {
    return $page.url.pathname === path;
  }
</script>

<footer class="bg-gray-900 dark:bg-black text-gray-300 mt-auto relative overflow-hidden">
  <!-- Animated Background Elements -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
  </div>

  <div class="relative">
    <!-- Main Footer Content -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
        <!-- Brand Section -->
        <div class="lg:col-span-2">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform duration-300">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                AXIONARK
              </h3>
              <p class="text-xs text-gray-500">Elite Bug Bounty Training</p>
            </div>
          </div>
          
          <p class="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
            Master the art of bug bounty hunting with our comprehensive roadmap, 
            track your progress, and join the ranks of elite security researchers.
          </p>
          
          <!-- Social Links -->
          <div class="flex space-x-4">
            {#each socialLinks as social}
              <a 
                href={social.href}
                class="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label={social.icon}
              >
                <svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d={social.path} />
                </svg>
              </a>
            {/each}
          </div>
        </div>
        
        <!-- Learning Links -->
        <div>
          <h4 class="text-white font-semibold mb-4 flex items-center">
            <span class="text-lg mr-2">📚</span>
            Learning
          </h4>
          <ul class="space-y-3">
            {#each footerLinks.learning as link}
              <li>
                <a 
                  href={link.href}
                  class={`text-sm hover:text-white transition-colors flex items-center group ${
                    isActive(link.href) ? 'text-indigo-400' : ''
                  }`}
                >
                  <span class="mr-2 opacity-70 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                  {link.label}
                  {#if isActive(link.href)}
                    <span class="ml-2 w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                  {/if}
                </a>
              </li>
            {/each}
          </ul>
        </div>
        
        <!-- Tracking Links -->
        <div>
          <h4 class="text-white font-semibold mb-4 flex items-center">
            <span class="text-lg mr-2">📊</span>
            Tracking
          </h4>
          <ul class="space-y-3">
            {#each footerLinks.tracking as link}
              <li>
                <a 
                  href={link.href}
                  class={`text-sm hover:text-white transition-colors flex items-center group ${
                    isActive(link.href) ? 'text-indigo-400' : ''
                  }`}
                >
                  <span class="mr-2 opacity-70 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                  {link.label}
                  {#if isActive(link.href)}
                    <span class="ml-2 w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                  {/if}
                </a>
              </li>
            {/each}
          </ul>
        </div>
        
        <!-- Resources Links -->
        <div>
          <h4 class="text-white font-semibold mb-4 flex items-center">
            <span class="text-lg mr-2">🔧</span>
            Resources
          </h4>
          <ul class="space-y-3">
            {#each footerLinks.resources as link}
              <li>
                <a 
                  href={link.href}
                  class="text-sm hover:text-white transition-colors flex items-center group"
                >
                  <span class="mr-2 opacity-70 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                  {link.label}
                  <svg class="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </div>
      
      <!-- Stats Section -->
      <div class="mt-12 pt-8 border-t border-gray-800">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div class="text-center">
            <div class="text-2xl font-bold text-white mb-1">500K+</div>
            <div class="text-xs text-gray-500">XP Earned</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-white mb-1">10K+</div>
            <div class="text-xs text-gray-500">Tasks Completed</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-white mb-1">$1M+</div>
            <div class="text-xs text-gray-500">Bounties Earned</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-white mb-1">1K+</div>
            <div class="text-xs text-gray-500">Active Hunters</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bottom Bar -->
    <div class="bg-black/30 backdrop-blur-sm border-t border-gray-800">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div class="text-sm text-gray-500">
            © {currentYear} AXIONARK. All rights reserved.
          </div>
          
          <div class="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
            <a href="#" class="text-gray-500 hover:text-gray-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" class="text-gray-500 hover:text-gray-300 transition-colors">
              Terms of Service
            </a>
            <a href="#" class="text-gray-500 hover:text-gray-300 transition-colors">
              Cookie Policy
            </a>
          </div>
          
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <span>Made with</span>
            <svg class="w-4 h-4 text-red-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
            <span>for hackers</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</footer>

<style>
  footer {
    background: linear-gradient(to bottom, #111827, #000000);
  }
</style>