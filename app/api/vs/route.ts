import { NextResponse } from 'next/server';
import { model, cleanGeminiJson } from '@/lib/gemini';
import { checkDailyLimit } from '@/lib/rate-limit'; 
import { headers } from 'next/headers';

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
    const { productA, productB, query } = await req.json();
    const now = new Date();
    const today = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

    if (productA && productB) {
      if (productA.trim().length < 1 || productB.trim().length < 1) {
        return NextResponse.json({ error: "제품명을 입력해주세요." }, { status: 400 });
      }

      const prompt = `
        **${today}** 기준, 두 제품 '${productA}'와 '${productB}'를 비교 분석해주세요.
        Google 검색을 통해 **${today} 현재**의 최신 스펙과 가격을 확인하세요.

        [예외 처리]
        1. 두 제품이 서로 다른 카테고리라 비교가 불가능한 경우 (예: 노트북 vs 냉장고, 아이폰 vs 바나나),
           다음 JSON을 반환: { "error": "INCOMPARABLE", "message": "서로 다른 종류의 제품은 비교할 수 없습니다." }
        2. 존재하지 않는 제품명이거나 오타가 심한 경우,
           다음 JSON을 반환: { "error": "NOT_FOUND", "message": "제품 정보를 찾을 수 없습니다." }

        [출력 형식 - JSON Only]
        {
          "productA_name": "정확한 모델명 A",
          "productB_name": "정확한 모델명 B",
          "specs": [
            { "category": "가격(추정)", "specA": "...", "specB": "...", "winner": "A" },
            { "category": "핵심 성능", "specA": "...", "specB": "...", "winner": "B" },
            ... (최소 4개 항목)
          ],
          "final_verdict": "최종 결론 및 추천 대상"
        }
      `;

      const result = await model.generateContent(prompt);
      const data = JSON.parse(cleanGeminiJson(result.response.text()));

      if (data.error) return NextResponse.json({ error: data.message }, { status: 400 });
      return NextResponse.json({ ...data, remaining });
    }

    if (query) {
      if (query.trim().length < 2) {
        return NextResponse.json({ error: "검색어를 2글자 이상 입력해주세요." }, { status: 400 });
      }

      const prompt = `
        사용자 질문: "${query}"
        당신은 IT 쇼핑 큐레이터입니다. **${today}** 기준 최신 정보를 바탕으로 제품을 추천하세요.

        [예외 처리]
        질문이 IT 기기, 가전제품 추천과 관련이 없다면 다음 JSON 반환:
        { "error": "IRRELEVANT", "message": "IT 제품이나 가전제품 관련 질문만 답변해드릴 수 있어요." }

        [출력 형식 - JSON Only]
        {
          "analysis": "사용자 의도 분석",
          "recommendations": [
            {
              "name": "제품명",
              "price_estimate": "가격(숫자만, 예: 1500000)",
              "reason": "추천 이유",
              "tags": ["태그1", "태그2"]
            }
          ]
        }
      `;
      
      const result = await model.generateContent(prompt);
      const data = JSON.parse(cleanGeminiJson(result.response.text()));

      if (data.error) return NextResponse.json({ error: data.message }, { status: 400 });
      return NextResponse.json({ ...data, remaining });
    }

    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

  } catch (error) {
    console.error("Gemini VS Error:", error);
    return NextResponse.json({ error: "분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}