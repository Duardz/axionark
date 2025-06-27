<!-- src/routes/sponsors/+page.svelte -->
<script lang="ts">
  import LandingNav from '$lib/components/LandingNav.svelte';
  import LandingFooter from '$lib/components/LandingFooter.svelte';
  
  const benefits = [
    'Early access to new features',
    'Priority bug fixes and support',
    'Influence development roadmap',
    'Support independent development',
    'Help keep the platform free'
  ];
</script>

<LandingNav />

<div class="min-h-screen bg-black text-white relative z-0">
  <!-- Hero Section -->
  <section class="relative py-20 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"></div>
    
    <div class="relative container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl">
        <h1 class="text-4xl sm:text-5xl font-bold mb-6">
          Support AXIONARK
        </h1>
        <p class="text-xl text-gray-300 leading-relaxed">
          Help sustain and improve AXIONARK. Your support enables continuous development, 
          server maintenance, and keeps the platform accessible to everyone.
        </p>
      </div>
    </div>
  </section>
  
  <!-- Why Support Section -->
  <section class="py-20 border-t border-gray-800">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-3xl font-bold mb-8">Why Your Support Matters</h2>
        
        <div class="space-y-6 mb-12">
          <p class="text-gray-300 text-lg">
            AXIONARK is an independent project built with passion for the security research community. 
            Your support directly impacts:
          </p>
          
          <ul class="space-y-3">
            {#each benefits as benefit}
              <li class="flex items-start">
                <svg class="w-6 h-6 text-cyan-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-300">{benefit}</span>
              </li>
            {/each}
          </ul>
        </div>
        
        <!-- Ko-fi Button -->
        <div class="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
          <h3 class="text-2xl font-bold mb-4">Support on Ko-fi</h3>
          <p class="text-gray-300 mb-6">
            Buy me a coffee and help keep AXIONARK running and improving.
          </p>
          <a 
            href="https://ko-fi.com/duardz"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors text-lg"
          >
            <svg class="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.189-.096-.323-.378-.323-.378s-.045-4.906-.025-7.602c.02-2.696-.516-3.227-.516-3.227l7.838.023s2.657.334 2.657 3.556c0 3.222-5.31 3.629-5.31 3.629z"/>
            </svg>
            Support on Ko-fi
          </a>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Other Ways to Help -->
  <section class="py-20 border-t border-gray-800">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-3xl font-bold mb-8">Other Ways to Help</h2>
        
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">Contribute Code</h3>
            <p class="text-gray-400 text-sm mb-4">
              Help improve AXIONARK by contributing to our open-source codebase on GitHub.
            </p>
            <a 
              href="https://github.com/Duardz/axionark"
              target="_blank"
              rel="noopener noreferrer"
              class="text-cyan-500 hover:text-cyan-400 text-sm font-medium inline-flex items-center"
            >
              View Repository
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div class="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">Share the Word</h3>
            <p class="text-gray-400 text-sm mb-4">
              Help us grow by sharing AXIONARK with fellow security researchers and bug bounty hunters.
            </p>
            <span class="text-cyan-500 text-sm font-medium">
              Spread the knowledge
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Thank You Section -->
  <section class="py-20 border-t border-gray-800">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-6">Thank You</h2>
        <p class="text-gray-300 text-lg mb-8">
          Every contribution, no matter the size, helps keep AXIONARK running and improving. 
          Your support means the world to us and the entire community.
        </p>
        <div class="inline-flex items-center space-x-2 text-gray-400">
          <span>Made with</span>
          <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
          <span>for the security community</span>
        </div>
      </div>
    </div>
  </section>
</div>

<LandingFooter />