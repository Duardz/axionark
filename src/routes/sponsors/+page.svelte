<!-- src/routes/sponsors/+page.svelte -->
<script lang="ts">
  import LandingNav from '$lib/components/LandingNav.svelte';
  import LandingFooter from '$lib/components/LandingFooter.svelte';
  import SEO from '$lib/components/SEO.svelte';
  
  // Type definitions
  type KofiSponsor = {
    name: string;
    avatar: string;
    tier: string;
    amount: string;
  };
  
  type GitHubSponsor = {
    name: string;
    avatar: string;
    tier: string;
    contributions: string;
  };
  
  const benefits = [
    { icon: '📔', title: 'Keep It Free', description: 'Help keep this journal free for all ethical hackers' },
    { icon: '🛠️', title: 'New Features', description: 'Enable development of new journaling features' },
    { icon: '🔒', title: 'Better Security', description: 'Support ongoing security improvements' },
    { icon: '💜', title: 'Support Indie Dev', description: 'Help a solo developer maintain this project' },
    { icon: '🖥️', title: 'Server Costs', description: 'Keep the servers running reliably' },
    { icon: '🚀', title: 'Continuous Updates', description: 'Enable regular improvements and bug fixes' }
  ];
  
  // Current sponsors - empty for now
  const sponsors: {
    kofi: KofiSponsor[];
    github: GitHubSponsor[];
  } = {
    kofi: [],
    github: []
  };
</script>

<LandingNav />

  <SEO seo={{
    title: 'Support AXIONARK - Keep the Journal Free',
    description: 'Support the development of AXIONARK, the free encrypted journal for ethical hackers. Your contribution helps keep this personal journaling tool accessible to everyone.',
    keywords: ['support', 'sponsors', 'donations', 'ko-fi', 'github sponsors']
  }} />

<div class="min-h-screen bg-black text-white relative overflow-hidden">
  <!-- Background elements -->
  <div class="absolute inset-0">
    <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-float"></div>
    <div class="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-float" style="animation-delay: 3s;"></div>
  </div>

  <!-- Hero Section -->
  <section class="relative py-24">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-5xl sm:text-6xl font-black mb-6 animate-fade-in">
          Support Your <span class="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">Private Journal</span>
        </h1>
        <p class="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto animate-fade-in-delay">
          AXIONARK is a free, open-source personal journal for ethical hackers. Your support helps keep 
          the servers running, enables new features, and ensures this private journaling tool remains 
          free and accessible to everyone.
        </p>
      </div>
    </div>
  </section>
  
  <!-- Current Sponsors Section -->
  <section class="py-20 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-4xl font-bold text-center mb-16">
        Amazing <span class="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Supporters</span>
      </h2>
      
      <div class="max-w-6xl mx-auto">
        <!-- Ko-fi Sponsors -->
        <div class="mb-12">
          <h3 class="text-2xl font-semibold mb-8 flex items-center justify-center">
            <img 
              src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' 
              alt='Ko-fi'
              class="h-8 mr-3"
            />
            Ko-fi Supporters
          </h3>
          
          <div class="grid md:grid-cols-3 gap-6">
            {#if sponsors.kofi.length > 0}
              {#each sponsors.kofi as sponsor, i}
                <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 hover:border-orange-800/50 transition-all duration-300 animate-fade-in" style="animation-delay: {i * 100}ms">
                  <div class="flex items-center mb-4">
                    <div class="text-4xl mr-4">{sponsor.avatar}</div>
                    <div>
                      <h4 class="font-semibold text-lg">{sponsor.name}</h4>
                      <p class="text-sm text-orange-400">{sponsor.tier}</p>
                    </div>
                  </div>
                  <div class="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    {sponsor.amount}
                  </div>
                </div>
              {/each}
            {:else}
              <div class="md:col-span-3">
                <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 border border-gray-800 text-center">
                  <div class="text-5xl mb-4">☕</div>
                  <h4 class="text-xl font-semibold mb-2 text-gray-300">Be Our First Ko-fi Supporter!</h4>
                  <p class="text-gray-500 mb-6">Help keep this personal journal free for the ethical hacking community</p>
                  <a 
                    href='https://ko-fi.com/duardz' 
                    target='_blank'
                    rel="noopener noreferrer"
                    class="inline-block"
                  >
                    <img 
                      height='36' 
                      style='border:0px;height:36px;' 
                      src='https://storage.ko-fi.com/cdn/kofi2.png?v=3' 
                      alt='Buy Me a Coffee at ko-fi.com' 
                    />
                  </a>
                </div>
              </div>
            {/if}
          </div>
        </div>
        
        <!-- GitHub Sponsors -->
        <div>
          <h3 class="text-2xl font-semibold mb-8 flex items-center justify-center">
            <svg class="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            GitHub Contributors
          </h3>
          
          <div class="grid md:grid-cols-3 gap-6">
            {#if sponsors.github.length > 0}
              {#each sponsors.github as sponsor, i}
                <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 hover:border-purple-800/50 transition-all duration-300 animate-fade-in" style="animation-delay: {(i + 3) * 100}ms">
                  <div class="flex items-center mb-4">
                    <div class="text-4xl mr-4">{sponsor.avatar}</div>
                    <div>
                      <h4 class="font-semibold text-lg">{sponsor.name}</h4>
                      <p class="text-sm text-purple-400">{sponsor.tier}</p>
                    </div>
                  </div>
                  <div class="text-lg font-bold text-gray-300">
                    {sponsor.contributions}
                  </div>
                </div>
              {/each}
            {:else}
              <div class="md:col-span-3">
                <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 border border-gray-800 text-center">
                  <div class="text-5xl mb-4">💻</div>
                  <h4 class="text-xl font-semibold mb-2 text-gray-300">No Contributors Yet</h4>
                  <p class="text-gray-500 mb-6">Be the first to contribute to this open-source journal!</p>
                  <a 
                    href="https://github.com/Duardz/axionark"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-300 border border-gray-700"
                  >
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                    Start Contributing
                  </a>
                </div>
              </div>
            {/if}
          </div>
        </div>
        
        <!-- Become a Sponsor CTA -->
        <div class="mt-12 text-center">
          <p class="text-gray-400 mb-6">Support the development of this free journaling tool</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href='https://ko-fi.com/duardz' 
              target='_blank'
              rel="noopener noreferrer"
              class="inline-block"
            >
              <img 
                height='36' 
                style='border:0px;height:36px;' 
                src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' 
                alt='Buy Me a Coffee at ko-fi.com' 
              />
            </a>
            
            <div class="text-gray-600">or</div>
            
            <a 
              href="https://github.com/sponsors/Duardz"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-300 border border-gray-700"
            >
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              Sponsor on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Why Support Section -->
  <section class="py-20 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-4xl font-bold text-center mb-16">
        Why Your Support <span class="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Matters</span>
      </h2>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {#each benefits as benefit, i}
          <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 animate-fade-in" style="animation-delay: {i * 100}ms">
            <div class="text-3xl mb-4">{benefit.icon}</div>
            <h3 class="text-lg font-semibold mb-2">{benefit.title}</h3>
            <p class="text-gray-400 text-sm">{benefit.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>
  
  <!-- What Your Support Enables -->
  <section class="py-20 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-4xl font-bold text-center mb-16">
          What Your Support <span class="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Enables</span>
        </h2>
        
        <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 border border-gray-800">
          <div class="space-y-6">
            <div class="flex items-start">
              <div class="flex-shrink-0 w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mr-4">
                <span class="text-2xl">🖥️</span>
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-2">Server Infrastructure</h3>
                <p class="text-gray-400">
                  Your support helps pay for reliable servers to keep your encrypted journal data safe and accessible 24/7.
                </p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-4">
                <span class="text-2xl">🔐</span>
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-2">Security Audits</h3>
                <p class="text-gray-400">
                  Regular security reviews ensure your private journal entries remain encrypted and protected.
                </p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="flex-shrink-0 w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mr-4">
                <span class="text-2xl">⏰</span>
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-2">Development Time</h3>
                <p class="text-gray-400">
                  As a solo developer, your support allows me to dedicate more time to improving AXIONARK instead of client work.
                </p>
              </div>
            </div>
            
            <div class="flex items-start">
              <div class="flex-shrink-0 w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mr-4">
                <span class="text-2xl">🆓</span>
              </div>
              <div>
                <h3 class="text-xl font-semibold mb-2">Free Forever</h3>
                <p class="text-gray-400">
                  Your contributions ensure AXIONARK remains free for all ethical hackers who need a private journal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Other Ways to Help -->
  <section class="py-20 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-4xl font-bold text-center mb-16">
        Other Ways to <span class="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Contribute</span>
      </h2>
      
      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div class="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300 group">
          <div class="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-3">Contribute Code</h3>
          <p class="text-gray-400 mb-6">
            Help improve this journaling tool by contributing to our open-source codebase.
          </p>
          <a 
            href="https://github.com/Duardz/axionark"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium"
          >
            View Repository
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        
        <div class="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300 group">
          <div class="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-3">Share the Word</h3>
          <p class="text-gray-400 mb-6">
            Tell fellow ethical hackers about this free journaling tool for documenting their journey.
          </p>
          <span class="inline-flex items-center text-purple-400 font-medium">
            Spread the knowledge
          </span>
        </div>
        
        <div class="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300 group">
          <div class="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-3">Report Bugs</h3>
          <p class="text-gray-400 mb-6">
            Found an issue? Help improve the journal by reporting bugs and suggesting features.
          </p>
          <a 
            href="https://github.com/Duardz/axionark/issues"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center text-yellow-400 hover:text-yellow-300 font-medium"
          >
            Report Issue
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Thank You Section -->
  <section class="py-24 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold mb-8">
          Thank You <span class="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">❤️</span>
        </h2>
        <p class="text-xl text-gray-300 mb-12 leading-relaxed">
          Every contribution helps keep AXIONARK free and accessible. You're not just supporting a tool – 
          you're helping ethical hackers worldwide have a secure, private space to document their journey.
        </p>
        
        <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 border border-gray-800">
          <p class="text-2xl font-semibold mb-8 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            "Building a private journal for hackers, by a hacker, with the support of hackers."
          </p>
          <p class="text-gray-400">- Duardz, Solo Developer</p>
        </div>
        
        <div class="mt-12">
          <a 
            href='https://ko-fi.com/duardz' 
            target='_blank'
            rel="noopener noreferrer"
            class="inline-block"
          >
            <img 
              height='36' 
              style='border:0px;height:36px;' 
              src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' 
              alt='Buy Me a Coffee at ko-fi.com' 
            />
          </a>
        </div>
      </div>
    </div>
  </section>
</div>

<LandingFooter />

<style>
  @keyframes float {
    0%, 100% {
      transform: translateY(0) translateX(0) scale(1);
    }
    33% {
      transform: translateY(-30px) translateX(20px) scale(1.05);
    }
    66% {
      transform: translateY(20px) translateX(-20px) scale(0.95);
    }
  }
  
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fade-in-delay {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    50% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-float {
    animation: float 20s ease-in-out infinite;
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
  
  .animate-fade-in-delay {
    animation: fade-in-delay 1.2s ease-out forwards;
  }
</style>