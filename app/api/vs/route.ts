import { NextResponse } from 'next/server';
import { modelNoSearch } from '@/lib/gemini';
import { checkDailyLimit } from '@/lib/rate-limit'; 
import { headers } from 'next/headers';
import { verifyTurnstileToken, validateInput, SYSTEM_GUARD_PROMPT } from '@/lib/security';

export async function POST(req: Request) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown"; 
  
  const { allowed, remaining } = await checkDailyLimit(ip, 'vs');

  if (!allowed) {
    return NextResponse.json({ 
      error: "일일 비교 횟수(5회)를 초과했습니다.",
      limitReached: true 
    }, { status: 429 });
  }

  try {
    const { productA, productB, turnstileToken } = await req.json();
    
    const isHuman = await verifyTurnstileToken(turnstileToken);
    if (!isHuman) {
      return NextResponse.json({ error: "보안 검증에 실패했습니다." }, { status: 403 });
    }

    const now = new Date();
    const today = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

    if (!productA || !productB) {
       return NextResponse.json({ error: "제품명을 입력해주세요." }, { status: 400 });
    }

    const safeA = validateInput(productA);
    const safeB = validateInput(productB);

    const prompt = `
      **${today}** 기준, '${safeA}'와 '${safeB}'를 비교 분석해주세요.
      
      ${SYSTEM_GUARD_PROMPT}

      [예외 처리]
      - 비교 불가: { "error": "INCOMPARABLE", "message": "비교할 수 없는 제품입니다." }
      - 정보 없음: { "error": "NOT_FOUND", "message": "제품 정보를 찾을 수 없습니다." }

      [출력 형식 - JSON Only]
      **절대 마크다운 코드 블록(\`\`\`json)을 사용하지 마세요. 오직 순수한 JSON 문자열만 출력하세요.**
      {
        "productA_name": "모델명A (풀네임)",
        "productB_name": "모델명B (풀네임)",
        "specs": [
          { "category": "가격(약)", "specA": "00만원", "specB": "00만원", "winner": "A" },
          { "category": "CPU/성능", "specA": "...", "specB": "...", "winner": "B" },
          { "category": "디스플레이/크기", "specA": "...", "specB": "...", "winner": "Draw" },
          { "category": "무게/휴대성", "specA": "...", "specB": "...", "winner": "A" }
        ],
        "final_verdict": "최종 결론 한 줄 요약"
      }
    `;

    const result = await modelNoSearch.generateContent(prompt);
    let responseText = result.response.text();
    
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    console.log("🔍 [VS Raw AI Output]:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ JSON Parsing Failed. Raw:", responseText);
      return NextResponse.json({ error: "AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요." }, { status: 500 });
    }

    if (data.error) return NextResponse.json({ error: data.message }, { status: 400 });
    return NextResponse.json({ ...data, remaining });

  } catch (error) {
    console.error("Gemini VS Error:", error);
    return NextResponse.json({ error: "분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}