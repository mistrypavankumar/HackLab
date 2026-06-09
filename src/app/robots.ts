import type { MetadataRoute } from 'next';

// HackLab is an intentionally-vulnerable teaching demo. Keep it out of search
// indexes so crawlers don't surface the fake "secrets"/XSS payload pages and
// flag the domain (e.g. Google Safe Browsing) as malicious.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
