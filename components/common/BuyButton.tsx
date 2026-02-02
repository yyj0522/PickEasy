"use client";

import { useState, useEffect } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface BuyButtonProps {
  keyword: string; // 제품명 (예: "LG 그램 2026")
  className?: string; // 스타일 커스텀용
}

export default function BuyButton({ keyword, className }: BuyButtonProps) {
  // 기본값: 검색 링크
  const [link, setLink] = useState(
    `https://www.coupang.com/np/search?component=&q=${encodeURIComponent(keyword)}&channel=user`
  );
  const [isAffiliate, setIsAffiliate] = useState(false);

  useEffect(() => {
    const fetchLink = async () => {
      // DB에서 수동 등록된 수익 링크가 있는지 확인
      const { data } = await supabase
        .from('affiliate_links')
        .select('url')
        .eq('keyword', keyword)
        .single();

      if (data?.url) {
        setLink(data.url);
        setIsAffiliate(true); // 수익 링크임을 표시
      }
    };
    
    if (keyword) fetchLink();
  }, [keyword]);

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={className || `w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm ${
        isAffiliate 
          ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' // 수익 링크면 빨간색 (강조)
          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' // 일반 검색이면 흰색
      }`}
    >
      {isAffiliate ? <ShoppingBag className="w-4 h-4" /> : <Search className="w-4 h-4" />}
      {isAffiliate ? "최저가 구매하기" : "최저가 검색"}
    </a>
  );
}