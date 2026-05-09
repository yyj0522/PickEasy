"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, Loader2 } from 'lucide-react';
import Footer from '@/components/layout/Footer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DictionaryPage() {
  const [terms, setTerms] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [categories, setCategories] = useState<string[]>(['전체']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTerms() {
      const { data } = await supabase.from('dictionary').select('*').order('term');
      if (data) {
        setTerms(data);
        const cats = Array.from(new Set(data.map(d => d.category || '기타'))).sort();
        setCategories(['전체', ...cats]);
      }
      setLoading(false);
    }
    getTerms();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const termFromHash = decodeURIComponent(window.location.hash.replace('#', ''));
      if (termFromHash) {
        setSearch(termFromHash);
      }
    }
  }, []);

  const filteredTerms = terms.filter(t => {
    const matchesSearch = t.term.toLowerCase().includes(search.toLowerCase()) || 
                          t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12 w-full flex-1 relative">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-black flex items-center justify-center gap-2 mb-3 text-slate-900">
                    픽이지 IT 용어 백과
                </h1>
                <p className="text-slate-500">어려운 IT 용어, 전문가가 쉽게 설명해드립니다.</p>
            </div>

            <div className="mb-6 relative">
                <input 
                    type="text" 
                    placeholder="궁금한 용어를 검색해보세요 (예: 주사율, OLED)" 
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm text-lg"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
            </div>

            <div className="mb-8 flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                            selectedCategory === cat 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-20 text-center flex justify-center">
                    <Loader2 className="animate-spin text-green-600 w-10 h-10" />
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredTerms.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl text-slate-400">
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        filteredTerms.map((item) => (
                            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-md font-bold">
                                        {item.category || '기타'}
                                    </span>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {item.term}
                                    </h2>
                                </div>
                                <p className="text-slate-700 leading-relaxed text-lg">
                                    {item.description}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
        <Footer />
    </div>
  );
}