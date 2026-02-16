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
         - **'해외직구', '병행수입', '알리익스프레스', '아마존' 가격은 절대 제외**하십시오.
         - 오직 **'다나와(Danawa)', '컴퓨존'** 등 한국 주요 쇼핑몰의 현금 최저가/카드 최저가 평균을 기준으로 삼으세요.
      
      2. **현재(2026년 2월) 부품 가격 폭등 이슈 반영:**
         - 특히 **삼성전자 DDR5 메모리 가격이 비정상적으로 폭등(16GB 1개당 약 30~35만원)**한 상태임을 인지하고 검색하세요.
         - 16GB 2개(32GB) 구성 시 램 가격만 60~70만원이 나올 수 있음을 유의하고, 예산이 초과되면 다른 브랜드(SK하이닉스, 마이크론 등)의 가성비 제품으로 대체하거나 사용자에게 이를 알리세요.
         - 그래픽카드(RTX 50 시리즈 등) 가격도 출시 초기 프리미엄을 반영하세요.

      3. **검색 수행 방법:**
         - 각 부품별로 반드시 구체적인 검색 쿼리를 실행하세요. (예: "삼성전자 DDR5-5600 16GB 다나와 최저가", "RTX 4060 Ti 국내 정품 가격")
         - 검색 결과에서 "해외배송"이 아닌지 더블 체크하세요.

      [부품 선정 규칙]
      1. **RAM(메모리):** 삼성전자 램 가격이 너무 비쌀 경우, **'SK하이닉스 A다이'** 언락 제품이나 **'TeamGroup', '마이크론'** 등 신뢰할 수 있는 브랜드의 표준 메모리(JEDEC)를 우선 고려하세요. (무조건 삼성만 고집하지 마세요)
      2. **파워/쿨러:** 뻥파워 절대 금지. 검증된 브랜드(마이크로닉스, 시소닉, FSP 등) 사용.

      ${SYSTEM_GUARD_PROMPT}

      [출력 형식 - JSON Only]
      **마크다운 없이 오직 JSON 문자열만 출력하세요.**
      {
        "intro": "견적에 대한 전문가의 짧은 한줄 평 (현재 램값 폭등 상황 언급 권장)",
        "parts": [ 
          { "part": "CPU", "name": "제품명", "price": 350000, "reason": "선정 이유" },
          { "part": "메모리", "name": "SK하이닉스 DDR5-5600 (16GB) x 2개", "price": 400000, "reason": "삼성 램 가격 폭등으로 인한 합리적 대안 선정" }
        ],
        "total_price_estimate": 0,
        "review": "전체적인 구성 및 현재 시장 상황(부품가 상승)에 대한 전문가 리뷰"
      }
      **주의: price는 반드시 '숫자(원 단위)'로 출력하고, 2개 이상 사용 시 합산 가격을 적으세요.**
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
            
            return { 
                ...part, 
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