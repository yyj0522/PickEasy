// components/layout/Footer.tsx

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-12 mt-20">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-2">PickEasy</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              결정 장애를 위한 AI 기반 쇼핑 큐레이션 서비스.<br/>
              복잡한 스펙 비교부터 PC 견적까지, 고민은 저희가 할게요.
            </p>
          </div>
        </div>
        
        <hr className="border-gray-200 my-6" />
        
        <div className="text-[11px] text-gray-400 space-y-2">
          <p>
            ※ 픽이지는 쿠팡 파트너스 및 링크프라이스 활동을 통해 일정액의 수수료를 제공받을 수 있습니다.<br/>
            이 포스팅은 제휴마케팅이 포함된 광고로 커미션을 지급 받습니다.
          </p>
          
          {/* ⭐ 면책 조항 */}
          <p>
            ※ 본 사이트에서 제공하는 AI 견적 및 제품 정보는 참고용이며, 제조사의 사정에 따라 스펙이 변경될 수 있습니다.<br/>
            최종 구매 결정 및 호환성 확인에 대한 책임은 구매자 본인에게 있습니다.
          </p>
          
          <p className="mt-4">© 2026 PickEasy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}