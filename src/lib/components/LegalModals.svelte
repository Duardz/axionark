<!-- src/lib/components/LegalModals.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  
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
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });
  
  // Prevent body scroll when modal is open
  $: if (showPrivacyPolicy || showTermsOfService || showCookiePolicy) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }
</script>

<!-- Privacy Policy Modal -->
{#if showPrivacyPolicy}
  <div 
    class="fixed inset-0 z-[100] overflow-y-auto"
    bind:this={modalContainer}
    on:click={handleOutsideClick}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="privacy-policy-title"
    transition:fade={{ duration: 200 }}
  >
    <div class="flex min-h-full items-center justify-center p-4">
      <div 
        class="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl"
        transition:fly={{ y: 50, duration: 300 }}
        on:click|stopPropagation
        role="document"
      >
        <!-- Header -->
        <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 rounded-t-3xl px-8 py-6 flex items-center justify-between">
          <h2 id="privacy-policy-title" class="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h2>
          <button
            on:click={() => showPrivacyPolicy = false}
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            aria-label="Close"
          >
            <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Content -->
        <div class="px-8 py-6 max-h-[70vh] overflow-y-auto">
          <div class="prose prose-gray dark:prose-invert max-w-none">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Effective Date: January 1, 2024</p>
            
            <h3 class="text-xl font-semibold mb-4">1. Introduction</h3>
            <p class="mb-4">
              Welcome to AXIONARK ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our bug bounty and security research tracking platform.
            </p>
            
            <h3 class="text-xl font-semibold mb-4">2. Information We Collect</h3>
            <h4 class="text-lg font-medium mb-2">Personal Information You Provide:</h4>
            <ul class="list-disc pl-6 mb-4">
              <li>Account information (email address, username, password)</li>
              <li>Profile information (skills, experience level, bio)</li>
              <li>Bug reports and vulnerability findings (encrypted)</li>
              <li>Journal entries and notes (encrypted)</li>
              <li>Task completion and progress data</li>
            </ul>
            
            <h4 class="text-lg font-medium mb-2">Automatically Collected Information:</h4>
            <ul class="list-disc pl-6 mb-4">
              <li>Device and browser information</li>
              <li>IP address and location data (country/region only)</li>
              <li>Usage patterns and activity logs</li>
              <li>Performance and error data</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">3. How We Use Your Information</h3>
            <p class="mb-2">We use your information to:</p>
            <ul class="list-disc pl-6 mb-4">
              <li>Provide and maintain our services</li>
              <li>Track your learning progress and achievements</li>
              <li>Secure and encrypt your sensitive data</li>
              <li>Send important updates and notifications</li>
              <li>Improve our platform and user experience</li>
              <li>Prevent fraud and enhance security</li>
              <li>Comply with legal obligations</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">4. Data Security</h3>
            <p class="mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul class="list-disc pl-6 mb-4">
              <li><strong>Encryption:</strong> All sensitive data (journal entries, bug reports) is encrypted using AES-256-GCM encryption</li>
              <li><strong>Authentication:</strong> Secure authentication through Firebase Auth</li>
              <li><strong>Access Control:</strong> Strict access controls and authentication requirements</li>
              <li><strong>Regular Audits:</strong> Security audits and vulnerability assessments</li>
              <li><strong>Secure Transmission:</strong> All data transmitted over HTTPS</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">5. Data Sharing and Disclosure</h3>
            <p class="mb-4">
              We do not sell, trade, or rent your personal information. We may share information only in these circumstances:
            </p>
            <ul class="list-disc pl-6 mb-4">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations or court orders</li>
              <li>To protect our rights, privacy, safety, or property</li>
              <li>In connection with a merger, acquisition, or sale of assets</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">6. Your Data Rights</h3>
            <p class="mb-2">You have the right to:</p>
            <ul class="list-disc pl-6 mb-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">7. Data Retention</h3>
            <p class="mb-4">
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we permanently delete all associated data within 30 days.
            </p>
            
            <h3 class="text-xl font-semibold mb-4">8. Children's Privacy</h3>
            <p class="mb-4">
              Our services are not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
            
            <h3 class="text-xl font-semibold mb-4">9. International Data Transfers</h3>
            <p class="mb-4">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
            
            <h3 class="text-xl font-semibold mb-4">10. Contact Us</h3>
            <p class="mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <ul class="list-none mb-4">
              <li>Email: privacy@axionark.com</li>
              <li>Address: AXIONARK Privacy Team, Auckland, New Zealand</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">11. Changes to This Policy</h3>
            <p class="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Terms of Service Modal -->
{#if showTermsOfService}
  <div 
    class="fixed inset-0 z-[100] overflow-y-auto"
    bind:this={modalContainer}
    on:click={handleOutsideClick}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="terms-of-service-title"
    transition:fade={{ duration: 200 }}
  >
    <div class="flex min-h-full items-center justify-center p-4">
      <div 
        class="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl"
        transition:fly={{ y: 50, duration: 300 }}
        on:click|stopPropagation
        role="document"
      >
        <!-- Header -->
        <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 rounded-t-3xl px-8 py-6 flex items-center justify-between">
          <h2 id="terms-of-service-title" class="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h2>
          <button
            on:click={() => showTermsOfService = false}
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            aria-label="Close"
          >
            <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Content -->
        <div class="px-8 py-6 max-h-[70vh] overflow-y-auto">
          <div class="prose prose-gray dark:prose-invert max-w-none">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Effective Date: January 1, 2024</p>
            
            <h3 class="text-xl font-semibold mb-4">1. Acceptance of Terms</h3>
            <p class="mb-4">
              By accessing or using AXIONARK ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Platform.
            </p>
            
            <h3 class="text-xl font-semibold mb-4">2. Description of Service</h3>
            <p class="mb-4">
              AXIONARK is a personal progress tracking platform for bug bounty hunters and security researchers. We provide tools to:
            </p>
            <ul class="list-disc pl-6 mb-4">
              <li>Track your learning journey and skill development</li>
              <li>Document bug bounty findings and earnings</li>
              <li>Maintain encrypted journals of your experiences</li>
              <li>Monitor progress through gamified achievements</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">3. User Accounts</h3>
            <h4 class="text-lg font-medium mb-2">Account Creation:</h4>
            <ul class="list-disc pl-6 mb-4">
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining account security</li>
              <li>You must be at least 13 years old to use the Platform</li>
              <li>One person or entity may not maintain multiple accounts</li>
            </ul>
            
            <h4 class="text-lg font-medium mb-2">Account Security:</h4>
            <ul class="list-disc pl-6 mb-4">
              <li>Keep your password confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>You are responsible for all activities under your account</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">4. Acceptable Use</h3>
            <p class="mb-2">You agree NOT to:</p>
            <ul class="list-disc pl-6 mb-4">
              <li>Use the Platform for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Submit false or misleading information</li>
              <li>Attempt to gain unauthorized access to any part of the Platform</li>
              <li>Interfere with or disrupt the Platform's functionality</li>
              <li>Upload malicious code or viruses</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Scrape or copy content without permission</li>
              <li>Use the Platform to plan or conduct illegal hacking activities</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">5. Content and Intellectual Property</h3>
            <h4 class="text-lg font-medium mb-2">Your Content:</h4>
            <ul class="list-disc pl-6 mb-4">
              <li>You retain ownership of content you create</li>
              <li>You grant us a license to store and display your content</li>
              <li>You are responsible for the accuracy of your bug reports</li>
              <li>Your content must not violate any third-party rights</li>
            </ul>
            
            <h4 class="text-lg font-medium mb-2">Our Content:</h4>
            <ul class="list-disc pl-6 mb-4">
              <li>The Platform and its original content are our property</li>
              <li>Our trademarks and trade dress may not be used without permission</li>
              <li>You may not copy, modify, or distribute our content</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">6. Bug Bounty Tracking</h3>
            <p class="mb-4">
              When tracking bug bounties:
            </p>
            <ul class="list-disc pl-6 mb-4">
              <li>Ensure you have permission to test the target systems</li>
              <li>Follow responsible disclosure practices</li>
              <li>Respect bug bounty program rules and scope</li>
              <li>Report findings ethically and professionally</li>
              <li>The Platform is for tracking only - we are not liable for your testing activities</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">7. Privacy and Data Protection</h3>
            <p class="mb-4">
              Your use of the Platform is also governed by our Privacy Policy. We implement encryption and security measures to protect your sensitive data, including journal entries and bug reports.
            </p>
            
            <h3 class="text-xl font-semibold mb-4">8. Disclaimers and Limitations</h3>
            <h4 class="text-lg font-medium mb-2">No Warranties:</h4>
            <p class="mb-4">
              The Platform is provided "as is" without warranties of any kind. We do not guarantee:
            </p>
            <ul class="list-disc pl-6 mb-4">
              <li>Uninterrupted or error-free service</li>
              <li>Accuracy or reliability of content</li>
              <li>That defects will be corrected</li>
              <li>That the Platform is free of viruses</li>
            </ul>
            
            <h4 class="text-lg font-medium mb-2">Limitation of Liability:</h4>
            <p class="mb-4">
              We are not liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Platform.
            </p>
            
            <h3 class="text-xl font-semibold mb-4">9. Indemnification</h3>
            <p class="mb-4">
              You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from:
            </p>
            <ul class="list-disc pl-6 mb-4">
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your illegal hacking or testing activities</li>
              <li>Any content you submit to the Platform</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">10. Termination</h3>
            <p class="mb-4">
              We may terminate or suspend your account immediately, without prior notice, for:
            </p>
            <ul class="list-disc pl-6 mb-4">
              <li>Breach of these Terms</li>
              <li>Illegal or harmful activities</li>
              <li>At our sole discretion for any reason</li>
            </ul>
            <p class="mb-4">
              You may delete your account at any time through your profile settings.
            </p>
            
            <h3 class="text-xl font-semibold mb-4">11. Governing Law</h3>
            <p class="mb-4">
              These Terms are governed by the laws of New Zealand, without regard to conflict of law provisions. Any disputes shall be resolved in the courts of Auckland, New Zealand.
            </p>
            
            <h3 class="text-xl font-semibold mb-4">12. Changes to Terms</h3>
            <p class="mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of material changes via email or Platform notification. Continued use after changes constitutes acceptance.
            </p>
            
            <h3 class="text-xl font-semibold mb-4">13. Contact Information</h3>
            <p class="mb-4">
              For questions about these Terms, please contact us at:
            </p>
            <ul class="list-none mb-4">
              <li>Email: legal@axionark.com</li>
              <li>Address: AXIONARK Legal Team, Auckland, New Zealand</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Cookie Policy Modal -->
{#if showCookiePolicy}
  <div 
    class="fixed inset-0 z-[100] overflow-y-auto"
    bind:this={modalContainer}
    on:click={handleOutsideClick}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="cookie-policy-title"
    transition:fade={{ duration: 200 }}
  >
    <div class="flex min-h-full items-center justify-center p-4">
      <div 
        class="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl"
        transition:fly={{ y: 50, duration: 300 }}
        on:click|stopPropagation
        role="document"
      >
        <!-- Header -->
        <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 rounded-t-3xl px-8 py-6 flex items-center justify-between">
          <h2 id="cookie-policy-title" class="text-3xl font-bold text-gray-900 dark:text-white">Cookie Policy</h2>
          <button
            on:click={() => showCookiePolicy = false}
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            aria-label="Close"
          >
            <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Content -->
        <div class="px-8 py-6 max-h-[70vh] overflow-y-auto">
          <div class="prose prose-gray dark:prose-invert max-w-none">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Effective Date: January 1, 2024</p>
            
            <h3 class="text-xl font-semibold mb-4">1. What Are Cookies?</h3>
            <p class="mb-4">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our Platform.
            </p>
            
            <h3 class="text-xl font-semibold mb-4">2. How We Use Cookies</h3>
            <p class="mb-4">
              AXIONARK uses cookies and similar technologies for the following purposes:
            </p>
            
            <h4 class="text-lg font-medium mb-2">Essential Cookies:</h4>
            <ul class="list-disc pl-6 mb-4">
              <li><strong>Authentication:</strong> To keep you logged in during your session</li>
              <li><strong>Security:</strong> To protect your account and detect suspicious activity</li>
              <li><strong>Encryption Keys:</strong> To maintain your encryption keys during sessions</li>
              <li><strong>CSRF Protection:</strong> To prevent cross-site request forgery attacks</li>
            </ul>
            
            <h4 class="text-lg font-medium mb-2">Functional Cookies:</h4>
            <ul class="list-disc pl-6 mb-4">
              <li><strong>Theme Preferences:</strong> To remember if you prefer dark or light mode</li>
              <li><strong>Language Settings:</strong> To display content in your preferred language</li>
              <li><strong>User Preferences:</strong> To remember your display and notification settings</li>
            </ul>
            
            <h4 class="text-lg font-medium mb-2">Performance Cookies:</h4>
            <ul class="list-disc pl-6 mb-4">
              <li><strong>Analytics:</strong> To understand how users interact with our Platform</li>
              <li><strong>Error Tracking:</strong> To identify and fix technical issues</li>
              <li><strong>Load Times:</strong> To monitor and improve Platform performance</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">3. Types of Storage We Use</h3>
            
            <h4 class="text-lg font-medium mb-2">Session Storage:</h4>
            <ul class="list-disc pl-6 mb-4">
              <li>Encryption keys (cleared when browser closes)</li>
              <li>Temporary form data</li>
              <li>Session-specific settings</li>
            </ul>
            
            <h4 class="text-lg font-medium mb-2">Local Storage:</h4>
            <ul class="list-disc pl-6 mb-4">
              <li>Theme preferences (dark/light mode)</li>
              <li>UI preferences</li>
              <li>Non-sensitive user settings</li>
            </ul>
            
            <h4 class="text-lg font-medium mb-2">HTTP Cookies:</h4>
            <ul class="list-disc pl-6 mb-4">
              <li>Authentication tokens</li>
              <li>Session identifiers</li>
              <li>Security tokens</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">4. Third-Party Cookies</h3>
            <p class="mb-4">
              We use services from third parties that may set their own cookies:
            </p>
            <ul class="list-disc pl-6 mb-4">
              <li><strong>Firebase (Google):</strong> For authentication and database services</li>
              <li><strong>Cloudflare:</strong> For CDN and security services</li>
              <li><strong>Analytics (if enabled):</strong> To understand Platform usage</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">5. Cookie Duration</h3>
            <table class="min-w-full mb-4">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-2">Cookie Type</th>
                  <th class="text-left py-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b">
                  <td class="py-2">Authentication</td>
                  <td class="py-2">Until logout or 30 days</td>
                </tr>
                <tr class="border-b">
                  <td class="py-2">Theme Preference</td>
                  <td class="py-2">1 year</td>
                </tr>
                <tr class="border-b">
                  <td class="py-2">Session Storage</td>
                  <td class="py-2">Until browser closes</td>
                </tr>
                <tr class="border-b">
                  <td class="py-2">Security Tokens</td>
                  <td class="py-2">1 hour</td>
                </tr>
              </tbody>
            </table>
            
            <h3 class="text-xl font-semibold mb-4">6. Managing Cookies</h3>
            <p class="mb-4">
              You can control and manage cookies in several ways:
            </p>
            
            <h4 class="text-lg font-medium mb-2">Browser Settings:</h4>
            <ul class="list-disc pl-6 mb-4">
              <li>Most browsers allow you to refuse or delete cookies</li>
              <li>Check your browser's help section for instructions</li>
              <li>Note: Blocking all cookies will prevent you from using our Platform</li>
            </ul>
            
            <h4 class="text-lg font-medium mb-2">Platform Settings:</h4>
            <ul class="list-disc pl-6 mb-4">
              <li>We provide options to manage non-essential cookies</li>
              <li>You can opt-out of analytics cookies in your profile settings</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">7. Impact of Disabling Cookies</h3>
            <p class="mb-4">
              If you disable certain cookies, you may experience:
            </p>
            <ul class="list-disc pl-6 mb-4">
              <li>Inability to stay logged in</li>
              <li>Loss of personalized settings</li>
              <li>Reduced Platform functionality</li>
              <li>Security features may not work properly</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">8. Security</h3>
            <p class="mb-4">
              We implement security measures for our cookies:
            </p>
            <ul class="list-disc pl-6 mb-4">
              <li>HTTPOnly flags to prevent JavaScript access</li>
              <li>Secure flags to ensure HTTPS transmission</li>
              <li>SameSite attributes to prevent CSRF attacks</li>
              <li>Regular security audits</li>
            </ul>
            
            <h3 class="text-xl font-semibold mb-4">9. Updates to This Policy</h3>
            <p class="mb-4">
              We may update this Cookie Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Effective Date."
            </p>
            
            <h3 class="text-xl font-semibold mb-4">10. Contact Us</h3>
            <p class="mb-4">
              If you have questions about our use of cookies, please contact us at:
            </p>
            <ul class="list-none mb-4">
              <li>Email: privacy@axionark.com</li>
              <li>Address: AXIONARK Privacy Team, Auckland, New Zealand</li>
            </ul>
            
            <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p class="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> By continuing to use AXIONARK, you consent to our use of cookies as described in this policy. Essential cookies cannot be disabled as they are required for the Platform to function properly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Custom scrollbar for modal content */
  .prose {
    color: rgb(55 65 81);
  }
  
  :global(.dark) .prose {
    color: rgb(209 213 219);
  }
  
  .prose h3 {
    color: rgb(17 24 39);
  }
  
  :global(.dark) .prose h3 {
    color: rgb(255 255 255);
  }
  
  .prose h4 {
    color: rgb(31 41 55);
  }
  
  :global(.dark) .prose h4 {
    color: rgb(243 244 246);
  }
  
  .prose strong {
    color: rgb(17 24 39);
  }
  
  :global(.dark) .prose strong {
    color: rgb(255 255 255);
  }
  
  .prose ul {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .prose li {
    color: rgb(55 65 81);
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }
  
  :global(.dark) .prose li {
    color: rgb(209 213 219);
  }
  
  /* Scrollbar styling */
  .max-h-\[70vh\]::-webkit-scrollbar {
    width: 8px;
  }
  
  .max-h-\[70vh\]::-webkit-scrollbar-track {
    background: rgb(243 244 246);
    border-radius: 0.5rem;
  }
  
  :global(.dark) .max-h-\[70vh\]::-webkit-scrollbar-track {
    background: rgb(31 41 55);
  }
  
  .max-h-\[70vh\]::-webkit-scrollbar-thumb {
    background: rgb(156 163 175);
    border-radius: 0.5rem;
  }
  
  :global(.dark) .max-h-\[70vh\]::-webkit-scrollbar-thumb {
    background: rgb(75 85 99);
  }
  
  .max-h-\[70vh\]::-webkit-scrollbar-thumb:hover {
    background: rgb(107 114 128);
  }
  
  :global(.dark) .max-h-\[70vh\]::-webkit-scrollbar-thumb:hover {
    background: rgb(107 114 128);
  }
</style>