<!-- src/routes/bugs/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { bugStore, userStore } from '$lib/stores/user';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import type { Bug } from '$lib/stores/user';
  import { firebaseTimestampToDate } from '$lib/utils/security';

  let currentUser: any = null;
  let loading = false;
  let showForm = false;
  let editingBug: Bug | null = null;
  let showSuccessToast = false;
  let successMessage = '';
  let processingBugs = new Set<string>();
  let viewMode: 'grid' | 'list' = 'list';
  
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
  let criticalBugsCount = 0;
  let resolveRate = 0;

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
    resolveRate = totalBugs > 0 ? Math.round((resolvedBugs / totalBugs) * 100) : 0;
    
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
    
    criticalBugsCount = $bugStore.filter(bug => bug.severity === 'critical').length;
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

  function getSeverityGradient(severity: string) {
    switch (severity) {
      case 'critical': return 'from-red-500 to-pink-600';
      case 'high': return 'from-orange-500 to-red-600';
      case 'medium': return 'from-yellow-500 to-orange-600';
      case 'low': return 'from-green-500 to-emerald-600';
      default: return 'from-gray-500 to-gray-600';
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'resolved': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'triaged': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'reported': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'duplicate': return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800';
      case 'rejected': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'resolved': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'triaged': return 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2';
      case 'reported': return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'duplicate': return 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z';
      case 'rejected': return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      default: return 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
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

  // Get monthly trend
  function getMonthlyTrend() {
    if (!$bugStore || $bugStore.length === 0) return 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const lastMonth = $bugStore.filter(bug => {
      const bugDate = firebaseTimestampToDate(bug.dateFound);
      return bugDate >= thirtyDaysAgo;
    }).reduce((sum, bug) => sum + bug.bounty, 0);
    
    const previousMonth = $bugStore.filter(bug => {
      const bugDate = firebaseTimestampToDate(bug.dateFound);
      return bugDate >= sixtyDaysAgo && bugDate < thirtyDaysAgo;
    }).reduce((sum, bug) => sum + bug.bounty, 0);
    
    if (previousMonth === 0) return lastMonth > 0 ? 100 : 0;
    return Math.round(((lastMonth - previousMonth) / previousMonth) * 100);
  }

  $: monthlyTrend = getMonthlyTrend();
</script>

<Navbar />

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
      <div class="font-semibold">{successMessage}</div>
    </div>
  </div>
{/if}

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  <!-- Hero Section -->
  <div class="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 border-b border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="animate-fade-in">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            <span class="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              Bug Tracker
            </span>
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-400">
            Track your vulnerability discoveries and earnings
          </p>
        </div>

        <!-- Stats Overview -->
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Total Earnings Card -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl text-white shadow-lg">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="text-right">
                  {#if monthlyTrend > 0}
                    <div class="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      +{monthlyTrend}%
                    </div>
                  {:else if monthlyTrend < 0}
                    <div class="text-xs font-medium text-red-600 dark:text-red-400 flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      {monthlyTrend}%
                    </div>
                  {/if}
                </div>
              </div>
              <div class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{formatCurrency(totalBounty)}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Total Earnings</div>
              <div class="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
                {formatCurrency(monthlyEarnings)} this month
              </div>
            </div>

            <!-- Total Bugs Card -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl text-white shadow-lg">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                {#if criticalBugsCount > 0}
                  <div class="flex items-center text-xs font-medium text-red-600 dark:text-red-400">
                    <span class="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                    {criticalBugsCount} critical
                  </div>
                {/if}
              </div>
              <div class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{totalBugs}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Total Bugs</div>
              <div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {highSeverityCount} high/critical severity
              </div>
            </div>

            <!-- Resolution Rate Card -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000"
                      style="width: {resolveRate}%"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{resolveRate}%</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Resolution Rate</div>
              <div class="mt-3 text-xs text-blue-600 dark:text-blue-400">
                {resolvedBugs} of {totalBugs} resolved
              </div>
            </div>

            <!-- Average Bounty Card -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700">
              <div class="flex items-center justify-between mb-4">
                <div class="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl text-white shadow-lg">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div class="text-3xl font-bold text-gray-900 dark:text-white mb-1">{formatCurrency(avgBounty)}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">Avg Bounty</div>
              <div class="mt-3 text-xs text-yellow-600 dark:text-yellow-400">
                Per vulnerability
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Your Bug Reports</h2>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Manage and track your vulnerability findings</p>
      </div>
      <button
        on:click={() => showForm = !showForm}
        class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all"
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

    <!-- Bug Form -->
    {#if showForm}
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 animate-slide-up border border-gray-100 dark:border-gray-700">
        <div class="flex items-center mb-6">
          <div class="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl text-white mr-4 shadow-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            {editingBug ? 'Edit Bug Report' : 'New Bug Report'}
          </h2>
        </div>
        
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
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="critical">🔴 Critical</option>
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
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              >
                <option value="reported">📝 Reported</option>
                <option value="triaged">🔍 Triaged</option>
                <option value="resolved">✅ Resolved</option>
                <option value="duplicate">📋 Duplicate</option>
                <option value="rejected">❌ Rejected</option>
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
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
            ></textarea>
          </div>

          <!-- Submit Buttons -->
          <div class="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              on:click={resetForm}
              class="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              class="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
            >
              {#if loading}
                <div class="spinner w-5 h-5 mr-2"></div>
                Saving...
              {:else}
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Filter & Search
        </h3>
        
        <div class="flex items-center gap-4">
          {#if hasActiveFilters}
            <button
              on:click={clearFilters}
              class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center transition-colors"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear all
            </button>
          {/if}
          
          <!-- View Mode Toggle -->
          <div class="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              on:click={() => viewMode = 'list'}
              class={`px-3 py-1.5 rounded-md font-medium text-sm transition-all ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              aria-label="List view"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              on:click={() => viewMode = 'grid'}
              class={`px-3 py-1.5 rounded-md font-medium text-sm transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              aria-label="Grid view"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <!-- Search -->
        <div class="lg:col-span-2 xl:col-span-2">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search by type, program, or description..."
              class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <!-- Severity Filter -->
        <div>
          <select
            bind:value={filterSeverity}
            class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          >
            <option value="all">All Severities</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <select
            bind:value={filterStatus}
            class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="reported">📝 Reported</option>
            <option value="triaged">🔍 Triaged</option>
            <option value="resolved">✅ Resolved</option>
            <option value="duplicate">📋 Duplicate</option>
            <option value="rejected">❌ Rejected</option>
          </select>
        </div>

        <!-- Sort By -->
        <div>
          <select
            bind:value={sortBy}
            class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest-bounty">Highest Bounty</option>
            <option value="lowest-bounty">Lowest Bounty</option>
            <option value="severity">By Severity</option>
          </select>
        </div>

        <!-- Date Range -->
        <div class="lg:col-span-2 xl:col-span-1">
          <select
            bind:value={dateRange}
            class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
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
      {#if filteredBugs.length > 0}
        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg inline-flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Showing <span class="font-medium text-gray-900 dark:text-white">{filteredBugs.length}</span> of <span class="font-medium">{$bugStore.length}</span> bugs
              </div>
            </div>
            
            <div class="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-4 py-2 rounded-lg inline-flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Total: <span class="font-medium">{formatCurrency(filteredBugs.reduce((sum, bug) => sum + bug.bounty, 0))}</span>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Bugs List/Grid -->
    {#if loading && !showForm}
      <div class="flex justify-center items-center h-64">
        <div class="text-center">
          <div class="spinner w-16 h-16 mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Loading your bugs...</p>
        </div>
      </div>
    {:else if filteredBugs.length === 0}
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-lg border border-gray-100 dark:border-gray-700">
        <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            class="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Report First Bug
          </button>
        {:else}
          <button
            on:click={clearFilters}
            class="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Clear Filters
          </button>
        {/if}
      </div>
    {:else}
      <div class={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
        {#each filteredBugs as bug, index (bug.id)}
          <div 
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 {isProcessing(bug.id) ? 'opacity-50' : ''} {viewMode === 'grid' ? 'hover:scale-105' : ''}" 
            style="animation-delay: {Math.min(index * 50, 300)}ms;"
          >
            {#if viewMode === 'grid'}
              <!-- Grid View -->
              <div class="p-6">
                <!-- Header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {bug.type}
                    </h3>
                    <p class="text-gray-600 dark:text-gray-400 font-medium">{bug.program}</p>
                  </div>
                  <div class="flex flex-col items-end gap-2">
                    <span class={`px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityColor(bug.severity)} border`}>
                      {bug.severity}
                    </span>
                    <span class={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(bug.status)} border`}>
                      {bug.status}
                    </span>
                  </div>
                </div>
                
                {#if bug.description}
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                    {bug.description}
                  </p>
                {/if}
                
                <!-- Bounty -->
                <div class="mb-4">
                  <div class="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatCurrency(bug.bounty)}
                  </div>
                </div>
                
                <!-- Footer -->
                <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(bug.dateFound)}
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <button
                      on:click={() => editBug(bug)}
                      disabled={isProcessing(bug.id)}
                      class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      title="Edit bug"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      on:click={() => deleteBug(bug)}
                      disabled={isProcessing(bug.id)}
                      class="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Delete bug"
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
            {:else}
              <!-- List View -->
              <div class="p-6">
                <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                  <!-- Bug Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {bug.type}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400 font-medium">{bug.program}</p>
                        {#if bug.description}
                          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {bug.description}
                          </p>
                        {/if}
                      </div>
                      
                      <!-- Severity & Status Badges -->
                      <div class="flex items-center gap-2 flex-shrink-0">
                        <span class={`px-3 py-1.5 rounded-full text-xs font-medium ${getSeverityColor(bug.severity)} border flex items-center`}>
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getSeverityIcon(bug.severity)} />
                          </svg>
                          {bug.severity}
                        </span>
                        <span class={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(bug.status)} border flex items-center`}>
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getStatusIcon(bug.status)} />
                          </svg>
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
                      <div class="flex items-center gap-2">
                        <div class="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {formatCurrency(bug.bounty)}
                        </div>
                        {#if bug.bounty >= 1000}
                          <span class="text-xs px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full font-medium">
                            💰 High Value
                          </span>
                        {/if}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Actions -->
                  <div class="flex items-center gap-3 flex-shrink-0">
                    <button
                      on:click={() => editBug(bug)}
                      disabled={isProcessing(bug.id)}
                      class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      on:click={() => deleteBug(bug)}
                      disabled={isProcessing(bug.id)}
                      class="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
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
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <!-- Summary Section -->
    {#if filteredBugs.length > 0}
      {@const programStats = filteredBugs.reduce((acc: Record<string, number>, bug) => {
        acc[bug.program] = (acc[bug.program] || 0) + bug.bounty;
        return acc;
      }, {})}
      {@const topProgram = Object.entries(programStats).sort(([,a], [,b]) => (b as number) - (a as number))[0]}
      {@const typeStats = filteredBugs.reduce((acc: Record<string, number>, bug) => {
        acc[bug.type] = (acc[bug.type] || 0) + 1;
        return acc;
      }, {})}
      {@const topType = Object.entries(typeStats).sort(([,a], [,b]) => (b as number) - (a as number))[0]}
      
      <div class="mt-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 border border-gray-200 dark:border-gray-600">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Bug Hunting Summary
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <!-- Most Profitable Program -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Top Program</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {topProgram ? topProgram[0] : 'N/A'}
            </div>
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              {topProgram ? formatCurrency(topProgram[1] as number) : '$0'}
            </div>
          </div>
          
          <!-- Most Common Bug Type -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Most Found</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {topType ? topType[0] : 'N/A'}
            </div>
            <div class="text-2xl font-bold text-red-600 dark:text-red-400">
              {topType ? topType[1] : 0} bugs
            </div>
          </div>
          
          <!-- Success Rate -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">Success Rate</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Resolved Bugs
            </div>
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {resolveRate}%
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
  
  @keyframes slide-up {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
  
  .animate-slide-up {
    animation: slide-up 0.4s ease-out;
  }
  
  .animate-fade-in {
    animation: fade-in 0.6s ease-out;
  }
  
  .spinner {
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-top-color: #ef4444;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>