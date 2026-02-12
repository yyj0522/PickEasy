import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_DAILY_REQUESTS = 20;

export async function checkDailyLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_usage')
      .select('request_count')
      .eq('ip_address', ip)
      .eq('usage_date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Rate Limit Check Error:', error);
      return { allowed: true, remaining: 0 };
    }

    if (data) {
      if (data.request_count >= MAX_DAILY_REQUESTS) {
        return { allowed: false, remaining: 0 };
      }

      await supabase
        .from('daily_usage')
        .update({ request_count: data.request_count + 1 })
        .eq('ip_address', ip)
        .eq('usage_date', today);

      return { allowed: true, remaining: MAX_DAILY_REQUESTS - data.request_count - 1 };
    }

    await supabase.from('daily_usage').insert({
      ip_address: ip,
      usage_date: today,
      request_count: 1
    });

    return { allowed: true, remaining: MAX_DAILY_REQUESTS - 1 };

  } catch (e) {
    console.error('Rate Limit Logic Error:', e);
    return { allowed: true, remaining: 1 };
  }
}