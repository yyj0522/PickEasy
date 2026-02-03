import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { searchWeb } from '@/app/lib/search'; 

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

    // 1. 🔍 검색 쿼리
    let q = `2026년 ${categoryName} 인기순위 추천 가격 스펙`;
    
    if (category === 'desktop') {
      q = `2026년 조립컴퓨터 본체 데스크탑 추천 스펙 가격 -노트북 -랩톱 -그램 -갤럭시북 -맥북`;
    }
    else if (category === 'dryer') {
      q = `2026년 헤어드라이기 추천 JMW 다이슨 유닉스 레이트 샤크 스펙 가격 -코드제로 -A9 -청소기 -건조기 -스타일러`;
    }
    else if (category === 'cleaner') {
      q = `2026년 무선청소기 로봇청소기 추천 스펙 흡입력 -세탁기 -드라이기`;
    }
    else if (category === 'accessory') {
      q = `알리익스프레스 가성비 IT소품 추천 베스트 스펙`;
    }

    const searchContext = await searchWeb(q);

    // 2. 🧠 필터링 규칙
    let strictRules = "";
    if (category === 'desktop') {
      strictRules = `
        [🚨 데스크탑 강력 필터링]
        - 제목에 'Gram', '그램', 'Galaxy Book', 'Laptop' 등이 포함되면 무조건 제외.
        - '본체', '조립 PC' 위주 선정.
      `;
    } else if (category === 'dryer') {
      strictRules = `
        [🚨 드라이기 강력 필터링]
        - 오직 '헤어드라이기(Hair Dryer)'만 허용.
        - '코드제로', '청소기', '건조기', '트롬' 절대 제외.
        - 삼성/LG는 헤어드라이기 주력이 아니므로 확실한 모델 아니면 제외.
      `;
    }

    // 3. 📝 스펙 상세화 프롬프트 (핵심 수정 부분)
    const systemPrompt = `
      당신은 깐깐한 이커머스 MD입니다. 
      아래 **[검색 결과]**를 바탕으로 '${categoryName}' 카테고리 제품 20개를 선정하세요.
      
      ${searchContext}

      [⭐ 스펙(specs) 작성 가이드라인 - 매우 중요]
      'specs' 필드는 단순한 설명이 아니라, 아래 예시처럼 **구체적인 기술 제원**을 줄바꿈(\\n)으로 구분하여 상세히 작성해야 합니다.
      검색 결과에 스펙이 부족하다면, **당신의 지식 베이스를 활용하여 해당 모델의 표준 스펙을 채워 넣으세요.**

      **작성 예시 (노트북):**
      "CPU: 인텔 코어 Ultra 7 155H\nRAM: 32GB LPDDR5X\nSSD: 1TB NVMe\n디스플레이: 16인치 WQXGA+ AMOLED\n그래픽: RTX 4050\n무게: 1.2kg"

      **작성 예시 (가전/기타):**
      "모터: BLDC 항공모터\n소비전력: 1600W\n기능: 음이온 케어, 3단 풍량\n구성품: 노즐 3종, 거치대\n무게: 380g"

      [필수 규칙]
      1. **상상 금지:** 검색 결과에 없는 제품명을 지어내지 마세요.
      2. **카테고리 엄수:**
         ${strictRules}
      3. **가격:** 검색된 정보 기반 (2026년 시세 반영)
      
      [출력 형식 - JSON Only]
      { 
        "products": [
          { 
            "title": "정확한 모델명", 
            "price": 1500000, 
            "specs": "위 예시처럼 상세 스펙 기술" 
          }
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
        specs: p.specs || "", // AI가 줄바꿈(\n)을 포함해 작성한 상세 스펙
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