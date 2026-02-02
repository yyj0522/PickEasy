import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* 로고 영역 */}
        <Link href="/" className="flex items-center">
          <div className="relative" style={{ width: '144px', height: '40px' }}>
            <Image 
              src="/logo.png" 
              alt="EasyPick Logo" 
              fill // 부모 컨테이너를 꽉 채우도록 설정
              sizes="288px" // 실제 width(144)의 2배를 할당하여 고해상도 픽셀 밀도 대응
              className="object-contain"
              style={{ 
                imageRendering: '-webkit-optimize-contrast', // 크롬/사파리에서 대비와 선명도 강제 향상
              }}
              priority
              quality={100} // 압축 없이 최대 화질 유지
            />
          </div>
        </Link>

        {/* 중앙 메뉴 */}
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
        
        <div className="w-36 hidden md:block"></div> 
      </div>
    </header>
  );
}