import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { checkRateLimit } from '@/app/lib/rate-limit'; 
import { headers } from 'next/headers';
import { searchWeb } from '@/app/lib/search'; // ⭐

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown"; 
  if (!checkRateLimit(ip)) return NextResponse.json({ error: "요청 과다" }, { status: 429 });

  try {
    const body = await req.json();
    const { category, query, type, budget, usage, previousResult, refinementRequest } = body;

    if ((query && query.trim().length < 2) || (usage && usage.trim().length < 2)) {
      return NextResponse.json({ error: "내용을 더 자세히 적어주세요." }, { status: 400 });
    }

    // 1. 검색 쿼리 생성
    let searchQuery = "";
    if (type === 'initial') searchQuery = `${budget} ${usage} 조립컴퓨터 견적 추천 2026년`;
    else if (type === 'refine') searchQuery = `${refinementRequest} 관련 PC 부품 추천`;
    else if (query) searchQuery = `${query} 추천 가격`;
    else if (category) searchQuery = `2026년 ${category} 추천 가성비`;
    
    if (searchQuery.includes('드라이기')) searchQuery += " 헤어드라이기 -의류 -건조기";

    // 2. 검색 수행
    const searchContext = await searchWeb(searchQuery);

    const systemPrompt = `
      당신은 IT 전문가입니다.
      아래 **[실시간 웹 검색 결과]**를 바탕으로 답변하세요. 상상하지 말고 검색된 정보를 참고하세요.
      
      ${searchContext}
      
      [규칙]
      1. '드라이기'는 **헤어드라이기**입니다.
      2. 검색 결과에 없는 가짜 제품을 만들지 마세요.
      3. 관련 없는 질문은 거절하세요.

      [출력 - JSON Only]
      (기존 포맷 유지)
    `;
    
    // (기존 userContent 로직 유지)
    let userContent = "";
    if (type === 'initial') userContent = `예산:${budget}, 용도:${usage}`;
    else if (type === 'refine') userContent = `기존:${JSON.stringify(previousResult)}, 수정:${refinementRequest}`;
    else if (query) userContent = query;
    else userContent = `카테고리:${category}`;

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
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json({ error: 'AI Error' }, { status: 500 });
  }
}