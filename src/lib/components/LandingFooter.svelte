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
      { href: '/sponsors', label: 'Sponsors' }
    ],
    resources: [
      { href: 'https://github.com/Duardz/axionark', label: 'GitHub', external: true },
      { href: 'https://ko-fi.com/duardz', label: 'Support', external: true },
      { href: 'mailto:support@axionark.com', label: 'Contact' }
    ]
  };
  
  const socialLinks = [
    { 
      href: 'https://github.com/Duardz', 
      icon: 'github', 
      path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' 
    }
  ];
</script>

<!-- Legal Modals Component -->
<LegalModals 
  bind:showPrivacyPolicy 
  bind:showTermsOfService 
  bind:showCookiePolicy 
/>

<footer class="bg-gray-900 border-t border-gray-800">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <!-- Brand -->
      <div class="md:col-span-2">
        <div class="flex items-center space-x-4 mb-6">
          <div class="relative w-14 h-14">
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl opacity-20 animate-spin-slow"></div>
            <div class="relative w-14 h-14 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 7L16 10V14L12 17L8 14V10L12 7Z" fill="currentColor" opacity="0.8"/>
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
              </svg>
            </div>
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
          </div>
          
          <div>
            <h3 class="text-2xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              AXIONARK
            </h3>
            <p class="text-xs font-medium tracking-[0.3em] text-gray-500 uppercase">Cyber Elite Training</p>
          </div>
        </div>
        
        <p class="text-gray-400 text-sm mb-4 max-w-md">
          Master the art of cybersecurity with our cutting-edge training platform. 
          Track your journey to becoming an elite security researcher.
        </p>
        
        <!-- Social Links -->
        <div class="flex space-x-3">
          {#each socialLinks as social}
            <a 
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-700 hover:border-gray-600 transition-all duration-300"
              aria-label={social.icon}
            >
              <svg class="w-5 h-5 text-gray-400 hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d={social.path} />
              </svg>
            </a>
          {/each}
        </div>
      </div>
      
      <!-- Navigation Links -->
      <div>
        <h4 class="text-white font-semibold mb-4">Navigation</h4>
        <ul class="space-y-2">
          {#each footerLinks.product as link}
            <li>
              <a 
                href={link.href}
                class="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
      
      <!-- Resources -->
      <div>
        <h4 class="text-white font-semibold mb-4">Resources</h4>
        <ul class="space-y-2">
          {#each footerLinks.resources as link}
            <li>
              <a 
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                class="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center"
              >
                {link.label}
                {#if link.external}
                  <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>
    
    <!-- Bottom Bar -->
    <div class="mt-12 pt-8 border-t border-gray-800">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <!-- Copyright -->
        <div class="text-sm text-gray-500">
          © {currentYear} AXIONARK. All rights reserved.
        </div>
        
        <!-- Legal Links -->
        <div class="flex items-center gap-6 text-sm">
          <button 
            on:click={() => showPrivacyPolicy = true}
            class="text-gray-500 hover:text-gray-300 transition-colors"
          >
            Privacy Policy
          </button>
          
          <button 
            on:click={() => showTermsOfService = true}
            class="text-gray-500 hover:text-gray-300 transition-colors"
          >
            Terms of Service
          </button>
          
          <button 
            on:click={() => showCookiePolicy = true}
            class="text-gray-500 hover:text-gray-300 transition-colors"
          >
            Cookie Policy
          </button>
        </div>
      </div>
      
      <!-- Support CTA -->
      <div class="mt-8 text-center">
        <a 
          href="https://ko-fi.com/duardz" 
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
        >
          <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.189-.096-.323-.378-.323-.378s-.045-4.906-.025-7.602c.02-2.696-.516-3.227-.516-3.227l7.838.023s2.657.334 2.657 3.556c0 3.222-5.31 3.629-5.31 3.629z"/>
          </svg>
          Support Development on Ko-fi
        </a>
      </div>
    </div>
  </div>
</footer>

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
</style>