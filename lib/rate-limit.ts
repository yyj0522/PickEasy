import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LIMITS: Record<string, number> = {
  quiz: 3, 
  pc: 3, 
  vs: 5, 
  default: 10 
};

export async function checkDailyLimit(ip: string, type: string = 'default'): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const maxLimit = LIMITS[type] || LIMITS.default;

    const { data, error } = await supabase
      .from('daily_usage_v2')
      .select('request_count')
      .eq('ip_address', ip)
      .eq('usage_date', today)
      .eq('feature_type', type)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Rate Limit Check Error:', error);
      return { allowed: true, remaining: 1 };
    }

    if (data) {
      if (data.request_count >= maxLimit) {
        return { allowed: false, remaining: 0 };
      }

      await supabase
        .from('daily_usage_v2')
        .update({ request_count: data.request_count + 1 })
        .eq('ip_address', ip)
        .eq('usage_date', today)
        .eq('feature_type', type);

      return { allowed: true, remaining: maxLimit - data.request_count - 1 };
    }

    await supabase.from('daily_usage_v2').insert({
      ip_address: ip,
      usage_date: today,
      feature_type: type,
      request_count: 1
    });

    return { allowed: true, remaining: maxLimit - 1 };

  } catch (e) {
    console.error('Rate Limit Logic Error:', e);
    return { allowed: true, remaining: 1 };
  }
}