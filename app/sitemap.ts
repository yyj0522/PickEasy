import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.easypick-ai.com'; 
  const staticRoutes = [
    '',            
    '/quiz',      
    '/vs',         
    '/pc-builder', 
    '/rank',       
    '/dictionary',  
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  
  try {
    const { data: rankings } = await supabase
      .from('rankings')
      .select('data');

    if (rankings) {
      const allProducts = rankings.flatMap((category) => category.data.list || []);
      
      productRoutes = allProducts.map((product: any) => ({
        url: `${baseUrl}/product/${encodeURIComponent(product.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8, 
      }));
    }
  } catch (error) {
    console.error('Sitemap generation error:', error);
  }

  return [...staticRoutes, ...productRoutes];
}