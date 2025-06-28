<!-- src/routes/about/+page.svelte -->
<script lang="ts">
  import LandingNav from '$lib/components/LandingNav.svelte';
  import LandingFooter from '$lib/components/LandingFooter.svelte';
  
  const stats = [
    { value: '100%', label: 'Private & Secure', icon: '🔒' },
    { value: 'Free', label: 'Forever', icon: '💚' },
    { value: 'Ethical', label: 'Hacking Only', icon: '⚖️' },
    { value: 'Your', label: 'Data, Your Control', icon: '🔑' }
  ];
  
  const features = [
    {
      title: 'Journal Your Journey',
      description: 'Document your ethical hacking experiences, learnings, and discoveries in a structured way.',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Your Data, Your Key',
      description: 'Everything is encrypted with your password. We cannot access your data - only you can.',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Progress Tracking',
      description: 'Gamified progress tracking to motivate your ethical hacking journey, not to train or teach.',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      gradient: 'from-yellow-500 to-orange-600'
    }
  ];
  
  const timeline = [
    { year: '2025', event: 'AXIONARK launched - A secure journal for ethical hackers' },
    { year: 'Future', event: 'Growing community of responsible security researchers' }
  ];
</script>

<LandingNav />

<div class="min-h-screen bg-black text-white relative overflow-hidden">
  <!-- Background elements -->
  <div class="absolute inset-0">
    <div class="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
  </div>

  <!-- Hero Section -->
  <section class="relative py-24">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-5xl sm:text-6xl font-black mb-6 animate-fade-in">
          About <span class="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">AXIONARK</span>
        </h1>
        <p class="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto animate-fade-in-delay">
          Built by a solo developer passionate about ethical hacking, AXIONARK is a secure journaling companion 
          designed to help security researchers document their journey, track findings, and organize their 
          progress in the bug bounty world - all while maintaining complete privacy and ethical standards.
        </p>
      </div>
    </div>
  </section>
  
  <!-- Stats Section -->
  <section class="py-20 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {#each stats as stat, i}
          <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300 transform hover:scale-105 animate-fade-in" style="animation-delay: {i * 100}ms">
            <div class="text-4xl mb-3">{stat.icon}</div>
            <div class="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">{stat.value}</div>
            <div class="text-sm text-gray-400">{stat.label}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>
  
  <!-- Developer Story -->
  <section class="py-20 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 border border-gray-800">
          <h2 class="text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            The Solo Developer Story
          </h2>
          
          <div class="space-y-6 text-gray-300">
            <p class="text-lg leading-relaxed">
              Hi, I'm <span class="text-white font-semibold">Duardz</span>, the solo developer behind AXIONARK. 
              As an ethical hacker and bug bounty hunter myself, I found myself constantly struggling to 
              keep track of my findings, document my learning progress, and organize my journey in a secure way.
            </p>
            
            <p class="text-lg leading-relaxed">
              Traditional note-taking apps weren't designed for security researchers. They lacked the privacy 
              we need, the structure for tracking vulnerabilities, and most importantly - they weren't built 
              with an ethical hacking mindset. That's when AXIONARK was born.
            </p>
            
            <p class="text-lg leading-relaxed">
              AXIONARK is NOT a hacking tutorial or training platform. It's your personal, encrypted journal 
              companion for documenting your ethical hacking journey. Every feature is built to help you stay 
              organized, motivated, and most importantly - ethical in your security research.
            </p>
          </div>
          
          <div class="mt-8 flex flex-wrap gap-4">
            <a 
              href="https://github.com/Duardz" 
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-300 border border-gray-700"
            >
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              Follow on GitHub
            </a>
            
            <a 
              href="https://github.com/Duardz/axionark" 
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all duration-300"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              View Source Code
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Features Section -->
  <section class="py-20 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-4xl font-bold text-center mb-16">
        Core <span class="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Features</span>
      </h2>
      
      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {#each features as feature, i}
          <div class="group relative animate-fade-in" style="animation-delay: {i * 150}ms">
            <div class="absolute inset-0 bg-gradient-to-r {feature.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div class="relative bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300 h-full">
              <div class="w-14 h-14 bg-gradient-to-r {feature.gradient} rounded-xl flex items-center justify-center mb-6">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={feature.icon} />
                </svg>
              </div>
              <h3 class="text-xl font-semibold mb-3">{feature.title}</h3>
              <p class="text-gray-400">{feature.description}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>
  
  <!-- Mission Section -->
  <section class="py-20 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold mb-8">
          Our <span class="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Mission</span>
        </h2>
        
        <div class="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-3xl p-12 border border-purple-800/30 backdrop-blur-sm">
          <p class="text-xl text-gray-200 leading-relaxed mb-8">
            To provide a <span class="font-semibold text-white">free, secure, and private journaling companion</span> 
            for ethical hackers and security researchers worldwide. We believe every ethical hacker deserves a safe 
            space to document their journey without compromising their privacy or security.
          </p>
          
          <p class="text-lg text-gray-300 mb-12">
            AXIONARK will always remain free for all features. We don't sell your data, we can't even access it. 
            Your support helps maintain servers and keep the platform running for the ethical hacking community.
          </p>
          
          <a 
            href="/" 
            class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
          >
            Start Your Journey
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Timeline -->
  <section class="py-20 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-4xl font-bold text-center mb-16">
        Development <span class="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Timeline</span>
      </h2>
      
      <div class="max-w-3xl mx-auto">
        {#each timeline as item, i}
          <div class="flex items-center mb-8 animate-fade-in" style="animation-delay: {i * 200}ms">
            <div class="flex-shrink-0 w-24 text-right pr-8">
              <span class="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">{item.year}</span>
            </div>
            <div class="flex-shrink-0 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full relative">
              {#if i < timeline.length - 1}
                <div class="absolute top-4 left-1.5 w-1 h-24 bg-gradient-to-b from-yellow-400 to-orange-500 opacity-30"></div>
              {/if}
            </div>
            <div class="flex-grow pl-8">
              <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <p class="text-gray-300">{item.event}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>
  
  <!-- CTA Section -->
  <section class="py-24 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold mb-6">
          Join the <span class="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">AXIONARK</span> Community
        </h2>
        <p class="text-xl text-gray-300 mb-12">
          Start tracking your bug bounty journey today. It's completely free.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/" 
            class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
          >
            Get Started Free
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          
          <a 
            href="/sponsors" 
            class="inline-flex items-center justify-center px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all duration-300 border border-gray-700"
          >
            Support Development
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </section>
</div>

<LandingFooter />

<style>
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
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
  
  .animate-fade-in-delay {
    animation: fade-in-delay 1.2s ease-out forwards;
  }
</style>