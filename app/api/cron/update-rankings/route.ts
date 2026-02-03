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
  const targetCategory = searchParams.get('category'); 

  if (secret !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const todayStr = `${year}년 ${month}월 ${Math.ceil(now.getDate() / 7)}주차`;
  const results = [];

  const categoriesToProcess = targetCategory 
    ? CATEGORIES.filter(c => c.slug === targetCategory) 
    : CATEGORIES;

  try {
    for (const cat of categoriesToProcess) {
      
      let strictRules = "";
      if (cat.slug === 'dryer') {
        strictRules = `
          [🚨 드라이기 전용 규칙]
          1. **오직 '헤어드라이기(Hair Dryer)'만 포함하세요.**
          2. **절대 금지:** 의류 건조기(Clothes Dryer), 세탁기, 스타일러, 청소기(코드제로, A9).
          3. **추천 브랜드:** JMW, 유닉스(Unix), 다이슨(Dyson), 레이트(Laifen), 샤크(Shark).
          4. **주의:** '삼성', 'LG'는 헤어드라이기 주력이 아닙니다. 확실한 모델이 없으면 제외하세요.
        `;
      } else if (cat.slug === 'cleaner') {
        strictRules = `
          [🚨 청소기 전용 규칙]
          1. 무선청소기(스틱형)와 로봇청소기만 포함하세요.
          2. 세탁기, 공기청정기, 드라이기 제외.
        `;
      } else if (cat.slug === 'accessory') {
        strictRules = `
          [🚨 소품 전용 규칙]
          1. 알리익스프레스 등에서 인기 있는 가성비 IT 소품(충전기, 케이블, 키캡, 거치대 등) 위주.
        `;
      }

      const systemPrompt = `
        당신은 IT 트렌드 분석가입니다. 현재 시점: **${todayStr}**

        '${cat.name}' 카테고리의 **인기 제품 TOP 10**을 선정해주세요.
        인터넷 검색 없이 당신의 데이터베이스를 바탕으로 **가장 대중적이고 평이 좋은 모델**들을 추천하세요.

        [데이터 작성 규칙]
        1. **제품명:** 브랜드명 + 모델명 풀네임 (예: LG전자 그램 프로 16)
        2. **가격 (중요):** 2024~2025년 출시가를 기준으로 2026년 물가 상승분을 반영하여 **원화(KRW) 숫자만** 입력하세요.
           - 예: 1500000 (O), 150만원 (X), 1,500,000 (X)
           - **절대로 0원이나 빈칸으로 두지 마세요. 어떻게든 추정치를 넣으세요.**
        3. **이유:** 해당 제품이 인기 있는 이유를 한 줄로 요약.
        4. **필터링:**
           ${strictRules}
        
        [출력 형식 - JSON Only]
        {
          "updated_date": "${todayStr}",
          "list": [
            {
              "rank": 1,
              "name": "제품명",
              "price_estimate": 1500000,
              "reason": "가벼운 무게와 긴 배터리 타임",
              "change": "NEW"
            }
          ]
        }
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.5,
      });

      const rankingData = JSON.parse(completion.choices[0].message.content || "{}");

      if (rankingData.list && Array.isArray(rankingData.list)) {
        rankingData.list = rankingData.list.map((item: any) => {
          let price = item.price_estimate;
          
          if (typeof price === 'string') {
            price = parseInt(price.replace(/[^0-9]/g, ''));
          }
          
          if (isNaN(price) || price === 0) {
            price = 100000; 
          }

          return {
            ...item,
            price_estimate: price
          };
        });
      }

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