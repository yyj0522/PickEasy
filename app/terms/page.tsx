"use client";

import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full text-gray-800">
        <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-gray-200">이용약관</h1>
        
        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-3 text-gray-900">제1조 (목적)</h2>
            <p className="text-sm text-gray-600">
              본 약관은 PickEasy(이하 "회사")가 제공하는 웹사이트 및 제반 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-gray-900">제2조 (서비스의 성격 및 책임의 한계)</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                1. 회사는 이용자에게 상품에 대한 정보와 추천 서비스를 제공하는 <strong>정보 제공자(큐레이터)</strong>이며, 상품을 직접 판매하는 통신판매 당사자가 아닙니다.
              </p>
              <p>
                2. 회사가 제공하는 AI 견적, 가격 정보, 상품 스펙 등은 참고용 정보이며, 실제 판매처의 정보와 다를 수 있습니다.
              </p>
              <p>
                3. 이용자가 제휴 링크(쿠팡, 하이마트 등)를 통해 이동한 외부 쇼핑몰에서 발생한 <strong>구매, 결제, 배송, 환불 등에 관한 책임은 해당 판매처와 이용자에게 있으며, 회사는 이에 대해 어떠한 법적 책임도 지지 않습니다.</strong>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-gray-900">제3조 (저작권의 귀속)</h2>
            <p className="text-sm text-gray-600">
              회사가 작성한 저작물(AI 분석 결과, 큐레이션 콘텐츠, UI 디자인 등)에 대한 저작권 및 기타 지적재산권은 회사에 귀속됩니다. 이용자는 이를 무단으로 복제, 배포하거나 상업적으로 이용할 수 없습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-gray-900">제4조 (서비스 이용의 제한)</h2>
            <p className="text-sm text-gray-600">
              회사는 이용자가 본 약관을 위반하거나 시스템에 부하를 주는 행위(해킹, 매크로 등)를 할 경우, 사전 통보 없이 서비스 이용을 제한할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-gray-900">제5조 (제휴 마케팅 공개)</h2>
            <p className="text-sm text-gray-600">
              본 서비스 내의 일부 링크는 쿠팡 파트너스 및 링크프라이스 등 제휴 마케팅 활동의 일환으로 포함되어 있으며, 이용자의 구매 발생 시 회사는 일정액의 수수료를 제공받을 수 있습니다. 이는 서비스 운영 비용으로 사용됩니다.
            </p>
          </section>

          <section className="pt-8 border-t border-gray-100">
            <p className="text-xs text-gray-500">본 약관은 2026년 2월 5일부터 적용됩니다.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}