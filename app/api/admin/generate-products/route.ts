import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { searchWeb } from '@/app/lib/search'; // ⭐ Serper 검색

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { secret, category, categoryName } = await req.json();

    if (secret !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ error: '비밀번호 오류' }, { status: 401 });
    }

    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    // 1. 검색 쿼리 최적화
    let q = `2026년 ${categoryName} 인기순위 추천 가격 가성비`;
    if (category === 'dryer') q = `2026년 헤어드라이기 추천 순위 JMW 다이슨`;
    if (category === 'accessory') q = `알리익스프레스 가성비 IT소품 추천 베스트`;

    // 2. 실시간 검색 수행
    const searchContext = await searchWeb(q);

    // 3. AI 분석
    const systemPrompt = `
      당신은 이커머스 MD입니다. 오늘: ${today}
      
      아래 **[실시간 검색 결과]**를 바탕으로, '${categoryName}' 카테고리의 **실제 인기 제품 20개**를 선정하세요.
      
      ${searchContext}

      [필수 규칙]
      1. **상상 금지:** 검색 결과에 있는 제품명과 가격을 최우선으로 반영하세요.
      2. **가격:** 검색된 최저가/평균가를 반영하세요. (2026년 물가 반영)
      3. **드라이기:** 무조건 '헤어드라이기'만 포함하세요. (의류건조기 제외)
      
      [출력 형식 - JSON Only]
      {
        "products": [
          { "title": "정확한 제품명", "price": 0, "specs": "요약" }
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(completion.choices[0].message.content || "{}");
    
    if (!data.products || !Array.isArray(data.products)) throw new Error("데이터 생성 실패");

    const products = data.products.map((p: any) => ({
        category,
        title: p.title || "이름 없음",
        price: typeof p.price === 'string' ? parseInt(p.price.replace(/[^0-9]/g, '')) || 0 : p.price, 
        specs: p.specs || "",
        status: 'PENDING',
        image_url: '' 
    }));

    const { error } = await supabase.from('products').insert(products);
    if (error) throw error;

    return NextResponse.json({ success: true, count: products.length });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}