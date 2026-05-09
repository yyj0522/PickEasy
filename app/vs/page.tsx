"use client";

import { useState } from 'react';
import { Trophy, Loader2, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import Disclaimer from '@/components/common/Disclaimer';
import Footer from '@/components/layout/Footer';
import SecurityModal from '@/components/common/SecurityModal';

export default function VSPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);

  const [inputs, setInputs] = useState({
    a: '',
    b: ''
  });

  const handleStartCompare = () => {
    if (!inputs.a || !inputs.b) return alert("두 제품명을 모두 입력해주세요!");
    setIsSecurityOpen(true);
  };

  const handleVerified = async (token: string) => {
    if (!token) return;
    setIsSecurityOpen(false);
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
          turnstileToken: token
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
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
      <SecurityModal 
        isOpen={isSecurityOpen} 
        onClose={() => setIsSecurityOpen(false)} 
        onVerify={handleVerified} 
      />

      <div className="flex-1 max-w-4xl mx-auto px-4 pt-12 w-full flex flex-col pb-12">
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
            <label className="block text-xs font-bold text-blue-600 mb-2 ml-1 tracking-wider">BLUE CORNER</label>
            <input 
              type="text" 
              maxLength={30}
              placeholder="예: 갤럭시북4 프로"
              className="w-full p-4 bg-blue-50/50 border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg font-bold text-center placeholder:font-normal placeholder:text-blue-300 transition text-slate-800"
              value={inputs.a}
              onChange={(e) => setInputs({...inputs, a: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && handleStartCompare()}
            />
          </div>

          <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full font-black text-slate-400 italic shadow-inner">
            VS
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-red-600 mb-2 ml-1 tracking-wider">RED CORNER</label>
            <input 
              type="text" 
              maxLength={30}
              placeholder="예: 맥북 에어 M3"
              className="w-full p-4 bg-red-50/50 border border-red-100 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-lg font-bold text-center placeholder:font-normal placeholder:text-red-300 transition text-slate-800"
              value={inputs.b}
              onChange={(e) => setInputs({...inputs, b: e.target.value})}
              onKeyDown={(e) => e.key === 'Enter' && handleStartCompare()}
            />
          </div>
        </div>

        <button 
          onClick={handleStartCompare}
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
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}