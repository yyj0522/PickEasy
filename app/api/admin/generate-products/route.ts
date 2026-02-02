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

    // ✅ 날짜 동적 생성
    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    const systemPrompt = `
      당신은 이커머스 전문 MD입니다.
      현재 날짜는 **${today}** 입니다.
      
      '${categoryName}' 카테고리에서 현재 한국 시장(쿠팡, 다나와 등)에서 가장 잘 팔리는 **최신 인기 제품 20개**를 선정하세요.
      
      [필수 조건]
      1. **최신성:** 2023년 이전 구형 모델은 제외하고, 2024~2026년 출시된 신제품 위주로 선정하세요.
      2. **형식:** 반드시 유효한 JSON 형식으로만 응답하세요.
      3. **가격:** 숫자만 출력 (예: 1890000).
      4. **스펙:** 핵심 스펙 3~4줄을 요약하여 줄바꿈(\n)으로 구분하세요.
      
      [출력 예시]
      {
        "products": [
          { 
            "title": "삼성전자 갤럭시북4 프로", 
            "price": 1890000, 
            "specs": "CPU: 인텔 코어 울트라 5\n화면: 16인치 AMOLED\n메모리: 16GB" 
          },
          ...
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