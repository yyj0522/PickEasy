"use client";

import { useState, useEffect } from 'react';

export function DesktopSideBanners() {
  const [bannerTop, setBannerTop] = useState<number>(164);

  useEffect(() => {
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
  }, []);

  return (
    <>
      <div 
        className="fixed right-1/2 mr-[500px] hidden min-[1350px]:block z-10 transition-all duration-75 ease-linear"
        style={{ top: `${bannerTop}px` }}
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
      <div 
        className="fixed left-1/2 ml-[500px] hidden min-[1350px]:block z-10 transition-all duration-75 ease-linear"
        style={{ top: `${bannerTop}px` }}
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