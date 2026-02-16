import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { model } from '@/lib/gemini'; 
import { checkDailyLimit } from '@/lib/rate-limit'; 
import { headers } from 'next/headers';
import { verifyTurnstileToken, validateInput, SYSTEM_GUARD_PROMPT } from '@/lib/security';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown"; 
  
  const { allowed, remaining } = await checkDailyLimit(ip, 'pc');

  if (!allowed) {
    return NextResponse.json({ 
        error: "일일 PC 견적 요청 횟수(3회)를 초과했습니다.",
        limitReached: true
    }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { type, budget, usage, previousResult, refinementRequest, turnstileToken } = body;
    
    const isHuman = await verifyTurnstileToken(turnstileToken);
    if (!isHuman) {
      return NextResponse.json({ error: "보안 검증에 실패했습니다." }, { status: 403 });
    }

    const safeBudget = validateInput(budget || '');
    const safeUsage = validateInput(usage || '');
    const safeRefinement = validateInput(refinementRequest || '');

    if (type === 'initial') {
      const { data: cachedData } = await supabase
        .from('pc_estimates')
        .select('result')
        .eq('budget', safeBudget)
        .eq('usage', safeUsage)
        .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1)
        .single();

      if (cachedData) {
        return NextResponse.json({ ...cachedData.result, remaining });
      }
    }

    const now = new Date();
    const today = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

    let userPrompt = "";
    if (type === 'initial') {
      userPrompt = `사용자 요청: 예산 ${safeBudget}만원대로 ${safeUsage} 용도의 조립 PC 견적을 짜줘.`;
    } else {
      userPrompt = `기존 견적: ${JSON.stringify(previousResult)}\n수정 요청: ${safeRefinement}`;
    }

    const systemPrompt = `
      당신은 **${today}** 기준 대한민국 최고의 조립 PC 견적 전문가입니다.
      
      [매우 중요: 가격 정책 및 검색 지침]
      1. **반드시 '국내 정품' 가격 기준**으로 견적을 산출하세요. 
         - **'해외직구', '병행수입', '알리', '아마존' 가격은 절대 제외**하십시오.
         - 오직 **'다나와(Danawa)', '컴퓨존'** 등 한국 주요 쇼핑몰의 현금/카드 최저가 평균을 기준으로 삼으세요.
      
      2. **현재(2026년 2월) 부품 가격 이슈 반영:**
         - 삼성전자 DDR5 메모리 등 가격 폭등 부품은 실제 거래 가격(30만원 대 등)을 정확히 반영하세요.
         - 예산이 부족할 경우 삼성 대신 'SK하이닉스(A다이 언락)', '마이크론', 'TeamGroup' 등 가성비 정품 브랜드로 대체하세요.

      [출력 데이터 정제 규칙 (Strict)]
      1. **제품명(name)에 쇼핑몰 이름 금지:** '다나와', '컴퓨존', '최저가', '특가', '인기순위' 등의 단어를 **절대** 포함하지 마세요.
      2. **순수 모델명만 표기:** - (X) 다나와 최저가 삼성전자 DDR5-5600
         - (O) 삼성전자 DDR5-5600 (16GB)
      3. **가격(price):** '약', '원', ',' 등을 제외하고 오직 **숫자 정수**만 출력하세요. (예: 350000)

      ${SYSTEM_GUARD_PROMPT}

      [출력 형식 - JSON Only]
      **마크다운 없이 오직 JSON 문자열만 출력하세요.**
      {
        "intro": "견적에 대한 전문가의 짧은 한줄 평 (현재 부품 시장 상황 언급)",
        "parts": [ 
          { "part": "CPU", "name": "AMD 라이젠5-5세대 7500F (라파엘)", "price": 220000, "reason": "가성비 게이밍 CPU 1위" },
          { "part": "메모리", "name": "SK하이닉스 DDR5-5600 (16GB) x 2개", "price": 400000, "reason": "삼성 램 가격 폭등으로 인한 합리적 대안" }
        ],
        "total_price_estimate": 0,
        "review": "전체적인 구성 및 예산 적합성에 대한 전문가 리뷰"
      }
    `;

    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    let responseText = result.response.text();
    
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("JSON Parsing Failed. Raw:", responseText);
      throw new Error("AI 응답 형식이 올바르지 않습니다.");
    }

    if (data.error === "SECURITY_ALERT") return NextResponse.json({ error: data.message }, { status: 400 });

    if (data.parts && Array.isArray(data.parts)) {
        let newTotal = 0;
        data.parts = data.parts.map((part: any) => {
            let price = typeof part.price === 'string' ? parseInt(part.price.replace(/[^0-9]/g, ''), 10) : part.price;
            
            let cleanName = part.name
                .replace(/다나와|컴퓨존|최저가|특가|인기순위/g, '')
                .trim();

            return { 
                ...part, 
                name: cleanName,
                price: price,
                reason: part.reason 
            };
        });

        newTotal = data.parts.reduce((sum: number, part: any) => {
            let price = typeof part.price === 'string' ? parseInt(part.price.replace(/[^0-9]/g, ''), 10) : part.price;
            return sum + (price || 0);
        }, 0);
        data.total_price_estimate = newTotal;
    }

    if (type === 'initial') {
      await supabase.from('pc_estimates').insert({
        budget: safeBudget,
        usage: safeUsage,
        result: data,
        ip_address: ip 
      });
    }

    return NextResponse.json({ ...data, remaining });

  } catch (error: any) {
    console.error("Gemini PC Error:", error);
    return NextResponse.json({ error: "견적 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}