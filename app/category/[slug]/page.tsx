"use client";

import { useEffect, useState, use } from 'react'; // ⭐ 'use' 추가
import { createClient } from '@supabase/supabase-js';
import { Loader2, ShoppingBag } from 'lucide-react';
import Disclaimer from '@/components/common/Disclaimer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ⭐ params 타입이 Promise로 변경됨
export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  // ⭐ React.use()를 사용해서 params의 포장을 뜯어야 함
  const { slug } = use(params);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      // status가 'APPROVED'인 것만 가져옴
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

  // slug가 확정된 후에 대문자 변환
  const categoryName = slug ? slug.toUpperCase() : '';

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">{categoryName} 추천 리스트</h1>
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
              <div key={item.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col">
                {/* 이미지 영역 */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img 
                    src={item.image_url || 'https://placehold.co/600x400?text=No+Image'} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>

                {/* 정보 영역 */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 bg-gray-50 p-2 rounded">
                    {item.specs}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-blue-600 text-lg">
                      {item.price?.toLocaleString()}원
                    </span>
                    
                    {/* 수익 링크 버튼 */}
                    <a 
                      href={item.affiliate_url || `https://www.coupang.com/np/search?q=${encodeURIComponent(item.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 flex items-center gap-1 transition"
                    >
                      <ShoppingBag className="w-4 h-4" /> 구매하기
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Disclaimer />
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500">
            등록된 제품이 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}