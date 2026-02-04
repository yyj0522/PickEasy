"use client";

import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full text-gray-800">
        <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-gray-200">개인정보 처리방침</h1>
        
        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold mb-3 text-gray-900">1. 총칙</h2>
            <p className="text-sm text-gray-600">
              PickEasy('이하 회사')는 이용자의 개인정보를 소중히 다루며, "개인정보보호법" 등 관련 법령을 준수하고 있습니다.
              회사는 개인정보처리방침을 통하여 이용자가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-gray-900">2. 수집하는 개인정보 항목 및 방법</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>회사는 별도의 회원가입 없이 서비스를 제공하며, 이용자의 이름, 전화번호 등 민감한 개인정보를 직접 수집하지 않습니다.</li>
              <li>단, 서비스 이용 과정에서 <strong>IP 주소, 쿠키(Cookie), 방문 일시, 서비스 이용 기록, 기기 정보</strong> 등이 자동으로 생성되어 수집될 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-gray-900">3. 개인정보의 수집 및 이용 목적</h2>
            <p className="text-sm text-gray-600 mb-2">회사는 수집한 정보를 다음의 목적을 위해 활용합니다.</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>서비스 제공에 따른 콘텐츠 제공 및 맞춤형 서비스 제공</li>
              <li>접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계</li>
              <li><strong>제휴 마케팅 활동(쿠팡 파트너스, 링크프라이스 등)에 따른 트래픽 추적 및 실적 집계</strong></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-gray-900">4. 쿠키(Cookie)의 운영 및 거부</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                회사는 이용자에게 맞춤형 서비스를 제공하고, 제휴 마케팅 성과 측정을 위해 이용자의 정보를 저장하고 수시로 불러오는 '쿠키(Cookie)'를 사용합니다.
              </p>
              <p>
                특히, <strong>쿠팡 파트너스 및 링크프라이스 활동</strong>의 일환으로 제3자(제휴사)가 이용자의 브라우저에 쿠키를 저장하거나 읽을 수 있습니다.
                이용자는 쿠키 설치에 대한 선택권을 가지고 있으며, 웹 브라우저 설정을 통해 모든 쿠키를 허용하거나, 거부할 수 있습니다.
              </p>
              <p className="bg-gray-100 p-3 rounded mt-2">
                ※ 설정 방법 예시(크롬): 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트 데이터
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3 text-gray-900">5. 개인정보 관련 고충 처리</h2>
            <p className="text-sm text-gray-600">
              회사는 개인정보보호와 관련하여 이용자가 의견과 불만을 제기할 수 있는 창구를 개설하고 있습니다.<br/>
              문의사항이 있으시면 아래 연락처로 연락 주시기 바랍니다.
            </p>
            <div className="mt-3 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm">
              <p><strong>이메일:</strong> projectc029@gmail.com</p>
            </div>
          </section>

          <section className="pt-8 border-t border-gray-100">
            <p className="text-xs text-gray-500">본 방침은 2026년 2월 5일부터 시행됩니다.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}