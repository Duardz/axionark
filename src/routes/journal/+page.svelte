<!-- // src/routes/journal/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { journalStore, userStore } from '$lib/stores/user';
  import Navbar from '$lib/components/Navbar.svelte';
  import type { JournalEntry } from '$lib/stores/user';
  import { firebaseTimestampToDate } from '$lib/utils/security';

  let currentUser: any = null;
  let loading = false;
  let showForm = false;
  let editingEntry: JournalEntry | null = null;
  let showSuccessToast = false;
  let successMessage = '';
  let processingEntries = new Set<string>();
  
  // Form fields
  let title = '';
  let content = '';
  let mood: 'great' | 'good' | 'okay' | 'bad' = 'good';
  let tags = '';

  // Filter and search
  let searchQuery = '';
  let filterMood = 'all';
  let sortBy = 'newest';

  // Stats
  let totalEntries = 0;
  let thisWeekEntries = 0;
  let averageMood = 'good';
  let streakDays = 0;

  onMount(() => {
    const unsubscribe = authStore.subscribe(async (user) => {
      if (!user) {
        goto('/');
        return;
      }
      currentUser = user;
      loading = true;
      await userStore.loadProfile(user.uid);
      await journalStore.loadEntries(user.uid);
      calculateStats();
      loading = false;
    });

    return () => {
      unsubscribe();
      // Cleanup store listeners
      journalStore.cleanup();
      userStore.cleanup();
    };
  });

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
    
    // Calculate streak (mock for now - you might want to implement proper streak tracking)
    streakDays = Math.min(thisWeekEntries * 2, 30);
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
        (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = firebaseTimestampToDate(a.date).getTime();
      const dateB = firebaseTimestampToDate(b.date).getTime();
      
      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return dateB - dateA;
    });
    
    return filtered;
  }

  async function handleSubmit() {
    if (!currentUser || !title.trim() || !content.trim()) {
      successMessage = 'Please fill in all required fields';
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
      return;
    }
    
    loading = true;
    try {
      if (editingEntry && editingEntry.id) {
        // Update functionality - since we don't have update in store, we'll delete and re-add
        // In a real app, you'd want to implement an update method in the store
        successMessage = 'Journal updates are not yet implemented. Please delete and create a new entry.';
        showSuccessToast = true;
        setTimeout(() => showSuccessToast = false, 3000);
      } else {
        const entry: JournalEntry = {
          uid: currentUser.uid,
          title: title.trim(),
          content: content.trim(),
          date: new Date(),
          mood,
          tags: tags.split(',').map(t => t.trim()).filter(t => t)
        };
        
        await journalStore.addEntry(entry);
        successMessage = 'Entry saved successfully! 📝';
        showSuccessToast = true;
        setTimeout(() => showSuccessToast = false, 3000);
      }
      
      // Reset form
      resetForm();
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

  function editEntry(entry: JournalEntry) {
    editingEntry = entry;
    title = entry.title;
    content = entry.content;
    mood = entry.mood || 'good';
    tags = entry.tags ? entry.tags.join(', ') : '';
    showForm = true;
  }

  function resetForm() {
    title = '';
    content = '';
    mood = 'good';
    tags = '';
    showForm = false;
    editingEntry = null;
  }

  function getMoodEmoji(mood: string) {
    switch (mood) {
      case 'great': return '😄';
      case 'good': return '🙂';
      case 'okay': return '😐';
      case 'bad': return '😔';
      default: return '🙂';
    }
  }

  function getMoodColor(mood: string) {
    switch (mood) {
      case 'great': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'okay': return 'text-yellow-600 dark:text-yellow-400';
      case 'bad': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  }

  function getMoodBg(mood: string) {
    switch (mood) {
      case 'great': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'good': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'okay': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
      case 'bad': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400';
    }
  }

  function formatDate(date: any) {
    return firebaseTimestampToDate(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getRelativeDate(date: any) {
    const entryDate = firebaseTimestampToDate(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - entryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  }

  function isProcessing(entryId?: string) {
    return entryId ? processingEntries.has(entryId) : false;
  }

  $: filteredEntries = getFilteredEntries();
</script>

<Navbar />

<!-- Success Toast -->
{#if showSuccessToast}
  <div class="toast {successMessage.includes('Error') || successMessage.includes('fill') || successMessage.includes('not yet implemented') ? 'toast-error' : 'toast-success'} animate-slide-up">
    <div class="flex items-center">
      <svg class="w-5 h-5 {successMessage.includes('Error') || successMessage.includes('fill') || successMessage.includes('not yet implemented') ? 'text-red-600' : 'text-green-600'} mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {#if successMessage.includes('Error') || successMessage.includes('fill') || successMessage.includes('not yet implemented')}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        {/if}
      </svg>
      <span class="font-semibold">{successMessage}</span>
    </div>
  </div>
{/if}

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
            📔 Learning Journal
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Document your bug bounty learning journey and reflections
          </p>
        </div>
        <button
          on:click={() => showForm = !showForm}
          class="mt-4 sm:mt-0 btn btn-primary btn-lg shadow-lg hover:shadow-xl"
        >
          {#if showForm}
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          {:else}
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Entry
          {/if}
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Entries -->
        <div class="stat-card hover:scale-105 transition-transform duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div class="text-right">
              <div class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white update-indicator">{totalEntries}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">total entries</div>
            </div>
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Journal Entries</h3>
        </div>

        <!-- This Week -->
        <div class="stat-card hover:scale-105 transition-transform duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="text-right">
              <div class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white update-indicator">{thisWeekEntries}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">this week</div>
            </div>
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Activity</h3>
        </div>

        <!-- Average Mood -->
        <div class="stat-card hover:scale-105 transition-transform duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl text-white">
              <div class="text-2xl">{getMoodEmoji(averageMood)}</div>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-gray-900 dark:text-white capitalize">{averageMood}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">avg mood</div>
            </div>
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Mood</h3>
        </div>

        <!-- Streak -->
        <div class="stat-card hover:scale-105 transition-transform duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <div class="text-right">
              <div class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{streakDays}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">day streak</div>
            </div>
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Learning Streak</h3>
        </div>
      </div>

      <!-- Entry Form -->
      {#if showForm}
        <div class="card p-6 mb-8 animate-slide-up shadow-xl">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <div class="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white mr-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            {editingEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
          </h2>
          
          <form on:submit|preventDefault={handleSubmit} class="space-y-6">
            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                bind:value={title}
                placeholder="What did you learn today?"
                class="input"
                required
              />
            </div>

            <!-- Content -->
            <div>
              <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                bind:value={content}
                rows="8"
                placeholder="Describe your learning experience, challenges, insights, and breakthroughs..."
                class="input"
                required
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Mood -->
              <div>
                <label for="mood" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  How was your learning session?
                </label>
                <div class="grid grid-cols-2 gap-2">
                  {#each [
                    { value: 'great', emoji: '😄', label: 'Great' },
                    { value: 'good', emoji: '🙂', label: 'Good' },
                    { value: 'okay', emoji: '😐', label: 'Okay' },
                    { value: 'bad', emoji: '😔', label: 'Challenging' }
                  ] as moodOption}
                    <label class="cursor-pointer">
                      <input
                        type="radio"
                        bind:group={mood}
                        value={moodOption.value}
                        class="sr-only"
                      />
                      <div class={`p-3 rounded-lg border-2 transition-all text-center ${
                        mood === moodOption.value 
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}>
                        <div class="text-2xl mb-1">{moodOption.emoji}</div>
                        <div class="text-sm font-medium text-gray-700 dark:text-gray-300">{moodOption.label}</div>
                      </div>
                    </label>
                  {/each}
                </div>
              </div>

              <!-- Tags -->
              <div>
                <label for="tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  id="tags"
                  type="text"
                  bind:value={tags}
                  placeholder="XSS, SQL Injection, Recon, OWASP"
                  class="input"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Help categorize your learning for easier searching
                </p>
              </div>
            </div>

            <!-- Submit Buttons -->
            <div class="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                on:click={resetForm}
                class="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                class="btn btn-primary"
              >
                {#if loading}
                  <div class="spinner w-4 h-4 mr-2"></div>
                  Saving...
                {:else}
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {editingEntry ? 'Update Entry' : 'Save Entry'}
                {/if}
              </button>
            </div>
          </form>
        </div>
      {/if}

      <!-- Filters & Search -->
      <div class="card p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
          </svg>
          Search & Filter
        </h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="lg:col-span-2">
            <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Entries
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                bind:value={searchQuery}
                placeholder="Search by title, content, or tags..."
                class="input pl-10"
              />
            </div>
          </div>

          <!-- Mood Filter -->
          <div>
            <label for="mood-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mood
            </label>
            <select
              id="mood-filter"
              bind:value={filterMood}
              class="input"
            >
              <option value="all">All Moods</option>
              <option value="great">😄 Great</option>
              <option value="good">🙂 Good</option>
              <option value="okay">😐 Okay</option>
              <option value="bad">😔 Challenging</option>
            </select>
          </div>

          <!-- Sort -->
          <div>
            <label for="sort" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              id="sort"
              bind:value={sortBy}
              class="input"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        <!-- Results Summary -->
        <div class="mt-4 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg inline-block">
          Showing {filteredEntries.length} of {$journalStore.length} entries
        </div>
      </div>

      <!-- Journal Entries -->
      {#if loading && !showForm}
        <div class="flex justify-center items-center h-64">
          <div class="spinner"></div>
        </div>
      {:else if filteredEntries.length === 0}
        <div class="card p-12 text-center">
          <div class="w-20 h-20 mx-auto mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
            <svg class="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {$journalStore.length === 0 ? 'No journal entries yet' : 'No entries match your filters'}
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            {$journalStore.length === 0 
              ? 'Start documenting your learning journey today!' 
              : 'Try adjusting your search terms or filters.'}
          </p>
          {#if $journalStore.length === 0}
            <button
              on:click={() => showForm = true}
              class="btn btn-primary"
            >
              Write First Entry
            </button>
          {:else}
            <button
              on:click={() => {
                searchQuery = '';
                filterMood = 'all';
                sortBy = 'newest';
              }}
              class="btn btn-primary"
            >
              Clear Filters
            </button>
          {/if}
        </div>
      {:else}
        <div class="space-y-6">
          {#each filteredEntries as entry, index}
            <article class="card p-6 hover:shadow-xl transition-all duration-300 group {isProcessing(entry.id) ? 'opacity-50' : ''}" style="animation-delay: {index * 100}ms;">
              <!-- Entry Header -->
              <header class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div class="flex-1 min-w-0">
                  <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                    {entry.title}
                  </h2>
                  <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {getRelativeDate(entry.date)}
                    </div>
                    <div class="text-xs text-gray-400">
                      {formatDate(entry.date)}
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center gap-3 flex-shrink-0">
                  {#if entry.mood}
                    <span class={`badge ${getMoodBg(entry.mood)} flex items-center`}>
                      <span class="mr-1">{getMoodEmoji(entry.mood)}</span>
                      {entry.mood}
                    </span>
                  {/if}
                  
                  <!-- Actions -->
                  <div class="flex items-center gap-1">
                    <button
                      on:click={() => editEntry(entry)}
                      disabled={isProcessing(entry.id)}
                      class="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      title="Edit entry"
                      aria-label="Edit journal entry"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      on:click={() => entry.id && deleteEntry(entry.id)}
                      disabled={isProcessing(entry.id)}
                      class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete entry"
                      aria-label="Delete journal entry"
                    >
                      {#if isProcessing(entry.id)}
                        <div class="spinner w-4 h-4"></div>
                      {:else}
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      {/if}
                    </button>
                  </div>
                </div>
              </header>
              
              <!-- Entry Content -->
              <div class="prose prose-gray dark:prose-invert max-w-none mb-4">
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
              
              <!-- Tags -->
              {#if entry.tags && entry.tags.length > 0}
                <footer class="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {#each entry.tags as tag}
                    <span class="badge bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      #{tag}
                    </span>
                  {/each}
                </footer>
              {/if}
            </article>
          {/each}
        </div>
      {/if}

      <!-- Motivational Footer -->
      {#if filteredEntries.length > 0}
        <div class="text-center py-12">
          <div class="max-w-2xl mx-auto">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🌟 Keep Documenting Your Journey!
            </h3>
            <p class="text-gray-600 dark:text-gray-400 text-lg mb-6">
              Every entry is a step forward in your learning journey. 
              Reflection leads to deeper understanding and faster growth.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalEntries}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">Total Entries</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600 dark:text-green-400">{thisWeekEntries}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">This Week</div>
              </div>
              <div class="text-center">
                <div class="text-3xl">{getMoodEmoji(averageMood)}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 capitalize">{averageMood} Mood</div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>