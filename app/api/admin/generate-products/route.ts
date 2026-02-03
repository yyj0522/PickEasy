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

    // 💡 카테고리별 전략 분기
    let strategyPrompt = "";
    
    if (category === 'accessory') {
      // 알리익스프레스 타겟 (소모품)
      strategyPrompt = `
        2. **[알리익스프레스 타겟]:** 이 카테고리('${categoryName}')는 가성비가 핵심입니다.
           - 알리익스프레스(AliExpress)에서 한국인들에게 인기 있는 '천원마트', '꽁돈대첩', '초이스' 상품 위주로 선정하세요.
           - 예: Baseus/Ugreen 충전기, 기계식 키보드 스위치, 저렴한 마우스패드, 케이블, 정리함 등.
           - 가격은 알리익스프레스 직구 평균가를 원화로 환산하여 적으세요.
      `;
    } else {
      // 일반 가전 (최저가 비교)
      strategyPrompt = `
        2. **[국내 최저가 분석]:** 단순히 쿠팡만 보지 말고, **다나와, 11번가, 하이마트, G마켓** 등 국내 주요 쇼핑몰의 가격을 종합적으로 고려하여 '역대가'에 가까운 제품을 선정하세요.
           - 특정 쇼핑몰에만 있는 특가 모델(예: 하이마트 전용 LG 그램, 11번가 전용 ASUS 노트북)도 적극 포함하세요.
      `;
    }

    const systemPrompt = `
      당신은 2026년 대한민국 이커머스 트렌드를 분석하는 전문 MD입니다.
      현재 날짜는 **${today}** 입니다.
      
      '${categoryName}' 카테고리에서 현재 가장 인기 있고 구매 가치가 높은 **최신 제품 20개**를 선정하세요.
      
      [분석 가이드]
      1. **가격 현실화 (2026년 인플레이션):** 반도체/원자재 가격 폭등으로 인해 2024년 대비 가격이 약 1.5배 상승했음을 시뮬레이션하여 가격을 책정하세요.
      ${strategyPrompt}
      3. **최신성:** 구형 재고떨이 제품보다는 2025~2026년형 신제품 혹은 현역 주력 제품을 우선하세요.
      
      [출력 형식 - JSON Only]
      {
        "products": [
          { 
            "title": "정확한 제품명 (쇼핑몰 검색용 풀네임)", 
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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}