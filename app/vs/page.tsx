"use client";

import { useState } from 'react';
import { Swords, Trophy, Loader2, ArrowRightLeft } from 'lucide-react';
import Disclaimer from '@/components/common/Disclaimer';
import BuyButton from '@/components/common/BuyButton';
import Footer from '@/components/layout/Footer';

export default function VSPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [inputs, setInputs] = useState({
    a: '',
    b: ''
  });

  const handleCompare = async () => {
    if (!inputs.a || !inputs.b) return alert("두 제품명을 모두 입력해주세요!");
    
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/vs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productA: inputs.a, productB: inputs.b }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setResult(data);
    } catch (e: any) {
      alert(e.message || "비교 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-4xl mx-auto px-4 pt-12 pb-0 w-full flex flex-col">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Swords className="w-8 h-8 text-red-500" />
            스펙 맞짱 (VS)
          </h1>
          <p className="text-gray-500">
            애매한 스펙 차이, AI가 냉정하게 승부를 가려드립니다.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-blue-600 mb-1 ml-1">🔵 BLUE CORNER</label>
            <input 
              type="text" 
              placeholder="예: 갤럭시북4 프로"
              className="w-full p-4 bg-blue-50 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold text-center placeholder:font-normal"
              value={inputs.a}
              onChange={(e) => setInputs({...inputs, a: e.target.value})}
            />
          </div>

          <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full font-black text-gray-400 italic">
            VS
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-red-600 mb-1 ml-1">🔴 RED CORNER</label>
            <input 
              type="text" 
              placeholder="예: 맥북 에어 M3"
              className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none text-lg font-bold text-center placeholder:font-normal"
              value={inputs.b}
              onChange={(e) => setInputs({...inputs, b: e.target.value})}
            />
          </div>
        </div>

        <button 
          onClick={handleCompare}
          disabled={loading}
          className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2 mb-8 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {loading ? <Loader2 className="animate-spin" /> : <ArrowRightLeft />}
          {loading ? "데이터 분석 중..." : "비교 시작하기"}
        </button>

        {result && (
          <div className="animate-fade-in space-y-6">
            <Disclaimer />
            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200 divide-x divide-gray-200">
                <div className="p-4 text-center font-bold text-blue-700 break-keep">
                  {result.productA_name}
                </div>
                <div className="p-4 text-center font-black text-gray-400 text-sm flex items-center justify-center">
                  비교 항목
                </div>
                <div className="p-4 text-center font-bold text-red-700 break-keep">
                  {result.productB_name}
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {result.specs.map((item: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-3 divide-x divide-gray-100 group hover:bg-gray-50 transition">
                    <div className={`p-4 text-center text-sm flex items-center justify-center ${item.winner === 'A' ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-gray-600'}`}>
                      {item.winner === 'A' && <Trophy className="w-3 h-3 mr-1 text-yellow-500" />}
                      {item.specA}
                    </div>
                    
                    <div className="p-4 flex items-center justify-center text-xs font-bold text-gray-500 uppercase tracking-wide bg-gray-50/30">
                      {item.category}
                    </div>
                    
                    <div className={`p-4 text-center text-sm flex items-center justify-center ${item.winner === 'B' ? 'font-bold text-red-600 bg-red-50/50' : 'text-gray-600'}`}>
                      {item.winner === 'B' && <Trophy className="w-3 h-3 mr-1 text-yellow-500" />}
                      {item.specB}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-gray-900 text-white text-center">
                <h3 className="font-bold text-yellow-400 mb-1 text-lg">AI의 최종 판정</h3>
                <p className="opacity-90">{result.final_verdict}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <BuyButton 
                keyword={result.productA_name}
                className="py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md text-sm md:text-base"
              />
              <BuyButton 
                keyword={result.productB_name}
                className="py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md text-sm md:text-base"
              />
            </div>
          </div>
        )}

        <div className="w-full mt-auto pt-[150px] mb-8 flex justify-center shrink-0">
          <div className="hidden md:block">
            <a target="_blank" href="https://click.linkprice.com/click.php?m=himart&a=A100702467&l=Oze4&u_id=" rel="noopener noreferrer">
              <img src="https://img.linkprice.com/files/glink/himart/20250630/686230aa8d3de_728x90.png" width="728" height="90" alt="광고" className="border-0" />
            </a>
            <img src="https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=Oze4&l_cd1=2&l_cd2=0" width="1" height="1" alt="" style={{ display: 'none' }} />
          </div>

          <div className="block md:hidden">
            <a target="_blank" href="https://click.linkprice.com/click.php?m=himart&a=A100702467&l=xGIZ&u_id=" rel="noopener noreferrer">
              <img 
                src="https://img.linkprice.com/files/glink/himart/20250630/686230aa8c8c3_468x60.png" 
                width="468" 
                height="60" 
                alt="광고" 
                className="border-0 max-w-full h-auto rounded-lg shadow-sm"
              />
            </a>
            <img src="https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=xGIZ&l_cd1=2&l_cd2=0" width="1" height="1" alt="" style={{ display: 'none' }} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}