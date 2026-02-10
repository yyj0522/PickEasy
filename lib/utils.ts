import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const getProductLink = async (keyword: string) => {
  const { data } = await supabase
    .from('affiliate_links')
    .select('url')
    .eq('keyword', keyword)
    .single();

  if (data?.url) return data.url;

  return `https://www.coupang.com/np/search?component=&q=${encodeURIComponent(keyword)}&channel=user`;
};