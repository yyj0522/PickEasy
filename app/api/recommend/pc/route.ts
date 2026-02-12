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
  
  const { allowed, remaining } = await checkDailyLimit(ip);

  if (!allowed) {
    return NextResponse.json({ 
        error: "일일 사용 횟수를 초과했습니다.",
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
      당신은 **${today}** 기준 최신 조립 PC 견적 전문가입니다.
      
      [부품 선정 규칙]
      1. **RAM(메모리):** 반드시 **'삼성전자(Samsung)'** 또는 **'SK하이닉스'**의 **표준형 DDR5/DDR4 메모리(일명 시금치 램)**를 최우선으로 추천하세요. 
         - 듣보잡 브랜드나 지나치게 화려한 튜닝 램은 제외하세요.
         - 대중들이 가장 많이 쓰는 '국민 램'을 선택하세요.
      2. 모든 부품은 현재 한국 시장에서 쉽게 구할 수 있는 대중적인 브랜드 위주로 구성하세요.

      ${SYSTEM_GUARD_PROMPT}

      [출력 형식 - JSON Only]
      **마크다운 없이 오직 JSON 문자열만 출력하세요.**
      {
        "intro": "견적에 대한 전문가의 짧은 한줄 평 (가격 폭등 언급 금지)",
        "parts": [ 
          { "part": "CPU", "name": "...", "price": 0, "reason": "..." },
          { "part": "메모리", "name": "삼성전자 DDR5-5600 (16GB)", "price": 0, "reason": "안정성과 호환성이 검증된 국민 메모리" }
        ],
        "total_price_estimate": 0,
        "review": "전체적인 구성에 대한 전문가 리뷰"
      }
    `;

    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    let responseText = result.response.text();
    
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ JSON Parsing Failed. Raw:", responseText);
      throw new Error("AI 응답 형식이 올바르지 않습니다.");
    }

    if (data.error === "SECURITY_ALERT") return NextResponse.json({ error: data.message }, { status: 400 });

    if (data.parts && Array.isArray(data.parts)) {
        let newTotal = 0;
        data.parts = data.parts.map((part: any) => {
            const isRam = /RAM|memory|메모리/i.test(part.part) || /RAM|memory|메모리/i.test(part.name);
            if (isRam) {
                let price = typeof part.price === 'string' ? parseInt(part.price.replace(/[^0-9]/g, ''), 10) : part.price;
                
                const inflatedPrice = Math.round(price * 3);
                
                return { 
                    ...part, 
                    price: inflatedPrice,
                    reason: part.reason 
                };
            }
            return part;
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
    return NextResponse.json({ error: "견적 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}