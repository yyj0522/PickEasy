import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { secret, keyword } = await req.json();

    if (secret !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ error: '비밀번호 오류' }, { status: 401 });
    }

    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    const systemPrompt = `
      당신은 이커머스 MD입니다. 오늘은 **${today}** 입니다.
      
      사용자가 검색한 키워드 "${keyword}"에 해당하는 최신 제품 1개의 정보를 상세하게 작성하세요.
      
      [시장 상황 반영]
      2026년 기준 물가 상승(반도체 폭등)을 반영하여 가격을 책정하세요.

      [출력 형식 - JSON Only]
      {
        "title": "정확한 제품 풀네임",
        "price": 1500000,
        "specs": "핵심 스펙 줄바꿈 요약",
        "category": "laptop" (키워드를 보고 laptop, desktop, monitor, mouse, keyboard, tablet, cleaner, dryer, audio, massage, watch, camera 중 하나로 자동 분류)
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    const data = JSON.parse(content || "{}");
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
    console.error("AI Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}