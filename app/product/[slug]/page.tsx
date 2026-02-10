"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import { DesktopSideBanners } from '@/components/ads/AdBanners';
import TermHighlighter from '@/components/common/TermHighlighter';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Banner = {
  id: string;
  href: string;
  imgSrc: string;
  width: number;
  height: number;
  alt: string;
  trackingSrc?: string;
  isCoupang?: boolean;
};

const DESKTOP_BANNERS: Banner[] = [
  { 
    id: 'gmarket_d',
    href: 'https://click.linkprice.com/click.php?m=gmarket&a=A100702467&l=6775&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/gmarket/20221004/K00HwzuaHqe00_728x90.jpg',
    width: 728, height: 90, alt: 'G마켓',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=gmarket&a_id=A100702467&p_id=0000&l_id=6775&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'lenovo_d',
    href: 'https://click.linkprice.com/click.php?m=lenovo&a=A100702467&l=DKT0&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/lenovo/20250516/000vtShk00000_레노버 728x90.png',
    width: 728, height: 90, alt: '레노버',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=lenovo&a_id=A100702467&p_id=0000&l_id=DKT0&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'himart_d',
    href: 'https://click.linkprice.com/click.php?m=himart&a=A100702467&l=Oze4&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/himart/20250630/686230aa8d3de_728x90.png',
    width: 728, height: 90, alt: '하이마트',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=Oze4&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'coupang_d',
    href: 'https://link.coupang.com/a/dJuZZw',
    imgSrc: 'https://ads-partners.coupang.com/banners/963102?subId=&traceId=V0-301-5f9bd61900e673c0-I963102&w=728&h=90',
    width: 728, height: 90, alt: '쿠팡',
    isCoupang: true
  },
  {
    id: 'aliexpress_d',
    href: 'https://click.linkprice.com/click.php?m=aliexpress&a=A100702467&l=8PXG&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/aliexpress/20230509/AO0161bmd0580_728x90.png',
    width: 728, height: 90, alt: '알리익스프레스',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=aliexpress&a_id=A100702467&p_id=0000&l_id=8PXG&l_cd1=2&l_cd2=0'
  }
];

const MOBILE_BANNERS: Banner[] = [
  { 
    id: 'himart_m1',
    href: 'https://click.linkprice.com/click.php?m=himart&a=A100702467&l=TJzp&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/himart/20260129/697b2513716b9_468x60.png',
    width: 468, height: 60, alt: '하이마트',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=TJzp&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'himart_m2',
    href: 'https://click.linkprice.com/click.php?m=himart&a=A100702467&l=xGIZ&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/himart/20250630/686230aa8c8c3_468x60.png',
    width: 468, height: 60, alt: '하이마트',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=xGIZ&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'gmarket_m',
    href: 'https://click.linkprice.com/click.php?m=gmarket&a=A100702467&l=A7tz&u_id=',
    imgSrc: 'https://img.linkprice.com/files/glink/gmarket/20221004/W800QYbQ7zS00_468x60.jpg',
    width: 468, height: 60, alt: 'G마켓',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=gmarket&a_id=A100702467&p_id=0000&l_id=A7tz&l_cd1=2&l_cd2=0'
  }
];

const BOTTOM_GRID_BANNERS = [
  { href: 'https://click.linkprice.com/click.php?m=himart&a=A100702467&l=nyIP&u_id=', imgSrc: 'https://img.linkprice.com/files/glink/himart/20260129/697b25135c355_120x60.png', alt: '하이마트' },
  { href: 'https://click.linkprice.com/click.php?m=gmarket&a=A100702467&l=1638&u_id=', imgSrc: 'https://img.linkprice.com/files/glink/gmarket/20191120/5dd48d65a8c5e_120_60.jpg', alt: 'G마켓' },
  { href: 'https://link.coupang.com/a/dJuj4r', imgSrc: 'https://ads-partners.coupang.com/banners/964225?subId=&traceId=V0-301-5f9bd61900e673c0-I964225&w=120&h=60', alt: '쿠팡', isCoupang: true },
  { href: 'https://click.linkprice.com/click.php?m=aliexpress&a=A100702467&l=Cq7c&u_id=', imgSrc: 'https://img.linkprice.com/files/glink/aliexpress/20240328/600GgnC4eLAW0_120_60.png', alt: '알리익스프레스' }
];

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [randomDesktop, setRandomDesktop] = useState<Banner | null>(null);
  const [randomMobile, setRandomMobile] = useState<Banner | null>(null);
  
  const productName = decodeURIComponent(params.slug);

  useEffect(() => {
    setRandomDesktop(DESKTOP_BANNERS[Math.floor(Math.random() * DESKTOP_BANNERS.length)]);
    setRandomMobile(MOBILE_BANNERS[Math.floor(Math.random() * MOBILE_BANNERS.length)]);

    async function fetchProductData() {
      setLoading(true);
      
      const { data } = await supabase
        .from('rankings')
        .select('data, category')
        .order('created_at', { ascending: false });

      if (data) {
        let foundItem = null;
        let foundCategory = '';

        for (const categoryData of data) {
          if (!categoryData.data?.list) continue;
          
          const found = categoryData.data.list.find((item: any) => 
            item.name.trim() === productName.trim()
          );
          
          if (found) {
            foundItem = found;
            foundCategory = categoryData.category;
            break;
          }
        }

        if (foundItem) {
          setProduct({ ...foundItem, categoryName: foundCategory });
        }
      }
      setLoading(false);
    }

    fetchProductData();
  }, [productName]);

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin w-10 h-10 text-blue-600" /></div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">제품을 찾을 수 없습니다.</h2>
        <p className="text-slate-500 mb-6">
            요청하신 제품명: <span className="font-bold text-black">{productName}</span><br/>
            순위 변동으로 인해 삭제되었거나 주소가 잘못되었습니다.
        </p>
        <Link href="/rank" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">랭킹 보러가기</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8 w-full flex-1 relative">
        <DesktopSideBanners />

        <div className="mb-6">
          <Link href="/rank" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            전체 랭킹으로 돌아가기
          </Link>
        </div>

        <div className="mb-10 text-center">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mb-3">
                현재 인기 랭킹 진입 중
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">
                {product.name}
            </h1>
            <p className="text-xl font-bold text-slate-600">
                예상 가격: <span className="text-blue-600">{product.price_estimate?.toLocaleString()}원~</span>
            </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-10 shadow-sm">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" /> AI 핵심 요약
            </h3>
            <p className="text-slate-700 leading-relaxed text-lg">
                <TermHighlighter text={product.summary} />
            </p>
        </div>

        <div className="space-y-8 mb-12">
            
            <section>
                <h2 className="text-2xl font-bold mb-4 border-b border-slate-100 pb-2">🧐 픽이지 전문가 리뷰</h2>
                <div className="prose prose-slate max-w-none text-slate-700 leading-8 text-lg">
                   <p><TermHighlighter text={product.expert_review || "상세 리뷰 데이터가 준비 중입니다."} /></p>
                </div>
            </section>

            <section className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                <h2 className="text-lg font-bold mb-2 text-blue-900">💡 이런 분께 강력 추천합니다</h2>
                <p className="text-blue-800"><TermHighlighter text={product.usage_scenario || "정보 없음"} /></p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-xl p-5">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="text-green-500">👍</span> 장점
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed"><TermHighlighter text={product.pros} /></p>
                </div>
                <div className="border border-slate-200 rounded-xl p-5">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                         <span className="text-red-500">👎</span> 단점
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed"><TermHighlighter text={product.cons} /></p>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-4">⚙️ 상세 스펙</h2>
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-600 leading-loose">
                    <TermHighlighter text={product.spec_detail} />
                </div>
            </section>
        </div>

        <div className="my-12">
            <div className="bg-slate-900 text-white rounded-t-xl p-4 text-center font-bold">
                최저가 가격비교 바로가기
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-100 p-2 rounded-b-xl">
                {BOTTOM_GRID_BANNERS.map((banner, idx) => (
                    <a key={idx} href={banner.href} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-lg flex items-center justify-center hover:shadow-md transition-shadow h-[80px]">
                        <img src={banner.imgSrc} alt={banner.alt} className="max-w-full max-h-full" />
                    </a>
                ))}
            </div>
        </div>

        <div className="w-full flex justify-center items-center my-8 overflow-hidden">
            <div className="hidden md:block">
                {randomDesktop && (
                <a href={randomDesktop.href} target="_blank" rel="noopener noreferrer nofollow">
                    <img 
                    src={randomDesktop.imgSrc} 
                    alt={randomDesktop.alt} 
                    width={randomDesktop.width} 
                    height={randomDesktop.height} 
                    className="max-w-full h-auto rounded-lg"
                    {...(randomDesktop.isCoupang && { referrerPolicy: 'unsafe-url' })}
                    />
                    {randomDesktop.trackingSrc && (
                    <img src={randomDesktop.trackingSrc} width="1" height="1" alt="" style={{ display: 'none' }} />
                    )}
                </a>
                )}
            </div>

            <div className="block md:hidden">
                {randomMobile && (
                <a href={randomMobile.href} target="_blank" rel="noopener noreferrer nofollow">
                    <img 
                    src={randomMobile.imgSrc} 
                    alt={randomMobile.alt} 
                    width={randomMobile.width} 
                    height={randomMobile.height} 
                    className="max-w-full h-auto rounded-lg"
                    />
                    {randomMobile.trackingSrc && (
                    <img src={randomMobile.trackingSrc} width="1" height="1" alt="" style={{ display: 'none' }} />
                    )}
                </a>
                )}
            </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}