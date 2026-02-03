import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { searchWeb } from '@/app/lib/search'; // ⭐

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const CATEGORIES = [
  { slug: 'laptop', name: '노트북' },
  { slug: 'desktop', name: '데스크탑' },
  { slug: 'monitor', name: '모니터' },
  { slug: 'mouse', name: '마우스' },
  { slug: 'keyboard', name: '키보드' },
  { slug: 'tablet', name: '태블릿' },
  { slug: 'cleaner', name: '청소기' },
  { slug: 'dryer', name: '드라이기' },
  { slug: 'audio', name: '음향기기' },
  { slug: 'massage', name: '안마기' },
  { slug: 'watch', name: '워치' },
  { slug: 'camera', name: '카메라' },
  { slug: 'accessory', name: 'IT소품/잡화' }
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const todayStr = `${year}년 ${month}월 ${Math.ceil(now.getDate() / 7)}주차`;
  
  const results = [];

  try {
    for (const cat of CATEGORIES) {
      let q = `${year}년 ${month}월 ${cat.name} 인기순위 추천`;
      if (cat.slug === 'dryer') q += " 헤어드라이기 -의류건조기";
      if (cat.slug === 'accessory') q = `알리익스프레스 가성비 IT소품 추천`;

      const searchContext = await searchWeb(q);

      const systemPrompt = `
        당신은 IT 분석가입니다. 현재: **${todayStr}**

        아래 **[검색 결과]**를 분석하여 '${cat.name}' 분야의 **주간 랭킹 TOP 10**을 선정하세요.
        
        ${searchContext}
        
        [규칙]
        1. **검색 데이터 기반:** 상상하지 말고 검색 결과에 있는 제품을 쓰세요.
        2. **드라이기:** 헤어드라이기만 포함하세요.
        
        [출력 형식 - JSON Only]
        {
          "updated_date": "${todayStr}",
          "list": [
            {
              "rank": 1,
              "name": "제품명",
              "price_estimate": "가격(숫자만)",
              "reason": "이유",
              "change": "NEW"
            }
          ]
        }
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const rankingData = JSON.parse(completion.choices[0].message.content || "{}");

      const { error } = await supabase.from('rankings').insert({
        category: cat.slug,
        data: rankingData
      });

      if (!error) results.push({ category: cat.name, status: 'updated' });
    }

    return NextResponse.json({ success: true, date: todayStr, results });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}