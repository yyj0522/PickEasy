import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/app/lib/rate-limit'; 
import { headers } from 'next/headers';
import { searchWeb } from '@/app/lib/search'; // ⭐ Serper 검색 적용

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown"; 
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "요청이 너무 많습니다." }, { status: 429 });
  }

  try {
    const { productA, productB, query } = await req.json(); 

    // 1. VS 비교 (두 제품 비교)
    if (productA && productB) {
        if (productA.trim().length < 2 || productB.trim().length < 2) {
            return NextResponse.json({ error: "제품명을 정확히 입력해주세요." }, { status: 400 });
        }

        // 실제 스펙과 가격을 검색
        const q = `${productA} vs ${productB} 스펙 성능 가격 비교 2026년`;
        const searchContext = await searchWeb(q);

        const systemPrompt = `
          당신은 IT 리뷰어입니다.
          아래 **[웹 검색 결과]**를 팩트 체크 자료로 활용하여, 두 제품(${productA} vs ${productB})을 냉정하게 비교하세요.
          
          ${searchContext}
          
          [필수 규칙]
          1. **팩트 우선:** 검색 결과에 있는 스펙(무게, 배터리, 패널 등)과 가격을 반영하세요.
          2. **오류 방지:** 서로 비교 불가능한 카테고리(예: 드라이기 vs 청소기)면 JSON 에러를 반환하세요.
          
          [출력 형식 - JSON Only]
          { 
            "productA_name": "...", 
            "specs": [ 
              { "category": "화면", "specA": "...", "specB": "...", "winner": "A" } 
            ], 
            "final_verdict": "..." 
          }
        `;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "비교 분석 시작" }
          ],
          response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");
        if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
        
        return NextResponse.json(result);
    } 
    
    // 2. 일반 검색 (퀴즈 결과가 아닌 직접 검색)
    if (query) {
        const q = `${query} 추천 2026년 가격`;
        const searchContext = await searchWeb(q);

        const systemPrompt = `
          당신은 쇼핑 큐레이터입니다.
          아래 **[검색 결과]**를 바탕으로 사용자 질문("${query}")에 맞는 제품 3개를 추천하세요.
          
          ${searchContext}
          
          [출력 형식 - JSON Only]
          { "analysis": "...", "recommendations": [...] }
        `;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: systemPrompt }],
          response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");
        return NextResponse.json(result);
    }

    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}