<!-- src/routes/journal/+page.svelte - Complete Updated Version -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { journalStore, userStore } from '$lib/stores/user';
  import Navbar from '$lib/components/Navbar.svelte';
  import type { JournalEntry } from '$lib/stores/user';
  import { firebaseTimestampToDate } from '$lib/utils/security';
  import { Timestamp } from 'firebase/firestore'; // ADDED: Import for proper timestamp handling
  import SEO from '$lib/components/SEO.svelte';

  let currentUser: any = null;
  let loading = false;
  let showFormModal = false;
  let editingEntry: JournalEntry | null = null;
  let showSuccessToast = false;
  let successMessage = '';
  let processingEntries = new Set<string>();
  let expandedEntries = new Set<string>();
  
  // Form fields with character limits
  let title = '';
  let content = '';
  let mood: 'great' | 'good' | 'okay' | 'bad' = 'good';
  let tags = '';

  // Character limits
  const MAX_TITLE_LENGTH = 60;
  const MAX_CONTENT_LENGTH = 2000;
  const MAX_TAG_LENGTH = 20;
  const MAX_TAGS = 5;

  // Filter and search
  let searchQuery = '';
  let filterMood = 'all';
  let sortBy = 'newest';
  let filterTags = '';
  let dateRange = 'all';

  // Stats
  let totalEntries = 0;
  let thisWeekEntries = 0;
  let averageMood = 'good';
  let mostUsedTags: { tag: string; count: number }[] = [];
  let currentStreak = 0;

  // Store unsubscribe function
  let authUnsubscribe: (() => void) | null = null;

  onMount(() => {
    const unsubscribeAuth = authStore.subscribe(async (user) => {
      if (!user) {
        goto('/');
        return;
      }
      
      if (!currentUser) {
        currentUser = user;
        loading = true;
        
        try {
          await userStore.loadProfile(user.uid);
          await journalStore.loadEntries(user.uid);
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          loading = false;
        }
      }
    });
    
    authUnsubscribe = unsubscribeAuth;

    return () => {
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    };
  });

  // Reactive statement to calculate stats
  $: if ($journalStore) {
    calculateStats();
  }

  function calculateStats() {
    totalEntries = $journalStore.length;
    
    // Calculate this week's entries
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    thisWeekEntries = $journalStore.filter(entry => {
      const entryDate = firebaseTimestampToDate(entry.date);
      return entryDate >= oneWeekAgo;
    }).length;
    
    // Calculate average mood
    const moods = $journalStore
      .filter(entry => entry.mood)
      .map(entry => entry.mood);
    
    if (moods.length > 0) {
      const moodValues = { great: 4, good: 3, okay: 2, bad: 1 };
      const avgValue = moods.reduce((sum, mood) => sum + moodValues[mood!], 0) / moods.length;
      
      if (avgValue >= 3.5) averageMood = 'great';
      else if (avgValue >= 2.5) averageMood = 'good';
      else if (avgValue >= 1.5) averageMood = 'okay';
      else averageMood = 'bad';
    }
    
    // Calculate most used tags
    const tagCounts = new Map<string, number>();
    $journalStore.forEach(entry => {
      if (entry.tags && Array.isArray(entry.tags)) {
        entry.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });
    
    mostUsedTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Calculate streak
    currentStreak = calculateStreak();
  }

  function calculateStreak() {
    if ($journalStore.length === 0) return 0;
    
    const sortedEntries = [...$journalStore].sort((a, b) => {
      const dateA = firebaseTimestampToDate(a.date).getTime();
      const dateB = firebaseTimestampToDate(b.date).getTime();
      return dateB - dateA;
    });
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = firebaseTimestampToDate(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  // Helper function to truncate text
  function truncateText(text: string, maxLength: number = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  function getFilteredEntries() {
    let filtered = [...$journalStore];
    
    // Apply mood filter
    if (filterMood !== 'all') {
      filtered = filtered.filter(entry => entry.mood === filterMood);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        (entry.tags && Array.isArray(entry.tags) && entry.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply tag filter
    if (filterTags.trim()) {
      const tagQuery = filterTags.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.tags && Array.isArray(entry.tags) && entry.tags.some(tag => tag.toLowerCase().includes(tagQuery))
      );
    }
    
    // Apply date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(entry => {
        const entryDate = firebaseTimestampToDate(entry.date);
        return entryDate >= startDate;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = firebaseTimestampToDate(a.date).getTime();
      const dateB = firebaseTimestampToDate(b.date).getTime();
      
      switch (sortBy) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'mood':
          const moodOrder = { great: 0, good: 1, okay: 2, bad: 3 };
          const moodA = a.mood ? moodOrder[a.mood] : 4;
          const moodB = b.mood ? moodOrder[b.mood] : 4;
          return moodA - moodB;
        default:
          return dateB - dateA;
      }
    });
    
    return filtered;
  }

  // Process tags input to enforce limits
  function processTags(tagsInput: string): string[] {
    return tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t && t.length <= MAX_TAG_LENGTH)
      .slice(0, MAX_TAGS);
  }

  // UPDATED: Fixed handleSubmit with proper timestamp
  async function handleSubmit() {
    if (!currentUser || !title.trim() || !content.trim()) {
      successMessage = 'Please fill in all required fields';
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
      return;
    }
    
    loading = true;
    try {
      const processedTags = processTags(tags);
      
      if (editingEntry && editingEntry.id) {
        await journalStore.updateEntry(editingEntry.id, {
          title: title.trim(),
          content: content.trim(),
          mood,
          tags: processedTags
        });
        
        successMessage = 'Entry updated successfully! 📝';
        showSuccessToast = true;
        setTimeout(() => showSuccessToast = false, 3000);
        
        closeModal();
      } else {
        // FIXED: Use Timestamp.now() for accurate server time
        const entry: JournalEntry = {
          uid: currentUser.uid,
          title: title.trim(),
          content: content.trim(),
          date: Timestamp.now(), // CHANGED: From new Date() to Timestamp.now()
          mood,
          tags: processedTags
        };
        
        await journalStore.addEntry(entry);
        
        successMessage = 'Entry saved successfully! 📝';
        showSuccessToast = true;
        setTimeout(() => showSuccessToast = false, 3000);
        
        closeModal();
      }
    } catch (error: any) {
      console.error('Error saving journal entry:', error);
      successMessage = error.message || 'Error saving entry. Please try again.';
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
    } finally {
      loading = false;
    }
  }

  async function deleteEntry(entryId: string) {
    if (!entryId || processingEntries.has(entryId)) return;
    
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    processingEntries.add(entryId);
    processingEntries = processingEntries;
    
    try {
      await journalStore.deleteEntry(entryId);
      
      successMessage = 'Entry deleted successfully!';
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
    } catch (error: any) {
      console.error('Error deleting entry:', error);
      successMessage = error.message || 'Error deleting entry. Please try again.';
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
    } finally {
      processingEntries.delete(entryId);
      processingEntries = processingEntries;
    }
  }

  function openEditModal(entry: JournalEntry) {
    editingEntry = entry;
    title = entry.title;
    content = entry.content;
    mood = entry.mood || 'good';
    tags = entry.tags && Array.isArray(entry.tags) ? entry.tags.join(', ') : '';
    showFormModal = true;
  }

  function openNewEntryModal() {
    editingEntry = null;
    resetForm();
    showFormModal = true;
  }

  function closeModal() {
    showFormModal = false;
    resetForm();
  }

  function resetForm() {
    title = '';
    content = '';
    mood = 'good';
    tags = '';
    editingEntry = null;
  }

  function clearFilters() {
    searchQuery = '';
    filterMood = 'all';
    sortBy = 'newest';
    filterTags = '';
    dateRange = 'all';
  }

  function toggleEntryExpansion(entryId: string) {
    if (expandedEntries.has(entryId)) {
      expandedEntries.delete(entryId);
    } else {
      expandedEntries.add(entryId);
    }
    expandedEntries = expandedEntries;
  }

  function getMoodConfig(mood: string) {
    const configs: Record<string, {
      emoji: string;
      label: string;
      color: string;
      bg: string;
      gradient: string;
    }> = {
      great: {
        emoji: '😄',
        label: 'Great',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        gradient: 'from-emerald-500 to-green-600'
      },
      good: {
        emoji: '🙂',
        label: 'Good',
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        gradient: 'from-blue-500 to-indigo-600'
      },
      okay: {
        emoji: '😐',
        label: 'Okay',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        gradient: 'from-amber-500 to-orange-600'
      },
      bad: {
        emoji: '😔',
        label: 'Challenging',
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        gradient: 'from-red-500 to-rose-600'
      }
    };
    return configs[mood] || configs.good;
  }

  function formatDate(date: any) {
    return firebaseTimestampToDate(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }



  function getRelativeDate(date: any) {
    const entryDate = firebaseTimestampToDate(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - entryDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  function isProcessing(entryId?: string) {
    return entryId ? processingEntries.has(entryId) : false;
  }

  // Reactive statements
  $: filteredEntries = $journalStore ? getFilteredEntries() : [];
  $: hasActiveFilters = searchQuery || filterMood !== 'all' || sortBy !== 'newest' || filterTags || dateRange !== 'all';
  
  // Force reactivity on filter changes
  $: searchQuery, filterMood, sortBy, filterTags, dateRange, filteredEntries = $journalStore ? getFilteredEntries() : [];
</script>

<Navbar />

<SEO seo={{
  noindex: true,
  nofollow: true
}} />

<!-- Success Toast -->
{#if showSuccessToast}
  <div class="fixed top-20 right-4 z-50 animate-slide-in">
    <div class={`flex items-center p-4 rounded-xl shadow-2xl backdrop-blur-sm ${
      successMessage.includes('Error') || successMessage.includes('fill') 
        ? 'bg-red-500/90 text-white' 
        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
    }`}>
      <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {#if successMessage.includes('Error') || successMessage.includes('fill')}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        {/if}
      </svg>
      <span class="font-semibold">{successMessage}</span>
    </div>
  </div>
{/if}

<!-- Journal Entry Form Modal - Enhanced Design -->
{#if showFormModal}
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <button
      type="button"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      aria-label="Close modal"
      on:click={closeModal}
      on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeModal(); }}
      tabindex="0"
      style="all: unset; position: fixed; inset: 0; cursor: pointer;"
    ></button>
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-2xl transform transition-all">
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
          <!-- Header -->
          <div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-white">
                    {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
                  </h2>
                  <p class="text-sm text-white/80 mt-1">
                    {editingEntry ? 'Update your thoughts' : 'Capture your learning journey'}
                  </p>
                </div>
              </div>
              <button
                on:click={closeModal}
                class="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Form -->
          <form on:submit|preventDefault={handleSubmit} class="p-6 space-y-6">
            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title <span class="text-red-500">*</span>
                <span class="float-right text-xs text-gray-500">{title.length}/{MAX_TITLE_LENGTH}</span>
              </label>
              <input
                id="title"
                type="text"
                bind:value={title}
                maxlength={MAX_TITLE_LENGTH}
                placeholder="What's the highlight of today?"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <!-- Content -->
            <div>
              <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content <span class="text-red-500">*</span>
                <span class="float-right text-xs text-gray-500">{content.length}/{MAX_CONTENT_LENGTH}</span>
              </label>
              <textarea
                id="content"
                bind:value={content}
                maxlength={MAX_CONTENT_LENGTH}
                rows="8"
                placeholder="Share your experiences, challenges, and insights..."
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                required
              ></textarea>
            </div>

            <!-- Mood Selection -->
            <div>
              <p class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                How was your session?
              </p>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {#each [
                  { value: 'great', emoji: '😄', label: 'Great', color: 'emerald' },
                  { value: 'good', emoji: '🙂', label: 'Good', color: 'blue' },
                  { value: 'okay', emoji: '😐', label: 'Okay', color: 'amber' },
                  { value: 'bad', emoji: '😔', label: 'Challenging', color: 'red' }
                ] as moodOption}
                  <label class="cursor-pointer">
                    <input
                      type="radio"
                      bind:group={mood}
                      value={moodOption.value}
                      class="sr-only"
                    />
                    <div class={`p-4 rounded-xl border-2 transition-all text-center ${
                      mood === moodOption.value 
                        ? `border-${moodOption.color}-500 bg-${moodOption.color}-50 dark:bg-${moodOption.color}-900/20` 
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}>
                      <div class="text-3xl mb-1">{moodOption.emoji}</div>
                      <div class="text-sm font-medium">{moodOption.label}</div>
                    </div>
                  </label>
                {/each}
              </div>
            </div>

            <!-- Tags -->
            <div>
              <label for="tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (optional)
                <span class="text-xs text-gray-500 ml-2">Max {MAX_TAGS} tags, comma separated</span>
              </label>
              <input
                id="tags"
                type="text"
                bind:value={tags}
                placeholder="e.g., XSS, SQLi, Web Security"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                on:click={closeModal}
                class="flex-1 sm:flex-none px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim() || !content.trim()}
                class="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
              >
                {#if loading}
                  <div class="spinner w-5 h-5"></div>
                  <span>Saving...</span>
                {:else}
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{editingEntry ? 'Update Entry' : 'Save Entry'}</span>
                {/if}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
{/if}

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  <!-- Hero Section -->
  <div class="bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-violet-900/10 border-b border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          <span class="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
            Learning Journal
          </span>
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Document your journey, track your progress, and reflect on your growth
        </p>
      </div>

      <!-- Stats Dashboard -->
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Total Entries -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div class="flex items-center justify-between mb-2">
              <div class="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {totalEntries}
              </div>
            </div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entries</h3>
          </div>

          <!-- Current Streak -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div class="flex items-center justify-between mb-2">
              <div class="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </div>
              <div class="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {currentStreak}
              </div>
            </div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Day Streak</h3>
          </div>

          <!-- This Week -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div class="flex items-center justify-between mb-2">
              <div class="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {thisWeekEntries}
              </div>
            </div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</h3>
          </div>

          <!-- Average Mood -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div class="flex items-center justify-between mb-2">
              <div class="p-3 bg-gradient-to-br {getMoodConfig(averageMood).gradient} rounded-xl text-white">
                <div class="text-2xl">{getMoodConfig(averageMood).emoji}</div>
              </div>
              <div class="text-xl font-bold {getMoodConfig(averageMood).color} capitalize">
                {getMoodConfig(averageMood).label}
              </div>
            </div>
            <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Average Mood</h3>
          </div>
        </div>

        <!-- Action Button -->
        <div class="text-center mt-8">
          <button
            on:click={openNewEntryModal}
            class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Write New Entry
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
    <!-- Filters & Search -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Search & Filter
        </h3>
        
        {#if hasActiveFilters}
          <button
            on:click={clearFilters}
            class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
          >
            Clear all filters
          </button>
        {/if}
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="sm:col-span-2">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search entries..."
              class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <!-- Date Range -->
        <div>
          <select
            bind:value={dateRange}
            class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        <!-- Mood Filter -->
        <div>
          <select
            bind:value={filterMood}
            class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="all">All Moods</option>
            <option value="great">😄 Great</option>
            <option value="good">🙂 Good</option>
            <option value="okay">😐 Okay</option>
            <option value="bad">😔 Challenging</option>
          </select>
        </div>
      </div>

      <!-- Results & Tags -->
      <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Showing <span class="font-semibold text-gray-900 dark:text-white">{filteredEntries.length}</span> entries
        </div>
        
        {#if mostUsedTags.length > 0}
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs text-gray-500 dark:text-gray-400">Popular:</span>
            {#each mostUsedTags.slice(0, 5) as tagInfo}
              <button
                on:click={() => filterTags = tagInfo.tag}
                class="px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-medium hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all truncate max-w-[120px]"
                title="#{tagInfo.tag} ({tagInfo.count})"
              >
                #{truncateText(tagInfo.tag, 15)} ({tagInfo.count})
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Journal Entries -->
    {#if loading && !showFormModal}
      <div class="flex justify-center items-center h-64">
        <div class="spinner w-12 h-12"></div>
      </div>
    {:else if filteredEntries.length === 0}
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-lg">
        <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {$journalStore.length === 0 ? 'Start Your Journal' : 'No Matching Entries'}
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {$journalStore.length === 0 
            ? 'Begin documenting your bug bounty journey. Every expert started with their first entry!' 
            : 'Try adjusting your filters or search terms.'}
        </p>
        {#if $journalStore.length === 0}
          <button
            on:click={openNewEntryModal}
            class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Write Your First Entry
          </button>
        {:else}
          <button
            on:click={clearFilters}
            class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all"
          >
            Clear Filters
          </button>
        {/if}
      </div>
    {:else}
      <div class="space-y-6">
        {#each filteredEntries as entry, index (entry.id)}
          {@const isExpanded = expandedEntries.has(entry.id || '')}
          {@const moodConfig = getMoodConfig(entry.mood || 'good')}
          
          <article 
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden {isProcessing(entry.id) ? 'opacity-50' : ''}" 
            style="animation-delay: {Math.min(index * 50, 300)}ms;"
          >
            <!-- Entry Header -->
            <div class="p-6">
              <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 truncate" title={entry.title}>
                    {truncateText(entry.title, 50)}
                  </h2>
                  
                  <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                    <div class="flex items-center text-gray-500 dark:text-gray-400">
                      <svg class="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="truncate">{formatDate(entry.date)}</span>
                    </div>
                    
                    {#if entry.mood}
                      <span class={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${moodConfig.bg} border`}>
                        <span class="mr-1">{moodConfig.emoji}</span>
                        {moodConfig.label}
                      </span>
                    {/if}
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button
                    on:click={() => openEditModal(entry)}
                    disabled={isProcessing(entry.id)}
                    class="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                    aria-label="Edit entry"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    on:click={() => entry.id && deleteEntry(entry.id)}
                    disabled={isProcessing(entry.id)}
                    class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    aria-label="Delete entry"
                  >
                    {#if isProcessing(entry.id)}
                      <div class="spinner w-5 h-5"></div>
                    {:else}
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    {/if}
                  </button>
                </div>
              </div>
              
              <!-- Entry Content -->
              <div class="mt-4">
                <p class={`text-gray-700 dark:text-gray-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                  {entry.content}
                </p>
                
                {#if entry.content.length > 200}
                  <button
                    on:click={() => toggleEntryExpansion(entry.id || '')}
                    class="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                {/if}
              </div>
              
              <!-- Tags -->
              {#if entry.tags && Array.isArray(entry.tags) && entry.tags.length > 0}
                <div class="flex flex-wrap gap-2 mt-4">
                  {#each entry.tags as tag}
                    <button
                      on:click={() => filterTags = tag}
                      class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all truncate max-w-[150px]"
                      title="#{tag}"
                    >
                      #{truncateText(tag, 15)}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
            
            <!-- Entry Footer -->
            <div class="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {getRelativeDate(entry.date)}
              </div>
            </div>
          </article>
        {/each}
      </div>
    {/if}

    <!-- Motivation Section -->
    {#if filteredEntries.length > 0}
      <div class="mt-16 text-center">
        <div class="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-3xl p-8 border border-indigo-200 dark:border-indigo-800">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Keep Writing, Keep Growing! 📝
          </h3>
          <p class="text-gray-600 dark:text-gray-400 text-lg mb-6 max-w-2xl mx-auto">
            Your journal is a powerful tool for reflection and growth. 
            Every entry helps you understand your journey better.
          </p>
          <div class="flex justify-center">
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div class="text-5xl mb-2">{getMoodConfig(averageMood).emoji}</div>
              <div class="text-gray-600 dark:text-gray-400">Keep up the great work!</div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
  
  .spinner {
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 3;
  }
  
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>