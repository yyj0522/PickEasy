"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BookOpen, Search, Loader2 } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { DesktopSideBanners } from '@/components/ads/AdBanners';

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
    href: 'https://click.linkprice.com/click.php?m=gmarket&a=A100702467&l=6775&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/gmarket/20221004/K00HwzuaHqe00_728x90.jpg',
    width: 728, height: 90, alt: 'G마켓',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=gmarket&a_id=A100702467&p_id=0000&l_id=6775&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'lenovo_d',
    href: 'https://click.linkprice.com/click.php?m=lenovo&a=A100702467&l=DKT0&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/lenovo/20250516/000vtShk00000_레노버 728x90.png',
    width: 728, height: 90, alt: '레노버',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=lenovo&a_id=A100702467&p_id=0000&l_id=DKT0&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'himart_d',
    href: 'https://click.linkprice.com/click.php?m=himart&a=A100702467&l=Oze4&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/himart/20250630/686230aa8d3de_728x90.png',
    width: 728, height: 90, alt: '하이마트',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=Oze4&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'coupang_d',
    href: 'https://link.coupang.com/a/dJuZZw',
    imgSrc: 'https://ads-partners.coupang.com/banners/963102?subId=&traceId=V0-301-5f9bd61900e673c0-I963102&w=728&h=90',
    width: 728, height: 90, alt: '쿠팡',
    isCoupang: true
  },
  {
    id: 'aliexpress_d',
    href: 'https://click.linkprice.com/click.php?m=aliexpress&a=A100702467&l=8PXG&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/aliexpress/20230509/AO0161bmd0580_728x90.png',
    width: 728, height: 90, alt: '알리익스프레스',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=aliexpress&a_id=A100702467&p_id=0000&l_id=8PXG&l_cd1=2&l_cd2=0'
  }
];

const MOBILE_BANNERS: Banner[] = [
  { 
    id: 'himart_m1',
    href: 'https://click.linkprice.com/click.php?m=himart&a=A100702467&l=TJzp&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/himart/20260129/697b2513716b9_468x60.png',
    width: 468, height: 60, alt: '하이마트',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=TJzp&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'himart_m2',
    href: 'https://click.linkprice.com/click.php?m=himart&a=A100702467&l=xGIZ&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/himart/20250630/686230aa8c8c3_468x60.png',
    width: 468, height: 60, alt: '하이마트',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=xGIZ&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'gmarket_m',
    href: 'https://click.linkprice.com/click.php?m=gmarket&a=A100702467&l=A7tz&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/gmarket/20221004/W800QYbQ7zS00_468x60.jpg',
    width: 468, height: 60, alt: 'G마켓',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=gmarket&a_id=A100702467&p_id=0000&l_id=A7tz&l_cd1=2&l_cd2=0'
  }
];

const BOTTOM_GRID_BANNERS = [
  { href: 'https://click.linkprice.com/click.php?m=himart&a=A100702467&l=nyIP&u_id=', imgSrc: 'https://img.linkprice.com/files/glink/himart/20260129/697b25135c355_120x60.png', alt: '하이마트' },
  { href: 'https://click.linkprice.com/click.php?m=gmarket&a=A100702467&l=1638&u_id=', imgSrc: 'https://img.linkprice.com/files/glink/gmarket/20191120/5dd48d65a8c5e_120_60.jpg', alt: 'G마켓' },
  { href: 'https://link.coupang.com/a/dJuj4r', imgSrc: 'https://ads-partners.coupang.com/banners/964225?subId=&traceId=V0-301-5f9bd61900e673c0-I964225&w=120&h=60', alt: '쿠팡', isCoupang: true },
  { href: 'https://click.linkprice.com/click.php?m=aliexpress&a=A100702467&l=Cq7c&u_id=', imgSrc: 'https://img.linkprice.com/files/glink/aliexpress/20240328/600GgnC4eLAW0_120_60.png', alt: '알리익스프레스' }
];

export default function DictionaryPage() {
  const [terms, setTerms] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [categories, setCategories] = useState<string[]>(['전체']);
  const [loading, setLoading] = useState(true);
  
  const [randomDesktop, setRandomDesktop] = useState<Banner | null>(null);
  const [randomMobile, setRandomMobile] = useState<Banner | null>(null);

  useEffect(() => {
    setRandomDesktop(DESKTOP_BANNERS[Math.floor(Math.random() * DESKTOP_BANNERS.length)]);
    setRandomMobile(MOBILE_BANNERS[Math.floor(Math.random() * MOBILE_BANNERS.length)]);

    async function getTerms() {
      const { data } = await supabase.from('dictionary').select('*').order('term');
      if (data) {
        setTerms(data);
        const cats = Array.from(new Set(data.map(d => d.category || '기타'))).sort();
        setCategories(['전체', ...cats]);
      }
      setLoading(false);
    }
    getTerms();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const termFromHash = decodeURIComponent(window.location.hash.replace('#', ''));
      if (termFromHash) {
        setSearch(termFromHash);
      }
    }
  }, []);

  const filteredTerms = terms.filter(t => {
    const matchesSearch = t.term.toLowerCase().includes(search.toLowerCase()) || 
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12 w-full flex-1 relative">
            <DesktopSideBanners />
            
            <div className="text-center mb-10">
                <h1 className="text-3xl font-black flex items-center justify-center gap-2 mb-3 text-slate-900">
                    <BookOpen className="text-green-600 w-8 h-8" />
                    픽이지 IT 용어 백과
                </h1>
                <p className="text-slate-500">어려운 IT 용어, 전문가가 쉽게 설명해드립니다.</p>
            </div>

            <div className="mb-6 relative">
                <input 
                    type="text" 
                    placeholder="궁금한 용어를 검색해보세요 (예: 주사율, OLED)" 
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm text-lg"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
            </div>

            <div className="mb-8 flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                            selectedCategory === cat 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-20 text-center flex justify-center">
                    <Loader2 className="animate-spin text-green-600 w-10 h-10" />
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredTerms.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl text-slate-400">
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        filteredTerms.map((item) => (
                            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-md font-bold">
                                        {item.category || '기타'}
                                    </span>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {item.term}
                                    </h2>
                                </div>
                                <p className="text-slate-700 leading-relaxed text-lg">
                                    {item.description}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            )}

            <div className="mt-16">
                <div className="bg-slate-900 text-white rounded-t-xl p-3 text-center font-bold text-sm">
                    함께 보면 좋은 인기 쇼핑몰
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-100 p-2 rounded-b-xl">
                    {BOTTOM_GRID_BANNERS.map((banner, idx) => (
                        <a key={idx} href={banner.href} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-lg flex items-center justify-center hover:shadow-md transition-shadow h-[60px]">
                            <img src={banner.imgSrc} alt={banner.alt} className="max-w-full max-h-full" />
                        </a>
                    ))}
                </div>
            </div>

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