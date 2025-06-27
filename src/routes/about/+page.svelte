<!-- src/routes/about/+page.svelte -->
<script lang="ts">
  import LandingNav from '$lib/components/LandingNav.svelte';
  import LandingFooter from '$lib/components/LandingFooter.svelte';
  
  const stats = [
    { value: '1K+', label: 'Active Users' },
    { value: '5K+', label: 'Bugs Found' },
    { value: '$1M+', label: 'Bounties Earned' },
    { value: '100+', label: 'Modules' }
  ];
  
  const features = [
    {
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed analytics and milestone tracking.',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    },
    {
      title: 'Secure Storage',
      description: 'Your data is encrypted with military-grade AES-256 encryption, accessible only by you.',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
    },
    {
      title: 'Gamification',
      description: 'Level up through XP system, unlock achievements, and compete on leaderboards.',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z'
    }
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
          About AXIONARK
        </h1>
        <p class="text-xl text-gray-300 leading-relaxed">
          A comprehensive platform designed for security researchers and bug bounty hunters 
          to track their progress, document findings, and accelerate their journey to becoming 
          elite cybersecurity professionals.
        </p>
      </div>
    </div>
  </section>
  
  <!-- Stats Section -->
  <section class="py-16 border-t border-gray-800">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        {#each stats as stat}
          <div class="text-center">
            <div class="text-3xl font-bold text-cyan-500 mb-2">{stat.value}</div>
            <div class="text-sm text-gray-400">{stat.label}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>
  
  <!-- Features Section -->
  <section class="py-20 border-t border-gray-800">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-3xl font-bold mb-12">Core Features</h2>
      
      <div class="grid md:grid-cols-3 gap-8">
        {#each features as feature}
          <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
            <div class="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={feature.icon} />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">{feature.title}</h3>
            <p class="text-gray-400 text-sm">{feature.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>
  
  <!-- Mission Section -->
  <section class="py-20 border-t border-gray-800">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-6">Our Mission</h2>
        <p class="text-gray-300 text-lg leading-relaxed mb-8">
          To empower security researchers with the tools they need to track, learn, and grow 
          in their bug bounty journey. We believe in making cybersecurity education accessible 
          while maintaining the highest standards of data privacy and security.
        </p>
        <a 
          href="/" 
          class="inline-flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
        >
          Start Your Journey
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </div>
  </section>
  
  <!-- Developer Section -->
  <section class="py-20 border-t border-gray-800">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-3xl font-bold mb-8">Built by Developers, for Hackers</h2>
        <div class="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <p class="text-gray-300 mb-6">
            AXIONARK was created out of a personal need for a better way to track bug bounty 
            progress and learnings. As developers and security enthusiasts ourselves, we understand 
            the importance of having the right tools to support your journey.
          </p>
          <p class="text-gray-300 mb-6">
            Every feature is designed with the security researcher in mind - from encrypted 
            storage for sensitive findings to gamification elements that make learning engaging.
          </p>
          <div class="flex items-center space-x-4">
            <a 
              href="https://github.com/Duardz/axionark" 
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              View on GitHub
            </a>
            <a 
              href="https://ko-fi.com/duardz" 
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.189-.096-.323-.378-.323-.378s-.045-4.906-.025-7.602c.02-2.696-.516-3.227-.516-3.227l7.838.023s2.657.334 2.657 3.556c0 3.222-5.31 3.629-5.31 3.629z"/>
              </svg>
              Support on Ko-fi
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<LandingFooter />