"use client";

import { useState, useEffect, useRef } from 'react';
import { Swords, Trophy, Loader2, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import Disclaimer from '@/components/common/Disclaimer';
import Footer from '@/components/layout/Footer';
import SecurityWidget from '@/components/common/SecurityWidget';

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

export default function VSPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const widgetRef = useRef<any>(null);

  const [inputs, setInputs] = useState({
    a: '',
    b: ''
  });

  const [randomDesktop, setRandomDesktop] = useState<Banner | null>(null);
  const [randomMobile, setRandomMobile] = useState<Banner | null>(null);

  useEffect(() => {
    setRandomDesktop(DESKTOP_BANNERS[Math.floor(Math.random() * DESKTOP_BANNERS.length)]);
    setRandomMobile(MOBILE_BANNERS[Math.floor(Math.random() * MOBILE_BANNERS.length)]);
  }, []);

  const handleCompare = async () => {
    if (!inputs.a || !inputs.b) return alert("두 제품명을 모두 입력해주세요!");
    if (!turnstileToken) return alert("보안 확인 중입니다. 잠시만 기다려주세요.");
    
    setLoading(true);
    setResult(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/vs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productA: inputs.a, 
          productB: inputs.b,
          turnstileToken
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setTurnstileToken('');
        widgetRef.current?.reset();
        throw new Error(data.error || "비교 분석 중 오류가 발생했습니다.");
      }
      
      setResult(data);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 max-w-4xl mx-auto px-4 pt-12 w-full flex flex-col pb-0">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black mb-3 flex items-center justify-center gap-2 text-slate-900">
            스펙 비교
          </h1>
          <p className="text-slate-500 font-medium">
            애매한 스펙 차이, 고민하지 마세요.<br/>
            AI가 2026년 최신 기준으로 냉정하게 승부를 가려드립니다.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 mb-8">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-blue-600 mb-2 ml-1 tracking-wider">🔵 BLUE CORNER</label>
            <input 
              type="text" 
              maxLength={30}
              placeholder="예: 갤럭시북4 프로"
              className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg font-bold text-center placeholder:font-normal placeholder:text-blue-300 transition text-slate-800"
              value={inputs.a}
              onChange={(e) => setInputs({...inputs, a: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
            />
          </div>

          <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full font-black text-slate-400 italic shadow-inner">
            VS
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-red-600 mb-2 ml-1 tracking-wider">🔴 RED CORNER</label>
            <input 
              type="text" 
              maxLength={30}
              placeholder="예: 맥북 에어 M3"
              className="w-full p-4 bg-red-50/50 border border-red-100 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-lg font-bold text-center placeholder:font-normal placeholder:text-red-300 transition text-slate-800"
              value={inputs.b}
              onChange={(e) => setInputs({...inputs, b: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
            />
          </div>
        </div>

        <SecurityWidget ref={widgetRef} onVerify={setTurnstileToken} />

        <button 
          onClick={handleCompare}
          disabled={loading}
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all hover:shadow-lg hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 mb-8"
        >
          {loading ? <Loader2 className="animate-spin" /> : <ArrowRightLeft />}
          {loading ? "AI가 데이터를 분석 중입니다..." : "비교 분석 시작하기"}
        </button>

        {errorMsg && (
          <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center text-center animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
            <h3 className="font-bold text-red-700 mb-1">분석 실패</h3>
            <p className="text-red-600 text-sm">{errorMsg}</p>
          </div>
        )}

        {result && (
          <div className="animate-in slide-in-from-bottom-4 duration-700 space-y-6">
            <Disclaimer />
            
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 divide-x divide-slate-200">
                <div className="p-5 text-center font-bold text-blue-700 break-keep flex items-center justify-center bg-blue-50/30">
                  {result.productA_name}
                </div>
                <div className="p-5 text-center font-black text-slate-400 text-xs flex items-center justify-center tracking-widest uppercase bg-slate-100/50">
                  COMPARE
                </div>
                <div className="p-5 text-center font-bold text-red-700 break-keep flex items-center justify-center bg-red-50/30">
                  {result.productB_name}
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {result.specs?.map((item: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-3 divide-x divide-slate-100 group hover:bg-slate-50 transition-colors">
                    <div className={`p-4 text-center text-sm flex flex-col items-center justify-center gap-1 ${item.winner === 'A' ? 'font-bold text-blue-700 bg-blue-50/40' : 'text-slate-600'}`}>
                      {item.winner === 'A' && <Trophy className="w-4 h-4 text-yellow-500 drop-shadow-sm mb-1" />}
                      <span>{item.specA}</span>
                    </div>
                    
                    <div className="p-4 flex items-center justify-center text-[11px] font-bold text-slate-400 uppercase tracking-wide bg-slate-50/50">
                      {item.category}
                    </div>
                    
                    <div className={`p-4 text-center text-sm flex flex-col items-center justify-center gap-1 ${item.winner === 'B' ? 'font-bold text-red-700 bg-red-50/40' : 'text-slate-600'}`}>
                      {item.winner === 'B' && <Trophy className="w-4 h-4 text-yellow-500 drop-shadow-sm mb-1" />}
                      <span>{item.specB}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-slate-900 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"></div>
                <h3 className="font-bold text-yellow-400 mb-2 text-lg flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5" /> AI의 최종 판정
                </h3>
                <p className="opacity-90 leading-relaxed text-slate-200">
                  {result.final_verdict}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
              <h3 className="text-center font-bold text-slate-800 mb-1">
                비교한 제품들 최저가 찾아보기
              </h3>
              <p className="text-center text-xs text-slate-400 mb-6">
                아래 쇼핑몰에서 실시간 가격을 확인해보세요.
              </p>
              
              <div className="flex flex-wrap justify-center items-center gap-6">
                <div className="hover:opacity-80 transition-opacity">
                  <a target="_blank" href="/api/ad?id=grid_himart" rel="noopener noreferrer nofollow">
                    <img src="https://img.linkprice.com/files/glink/himart/20260129/697b25135c355_120x60.png" width="120" height="60" alt="하이마트" style={{ border: 0 }} />
                  </a>
                </div>

                <div className="hover:opacity-80 transition-opacity">
                  <a target="_blank" href="/api/ad?id=grid_gmarket" rel="noopener noreferrer nofollow">
                    <img src="https://img.linkprice.com/files/glink/gmarket/20191120/5dd48d65a8c5e_120_60.jpg" width="120" height="60" alt="G마켓" style={{ border: 0 }} />
                  </a>
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
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-50 text-center">
                 <p className="text-[10px] text-slate-400 font-medium">
                   이 사이트는 제휴 마케팅 활동의 일환으로,<br/>
                   이에 따른 일정액의 수수료를 제공받습니다.
                 </p>
              </div>
            </div>

            <div className="w-full flex justify-center items-center mt-8 mb-4 overflow-hidden">
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
        )}
      </div>
      <Footer />
    </div>
  );
}