<!-- src/lib/components/LegalModals.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { browser } from '$app/environment';
  
  export let showPrivacyPolicy = false;
  export let showTermsOfService = false;
  export let showCookiePolicy = false;
  
  let modalContainer: HTMLElement;
  
  // Close modal on escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeAllModals();
    }
  }
  
  // Close modal on outside click
  function handleOutsideClick(event: MouseEvent) {
    if (event.target === modalContainer) {
      closeAllModals();
    }
  }
  
  function closeAllModals() {
    showPrivacyPolicy = false;
    showTermsOfService = false;
    showCookiePolicy = false;
  }
  
  onMount(() => {
    if (browser) {
      document.addEventListener('keydown', handleKeydown);
      return () => {
        document.removeEventListener('keydown', handleKeydown);
      };
    }
  });
  
  // Prevent body scroll when modal is open
  $: if (browser && (showPrivacyPolicy || showTermsOfService || showCookiePolicy)) {
    document.body.style.overflow = 'hidden';
  } else if (browser) {
    document.body.style.overflow = 'unset';
  }
</script>

<!-- Only render modals in browser -->
{#if browser}
  <!-- Privacy Policy Modal -->
  {#if showPrivacyPolicy}
    <div 
      class="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm"
      bind:this={modalContainer}
      on:click={handleOutsideClick}
      on:keydown={handleKeydown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-title"
      tabindex="-1"
      transition:fade={{ duration: 200 }}
    >
      <div class="flex min-h-full items-center justify-center p-4 sm:p-6">
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div 
          class="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
          transition:fly={{ y: 50, duration: 300 }}
          on:click|stopPropagation
          on:keydown|stopPropagation
          role="document"
        >
          <!-- Header -->
          <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 z-10">
            <div class="flex items-center justify-between">
              <h2 id="privacy-policy-title" class="text-2xl font-semibold text-gray-900 dark:text-white">
                Privacy Policy
              </h2>
              <button
                on:click={() => showPrivacyPolicy = false}
                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Content -->
          <div class="px-6 py-6 max-h-[70vh] overflow-y-auto">
            <div class="space-y-6 text-gray-600 dark:text-gray-300">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p class="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> AXIONARK is an open-source personal project. This privacy policy explains how your data is handled within the application.
                </p>
              </div>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">📊 Data Collection</h3>
                <p>AXIONARK collects minimal data necessary for functionality:</p>
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>Email address and username (for authentication)</li>
                  <li>Learning progress and completed tasks</li>
                  <li>Bug bounty reports (stored encrypted)</li>
                  <li>Journal entries (stored encrypted)</li>
                </ul>
              </section>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">🔒 Data Security</h3>
                <p>Your security is a priority:</p>
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>Sensitive data (journal entries, bug reports) is encrypted using AES-256-GCM</li>
                  <li>Authentication handled by Firebase Auth</li>
                  <li>All data transmitted over HTTPS</li>
                  <li>Your encryption password is never stored on our servers</li>
                </ul>
              </section>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">📍 Data Storage</h3>
                <p>
                  All data is stored in Firebase Firestore. As this is a personal project, please be aware that:
                </p>
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>Data is stored on Google's Firebase infrastructure</li>
                  <li>You can delete your account and all associated data at any time</li>
                  <li>No data is sold or shared with third parties</li>
                  <li>This is a hobby project - use at your own discretion</li>
                </ul>
              </section>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">🎯 Data Usage</h3>
                <p>Your data is used solely for:</p>
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>Providing the progress tracking functionality</li>
                  <li>Saving your learning journey and achievements</li>
                  <li>Maintaining your encrypted journal and bug reports</li>
                </ul>
              </section>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">✉️ Contact</h3>
                <p>
                  For questions about data handling, please open an issue on the 
                  <a href="https://github.com/Duardz/axionark/issues" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                    GitHub repository
                  </a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Terms of Service Modal -->
  {#if showTermsOfService}
    <div 
      class="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm"
      bind:this={modalContainer}
      on:click={handleOutsideClick}
      on:keydown={handleKeydown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-of-service-title"
      tabindex="-1"
      transition:fade={{ duration: 200 }}
    >
      <div class="flex min-h-full items-center justify-center p-4 sm:p-6">
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div 
          class="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
          transition:fly={{ y: 50, duration: 300 }}
          on:click|stopPropagation
          on:keydown|stopPropagation
          role="document"
        >
          <!-- Header -->
          <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 z-10">
            <div class="flex items-center justify-between">
              <h2 id="terms-of-service-title" class="text-2xl font-semibold text-gray-900 dark:text-white">
                Terms of Use
              </h2>
              <button
                on:click={() => showTermsOfService = false}
                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Content -->
          <div class="px-6 py-6 max-h-[70vh] overflow-y-auto">
            <div class="space-y-6 text-gray-600 dark:text-gray-300">
              <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <p class="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Open Source Software:</strong> AXIONARK is licensed under AGPLv3. This is free software provided "as is" without warranties. Use at your own risk.
                </p>
              </div>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">📝 Acceptance</h3>
                <p>
                  By using AXIONARK, you agree to these terms. This is a personal open-source project for educational purposes.
                </p>
              </section>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">🎯 Purpose</h3>
                <p>AXIONARK is designed to help you:</p>
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>Track your cybersecurity learning journey</li>
                  <li>Document bug bounty findings</li>
                  <li>Monitor your progress with gamification</li>
                  <li>Keep encrypted notes about your experiences</li>
                </ul>
              </section>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">⚠️ Important Guidelines</h3>
                <ul class="list-disc pl-6 space-y-1">
                  <li>Only test systems you have permission to test</li>
                  <li>Follow responsible disclosure practices</li>
                  <li>Respect bug bounty program rules</li>
                  <li>This tool is for tracking only - not for conducting attacks</li>
                  <li>You are responsible for your own actions</li>
                </ul>
              </section>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">🚫 Prohibited Uses</h3>
                <p>Do not use AXIONARK to:</p>
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>Plan or document illegal activities</li>
                  <li>Store information about unauthorized system access</li>
                  <li>Violate any laws or regulations</li>
                  <li>Harm or harass others</li>
                </ul>
              </section>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">📜 License</h3>
                <p class="mb-3">
                  AXIONARK is released under the <strong>GNU Affero General Public License v3.0 (AGPLv3)</strong>.
                </p>
                <p class="mb-3">This means:</p>
                <ul class="list-disc pl-6 space-y-1 mb-3">
                  <li>You can freely use, modify, and distribute this software</li>
                  <li>If you modify AXIONARK and deploy it as a web service, you must share your source code</li>
                  <li>Any modifications must also be licensed under AGPLv3</li>
                  <li>You must provide a link to the source code for users of your service</li>
                </ul>
                <p>
                  See the <a href="https://github.com/Duardz/axionark/blob/main/LICENSE" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">LICENSE</a> file for full details.
                </p>
              </section>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">🛡️ No Warranty</h3>
                <p class="mb-3">
                  As stated in the AGPLv3 license:
                </p>
                <p class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-sm italic">
                  This software is provided "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
                </p>
                <p class="mt-3">
                  The authors are not liable for any damages or losses resulting from the use of this software.
                </p>
              </section>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">⚖️ Your Rights</h3>
                <p class="mb-3">Under the AGPLv3 license, you have the right to:</p>
                <ul class="list-disc pl-6 space-y-1 mb-3">
                  <li>Use AXIONARK for any purpose</li>
                  <li>Study how the program works and adapt it to your needs</li>
                  <li>Redistribute copies</li>
                  <li>Improve the program and release your improvements</li>
                </ul>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  If you deploy a modified version as a web service, you must provide users with access to the source code.
                </p>
              </section>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">💾 Source Code</h3>
                <p>
                  The complete source code for AXIONARK is available at:
                  <br />
                  <a href="https://github.com/Duardz/axionark" class="text-blue-600 dark:text-blue-400 hover:underline font-mono text-sm" target="_blank" rel="noopener noreferrer">
                    https://github.com/Duardz/axionark
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Cookie Policy Modal -->
  {#if showCookiePolicy}
    <div 
      class="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm"
      bind:this={modalContainer}
      on:click={handleOutsideClick}
      on:keydown={handleKeydown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-policy-title"
      tabindex="-1"
      transition:fade={{ duration: 200 }}
    >
      <div class="flex min-h-full items-center justify-center p-4 sm:p-6">
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div 
          class="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
          transition:fly={{ y: 50, duration: 300 }}
          on:click|stopPropagation
          on:keydown|stopPropagation
          role="document"
        >
          <!-- Header -->
          <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 z-10">
            <div class="flex items-center justify-between">
              <h2 id="cookie-policy-title" class="text-2xl font-semibold text-gray-900 dark:text-white">
                Cookie Usage
              </h2>
              <button
                on:click={() => showCookiePolicy = false}
                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Content -->
          <div class="px-6 py-6 max-h-[70vh] overflow-y-auto">
            <div class="space-y-6 text-gray-600 dark:text-gray-300">
              <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <p class="text-sm text-green-800 dark:text-green-200">
                  <strong>Simple & Transparent:</strong> AXIONARK uses minimal cookies to keep the app functional. No tracking or advertising cookies.
                </p>
              </div>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">🍪 What We Use</h3>
                <p>AXIONARK uses only essential cookies and browser storage:</p>
              </section>
              
              <section>
                <h4 class="font-medium mb-2 text-gray-800 dark:text-gray-200">Essential Storage:</h4>
                <ul class="list-disc pl-6 space-y-1">
                  <li><strong>Authentication:</strong> Firebase auth tokens to keep you logged in</li>
                  <li><strong>Theme Preference:</strong> Your choice of dark/light mode</li>
                  <li><strong>Session Data:</strong> Temporary encryption keys (cleared when you close the browser)</li>
                </ul>
              </section>
              
              <section>
                <h4 class="font-medium mb-2 text-gray-800 dark:text-gray-200">What We DON'T Use:</h4>
                <ul class="list-disc pl-6 space-y-1">
                  <li>No tracking cookies</li>
                  <li>No advertising cookies</li>
                  <li>No analytics cookies (unless you explicitly enable them)</li>
                  <li>No third-party marketing cookies</li>
                </ul>
              </section>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">⏱️ Duration</h3>
                <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <ul class="space-y-2">
                    <li class="flex justify-between">
                      <span>Authentication:</span>
                      <span class="text-gray-500 dark:text-gray-400">30 days or until logout</span>
                    </li>
                    <li class="flex justify-between">
                      <span>Theme preference:</span>
                      <span class="text-gray-500 dark:text-gray-400">1 year</span>
                    </li>
                    <li class="flex justify-between">
                      <span>Session storage:</span>
                      <span class="text-gray-500 dark:text-gray-400">Until browser closes</span>
                    </li>
                  </ul>
                </div>
              </section>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">🔧 Managing Storage</h3>
                <p>
                  You can clear all stored data by:
                </p>
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>Logging out (clears authentication)</li>
                  <li>Using your browser's clear data function</li>
                  <li>Deleting your account (removes all data)</li>
                </ul>
              </section>
              
              <section>
                <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">🌐 Third-Party Services</h3>
                <p>AXIONARK uses Firebase (by Google) for:</p>
                <ul class="list-disc pl-6 mt-2 space-y-1">
                  <li>Authentication services</li>
                  <li>Database storage</li>
                </ul>
                <p class="mt-2 text-sm">
                  Firebase may use its own cookies. See 
                  <a href="https://firebase.google.com/support/privacy" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                    Firebase Privacy Policy
                  </a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
{/if}

<style>
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 4px;
  }
  
  :global(.dark) ::-webkit-scrollbar-track {
    background: #1f2937;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
  
  :global(.dark) ::-webkit-scrollbar-thumb {
    background: #4b5563;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
  
  :global(.dark) ::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
  
  /* Links */
  a {
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
</style>