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
    const { productA, productB, query, category, answers } = body; 

    // 1. VS 비교 요청 처리
    if (productA && productB) {
        if (productA.trim().length < 2 || productB.trim().length < 2) {
            return NextResponse.json({ error: "제품명을 정확히 입력해주세요." }, { status: 400 });
        }

        const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

        const systemPrompt = `
          당신은 독설가 IT 리뷰어입니다. 오늘은 **${today}** 입니다.
          사용자가 요청한 두 제품(${productA} vs ${productB})을 2026년 기준 시세와 성능으로 비교하세요.
          
          [출력 형식 - JSON Only]
          성공: { "productA_name": "...", "productB_name": "...", "specs": [...], "final_verdict": "..." }
          실패: { "error": "비교할 수 없는 제품입니다." }
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
        if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
        return NextResponse.json(result);
    } 
    
    // 2. 통합 검색 요청 처리 (홈 화면 검색) - ⭐ 이곳이 비어있어서 에러가 났었습니다.
    if (query) {
        const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
        
        const systemPrompt = `
          당신은 IT/가전 쇼핑 큐레이터입니다. 오늘 날짜: ${today}
          사용자의 질문("${query}")을 분석하여 가장 적합한 제품 3개를 추천하세요.
          
          [가격 기준]
          2026년 현재 물가(반도체 가격 상승 등)를 반영하여 원화(KRW)로 예상 가격을 책정하세요.

          [출력 형식 - JSON Only]
          {
            "analysis": "질문 분석 및 추천 전략 요약 (한 줄)",
            "recommendations": [
              {
                "name": "제품명",
                "price_estimate": "1500000",
                "reason": "추천 이유",
                "tags": ["가성비", "고성능"]
              }
            ]
          }
        `;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query }
          ],
          response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");
        return NextResponse.json(result);
    }

    // 3. 퀴즈 기반 추천 처리
    if (category && answers) {
        const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
        
        const systemPrompt = `
          당신은 맞춤형 IT 제품 추천 AI입니다.
          사용자의 카테고리(${category})와 응답(${JSON.stringify(answers)})을 분석하여 최적의 제품 3개를 추천하세요.
          
          [출력 형식 - JSON Only]
          {
            "analysis": "사용자 성향 분석 요약",
            "recommendations": [
              {
                "name": "제품명",
                "price_estimate": "가격(숫자만)",
                "reason": "추천 이유",
                "tags": ["태그1", "태그2"]
              }
            ]
          }
        `;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "추천해줘" }
          ],
          response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");
        return NextResponse.json(result);
    }

    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  } catch (error) {
    console.error('OpenAI Error:', error);
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}