import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { searchWeb } from '@/app/lib/search'; 

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
      // 1. 🔍 검색 쿼리: 블랙리스트 키워드 추가
      let q = `${year}년 ${cat.name} 인기순위 추천 가격`;
      
      if (cat.slug === 'desktop') {
        q = `${year}년 조립컴퓨터 본체 데스크탑 추천 순위 -노트북 -랩톱 -그램 -갤럭시북 -맥북`;
      } else if (cat.slug === 'dryer') {
        q = `${year}년 헤어드라이기 추천 JMW 다이슨 유닉스 샤크 -코드제로 -A9 -비스포크 -의류 -건조기 -청소기 -세탁기`;
      } else if (cat.slug === 'cleaner') {
        q = `${year}년 무선청소기 로봇청소기 추천 -드라이기`;
      } else if (cat.slug === 'accessory') {
        q = `알리익스프레스 가성비 IT소품 추천 베스트`;
      }

      const searchContext = await searchWeb(q);

      // 2. 🧠 프롬프트 필터링 강화
      let strictRules = "";
      if (cat.slug === 'desktop') {
        strictRules = "제목에 '그램', '갤럭시북', '노트북'이 들어간 제품은 무조건 제외하세요. 오직 '본체'만 포함하세요.";
      }
      if (cat.slug === 'dryer') {
        strictRules = "LG 코드제로(청소기), 삼성 비스포크(가전), 의류건조기는 절대 금지입니다. 오직 '헤어드라이기'만 포함하세요.";
      }

      const systemPrompt = `
        당신은 IT 데이터 분석가입니다. 현재: **${todayStr}**

        아래 **[검색 결과]**를 분석하여 '${cat.name}' 분야의 **주간 랭킹 TOP 10**을 선정하세요.
        
        ${searchContext}
        
        [규칙]
        1. **검색 데이터 기반:** 상상하지 말고 검색 결과에 있는 제품을 쓰세요.
        2. **필터링:**
           ${strictRules}
        
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