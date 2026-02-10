import { NextResponse } from 'next/server';
import { model, cleanGeminiJson } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rate-limit'; 
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown"; 
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "요청이 너무 많습니다." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { category, answers, query } = body;

    const now = new Date();
    const today = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

    if (query) {
       const prompt = `
        사용자 입력: "${query}"
        
        당신은 **${today}** 기준 IT 기기 및 가전제품 전문 쇼핑 큐레이터입니다.
        사용자의 입력이 IT 기기, 가전제품, 혹은 관련 액세서리 구매/추천과 관련이 있는지 엄격하게 판단하세요.

        [판단 기준]
        1. IT/가전/전자제품 추천, 스펙 질문, 비교 등은 '관련 있음'으로 판단.
        2. 음식, 패션(의류), 정치, 연예, 단순 잡담, 욕설, 무의미한 문자열(ㅋㅋㅋ, asdf 등)은 '관련 없음'으로 판단.

        [행동 지침]
        - 만약 '관련 없음'으로 판단되면: 
          JSON에 { "error": "IRRELEVANT", "message": "죄송합니다. 저는 IT 기기와 가전제품 추천에만 도움을 드릴 수 있습니다." } 를 반환하세요.
        
        - 만약 '관련 있음'으로 판단되면:
          Google 검색을 통해 **${today} 현재** 판매 중인 최신 인기 제품 3가지를 선정하여 아래 JSON 형식으로 추천하세요.

        [출력 형식 - JSON Only]
        {
          "analysis": "사용자 질문 의도 분석 (한 줄 요약)",
          "recommendations": [
            {
              "name": "브랜드 + 정확한 모델명 (풀네임)",
              "price_estimate": "현재 최저가(숫자만, 예: 1450000)",
              "reason": "추천 이유 및 특징",
              "tags": ["키워드1", "키워드2"]
            }
          ]
        }
       `;
       
       const result = await model.generateContent(prompt);
       const responseText = result.response.text();
       const data = JSON.parse(cleanGeminiJson(responseText));
       
       if (data.error === "IRRELEVANT") {
         return NextResponse.json({ error: data.message }, { status: 400 });
       }

       return NextResponse.json(data);
    }

    if (!category || !answers) {
      return NextResponse.json({ error: "데이터가 부족합니다." }, { status: 400 });
    }

    const prompt = `
      당신은 **${today}** 기준, '${category}' 분야의 최고 전문가(MD)입니다.
      사용자가 작성한 다음 설문 답변을 깊이 있게 분석하세요.
      
      [사용자 답변 데이터]
      ${JSON.stringify(answers)}

      [수행 작업]
      1. 사용자의 성향(가성비 vs 하이엔드, 디자인 vs 성능 등)을 파악하세요.
      2. Google 검색 도구를 사용하여 **${today} 현재** 시장에서 가장 호평받는 제품 3개를 선정하세요.
      3. 단종된 모델은 제외하고, 지금 구매 가능한 최신 모델 위주로 추천하세요.

      [방어 기제]
      - 질문과 관련 없는 이상한 요청이 감지되면 정중히 거절하는 메시지를 analysis에 담으세요.

      [출력 형식 - JSON Only]
      {
        "analysis": "사용자 분석 요약",
        "recommendations": [
          {
            "name": "브랜드 + 정확한 모델명 (풀네임)",
            "price_estimate": "현재 최저가(숫자만, 예: 1450000)",
            "reason": "이 사용자에게 이 제품이 딱 맞는 구체적인 기술적 이유",
            "tags": ["가벼움", "배터리강패", "가성비"]
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const data = JSON.parse(cleanGeminiJson(result.response.text()));

    return NextResponse.json(data);

  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return NextResponse.json({ error: "추천 결과를 생성하지 못했습니다." }, { status: 500 });
  }
}