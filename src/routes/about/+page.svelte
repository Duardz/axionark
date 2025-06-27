<!-- src/routes/about/+page.svelte -->
<script lang="ts">
  import LandingNav from '$lib/components/LandingNav.svelte';
  import LandingFooter from '$lib/components/LandingFooter.svelte';
  
  const teamMembers = [
    {
      name: 'John Doe',
      role: 'Founder & Lead Developer',
      bio: 'Experienced security researcher with 10+ years in bug bounty hunting.',
      avatar: '👨‍💻'
    },
    {
      name: 'Jane Smith',
      role: 'Security Expert',
      bio: 'Specializes in web application security and CTF challenges.',
      avatar: '👩‍💻'
    }
  ];
  
  const stats = [
    { value: '1000+', label: 'Active Users' },
    { value: '5000+', label: 'Bugs Reported' },
    { value: '$1M+', label: 'Total Bounties' },
    { value: '100+', label: 'Training Modules' }
  ];
</script>

<LandingNav />

<div class="min-h-screen bg-black text-white">
  <!-- Hero Section -->
  <section class="relative py-20 overflow-hidden">
    <div class="absolute inset-0">
      <div class="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style="animation-delay: 2s;"></div>
    </div>
    
    <div class="relative container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-5xl sm:text-6xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          About AXIONARK
        </h1>
        <p class="text-xl text-gray-300 max-w-3xl mx-auto">
          Empowering the next generation of security researchers with comprehensive training, 
          progress tracking, and a supportive community.
        </p>
      </div>
    </div>
  </section>
  
  <!-- Mission Section -->
  <section class="py-16 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Our Mission
          </h2>
          <p class="text-gray-300 text-lg mb-6">
            AXIONARK was born from a simple belief: every aspiring security researcher deserves 
            access to high-quality training and tools to track their progress.
          </p>
          <p class="text-gray-300 text-lg mb-6">
            We provide a comprehensive platform that combines gamification, progress tracking, 
            and practical exercises to help you master bug bounty hunting and security research.
          </p>
          <p class="text-gray-300 text-lg">
            From beginners taking their first steps to advanced researchers honing their skills, 
            AXIONARK is your companion on the journey to becoming an elite security professional.
          </p>
        </div>
        
        <div class="relative">
          <div class="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 backdrop-blur-sm rounded-3xl p-8 border border-cyan-500/20">
            <div class="grid grid-cols-2 gap-6">
              {#each stats as stat}
                <div class="text-center">
                  <div class="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div class="text-sm text-gray-400 mt-1">{stat.label}</div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Team Section -->
  <section class="py-16 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Meet the Team
      </h2>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each teamMembers as member}
          <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-cyan-500/50 transition-all duration-300">
            <div class="text-center">
              <div class="text-6xl mb-4">{member.avatar}</div>
              <h3 class="text-xl font-bold text-white mb-2">{member.name}</h3>
              <p class="text-cyan-400 text-sm mb-4">{member.role}</p>
              <p class="text-gray-400 text-sm">{member.bio}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>
  
  <!-- Values Section -->
  <section class="py-16 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Our Values
      </h2>
      
      <div class="grid md:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-3">Education First</h3>
          <p class="text-gray-400">
            We believe in comprehensive learning that builds strong foundations for lasting success.
          </p>
        </div>
        
        <div class="text-center">
          <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-3">Community Driven</h3>
          <p class="text-gray-400">
            Our platform is shaped by and for the security research community.
          </p>
        </div>
        
        <div class="text-center">
          <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-3">Ethical Security</h3>
          <p class="text-gray-400">
            We promote responsible disclosure and ethical security research practices.
          </p>
        </div>
      </div>
    </div>
  </section>
  
  <!-- CTA Section -->
  <section class="py-20 relative">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-gradient-to-r from-cyan-900/20 via-blue-900/20 to-purple-900/20 rounded-3xl p-12 border border-cyan-500/20 backdrop-blur-sm text-center">
        <h2 class="text-4xl font-bold mb-4">Ready to Join Us?</h2>
        <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Start your journey today and become part of the AXIONARK community.
        </p>
        <a 
          href="/signin" 
          class="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105 text-lg"
        >
          Get Started Free →
        </a>
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