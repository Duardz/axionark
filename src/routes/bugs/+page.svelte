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
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'triaged': return 'bg-blue-100 text-blue-800';
      case 'reported': return 'bg-yellow-100 text-yellow-800';
      case 'duplicate': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

<div class="container mx-auto px-4 py-8 max-w-6xl">
  <div class="animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Bug Tracker</h1>
        <p class="text-gray-600">Track your bug bounty findings and earnings</p>
      </div>
      <button
        on:click={() => showForm = !showForm}
        class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        {showForm ? 'Cancel' : 'Report New Bug'}
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Earnings</p>
            <p class="text-3xl font-bold text-green-600">${totalBounty}</p>
          </div>
          <svg class="w-12 h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Bugs</p>
            <p class="text-3xl font-bold text-blue-600">{totalBugs}</p>
          </div>
          <svg class="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Resolved</p>
            <p class="text-3xl font-bold text-purple-600">{resolvedBugs}</p>
          </div>
          <svg class="w-12 h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Bug Form -->
    {#if showForm}
      <div class="bg-white rounded-lg shadow-md p-6 mb-8 animate-slide-up">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          {editingBug ? 'Edit Bug Report' : 'New Bug Report'}
        </h2>
        
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
                Bug Type
              </label>
              <input
                id="type"
                type="text"
                bind:value={type}
                placeholder="e.g., XSS, SQL Injection, IDOR"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label for="program" class="block text-sm font-medium text-gray-700 mb-1">
                Program/Company
              </label>
              <input
                id="program"
                type="text"
                bind:value={program}
                placeholder="e.g., Google VRP, Facebook"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label for="severity" class="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                id="severity"
                bind:value={severity}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label for="bounty" class="block text-sm font-medium text-gray-700 mb-1">
                Bounty Amount ($)
              </label>
              <input
                id="bounty"
                type="number"
                bind:value={bounty}
                min="0"
                placeholder="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                bind:value={status}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              bind:value={description}
              rows="3"
              placeholder="Brief description of the vulnerability..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              on:click={resetForm}
              class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div class="bg-white rounded-lg shadow-md p-8 text-center">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No bugs reported yet</h3>
        <p class="text-gray-500 mb-4">Start tracking your bug bounty findings!</p>
        <button
          on:click={() => showForm = true}
          class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Report First Bug
        </button>
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bug Type
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bounty
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each $bugStore as bug}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{bug.type}</div>
                    {#if bug.description}
                      <div class="text-sm text-gray-500 truncate max-w-xs">{bug.description}</div>
                    {/if}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bug.program}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(bug.severity)}`}>
                      {bug.severity}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bug.status)}`}>
                      {bug.status}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${bug.bounty}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(bug.dateFound)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      on:click={() => editBug(bug)}
                      class="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      on:click={() => deleteBug(bug)}
                      class="text-red-600 hover:text-red-900"
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