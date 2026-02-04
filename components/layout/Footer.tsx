import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-12">
      <div className="max-w-screen-xl mx-auto px-4">
        
        {/* 상단: 브랜드 소개 및 메뉴 링크 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* 브랜드 영역 (넓게 사용) */}
          <div className="md:col-span-2">
            <h3 className="font-bold text-lg mb-3 text-gray-900">PickEasy</h3>
            <p className="text-sm text-gray-500 leading-relaxed break-keep">
              결정 장애를 위한 AI 기반 쇼핑 큐레이션 서비스.<br/>
              복잡한 스펙 비교부터 PC 견적까지, 고민은 저희가 할게요.
            </p>
          </div>

          {/* 서비스 메뉴 */}
          <div>
            <h4 className="font-bold text-sm text-gray-900 mb-3">Service</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/quiz" className="hover:text-blue-600 transition">맞춤추천</Link></li>
              <li><Link href="/vs" className="hover:text-blue-600 transition">VS비교</Link></li>
              <li><Link href="/pc-builder" className="hover:text-blue-600 transition">AI조립견적</Link></li>
              <li><Link href="/rank" className="hover:text-blue-600 transition">랭킹</Link></li>
            </ul>
          </div>

          {/* 지원 및 정책 */}
          <div>
            <h4 className="font-bold text-sm text-gray-900 mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/privacy" className="hover:text-blue-600 transition font-medium">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600 transition">
                  이용약관
                </Link>
              </li>
              <li className="pt-2">
                <span className="block text-xs text-gray-400 mb-1">제휴/오류문의</span>
                <a href="mailto:projectc029@gmail.com" className="hover:text-blue-600 transition underline">
                  projectc029@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="border-gray-200 my-8" />
        
        {/* 하단: 면책 조항 및 카피라이트 */}
        <div className="text-[11px] text-gray-400 space-y-2 leading-relaxed">
          <p className="font-medium text-gray-500">
            ※ 제휴 마케팅 활동 안내
          </p>
          <p>
            픽이지는 쿠팡 파트너스 및 링크프라이스 활동을 통해 일정액의 수수료를 제공받을 수 있습니다.<br/>
            이 포스팅은 제휴마케팅이 포함된 광고로 커미션을 지급 받습니다.
          </p>
          
          <p className="mt-2 font-medium text-gray-500">
            ※ 면책 조항
          </p>
          <p>
            본 사이트에서 제공하는 AI 견적, 제품 정보, 가격 정보는 참고용이며, 제조사 및 판매처의 사정에 따라 변경될 수 있습니다.<br/>
            최종 구매 결정 및 상품의 호환성 확인에 대한 책임은 구매자 본인에게 있습니다.
          </p>
          
          <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-2">
            <p>© 2026 PickEasy. All rights reserved.</p>
            {/* 필요하다면 사업자 정보를 여기에 추가 (개인 운영 시 생략 가능) */}
          </div>
        </div>
      </div>
    </footer>
  );
}