"use client";

import { useEffect, useState, use } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, ShoppingBag, Info } from 'lucide-react';
import Disclaimer from '@/components/common/Disclaimer';
import Footer from '@/components/layout/Footer';
// ⭐ [변경] 새로 만든 쿠팡 전용 배너 파일에서 import
import { CategoryCoupangBanners } from '@/components/ads/CoupangBanners';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category', slug)
        .eq('status', 'APPROVED') 
        .order('created_at', { ascending: false });

      if (data) setProducts(data);
      setLoading(false);
    };

    if (slug) fetchProducts();
  }, [slug]);

  const categoryName = slug ? slug.toUpperCase() : '';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* justify-start 및 min-h-[1000px] 적용 */}
      <div className="max-w-6xl mx-auto px-4 py-12 flex-1 w-full justify-start min-h-[1000px] relative">
        
        {/* ⭐ 쿠팡 전용 배너 컴포넌트 */}
        <CategoryCoupangBanners />

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{categoryName} 추천 리스트</h1>
          <p className="text-gray-500">엄선된 최신 제품들을 확인하세요.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((item) => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex flex-col p-6 h-full">
                  
                  <div className="flex-1 mb-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-3 leading-snug break-keep group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    
                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                      {item.specs}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <div>
                      <span className="text-xs text-gray-400 font-medium block mb-0.5">최저가 예상</span>
                      <span className="font-bold text-gray-900 text-xl">
                        {item.price?.toLocaleString()}원
                      </span>
                    </div>
                    
                    <a 
                      href={item.affiliate_url || `https://www.coupang.com/np/search?q=${encodeURIComponent(item.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 flex items-center gap-1.5 transition shadow-sm hover:shadow"
                    >
                      <ShoppingBag className="w-4 h-4" /> 구매정보
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 border-t border-gray-200 pt-8">
              <div className="bg-gray-100 rounded-xl p-6 text-sm text-gray-600 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-bold text-gray-800">
                      제휴 마케팅 활동 안내
                    </p>
                    <p>
                      본 사이트는 <strong>링크프라이스</strong> 및 <strong>쿠팡 파트너스</strong> 활동의 일환으로, 
                      이에 따른 일정액의 수수료를 제공받을 수 있습니다. 
                      이는 사이트 운영과 더 나은 서비스를 제공하는 데 큰 도움이 됩니다.
                    </p>
                  </div>
                </div>
              </div>
              
              <Disclaimer />
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500">
              현재 등록된 추천 제품이 없습니다.<br/>
              조금만 기다려주세요!
            </p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}