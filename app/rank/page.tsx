"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, TrendingUp, AlertCircle, Mail } from 'lucide-react'; 
import BuyButton from '@/components/common/BuyButton';
import Footer from '@/components/layout/Footer';
import Disclaimer from '@/components/common/Disclaimer';
import { DesktopSideBanners, MobileBottomBanner } from '@/components/ads/AdBanners';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TABS = [
  { slug: 'laptop', name: '노트북' },
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
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateDate, setUpdateDate] = useState('');

  useEffect(() => {
    fetchRankings(activeTab);
  }, [activeTab]);

  const fetchRankings = async (category: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('rankings')
      .select('data, created_at')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setRankings(data[0].data.list || []);
      setUpdateDate(data[0].data.updated_date || '');
    } else {
      setRankings([]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12 w-full flex-1 relative min-h-[1000px]">
        
        <DesktopSideBanners />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-3">
            <TrendingUp className="text-blue-600" />
            이달의 IT 트렌드 랭킹
          </h1>
          <p className="text-gray-500">AI가 빅데이터를 분석하여 선정한 인기 순위입니다.</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-bold text-blue-800 mb-1">Beta 서비스 안내</p>
            <p className="leading-relaxed mb-2">
              본 랭킹은 AI가 분석한 트렌드 지표로, 실제 판매량과 차이가 있을 수 있으며 일부 부정확한 정보가 포함될 수 있습니다.
            </p>
            <p className="flex items-center gap-1 text-gray-500 text-xs">
              <Mail className="w-3 h-3" />
              잘못된 정보 제보 및 의견은 <strong>projectc029@gmail.com</strong>으로 보내주세요. 여러분의 제보가 AI를 똑똑하게 만듭니다.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <Disclaimer />
        </div>

        <div className="flex overflow-x-auto gap-2 pb-4 mb-4 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => setActiveTab(tab.slug)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                activeTab === tab.slug 
                  ? 'bg-black text-white shadow-md' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="py-20 text-center text-gray-400 flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>데이터를 불러오는 중입니다...</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {updateDate && (
              <div className="text-right text-xs text-gray-400 mb-2">
                기준: {updateDate}
              </div>
            )}

            {rankings.length === 0 ? (
              <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border">
                아직 집계된 데이터가 없습니다.
              </div>
            ) : (
              rankings.map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-5 hover:shadow-md transition group">
                  <div className={`text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-xl shrink-0 ${idx < 3 ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                    {item.rank}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left w-full min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1 justify-center md:justify-start">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition truncate">
                        {item.name}
                      </h3>
                      {item.change === 'NEW' && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold w-fit mx-auto md:mx-0 shrink-0">NEW</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-1">{item.reason}</p>
                    <div className="text-sm font-bold text-gray-900">
                      예상가: {typeof item.price_estimate === 'number' ? item.price_estimate.toLocaleString() : item.price_estimate}원
                    </div>
                  </div>

                  <div className="w-full md:w-auto shrink-0 mt-2 md:mt-0">
                    <BuyButton keyword={item.name} className="w-full md:w-auto" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <MobileBottomBanner />

      </div>
      <Footer />
    </div>
  );
}