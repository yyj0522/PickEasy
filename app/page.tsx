"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';
import { Search, Monitor, Armchair, Fan, Calculator, Swords, TrendingUp, Cpu, Tv, Mouse, Keyboard, Tablet, Wind, Headphones, Watch, Camera, Plug } from 'lucide-react'; // ⭐ Plug 추가
import Footer from '@/components/layout/Footer';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const handleSearch = () => {
    if (!query.trim()) return alert("검색어를 입력해주세요!");
    router.push(`/quiz?q=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      <section className="relative w-full py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold tracking-wide mb-2">
            AI 기반 IT 제품 큐레이션
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            고민은 AI가,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              선택은 쉽고 빠르게.
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            노트북, 로봇청소기, 안마기... 스펙 공부하느라 지치셨나요?<br />
            용도만 말하면 AI가 최적의 모델을 찾아드립니다.
          </p>

          <div className="relative max-w-xl mx-auto mt-8 shadow-xl rounded-2xl">
            <input 
              type="text" 
              placeholder="예: 100만원대 가성비 노트북 추천해줘" 
              className="w-full h-14 pl-6 pr-14 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 text-lg shadow-sm transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button 
              onClick={handleSearch}
              className="absolute right-2 top-2 h-10 w-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 w-full">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">어떤 도움이 필요하신가요?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          
          <Link href="/pc-builder" className="group relative overflow-hidden rounded-3xl bg-black p-8 text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <Calculator className="w-6 h-6 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold mb-2">AI 조립 PC 견적</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                "배그 풀옵션 150만원" 이라고만 말하세요.<br/>
                호환성 체크부터 부품 추천까지 3초 컷.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all"></div>
          </Link>

          <Link href="/vs" className="group relative overflow-hidden rounded-3xl bg-gray-100 p-8 hover:bg-gray-200 transition-all duration-300">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Swords className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">VS 스펙 비교</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              그램 vs 갤럭시북, 다이슨 vs 차이슨.<br/>
              애매한 스펙 차이, 표 하나로 종결합니다.
            </p>
          </Link>

          <Link href="/rank" className="group relative overflow-hidden rounded-3xl bg-blue-50 p-8 border border-blue-100 hover:border-blue-200 transition-all duration-300">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">이달의 랭킹</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              지금 가장 많이 팔리는 제품은 뭘까요?<br/>
              데이터 기반 트렌드 랭킹을 확인하세요.
            </p>
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8 mb-20 w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">카테고리별 AI 추천</h2>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
          {[
            { name: "노트북", icon: Monitor, slug: "laptop" },
            { name: "모니터", icon: Tv, slug: "monitor" },
            { name: "마우스", icon: Mouse, slug: "mouse" },
            { name: "키보드", icon: Keyboard, slug: "keyboard" },
            { name: "태블릿", icon: Tablet, slug: "tablet" },
            { name: "청소기", icon: Fan, slug: "cleaner" },
            { name: "드라이기", icon: Wind, slug: "dryer" },
            { name: "음향기기", icon: Headphones, slug: "audio" },
            { name: "안마기", icon: Armchair, slug: "massage" },
            { name: "워치", icon: Watch, slug: "watch" },
            { name: "카메라", icon: Camera, slug: "camera" },
            { name: "IT소품/잡화", icon: Plug, slug: "accessory" }, 
          ].map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all group">
              <cat.icon className="w-8 h-8 text-gray-400 group-hover:text-blue-600 transition-colors" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <Footer />

    </div>
  );
}