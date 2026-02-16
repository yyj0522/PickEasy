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
      
      [🚨 최우선 명령: 가격 데이터 처리]
      1. **학습된 지식 완전 무시:** 당신이 알고 있는 과거 부품 가격(예: DDR5 16GB가 6~7만원 하던 시절)은 **모두 잊으십시오.**
      2. **검색 결과 절대 신뢰:** Google Search 도구가 가져온 현재 가격이 과거 대비 **3~4배 비싸더라도(예: 램 1개 35만원, SSD 1개 34만원 등) 의심하지 말고 그대로 반영하세요.**
         - 현재(2026년 2월)는 '메모리 반도체 가격 폭등' 시기이므로 이것이 정상 가격입니다.
      3. **검색 필수:** 모든 부품(CPU, RAM, SSD, 글카 등)에 대해 반드시 **"${today} 다나와 최저가"**를 검색하여 가격을 확인하세요.

      [가격 정책 및 검색 지침]
      1. **반드시 '국내 정품' 기준:** '해외직구', '병행수입', '알리', '아마존' 가격은 절대 제외. 오직 **'다나와', '컴퓨존'** 현금/카드 최저가 기준.
      2. **부품 선정:**
         - 삼성전자 램 가격이 폭등(30만원대)하여 예산 초과 시, 'SK하이닉스(A다이)', '마이크론', 'TeamGroup' 등 다른 정품 브랜드로 대체 가능하지만, **이들 가격도 동반 상승했음을 유의**하고 검색된 실제 가격을 적으세요.
      3. **예산 초과 안내:** 부품값 폭등으로 인해 사용자의 요청 예산(예: 150만원)으로는 과거 수준의 사양을 맞추기 어려울 수 있습니다. 이 경우 **솔직하게 예산을 초과하여 견적을 내고, intro/review에 "현재 램/SSD 가격 폭등으로 인해 불가피하게 예산이 초과되었습니다"라고 명시**하세요. 억지로 싼 부품을 쓰지 마세요.

      [출력 데이터 정제 규칙 (Strict)]
      1. **제품명(name)에 쇼핑몰 이름 금지:** '다나와', '컴퓨존', '최저가' 등의 단어 절대 금지.
      2. **가격(price):** 검색된 **실제 1개 단가**를 정확히 적고, 수량이 2개라면 합산 가격이 아닌 **개별 단가**를 적거나, 합산했다면 reason에 명시하세요. (시스템상 **총합 계산은 total_price_estimate에서 수행**되므로 parts의 price는 '해당 부품 1세트(또는 갯수 포함) 가격'으로 적으세요.)
         - *권장:* parts의 price는 (단가 * 수량)의 **총액**으로 기입하세요. 예: 램 35만원짜리 2개면 price: 700000.

      ${SYSTEM_GUARD_PROMPT}

      [출력 형식 - JSON Only]
      **마크다운 없이 오직 JSON 문자열만 출력하세요.**
      {
        "intro": "견적 한줄 평 (현재 메모리/SSD 가격 폭등 상황 언급 필수)",
        "parts": [ 
          { "part": "CPU", "name": "AMD 라이젠5-5세대 7500F (라파엘)", "price": 220000, "reason": "가성비 게이밍 CPU 1위" },
          { "part": "메모리", "name": "SK하이닉스 DDR5-5600 (16GB) x 2개", "price": 700000, "reason": "현재 램값 폭등 반영 (개당 35만원)" }
        ],
        "total_price_estimate": 0,
        "review": "상세 리뷰"
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