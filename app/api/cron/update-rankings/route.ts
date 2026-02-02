import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

const CATEGORIES = [
  { slug: 'laptop', name: '노트북' },
  { slug: 'desktop', name: '완본체 데스크탑' },
  { slug: 'monitor', name: '모니터' },
  { slug: 'mouse', name: '마우스' },
  { slug: 'keyboard', name: '키보드' },
  { slug: 'tablet', name: '태블릿 PC' },
  { slug: 'cleaner', name: '로봇/무선청소기' },
  { slug: 'dryer', name: '헤어드라이기' },
  { slug: 'audio', name: '헤드셋/이어폰' },
  { slug: 'massage', name: '안마기/마사지기' },
  { slug: 'watch', name: '스마트워치' },
  { slug: 'camera', name: '카메라' }
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
  const week = Math.ceil(now.getDate() / 7);
  const todayStr = `${year}년 ${month}월 ${week}주차`;

  const results = [];

  try {
    for (const cat of CATEGORIES) {
      const systemPrompt = `
        당신은 ${year}년 미래 시점에 살고 있는 IT/가전 전문 트렌드 분석가입니다.
        현재 날짜는 **${todayStr}** 입니다.

        이 시점을 기준으로 대한민국에서 가장 인기 있는 '${cat.name}' **TOP 10**을 선정하세요.
        
        [⚠️ 중요: 치명적 오류 방지 규칙]
        1. **구형 모델 절대 금지:** 2023년 이전에 출시되어 단종되거나 구형이 된 모델은 절대 추천하지 마십시오.
        2. **최신 세대(Generation) 추론:** 네이밍 규칙을 통해 ${year}년 현재 시점의 최신 모델명을 유추하여 출력하십시오.
        3. **판매 가능성:** 지금 당장 오픈마켓에서 구매 가능할 법한 '현역 주력 모델' 위주로 선정하십시오.

        [분석 기준]
        - 1~3위: 압도적인 성능이나 가성비로 ${year}년 시장을 지배하는 제품.
        - 4~10위: 특정 타겟층(게이머, 전문가, 1인 가구)에게 인기 있는 제품.
        - 제품명은 소비자들이 검색하는 **정확한 한국 모델명**을 사용하십시오.

        [출력 형식 - JSON Only]
        {
          "updated_date": "${todayStr}",
          "list": [
            {
              "rank": 1,
              "name": "제품명",
              "price_estimate": "가격(숫자만)",
              "reason": "선정 이유",
              "change": "NEW"
            },
            ... (10위까지)
          ]
        }
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.8,
      });

      const rankingData = JSON.parse(completion.choices[0].message.content || "{}");

      const { error } = await supabase.from('rankings').insert({
        category: cat.slug,
        data: rankingData
      });

      if (error) throw error;
      results.push({ category: cat.name, status: 'updated', date: todayStr });
    }

    return NextResponse.json({ success: true, results });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ranking Update Failed' }, { status: 500 });
  }
}