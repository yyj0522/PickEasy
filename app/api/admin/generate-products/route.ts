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

    // 1. 🔍 검색 쿼리: 오염원(노트북, 청소기)을 브랜드명 단위로 차단
    let q = `2026년 ${categoryName} 인기순위 추천 가격 가성비`;
    
    if (category === 'desktop') {
      // 데스크탑: 노트북 대표 브랜드명 직접 제외
      q = `2026년 조립컴퓨터 본체 데스크탑 추천 순위 -노트북 -랩톱 -그램 -갤럭시북 -맥북 -MacBook -이온 -Air`;
    }
    else if (category === 'dryer') {
      // 드라이기: 청소기/세탁기 브랜드명 직접 제외
      q = `2026년 헤어드라이기 추천 JMW 다이슨 유닉스 레이트 샤크 -코드제로 -A9 -청소기 -건조기 -스타일러 -세탁기 -트롬 -그랑데 -비스포크 -Bespoke`;
    }
    else if (category === 'cleaner') {
      // 청소기: 드라이기/세탁기 제외
      q = `2026년 무선청소기 로봇청소기 추천 순위 -세탁기 -드라이기`;
    }
    else if (category === 'accessory') {
      q = `알리익스프레스 가성비 IT소품 추천 베스트`;
    }

    const searchContext = await searchWeb(q);

    // 2. 🧠 AI 검열 프롬프트: 블랙리스트 적용
    let strictRules = "";
    if (category === 'desktop') {
      strictRules = `
        [🚨 데스크탑 강력 필터링]
        1. **절대 금지 키워드:** 제목에 'Gram', '그램', 'Galaxy Book', '갤럭시북', 'MacBook', 'Laptop'이 포함되면 무조건 버리세요.
        2. 오직 '본체(Main body)', '조립 PC', '타워형 데스크탑'만 포함하세요.
      `;
    } else if (category === 'dryer') {
      strictRules = `
        [🚨 드라이기 강력 필터링]
        1. **헤어드라이기(Hair Dryer)만 허용:** 머리 말리는 기계가 아니면 즉시 폐기하세요.
        2. **브랜드 주의:** 'LG 코드제로(CordZero)', 'LG A9'은 청소기입니다. '삼성 비스포크(Bespoke)'는 주로 가전입니다.
        3. **절대 금지:** '코드제로', '청소기', '건조기(Clothes Dryer)', '트롬', '그랑데' 단어가 보이면 절대 목록에 넣지 마세요.
        4. **추천 브랜드:** 다이슨(Dyson), JMW, 유닉스(Unix), 샤크(Shark), 레이트(Laifen), 한일 등 헤어기기 전문 브랜드 위주로 선정하세요.
      `;
    }

    const systemPrompt = `
      당신은 깐깐한 검수자(Reviewer)입니다. 
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