<!-- src/routes/sponsors/+page.svelte -->
<script lang="ts">
  import LandingNav from '$lib/components/LandingNav.svelte';
  import LandingFooter from '$lib/components/LandingFooter.svelte';
  
  const sponsorTiers = [
    {
      name: 'Bronze',
      price: '$10',
      color: 'from-amber-600 to-orange-700',
      borderColor: 'border-amber-500/50',
      benefits: [
        'Name in credits',
        'Discord bronze badge',
        'Early feature access',
        'Monthly newsletter'
      ]
    },
    {
      name: 'Silver',
      price: '$25',
      color: 'from-gray-400 to-gray-600',
      borderColor: 'border-gray-400/50',
      benefits: [
        'All Bronze benefits',
        'Priority support',
        'Beta features access',
        'Custom Discord role',
        'Quarterly video calls'
      ],
      popular: true
    },
    {
      name: 'Gold',
      price: '$50',
      color: 'from-yellow-500 to-amber-600',
      borderColor: 'border-yellow-500/50',
      benefits: [
        'All Silver benefits',
        'Logo on website',
        'Feature requests priority',
        'Private Discord channel',
        'Monthly 1-on-1 calls',
        'Lifetime premium access'
      ]
    }
  ];
  
  const currentSponsors = [
    { name: 'CyberCorp', tier: 'Gold', logo: '🏢' },
    { name: 'SecureNet', tier: 'Silver', logo: '🔐' },
    { name: 'BugHunters Inc', tier: 'Silver', logo: '🐛' },
    { name: 'DataShield', tier: 'Bronze', logo: '🛡️' }
  ];
</script>

<LandingNav />

<div class="min-h-screen bg-black text-white">
  <!-- Hero Section -->
  <section class="relative py-20 overflow-hidden">
    <div class="absolute inset-0">
      <div class="absolute top-0 left-0 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-float"></div>
      <div class="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-float" style="animation-delay: 2s;"></div>
    </div>
    
    <div class="relative container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-5xl sm:text-6xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
          Support AXIONARK
        </h1>
        <p class="text-xl text-gray-300 max-w-3xl mx-auto">
          Help us build the ultimate platform for security researchers. Your support enables us to 
          create better features, maintain infrastructure, and keep the platform accessible to everyone.
        </p>
      </div>
    </div>
  </section>
  
  <!-- Why Sponsor Section -->
  <section class="py-16 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Why Become a Sponsor?
      </h2>
      
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <div class="text-center">
          <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-3">Support Development</h3>
          <p class="text-gray-400">
            Your sponsorship directly funds new features, infrastructure, and continuous improvements.
          </p>
        </div>
        
        <div class="text-center">
          <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-3">Join the Community</h3>
          <p class="text-gray-400">
            Get exclusive access to our sponsor community and shape the future of AXIONARK.
          </p>
        </div>
        
        <div class="text-center">
          <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-3">Exclusive Benefits</h3>
          <p class="text-gray-400">
            Enjoy early access, priority support, and exclusive features based on your tier.
          </p>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Sponsorship Tiers -->
  <section class="py-16 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
        Choose Your Sponsorship Tier
      </h2>
      
      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {#each sponsorTiers as tier}
          <div class="relative {tier.popular ? 'scale-105' : ''}">
            {#if tier.popular}
              <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                Most Popular
              </div>
            {/if}
            
            <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border {tier.borderColor} hover:scale-105 transition-all duration-300">
              <div class="text-center mb-6">
                <h3 class="text-2xl font-bold mb-2 bg-gradient-to-r {tier.color} bg-clip-text text-transparent">
                  {tier.name}
                </h3>
                <div class="text-4xl font-bold text-white">{tier.price}<span class="text-lg text-gray-400">/month</span></div>
              </div>
              
              <ul class="space-y-3 mb-8">
                {#each tier.benefits as benefit}
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="text-gray-300">{benefit}</span>
                  </li>
                {/each}
              </ul>
              
              <a 
                href="https://ko-fi.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                class="block w-full text-center px-6 py-3 bg-gradient-to-r {tier.color} text-white rounded-lg font-bold hover:shadow-lg transition-all duration-300"
              >
                Become a {tier.name} Sponsor
              </a>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>
  
  <!-- Current Sponsors -->
  <section class="py-16 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Our Amazing Sponsors
      </h2>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        {#each currentSponsors as sponsor}
          <div class="text-center">
            <div class="text-6xl mb-3">{sponsor.logo}</div>
            <h3 class="text-lg font-bold text-white">{sponsor.name}</h3>
            <p class="text-sm text-gray-400">{sponsor.tier} Sponsor</p>
          </div>
        {/each}
      </div>
    </div>
  </section>
  
  <!-- Other Ways to Support -->
  <section class="py-16 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Other Ways to Support
      </h2>
      
      <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
          <div class="text-3xl mb-4">☕</div>
          <h3 class="text-xl font-bold mb-3">Buy Us a Coffee</h3>
          <p class="text-gray-400 mb-6">
            One-time contributions help us maintain servers and develop new features.
          </p>
          <a 
            href="https://ko-fi.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center text-yellow-400 hover:text-yellow-300 font-medium"
          >
            Support on Ko-fi →
          </a>
        </div>
        
        <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
          <div class="text-3xl mb-4">🌟</div>
          <h3 class="text-xl font-bold mb-3">Contribute Code</h3>
          <p class="text-gray-400 mb-6">
            Help us improve AXIONARK by contributing to our open-source codebase.
          </p>
          <a 
            href="https://github.com/Duardz/axionark"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium"
          >
            View on GitHub →
          </a>
        </div>
      </div>
    </div>
  </section>
  
  <!-- CTA Section -->
  <section class="py-20 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-gradient-to-r from-yellow-900/20 via-orange-900/20 to-red-900/20 rounded-3xl p-12 border border-yellow-500/20 backdrop-blur-sm text-center">
        <h2 class="text-4xl font-bold mb-4">Every Contribution Counts</h2>
        <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Your support, no matter the size, helps us build a better platform for the entire security research community.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="https://ko-fi.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105 text-lg"
          >
            Become a Sponsor →
          </a>
          <a 
            href="/signin" 
            class="inline-block px-8 py-4 bg-gray-800 text-white rounded-full font-bold hover:bg-gray-700 transition-all duration-300 text-lg border border-gray-700"
          >
            Try AXIONARK Free
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
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
</style>