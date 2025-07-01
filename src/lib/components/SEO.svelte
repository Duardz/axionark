<!-- src/lib/components/SEO.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { seoConfig, generateMetaTags, type PageSEO } from '$lib/config/seo';
  
  export let seo: PageSEO = {};
  
  $: metaTags = generateMetaTags({
    ...seo,
    canonical: seo.canonical || $page.url.toString()
  });
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>{metaTags.title}</title>
  <meta name="title" content={metaTags.title} />
  <meta name="description" content={metaTags.description} />
  <meta name="keywords" content={metaTags.keywords} />
  <meta name="author" content={seoConfig.author} />
  <meta name="robots" content={metaTags.robots} />
  
  <!-- Canonical URL -->
  {#if metaTags.canonical}
    <link rel="canonical" href={metaTags.canonical} />
  {/if}
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content={seoConfig.openGraph.type} />
  <meta property="og:url" content={metaTags.canonical} />
  <meta property="og:title" content={metaTags.openGraph.title} />
  <meta property="og:description" content={metaTags.openGraph.description} />
  <meta property="og:image" content={metaTags.openGraph.image} />
  <meta property="og:site_name" content={seoConfig.openGraph.site_name} />
  <meta property="og:locale" content={seoConfig.openGraph.locale} />
  
  <!-- Twitter -->
  <meta name="twitter:card" content={seoConfig.twitter.card} />
  <meta name="twitter:url" content={metaTags.canonical} />
  <meta name="twitter:title" content={metaTags.twitter.title} />
  <meta name="twitter:description" content={metaTags.twitter.description} />
  <meta name="twitter:image" content={metaTags.twitter.image} />
  <meta name="twitter:site" content={seoConfig.twitter.site} />
  <meta name="twitter:creator" content={seoConfig.twitter.creator} />
  
  <!-- Additional Meta Tags -->
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="content-type" content="text/html; charset=utf-8" />
  <meta name="language" content="English" />
  <meta name="revisit-after" content="7 days" />
  
  <!-- PWA Meta Tags -->
  <meta name="theme-color" content="#4F46E5" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="AXIONARK" />
  
  <!-- Security Meta Tags -->
  <meta http-equiv="x-ua-compatible" content="IE=edge" />
  <meta name="format-detection" content="telephone=no" />
</svelte:head>