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
    const { productA, productB } = await req.json();

    if (!productA || !productB) {
      return NextResponse.json({ error: "두 제품의 이름을 모두 입력해주세요." }, { status: 400 });
    }

    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    const systemPrompt = `
      당신은 IT 테크 전문 리뷰어입니다.
      현재 날짜는 **${today}** 입니다.

      사용자가 입력한 두 제품(${productA} vs ${productB})을 비교 분석하여 냉정한 승부를 가려주세요.

      [분석 가이드]
      1. **최신성:** 두 제품의 출시일을 고려하여, 현재 시점에서 구형 모델인지 현역 모델인지 판단하여 평가에 반영하세요.
      2. **핵심 스펙:** 단순 수치 나열이 아니라, 실사용 체감 성능 위주로 비교하세요. (예: "60Hz vs 120Hz" -> "부드러움의 차이가 큼")
      3. **구체성:** 스펙 수치(무게, 배터리 등)는 최대한 정확한 숫자를 기재하세요.

      [출력 형식 - JSON Only]
      {
        "productA_name": "제품 A 풀네임",
        "productB_name": "제품 B 풀네임",
        "specs": [
          {
            "category": "항목명",
            "specA": "A의 스펙 (구체적 수치)",
            "specB": "B의 스펙 (구체적 수치)",
            "winner": "A" | "B" | "Tie"
          },
          ... (6~8개 항목)
        ],
        "final_verdict": "최종 결론 (승자 및 추천 대상 요약)"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `"${productA}" 와 "${productB}" 비교해줘.` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4, 
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);

  } catch (error) {
    console.error('OpenAI Error:', error);
    return NextResponse.json(
      { error: '비교 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}