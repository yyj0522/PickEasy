import Link from 'next/link';


export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:bg-blue-600 transition-colors">
            E
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">EasyPick</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
          <Link href="/quiz" className="text-blue-600 font-bold hover:text-blue-700 transition">
            맞춤추천
          </Link>
          <Link href="/vs" className="text-blue-600 font-bold hover:text-blue-700 transition">
            VS비교
          </Link>
          <Link href="/pc-builder" className="text-blue-600 font-bold hover:text-blue-700 transition">
            AI조립견적
          </Link>
          <Link href="/rank" className="text-blue-600 font-bold hover:text-blue-700 transition">
            랭킹
          </Link>
        </nav>
        <div className="w-8"></div> 
      </div>
    </header>
  );
}