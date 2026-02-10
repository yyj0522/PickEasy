"use client";

import { useState, useEffect } from 'react';

type BannerData = {
  id: string;
  href: string;
  imgSrc: string;
  width: number;
  height: number;
  alt: string;
  trackingSrc?: string;
  isCoupang?: boolean;
};

const SIDE_BANNERS: BannerData[] = [
  {
    id: 'coupang_side',
    href: 'https://link.coupang.com/a/dJxUUj',
    imgSrc: 'https://ads-partners.coupang.com/banners/963103?subId=&traceId=V0-301-5f9bd61900e673c0-I963103&w=160&h=600',
    width: 160, height: 600, alt: '쿠팡 광고',
    isCoupang: true
  },
  {
    id: 'gmarket_side',
    href: 'https://click.linkprice.com/click.php?m=gmarket&a=A100702467&l=bREd&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/gmarket/20221004/KW0dOfhjl1900_160x600.jpg',
    width: 160, height: 600, alt: 'G마켓 광고',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=gmarket&a_id=A100702467&p_id=0000&l_id=bREd&l_cd1=2&l_cd2=0'
  },
  {
    id: 'himart_side_1',
    href: 'https://click.linkprice.com/click.php?m=himart&a=A100702467&l=ttdJ&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/himart/20260129/697b259ee19a1_160x600.png',
    width: 160, height: 600, alt: '하이마트 광고 1',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=ttdJ&l_cd1=2&l_cd2=0'
  },
  {
    id: 'himart_side_2',
    href: 'https://click.linkprice.com/click.php?m=himart&a=A100702467&l=7NPk&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/himart/20260129/697b251364079_160x600.png',
    width: 160, height: 600, alt: '하이마트 광고 2',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=7NPk&l_cd1=2&l_cd2=0'
  },
  {
    id: 'himart_side_3',
    href: 'https://click.linkprice.com/click.php?m=himart&a=A100702467&l=uNze&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/himart/20250630/686230aa8b6f4_160x600.png',
    width: 160, height: 600, alt: '하이마트 광고 3',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=uNze&l_cd1=2&l_cd2=0'
  }
];

export function DesktopSideBanners() {
  const [bannerTop, setBannerTop] = useState<number>(164);
  const [leftBanner, setLeftBanner] = useState<BannerData | null>(null);
  const [rightBanner, setRightBanner] = useState<BannerData | null>(null);

  useEffect(() => {
    const shuffled = [...SIDE_BANNERS].sort(() => 0.5 - Math.random());
    setLeftBanner(shuffled[0]);
    setRightBanner(shuffled[1]);

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

  if (!leftBanner || !rightBanner) return null;

  return (
    <>
      <div 
        className="fixed right-1/2 mr-[500px] hidden min-[1350px]:block z-10 transition-all duration-75 ease-linear"
        style={{ top: `${bannerTop}px` }}
      >
        <a 
          href={leftBanner.href} 
          target="_blank" 
          rel="noopener noreferrer"
          {...(leftBanner.isCoupang && { referrerPolicy: 'unsafe-url' })}
        >
          <img 
            src={leftBanner.imgSrc} 
            width={leftBanner.width} 
            height={leftBanner.height} 
            alt={leftBanner.alt} 
            className="border-0"
          />
        </a>
        {leftBanner.trackingSrc && (
          <img src={leftBanner.trackingSrc} width="1" height="1" alt="" style={{ display: 'none' }} />
        )}
      </div>

      <div 
        className="fixed left-1/2 ml-[500px] hidden min-[1350px]:block z-10 transition-all duration-75 ease-linear"
        style={{ top: `${bannerTop}px` }}
      >
        <a 
          href={rightBanner.href} 
          target="_blank" 
          rel="noopener noreferrer"
          {...(rightBanner.isCoupang && { referrerPolicy: 'unsafe-url' })}
        >
          <img 
            src={rightBanner.imgSrc} 
            width={rightBanner.width} 
            height={rightBanner.height} 
            alt={rightBanner.alt} 
            className="border-0"
          />
        </a>
        {rightBanner.trackingSrc && (
          <img src={rightBanner.trackingSrc} width="1" height="1" alt="" style={{ display: 'none' }} />
        )}
      </div>
    </>
  );
}
