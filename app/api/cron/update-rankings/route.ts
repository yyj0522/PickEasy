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
      역할: 당신은 '픽이지(PickEasy)'의 깐깐한 IT 전문 리뷰어입니다.
      임무: **${today}** 기준, 대한민국에서 가장 인기 있는 **'${targetCategory.name}'** 판매 순위 TOP 10을 선정하고, 상세 분석 데이터를 JSON으로 출력하세요.
      
      [필수 제약 조건]
      1. **오직 순수 JSON 데이터만 출력하세요.**
      2. 가격은 쉼표 없는 숫자만 (예: 1500000).
      3. **expert_review** 항목은 블로그 포스팅 1개 분량처럼 3~4줄로 자세하고 전문적으로 작성하세요.
      4. **usage_scenario**는 구체적인 사용자층(예: 공대생, 디자이너, 1인 가구)을 명시하세요.

      [출력 JSON 형식]
      {
        "updated_date": "${today} 기준 (${weekStr})",
        "list": [
          {
            "rank": 1,
            "name": "브랜드 + 정확한 모델명",
            "price_estimate": 1000000,
            "summary": "핵심 특징 한 줄 요약",
            "spec_detail": "CPU / RAM / 무게 / 화면크기 등 상세 스펙 나열",
            "pros": "장점",
            "cons": "단점",
            "usage_scenario": "대학생 과제용, 고사양 게이밍용, 직장인 휴대용 등 추천 대상",
            "expert_review": "이 제품은 전작 대비 배터리 효율이 20% 개선되었습니다. 특히 무게가 가벼워 이동이 잦은 사용자에게...",
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