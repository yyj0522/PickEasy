"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, TrendingUp, AlertCircle, Mail, ChevronDown, ChevronUp, Search, ExternalLink } from 'lucide-react'; 
import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import Disclaimer from '@/components/common/Disclaimer';
import { DesktopSideBanners } from '@/components/ads/AdBanners';
import TermHighlighter from '@/components/common/TermHighlighter';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Banner = {
  id: string;
  href: string;
  imgSrc: string;
  width: number;
  height: number;
  alt: string;
  trackingSrc?: string;
  isCoupang?: boolean;
};

const DESKTOP_BANNERS: Banner[] = [
  { 
    id: 'gmarket_d',
    href: '/api/ad?id=gmarket_d',
    imgSrc: 'https://img.linkprice.com/files/glink/gmarket/20221004/K00HwzuaHqe00_728x90.jpg',
    width: 728, height: 90, alt: 'G마켓',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=gmarket&a_id=A100702467&p_id=0000&l_id=6775&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'lenovo_d',
    href: '/api/ad?id=lenovo_d',
    imgSrc: 'https://img.linkprice.com/files/glink/lenovo/20250516/000vtShk00000_레노버 728x90.png',
    width: 728, height: 90, alt: '레노버',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=lenovo&a_id=A100702467&p_id=0000&l_id=DKT0&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'himart_d',
    href: '/api/ad?id=himart_d',
    imgSrc: 'https://img.linkprice.com/files/glink/himart/20250630/686230aa8d3de_728x90.png',
    width: 728, height: 90, alt: '하이마트',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=Oze4&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'coupang_d',
    href: '/api/ad?id=coupang_d',
    imgSrc: 'https://ads-partners.coupang.com/banners/963102?subId=&traceId=V0-301-5f9bd61900e673c0-I963102&w=728&h=90',
    width: 728, height: 90, alt: '쿠팡',
    isCoupang: true
  },
  {
    id: 'aliexpress_d',
    href: '/api/ad?id=aliexpress_d',
    imgSrc: 'https://img.linkprice.com/files/glink/aliexpress/20230509/AO0161bmd0580_728x90.png',
    width: 728, height: 90, alt: '알리익스프레스',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=aliexpress&a_id=A100702467&p_id=0000&l_id=8PXG&l_cd1=2&l_cd2=0'
  }
];

const MOBILE_BANNERS: Banner[] = [
  { 
    id: 'himart_m1',
    href: '/api/ad?id=himart_m1',
    imgSrc: 'https://img.linkprice.com/files/glink/himart/20260129/697b2513716b9_468x60.png',
    width: 468, height: 60, alt: '하이마트',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=TJzp&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'himart_m2',
    href: '/api/ad?id=himart_m2',
    imgSrc: 'https://img.linkprice.com/files/glink/himart/20250630/686230aa8c8c3_468x60.png',
    width: 468, height: 60, alt: '하이마트',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=xGIZ&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'gmarket_m',
    href: '/api/ad?id=gmarket_m',
    imgSrc: 'https://img.linkprice.com/files/glink/gmarket/20221004/W800QYbQ7zS00_468x60.jpg',
    width: 468, height: 60, alt: 'G마켓',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=gmarket&a_id=A100702467&p_id=0000&l_id=A7tz&l_cd1=2&l_cd2=0'
  }
];

const TABS = [
  { slug: 'laptop', name: '노트북' },
  { slug: 'monitor', name: '모니터' },
  { slug: 'tablet', name: '태블릿' },
  { slug: 'mouse', name: '마우스' },
  { slug: 'keyboard', name: '키보드' },
  { slug: 'watch', name: '워치' },
  { slug: 'audio', name: '음향기기' },
  { slug: 'speaker', name: '스피커' },
  { slug: 'camera', name: '카메라' },
  { slug: 'tv', name: 'TV' },
  { slug: 'refrigerator', name: '냉장고' },
  { slug: 'washer', name: '세탁기' },
  { slug: 'clothes_dryer', name: '건조기' },
  { slug: 'air_conditioner', name: '에어컨' },
  { slug: 'air_purifier', name: '공기청정기' },
  { slug: 'cleaner', name: '청소기' },
  { slug: 'hair_dryer', name: '헤어드라이기' },
  { slug: 'massage', name: '안마기' },
  { slug: 'accessory', name: 'IT잡화' }
];

export default function RankPage() {
  const [activeTab, setActiveTab] = useState('laptop');
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateDate, setUpdateDate] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [randomDesktop, setRandomDesktop] = useState<Banner | null>(null);
  const [randomMobile, setRandomMobile] = useState<Banner | null>(null);

  useEffect(() => {
    setRandomDesktop(DESKTOP_BANNERS[Math.floor(Math.random() * DESKTOP_BANNERS.length)]);
    setRandomMobile(MOBILE_BANNERS[Math.floor(Math.random() * MOBILE_BANNERS.length)]);
  }, []);

  useEffect(() => {
    fetchRankings(activeTab);
    setExpandedId(null);
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

  const toggleExpand = (idx: number) => {
    setExpandedId(expandedId === idx ? null : idx);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12 w-full flex-1 relative min-h-[1000px]">
        
        <DesktopSideBanners />

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black flex items-center justify-center gap-2 mb-3 text-slate-900">
            이달의 트렌드 랭킹
          </h1>
          <p className="text-slate-500 font-medium">
            AI가 빅데이터를 분석하여 선정한 카테고리별 인기 순위입니다.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-sm">
          <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700">
            <p className="font-bold text-blue-800 mb-1 text-base">Beta 서비스 안내</p>
            <p className="leading-relaxed mb-2">
              본 랭킹은 국내 주요 온라인 마켓 및 검색 포털의 빅데이터를 AI가 종합 분석한 결과입니다.
              실제 판매량과는 다를 수 있습니다.
            </p>
            <p className="flex items-center gap-1 text-slate-500 text-xs">
              <Mail className="w-3 h-3" />
              오류 제보: <strong>projectc029@gmail.com</strong>
            </p>
          </div>
        </div>

        <div className="mb-8">
          <Disclaimer />
        </div>

        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {TABS.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => setActiveTab(tab.slug)}
              className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                activeTab === tab.slug 
                  ? 'bg-slate-900 text-white shadow-md transform scale-105' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="py-32 text-center flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-500 font-medium">최신 트렌드를 불러오는 중입니다...</p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {updateDate && (
              <div className="flex justify-end items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                업데이트: {updateDate}
              </div>
            )}

            {rankings.length === 0 ? (
              <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                아직 집계된 데이터가 없습니다.
              </div>
            ) : (
              rankings.map((item, idx) => (
                <div key={idx} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${expandedId === idx ? 'border-blue-500 ring-1 ring-blue-500 shadow-lg' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'}`}>
                  
                  <div 
                    className="p-5 flex flex-col md:flex-row items-center gap-5 cursor-pointer"
                    onClick={() => toggleExpand(idx)}
                  >
                    <div className={`text-2xl font-black w-14 h-14 flex items-center justify-center rounded-2xl shrink-0 shadow-sm ${idx < 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {item.rank}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left w-full min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1.5 justify-center md:justify-start">
                        <h3 className="font-bold text-lg text-slate-900 truncate">
                          {item.name}
                        </h3>
                        {item.change === 'NEW' && (
                          <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold w-fit mx-auto md:mx-0 shrink-0">NEW</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-2 line-clamp-1">
                        <TermHighlighter text={item.summary} />
                      </p>
                      <div className="text-base font-bold text-blue-600">
                        {typeof item.price_estimate === 'number' ? item.price_estimate.toLocaleString() : item.price_estimate}원~
                      </div>
                    </div>

                    <div className="shrink-0 text-slate-400">
                      {expandedId === idx ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  </div>

                  <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${expandedId === idx ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                        
                        <div className="mb-6 space-y-4">
                          <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <h4 className="font-bold text-sm text-slate-900 mb-2">상세 스펙</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                <TermHighlighter text={item.spec_detail} />
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                              <h4 className="font-bold text-sm text-blue-800 mb-1">장점</h4>
                              <p className="text-sm text-blue-700">
                                <TermHighlighter text={item.pros} />
                              </p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                              <h4 className="font-bold text-sm text-red-800 mb-1">단점</h4>
                              <p className="text-sm text-red-700">
                                <TermHighlighter text={item.cons} />
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-6 flex justify-center">
                          <Link 
                            href={`/product/${encodeURIComponent(item.name)}`}
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors w-full md:w-auto text-center flex items-center justify-center gap-2 shadow-lg"
                          >
                            <ExternalLink className="w-4 h-4" />
                            전문가 상세 분석 & 리뷰 보기
                          </Link>
                        </div>

                        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-center">
                          <h4 className="font-bold text-slate-800 mb-1 flex items-center justify-center gap-2">
                            <Search className="w-4 h-4 text-blue-600" />
                            이 제품 최저가 찾아보기
                          </h4>
                          <p className="text-xs text-slate-400 mb-4">
                            아래 쇼핑몰에서 실시간 가격을 확인하세요.
                          </p>
                          
                          <div className="flex flex-wrap justify-center items-center gap-4">
                            <div className="hover:opacity-80 transition-opacity">
                              <a target="_blank" href="/api/ad?id=grid_himart" rel="noopener noreferrer nofollow">
                                <img src="https://img.linkprice.com/files/glink/himart/20260129/697b25135c355_120x60.png" width="120" height="60" alt="하이마트" style={{ border: 0 }} />
                              </a>
                              <img src="https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=nyIP&l_cd1=2&l_cd2=0" width="1" height="1" alt="" style={{ display: 'none' }} />
                            </div>

                            <div className="hover:opacity-80 transition-opacity">
                              <a target="_blank" href="/api/ad?id=grid_gmarket" rel="noopener noreferrer nofollow">
                                <img src="https://img.linkprice.com/files/glink/gmarket/20191120/5dd48d65a8c5e_120_60.jpg" width="120" height="60" alt="G마켓" style={{ border: 0 }} />
                              </a>
                              <img src="https://track.linkprice.com/lpshow.php?m_id=gmarket&a_id=A100702467&p_id=0000&l_id=1638&l_cd1=2&l_cd2=0" width="1" height="1" alt="" style={{ display: 'none' }} />
                            </div>

                            <div className="hover:opacity-80 transition-opacity">
                              <a href="/api/ad?id=grid_coupang" target="_blank" rel="noopener noreferrer nofollow">
                                <img src="https://ads-partners.coupang.com/banners/964225?subId=&traceId=V0-301-5f9bd61900e673c0-I964225&w=120&h=60" alt="쿠팡" width="120" height="60" />
                              </a>
                            </div>

                            <div className="hover:opacity-80 transition-opacity">
                              <a target="_blank" href="/api/ad?id=grid_aliexpress" rel="noopener noreferrer nofollow">
                                <img src="https://img.linkprice.com/files/glink/aliexpress/20240328/600GgnC4eLAW0_120_60.png" width="120" height="60" alt="알리익스프레스" style={{ border: 0 }} />
                              </a>
                              <img src="https://track.linkprice.com/lpshow.php?m_id=aliexpress&a_id=A100702467&p_id=0000&l_id=Cq7c&l_cd1=2&l_cd2=0" width="1" height="1" alt="" style={{ display: 'none' }} />
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-slate-100">
                             <p className="text-[10px] text-slate-400 font-medium">
                               이 사이트는 제휴 마케팅 활동의 일환으로,<br/>
                               이에 따른 일정액의 수수료를 제공받습니다.
                             </p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        )}

        <div className="w-full flex justify-center items-center my-12 overflow-hidden">
          <div className="hidden md:block">
            {randomDesktop && (
              <a href={randomDesktop.href} target="_blank" rel="noopener noreferrer nofollow">
                <img 
                  src={randomDesktop.imgSrc} 
                  alt={randomDesktop.alt} 
                  width={randomDesktop.width} 
                  height={randomDesktop.height} 
                  className="max-w-full h-auto rounded-lg"
                  {...(randomDesktop.isCoupang && { referrerPolicy: 'unsafe-url' })}
                />
                {randomDesktop.trackingSrc && (
                   <img src={randomDesktop.trackingSrc} width="1" height="1" alt="" style={{ display: 'none' }} />
                )}
              </a>
            )}
          </div>

          <div className="block md:hidden">
             {randomMobile && (
              <a href={randomMobile.href} target="_blank" rel="noopener noreferrer nofollow">
                <img 
                  src={randomMobile.imgSrc} 
                  alt={randomMobile.alt} 
                  width={randomMobile.width} 
                  height={randomMobile.height} 
                  className="max-w-full h-auto rounded-lg"
                />
                {randomMobile.trackingSrc && (
                   <img src={randomMobile.trackingSrc} width="1" height="1" alt="" style={{ display: 'none' }} />
                )}
              </a>
            )}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}