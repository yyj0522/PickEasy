import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { model, cleanGeminiJson } from '@/lib/gemini';

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

  if (secret !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

 
  const randomIndex = Math.floor(Math.random() * CATEGORIES.length);
  const targetCategory = CATEGORIES[randomIndex];
  const now = new Date();
  const today = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
  const weekNumber = Math.ceil((now.getDate() + 6 - now.getDay()) / 7);
  const weekStr = `${now.getMonth() + 1}월 ${weekNumber}주차`;

  console.log(`[Update Start] Target: ${targetCategory.name} (${today})`);

  try {
    const prompt = `
      **${today}** 기준, 대한민국에서 가장 인기 있는 **'${targetCategory.name}'** 판매 순위 TOP 10을 조사하세요.
      다나와, 네이버 쇼핑, 쿠팡 등의 최신 트렌드를 반영하여 선정하세요.

      [주의사항]
      1. 드라이기 카테고리는 '헤어드라이기'만 포함.
      2. 가격은 현재 판매가(KRW) 기준 숫자만 (예: 1500000).
      3. 단종된 구형 모델 제외.
      4. 제품명은 브랜드와 모델명을 정확히 기재.

      [출력 형식 - JSON Only]
      {
        "updated_date": "${today} 기준 (${weekStr})",
        "list": [
          {
            "rank": 1,
            "name": "브랜드 + 제품명 (풀네임)",
            "price_estimate": 1500000,
            "summary": "핵심 특징 한 줄 요약",
            "spec_detail": "상세 스펙 간략 기재",
            "pros": "장점",
            "cons": "단점",
            "change": "NEW"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = cleanGeminiJson(result.response.text());
    const rankingData = JSON.parse(text);
    const { error } = await supabase.from('rankings').upsert({
      category: targetCategory.slug,
      data: rankingData,
      created_at: new Date().toISOString()
    }, { onConflict: 'category' });

    if (error) {
      console.error(`Error saving ${targetCategory.slug}:`, error);
      throw error;
    }

    console.log(`[Success] Updated ${targetCategory.name}`);
    
    return NextResponse.json({ 
      success: true, 
      updated: targetCategory.name, 
      message: 'Single category updated to prevent timeout' 
    });

  } catch (error: any) {
    console.error("Ranking Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}