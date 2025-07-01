// src/routes/sitemap.xml/+server.ts
import type { RequestHandler } from './$types';

const DOMAIN = 'https://axionark.com'; // Update with your actual domain

export const GET: RequestHandler = async () => {
  const pages = [
    {
      url: '/',
      changefreq: 'weekly',
      priority: 1.0,
      lastmod: new Date().toISOString()
    },
    {
      url: '/about',
      changefreq: 'monthly',
      priority: 0.8,
      lastmod: new Date().toISOString()
    },
    {
      url: '/sponsors',
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date().toISOString()
    },
    {
      url: '/signin',
      changefreq: 'yearly',
      priority: 0.5,
      lastmod: new Date().toISOString()
    }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages.map(page => `  <url>
    <loc>${DOMAIN}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600' // Cache for 1 hour
    }
  });
};