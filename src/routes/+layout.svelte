<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth';
  import '../app.css';

  onMount(() => {
    authStore.initialize();
  });
</script>

<div class="min-h-screen bg-gray-50">
  <slot />
</div>