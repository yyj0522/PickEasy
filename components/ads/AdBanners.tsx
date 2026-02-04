"use client";

import { useState, useEffect } from 'react';

// PC용 좌우 고정 배너 (스크롤 시 푸터 침범 방지 로직 포함)
export function DesktopSideBanners() {
  const [bannerCenter, setBannerCenter] = useState<string | number>('50%');

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const bannerHeight = 600;
      const bannerHalfHeight = bannerHeight / 2;
      const gap = 50; // 푸터와의 최소 간격

      // 배너의 현재 하단 위치 (뷰포트 기준)
      const bannerBottomPos = (viewportHeight / 2) + bannerHalfHeight;
      // 한계선 (뷰포트 기준) = 푸터 상단 - 간격
      const limit = footerRect.top - gap;

      if (bannerBottomPos > limit) {
        // 배너가 한계선을 넘으면 위로 밀어올림
        setBannerCenter(limit - bannerHalfHeight);
      } else {
        // 평소에는 화면 중앙 고정
        setBannerCenter('50%');
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll(); // 초기 실행

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <>
      {/* ------------------ PC용 좌측 배너 (G마켓) ------------------ */}
      <div 
        className="fixed -translate-y-1/2 right-1/2 mr-[500px] hidden min-[1350px]:block z-10 transition-all duration-75 ease-linear"
        style={{ top: bannerCenter }}
      >
        <a 
          href="https://click.linkprice.com/click.php?m=gmarket&a=A100702467&l=bREd&u_id=" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img 
            src="https://img.linkprice.com/files/glink/gmarket/20221004/KW0dOfhjl1900_160x600.jpg" 
            width="160" 
            height="600" 
            alt="G마켓 광고" 
            className="border-0"
          />
        </a>
        <img 
          src="https://track.linkprice.com/lpshow.php?m_id=gmarket&a_id=A100702467&p_id=0000&l_id=bREd&l_cd1=2&l_cd2=0" 
          width="1" 
          height="1" 
          alt=""
          style={{ display: 'none' }}
        />
      </div>

      {/* ------------------ PC용 우측 배너 (하이마트) ------------------ */}
      <div 
        className="fixed -translate-y-1/2 left-1/2 ml-[500px] hidden min-[1350px]:block z-10 transition-all duration-75 ease-linear"
        style={{ top: bannerCenter }}
      >
        <a 
          href="https://click.linkprice.com/click.php?m=himart&a=A100702467&l=ttdJ&u_id=" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img 
            src="https://img.linkprice.com/files/glink/himart/20260129/697b259ee19a1_160x600.png" 
            width="160" 
            height="600" 
            alt="하이마트 광고" 
            className="border-0"
          />
        </a>
        <img 
          src="https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=ttdJ&l_cd1=2&l_cd2=0" 
          width="1" 
          height="1" 
          alt=""
          style={{ display: 'none' }}
        />
      </div>
    </>
  );
}

// 모바일용 하단 배너
export function MobileBottomBanner() {
  return (
    <div className="mt-6 w-full flex justify-center min-[1350px]:hidden">
      <a 
        href="https://click.linkprice.com/click.php?m=himart&a=A100702467&l=pzGE&u_id=" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        <img 
          src="https://img.linkprice.com/files/glink/himart/20260129/697b259eaf863_320x100.png" 
          width="320" 
          height="100" 
          alt="하이마트 모바일 광고" 
          className="border-0 max-w-full h-auto rounded-lg shadow-sm"
        />
      </a>
      <img 
        src="https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=pzGE&l_cd1=2&l_cd2=0" 
        width="1" 
        height="1" 
        alt=""
        style={{ display: 'none' }}
      />
    </div>
  );
}