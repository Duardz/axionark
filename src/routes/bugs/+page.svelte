<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { bugStore } from '$lib/stores/user';
  import Navbar from '$lib/components/Navbar.svelte';
  import type { Bug } from '$lib/stores/user';

  let currentUser: any = null;
  let loading = false;
  let showForm = false;
  let editingBug: Bug | null = null;
  
  // Form fields
  let type = '';
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let program = '';
  let bounty = 0;
  let status: 'reported' | 'triaged' | 'resolved' | 'duplicate' | 'rejected' = 'reported';
  let description = '';

  // Stats
  let totalBounty = 0;
  let totalBugs = 0;
  let resolvedBugs = 0;
  let avgBounty = 0;

  onMount(() => {
    const unsubscribe = authStore.subscribe(async (user) => {
      if (!user) {
        goto('/');
        return;
      }
      currentUser = user;
      loading = true;
      await bugStore.loadBugs(user.uid);
      loading = false;
    });

    return unsubscribe;
  });

  $: if ($bugStore) {
    totalBounty = $bugStore.reduce((sum, bug) => sum + bug.bounty, 0);
    totalBugs = $bugStore.length;
    resolvedBugs = $bugStore.filter(bug => bug.status === 'resolved').length;
    avgBounty = totalBugs > 0 ? Math.round(totalBounty / totalBugs) : 0;
  }

  async function handleSubmit() {
    if (!currentUser || !type.trim() || !program.trim()) return;
    
    loading = true;
    try {
      if (editingBug) {
        // Update existing bug
        await bugStore.updateBug(editingBug.id!, {
          type: type.trim(),
          severity,
          program: program.trim(),
          bounty,
          status,
          description: description.trim()
        });
      } else {
        // Add new bug
        const bug: Bug = {
          uid: currentUser.uid,
          type: type.trim(),
          severity,
          program: program.trim(),
          bounty,
          status,
          dateFound: new Date(),
          description: description.trim()
        };
        
        await bugStore.addBug(bug);
      }
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error saving bug:', error);
    } finally {
      loading = false;
    }
  }

  async function deleteBug(bug: Bug) {
    if (!confirm('Are you sure you want to delete this bug report?')) return;
    
    loading = true;
    try {
      await bugStore.deleteBug(bug.id!, bug.uid, bug.bounty);
    } catch (error) {
      console.error('Error deleting bug:', error);
    } finally {
      loading = false;
    }
  }

  function editBug(bug: Bug) {
    editingBug = bug;
    type = bug.type;
    severity = bug.severity;
    program = bug.program;
    bounty = bug.bounty;
    status = bug.status;
    description = bug.description || '';
    showForm = true;
  }

  function resetForm() {
    type = '';
    severity = 'medium';
    program = '';
    bounty = 0;
    status = 'reported';
    description = '';
    showForm = false;
    editingBug = null;
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'resolved': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'triaged': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'reported': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
      case 'duplicate': return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400';
      case 'rejected': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400';
    }
  }

  function formatDate(date: any) {
    if (date?.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  }
</script>

<Navbar />

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="animate-fadeIn">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bug Tracker</h1>
          <p class="text-gray-600 dark:text-gray-400">Track your bug bounty findings and earnings</p>
        </div>
        <button
          on:click={() => showForm = !showForm}
          class="mt-4 sm:mt-0 btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Report New Bug'}
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div class="stat-card">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
              <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-2xl font-bold text-gray-900 dark:text-white">${totalBounty}</span>
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</h3>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
              <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span class="text-2xl font-bold text-gray-900 dark:text-white">{totalBugs}</span>
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bugs</h3>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="text-2xl font-bold text-gray-900 dark:text-white">{resolvedBugs}</span>
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</h3>
        </div>

        <div class="stat-card">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl">
              <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span class="text-2xl font-bold text-gray-900 dark:text-white">${avgBounty}</span>
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Bounty</h3>
        </div>
      </div>

      <!-- Bug Form -->
      {#if showForm}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 animate-slideUp">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {editingBug ? 'Edit Bug Report' : 'New Bug Report'}
          </h2>
          
          <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bug Type
                </label>
                <input
                  id="type"
                  type="text"
                  bind:value={type}
                  placeholder="e.g., XSS, SQL Injection, IDOR"
                  class="input"
                  required
                />
              </div>

              <div>
                <label for="program" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Program/Company
                </label>
                <input
                  id="program"
                  type="text"
                  bind:value={program}
                  placeholder="e.g., Google VRP, Facebook"
                  class="input"
                  required
                />
              </div>

              <div>
                <label for="severity" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Severity
                </label>
                <select
                  id="severity"
                  bind:value={severity}
                  class="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label for="bounty" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bounty Amount ($)
                </label>
                <input
                  id="bounty"
                  type="number"
                  bind:value={bounty}
                  min="0"
                  placeholder="0"
                  class="input"
                  required
                />
              </div>

              <div>
                <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  bind:value={status}
                  class="input"
                >
                  <option value="reported">Reported</option>
                  <option value="triaged">Triaged</option>
                  <option value="resolved">Resolved</option>
                  <option value="duplicate">Duplicate</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                bind:value={description}
                rows="3"
                placeholder="Brief description of the vulnerability..."
                class="input"
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3">
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
                {loading ? 'Saving...' : editingBug ? 'Update Bug' : 'Save Bug'}
              </button>
            </div>
          </form>
        </div>
      {/if}

      <!-- Bugs List -->
      {#if loading && !showForm}
        <div class="flex justify-center items-center h-64">
          <div class="spinner"></div>
        </div>
      {:else if $bugStore.length === 0}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
          <svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No bugs reported yet</h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">Start tracking your bug bounty findings!</p>
          <button
            on:click={() => showForm = true}
            class="btn btn-primary"
          >
            Report First Bug
          </button>
        </div>
      {:else}
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">Bug Type</th>
                  <th scope="col">Program</th>
                  <th scope="col">Severity</th>
                  <th scope="col">Status</th>
                  <th scope="col">Bounty</th>
                  <th scope="col" class="hide-mobile">Date</th>
                  <th scope="col" class="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each $bugStore as bug}
                  <tr>
                    <td>
                      <div>
                        <div class="font-medium text-gray-900 dark:text-white">{bug.type}</div>
                        {#if bug.description}
                          <div class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{bug.description}</div>
                        {/if}
                      </div>
                    </td>
                    <td class="text-gray-900 dark:text-white">
                      {bug.program}
                    </td>
                    <td>
                      <span class={`badge border ${getSeverityColor(bug.severity)}`}>
                        {bug.severity}
                      </span>
                    </td>
                    <td>
                      <span class={`badge ${getStatusColor(bug.status)}`}>
                        {bug.status}
                      </span>
                    </td>
                    <td class="font-medium text-emerald-600 dark:text-emerald-400">
                      ${bug.bounty}
                    </td>
                    <td class="text-gray-500 dark:text-gray-400 hide-mobile">
                      {formatDate(bug.dateFound)}
                    </td>
                    <td class="text-right">
                      <button
                        on:click={() => editBug(bug)}
                        class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium mr-3"
                      >
                        Edit
                      </button>
                      <button
                        on:click={() => deleteBug(bug)}
                        class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>