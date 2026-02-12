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
        
        당신은 **${today}** 기준 IT 기기 및 가전제품 전문 쇼핑 큐레이터입니다.
        사용자의 입력이 IT 기기, 가전제품, 혹은 관련 액세서리 구매/추천과 관련이 있는지 엄격하게 판단하세요.

        ${SYSTEM_GUARD_PROMPT}

        [판단 기준]
        1. IT/가전/전자제품 추천, 스펙 질문, 비교 등은 '관련 있음'으로 판단.
        2. 음식, 패션, 정치, 연예, 단순 잡담 등은 '관련 없음'으로 판단.

        [행동 지침]
        - 관련 없음: JSON에 { "error": "IRRELEVANT", "message": "죄송합니다. 저는 IT 기기와 가전제품 추천에만 도움을 드릴 수 있습니다." } 반환.
        - 관련 있음: Google 검색을 통해 **${today} 현재** 판매 중인 최신 인기 제품 3가지를 선정하여 추천.

        [출력 형식 - JSON Only]
        **마크다운 없이 오직 순수한 JSON 문자열만 출력하세요.**
        {
          "analysis": "사용자 질문 의도 분석 (한 줄 요약)",
          "recommendations": [
            {
              "name": "브랜드 + 정확한 모델명 (풀네임)",
              "price_estimate": "약 00만원",
              "reason": "추천 이유 및 특징 (간결하게)",
              "tags": ["키워드1", "키워드2"]
            }
          ]
        }
       `;
    } else if (category && answers) {
       const safeCategory = validateInput(category);
       prompt = `
        당신은 **${today}** 기준, '${safeCategory}' 분야의 최고 전문가(MD)입니다.
        사용자가 작성한 다음 설문 답변을 깊이 있게 분석하세요.
        
        ${SYSTEM_GUARD_PROMPT}

        [사용자 답변 데이터]
        ${JSON.stringify(answers)}

        [수행 작업]
        1. 사용자 성향 및 **예산 범위**를 정확히 파악하세요.
        2. **반드시 사용자가 선택한 예산 범위 내에 들어오는 제품만 선정하세요.**
        3. Google 검색을 통해 **${today} 현재** 시장에서 가장 호평받는 제품 3개 선정.
        4. 단종된 모델은 제외하고, 지금 구매 가능한 최신 모델 위주로 추천하세요.
        
        [출력 시 주의사항]
        - 가격은 "최저가 약 200만원 이하원" 같이 애매하게 쓰지 말고, "**약 185만원**" 처럼 구체적인 숫자를 명시하세요.

        [출력 형식 - JSON Only]
        **마크다운 없이 오직 순수한 JSON 문자열만 출력하세요.**
        {
          "analysis": "사용자 분석 요약",
          "recommendations": [
            {
              "name": "브랜드 + 정확한 모델명 (풀네임)",
              "price_estimate": "약 00만원",
              "reason": "이 사용자에게 딱 맞는 이유",
              "tags": ["특징1", "특징2"]
            }
          ]
        }
      `;
    } else {
      return NextResponse.json({ error: "데이터가 부족합니다." }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("JSON Parsing Failed. Raw:", responseText);
      return NextResponse.json({ error: "AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요." }, { status: 500 });
    }

    if (data.error === "IRRELEVANT" || data.error === "SECURITY_ALERT") {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json({ ...data, remaining });

  } catch (error: any) {
    console.error("Gemini Quiz Error:", error);
    return NextResponse.json({ error: "일시적인 AI 오류입니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
}