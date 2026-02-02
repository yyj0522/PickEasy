import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/app/lib/rate-limit'; 
import { headers } from 'next/headers';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown"; 
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const { category, answers, query } = await req.json();

    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    let userContent = "";
    let systemInstruction = "";

    if (query) {
      userContent = `사용자 질문: "${query}"`;
      systemInstruction = `
        사용자가 입력한 자유 질문("${query}")을 분석하여 **단 하나의 명확한 제품 카테고리**를 먼저 확정하고,
        그 카테고리에 속하는 **최신(2024~2026년) 인기 제품 3가지**를 추천하세요.
        
        [🚨 카테고리 판단 절대 규칙]
        1. **"PC", "컴퓨터", "본체", "데스크탑", "조립컴"** 등의 단어가 포함되면 무조건 **'데스크탑(Desktop)'** 부품 조립식 혹은 완본체를 추천하세요. 
           -> **절대 노트북을 추천하지 마십시오.**
        2. **"노트북", "랩탑", "맥북", "이동식"** 등의 단어는 **'노트북(Laptop)'**으로 분류하세요.
        3. 질문이 모호할 경우(예: "게임용 기계"), 가장 일반적인 데스크탑 PC를 기준으로 하되, 사용자의 이동성 니즈가 보이면 노트북으로 전환하세요.
        4. 청소기, 안마기 등 다른 가전도 명확히 구분하여 요청된 카테고리 내에서만 추천하세요.
      `;
    } 
    else {
      userContent = `사용자 선택 답변: ${JSON.stringify(answers)}`;
      systemInstruction = `
        사용자가 선택한 카테고리 [${category}]에 맞춰 답변을 분석하고,
        해당 카테고리 내에서 현재 한국 시장에서 구매 가능한 'TOP 3 제품'을 선정하세요.
        **절대 다른 카테고리의 제품을 추천하지 마십시오.** (예: 노트북 카테고리 선택 시 데스크탑 추천 금지)
      `;
    }

    const systemPrompt = `
      당신은 대한민국 최고의 IT/가전 제품 큐레이션 전문가입니다.
      
      [현재 시점 정보]
      - 오늘은 **${today}** 입니다.
      - 추천 시 **2024년, 2025년, 2026년에 출시된 최신 모델**을 최우선으로 고려하세요.
      - 2023년 이전 모델이나 단종된 제품은 가성비가 극도로 좋지 않은 이상 추천에서 배제하세요.

      ${systemInstruction}

      [공통 작성 규칙]
      1. 제품명: 정확한 한국 정발 모델명을 풀네임으로 기재할 것 (세대/연식 포함).
      2. 가격: 현재 시점의 한국 최저가 근사치(원화)를 숫자만 기재.
      3. 이유: 사용자의 질문/답변 내용(용도, 예산 등)과 제품의 스펙을 직접 연결하여 설득력 있게 작성할 것.

      [출력 형식 - JSON Only]
      {
        "analysis": "사용자 의도 파악 및 카테고리 확정 요약 (예: '200만원대 고성능 게이밍 데스크탑을 찾으시는군요.')",
        "recommendations": [
          {
            "rank": 1,
            "name": "브랜드 + 정확한 제품명 (연식)",
            "price_estimate": "가격(숫자만)",
            "reason": "추천 이유",
            "tags": ["#특징1", "#특징2"]
          },
          ... (2위, 3위)
        ]
      }
    `;

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
    return NextResponse.json(result);

  } catch (error) {
    console.error('OpenAI Error:', error);
    return NextResponse.json({ error: 'AI Error' }, { status: 500 });
  }
}