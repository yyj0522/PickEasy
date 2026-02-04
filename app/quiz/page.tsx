"use client";

import { useState, useEffect, Suspense } from 'react'; 
import { useSearchParams} from 'next/navigation'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Fan, Armchair, ChevronRight, Loader2, Tv, Mouse, Keyboard, Tablet, Wind, Headphones, Watch, Camera, Plug } from 'lucide-react';
import Disclaimer from '@/components/common/Disclaimer';
import BuyButton from '@/components/common/BuyButton';
import Footer from '@/components/layout/Footer';
// ⭐ 배너 컴포넌트 임포트
import { DesktopSideBanners, MobileBottomBanner } from '@/components/ads/AdBanners';

const CATEGORIES = [
  { id: 'laptop', name: '노트북', icon: Monitor },
  { id: 'monitor', name: '모니터', icon: Tv },
  { id: 'mouse', name: '마우스', icon: Mouse },
  { id: 'keyboard', name: '키보드', icon: Keyboard },
  { id: 'tablet', name: '태블릿', icon: Tablet },
  { id: 'cleaner', name: '청소기', icon: Fan },
  { id: 'dryer', name: '드라이기', icon: Wind },
  { id: 'audio', name: '음향기기', icon: Headphones },
  { id: 'massage', name: '안마기', icon: Armchair },
  { id: 'watch', name: '워치', icon: Watch },
  { id: 'camera', name: '카메라', icon: Camera },
  { id: 'accessory', name: 'IT소품/잡화', icon: Plug },
];

const QUIZ_DATA: Record<string, any> = {
  laptop: {
    questions: [
      { id: 'usage', text: '가장 주된 사용 용도는 무엇인가요?', options: ['단순 사무/인강/웹서핑', '포토샵/일러스트 디자인', '영상편집/3D 작업', '배그/AAA급 게임', '개발/코딩'] },
      { id: 'budget', text: '예산 범위는 어떻게 되나요?', options: ['60만원 이하 (가성비)', '60~120만원', '120~200만원', '200만원 이상 (하이엔드)'] },
      { id: 'size', text: '선호하는 화면 크기는?', options: ['13~14인치 (휴대성 최우선)', '15~16인치 (밸런스)', '17인치 이상 (시원한 화면)'] },
      { id: 'weight', text: '무게는 어느 정도가 좋으세요?', options: ['1kg 초반 (매일 들고 다님)', '1.5kg 내외 (가끔 이동)', '2kg 이상 (주로 거치)'] },
      { id: 'os', text: '운영체제 포함 여부는?', options: ['윈도우 포함 필수', '프리도스 (직접 설치 가능/저렴)', '맥OS (MacBook)'] },
      { id: 'brand', text: '선호하는 브랜드 성향은?', options: ['삼성/LG (AS 편리함)', '애플 (디자인/생태계)', '에이수스/MSI 등 (가성비/성능)'] }
    ]
  },
  desktop: {
    questions: [
      { id: 'purpose', text: 'PC를 맞추는 주 목적은?', options: ['가정용/사무용', '주식 트레이딩', '게이밍 (FHD/QHD)', '게이밍 (4K 풀옵션)', '영상편집/방송'] },
      { id: 'budget', text: '본체 기준 가용 예산은?', options: ['50만원 이하', '80~120만원', '150~200만원', '250만원 이상'] },
      { id: 'cpu_brand', text: '선호하는 CPU 제조사는?', options: ['인텔 (Intel)', 'AMD (라이젠)', '상관없음/잘 모름'] },
      { id: 'case_size', text: '케이스 크기와 디자인은?', options: ['미들타워 (표준/확장성)', '미니타워 (컴팩트)', '화이트 감성', '화려한 RGB LED'] },
      { id: 'assembly', text: '조립 상태는?', options: ['완조립 본체 (받아서 바로 사용)', '부품만 구매 (직접 조립 가능)'] }
    ]
  },
  monitor: {
    questions: [
      { id: 'usage', text: '주로 무엇을 보시나요?', options: ['FPS 게임 (주사율 중요)', '영화/영상 감상 (화질 중요)', '문서 작업/코딩', '디자인/색감 작업'] },
      { id: 'size', text: '원하는 화면 크기는?', options: ['24인치 (한눈에 파악)', '27인치 (가장 대중적)', '32인치 (대화면)', '34인치 이상 (와이드)'] },
      { id: 'resolution', text: '해상도를 선택해주세요.', options: ['FHD (1920x1080)', 'QHD (2560x1440)', '4K UHD (3840x2160)'] },
      { id: 'panel', text: '선호하는 패널 종류는?', options: ['IPS (선명한 색감/시야각)', 'VA (명암비/영상)', 'OLED (최고 화질)', '잘 모름'] },
      { id: 'stand', text: '스탠드 기능이 필요한가요?', options: ['피벗(세로)/엘리베이션 필요', '모니터암 사용 예정 (베사홀 필수)', '기본 스탠드면 충분'] }
    ]
  },
  mouse: {
    questions: [
      { id: 'purpose', text: '주 사용 목적은?', options: ['FPS/롤 게임 랭크용', '일반 사무/웹서핑', '손목 보호 (버티컬)', '휴대용/노트북용'] },
      { id: 'connection', text: '연결 방식은?', options: ['유선 (배터리 걱정X)', '무선 (동글/2.4GHz)', '블루투스 겸용'] },
      { id: 'hand_size', text: '손 크기는 어떤 편인가요?', options: ['작은 편 (F9 이하)', '보통 (F10)', '큰 편 (F11 이상)'] },
      { id: 'weight', text: '선호하는 무게는?', options: ['초경량 (60g 미만)', '적당한 무게감 (80g 내외)', '묵직한 무게 (100g 이상)'] },
      { id: 'noise', text: '클릭 소음은?', options: ['딸깍거리는 소리 (구분감)', '무소음/저소음 (조용한 곳)'] }
    ]
  },
  keyboard: {
    questions: [
      { id: 'switch', text: '원하는 키감(스위치)은?', options: ['청축 (찰칵거림/PC방)', '적축 (부드러움/게임)', '갈축 (적당한 구분감)', '무접점 (보글보글)'] },
      { id: 'layout', text: '키보드 배열(크기)은?', options: ['풀배열 (숫자키패드 있음)', '텐키리스 (숫자키 없음)', '미니배열 (휴대용)'] },
      { id: 'connection', text: '연결 방식은?', options: ['유선 전용', '무선/블루투스 지원'] },
      { id: 'usage', text: '주 사용 환경은?', options: ['혼자 쓰는 방 (소음 상관없음)', '사무실 (조용해야 함)', '게임용 (반응속도 중요)'] },
      { id: 'material', text: '하우징/키캡 소재 선호?', options: ['PBT 키캡 (번들거림 적음)', '알루미늄 하우징 (묵직함)', '기본 플라스틱'] }
    ]
  },
  tablet: {
    questions: [
      { id: 'os', text: '선호하는 운영체제는?', options: ['아이패드 (iOS)', '갤럭시탭 (Android)', '가성비 레노버/샤오미'] },
      { id: 'purpose', text: '가장 큰 구매 목적은?', options: ['넷플릭스/유튜브 머신', '필기/공부/다이어리', '전문 드로잉/디자인', '고사양 모바일 게임'] },
      { id: 'size', text: '화면 크기는?', options: ['8인치대 (한손 휴대)', '10~11인치 (표준)', '12.9인치 이상 (노트북급)'] },
      { id: 'connectivity', text: '네트워크 연결 방식은?', options: ['Wi-Fi 전용 (테더링 사용)', '5G/LTE 셀룰러 (유심 사용)'] },
      { id: 'storage', text: '저장 용량은?', options: ['64GB (스트리밍 위주)', '128~256GB (일반적)', '512GB 이상 (영상 저장)'] }
    ]
  },
  cleaner: {
    questions: [
      { id: 'type', text: '청소기 타입은?', options: ['로봇청소기', '무선 스틱청소기', '유선/업소용'] },
      { id: 'brand', text: '선호하는 브랜드는?', options: ['삼성/LG (AS 확실)', '로보락/드리미 (최신 기술)', '다이슨', '가성비 브랜드'] },
      { id: 'environment', text: '주거 환경 특징은?', options: ['문턱이 있음', '반려동물 있음 (털 관리)', '아이/매트 있음', '원룸/작은 평수'] },
      { id: 'mop', text: '물걸레 기능 필요성?', options: ['자동 세척/건조 필수 (올인원)', '물걸레만 되면 됨', '흡입 전용 선호'] },
      { id: 'budget', text: '예산대는?', options: ['50만원 이하', '50~100만원', '100~150만원', '가격 상관없음'] }
    ]
  },
  dryer: {
    questions: [
      { id: 'brand', text: '선호 브랜드?', options: ['다이슨 (에어랩/슈퍼소닉)', '차이슨 (가성비)', 'JMW/유닉스 (전문가용)'] },
      { id: 'feature', text: '가장 중요한 기능은?', options: ['압도적인 건조 속도', '열 제어/머릿결 보호', '스타일링/볼륨', '가벼운 무게'] },
      { id: 'noise', text: '소음 민감도는?', options: ['조용한 제품 선호', '소리 커도 바람만 세면 됨'] },
      { id: 'accessory', text: '노즐/구성품은?', options: ['기본 노즐만 있으면 됨', '디퓨저/스타일링 노즐 필요', '거치대 포함 선호'] },
      { id: 'budget', text: '예산은?', options: ['5만원 이하', '5~20만원', '30만원 이상'] }
    ]
  },
  audio: {
    questions: [
      { id: 'type', text: '제품 형태는?', options: ['무선 이어폰 (커널형)', '무선 이어폰 (오픈형)', '무선 헤드폰', '블루투스 스피커'] },
      { id: 'anc', text: '노이즈 캔슬링(ANC) 기능?', options: ['강력한 성능 필수', '있으면 좋음', '필요 없음'] },
      { id: 'sound', text: '선호하는 음색은?', options: ['저음 강조 (둥둥거림)', '플랫/하이파이 (원음)', '보컬 강조 (선명함)'] },
      { id: 'use_case', text: '주 사용 환경은?', options: ['대중교통 출퇴근', '운동/러닝', '조용한 실내 감상', '통화 업무'] },
      { id: 'brand', text: '선호 브랜드는?', options: ['애플/삼성 (스마트폰 호환)', '소니/보스 (성능 위주)', 'QCY 등 가성비'] }
    ]
  },
  massage: {
    questions: [
      { id: 'type', text: '제품 종류는?', options: ['전신 안마의자', '소형 마사지기 (목/어깨)', '다리/발 마사지기', '마사지건'] },
      { id: 'space', text: '설치 공간 여유는?', options: ['넓음 (대형 안마의자 가능)', '좁음 (컴팩트/폴딩형)', '휴대용 필요'] },
      { id: 'pain_point', text: '집중 케어 부위는?', options: ['거북목/승모근', '허리/골반', '종아리 알/발바닥', '전신 피로'] },
      { id: 'intensity', text: '선호하는 압 강도는?', options: ['아주 강력한 압 (경락 느낌)', '부드러운 공기압', '온열 위주 찜질'] },
      { id: 'budget', text: '예산 범위는?', options: ['10만원 이하', '10~50만원', '100~300만원', '300만원 이상'] }
    ]
  },
  watch: {
    questions: [
      { id: 'phone', text: '현재 사용하는 폰은?', options: ['아이폰 (Apple)', '갤럭시 (Samsung)', '기타 안드로이드'] },
      { id: 'main_use', text: '주 사용 목적은?', options: ['패션/알림 확인', '러닝/운동 기록', '수면/건강 모니터링', '골프 거리 측정'] },
      { id: 'battery', text: '배터리 중요도는?', options: ['매일 충전해도 됨 (기능 우선)', '최소 2~3일은 가야 함', '일주일 이상 (밴드형)'] },
      { id: 'design', text: '선호하는 디자인은?', options: ['사각형 (애플워치 스타일)', '원형 (일반 시계 스타일)', '상관없음'] },
      { id: 'material', text: '소재 선호도는?', options: ['알루미늄 (가벼움/무광)', '스테인리스 (고급감/유광)', '티타늄 (내구성)'] }
    ]
  },
  camera: {
    questions: [
      { id: 'type', text: '원하는 카메라는?', options: ['미러리스 (렌즈교환)', '하이엔드 똑딱이 (렌즈일체)', '액션캠 (고프로 등)'] },
      { id: 'purpose', text: '주 촬영 대상은?', options: ['유튜브 브이로그 (영상)', '인물/스냅 사진', '여행/풍경', '제품/쇼핑몰 촬영'] },
      { id: 'resolution', text: '영상 촬영 스펙은?', options: ['FHD면 충분', '4K 필수', '4K 60프레임 이상/10bit'] },
      { id: 'brand', text: '선호하는 색감/브랜드?', options: ['소니 (AF/선명함)', '캐논 (인물 색감)', '후지필름 (필름 감성)', '니콘/파나소닉'] },
      { id: 'budget', text: '렌즈 포함 예산은?', options: ['100만원 이하', '150~250만원', '300만원 이상'] }
    ]
  },
  accessory: {
    questions: [
      { id: 'type', text: '찾으시는 제품 종류는?', options: ['충전기/케이블 (고속충전)', '데스크테리어 (마우스패드/정리함)', 'PC부품 (키캡/스위치/쿨러)', '저장장치 (USB/SSD 케이스)'] },
      { id: 'budget', text: '가격대는 어느 정도?', options: ['알리 천원마트급 (5천원 이하)', '가성비 (1~3만원)', '고급형 (Baseus/Ugreen 등)'] },
      { id: 'priority', text: '가장 중요한 점은?', options: ['무조건 싼 가격', '빠른 배송 (꽁돈대첩)', '디자인/감성', '내구성/성능'] },
      { id: 'quantity', text: '구매 수량은?', options: ['1개만 필요', '여러 개 쟁여두기 (묶음배송)', '대량 구매'] }
    ]
  }
};

function QuizContent() {
  const [step, setStep] = useState<'category' | 'question' | 'loading' | 'result'>('category');
  const [category, setCategory] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [result, setResult] = useState<any>(null);
  const searchParams = useSearchParams();
  const directQuery = searchParams.get('q');

  useEffect(() => {
    if (directQuery) {
      setStep('loading');
      submitDirectSearch(directQuery);
    }
  }, [directQuery]);

  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    setStep('question');
    setCurrentQIdx(0);
    setAnswers({});
  };

  const handleAnswer = (answer: string) => {
    const currentQ = QUIZ_DATA[category].questions[currentQIdx];
    const newAnswers = { ...answers, [currentQ.id]: answer };
    setAnswers(newAnswers);

    if (currentQIdx < QUIZ_DATA[category].questions.length - 1) {
      setCurrentQIdx(prev => prev + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: any) => {
    setStep('loading');
    try {
      const res = await fetch('/api/recommend/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, answers: finalAnswers }),
      });
      const data = await res.json();
      setResult(data);
      setStep('result');
    } catch (e) {
      alert("오류가 발생했습니다. 다시 시도해주세요.");
      setStep('category');
    }
  };

  const submitDirectSearch = async (query: string) => {
    try {
      const res = await fetch('/api/recommend/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }), 
      });
      const data = await res.json();
      setResult(data);
      setStep('result');
    } catch (e) {
      alert("검색 중 오류가 발생했습니다.");
      setStep('category');
    }
  };

  return (
    // ⭐ min-h-[1000px] 추가하여 컨텐츠 높이 확보 (PC 배너 짤림 방지)
    <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto px-4 pt-12 pb-4 md:py-12 w-full relative min-h-[1000px]">
      
      {/* ⭐ PC용 좌우 고정 배너 컴포넌트 */}
      <DesktopSideBanners />

      {step === 'category' && (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-3">무엇을 찾고 계신가요?</h1>
            <p className="text-gray-500">카테고리를 선택하면 5~7개의 정밀 분석 질문이 시작됩니다.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => handleCategorySelect(cat.id)} 
                className="p-6 bg-white border border-gray-200 rounded-2xl hover:border-black hover:bg-gray-50 transition flex flex-col items-center gap-3 shadow-sm group"
              >
                <cat.icon className="w-10 h-10 text-gray-400 group-hover:text-black group-hover:scale-110 transition-all" />
                <span className="font-bold text-gray-800">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'question' && (
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
            <span>질문 {currentQIdx + 1}</span>
            <span>{QUIZ_DATA[category].questions.length}개 중</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full mb-8">
            <div 
              className="bg-black h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentQIdx + 1) / QUIZ_DATA[category].questions.length) * 100}%` }}
            ></div>
          </div>

          <AnimatePresence mode='wait'>
            <motion.div
              key={currentQIdx}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-900 leading-snug break-keep">
                {QUIZ_DATA[category].questions[currentQIdx].text}
              </h2>
              <div className="space-y-3">
                {QUIZ_DATA[category].questions[currentQIdx].options.map((option: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    className="w-full p-4 text-left border rounded-xl hover:bg-black hover:text-white transition flex items-center justify-between group bg-white shadow-sm"
                  >
                    <span className="font-medium">{option}</span>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {step === 'loading' && (
        <div className="text-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          <h2 className="text-xl font-bold">
            {directQuery ? `"${directQuery}" 분석 중...` : "최신 데이터를 분석 중입니다..."}
          </h2>
          <p className="text-gray-500">AI가 조건에 맞는 제품을 찾고 있습니다.</p>
        </div>
      )}

      {step === 'result' && result && (
        <div className="animate-fade-in pb-10 max-w-2xl mx-auto w-full">
          <h2 className="text-2xl font-bold mb-2 text-center">맞춤 추천 결과</h2>
          <p className="text-center text-gray-600 mb-8 max-w-lg mx-auto bg-gray-50 p-3 rounded-lg text-sm break-keep">
            "{result.analysis}"
          </p>
          
          <Disclaimer />

          <div className="space-y-6 mt-6">
            {result.recommendations.map((item: any, idx: number) => (
              <div key={idx} className="bg-white border rounded-2xl p-6 shadow-md relative overflow-hidden group hover:border-blue-300 transition-all">
                {idx === 0 && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                    MD's PICK
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {idx + 1}위
                      </span>
                      <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    </div>
                    
                    <div className="text-sm font-semibold text-blue-600 mb-2">
                      최저가 약 {parseInt(item.price_estimate).toLocaleString()}원
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3 break-keep">
                      {item.reason}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag: string, tIdx: number) => (
                        <span key={tIdx} className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <BuyButton 
                  keyword={item.name}
                  className="mt-4 w-full py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition"
                />
              </div>
            ))}
          </div>

          <button 
            onClick={() => {
              setStep('category');
              window.history.pushState({}, '', '/quiz'); 
            }}
            className="mt-8 w-full py-3 text-gray-500 hover:text-black underline text-sm"
          >
            다시 하기
          </button>
        </div>
      )}

      {/* ⭐ 모바일용 하단 배너 컴포넌트 */}
      <MobileBottomBanner />

    </div>
  );
}

export default function QuizPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
        <QuizContent />
      </Suspense>
      <Footer />
    </div>
  );
}