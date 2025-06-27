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
    },
    {
      href: 'https://ko-fi.com/duardz',
      icon: 'kofi',
      path: 'M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.189-.096-.323-.378-.323-.378s-.045-4.906-.025-7.602c.02-2.696-.516-3.227-.516-3.227l7.838.023s2.657.334 2.657 3.556c0 3.222-5.31 3.629-5.31 3.629z'
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
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
      <!-- Brand -->
      <div class="md:col-span-2">
        <div class="mb-6">
          <h3 class="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
            AXIONARK
          </h3>
          <p class="text-xs font-medium tracking-[0.3em] text-gray-500 uppercase">Ethical Hacking Journal</p>
        </div>
        
        <p class="text-gray-400 text-sm mb-6 max-w-md">
          Your secure companion for documenting ethical hacking journeys. 
          Track findings, organize research, and stay responsible.
        </p>
        
        <!-- Social Links -->
        <div class="flex space-x-3">
          {#each socialLinks as social}
            <a 
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              class="w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center transition-all duration-300 group border border-gray-700 hover:border-gray-600"
              aria-label={social.icon}
            >
              <svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d={social.path} />
              </svg>
            </a>
          {/each}
        </div>
      </div>
      
      <!-- Navigation Links -->
      <div>
        <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h4>
        <ul class="space-y-3">
          {#each footerLinks.product as link}
            <li>
              <a 
                href={link.href}
                class="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center group"
              >
                <span class="w-4 h-0.5 bg-gray-600 group-hover:bg-cyan-500 mr-2 transition-all duration-300 group-hover:w-6"></span>
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
      
      <!-- Resources -->
      <div>
        <h4 class="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
        <ul class="space-y-3">
          {#each footerLinks.resources as link}
            <li>
              <a 
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                class="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center group"
              >
                <span class="w-4 h-0.5 bg-gray-600 group-hover:bg-purple-500 mr-2 transition-all duration-300 group-hover:w-6"></span>
                {link.label}
                {#if link.external}
                  <svg class="w-3 h-3 ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div class="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-2xl p-8 mb-12 border border-gray-700">
      <div class="text-center">
        <h3 class="text-2xl font-bold text-white mb-3">Ready to level up?</h3>
        <p class="text-gray-400 mb-6 max-w-2xl mx-auto">
          Join the community of ethical hackers using AXIONARK to document their responsible security research journey.
        </p>
        <a 
          href="/" 
          class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
        >
          Get Started Free
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </div>
    
    <!-- Bottom Bar -->
    <div class="pt-8 border-t border-gray-800">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">
        <!-- Copyright -->
        <div class="text-sm text-gray-500">
          © {currentYear} AXIONARK. All rights reserved. Built with 💜 by <a href="https://github.com/Duardz" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 transition-colors">Duardz</a>
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
      
      <!-- Support Badge -->
      <div class="mt-8 text-center">
        <a 
          href="https://ko-fi.com/duardz" 
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center text-sm text-gray-500 hover:text-gray-300 transition-colors group"
        >
          <svg class="w-4 h-4 mr-2 text-orange-500 group-hover:text-orange-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.189-.096-.323-.378-.323-.378s-.045-4.906-.025-7.602c.02-2.696-.516-3.227-.516-3.227l7.838.023s2.657.334 2.657 3.556c0 3.222-5.31 3.629-5.31 3.629z"/>
          </svg>
          Support Development on Ko-fi
        </a>
      </div>
    </div>
  </div>
</footer>