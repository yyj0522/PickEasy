import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/app/lib/rate-limit';
import { headers } from 'next/headers';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { type, budget, usage, preferences, previousResult, refinementRequest } = body;

    if (JSON.stringify(body).length > 2000) {
      return NextResponse.json({ error: "입력 내용이 너무 깁니다." }, { status: 400 });
    }

    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    const commonConstraints = `
      [치명적 오류 방지 및 강제 규칙]
      1. **절대 노트북(Laptop)을 추천하지 마세요.** 사용자가 'PC'라고 말해도 이는 '데스크탑 본체'를 의미합니다.
      2. 완제품 PC(예: 삼성 매직스테이션) 모델명을 출력하지 말고, **반드시 개별 조립 부품(Component)**을 선정하세요.
      3. 결과는 무조건 [CPU, 메인보드, 메모리, 그래픽카드, SSD, 케이스, 파워] 7가지 부품으로 구성되어야 합니다.
      4. 부품명은 한국 다나와/쇼핑몰에서 검색 가능한 **정확한 풀네임**이어야 합니다.
      5. 가격은 현재 한국 시장의 최저가 근사치(원화 숫자만)로 작성하세요.
    `;

    let systemPrompt = "";
    let userPrompt = "";

    if (type === 'refine') {
      systemPrompt = `
        당신은 대한민국 최고의 조립 PC 하드웨어 전문가입니다.
        현재 날짜는 **${today}** 입니다.

        사용자가 기존 조립 PC 견적에서 수정을 요청했습니다.
        기존 부품 리스트를 바탕으로, 요청 사항(${refinementRequest})을 반영하여 **데스크탑 부품 구성**을 수정하세요.
        
        ${commonConstraints}

        [수정 가이드]
        1. 요청과 무관한 부품은 가급적 유지하되, 호환성이 깨진다면(예: CPU 변경 시 메인보드 변경) 반드시 함께 수정하세요.
        2. 부품은 단종된 구형이 아닌, 현재 시장에서 구매 가능한 최신 부품(2024~2026년 주력)으로 구성하세요.
        3. 출력 형식은 처음과 동일한 JSON 포맷이어야 합니다.
        4. summary에는 무엇을 변경했는지, 왜 변경했는지 구체적으로 설명하세요.
      `;
      userPrompt = `
        [기존 견적]: ${JSON.stringify(previousResult)}
        [수정 요청]: "${refinementRequest}"
        위 내용을 반영해 다시 JSON으로 출력해줘. 노트북 절대 금지.
      `;
    } else {
      systemPrompt = `
        당신은 20년 경력의 조립 PC 전문 견적가입니다.
        현재 날짜는 **${today}** 입니다.

        사용자의 예산(${budget}), 용도(${usage}), 선호사항(${preferences})에 맞춰 
        현재 시점에서 구매 가능한 **최신 데스크탑 조립 부품**들로 최적의 견적을 제안하세요.

        ${commonConstraints}

        [부품 선정 원칙]
        1. **최신성:** CPU/GPU는 최신 세대(인텔 13/14세대, 라이젠 7000/8000/9000번대, RTX 40 시리즈 등)를 최우선으로 고려하세요.
        2. **호환성:** 메인보드 소켓(LGA1700/AM5), 램 규격(DDR4/5), 파워 용량, 케이스 크기 등을 완벽히 검증하세요.
        3. **밸런스:** 예산 내에서 CPU와 그래픽카드의 성능 병목이 없도록 구성하세요.
        
        [출력 형식 - JSON Only]
        {
          "summary": "견적 요약 및 선정 이유 (한 줄)",
          "parts": [
            { "type": "CPU", "name": "제품명", "price_estimate": 0, "reason": "이유" },
            { "type": "메인보드", "name": "제품명", "price_estimate": 0, "reason": "..." },
            { "type": "메모리", "name": "제품명", "price_estimate": 0, "reason": "..." },
            { "type": "그래픽카드", "name": "제품명", "price_estimate": 0, "reason": "..." },
            { "type": "SSD", "name": "제품명", "price_estimate": 0, "reason": "..." },
            { "type": "케이스", "name": "제품명", "price_estimate": 0, "reason": "..." },
            { "type": "파워", "name": "제품명", "price_estimate": 0, "reason": "..." }
          ]
        }
      `;
      userPrompt = "최적의 데스크탑 조립 견적을 짜주세요.";
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);

  } catch (error) {
    console.error('OpenAI Error:', error);
    return NextResponse.json(
      { error: 'AI 서버 통신 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}