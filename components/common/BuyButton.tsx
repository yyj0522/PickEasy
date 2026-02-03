"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BuyButtonProps {
  keyword: string; 
  className?: string;
}

export default function BuyButton({ keyword, className }: BuyButtonProps) {
  const [link, setLink] = useState(
    `https://www.coupang.com/np/search?component=&q=${encodeURIComponent(keyword)}&channel=user`
  );
  const [isAffiliate, setIsAffiliate] = useState(false);
  const hasLogged = useRef(false); // 중복 카운팅 방지

  useEffect(() => {
    if (!keyword) return;

    const init = async () => {
      // 1. 커미션 링크 확인 (내 DB 조회)
      const { data } = await supabase
        .from('affiliate_links')
        .select('url')
        .eq('keyword', keyword)
        .single();

      if (data?.url) {
        setLink(data.url);
        setIsAffiliate(true);
      }

      // 2. 통계 카운팅 (Q6 핵심: 랭킹/VS 등 어디서든 노출되면 카운트 +1)
      // 개발 모드(localhost)에서는 카운팅 제외하고 싶으면 process.env.NODE_ENV 체크 추가 가능
      if (!hasLogged.current) {
        hasLogged.current = true;
        
        // 없으면 insert, 있으면 count + 1 (RPC 없이 upsert 활용)
        // 먼저 해당 키워드가 있는지 확인
        const { data: stats } = await supabase
          .from('product_stats')
          .select('id, count')
          .eq('keyword', keyword)
          .single();

        if (stats) {
          await supabase.from('product_stats').update({ count: stats.count + 1 }).eq('id', stats.id);
        } else {
          await supabase.from('product_stats').insert({ keyword, count: 1 });
        }
      }
    };
    
    init();
  }, [keyword]);

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={className || `w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm ${
        isAffiliate 
          ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}
    >
      {isAffiliate ? <ShoppingBag className="w-4 h-4" /> : <Search className="w-4 h-4" />}
      {isAffiliate ? "최저가 구매하기" : "최저가 검색"}
    </a>
  );
}