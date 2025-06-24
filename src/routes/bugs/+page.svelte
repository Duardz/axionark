<!-- src/routes/bugs/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { bugStore, userStore } from '$lib/stores/user';
  import Navbar from '$lib/components/Navbar.svelte';
  import type { Bug } from '$lib/stores/user';
  import { firebaseTimestampToDate } from '$lib/utils/security';

  let currentUser: any = null;
  let loading = false;
  let showForm = false;
  let editingBug: Bug | null = null;
  let showSuccessToast = false;
  let successMessage = '';
  let processingBugs = new Set<string>();
  
  // Form fields
  let type = '';
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let program = '';
  let bounty = 0;
  let status: 'reported' | 'triaged' | 'resolved' | 'duplicate' | 'rejected' = 'reported';
  let description = '';
  let dateFound = new Date().toISOString().split('T')[0];

  // Filter states
  let filterSeverity = 'all';
  let filterStatus = 'all';
  let searchQuery = '';
  let sortBy = 'newest';
  let dateRange = 'all';

  // Stats
  let totalBounty = 0;
  let totalBugs = 0;
  let resolvedBugs = 0;
  let avgBounty = 0;
  let monthlyEarnings = 0;
  let highSeverityCount = 0;

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
          await bugStore.loadBugs(user.uid);
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
      bugStore.cleanup();
      userStore.cleanup();
    };
  });

  // Reactive statement to calculate stats
  $: if ($bugStore) {
    calculateStats();
  }

  function calculateStats() {
    totalBounty = $bugStore.reduce((sum, bug) => sum + bug.bounty, 0);
    totalBugs = $bugStore.length;
    resolvedBugs = $bugStore.filter(bug => bug.status === 'resolved').length;
    avgBounty = totalBugs > 0 ? Math.round(totalBounty / totalBugs) : 0;
    
    // Calculate monthly earnings
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    monthlyEarnings = $bugStore
      .filter(bug => {
        const bugDate = firebaseTimestampToDate(bug.dateFound);
        return bugDate >= thirtyDaysAgo;
      })
      .reduce((sum, bug) => sum + bug.bounty, 0);
    
    highSeverityCount = $bugStore.filter(bug => 
      bug.severity === 'high' || bug.severity === 'critical'
    ).length;
  }

  function getFilteredBugs() {
    let filtered = [...$bugStore];
    
    // Apply severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(bug => bug.severity === filterSeverity);
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(bug => bug.status === filterStatus);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bug =>
        bug.type.toLowerCase().includes(query) ||
        bug.program.toLowerCase().includes(query) ||
        (bug.description && bug.description.toLowerCase().includes(query))
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
      
      filtered = filtered.filter(bug => {
        const bugDate = firebaseTimestampToDate(bug.dateFound);
        return bugDate >= startDate;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return firebaseTimestampToDate(b.dateFound).getTime() - firebaseTimestampToDate(a.dateFound).getTime();
        case 'oldest':
          return firebaseTimestampToDate(a.dateFound).getTime() - firebaseTimestampToDate(b.dateFound).getTime();
        case 'highest-bounty':
          return b.bounty - a.bounty;
        case 'lowest-bounty':
          return a.bounty - b.bounty;
        case 'severity':
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        default:
          return firebaseTimestampToDate(b.dateFound).getTime() - firebaseTimestampToDate(a.dateFound).getTime();
      }
    });
    
    return filtered;
  }

  async function handleSubmit() {
    if (!currentUser || !type.trim() || !program.trim()) {
      successMessage = 'Please fill in all required fields';
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
      return;
    }
    
    loading = true;
    try {
      if (editingBug && editingBug.id) {
        await bugStore.updateBug(editingBug.id, {
          type: type.trim(),
          severity,
          program: program.trim(),
          bounty,
          status,
          description: description.trim(),
          dateFound: new Date(dateFound)
        });
        
        successMessage = 'Bug updated successfully! 🎉';
        showSuccessToast = true;
        setTimeout(() => showSuccessToast = false, 3000);
      } else {
        const bug: Bug = {
          uid: currentUser.uid,
          type: type.trim(),
          severity,
          program: program.trim(),
          bounty,
          status,
          dateFound: new Date(dateFound),
          description: description.trim()
        };
        
        await bugStore.addBug(bug);
        
        successMessage = 'Bug reported successfully! 🎉';
        showSuccessToast = true;
        setTimeout(() => showSuccessToast = false, 3000);
      }
      
      resetForm();
    } catch (error: any) {
      console.error('Error saving bug:', error);
      successMessage = error.message || 'Error saving bug. Please try again.';
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
    } finally {
      loading = false;
    }
  }

  async function deleteBug(bug: Bug) {
    if (!bug.id || processingBugs.has(bug.id)) return;
    
    if (!confirm('Are you sure you want to delete this bug report?')) return;
    
    processingBugs.add(bug.id);
    processingBugs = processingBugs;
    
    try {
      await bugStore.deleteBug(bug.id, bug.uid, bug.bounty);
      
      successMessage = 'Bug deleted successfully!';
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
    } catch (error: any) {
      console.error('Error deleting bug:', error);
      successMessage = error.message || 'Error deleting bug. Please try again.';
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
    } finally {
      processingBugs.delete(bug.id!);
      processingBugs = processingBugs;
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
    
    const bugDate = firebaseTimestampToDate(bug.dateFound);
    dateFound = bugDate.toISOString().split('T')[0];
    
    showForm = true;
  }

  function resetForm() {
    type = '';
    severity = 'medium';
    program = '';
    bounty = 0;
    status = 'reported';
    description = '';
    dateFound = new Date().toISOString().split('T')[0];
    showForm = false;
    editingBug = null;
  }

  function clearFilters() {
    searchQuery = '';
    filterSeverity = 'all';
    filterStatus = 'all';
    sortBy = 'newest';
    dateRange = 'all';
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

  function getSeverityIcon(severity: string) {
    switch (severity) {
      case 'critical': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'high': return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'medium': return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'low': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      default: return 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  function formatDate(date: any) {
    const d = firebaseTimestampToDate(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }

  function isProcessing(bugId?: string) {
    return bugId ? processingBugs.has(bugId) : false;
  }

  // Force filter update
  function applyFilters() {
    // Force recalculation by reassigning
    filteredBugs = $bugStore ? getFilteredBugs() : [];
  }

  // Reactive statements
  $: filteredBugs = $bugStore ? getFilteredBugs() : [];
  $: hasActiveFilters = searchQuery || filterSeverity !== 'all' || filterStatus !== 'all' || sortBy !== 'newest' || dateRange !== 'all';
  
  // Manual trigger for filters when values change
  $: if ($bugStore) {
    searchQuery, filterSeverity, filterStatus, sortBy, dateRange;
    applyFilters();
  }
</script>

<Navbar />

<!-- Success Toast -->
{#if showSuccessToast}
  <div class="toast {successMessage.includes('Error') || successMessage.includes('fill') ? 'toast-error' : 'toast-success'} animate-slide-up">
    <div class="flex items-center">
      <svg class="w-5 h-5 {successMessage.includes('Error') || successMessage.includes('fill') ? 'text-red-600' : 'text-green-600'} mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
            🐛 Bug Tracker
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400">
            Track your vulnerability discoveries and earnings
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
            Report New Bug
          {/if}
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Earnings -->
        <div class="stat-card hover:scale-105 transition-transform duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="text-right">
              <div class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white update-indicator">{formatCurrency(totalBounty)}</div>
              <div class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+{formatCurrency(monthlyEarnings)} this month</div>
            </div>
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</h3>
        </div>

        <!-- Total Bugs -->
        <div class="stat-card hover:scale-105 transition-transform duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="text-right">
              <div class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white update-indicator">{totalBugs}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{highSeverityCount} high/critical</div>
            </div>
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bugs</h3>
        </div>

        <!-- Resolved -->
        <div class="stat-card hover:scale-105 transition-transform duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="text-right">
              <div class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white update-indicator">{resolvedBugs}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{totalBugs > 0 ? Math.round((resolvedBugs / totalBugs) * 100) : 0}% resolved</div>
            </div>
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</h3>
        </div>

        <!-- Average Bounty -->
        <div class="stat-card hover:scale-105 transition-transform duration-300">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="text-right">
              <div class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(avgBounty)}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">per bug</div>
            </div>
          </div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Bounty</h3>
        </div>
      </div>

      <!-- Bug Form -->
      {#if showForm}
        <div class="card p-6 mb-8 animate-slide-up shadow-xl bg-white dark:bg-gray-800">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <div class="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white mr-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            {editingBug ? 'Edit Bug Report' : 'New Bug Report'}
          </h2>
          
          <form on:submit|preventDefault={handleSubmit} class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Bug Type -->
              <div>
                <label for="type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bug Type *
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

              <!-- Program -->
              <div>
                <label for="program" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Program/Company *
                </label>
                <input
                  id="program"
                  type="text"
                  bind:value={program}
                  placeholder="e.g., Google VRP, Facebook, HackerOne"
                  class="input"
                  required
                />
              </div>

              <!-- Severity -->
              <div>
                <label for="severity" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

              <!-- Bounty -->
              <div>
                <label for="bounty" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bounty Amount ($)
                </label>
                <input
                  id="bounty"
                  type="number"
                  bind:value={bounty}
                  min="0"
                  step="0.01"
                  placeholder="0"
                  class="input"
                  required
                />
              </div>

              <!-- Status -->
              <div>
                <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

              <!-- Date Found -->
              <div>
                <label for="dateFound" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Found
                </label>
                <input
                  id="dateFound"
                  type="date"
                  bind:value={dateFound}
                  class="input"
                  required
                />
              </div>
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                id="description"
                bind:value={description}
                rows="4"
                placeholder="Brief description of the vulnerability and impact..."
                class="input"
              ></textarea>
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
                  {editingBug ? 'Update Bug' : 'Save Bug'}
                {/if}
              </button>
            </div>
          </form>
        </div>
      {/if}

      <!-- Filters -->
      <div class="card p-6 mb-8 bg-white dark:bg-gray-800 shadow-lg">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <svg class="w-5 h-5 mr-2 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            Filters & Search
          </h3>
          
          {#if hasActiveFilters}
            <button
              on:click={clearFilters}
              class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear all
            </button>
          {/if}
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <!-- Search -->
          <div class="lg:col-span-2 xl:col-span-2">
            <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Bugs
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
                placeholder="Search by type, program, or description..."
                class="input pl-10 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600"
              />
            </div>
          </div>

          <!-- Severity Filter -->
          <div>
            <label for="severity-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Severity
            </label>
            <select
              id="severity-filter"
              bind:value={filterSeverity}
              class="input bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <label for="status-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              id="status-filter"
              bind:value={filterStatus}
              class="input bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="triaged">Triaged</option>
              <option value="resolved">Resolved</option>
              <option value="duplicate">Duplicate</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <!-- Sort By -->
          <div>
            <label for="sort-by" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              id="sort-by"
              bind:value={sortBy}
              class="input bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest-bounty">Highest Bounty</option>
              <option value="lowest-bounty">Lowest Bounty</option>
              <option value="severity">Severity</option>
            </select>
          </div>

          <!-- Date Range -->
          <div class="lg:col-span-2 xl:col-span-1">
            <label for="date-range" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <select
              id="date-range"
              bind:value={dateRange}
              class="input bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        <!-- Results Summary -->
        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg inline-flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Showing <span class="font-medium text-gray-900 dark:text-white">{filteredBugs.length}</span> of <span class="font-medium">{$bugStore.length}</span> bugs
              </div>
              
              <!-- Apply Filters Button -->
              <button
                on:click={applyFilters}
                class="btn btn-primary btn-sm"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Apply Filters
              </button>
            </div>
            
            {#if filteredBugs.length > 0}
              <div class="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-4 py-2 rounded-lg inline-flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Total: <span class="font-medium">{formatCurrency(filteredBugs.reduce((sum, bug) => sum + bug.bounty, 0))}</span>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Bugs List -->
      {#if loading && !showForm}
        <div class="flex justify-center items-center h-64">
          <div class="spinner"></div>
        </div>
      {:else if filteredBugs.length === 0}
        <div class="card p-12 text-center bg-white dark:bg-gray-800">
          <div class="w-20 h-20 mx-auto mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
            <svg class="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {$bugStore.length === 0 ? 'No bugs reported yet' : 'No bugs match your filters'}
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            {$bugStore.length === 0 
              ? 'Start tracking your vulnerability discoveries and earnings!' 
              : 'Try adjusting your search terms or filters to find what you\'re looking for.'}
          </p>
          {#if $bugStore.length === 0}
            <button
              on:click={() => showForm = true}
              class="btn btn-primary"
            >
              Report First Bug
            </button>
          {:else}
            <button
              on:click={clearFilters}
              class="btn btn-primary"
            >
              Clear Filters
            </button>
          {/if}
        </div>
      {:else}
        <div class="space-y-4">
          {#each filteredBugs as bug, index (bug.id)}
            <div 
              class="card p-6 hover:shadow-xl transition-all duration-300 group bg-white dark:bg-gray-800 {isProcessing(bug.id) ? 'opacity-50' : ''}" 
              style="animation-delay: {index * 50}ms;"
            >
              <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                <!-- Bug Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {bug.type}
                      </h3>
                      <p class="text-gray-600 dark:text-gray-400 font-medium">{bug.program}</p>
                      {#if bug.description}
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 text-clip-2">
                          {bug.description}
                        </p>
                      {/if}
                    </div>
                    
                    <!-- Severity & Status Badges -->
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <span class={`badge border ${getSeverityColor(bug.severity)} flex items-center`}>
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getSeverityIcon(bug.severity)} />
                        </svg>
                        {bug.severity}
                      </span>
                      <span class={`badge ${getStatusColor(bug.status)}`}>
                        {bug.status}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Bug Details -->
                  <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(bug.dateFound)}
                    </div>
                    <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(bug.bounty)}
                    </div>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center gap-3 flex-shrink-0">
                  <button
                    on:click={() => editBug(bug)}
                    disabled={isProcessing(bug.id)}
                    class="btn btn-secondary btn-sm group-hover:scale-105 transition-transform"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    on:click={() => deleteBug(bug)}
                    disabled={isProcessing(bug.id)}
                    class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete bug"
                    aria-label="Delete bug report"
                  >
                    {#if isProcessing(bug.id)}
                      <div class="spinner w-4 h-4"></div>
                    {:else}
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    {/if}
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .text-clip-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
  }
</style>