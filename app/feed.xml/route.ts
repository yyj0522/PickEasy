import { createClient } from '@supabase/supabase-js';

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
    .limit(20);

  const { data: terms } = await supabase
    .from('dictionary')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>픽이지 (PickEasy) - AI 기반 IT 제품 추천 및 랭킹</title>
      <link>${baseUrl}</link>
      <description>노트북, 모니터 등 IT 제품의 실시간 랭킹과 전문가 리뷰, IT 용어 사전을 제공합니다.</description>
      <language>ko</language>
  `;

  if (rankings) {
    rankings.forEach((category) => {
      category.data.list.forEach((item: any) => {
        xml += `
        <item>
          <title><![CDATA[${item.name} - ${item.summary}]]></title>
          <link>${baseUrl}/product/${encodeURIComponent(item.name.trim())}</link>
          <description><![CDATA[${item.expert_review || item.summary}]]></description>
          <pubDate>${new Date(category.created_at).toUTCString()}</pubDate>
          <guid>${baseUrl}/product/${encodeURIComponent(item.name.trim())}</guid>
        </item>`;
      });
    });
  }

  if (terms) {
    terms.forEach((term) => {
      xml += `
      <item>
        <title><![CDATA[IT 용어: ${term.term}]]></title>
        <link>${baseUrl}/dictionary#${encodeURIComponent(term.term)}</link>
        <description><![CDATA[${term.description}]]></description>
        <pubDate>${new Date(term.created_at).toUTCString()}</pubDate>
        <guid>${baseUrl}/dictionary#${encodeURIComponent(term.term)}</guid>
      </item>`;
    });
  }

  xml += `
    </channel>
  </rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}