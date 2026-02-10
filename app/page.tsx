"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';
import { Search, Calculator, Swords, TrendingUp, Monitor, Tv, Mouse, Keyboard, Tablet, Fan, Wind, Headphones, Armchair, Watch, Camera, Plug, Speaker, Refrigerator, Waves, Shirt, Snowflake, Zap, Cpu, Laptop } from 'lucide-react'; 
import Footer from '@/components/layout/Footer';

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
    trackingSrc: 'http://track.linkprice.com/lpshow.php?m_id=aliexpress&a_id=A100702467&p_id=0000&l_id=8PXG&l_cd1=2&l_cd2=0'
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

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  
  const [randomDesktop, setRandomDesktop] = useState<Banner | null>(null);
  const [randomMobile, setRandomMobile] = useState<Banner | null>(null);

  useEffect(() => {
    setRandomDesktop(DESKTOP_BANNERS[Math.floor(Math.random() * DESKTOP_BANNERS.length)]);
    setRandomMobile(MOBILE_BANNERS[Math.floor(Math.random() * MOBILE_BANNERS.length)]);
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return alert("검색어를 입력해주세요!");
    router.push(`/quiz?q=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      <section className="relative w-full py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold tracking-wide mb-2">
            AI 기반 IT 제품 큐레이션
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            고민은 AI가,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              선택은 쉽고 빠르게.
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            노트북, 로봇청소기, 안마기... 스펙 공부하느라 지치셨나요?<br />
            용도만 말하면 AI가 최적의 모델을 찾아드립니다.
          </p>

          <div className="relative max-w-xl mx-auto mt-8 shadow-xl rounded-2xl">
            <input 
              type="text" 
              placeholder="예: 100만원대 가성비 노트북 추천해줘" 
              className="w-full h-14 pl-6 pr-14 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 text-lg shadow-sm transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button 
              onClick={handleSearch}
              className="absolute right-2 top-2 h-10 w-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 w-full">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">어떤 도움이 필요하신가요?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          
          <Link href="/pc-builder" className="group relative overflow-hidden rounded-3xl bg-black p-8 text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <Calculator className="w-6 h-6 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold mb-2">AI 조립 PC 견적</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                "배그 풀옵션 150만원" 이라고만 말하세요.<br/>
                호환성 체크부터 부품 추천까지 3초 컷.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all"></div>
          </Link>

          <Link href="/vs" className="group relative overflow-hidden rounded-3xl bg-gray-100 p-8 hover:bg-gray-200 transition-all duration-300">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Swords className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">VS 스펙 비교</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              그램 vs 갤럭시북, 다이슨 vs 차이슨.<br/>
              애매한 스펙 차이, 표 하나로 종결합니다.
            </p>
          </Link>

          <Link href="/rank" className="group relative overflow-hidden rounded-3xl bg-blue-50 p-8 border border-blue-100 hover:border-blue-200 transition-all duration-300">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">이달의 랭킹</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              지금 가장 많이 팔리는 제품은 뭘까요?<br/>
              데이터 기반 트렌드 랭킹을 확인하세요.
            </p>
          </Link>
        </div>
      </section>

      <div className="w-full flex justify-center py-12 px-4">
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

      <Footer />

    </div>
  );
}