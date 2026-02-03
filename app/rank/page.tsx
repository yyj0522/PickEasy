"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { TrendingUp, Calendar, Loader2 } from 'lucide-react';
import Disclaimer from '@/components/common/Disclaimer';
import BuyButton from '@/components/common/BuyButton';
import Footer from '@/components/layout/Footer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TABS = [
  { slug: 'laptop', name: '노트북' },
  { slug: 'desktop', name: '데스크탑' },
  { slug: 'monitor', name: '모니터' },
  { slug: 'mouse', name: '마우스' },
  { slug: 'keyboard', name: '키보드' },
  { slug: 'tablet', name: '태블릿' },
  { slug: 'cleaner', name: '청소기' },
  { slug: 'dryer', name: '드라이기' },
  { slug: 'audio', name: '음향기기' },
  { slug: 'massage', name: '안마기' },
  { slug: 'watch', name: '워치' },
  { slug: 'camera', name: '카메라' },
  { slug: 'accessory', name: 'IT소품/잡화' },
];

export default function RankPage() {
  const [activeTab, setActiveTab] = useState('laptop');
  const [ranking, setRanking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking(activeTab);
  }, [activeTab]);

  const fetchRanking = async (category: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('rankings')
      .select('data, created_at')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setRanking(data.data);
    } else {
      setRanking(null);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8 text-red-600" />
            분야별 주간 랭킹 (TOP 10)
          </h1>
          <p className="text-gray-500">
            AI가 분석한 2026년 최신 트렌드를 확인하세요.
          </p>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => setActiveTab(tab.slug)}
              className={`px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all border ${
                activeTab === tab.slug 
                  ? 'bg-black text-white border-black shadow-lg scale-105' 
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
          </div>
        ) : ranking ? (
          <div className="animate-fade-in">
            <div className="flex justify-end mb-4 items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              기준: {ranking.updated_date}
            </div>

            <div className="space-y-4">
              {ranking.list.map((item: any, idx: number) => (
                <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-12 h-12 flex items-center justify-center rounded-br-2xl font-black text-xl z-10 
                    ${item.rank === 1 ? 'bg-yellow-400 text-white shadow-md' : 
                      item.rank === 2 ? 'bg-gray-300 text-white' : 
                      item.rank === 3 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {item.rank}
                  </div>

                  <div className="flex-1 pl-8 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition">{item.name}</h3>
                      {item.change === 'NEW' && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">NEW</span>}
                      {item.change === 'UP' && <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-bold">▲</span>}
                    </div>
                    <p className="text-sm font-medium text-blue-600 mb-2">
                      약 {parseInt(item.price_estimate).toLocaleString()}원
                    </p>
                    <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg inline-block">
                      {item.reason}
                    </p>
                  </div>

                  <BuyButton 
                    keyword={item.name} 
                    className="shrink-0 w-full md:w-auto px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition"
                  />
                </div>
              ))}
            </div>
            
            <Disclaimer />
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500">
              아직 랭킹 데이터가 수집되지 않았습니다.<br/>
              업데이트 예정입니다.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}