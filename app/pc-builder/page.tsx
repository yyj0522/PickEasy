"use client";

import { useState, useRef } from 'react';
import { Calculator, Cpu, Loader2, RotateCcw, MessageSquarePlus, Share2, Download, Check, Copy } from 'lucide-react';
import { toPng } from 'html-to-image';
import Disclaimer from '@/components/common/Disclaimer';
import BuyButton from '@/components/common/BuyButton';
import Footer from '@/components/layout/Footer';

export default function PCBuilderPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isRefined, setIsRefined] = useState(false);
  const [refinementRequest, setRefinementRequest] = useState('');
  
  const resultRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [input, setInput] = useState({
    budget: '',
    usage: '',
    preferences: ''
  });

  const handleSubmit = async () => {
    if (!input.budget || !input.usage) return alert("예산과 용도를 입력해주세요!");
    
    setLoading(true);
    setResult(null);
    setIsRefined(false);

    try {
      const res = await fetch('/api/recommend/pc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'initial', ...input }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "오류 발생");
      }

      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!refinementRequest) return alert("수정할 내용을 입력해주세요!");
    if (isRefined) return alert("수정 요청은 1회만 가능합니다.");

    setLoading(true);

    try {
      const res = await fetch('/api/recommend/pc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'refine', 
          previousResult: result, 
          refinementRequest 
        }),
      });
      
      if (!res.ok) throw new Error("오류 발생");
      
      const data = await res.json();
      setResult(data);
      setIsRefined(true);
    } catch (e) {
      alert("견적 수정에 실패했습니다.");
    } finally {
      setLoading(false);
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
      `💡 요약: ${result.summary}\n\n` +
      result.parts.map((p: any) => `- ${p.type}: ${p.name}`).join('\n') +
      `\n\n👉 견적 받으러 가기: ${window.location.origin}/pc-builder`;

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
        alert('견적 내용이 클립보드에 복사되었습니다!\n(카카오톡 등에 붙여넣기 하세요)');
      } catch (err) {
        alert('복사에 실패했습니다.');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Calculator className="w-8 h-8 text-blue-600" />
            AI 조립 PC 견적
          </h1>
          <p className="text-gray-500">
            용도와 예산만 알려주세요. AI가 실시간 검색/비교를 통해 부품을 골라드립니다.
          </p>
        </div>

        {!result && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">예산이 얼마인가요?</label>
              <input 
                type="text" 
                placeholder="예: 150만원"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={input.budget}
                onChange={(e) => setInput({...input, budget: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">주 용도가 무엇인가요?</label>
              <input 
                type="text" 
                placeholder="예: 배틀그라운드, 영상편집"
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={input.usage}
                onChange={(e) => setInput({...input, usage: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">기타 요청사항 (자유롭게 적어주세요)</label>
              <textarea 
                rows={3}
                placeholder="예: 화이트 감성으로 맞춰주세요. 소음이 적었으면 좋겠어요. 인텔 CPU를 선호합니다."
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={input.preferences}
                onChange={(e) => setInput({...input, preferences: e.target.value})}
              />
            </div>

            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Cpu />}
              {loading ? "견적 분석 중..." : "AI 견적 뽑기"}
            </button>
          </div>
        )}

        {result && (
          <div className="mt-6 animate-fade-in space-y-6">
            <Disclaimer />

            <div ref={resultRef} className="bg-white border-2 border-blue-100 rounded-3xl overflow-hidden shadow-xl">
              <div className="bg-blue-50 p-6 border-b border-blue-100">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="font-bold text-xl flex items-center gap-2 text-blue-900">
                        <Cpu className="w-5 h-5 text-blue-600" /> 
                        AI 맞춤 견적서
                    </h2>
                    <span className="text-xs bg-white border border-blue-100 px-2 py-1 rounded font-medium text-blue-600">PickEasy</span>
                </div>
                <p className="text-blue-800 text-sm leading-relaxed">{result.summary}</p>
              </div>

              <div className="divide-y divide-gray-100 bg-white p-2">
                {result.parts.map((part: any, idx: number) => (
                  <div key={idx} className="p-4 sm:flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-wider">
                          {part.type}
                        </span>
                        <span className="text-xs text-blue-600 font-semibold">약 {parseInt(part.price_estimate).toLocaleString()}원</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base">{part.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{part.reason}</p>
                    </div>
                    
                    <div className="mt-3 sm:mt-0">
                         <BuyButton 
                          keyword={part.name} 
                          className="flex items-center justify-center gap-1 bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-black transition shadow-sm whitespace-nowrap"
                        />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 text-center text-[10px] text-gray-400 border-t border-gray-100">
                  * 가격은 실시간 변동될 수 있으며, 실제 구매 시 차이가 있을 수 있습니다.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleSaveImage}
                disabled={isSaving}
                className="py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-200 flex items-center justify-center gap-2 transition shadow-sm group"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                )}
                <span>이미지로 저장</span>
              </button>

              <button 
                onClick={handleShare}
                className="py-4 bg-[#FEE500] text-[#191919] rounded-2xl font-bold hover:bg-[#FDD835] flex items-center justify-center gap-2 transition shadow-sm group"
              >
                <Share2 className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                <span>공유하기</span>
              </button>
            </div>

            {!isRefined ? (
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <MessageSquarePlus className="w-5 h-5 text-gray-500" />
                  마음에 안 드시나요? (1회 수정 가능)
                </h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="예: 파워 용량 좀 더 넉넉하게, 램 32기가로 바꿔줘"
                    className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={refinementRequest}
                    onChange={(e) => setRefinementRequest(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                  />
                  <button 
                    onClick={handleRefine}
                    disabled={loading}
                    className="bg-gray-800 text-white px-6 rounded-xl font-bold hover:bg-black transition disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "수정"}
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => { setResult(null); setIsRefined(false); setRefinementRequest(''); }}
                className="w-full py-3 bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
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