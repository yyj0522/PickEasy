"use client";

import { useState, useRef, useEffect } from 'react';
import { Calculator, Cpu, Loader2, RotateCcw, MessageSquarePlus, Share2, Download, Info } from 'lucide-react';
import { toPng } from 'html-to-image';
import Disclaimer from '@/components/common/Disclaimer';
import Footer from '@/components/layout/Footer';
import SecurityModal from '@/components/common/SecurityModal';

export default function PCBuilderPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isRefined, setIsRefined] = useState(false);
  const [refinementRequest, setRefinementRequest] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [actionType, setActionType] = useState<'create' | 'refine' | null>(null);

  const [input, setInput] = useState({
    budget: '',
    usage: '',
    preferences: ''
  });

  useEffect(() => {
    const now = new Date();
    setCurrentDateStr(`${now.getFullYear()}년 ${now.getMonth() + 1}월`);
  }, []);

  const handleStartCreate = () => {
    if (!input.budget || !input.usage) return alert("예산과 용도를 입력해주세요!");
    setActionType('create');
    setIsSecurityOpen(true);
  };

  const handleStartRefine = () => {
    if (!refinementRequest) return alert("수정할 내용을 입력해주세요!");
    if (isRefined) return alert("수정 요청은 1회만 가능합니다.");
    setActionType('refine');
    setIsSecurityOpen(true);
  };

  const handleVerified = async (token: string) => {
    if (!token) return;
    setIsSecurityOpen(false);
    setLoading(true);

    try {
      if (actionType === 'create') {
        setResult(null);
        setIsRefined(false);

        const res = await fetch('/api/recommend/pc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'initial', ...input, turnstileToken: token }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "견적 생성 중 오류가 발생했습니다.");
        setResult(data);
      } 
      else if (actionType === 'refine') {
        const res = await fetch('/api/recommend/pc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            type: 'refine', 
            previousResult: result, 
            refinementRequest,
            turnstileToken: token
          }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "수정 중 오류가 발생했습니다.");
        setResult(data);
        setIsRefined(true);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleSaveImage = async () => {
    if (!resultRef.current) return;
    setIsSaving(true);

    try {
      const dataUrl = await toPng(resultRef.current, { 
        cacheBust: true, 
        backgroundColor: '#ffffff',
        pixelRatio: 2
      });
      
      const link = document.createElement('a');
      link.download = `PickEasy_PC견적_${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('이미지 저장 실패:', error);
      alert('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;

    const shareText = `[PickEasy AI 조립PC 견적]\n\n` +
      `${result.intro}\n` +
      `예상 총액: ${result.total_price_estimate?.toLocaleString()}원\n\n` +
      result.parts.map((p: any) => `- ${p.part}: ${p.name}`).join('\n') +
      `\n\n견적 받으러 가기: ${window.location.origin}/pc-builder`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PickEasy AI 견적',
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        console.log('공유 취소');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('견적 내용이 복사되었습니다!');
      } catch (err) {
        alert('복사에 실패했습니다.');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SecurityModal 
        isOpen={isSecurityOpen} 
        onClose={() => setIsSecurityOpen(false)} 
        onVerify={handleVerified} 
      />

      <div className="flex-1 max-w-3xl mx-auto px-4 pt-12 w-full flex flex-col pb-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black mb-3 flex items-center justify-center gap-2 text-slate-900">
            AI 조립 PC 견적
          </h1>
          <p className="text-slate-500 font-medium">
            {currentDateStr ? `${currentDateStr} 최신 가격 반영!` : '실시간 가격 반영!'} 용도와 예산만 알려주세요.<br/>
            AI가 실시간으로 부품을 조합해드립니다.
          </p>
        </div>

        {!result && (
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">예산이 얼마인가요?</label>
              <input 
                type="text" 
                maxLength={70}
                placeholder="예: 150만원, 200만원 등"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-900 placeholder:text-slate-400"
                value={input.budget}
                onChange={(e) => setInput({...input, budget: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">주 용도가 무엇인가요?</label>
              <input 
                type="text" 
                maxLength={70}
                placeholder="예: 배틀그라운드 풀옵션, 4K 영상편집, 코딩용"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-900 placeholder:text-slate-400"
                value={input.usage}
                onChange={(e) => setInput({...input, usage: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">기타 요청사항 (선택)</label>
              <textarea 
                rows={3}
                maxLength={70}
                placeholder="예: 화이트 감성으로 맞춰주세요. 소음이 적었으면 좋겠어요."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition font-medium text-slate-900 placeholder:text-slate-400"
                value={input.preferences}
                onChange={(e) => setInput({...input, preferences: e.target.value})}
              />
            </div>

            <button 
              onClick={handleStartCreate}
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all hover:shadow-lg hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Cpu />}
              {loading ? "AI가 부품을 찾고 있어요..." : "AI 견적 뽑기"}
            </button>
          </div>
        )}

        {result && (
          <div className="mt-4 animate-in slide-in-from-bottom-4 duration-700 space-y-8">
            <Disclaimer />

            <div ref={resultRef} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50">
              <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                      <h2 className="font-black text-2xl flex items-center gap-2">
                          <Calculator className="w-6 h-6 text-indigo-200" /> 
                          AI 맞춤 견적서
                      </h2>
                      <span className="text-xs bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-bold text-indigo-50 border border-white/20">
                        PickEasy
                      </span>
                  </div>
                  <p className="text-indigo-100 font-medium text-sm leading-relaxed mb-6 opacity-90">
                    {result.intro}
                  </p>
                  <div className="flex items-baseline gap-1 mt-auto">
                    <span className="text-sm text-indigo-200 font-bold">예상 총 견적</span>
                    <span className="text-4xl font-black text-white ml-2 tracking-tight">
                      {result.total_price_estimate?.toLocaleString()}
                    </span>
                    <span className="text-xl font-bold text-indigo-200">원</span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100 bg-white p-2">
                {result.parts?.map((part: any, idx: number) => (
                  <div key={idx} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {part.part}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{part.name}</h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{part.reason}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block text-sm font-bold text-indigo-600">
                        {part.price?.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {result.review && (
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Info size={16} className="text-indigo-500"/> 전문가 코멘트
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    {result.review}
                  </p>
                </div>
              )}

              <div className="p-4 bg-slate-100 text-center text-[10px] text-slate-400 border-t border-slate-200 font-medium">
                  * 가격은 {currentDateStr} 기준 국내 주요 온라인 마켓 및 검색 포털 평균가이며, 실시간 변동될 수 있습니다.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleSaveImage}
                disabled={isSaving}
                className="py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-2 transition shadow-sm active:scale-95"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span>이미지 저장</span>
              </button>

              <button 
                onClick={handleShare}
                className="py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-200 active:scale-95"
              >
                <Share2 className="w-5 h-5" />
                <span>공유하기</span>
              </button>
            </div>

            {!isRefined ? (
              <div className="bg-slate-800 p-6 rounded-[2rem] text-white shadow-xl shadow-slate-300/50">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <MessageSquarePlus className="w-5 h-5 text-yellow-400" />
                  마음에 안 드시나요? (1회 수정 가능)
                </h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    maxLength={70}
                    placeholder="예: SSD 용량 1테라로 늘려줘, 화이트로 바꿔줘"
                    className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-xl focus:border-yellow-400 outline-none text-white placeholder:text-slate-400"
                    value={refinementRequest}
                    onChange={(e) => setRefinementRequest(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStartRefine()}
                  />
                  <button 
                    onClick={handleStartRefine}
                    disabled={loading}
                    className="bg-yellow-400 text-slate-900 px-6 rounded-xl font-black hover:bg-yellow-300 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "수정"}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => { setResult(null); setIsRefined(false); setRefinementRequest(''); setInput({ budget: '', usage: '', preferences: '' }); }}
                className="w-full py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 font-bold flex items-center justify-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" /> 처음부터 다시 하기
              </button>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}