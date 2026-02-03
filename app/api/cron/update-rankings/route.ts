import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

// 알리익스프레스 전용 카테고리 포함
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

// ⭐ 중요: 크론잡이나 브라우저 접속은 GET 요청입니다.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  // 보안 체크
  if (secret !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  // 주차 계산 로직 (간단 버전)
  const firstDay = new Date(year, month - 1, 1);
  const dayOfWeek = firstDay.getDay(); 
  const currentDay = now.getDate();
  const week = Math.ceil((currentDay + dayOfWeek) / 7);
  
  const todayStr = `${year}년 ${month}월 ${week}주차`;
  const results = [];

  try {
    for (const cat of CATEGORIES) {
      // 카테고리별 전략
      let strategy = "";
      if (cat.slug === 'accessory') {
        strategy = `
          - **알리익스프레스 가성비템 위주:** 천원마트, 꽁돈대첩 등에서 인기 있는 IT 소품(충전기, 케이블, 키캡, 정리함 등)을 선정하세요.
          - 가격은 알리 직구 평균가(원화)로 책정하세요.
        `;
      } else {
        strategy = `
          - **국내 최저가(쿠팡/다나와):** 2026년 현재 물가(반도체 폭등 등)를 반영하여, 2024년 대비 약 1.5배 상승한 현실적인 가격을 적으세요.
          - 최신형(2025~2026년식) 위주로 선정하세요.
        `;
      }

      const systemPrompt = `
        당신은 ${year}년 대한민국 IT 트렌드 분석가입니다.
        현재 시점: **${todayStr}**

        '${cat.name}' 분야의 **주간 인기 랭킹 TOP 10**을 선정하세요.
        
        [분석 지침]
        ${strategy}
        
        [출력 형식 - JSON Only]
        {
          "updated_date": "${todayStr}",
          "list": [
            {
              "rank": 1,
              "name": "정확한 제품명",
              "price_estimate": "가격(숫자만)",
              "reason": "인기 이유 (한 줄 요약)",
              "change": "NEW" (또는 UP, DOWN, -)
            }
            ... (10위까지)
          ]
        }
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const rankingData = JSON.parse(completion.choices[0].message.content || "{}");

      // DB 저장
      const { error } = await supabase.from('rankings').insert({
        category: cat.slug,
        data: rankingData
      });

      if (error) {
          console.error(`Error saving ${cat.name}:`, error);
      } else {
          results.push({ category: cat.name, status: 'updated' });
      }
    }

    return NextResponse.json({ success: true, date: todayStr, results });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}