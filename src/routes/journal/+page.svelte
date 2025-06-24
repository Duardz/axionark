<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { journalStore } from '$lib/stores/user';
  import Navbar from '$lib/components/Navbar.svelte';
  import type { JournalEntry } from '$lib/stores/user';

  let currentUser: any = null;
  let loading = false;
  let showForm = false;
  let editingEntry: JournalEntry | null = null;
  
  // Form fields
  let title = '';
  let content = '';
  let mood: 'great' | 'good' | 'okay' | 'bad' = 'good';
  let tags = '';

  onMount(() => {
    const unsubscribe = authStore.subscribe(async (user) => {
      if (!user) {
        goto('/');
        return;
      }
      currentUser = user;
      loading = true;
      await journalStore.loadEntries(user.uid);
      loading = false;
    });

    return unsubscribe;
  });

  async function handleSubmit() {
    if (!currentUser || !title.trim() || !content.trim()) return;
    
    loading = true;
    try {
      const entry: JournalEntry = {
        uid: currentUser.uid,
        title: title.trim(),
        content: content.trim(),
        date: new Date(),
        mood,
        tags: tags.split(',').map(t => t.trim()).filter(t => t)
      };
      
      await journalStore.addEntry(entry);
      
      // Reset form
      title = '';
      content = '';
      mood = 'good';
      tags = '';
      showForm = false;
    } catch (error) {
      console.error('Error adding journal entry:', error);
    } finally {
      loading = false;
    }
  }

  async function deleteEntry(entryId: string) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    loading = true;
    try {
      await journalStore.deleteEntry(entryId);
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      loading = false;
    }
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
      case 'great': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'okay': return 'text-yellow-600';
      case 'bad': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  function formatDate(date: any) {
    if (date?.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function toggleForm() {
    showForm = !showForm;
    if (!showForm) {
      // Reset form when closing
      title = '';
      content = '';
      mood = 'good';
      tags = '';
      editingEntry = null;
    }
  }
</script>

<Navbar />

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Learning Journal</h1>
        <p class="text-gray-600">Document your bug bounty learning journey</p>
      </div>
      <button
        on:click={toggleForm}
        class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        {showForm ? 'Cancel' : 'New Entry'}
      </button>
    </div>

    <!-- Entry Form -->
    {#if showForm}
      <div class="bg-white rounded-lg shadow-md p-6 mb-8 animate-slide-up">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
        </h2>
        
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              bind:value={title}
              placeholder="What did you learn today?"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label for="content" class="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="content"
              bind:value={content}
              rows="6"
              placeholder="Describe your learning experience, challenges, and insights..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="mood" class="block text-sm font-medium text-gray-700 mb-1">
                How was your day?
              </label>
              <select
                id="mood"
                bind:value={mood}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="great">😄 Great</option>
                <option value="good">🙂 Good</option>
                <option value="okay">😐 Okay</option>
                <option value="bad">😔 Challenging</option>
              </select>
            </div>

            <div>
              <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                id="tags"
                type="text"
                bind:value={tags}
                placeholder="XSS, SQL Injection, Recon"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              on:click={toggleForm}
              class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    {/if}

    <!-- Journal Entries -->
    {#if loading && !showForm}
      <div class="flex justify-center items-center h-64">
        <div class="spinner"></div>
      </div>
    {:else if $journalStore.length === 0}
      <div class="bg-white rounded-lg shadow-md p-8 text-center">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No journal entries yet</h3>
        <p class="text-gray-500 mb-4">Start documenting your learning journey today!</p>
        <button
          on:click={toggleForm}
          class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Write First Entry
        </button>
      </div>
    {:else}
      <div class="space-y-6">
        {#each $journalStore as entry}
          <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div class="p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">{entry.title}</h3>
                  <div class="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{formatDate(entry.date)}</span>
                    {#if entry.mood}
                      <span class={`flex items-center ${getMoodColor(entry.mood)}`}>
                        <span class="mr-1">{getMoodEmoji(entry.mood)}</span>
                        {entry.mood}
                      </span>
                    {/if}
                  </div>
                </div>
                <button
                  on:click={() => entry.id && deleteEntry(entry.id)}
                  class="text-red-600 hover:text-red-700 p-2"
                  title="Delete entry"
                  aria-label="Delete entry"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <div class="prose prose-gray max-w-none">
                <p class="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
              </div>
              
              {#if entry.tags && entry.tags.length > 0}
                <div class="mt-4 flex flex-wrap gap-2">
                  {#each entry.tags as tag}
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tag}
                    </span>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>