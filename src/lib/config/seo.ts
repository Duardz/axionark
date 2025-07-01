// src/lib/config/seo.ts
export const seoConfig = {
  baseURL: 'https://axionark.com', // Update with your domain
  title: 'AXIONARK - Ethical Hacking Journey Companion',
  titleTemplate: '%s | AXIONARK',
  description: 'Track your bug bounty journey, document findings, and level up your ethical hacking skills with our secure, encrypted journaling platform.',
  keywords: [
    'bug bounty',
    'ethical hacking',
    'cybersecurity',
    'penetration testing',
    'security research',
    'vulnerability tracking',
    'hacker journal',
    'security tools',
    'bug hunting',
    'white hat hacking'
  ],
  author: 'Duardz',
  image: '/og-image.png', // You'll need to create this
  twitter: {
    card: 'summary_large_image',
    site: '@axionark', // Update with your Twitter handle
    creator: '@duardz'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    site_name: 'AXIONARK'
  }
};

export interface PageSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
}

export function generateMetaTags(page: PageSEO = {}) {
  const title = page.title 
    ? seoConfig.titleTemplate.replace('%s', page.title)
    : seoConfig.title;
  
  const description = page.description || seoConfig.description;
  const keywords = page.keywords 
    ? [...seoConfig.keywords, ...page.keywords].join(', ')
    : seoConfig.keywords.join(', ');
  
  const image = page.image 
    ? `${seoConfig.baseURL}${page.image}`
    : `${seoConfig.baseURL}${seoConfig.image}`;
  
  const canonical = page.canonical || '';
  
  return {
    title,
    description,
    keywords,
    image,
    canonical,
    robots: `${page.noindex ? 'noindex' : 'index'}, ${page.nofollow ? 'nofollow' : 'follow'}`,
    openGraph: {
      title,
      description,
      image,
      url: canonical
    },
    twitter: {
      title,
      description,
      image
    }
  };
}