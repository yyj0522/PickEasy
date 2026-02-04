"use client";

import { useState, useEffect, useRef } from 'react';

export function CategoryCoupangBanners() {
  // 헤더(64px) + 간격(100px) = 164px (AdBanners.tsx와 높이 통일)
  const [bannerTop, setBannerTop] = useState<number>(164);
  const rightBannerRef = useRef<HTMLDivElement>(null);

  // 1. 스크롤 위치 계산 로직 (푸터 침범 방지)
  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      
      const headerHeight = 64; 
      const topSpacing = 100; // 헤더로부터의 거리
      const defaultTop = headerHeight + topSpacing; 
      
      const bannerHeight = 600;
      const gap = 50; // 푸터와의 최소 간격

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
  }, []);

  // 2. 우측 쿠팡 파트너스 스크립트 동적 로드
  useEffect(() => {
    if (!rightBannerRef.current) return;
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
  }, []);

  return (
    <>
      {/* ------------------ 좌측 배너: 쿠팡 정적 이미지 ------------------ */}
      {/* ⭐ 수정됨: mr-[600px] (중앙 컨텐츠 6xl 대응), min-[1550px] (화면 너비 확보) */}
      <div 
        className="fixed right-1/2 mr-[600px] hidden min-[1550px]:block z-10 transition-all duration-75 ease-linear"
        style={{ top: `${bannerTop}px` }}
      >
        <a href="https://link.coupang.com/a/dGidMQ" target="_blank" referrerPolicy="unsafe-url">
            <img 
                src="https://ads-partners.coupang.com/banners/963103?subId=&traceId=V0-301-5f9bd61900e673c0-I963103&w=160&h=600" 
                alt="쿠팡 광고" 
                width="160" 
                height="600"
                className="border-0"
            />
        </a>
      </div>

      {/* ------------------ 우측 배너: 쿠팡 동적 카루셀 (스크립트) ------------------ */}
      {/* ⭐ 수정됨: ml-[600px], min-[1550px] */}
      <div 
        ref={rightBannerRef}
        className="fixed left-1/2 ml-[600px] hidden min-[1550px]:block z-10 transition-all duration-75 ease-linear bg-white"
        style={{ top: `${bannerTop}px`, width: '160px', height: '600px' }}
      >
        {/* 스크립트 inject 위치 */}
      </div>
    </>
  );
}