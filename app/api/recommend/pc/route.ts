import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { model, cleanGeminiJson } from '@/lib/gemini';
import { checkDailyLimit } from '@/lib/rate-limit'; 
import { headers } from 'next/headers';

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
        error: "일일 사용 횟수를 초과했습니다. (하루 5회 제한)",
        limitReached: true
    }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { type, budget, usage, previousResult, refinementRequest } = body;
    

    if (type === 'initial') {
      const { data: cachedData } = await supabase
        .from('pc_estimates')
        .select('result')
        .eq('budget', budget)
        .eq('usage', usage)
        .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1)
        .single();

      if (cachedData) {
        console.log("💰 캐시 히트! API 비용 절약");
        return NextResponse.json({ ...cachedData.result, remaining });
      }
    }

    const now = new Date();
    const today = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

    let userPrompt = "";

    if (type === 'initial') {
      userPrompt = `사용자 요청: 예산 ${budget}만원대로 ${usage} 용도의 조립 PC 견적을 짜줘.`;
    } else if (type === 'refine') {
      userPrompt = `기존 견적: ${JSON.stringify(previousResult)}\n수정 요청: ${refinementRequest}`;
    } else {
      return NextResponse.json({ error: "입력 내용이 부족합니다." }, { status: 400 });
    }

    const systemPrompt = `
      당신은 **${today}** 기준 최신 IT 하드웨어 견적 전문가입니다.
      Google 검색 도구를 사용하여 **${today} 현재** 판매 중인 부품의 가격과 성능 정보를 바탕으로 답변하세요.

      [방어 기제]
      1. IT 관련이 아니면 다음 JSON만 반환: { "error": "IT_IRRELEVANT", "message": "죄송합니다. 저는 IT 제품 추천만 가능합니다." }
      
      [필수 규칙]
      1. **잡담 금지:** 인사말, 설명, 마크다운 헤더(##) 등을 일체 쓰지 마세요.
      2. **오직 순수한 JSON 데이터만 출력하세요.**
      3. 부품명은 풀네임, 가격은 숫자(KRW)로.

      [출력 형식 - JSON]
      {
        "intro": "...",
        "parts": [ 
          { "part": "CPU", "name": "...", "price": 0, "reason": "..." }
        ],
        "total_price_estimate": 1500000,
        "review": "..."
      }
    `;

    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const responseText = result.response.text();
    const jsonString = cleanGeminiJson(responseText); 
    
    let data;
    try {
      data = JSON.parse(jsonString);
    } catch (e) {
      console.error("JSON Parsing Failed. Raw text:", responseText);
      throw new Error("AI 응답을 분석하는 데 실패했습니다.");
    }

    if (data.error === "IT_IRRELEVANT") {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    if (type === 'initial') {
      await supabase.from('pc_estimates').insert({
        budget: budget,
        usage: usage,
        result: data,
        ip_address: ip 
      });
    }

    return NextResponse.json({ ...data, remaining });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "견적 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}