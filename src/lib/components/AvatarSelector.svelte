<!-- src/lib/components/AvatarSelector.svelte -->
<script lang="ts">
  import { avatars, getAvatarById, type Avatar } from '$lib/data/avatars';
  import { userProgress } from '$lib/stores/user';
  
  export let currentAvatarId: string;
  export let onSelect: (avatarId: string) => void;
  export let userLevel: number = 1;
  
  let selectedCategory: Avatar['category'] | 'all' = 'all';
  let showLockedAvatars = true;
  
  // Get current avatar
  $: currentAvatar = getAvatarById(currentAvatarId);
  
  // Filter avatars based on category
  $: filteredAvatars = selectedCategory === 'all' 
    ? avatars 
    : avatars.filter(a => a.category === selectedCategory);
  
  // Separate available and locked avatars
  $: availableAvatars = filteredAvatars.filter(a => !a.unlockLevel || a.unlockLevel <= userLevel);
  $: lockedAvatars = filteredAvatars.filter(a => a.unlockLevel && a.unlockLevel > userLevel);
  
  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All', icon: '🎨' },
    { id: 'animals', name: 'Animals', icon: '🐾' },
    { id: 'tech', name: 'Tech', icon: '💻' },
    { id: 'nature', name: 'Nature', icon: '🌿' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'cosmic', name: 'Cosmic', icon: '🌌' },
    { id: 'mystical', name: 'Mystical', icon: '🔮' }
  ];
  
  function getRarityColor(rarity: Avatar['rarity']) {
    switch (rarity) {
      case 'common': return 'border-gray-600';
      case 'rare': return 'border-blue-500';
      case 'epic': return 'border-purple-500';
      case 'legendary': return 'border-yellow-500';
      default: return 'border-gray-600';
    }
  }
  
  function getRarityGlow(rarity: Avatar['rarity']) {
    switch (rarity) {
      case 'rare': return 'shadow-lg shadow-blue-500/20';
      case 'epic': return 'shadow-lg shadow-purple-500/20';
      case 'legendary': return 'shadow-xl shadow-yellow-500/30 animate-pulse';
      default: return '';
    }
  }
  
  function getRarityBg(rarity: Avatar['rarity']) {
    switch (rarity) {
      case 'common': return 'bg-gray-700/50';
      case 'rare': return 'bg-blue-900/20';
      case 'epic': return 'bg-purple-900/20';
      case 'legendary': return 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20';
      default: return 'bg-gray-700/50';
    }
  }
</script>

<div class="space-y-6">
  <!-- Current Avatar Display -->
  <div class="bg-gray-700/30 rounded-xl p-6">
    <h4 class="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Current Avatar</h4>
    <div class="flex items-center gap-4">
      <div class="relative">
        <div class="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span class="text-5xl">{currentAvatar?.emoji || '🐱'}</span>
        </div>
        {#if currentAvatar?.rarity === 'legendary'}
          <div class="absolute inset-0 rounded-2xl animate-pulse bg-gradient-to-br from-yellow-400/20 to-orange-400/20"></div>
        {/if}
      </div>
      <div>
        <p class="text-lg font-semibold text-white">{currentAvatar?.name || 'Default'}</p>
        <p class="text-sm text-gray-400 capitalize">{currentAvatar?.rarity || 'common'} • {currentAvatar?.category || 'animals'}</p>
      </div>
    </div>
  </div>
  
  <!-- Category Filter -->
  <div>
    <h4 class="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Categories</h4>
    <div class="flex flex-wrap gap-2">
      {#each categories as category}
        <button
          on:click={() => selectedCategory = category.id as typeof selectedCategory}
          class="px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 {
            selectedCategory === category.id
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }"
        >
          <span>{category.icon}</span>
          <span>{category.name}</span>
        </button>
      {/each}
    </div>
  </div>
  
  <!-- Avatar Grid -->
  <div>
    <div class="flex items-center justify-between mb-4">
      <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wider">
        Available Avatars ({availableAvatars.length})
      </h4>
      <button
        on:click={() => showLockedAvatars = !showLockedAvatars}
        class="text-sm text-gray-400 hover:text-white transition-colors"
      >
        {showLockedAvatars ? 'Hide' : 'Show'} Locked ({lockedAvatars.length})
      </button>
    </div>
    
    <!-- Available Avatars -->
    <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mb-6">
      {#each availableAvatars as avatar}
        <button
          on:click={() => onSelect(avatar.id)}
          class="relative group"
        >
          <div class="{getRarityBg(avatar.rarity)} p-3 rounded-xl border-2 transition-all hover:scale-110 {
            currentAvatarId === avatar.id 
              ? 'border-cyan-400 ring-2 ring-cyan-400/50' 
              : getRarityColor(avatar.rarity)
          } {getRarityGlow(avatar.rarity)}">
            <span class="text-3xl block">{avatar.emoji}</span>
            {#if currentAvatarId === avatar.id}
              <div class="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full flex items-center justify-center">
                <svg class="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            {/if}
          </div>
          
          <!-- Tooltip -->
          <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            {avatar.name}
            <div class="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      {/each}
    </div>
    
    <!-- Locked Avatars -->
    {#if showLockedAvatars && lockedAvatars.length > 0}
      <div>
        <h4 class="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Locked Avatars
        </h4>
        <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {#each lockedAvatars as avatar}
            <div class="relative group cursor-not-allowed">
              <div class="{getRarityBg(avatar.rarity)} p-3 rounded-xl border-2 {getRarityColor(avatar.rarity)} opacity-40 relative overflow-hidden">
                <span class="text-3xl block grayscale">{avatar.emoji}</span>
                <div class="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              
              <!-- Tooltip -->
              <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {avatar.name} • Level {avatar.unlockLevel}
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Rarity Legend -->
  <div class="bg-gray-700/30 rounded-xl p-4">
    <h4 class="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Rarity Tiers</h4>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded border-2 border-gray-600"></div>
        <span class="text-gray-400">Common</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded border-2 border-blue-500"></div>
        <span class="text-blue-400">Rare</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded border-2 border-purple-500"></div>
        <span class="text-purple-400">Epic</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded border-2 border-yellow-500"></div>
        <span class="text-yellow-400">Legendary</span>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>