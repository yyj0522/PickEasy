import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.easypick-ai.com'; 

  const routes = [
    '',
    '/quiz',
    '/vs',
    '/pc-builder',
    '/rank',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  const categories = [
    'laptop', 'desktop', 'monitor', 'mouse', 'keyboard', 'tablet',
    'cleaner', 'dryer', 'audio', 'massage', 'watch', 'camera',
    'accessory' 
  ].map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...routes, ...categories];
}