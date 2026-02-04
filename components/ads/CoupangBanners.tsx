"use client";

import { useState, useEffect, useRef } from 'react';

export function CategoryCoupangBanners() {
  const [bannerTop, setBannerTop] = useState<number>(164);
  const [showBanners, setShowBanners] = useState(false); // 화면 너비 체크용 상태
  const rightBannerRef = useRef<HTMLDivElement>(null);

  // 1. 화면 너비가 1550px 이상일 때만 배너를 렌더링하도록 설정
  useEffect(() => {
    const checkWidth = () => {
      // 1550px 이상일 때만 true
      setShowBanners(window.innerWidth >= 1550);
    };

    // 초기 실행
    checkWidth();

    // 리사이즈 감지
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // 2. 스크롤 위치 계산 로직 (푸터 침범 방지)
  useEffect(() => {
    if (!showBanners) return; // 배너가 없으면 계산 안 함

    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const headerHeight = 64; 
      const topSpacing = 100;
      const defaultTop = headerHeight + topSpacing; 
      const bannerHeight = 600;
      const gap = 50; 

      const bannerBottomPos = defaultTop + bannerHeight;
      const limit = footerRect.top - gap;

      if (bannerBottomPos > limit) {
        setBannerTop(limit - bannerHeight);
      } else {
        setBannerTop(defaultTop);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [showBanners]); // showBanners가 변경될 때마다 재실행

  // 3. 우측 쿠팡 파트너스 스크립트 동적 로드
  useEffect(() => {
    // 배너가 안 보이거나 ref가 없으면 실행 중지
    if (!showBanners || !rightBannerRef.current) return;
    
    // 이미 스크립트가 로드되었으면 중복 실행 방지
    if (rightBannerRef.current.childElementCount > 0) return;

    const scriptUrl = "https://ads-partners.coupang.com/g.js";
    
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    
    script.onload = () => {
        const executeScript = document.createElement("script");
        executeScript.innerHTML = `
            new PartnersCoupang.G({
                "id":963104,
                "template":"carousel",
                "trackingCode":"AF1306700",
                "width":"160",
                "height":"600",
                "tsource":""
            });
        `;
        if (rightBannerRef.current) {
            rightBannerRef.current.appendChild(executeScript);
        }
    };

    rightBannerRef.current.appendChild(script);
  }, [showBanners]); // showBanners가 true가 될 때 실행

  // 화면이 좁으면 아예 렌더링하지 않음 (HTML에서 제거) -> 스크립트 오류 방지
  if (!showBanners) return null;

  return (
    <>
      {/* ------------------ 좌측 배너: 쿠팡 정적 이미지 ------------------ */}
      <div 
        className="fixed right-1/2 mr-[600px] z-10 transition-all duration-75 ease-linear"
        style={{ top: `${bannerTop}px` }}
      >
        <a href="https://link.coupang.com/a/dGidMQ" target="_blank" referrerPolicy="unsafe-url">
            <img 
                src="https://ads-partners.coupang.com/banners/963103?subId=&traceId=V0-301-5f9bd61900e673c0-I963103&w=160&h=600" 
                alt="쿠팡 광고" 
                width="160" 
                height="600"
                className="border-0 block"
            />
        </a>
      </div>

      {/* ------------------ 우측 배너: 쿠팡 동적 카루셀 (스크립트) ------------------ */}
      <div 
        ref={rightBannerRef}
        className="fixed left-1/2 ml-[600px] z-10 transition-all duration-75 ease-linear bg-white"
        style={{ top: `${bannerTop}px`, width: '160px', height: '600px' }}
      >
        {/* 스크립트가 이곳에 inject 됩니다 */}
      </div>
    </>
  );
}