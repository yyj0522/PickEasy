"use client";

import { useState, useEffect } from 'react';

export function CategoryCoupangBanners() {
  // 헤더(64px) + 간격(100px) = 164px
  const [bannerTop, setBannerTop] = useState<number>(164);

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

  return (
    <>
      {/* ------------------ 좌측 배너: 쿠팡 정적 이미지 ------------------ */}
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
    </>
  );
}