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

    // 1. 🔍 검색 쿼리 강력하게 수정 (원천 차단)
    let q = `2026년 ${categoryName} 인기순위 추천 가격 가성비`;
    
    if (category === 'desktop') {
      // 데스크탑 검색 시 노트북 제외
      q = `2026년 조립컴퓨터 본체 데스크탑 추천 순위 -노트북 -랩톱 -그램 -갤럭시북`;
    }
    else if (category === 'dryer') {
      // 드라이기 검색 시 의류건조기, 청소기 제외, 특정 브랜드 명시
      q = `2026년 헤어드라이기 추천 JMW 다이슨 슈퍼소닉 유닉스 레이트 -의류 -건조기 -청소기 -세탁기 -스타일러`;
    }
    else if (category === 'cleaner') {
      // 청소기
      q = `2026년 무선청소기 로봇청소기 추천 순위 -세탁기 -드라이기`;
    }
    else if (category === 'accessory') {
      q = `알리익스프레스 가성비 IT소품 추천 베스트`;
    }

    const searchContext = await searchWeb(q);

    // 2. 🧠 AI 검열 프롬프트 강화
    let strictRules = "";
    if (category === 'desktop') {
      strictRules = `
        [🚨 데스크탑 필터링]
        - **노트북(Laptop) 절대 금지:** 'LG 그램', '삼성 갤럭시북', 'MacBook' 등 휴대용 PC는 데스크탑이 아닙니다. 무조건 제외하세요.
        - 본체(Mainframe) 위주로 선정하세요.
      `;
    } else if (category === 'dryer') {
      strictRules = `
        [🚨 드라이기 필터링]
        - **헤어드라이기(Hair Dryer)만 허용:** 머리카락을 말리는 용도만 포함하세요.
        - **의류 가전 금지:** '건조기(Clothes Dryer)', '세탁기', '스타일러' 절대 제외.
        - **청소기 금지:** '코드제로(CordZero)', '청소기' 관련 제품 절대 제외.
        - **없는 제품 창조 금지:** 삼성전자는 헤어드라이기를 거의 만들지 않습니다. 확실한 모델(예: 다이슨 슈퍼소닉, JMW, 유닉스 등)이 아니면 제외하세요.
      `;
    }

    const systemPrompt = `
      당신은 깐깐한 이커머스 MD입니다. 
      아래 **[검색 결과]**를 바탕으로 '${categoryName}' 카테고리 제품 20개를 선정하세요.
      
      ${searchContext}

      [필수 규칙]
      1. **상상 금지:** 검색 결과에 없는 제품을 지어내지 마세요.
      2. **카테고리 엄수:**
         ${strictRules}
      3. 가격: 검색된 정보 기반으로 작성 (2026년 시세)
      
      [출력 형식 - JSON Only]
      { "products": [{ "title": "...", "price": 0, "specs": "..." }] }
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