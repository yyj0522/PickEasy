import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

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

    const systemPrompt = `
      당신은 2026년 대한민국 이커머스 트렌드를 분석하는 전문 MD입니다.
      현재 날짜는 **${today}** 입니다.
      
      '${categoryName}' 카테고리에서 현재 한국 시장(쿠팡, 다나와)에서 가장 인기 있는 **최신 제품 20개**를 선정하세요.
      
      [⚠️ 2026년 시장 상황 및 가격 정책 필수 반영]
      1. **가격 현실화:** 현재 반도체 이슈 및 물가 상승으로 인해 2024~2025년 대비 전자제품 가격이 **약 1.5배~2배 상승**했습니다.
         - 예: 램 16GB 5만원 -> 12만원, 쓸만한 노트북 100만원 -> 150만원.
         - 과거 데이터를 그대로 쓰지 말고, 이 **인플레이션 상황을 시뮬레이션하여 가격을 높게 책정**하세요.
      2. **최신성:** 모델명에 2025, 2026 연식이 포함되거나 최신 세대(인텔 15세대, RTX 50 등) 부품이 탑재된 제품 위주로 선정하세요.
      
      [출력 형식 - JSON Only]
      {
        "products": [
          { 
            "title": "정확한 제품명 (2026년형)", 
            "price": 1890000, 
            "specs": "핵심 스펙 3줄 요약" 
          }
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("AI 응답이 비어있습니다.");

    const data = JSON.parse(content);
    
    if (!data.products || !Array.isArray(data.products)) {
      throw new Error("AI가 제품 리스트를 생성하지 못했습니다.");
    }

    const products = data.products.map((p: any) => {
        let price = 0;
        if (typeof p.price === 'number') {
            price = p.price;
        } else if (typeof p.price === 'string') {
            price = parseInt(p.price.replace(/[^0-9]/g, '')) || 0;
        }

        return {
            category,
            title: p.title || "이름 없음",
            price: price, 
            specs: p.specs || "",
            status: 'PENDING',
            image_url: '' 
        };
    });

    const { error } = await supabase.from('products').insert(products);
    if (error) throw error;

    return NextResponse.json({ success: true, count: products.length });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}