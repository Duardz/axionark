<!-- src/routes/bugs/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { bugStore, userStore } from '$lib/stores/user';
  import Navbar from '$lib/components/Navbar.svelte';
  import type { Bug } from '$lib/stores/user';
  import { firebaseTimestampToDate } from '$lib/utils/security';
  import { Timestamp } from 'firebase/firestore';

  let currentUser: any = null;
  let loading = false;
  let showForm = false;
  let editingBug: Bug | null = null;
  let showSuccessToast = false;
  let successMessage = '';
  let processingBugs = new Set<string>();
  let expandedBugs = new Set<string>();
  let viewMode: 'list' | 'grid' = 'list';
  
  // Form fields
  let type = '';
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  let program = '';
  let bounty = 0;
  let status: 'reported' | 'triaged' | 'resolved' | 'duplicate' | 'rejected' = 'reported';
  let dateFound = new Date().toISOString().split('T')[0];
  let description = '';

  // Filter and search
  let searchQuery = '';
  let filterSeverity = 'all';
  let filterStatus = 'all';
  let sortBy = 'newest';
  let dateRange = 'all';

  // Stats
  let totalBugs = 0;
  let totalEarnings = 0;
  let averageBounty = 0;
  let criticalBugs = 0;
  let resolvedBugs = 0;
  let thisMonthBugs = 0;
  let thisMonthEarnings = 0;
  let topPrograms: { program: string; count: number; earnings: number }[] = [];

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
      // Don't cleanup stores here - keep data persistent
    };
  });

  // Reactive statement to calculate stats
  $: if ($bugStore) {
    calculateStats();
  }

  function calculateStats() {
    totalBugs = $bugStore.length;
    totalEarnings = $bugStore.reduce((sum, bug) => sum + bug.bounty, 0);
    averageBounty = totalBugs > 0 ? Math.round(totalEarnings / totalBugs) : 0;
    criticalBugs = $bugStore.filter(bug => bug.severity === 'critical').length;
    resolvedBugs = $bugStore.filter(bug => bug.status === 'resolved').length;
    
    // Calculate this month's stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthBugsList = $bugStore.filter(bug => {
      const bugDate = firebaseTimestampToDate(bug.dateFound);
      return bugDate >= startOfMonth;
    });
    
    thisMonthBugs = thisMonthBugsList.length;
    thisMonthEarnings = thisMonthBugsList.reduce((sum, bug) => sum + bug.bounty, 0);
    
    // Calculate top programs
    const programStats = new Map<string, { count: number; earnings: number }>();
    $bugStore.forEach(bug => {
      const stats = programStats.get(bug.program) || { count: 0, earnings: 0 };
      stats.count++;
      stats.earnings += bug.bounty;
      programStats.set(bug.program, stats);
    });
    
    topPrograms = Array.from(programStats.entries())
      .map(([program, stats]) => ({ program, ...stats }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);
  }

  // Format large numbers with K/M suffixes for mobile
  function formatCompactNumber(num: number): string {
    if (num >= 1000000) {
      return '$' + (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return '$' + (num / 1000).toFixed(1) + 'K';
    }
    return '$' + num.toLocaleString();
  }

  // Format with full number but responsive
  function formatResponsiveNumber(num: number): { full: string, compact: string } {
    return {
      full: '$' + num.toLocaleString(),
      compact: formatCompactNumber(num)
    };
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
      const dateA = firebaseTimestampToDate(a.dateFound).getTime();
      const dateB = firebaseTimestampToDate(b.dateFound).getTime();
      
      switch (sortBy) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'bounty-high':
          return b.bounty - a.bounty;
        case 'bounty-low':
          return a.bounty - b.bounty;
        case 'severity':
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        default:
          return dateB - dateA;
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
          bounty: Number(bounty),
          status,
          dateFound: Timestamp.fromDate(new Date(dateFound)),
          description: description.trim()
        });
        
        successMessage = 'Bug updated successfully! 🐛';
        showSuccessToast = true;
        setTimeout(() => showSuccessToast = false, 3000);
        
        resetForm();
      } else {
        const bug: Bug = {
          uid: currentUser.uid,
          type: type.trim(),
          severity,
          program: program.trim(),
          bounty: Number(bounty),
          status,
          dateFound: Timestamp.fromDate(new Date(dateFound)),
          description: description.trim()
        };
        
        await bugStore.addBug(bug);
        
        successMessage = 'Bug reported successfully! 🎉';
        showSuccessToast = true;
        setTimeout(() => showSuccessToast = false, 3000);
        
        resetForm();
      }
    } catch (error: any) {
      console.error('Error saving bug:', error);
      successMessage = error.message || 'Error saving bug. Please try again.';
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
    } finally {
      loading = false;
    }
  }

  async function deleteBug(bugId: string, bugBounty: number) {
    if (!bugId || processingBugs.has(bugId) || !currentUser) return;
    
    if (!confirm('Are you sure you want to delete this bug report?')) return;
    
    processingBugs.add(bugId);
    processingBugs = processingBugs;
    
    try {
      await bugStore.deleteBug(bugId, currentUser.uid, bugBounty);
      
      successMessage = 'Bug deleted successfully!';
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
    } catch (error: any) {
      console.error('Error deleting bug:', error);
      successMessage = error.message || 'Error deleting bug. Please try again.';
      showSuccessToast = true;
      setTimeout(() => showSuccessToast = false, 3000);
    } finally {
      processingBugs.delete(bugId);
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
    dateFound = firebaseTimestampToDate(bug.dateFound).toISOString().split('T')[0];
    description = bug.description || '';
    showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    type = '';
    severity = 'medium';
    program = '';
    bounty = 0;
    status = 'reported';
    dateFound = new Date().toISOString().split('T')[0];
    description = '';
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

  function toggleBugExpansion(bugId: string) {
    if (expandedBugs.has(bugId)) {
      expandedBugs.delete(bugId);
    } else {
      expandedBugs.add(bugId);
    }
    expandedBugs = expandedBugs;
  }

  function getSeverityConfig(severity: string) {
    const configs: Record<string, {
      emoji: string;
      label: string;
      color: string;
      bg: string;
      gradient: string;
    }> = {
      critical: {
        emoji: '🔴',
        label: 'Critical',
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        gradient: 'from-red-500 to-pink-600'
      },
      high: {
        emoji: '🟠',
        label: 'High',
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        gradient: 'from-orange-500 to-amber-600'
      },
      medium: {
        emoji: '🟡',
        label: 'Medium',
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        gradient: 'from-yellow-500 to-amber-500'
      },
      low: {
        emoji: '🟢',
        label: 'Low',
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        gradient: 'from-green-500 to-emerald-600'
      }
    };
    return configs[severity] || configs.medium;
  }

  function getStatusConfig(status: string) {
    const configs: Record<string, {
      label: string;
      color: string;
      bg: string;
    }> = {
      reported: {
        label: 'Reported',
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      },
      triaged: {
        label: 'Triaged',
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
      },
      resolved: {
        label: 'Resolved',
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
      },
      duplicate: {
        label: 'Duplicate',
        color: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800'
      },
      rejected: {
        label: 'Rejected',
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
      }
    };
    return configs[status] || configs.reported;
  }

  function formatDate(date: any) {
    return firebaseTimestampToDate(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function getRelativeDate(date: any) {
    const bugDate = firebaseTimestampToDate(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - bugDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  function isProcessing(bugId?: string) {
    return bugId ? processingBugs.has(bugId) : false;
  }

  // Reactive statements
  $: filteredBugs = $bugStore ? getFilteredBugs() : [];
  $: hasActiveFilters = searchQuery || filterSeverity !== 'all' || filterStatus !== 'all' || sortBy !== 'newest' || dateRange !== 'all';
  $: earningsDisplay = formatResponsiveNumber(totalEarnings);
  
  // Force reactivity on filter changes
  $: searchQuery, filterSeverity, filterStatus, sortBy, dateRange, filteredBugs = $bugStore ? getFilteredBugs() : [];
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
      <span class="font-semibold">{successMessage}</span>
    </div>
  </div>
{/if}

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  <!-- Hero Section -->
  <div class="bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-red-900/10 dark:via-orange-900/10 dark:to-amber-900/10 border-b border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          <span class="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
            Bug Bounty Tracker
          </span>
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Track your vulnerabilities, monitor earnings, and analyze your success
        </p>
      </div>

      <!-- Stats Dashboard -->
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Total Bugs -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div class="flex items-center justify-between mb-2">
              <div class="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl text-white">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                {totalBugs}
              </div>
            </div>
            <h3 class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Bugs</h3>
          </div>

          <!-- Total Earnings - Fixed responsive display -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <div class="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white flex-shrink-0">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="min-w-0 flex-1 text-right">
                {#if totalEarnings >= 10000}
                  <!-- Show compact number on mobile, full on desktop -->
                  <div class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    <span class="block sm:hidden">{earningsDisplay.compact}</span>
                    <span class="hidden sm:block truncate">{earningsDisplay.full}</span>
                  </div>
                {:else}
                  <div class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    ${totalEarnings.toLocaleString()}
                  </div>
                {/if}
              </div>
            </div>
            <h3 class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Earnings
              {#if totalEarnings >= 10000}
                <span class="hidden sm:inline text-xs text-gray-500 dark:text-gray-500 ml-1">
                  ({earningsDisplay.compact})
                </span>
              {/if}
            </h3>
          </div>

          <!-- Critical Bugs -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div class="flex items-center justify-between mb-2">
              <div class="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </div>
              <div class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {criticalBugs}
              </div>
            </div>
            <h3 class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Critical Bugs</h3>
          </div>

          <!-- Average Bounty - Also fixed for large numbers -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div class="flex items-center justify-between mb-2">
              <div class="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white flex-shrink-0">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div class="min-w-0 flex-1 text-right">
                <div class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {#if averageBounty >= 10000}
                    <span class="block sm:hidden">{formatCompactNumber(averageBounty)}</span>
                    <span class="hidden sm:block">${averageBounty.toLocaleString()}</span>
                  {:else}
                    ${averageBounty.toLocaleString()}
                  {/if}
                </div>
              </div>
            </div>
            <h3 class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Avg Bounty</h3>
          </div>
        </div>

        <!-- Action Button -->
        <div class="text-center mt-8">
          <button
            on:click={() => showForm = !showForm}
            class="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            {#if showForm}
              <svg class="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close Form
            {:else}
              <svg class="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Report New Bug
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
    <!-- Bug Report Form -->
    {#if showForm}
      <div class="mb-8 animate-slide-down">
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <div class="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white">
            <h2 class="text-2xl font-bold flex items-center">
              <svg class="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {editingBug ? 'Edit Bug Report' : 'New Bug Report'}
            </h2>
          </div>
          
          <form on:submit|preventDefault={handleSubmit} class="p-8 space-y-6">
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
                  placeholder="XSS, SQLi, IDOR, etc."
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <!-- Program -->
              <div>
                <label for="program" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Program *
                </label>
                <input
                  id="program"
                  type="text"
                  bind:value={program}
                  placeholder="Company/Program name"
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
                  <option value="reported">Reported</option>
                  <option value="triaged">Triaged</option>
                  <option value="resolved">Resolved</option>
                  <option value="duplicate">Duplicate</option>
                  <option value="rejected">Rejected</option>
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
                  step="1"
                  placeholder="0"
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
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
                />
              </div>
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                bind:value={description}
                rows="4"
                placeholder="Provide details about the vulnerability..."
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
              ></textarea>
            </div>

            <!-- Submit Buttons -->
            <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                on:click={resetForm}
                class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                class="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {#if loading}
                  <div class="spinner w-5 h-5 mr-2"></div>
                  Saving...
                {:else}
                  <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {editingBug ? 'Update Bug' : 'Report Bug'}
                {/if}
              </button>
            </div>
          </form>
        </div>
      </div>
    {/if}

    <!-- Stats Cards - Also fixed for responsive numbers -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- This Month Stats -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          This Month
        </h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">Bugs</span>
            <span class="font-semibold text-gray-900 dark:text-white">{thisMonthBugs}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400">Earnings</span>
            <span class="font-semibold text-green-600 dark:text-green-400">
              {#if thisMonthEarnings >= 10000}
                {formatCompactNumber(thisMonthEarnings)}
              {:else}
                ${thisMonthEarnings.toLocaleString()}
              {/if}
            </span>
          </div>
        </div>
      </div>

      <!-- Resolution Rate -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Resolution Rate
        </h3>
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {totalBugs > 0 ? Math.round((resolvedBugs / totalBugs) * 100) : 0}%
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {resolvedBugs} of {totalBugs} resolved
          </p>
        </div>
      </div>

      <!-- Top Programs -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Top Programs
        </h3>
        {#if topPrograms.length > 0}
          <div class="space-y-2">
            {#each topPrograms.slice(0, 3) as program}
              <div class="text-sm">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600 dark:text-gray-400 truncate mr-2">{program.program}</span>
                  <span class="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {#if program.earnings >= 10000}
                      {formatCompactNumber(program.earnings)}
                    {:else}
                      ${program.earnings.toLocaleString()}
                    {/if}
                  </span>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-500">{program.count} bugs</div>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center">No programs yet</p>
        {/if}
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Search & Filter
        </h3>
        
        <div class="flex items-center gap-4">
          {#if hasActiveFilters}
            <button
              on:click={clearFilters}
              class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
            >
              Clear all filters
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
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
              placeholder="Search bugs..."
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
            <option value="all">All Status</option>
            <option value="reported">Reported</option>
            <option value="triaged">Triaged</option>
            <option value="resolved">Resolved</option>
            <option value="duplicate">Duplicate</option>
            <option value="rejected">Rejected</option>
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
            <option value="bounty-high">Highest Bounty</option>
            <option value="bounty-low">Lowest Bounty</option>
            <option value="severity">By Severity</option>
          </select>
        </div>
      </div>

      <!-- Results -->
      <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Showing <span class="font-semibold text-gray-900 dark:text-white">{filteredBugs.length}</span> bugs
        </div>
        
        <!-- Date Range -->
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500 dark:text-gray-400">Period:</span>
          <select
            bind:value={dateRange}
            class="px-3 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Bugs List/Grid -->
    {#if loading && !showForm}
      <div class="flex justify-center items-center h-64">
        <div class="spinner w-12 h-12"></div>
      </div>
    {:else if filteredBugs.length === 0}
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-lg">
        <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          {$bugStore.length === 0 ? 'No bugs reported yet' : 'No matching bugs'}
        </h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {$bugStore.length === 0 
            ? 'Start tracking your vulnerability findings and build your bug bounty portfolio!' 
            : 'Try adjusting your filters or search terms.'}
        </p>
        {#if $bugStore.length === 0}
          <button
            on:click={() => showForm = true}
            class="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Report Your First Bug
          </button>
        {:else}
          <button
            on:click={clearFilters}
            class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all"
          >
            Clear Filters
          </button>
        {/if}
      </div>
    {:else}
      <div class={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {#each filteredBugs as bug, index (bug.id)}
          {@const isExpanded = expandedBugs.has(bug.id || '')}
          {@const severityConfig = getSeverityConfig(bug.severity)}
          {@const statusConfig = getStatusConfig(bug.status)}
          
          <article 
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden {isProcessing(bug.id) ? 'opacity-50' : ''}" 
            style="animation-delay: {Math.min(index * 50, 300)}ms;"
          >
            <!-- Bug Header -->
            <div class="p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {bug.type}
                  </h3>
                  <p class="text-gray-600 dark:text-gray-400 font-medium">
                    {bug.program}
                  </p>
                </div>
                
                <!-- Actions -->
                {#if viewMode === 'list'}
                  <div class="flex items-center gap-2">
                    <button
                      on:click={() => editBug(bug)}
                      disabled={isProcessing(bug.id)}
                      class="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                      aria-label="Edit bug"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      on:click={() => bug.id && deleteBug(bug.id, bug.bounty)}
                      disabled={isProcessing(bug.id)}
                      class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      aria-label="Delete bug"
                    >
                      {#if isProcessing(bug.id)}
                        <div class="spinner w-5 h-5"></div>
                      {:else}
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      {/if}
                    </button>
                  </div>
                {/if}
              </div>
              
              <!-- Bug Details -->
              <div class="space-y-3">
                <div class="flex flex-wrap items-center gap-2">
                  <span class={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${severityConfig.bg} border`}>
                    {severityConfig.emoji} {severityConfig.label}
                  </span>
                  <span class={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} border`}>
                    {statusConfig.label}
                  </span>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {formatDate(bug.dateFound)}
                  </span>
                </div>
                
                <!-- Bounty - Fixed for large numbers -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Bounty</span>
                  <span class="text-2xl font-bold text-green-600 dark:text-green-400">
                    {#if bug.bounty >= 10000}
                      <span class="sm:hidden">{formatCompactNumber(bug.bounty)}</span>
                      <span class="hidden sm:inline">${bug.bounty.toLocaleString()}</span>
                    {:else}
                      ${bug.bounty.toLocaleString()}
                    {/if}
                  </span>
                </div>
                
                <!-- Description -->
                {#if bug.description}
                  <div class="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p class={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {bug.description}
                    </p>
                    
                    {#if bug.description.length > 100}
                      <button
                        on:click={() => toggleBugExpansion(bug.id || '')}
                        class="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    {/if}
                  </div>
                {/if}
                
                <!-- Grid View Actions -->
                {#if viewMode === 'grid'}
                  <div class="flex gap-2 pt-3">
                    <button
                      on:click={() => editBug(bug)}
                      disabled={isProcessing(bug.id)}
                      class="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      on:click={() => bug.id && deleteBug(bug.id, bug.bounty)}
                      disabled={isProcessing(bug.id)}
                      class="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-all text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                {/if}
              </div>
            </div>
            
            <!-- Bug Footer -->
            <div class="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {getRelativeDate(bug.dateFound)}
              </div>
            </div>
          </article>
        {/each}
      </div>
    {/if}

    <!-- Summary Section - Also fixed for large numbers -->
    {#if filteredBugs.length > 0}
      <div class="mt-16">
        <div class="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 rounded-3xl p-8 border border-red-200 dark:border-red-800">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Your Bug Hunting Journey 🚀
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div class="text-center">
              <div class="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                {totalBugs}
              </div>
              <div class="text-gray-600 dark:text-gray-400">Vulnerabilities Found</div>
            </div>
            <div class="text-center">
              <div class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                {#if totalEarnings >= 100000}
                  <span class="block sm:hidden">{formatCompactNumber(totalEarnings)}</span>
                  <span class="hidden sm:block">${totalEarnings.toLocaleString()}</span>
                {:else}
                  ${totalEarnings.toLocaleString()}
                {/if}
              </div>
              <div class="text-gray-600 dark:text-gray-400">Total Earned</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {Math.round((resolvedBugs / totalBugs) * 100)}%
              </div>
              <div class="text-gray-600 dark:text-gray-400">Resolution Rate</div>
            </div>
          </div>
          
          <p class="text-gray-600 dark:text-gray-400 text-center mt-8 max-w-2xl mx-auto">
            Keep hunting! Every bug you find makes the internet a safer place. 🛡️
          </p>
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
  
  @keyframes slide-down {
    from {
      opacity: 0;
      max-height: 0;
    }
    to {
      opacity: 1;
      max-height: 1000px;
    }
  }
  
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
  
  .animate-slide-down {
    animation: slide-down 0.4s ease-out;
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
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
  }
</style>