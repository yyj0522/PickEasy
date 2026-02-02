"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, Download, Check, ExternalLink, Trash2, Home, LogOut, Lock, Image as ImageIcon, Search } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIES = [
  { slug: 'laptop', name: '노트북' },
  { slug: 'desktop', name: '데스크탑' },
  { slug: 'monitor', name: '모니터' },
  { slug: 'mouse', name: '마우스' },
  { slug: 'keyboard', name: '키보드' },
  { slug: 'tablet', name: '태블릿' },
  { slug: 'cleaner', name: '청소기' },
  { slug: 'dryer', name: '드라이기' },
  { slug: 'audio', name: '음향기기' },
  { slug: 'massage', name: '안마기' },
  { slug: 'smartwatch', name: '워치' },
  { slug: 'camera', name: '카메라' },
];

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const savedLogin = localStorage.getItem('admin_login');
    if (savedLogin === 'true') setIsLogin(true);
  }, []);

  useEffect(() => {
    if (isLogin) fetchProducts(selectedCat.slug);
  }, [isLogin, selectedCat]);

  const checkLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsLogin(true);
      localStorage.setItem('admin_login', 'true');
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  const handleLogout = () => {
    setIsLogin(false);
    localStorage.removeItem('admin_login');
    setPassword('');
  };

  const fetchProducts = async (catSlug: string) => {
    try {
      const res = await fetch('/api/admin/get-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          secret: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
          category: catSlug 
        }),
      });

      if (!res.ok) throw new Error("서버 통신 오류");
      const data = await res.json();
      if (data.success) setProducts(data.products || []);
    } catch (e: any) {
      console.error(e);
    }
  };

  const generateProducts = async () => {
    if (!confirm(`'${selectedCat.name}' 카테고리의 최신 인기 제품 20개를 AI로 수집하시겠습니까?\n(기존 데이터에 추가됩니다)`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/generate-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          secret: process.env.NEXT_PUBLIC_ADMIN_PASSWORD, 
          category: selectedCat.slug, 
          categoryName: selectedCat.name 
        }),
      });

      if (!res.ok) {
         const errorText = await res.text();
         throw new Error(errorText);
      }

      const data = await res.json();
      if (data.success) {
        alert(`${data.count}개 제품 수집 성공!`);
        fetchProducts(selectedCat.slug);
      } else {
        alert("실패: " + data.error);
      }
    } catch(e: any) { 
      alert("오류: " + e.message); 
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, updates: any) => {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  };

  const approveProduct = async (id: string) => {
    await updateProduct(id, { status: 'APPROVED' });
  };

  const deleteProduct = async (id: string) => {
    if(!confirm("삭제하시겠습니까?")) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  if (!isLogin) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
          <div className="inline-block p-4 bg-gray-100 rounded-full mb-4"><Lock className="w-6 h-6" /></div>
          <h1 className="text-xl font-bold mb-6">관리자 접속</h1>
          <input 
            type="password" 
            placeholder="비밀번호" 
            className="w-full border p-3 rounded-lg mb-4 text-center" 
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkLogin()} 
          />
          <button onClick={checkLogin} className="w-full bg-black text-white p-3 rounded-lg font-bold">접속</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">🛠️ 제품 관리</h1>
            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">ADMIN</span>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="px-3 py-1.5 bg-white border rounded-md text-sm hover:bg-gray-50 flex gap-2 items-center"><Home className="w-4 h-4"/> 메인</Link>
            <button onClick={handleLogout} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-sm font-bold hover:bg-red-100"><LogOut className="w-4 h-4"/></button>
          </div>
        </div>
        
        {/* 툴바 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-wrap gap-4 items-center sticky top-4 z-30">
          <select 
            className="border-2 border-gray-100 p-2.5 rounded-lg font-bold text-gray-700 outline-none focus:border-blue-500"
            value={selectedCat.slug}
            onChange={(e) => setSelectedCat(CATEGORIES.find(c => c.slug === e.target.value)!)}
          >
            {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>

          <button 
            onClick={generateProducts}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition text-sm shadow-md"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Download className="w-4 h-4" />}
            AI 수집 ({selectedCat.name})
          </button>
          
          <div className="ml-auto text-sm text-gray-500">
             총 <strong className="text-black">{products.length}</strong>개
          </div>
        </div>

        {/* ✅ 그리드 강제 고정: PC에서 무조건 3개 (md:grid-cols-3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
          {products.map((item) => (
            <div 
              key={item.id} 
              className={`
                group bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-full
                hover:shadow-lg transition-all duration-300
                ${item.status === 'APPROVED' ? 'border-green-400 ring-1 ring-green-400' : 'border-gray-200'}
              `}
            >
              {/* 이미지 영역 */}
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden border-b border-gray-50">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    onError={(e) => e.currentTarget.src='https://placehold.co/300?text=No+Image'} 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 text-xs gap-1">
                    <ImageIcon className="w-8 h-8 opacity-30"/> <span>No Image</span>
                  </div>
                )}
                {/* 상태 뱃지 */}
                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold shadow-sm ${item.status === 'APPROVED' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-black'}`}>
                  {item.status}
                </div>
              </div>

              {/* 정보 입력 영역 */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                {/* 제목 */}
                <input 
                  className="font-bold text-base w-full bg-transparent border-b border-transparent focus:border-gray-300 outline-none pb-1 truncate"
                  defaultValue={item.title}
                  title={item.title}
                  placeholder="제품명"
                  onBlur={(e) => updateProduct(item.id, { title: e.target.value })}
                />
                
                {/* 스펙 */}
                <textarea 
                    className="w-full text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-transparent focus:bg-white focus:border-gray-300 outline-none resize-none h-28 leading-relaxed scrollbar-hide"
                    defaultValue={item.specs}
                    placeholder="상세 스펙 (줄바꿈으로 구분)"
                    onBlur={(e) => updateProduct(item.id, { specs: e.target.value })}
                />

                {/* 가격 및 URL */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₩</span>
                     <input 
                       className="text-sm font-bold border p-2 pl-6 rounded-lg w-full bg-gray-50 focus:bg-white focus:border-gray-300 outline-none" 
                       defaultValue={item.price}
                       type="number"
                       placeholder="가격"
                       onBlur={(e) => updateProduct(item.id, { price: parseInt(e.target.value) || 0 })}
                     />
                  </div>
                  <input 
                    className="text-xs border p-2 rounded-lg w-full bg-gray-50 focus:bg-white focus:border-gray-300 outline-none text-gray-500 truncate" 
                    defaultValue={item.image_url}
                    placeholder="이미지URL"
                    onBlur={(e) => updateProduct(item.id, { image_url: e.target.value })}
                  />
                </div>

                {/* 파트너스 링크 */}
                <div className="flex gap-2 items-center">
                   <input 
                     className="flex-1 text-xs border border-blue-100 p-2 rounded-lg bg-blue-50/50 focus:bg-white focus:border-blue-400 outline-none text-blue-600 truncate" 
                     placeholder="파트너스 수익 링크"
                     defaultValue={item.affiliate_url}
                     onBlur={(e) => updateProduct(item.id, { affiliate_url: e.target.value })}
                   />
                   <a 
                     href={`https://www.coupang.com/np/search?q=${encodeURIComponent(item.title || '')}`} 
                     target="_blank" 
                     className="w-8 h-8 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-500 flex items-center justify-center shrink-0"
                     title="쿠팡 검색"
                   >
                     <Search className="w-4 h-4" />
                   </a>
                </div>
              </div>

              {/* 하단 버튼 */}
              <div className="flex border-t border-gray-100 divide-x divide-gray-100">
                {item.status !== 'APPROVED' ? (
                  <button 
                    onClick={() => approveProduct(item.id)}
                    className="flex-1 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white py-3 text-sm font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> 승인
                  </button>
                ) : (
                  <div className="flex-1 py-3 text-sm font-bold text-gray-400 flex items-center justify-center cursor-default bg-gray-50">
                    <Check className="w-4 h-4 mr-1.5" /> 승인됨
                  </div>
                )}
                <button 
                  onClick={() => deleteProduct(item.id)}
                  className="w-14 text-red-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}