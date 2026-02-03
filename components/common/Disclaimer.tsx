import { AlertTriangle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-6 flex gap-3 items-start shadow-sm">
      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="text-sm text-amber-900">
        <strong className="block font-bold mb-1">구매 전 필독 (면책 조항)</strong>
        <p className="leading-relaxed opacity-90">
          이 견적은 AI가 실시간으로 분석한 참고용 데이터입니다. 
          <span className="font-bold underline decoration-amber-500 underline-offset-2 ml-1">
            실제 제품의 스펙, 가격, 호환성은 판매 페이지와 다를 수 있습니다.
          </span><br/>
          반드시 아래 <span className="font-bold text-blue-600">[최저가 보기]</span> 버튼을 눌러 상세 정보를 직접 확인하시기 바랍니다.
        </p>
      </div>
    </div>
  );
}