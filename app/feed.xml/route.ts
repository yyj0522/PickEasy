import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const baseUrl = 'https://www.easypick-ai.com';

  const { data: rankings } = await supabase
    .from('rankings')
    .select('data, created_at')
    .order('created_at', { ascending: false })
    .limit(10); 

  const { data: terms } = await supabase
    .from('dictionary')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  let itemsXml = '';

  if (rankings) {
    rankings.forEach((category) => {
      if (category.data?.list) {
        category.data.list.forEach((item: any) => {
          const title = (item.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const link = `${baseUrl}/product/${encodeURIComponent((item.name || '').trim())}`;
          const desc = (item.summary || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const date = new Date(category.created_at).toUTCString();

          itemsXml += `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${desc}</description>
      <pubDate>${date}</pubDate>
      <guid isPermaLink="true">${link}</guid>
    </item>`;
        });
      }
    });
  }

  if (terms) {
    terms.forEach((term) => {
      const title = `IT 용어: ${(term.term || '').replace(/&/g, '&amp;')}`;
      const link = `${baseUrl}/dictionary#${encodeURIComponent((term.term || '').trim())}`;
      const desc = (term.description || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const date = new Date(term.created_at).toUTCString();

      itemsXml += `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${desc}</description>
      <pubDate>${date}</pubDate>
      <guid isPermaLink="true">${link}</guid>
    </item>`;
    });
  }

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>픽이지 (PickEasy)</title>
    <link>${baseUrl}</link>
    <description>AI 기반 IT 제품 추천 및 랭킹 서비스</description>
    <language>ko</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}