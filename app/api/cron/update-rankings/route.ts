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
      1. **반드시 아래 JSON 형식 그대로만 출력하세요. 다른 말은 절대 금지입니다.**
      2. 가격은 쉼표 없는 숫자만 (예: 1500000).
      3. 인치 기호(")나 따옴표(')는 반드시 제거하거나 한글(인치)로 표기하세요. (JSON 파싱 오류 방지)
      4. **expert_review**는 3~4줄로 전문적인 톤앤매너를 유지하세요.
      5. **usage_scenario**는 구체적인 타겟 유저를 명시하세요.

      [출력 JSON 형식]
      {
        "updated_date": "${today} 기준 (${weekStr})",
        "list": [
          {
            "rank": 1,
            "name": "브랜드 + 모델명",
            "price_estimate": 500000,
            "summary": "특징 요약",
            "spec_detail": "27인치 / 144Hz / IPS 패널 등",
            "pros": "장점",
            "cons": "단점",
            "usage_scenario": "FPS 게이머 추천",
            "expert_review": "이 모니터는 응답속도가 빨라 배틀그라운드 같은 게임에 최적화되어 있습니다.",
            "change": "NEW"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // 마크다운 제거
    text = text.replace(/```json/g, "").replace(/```/g, "");
    
    // JSON 추출 로직 강화
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    } else {
      console.error("AI Response Text:", text); // 디버깅용 로그
      throw new Error("Valid JSON not found in response");
    }

    // JSON 파싱 시도 (실패 시 에러 로그 출력)
    let rankingData;
    try {
        rankingData = JSON.parse(text);
    } catch (e) {
        // Trailing comma 제거 시도 (가끔 AI가 마지막에 콤마를 남김)
        text = text.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        rankingData = JSON.parse(text);
    }

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