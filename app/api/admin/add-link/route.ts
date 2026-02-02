import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 만능열쇠 사용 (쓰기 권한)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { secret, keyword, url } = await req.json();

  // 비밀번호 체크 (간단하게)
  if (secret !== process.env.CRON_SECRET && secret !== 'my-super-secret-password') {
    return NextResponse.json({ error: '비밀번호 틀림' }, { status: 401 });
  }

  const { error } = await supabase.from('affiliate_links').upsert(
    { keyword, url }, 
    { onConflict: 'keyword' } // 이미 있으면 업데이트
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}