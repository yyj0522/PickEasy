import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  if (process.env.NODE_ENV !== 'development') {
    return notFound();
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: logs, error } = await supabase
    .from('daily_usage')
    .select('*')
    .order('usage_date', { ascending: false }) 
    .order('request_count', { ascending: false }) 
    .limit(100); 

  if (error) {
    return <div className="p-10 text-red-500">데이터 로드 실패: {error.message}</div>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">로컬 전용 관리자 대시보드</h1>
      <p className="mb-4 text-slate-500">
        현재 <strong>{process.env.NODE_ENV}</strong> 모드에서 실행 중입니다. (배포 시 접속 불가)
      </p>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr>
              <th className="px-6 py-3">IP 주소</th>
              <th className="px-6 py-3">날짜</th>
              <th className="px-6 py-3 text-right">요청 횟수</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-mono">{log.ip_address}</td>
                <td className="px-6 py-4">{log.usage_date}</td>
                <td className="px-6 py-4 text-right font-bold text-indigo-600">
                  {log.request_count} / 5
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}