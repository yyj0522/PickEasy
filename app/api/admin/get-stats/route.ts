import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { secret } = await req.json();

    if (secret !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 카운트 높은 순으로 100개 가져오기
    const { data, error } = await supabase
      .from('product_stats')
      .select('*')
      .order('count', { ascending: false })
      .limit(100);

    if (error) throw error;
    
    return NextResponse.json({ success: true, stats: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}