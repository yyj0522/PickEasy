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
    const { productA, productB, query } = await req.json(); 
    // query는 통합 검색용, productA/B는 VS 페이지용

    // 1. VS 비교 요청 처리
    if (productA && productB) {
        if (productA.trim().length < 2 || productB.trim().length < 2) {
            return NextResponse.json({ error: "제품명을 정확히 입력해주세요." }, { status: 400 });
        }

        const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

        const systemPrompt = `
          당신은 독설가 IT 리뷰어입니다. 오늘은 **${today}** 입니다.
          
          사용자가 요청한 두 제품(${productA} vs ${productB})을 2026년 기준 시세와 성능으로 비교하세요.
          
          [비용 최적화 가이드]
          1. 두 제품이 서로 비교 불가능한 카테고리(예: 노트북 vs 선풍기)라면, JSON의 error 필드에 이유를 적어 반환하세요.
          2. 존재하지 않는 제품명이거나 무의미한 문자열이라면 error를 반환하세요.
          
          [가격 기준]
          현재 2026년은 반도체 가격 폭등 시기입니다. 출시가 대비 가격이 올랐음을 감안하여 가성비를 평가하세요.

          [출력 형식 - JSON Only]
          성공: { "productA_name": "...", "specs": [...], "final_verdict": "..." }
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
    
    // 2. 퀴즈/검색 요청 처리 (Quiz)
    if (query) {
        // ... (기존 퀴즈 검색 로직도 유사하게 Guardrails 적용 가능)
        // 이번 수정 범위에서는 VS와 PC견적 위주로 강화했으므로 생략하거나 기존 로직 유지
    }

    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  } catch (error) {
    console.error('OpenAI Error:', error);
    return NextResponse.json(
      { error: '비교 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}