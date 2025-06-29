<!-- src/lib/components/EncryptionProvider.svelte -->
<!-- This component should be added to your root layout to ensure encryption is initialized -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth';
  import { initializeEncryption, getEncryptionKey } from '$lib/utils/encryption';
  
  let initialized = false;
  
  onMount(() => {
    // Initialize auth store
    authStore.initialize();
    
    // Subscribe to auth changes to handle encryption
    const unsubscribe = authStore.subscribe(async (user) => {
      if (user && !initialized) {
        initialized = true;
        
        // Give auth state time to settle
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Try to initialize encryption
        const hasEncryption = await initializeEncryption(user.uid);
        
        if (hasEncryption) {
          console.log('Encryption initialized successfully');
        } else {
          // Check if we have a key in session that just needs to be linked
          const sessionKey = sessionStorage.getItem('_ek');
          if (sessionKey) {
            console.log('Found session key, initializing encryption');
            await initializeEncryption(user.uid);
          }
        }
      } else if (!user) {
        initialized = false;
      }
    });
    
    return () => {
      unsubscribe();
      authStore.cleanup();
    };
  });
</script>

<!-- This component doesn't render anything, it just manages encryption state -->
<slot />