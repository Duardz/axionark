<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';

  onMount(() => {
    const unsubscribe = authStore.subscribe((user) => {
      if (!user) {
        goto('/');
      }
    });

    return unsubscribe;
  });
</script>

<slot />