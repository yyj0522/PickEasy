import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { model } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CATEGORIES = [
  { slug: 'laptop', name: '노트북' },
  { slug: 'desktop', name: '데스크탑' },
  { slug: 'monitor', name: '모니터' },
  { slug: 'tablet', name: '태블릿' },
  { slug: 'mouse', name: '마우스' },
  { slug: 'keyboard', name: '키보드' },
  { slug: 'watch', name: '스마트워치' },
  { slug: 'audio', name: '음향기기' },
  { slug: 'speaker', name: '스피커' },
  { slug: 'camera', name: '카메라' },
  { slug: 'tv', name: 'TV' },
  { slug: 'refrigerator', name: '냉장고' },
  { slug: 'washer', name: '세탁기' },
  { slug: 'clothes_dryer', name: '의류 건조기' },
  { slug: 'air_conditioner', name: '에어컨' },
  { slug: 'air_purifier', name: '공기청정기' },
  { slug: 'cleaner', name: '청소기' },
  { slug: 'hair_dryer', name: '헤어드라이기' },
  { slug: 'massage', name: '안마기' },
  { slug: 'accessory', name: 'IT소품/잡화' }
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const manualSlug = searchParams.get('slug'); 

  if (secret !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let targetCategory;

  if (manualSlug) {
    targetCategory = CATEGORIES.find(c => c.slug === manualSlug);
    if (!targetCategory) {
      return NextResponse.json({ error: `Category '${manualSlug}' not found` }, { status: 404 });
    }
  } else {
    const currentHour = new Date().getHours(); 
    const targetIndex = currentHour % CATEGORIES.length; 
    targetCategory = CATEGORIES[targetIndex];
  }

  const now = new Date();
  const today = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  const weekNumber = Math.ceil((now.getDate() + 6 - now.getDay()) / 7);
  const weekStr = `${now.getMonth() + 1}월 ${weekNumber}주차`;

  console.log(`[Update Start] Target: ${targetCategory.name} (Mode: ${manualSlug ? 'Manual' : 'Auto'})`);

  try {
    const prompt = `
      역할: 당신은 대한민국 최고의 쇼핑 데이터 분석가입니다.
      임무: **${today}** 기준, 대한민국에서 가장 인기 있는 **'${targetCategory.name}'** 판매 순위 TOP 10을 JSON 데이터로 출력하세요.
      
      [필수 제약 조건 - 절대 준수]
      1. **오직 순수 JSON 데이터만 출력하세요.**
      2. 인사말, 서론, 결론, 마크다운 코드 블록(\`\`\`json) 등 사족을 절대 붙이지 마세요.
      3. 데이터를 찾기 어렵더라도 "죄송합니다"라고 거절하지 말고, 현재 시장에서 가장 유명한 베스트셀러 제품들로 추정하여 반드시 작성하세요.
      4. 가격은 쉼표(,) 없는 숫자만 작성하세요 (예: 1500000).

      [카테고리별 특별 지침]
      - 드라이기: 헤어드라이기만 포함.
      - 냉장고/세탁기/TV: 삼성, LG 등 주요 브랜드 최신 모델 위주.

      [출력 JSON 형식]
      {
        "updated_date": "${today} 기준 (${weekStr})",
        "list": [
          {
            "rank": 1,
            "name": "브랜드 + 정확한 모델명",
            "price_estimate": 1000000,
            "summary": "제품 특징 요약",
            "spec_detail": "핵심 스펙",
            "pros": "장점",
            "cons": "단점",
            "change": "NEW"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    text = text.replace(/```json/g, "").replace(/```/g, "");
    
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    } else {
      throw new Error("Valid JSON not found in response");
    }

    const rankingData = JSON.parse(text);

    const { error } = await supabase.from('rankings').upsert({
      category: targetCategory.slug,
      data: rankingData,
      created_at: new Date().toISOString()
    }, { onConflict: 'category' });

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      updated: targetCategory.name,
      mode: manualSlug ? 'Manual' : 'Auto-Hourly'
    });

  } catch (error: any) {
    console.error(`Ranking Update Error (${targetCategory.name}):`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}