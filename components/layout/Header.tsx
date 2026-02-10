import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <Link href="/" className="flex items-center">
          <div className="relative" style={{ width: '144px', height: '40px' }}>
            <Image 
              src="/logo.png" 
              alt="PickEasy Logo" 
              fill
              sizes="288px" 
              className="object-contain"
              style={{ 
                imageRendering: '-webkit-optimize-contrast',
              }}
              priority
              quality={100}
            />
          </div>
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
          <Link href="/dictionary" className="text-green-600 font-bold hover:text-green-700 transition flex items-center gap-1">
             IT용어사전
             <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full">NEW</span>
          </Link>
        </nav>
        
        <div className="w-36 hidden md:block"></div> 
      </div>
    </header>
  );
}