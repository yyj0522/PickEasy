import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/app/lib/rate-limit'; 
import { headers } from 'next/headers';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown"; 
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }, { status: 429 });
  }

  try {
    const { category, answers, query, type, previousResult, refinementRequest, budget, usage, preferences } = await req.json();

    if (query && query.trim().length < 2) {
      return NextResponse.json({ error: "질문이 너무 짧습니다. 구체적으로 알려주세요." }, { status: 400 });
    }
    if (refinementRequest && refinementRequest.trim().length < 2) {
      return NextResponse.json({ error: "수정 요청 내용이 너무 짧습니다." }, { status: 400 });
    }

    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    const marketContext = `
      [현재 시장 상황: 2026년 2월]
      1. **메모리(RAM)/SSD 가격 폭등:** 반도체 수급 이슈로 인해 작년 대비 가격이 2~3배 상승했습니다. (예: DDR5 16GB 기준 10만원 중반대 형성)
      2. **환율 영향:** 고환율로 인해 수입 부품(CPU, GPU) 가격이 전체적으로 높게 형성되어 있습니다.
      3. **최신 부품:** 인텔 15세대(Arrow Lake), AMD 라이젠 9000 시리즈, RTX 50 시리즈가 주력 현역 모델입니다.
      ⚠️ 중요: 견적 산출 시 위 '폭등한 가격'을 반드시 반영하여 예산 초과 여부를 엄격히 판단하세요.
    `;

    let systemPrompt = "";
    let userContent = "";

    if (type === 'refine') {
      systemPrompt = `
        당신은 대한민국 용산 전자상가의 20년 경력 PC 견적 전문가입니다.
        오늘은 **${today}** 입니다.
        
        ${marketContext}

        [임무]
        사용자의 수정 요청을 반영하여 견적을 다시 짜주세요.
        단, 수정 요청이 PC 견적과 전혀 관련 없는 내용(예: "점심 메뉴 추천해줘", "노래 불러줘")이거나, 
        비속어/무의미한 문자열이라면 **반드시** JSON의 error 필드에 사유를 넣어 반환하세요.

        [출력 형식 - JSON Only]
        성공 시: { "summary": "...", "parts": [...] } (기존 포맷 유지)
        실패 시: { "error": "PC 견적과 관련 없는 요청입니다." }
      `;
      userContent = `
        [기존 견적]: ${JSON.stringify(previousResult)}
        [수정 요청]: "${refinementRequest}"
      `;
    } 
    else if (type === 'initial') {
      systemPrompt = `
        당신은 깐깐한 PC 하드웨어 분석가입니다.
        오늘은 **${today}** 입니다.

        ${marketContext}

        사용자의 예산(${budget}), 용도(${usage}), 요청사항(${preferences})을 분석해 최적의 견적을 만드세요.
        
        [필수 검증]
        예산이나 용도에 비속어가 있거나, "아무거나", "ㅁㄴㅇㄹ" 같은 무의미한 입력이 들어오면 거절하세요.

        [출력 형식 - JSON Only]
        성공 시: { "summary": "...", "parts": [...] }
        실패 시: { "error": "유효하지 않은 요청입니다. 예산과 용도를 정확히 입력해주세요." }
      `;
      userContent = "최적의 데스크탑 조립 견적을 짜주세요.";
    }
    else {
      if (query) {
        userContent = `사용자 질문: "${query}"`;
        systemPrompt = `
          당신은 IT/가전 쇼핑 큐레이터입니다.
          오늘은 **${today}** 입니다.
          
          ${marketContext}

          사용자의 질문을 분석하여 카테고리를 판단하고 제품을 추천하세요.

          [치명적 오류 방지 & 비용 최적화]
          1. 질문이 IT/가전 제품 추천과 관련이 없다면(예: 연애상담, 주식추천, 날씨), 즉시 거절 응답을 보내세요.
          2. 질문이 너무 모호해서 판단이 불가능하면 거절하세요.

          [출력 형식 - JSON Only]
          성공 시: { "analysis": "...", "recommendations": [...] }
          실패/거절 시: { "error": "IT 가전 제품 추천과 관련된 질문만 답변 가능합니다." }
        `;
      } else {
        userContent = `사용자 선택 답변: ${JSON.stringify(answers)}`;
        systemPrompt = `
          사용자가 선택한 카테고리 [${category}]에 맞춰 2026년 최신 제품 3개를 추천하세요.
          ${marketContext}
          가격은 반드시 현재 시세(폭등 반영)를 기준으로 작성하세요.
        `;
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, 
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('OpenAI Error:', error);
    return NextResponse.json({ error: 'AI 분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}