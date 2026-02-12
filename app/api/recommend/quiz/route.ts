import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { checkDailyLimit } from '@/lib/rate-limit'; 
import { headers } from 'next/headers';
import { verifyTurnstileToken, validateInput, SYSTEM_GUARD_PROMPT } from '@/lib/security';

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
    const { category, answers, query, turnstileToken } = body;

    const isHuman = await verifyTurnstileToken(turnstileToken);
    if (!isHuman) {
      return NextResponse.json({ error: "보안 검증에 실패했습니다." }, { status: 403 });
    }

    const now = new Date();
    const today = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

    let prompt = "";

    if (query) {
       const safeQuery = validateInput(query);
       prompt = `
        사용자 입력: "${safeQuery}"
        당신은 **${today}** 기준 IT 쇼핑 큐레이터입니다.
        
        ${SYSTEM_GUARD_PROMPT}

        [판단 및 행동]
        - IT/가전 관련 질문이면: 인기 제품 3가지를 JSON으로 추천.
        - 관련 없으면: { "error": "IRRELEVANT", "message": "IT 기기 질문만 받습니다." } 반환.

        [출력 형식 - JSON Only]
        **마크다운 없이 오직 JSON 문자열만 출력하세요.**
        {
          "analysis": "의도 분석",
          "recommendations": [
            { "name": "모델명", "price_estimate": "가격(숫자)", "reason": "이유", "tags": ["태그"] }
          ]
        }
       `;
    } else if (category && answers) {
       const safeCategory = validateInput(category);
       prompt = `
        당신은 **${today}** 기준 '${safeCategory}' 전문 MD입니다.
        사용자 답변: ${JSON.stringify(answers)}
        
        ${SYSTEM_GUARD_PROMPT}

        [수행 작업]
        - 사용자 성향 분석 후 최신 제품 3개 추천.
        
        [출력 형식 - JSON Only]
        **마크다운 없이 오직 JSON 문자열만 출력하세요.**
        {
          "analysis": "분석 요약",
          "recommendations": [
            { "name": "모델명", "price_estimate": "가격(숫자)", "reason": "이유", "tags": ["태그"] }
          ]
        }
      `;
    } else {
      return NextResponse.json({ error: "데이터가 부족합니다." }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    console.log("🔍 [Quiz Raw AI Output]:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ JSON Parsing Failed. Raw:", responseText);
      return NextResponse.json({ error: "AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요." }, { status: 500 });
    }

    if (data.error === "IRRELEVANT" || data.error === "SECURITY_ALERT") {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json({ ...data, remaining });

  } catch (error: any) {
    console.error("Gemini Quiz Error:", error);
    return NextResponse.json({ error: "서버 내부 오류가 발생했습니다." }, { status: 500 });
  }
}