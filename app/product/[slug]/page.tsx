"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, ArrowLeft, CheckCircle} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Footer from '@/components/layout/Footer';
import TermHighlighter from '@/components/common/TermHighlighter';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProductDetailPage() {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const params = useParams();
  const slug = params?.slug as string; 
  const productName = slug ? decodeURIComponent(slug) : '';

  useEffect(() => {
    async function fetchProductData() {
      if (!productName) return;

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
            요청하신 제품명: <span className="font-bold text-black">{productName || '알 수 없음'}</span><br/>
            순위 변동으로 인해 삭제되었거나 주소가 잘못되었습니다.
        </p>
        <Link href="/rank" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">랭킹 보러가기</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8 w-full flex-1 relative">
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
                <h2 className="text-2xl font-bold mb-4 border-b border-slate-100 pb-2">픽이지 AI 리뷰</h2>
                <div className="prose prose-slate max-w-none text-slate-700 leading-8 text-lg">
                   <p><TermHighlighter text={product.expert_review || "상세 리뷰 데이터가 준비 중입니다."} /></p>
                </div>
            </section>

            <section className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                <h2 className="text-lg font-bold mb-2 text-blue-900">이런 분께 강력 추천합니다</h2>
                <p className="text-blue-800"><TermHighlighter text={product.usage_scenario || "정보 없음"} /></p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-xl p-5">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="text-green-500"></span> 장점
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed"><TermHighlighter text={product.pros} /></p>
                </div>
                <div className="border border-slate-200 rounded-xl p-5">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                         <span className="text-red-500"></span> 단점
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed"><TermHighlighter text={product.cons} /></p>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-4">상세 스펙</h2>
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-600 leading-loose">
                    <TermHighlighter text={product.spec_detail} />
                </div>
            </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}