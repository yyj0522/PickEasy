import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { searchWeb } from '@/app/lib/search'; // ⭐

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { secret, keyword } = await req.json();

    if (secret !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. 검색
    let q = `${keyword} 가격 스펙 최저가`;
    if (keyword.includes('드라이기')) q += " 헤어드라이기";
    
    const searchContext = await searchWeb(q);

    // 2. AI 생성
    const systemPrompt = `
      MD 모드. 키워드: "${keyword}"
      
      아래 **[검색 결과]**를 보고 제품 정보를 JSON으로 작성하세요.
      ${searchContext}
      
      [주의]
      - 드라이기 -> 헤어드라이기 (의류건조기 X)
      - 가격은 검색된 정보 반영
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(completion.choices[0].message.content || "{}");

    const { error } = await supabase.from('products').insert({
      title: data.title || keyword,
      price: data.price || 0,
      specs: data.specs || "",
      category: data.category || 'etc',
      status: 'PENDING',
      image_url: ''
    });

    if (error) throw error;
    return NextResponse.json({ success: true, title: data.title });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}