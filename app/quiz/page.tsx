"use client";

import { useState, useEffect, Suspense, useRef } from 'react'; 
import { useSearchParams, useRouter } from 'next/navigation'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Laptop, Monitor, Mouse, Keyboard, Tablet, Headphones, Watch, Camera, 
  Wind, Shirt, Waves, Snowflake, Refrigerator, Zap, Armchair, ChevronRight, 
  Loader2, Tv, Fan, Speaker
} from 'lucide-react';
import Disclaimer from '@/components/common/Disclaimer';
import Footer from '@/components/layout/Footer';
import { DesktopSideBanners } from '@/components/ads/AdBanners';
import SecurityModal from '@/components/common/SecurityModal';

type Banner = {
  id: string;
  href: string;
  imgSrc: string;
  width: number;
  height: number;
  alt: string;
  trackingSrc?: string;
  isCoupang?: boolean;
};

const DESKTOP_BANNERS: Banner[] = [
  { 
    id: 'gmarket_d',
    href: '/api/ad?id=gmarket_d',
    imgSrc: 'https://img.linkprice.com/files/glink/gmarket/20221004/K00HwzuaHqe00_728x90.jpg',
    width: 728, height: 90, alt: 'G마켓',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=gmarket&a_id=A100702467&p_id=0000&l_id=6775&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'lenovo_d',
    href: '/api/ad?id=lenovo_d',
    imgSrc: 'https://img.linkprice.com/files/glink/lenovo/20250516/000vtShk00000_레노버 728x90.png',
    width: 728, height: 90, alt: '레노버',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=lenovo&a_id=A100702467&p_id=0000&l_id=DKT0&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'himart_d',
    href: '/api/ad?id=himart_d',
    imgSrc: 'https://img.linkprice.com/files/glink/himart/20250630/686230aa8d3de_728x90.png',
    width: 728, height: 90, alt: '하이마트',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=Oze4&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'coupang_d',
    href: '/api/ad?id=coupang_d',
    imgSrc: 'https://ads-partners.coupang.com/banners/963102?subId=&traceId=V0-301-5f9bd61900e673c0-I963102&w=728&h=90',
    width: 728, height: 90, alt: '쿠팡',
    isCoupang: true
  },
  {
    id: 'aliexpress_d',
    href: '/api/ad?id=aliexpress_d',
    imgSrc: 'https://img.linkprice.com/files/glink/aliexpress/20230509/AO0161bmd0580_728x90.png',
    width: 728, height: 90, alt: '알리익스프레스',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=aliexpress&a_id=A100702467&p_id=0000&l_id=8PXG&l_cd1=2&l_cd2=0'
  }
];

const MOBILE_BANNERS: Banner[] = [
  { 
    id: 'himart_m1',
    href: '/api/ad?id=himart_m1',
    imgSrc: 'https://img.linkprice.com/files/glink/himart/20260129/697b2513716b9_468x60.png',
    width: 468, height: 60, alt: '하이마트',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=TJzp&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'himart_m2',
    href: '/api/ad?id=himart_m2',
    imgSrc: 'https://img.linkprice.com/files/glink/himart/20250630/686230aa8c8c3_468x60.png',
    width: 468, height: 60, alt: '하이마트',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=himart&a_id=A100702467&p_id=0000&l_id=xGIZ&l_cd1=2&l_cd2=0'
  },
  { 
    id: 'gmarket_m',
    href: '/api/ad?id=gmarket_m',
    imgSrc: 'https://img.linkprice.com/files/glink/gmarket/20221004/W800QYbQ7zS00_468x60.jpg',
    width: 468, height: 60, alt: 'G마켓',
    trackingSrc: 'https://track.linkprice.com/lpshow.php?m_id=gmarket&a_id=A100702467&p_id=0000&l_id=A7tz&l_cd1=2&l_cd2=0'
  }
];

const CATEGORIES = [
  { id: 'laptop', name: '노트북', icon: Laptop },
  { id: 'monitor', name: '모니터', icon: Monitor },
  { id: 'tablet', name: '태블릿', icon: Tablet },
  { id: 'mouse', name: '마우스', icon: Mouse },
  { id: 'keyboard', name: '키보드', icon: Keyboard },
  { id: 'watch', name: '스마트워치', icon: Watch },
  { id: 'audio', name: '음향기기', icon: Headphones },
  { id: 'speaker', name: '스피커', icon: Speaker },
  { id: 'camera', name: '카메라', icon: Camera },
  { id: 'tv', name: 'TV', icon: Tv },
  { id: 'refrigerator', name: '냉장고', icon: Refrigerator },
  { id: 'washer', name: '세탁기', icon: Waves },
  { id: 'clothes_dryer', name: '의류 건조기', icon: Shirt },
  { id: 'air_conditioner', name: '에어컨', icon: Snowflake },
  { id: 'air_purifier', name: '공기청정기', icon: Fan },
  { id: 'cleaner', name: '청소기', icon: Zap },
  { id: 'hair_dryer', name: '헤어드라이기', icon: Wind },
  { id: 'massage', name: '안마기', icon: Armchair },
];

const QUIZ_DATA: Record<string, any> = {
  laptop: {
    questions: [
      { id: 'usage', text: '주로 어떤 용도로 사용하시나요?', options: ['단순 문서작업/웹서핑/OTT 시청', '포토샵/일러스트 2D 디자인', 'FHD 영상편집/개발 코딩', '배틀그라운드/스팀 3D 게임', '4K 전문 영상작업/3D 렌더링'] },
      { id: 'mobility', text: '이동 빈도는 어떻게 되나요?', options: ['매일 휴대함 (1kg 초반 필수)', '주 2~3회 이동 (1.5kg 내외)', '주로 차량 이동/가끔 휴대', '거의 집/사무실에 고정'] },
      { id: 'screen_size', text: '선호하는 화면 크기는?', options: ['13~14인치 (휴대성 극대화)', '15~16인치 (생산성/휴대성 균형)', '17인치 이상 (시원한 대화면)'] },
      { id: 'display', text: '디스플레이 중요도는?', options: ['고해상도/정확한 색감 (작업용)', '고주사율 (게임용)', 'OLED/밝기 (영상 감상용)', '기본적인 화질이면 충분'] },
      { id: 'os', text: '운영체제(OS)는?', options: ['윈도우 포함 (받자마자 사용)', '프리도스 (직접 설치/저렴)', 'Mac OS (맥북 선호)'] },
      { id: 'brand', text: '선호하는 브랜드 성향은?', options: ['삼성/LG (확실한 AS/가벼움)', '애플 (디자인/연동성)', '에이수스/MSI (고성능/가성비)', '델/HP/레노버 (비즈니스/내구성)'] },
      { id: 'budget', text: '최대 가용 예산은?', options: ['70만원 이하', '70~130만원', '130~200만원', '200~300만원', '가격 상관없음'] }
    ]
  },
  desktop: {
    questions: [
      { id: 'purpose', text: 'PC 사용의 주 목적은?', options: ['사무/인강/주식 트레이딩', '롤/피파/발로란트 (캐주얼 게임)', '배그/오버워치 (QHD 게이밍)', 'AAA급 스팀 게임 (4K 풀옵션)', '전문 영상편집/방송/3D 작업'] },
      { id: 'cpu_prefer', text: '선호하는 CPU 제조사는?', options: ['인텔 (Intel - 호환성/작업)', 'AMD (Ryzen - 게이밍/가성비)', '상관없음/성능 좋은 쪽'] },
      { id: 'graphic', text: '원하는 그래픽 성능 등급은?', options: ['내장그래픽 (게임 안함)', 'RTX 4060급 (FHD 가성비)', 'RTX 4070급 (QHD 원활)', 'RTX 4080/4090 (하이엔드)'] },
      { id: 'case_design', text: '케이스 디자인 선호도는?', options: ['심플한 블랙/화이트 (LED 없음)', '화려한 RGB LED 튜닝', '어항 케이스 (내부 튜닝)', '공간 절약형 미니 PC'] },
      { id: 'storage', text: '필요한 저장공간 용량은?', options: ['500GB (기본)', '1TB (게임 5~6개 설치)', '2TB 이상 (영상/자료 많음)', 'HDD 추가 필요'] },
      { id: 'assembly', text: '구매 및 조립 방식은?', options: ['완조립 본체 (AS 편함)', '부품만 구매 (직접 조립)', '조립 대행 서비스 이용'] },
      { id: 'budget', text: '본체 기준 예산은?', options: ['60만원 이하', '60~120만원', '120~200만원', '200~350만원', '350만원 이상'] }
    ]
  },
  monitor: {
    questions: [
      { id: 'main_use', text: '가장 주된 사용 목적은?', options: ['FPS/경쟁 게임 (반응속도)', '영화/유튜브/넷플릭스 감상', '사무/코딩/웹서핑', '사진/영상 전문 색감 작업', '콘솔 게임 (PS5/Xbox)'] },
      { id: 'resolution', text: '원하는 해상도는?', options: ['FHD (1920x1080) - 일반/가성비', 'QHD (2560x1440) - 선명함/작업', '4K UHD (3840x2160) - 초고화질'] },
      { id: 'size', text: '선호하는 화면 크기는?', options: ['24인치 (한눈에 파악/FPS)', '27인치 (가장 대중적)', '32인치 (대화면 몰입감)', '34인치 이상 (울트라와이드)'] },
      { id: 'panel', text: '패널 종류 선호도는?', options: ['IPS (색감/시야각 우수)', 'VA (명암비 우수/영상)', 'OLED (압도적 화질/블랙)', 'TN (최고 반응속도)'] },
      { id: 'refresh_rate', text: '주사율(Hz)은 어느 정도?', options: ['60Hz (일반 사무/영상)', '144Hz~165Hz (게이밍 표준)', '240Hz 이상 (빡겜러)'] },
      { id: 'stand', text: '스탠드 기능 중요도는?', options: ['기본 스탠드면 충분', '높이조절/피벗 필요', '모니터암 사용 예정 (베사홀 필수)'] },
      { id: 'budget', text: '예산 범위는?', options: ['20만원 이하', '20~40만원', '40~70만원', '70~120만원', '120만원 이상'] }
    ]
  },
  tablet: {
    questions: [
      { id: 'os', text: '선호하는 운영체제는?', options: ['iPadOS (아이패드)', 'Android (갤럭시탭)', '가성비 안드로이드 (레노버 등)', 'Windows (서피스 등)'] },
      { id: 'purpose', text: '주된 구매 목적은?', options: ['영상 감상 (유튜브/넷플릭스)', '필기/공부/다이어리', '전문 그림/디자인 창작', '노트북 대용 생산성 작업', '고사양 모바일 게임'] },
      { id: 'size', text: '화면 크기는?', options: ['8인치대 (한손 휴대)', '10~11인치 (표준 사이즈)', '12인치 이상 (대화면/작업)', '14인치 이상 (노트북급)'] },
      { id: 'storage', text: '필요한 저장 용량은?', options: ['64GB (스트리밍 위주)', '128GB (기본)', '256GB (여유로움)', '512GB 이상 (영상 저장 많음)'] },
      { id: 'connectivity', text: '네트워크 연결 방식은?', options: ['Wi-Fi 전용 (테더링/실내)', '5G/LTE 셀룰러 (독립 데이터 사용)'] },
      { id: 'accessories', text: '함께 사용할 액세서리는?', options: ['펜슬 사용 필수', '키보드 커버 사용 필수', '둘 다 필요', '본체만 있으면 됨'] },
      { id: 'budget', text: '예산 범위는?', options: ['30만원 이하', '30~60만원', '60~100만원', '100~160만원', '가격 상관없음'] }
    ]
  },
  mouse: {
    questions: [
      { id: 'purpose', text: '주 사용 용도는?', options: ['FPS/롤 등 경쟁 게임', '일반 사무/웹서핑', '손목 통증 완화 (버티컬)', '휴대용/노트북용', '다버튼 매크로 (MMO/작업)'] },
      { id: 'connection', text: '연결 방식 선호도는?', options: ['유선 (반응속도/충전X)', '무선 (동글/2.4GHz)', '블루투스 멀티페어링'] },
      { id: 'hand_size', text: '사용자의 손 크기는?', options: ['작은 편 (F9 이하)', '보통 (F10)', '큰 편 (F11 이상)'] },
      { id: 'grip', text: '선호하는 그립감/형태는?', options: ['비대칭 (오른손 전용)', '대칭형 (호불호 적음)', '납작한 형태 (핑거그립)', '상관없음'] },
      { id: 'weight', text: '마우스 무게는?', options: ['초경량 (60g 미만)', '적당함 (70~90g)', '묵직함 (100g 이상)'] },
      { id: 'noise', text: '클릭 소음 선호도는?', options: ['딸깍거리는 명확한 소리', '무소음/저소음 필수 (독서실/사무실)'] },
      { id: 'budget', text: '예산은?', options: ['3만원 이하', '3~8만원', '8~15만원', '15만원 이상 (엔드급)'] }
    ]
  },
  keyboard: {
    questions: [
      { id: 'switch', text: '원하는 키감(스위치)은?', options: ['청축 (찰칵거림/PC방)', '적축 (부드러움/리니어)', '갈축 (적당한 구분감)', '저소음 적축 (매우 조용)', '무접점 (보글보글)'] },
      { id: 'layout', text: '키보드 배열(사이즈)은?', options: ['풀배열 (숫자키패드 있음)', '텐키리스 (숫자키 없음/공간확보)', '미니배열 (휴대용/극소형)', '앨리스/어고 (인체공학)'] },
      { id: 'connection', text: '연결 방식은?', options: ['유선 전용 (게이밍)', '무선/블루투스 (멀티페어링)'] },
      { id: 'material', text: '하우징/키캡 소재 선호?', options: ['일반 플라스틱 (가벼움)', '알루미늄 풀바디 (묵직함)', 'PBT 키캡 필수 (번들거림 적음)'] },
      { id: 'feature', text: '특별히 필요한 기능은?', options: ['RGB 백라이트', '핫스왑 (스위치 교체 가능)', '노브/디스플레이', '기본 충실하면 됨'] },
      { id: 'usage', text: '주 사용 환경은?', options: ['나만의 방 (소음 상관없음)', '사무실 (조용해야 함)', '카페/도서관 (무소음 필수)'] },
      { id: 'budget', text: '예산은?', options: ['5만원 이하', '5~12만원', '12~20만원', '20~35만원', '커스텀급 (그 이상)'] }
    ]
  },
  watch: {
    questions: [
      { id: 'phone', text: '현재 사용하는 스마트폰은?', options: ['아이폰 (Apple)', '갤럭시 (Samsung)', '기타 안드로이드'] },
      { id: 'main_use', text: '스마트워치 주 용도는?', options: ['알림 확인/패션 아이템', '러닝/헬스 트래킹 전문', '수면/건강 모니터링', '골프 거리 측정', '아웃도어/등산'] },
      { id: 'battery', text: '배터리 타임 중요도는?', options: ['매일 충전해도 됨 (기능 우선)', '최소 2~3일은 가야 함', '일주일 이상 (밴드형/하이브리드)'] },
      { id: 'design', text: '선호하는 디자인은?', options: ['사각형 (애플워치 스타일)', '원형 (전통 시계 스타일)', '스포츠 밴드 스타일'] },
      { id: 'connectivity', text: 'LTE/셀룰러 필요 여부?', options: ['폰 두고 다닐 일 있음 (LTE 모델)', '폰과 항상 같이 다님 (BT/Wi-Fi)'] },
      { id: 'material', text: '케이스 소재는?', options: ['알루미늄 (가벼움/무광)', '스테인리스 (고급감/유광)', '티타늄 (내구성/프리미엄)'] },
      { id: 'budget', text: '예산은?', options: ['10만원 이하', '10~40만원', '40~80만원', '100만원 이상'] }
    ]
  },
  audio: {
    questions: [
      { id: 'type', text: '원하는 제품 형태는?', options: ['무선 이어폰 (커널형/귀에 쏙)', '무선 이어폰 (오픈형/걸치는)', '무선 헤드폰 (오버이어)', '넥밴드/스포츠형'] },
      { id: 'anc', text: '노이즈 캔슬링(ANC) 기능?', options: ['매우 강력해야 함 (대중교통)', '적당히 있으면 좋음', '필요 없음/주변 소리 듣기 중요'] },
      { id: 'sound', text: '선호하는 사운드 성향은?', options: ['저음 강조 (둥둥거리는 힙합/EDM)', '플랫/밸런스 (원음 중시)', '보컬 강조 (선명함/팝)', '해상력 (클래식/악기)'] },
      { id: 'use_case', text: '주로 언제 사용하나요?', options: ['출퇴근/통학', '운동/러닝 (방수 필수)', '조용한 실내 감상', '통화/화상회의'] },
      { id: 'brand', text: '선호 브랜드는?', options: ['스마트폰 제조사 깔맞춤 (애플/삼성)', '음향 전문 (소니/보스/젠하이저)', '가성비 (QCY/Anker)'] },
      { id: 'feature', text: '부가적으로 필요한 기능?', options: ['멀티포인트 (2대 동시연결)', '무선 충전', '고음질 코덱 (LDAC/aptX)', '기본기만 좋으면 됨'] },
      { id: 'budget', text: '예산은?', options: ['5만원 이하', '5~15만원', '15~30만원', '30만원 이상'] }
    ]
  },
  speaker: {
    questions: [
      { id: 'type', text: '스피커 종류는?', options: ['휴대용 블루투스 스피커', '거치형 블루투스 스피커', 'PC 사운드바/북쉘프', 'AI/스마트 스피커'] },
      { id: 'space', text: '주 사용 공간은?', options: ['작은 방/책상 위', '거실/넓은 공간', '캠핑/아웃도어', '욕실/주방 (방수 필요)'] },
      { id: 'sound_power', text: '원하는 출력/음량은?', options: ['잔잔하게 듣는 편', '적당한 수준', '파티/야외용 강력한 출력', '저음(베이스)이 웅장해야 함'] },
      { id: 'power', text: '전원 방식은?', options: ['배터리 내장 (충전식)', '상시 전원 연결 (코드)', '둘 다 가능해야 함'] },
      { id: 'design', text: '디자인 선호도는?', options: ['모던/심플', '레트로/앤틱 감성', '화려한 RGB 조명', '러기드/튼튼함'] },
      { id: 'connectivity', text: '연결 방식은?', options: ['블루투스 위주', 'AUX/유선 연결 필요', 'Wi-Fi/AirPlay 지원 필요'] },
      { id: 'budget', text: '예산은?', options: ['5만원 이하', '5~20만원', '20~50만원', '50만원 이상'] }
    ]
  },
  camera: {
    questions: [
      { id: 'type', text: '원하는 카메라 종류는?', options: ['미러리스 (렌즈 교환식)', 'DSLR (전통적)', '하이엔드 컴팩트 (렌즈 일체형)', '액션캠/짐벌캠'] },
      { id: 'subject', text: '주로 무엇을 찍으시나요?', options: ['유튜브 브이로그/영상', '인물/가족/스냅', '풍경/여행', '제품/쇼핑몰 상세페이지', '스포츠/동물 (망원)'] },
      { id: 'video_spec', text: '영상 촬영 중요도는?', options: ['사진 위주 (영상 안 찍음)', 'FHD 정도면 충분', '4K 고화질 필수', '4K 60p/10bit 전문 촬영'] },
      { id: 'sensor', text: '센서 크기 선호도는?', options: ['풀프레임 (화질/심도)', '크롭/APS-C (가성비/휴대성)', '마이크로포서드/1인치 (컴팩트)', '잘 모름'] },
      { id: 'brand', text: '선호하는 색감/브랜드?', options: ['소니 (AF/선명함)', '캐논 (인물 색감)', '후지필름 (필름 시뮬레이션)', '니콘/파나소닉', '상관없음'] },
      { id: 'weight', text: '휴대성 중요도?', options: ['무거워도 화질이 중요', '적당한 타협 필요', '무조건 가벼워야 함'] },
      { id: 'budget', text: '렌즈 포함 예산은?', options: ['100만원 이하', '100~200만원', '200~350만원', '350만원 이상'] }
    ]
  },
  tv: {
    questions: [
      { id: 'size', text: '설치 공간 평수와 시청 거리는?', options: ['원룸/작은 방 (43~50인치)', '20평대 거실 (55~65인치)', '30평대 거실 (75인치)', '40평대 이상/대화면 선호 (85인치 이상)'] },
      { id: 'panel', text: '선호하는 패널 기술은?', options: ['OLED (완벽한 블랙/무한 명암비)', 'Neo QLED/Mini-LED (높은 밝기/번인 없음)', '일반 LED/UHD (가성비)', '잘 모름'] },
      { id: 'usage', text: '주된 시청 콘텐츠는?', options: ['지상파 뉴스/드라마', '넷플릭스/영화 (화질 중요)', 'PS5/Xbox 게임 (120Hz+)', '스포츠 중계 (잔상 억제)'] },
      { id: 'environment', text: '주 시청 환경은?', options: ['주로 저녁/어두운 환경', '낮에도 많이 봄/햇빛 들어옴', '항상 불 켜놓고 봄'] },
      { id: 'sound', text: '사운드 구성 계획은?', options: ['TV 내장 스피커 사용', '사운드바 추가 구매 예정', '이미 홈시어터 있음'] },
      { id: 'smart', text: '스마트 기능 필요 여부?', options: ['OTT 앱(유튜브/넷플) 필수', '셋톱박스 쓸 거라 상관없음', '미러링/IoT 기능 중요'] },
      { id: 'budget', text: '예산은?', options: ['100만원 이하', '100~200만원', '200~400만원', '400만원 이상 (플래그십)'] }
    ]
  },
  refrigerator: {
    questions: [
      { id: 'type', text: '원하는 냉장고 형태는?', options: ['4도어 (상냉장 하냉동)', '2도어 (양문형)', '일반형 (상냉동 하냉장)', '1도어/변온 (비스포크/컨버터블)'] },
      { id: 'capacity', text: '필요한 용량은?', options: ['800L 이상 (4인 이상/대용량)', '600~800L (3~4인)', '300~500L (1~2인)', '300L 미만 (서브/미니)'] },
      { id: 'install', text: '설치 타입은?', options: ['프리스탠딩 (일반 깊이)', '키친핏/빌트인 (가구 라인 맞춤/용량 작음)'] },
      { id: 'design', text: '디자인 및 패널?', options: ['패널 교체 가능 (비스포크/오브제)', '메탈/스테인리스 (심플)', '화이트/일반'] },
      { id: 'feature', text: '꼭 필요한 편의 기능은?', options: ['홈바/매직스페이스 (쇼케이스)', '얼음 정수기 포함', '자동 문열림', '기본 냉장/냉동만 충실하면 됨'] },
      { id: 'kimchi', text: '김치 보관 필요성?', options: ['김치냉장고 별도 보유 중', '김치 보관 기능 포함 필요 (복합형)', '김치 안 먹음'] },
      { id: 'budget', text: '예산 범위는?', options: ['100만원 이하', '100~200만원', '200~350만원', '350만원 이상'] }
    ]
  },
  washer: {
    questions: [
      { id: 'type', text: '원하는 세탁기 형태는?', options: ['드럼 세탁기 (옷감 보호/건조기 직렬)', '통돌이 세탁기 (강력한 세탁력/이불)', '워시타워 (세탁기+건조기 일체형)'] },
      { id: 'capacity', text: '가구 인원 및 빨래 양은?', options: ['1~2인 (9~14kg)', '3~4인 (21~24kg)', '5인 이상/이불 빨래 잦음 (25kg 이상)'] },
      { id: 'detergent', text: '자동 세제 투입 기능?', options: ['필수 (매우 편리함)', '있으면 좋음', '필요 없음 (직접 투입)'] },
      { id: 'feature', text: '중요한 부가 기능은?', options: ['AI 맞춤 세탁 (오염도 감지)', '스팀 살균/알러지 케어', '빠른 세탁 모드', '스마트폰 원격 제어'] },
      { id: 'install', text: '설치 공간 제약은?', options: ['여유로움', '좁음 (치수 확인 필요)', '빌트인 설치 필요'] },
      { id: 'brand', text: '선호 브랜드는?', options: ['삼성 (그랑데 AI)', 'LG (트롬/오브제)', '위니아/기타 가성비'] },
      { id: 'budget', text: '예산은?', options: ['80만원 이하', '80~150만원', '150~250만원', '250만원 이상 (세트 포함)'] }
    ]
  },
  clothes_dryer: {
    questions: [
      { id: 'capacity', text: '건조 용량은?', options: ['9~10kg (수건/속옷 위주)', '16~17kg (일반 의류/얇은 이불)', '20kg 이상 (킹사이즈 이불/대용량)'] },
      { id: 'install', text: '설치 위치 및 방식은?', options: ['세탁기 위에 직렬 설치', '실내/드레스룸 단독 설치', '베란다 단독 설치', '미니 건조기 (탁상용)'] },
      { id: 'method', text: '건조 방식 선호도는?', options: ['히트펌프 (저온 제습/옷감 보호/절전)', '히터 건조 (빠름/전기세 높음/미니류)', '가스식 (설치 복잡/빠름)'] },
      { id: 'color', text: '원하는 컬러는?', options: ['화이트/베이지', '블랙/그레이', '그린/기타 포인트 컬러', '상관없음'] },
      { id: 'feature', text: '필요한 케어 기능은?', options: ['스팀 살균/구김 완화', '패딩 케어/리프레쉬', '신발 건조 선반', '기본 건조만 잘 되면 됨'] },
      { id: 'noise', text: '작동 소음 민감도?', options: ['조용한 모델 선호 (실내)', '베란다라 상관없음'] },
      { id: 'budget', text: '예산은?', options: ['50만원 이하', '50~100만원', '100~160만원', '160만원 이상'] }
    ]
  },
  air_conditioner: {
    questions: [
      { id: 'type', text: '설치 형태는?', options: ['2in1 (거실 스탠드 + 안방 벽걸이)', '스탠드형 단독 (거실)', '벽걸이형 단독 (방)', '창문형/이동식 (실외기 설치 불가)'] },
      { id: 'area', text: '사용 면적(평형)은?', options: ['6~7평 (작은 방)', '17~18평 (국민 평수 거실)', '20평 이상 (넓은 거실/매장/사무실)'] },
      { id: 'wind', text: '바람 스타일 선호도는?', options: ['무풍/간접바람 (직바람 싫음)', '강력한 롱바람 (써큘레이터형)', '듀얼/와이드 바람'] },
      { id: 'feature', text: '공기청정 기능 필요성?', options: ['포함 필수 (사계절 사용)', '필터만 있으면 됨', '필요 없음 (에어컨 전용)'] },
      { id: 'clean', text: '위생 관리 기능은?', options: ['자동 건조/UV 살균 필수', '필터 청소 편리성 중요', '기본 기능이면 됨'] },
      { id: 'color', text: '디자인 선호?', options: ['가구 같은 패브릭/무광', '세련된 메탈/아트패널', '일반적인 화이트'] },
      { id: 'budget', text: '설치비 포함 예상 예산?', options: ['100만원 이하', '100~200만원', '200~300만원', '300만원 이상'] }
    ]
  },
  air_purifier: {
    questions: [
      { id: 'area', text: '사용할 공간 면적은?', options: ['10평 이하 (원룸/방)', '15~20평 (거실)', '30평 이상 (넓은 거실/매장)'] },
      { id: 'filter', text: '필터 등급 및 성능은?', options: ['H13 헤파필터 이상 필수', '탈취/유해가스 제거 특화', '펫 전용 필터 (털 제거)', '기본 미세먼지 제거면 충분'] },
      { id: 'type', text: '제품 형태는?', options: ['일반 타워형 (360도 흡입)', '납작한 판형 (벽면 밀착)', '테이블 결합형/가구형', '대형 업소용'] },
      { id: 'feature', text: '필요한 부가 기능?', options: ['순환 팬/써큘레이터 결합', '가습 기능 포함', 'IoT/스마트폰 제어', '무드등/조명'] },
      { id: 'noise', text: '소음 민감도는?', options: ['수면 모드/저소음 필수 (침실)', '평상시 소음은 괜찮음 (거실)'] },
      { id: 'maintenance', text: '유지 관리 선호?', options: ['필터 교체 알림 필수', '워셔블 필터 (씻어 쓰기)', '렌탈 관리 선호'] },
      { id: 'budget', text: '예산은?', options: ['20만원 이하', '20~50만원', '50~100만원', '100만원 이상'] }
    ]
  },
  cleaner: {
    questions: [
      { id: 'type', text: '청소기 종류는?', options: ['로봇청소기 (편리함)', '무선 스틱청소기 (꼼꼼함)', '유선 청소기 (강력함/저렴)'] },
      { id: 'robot_feature', text: '(로봇 선택 시) 중요 기능?', options: ['물걸레 자동 세척/건조 (올인원)', '먼지통 자동 비움', 'AI 사물 인식/회피', '흡입 전용 (물걸레X)'] },
      { id: 'stick_feature', text: '(스틱 선택 시) 중요 기능?', options: ['가벼운 무게 (손목 보호)', '강력한 흡입력', '물걸레 키트 포함', '먼지 비움 스테이션 포함'] },
      { id: 'env', text: '주거 환경 특징?', options: ['반려동물 있음 (털 관리)', '머리카락 많음', '문턱이 있음', '매트가 깔려 있음'] },
      { id: 'brand', text: '선호 브랜드?', options: ['삼성/LG (AS 확실)', '로보락/드리미 (로봇 기술력)', '다이슨 (스틱 명품)', '샤오미/가성비'] },
      { id: 'accessory', text: '필요한 구성품?', options: ['침구 브러쉬', '틈새 노즐', '물걸레 키트', '기본 구성이면 됨'] },
      { id: 'budget', text: '예산 범위는?', options: ['30만원 이하', '30~70만원', '70~120만원', '120만원 이상'] }
    ]
  },
  hair_dryer: {
    questions: [
      { id: 'priority', text: '가장 중요하게 생각하는 점은?', options: ['건조 속도 (강력한 바람)', '머릿결 보호 (온도 제어)', '스타일링/볼륨', '가벼운 무게/휴대성'] },
      { id: 'hair_type', text: '사용자의 모발 상태는?', options: ['숱 많음/긴 머리', '손상모/탈색모', '짧은 머리/남성', '아이와 함께 사용'] },
      { id: 'motor', text: '선호하는 모터 방식은?', options: ['BLDC 항공모터 (고성능/저소음)', '일반 DC모터 (가성비)', '전문가용 AC모터 (묵직함)'] },
      { id: 'nozzle', text: '필요한 노즐 구성은?', options: ['기본 노즐만 있으면 됨', '디퓨저 (웨이브 컬)', '스타일링/빗 노즐', '플라이어웨이 (잔머리 정리)'] },
      { id: 'brand', text: '선호 브랜드?', options: ['다이슨 (프리미엄)', '차이슨/레이트 (가성비)', 'JMW/유닉스 (국산 전문가용)', '상관없음'] },
      { id: 'noise', text: '소음 민감도?', options: ['조용한 제품 선호', '바람만 세면 상관없음'] },
      { id: 'budget', text: '예산대는?', options: ['5만원 이하', '5~15만원', '15~30만원', '40만원 이상'] }
    ]
  },
  massage: {
    questions: [
      { id: 'type', text: '원하는 안마기 형태는?', options: ['전신 안마의자', '소형 마사지기 (목/어깨)', '다리/발 마사지기', '마사지건/핸디형', '안마 매트 (누워서)'] },
      { id: 'intensity', text: '선호하는 마사지 강도는?', options: ['아주 강력한 압 (경락 느낌)', '부드러운 공기압/롤링', '두드림 위주', '온열 찜질 위주'] },
      { id: 'pain_point', text: '집중 관리가 필요한 부위?', options: ['목/어깨 (승모근)', '허리/골반', '종아리/발바닥', '전신 피로'] },
      { id: 'space', text: '설치 공간 여유는?', options: ['충분함 (대형 안마의자)', '좁음 (리클라이너/소형)', '보관/이동 쉬워야 함'] },
      { id: 'user', text: '주 사용자는?', options: ['부모님 (효도 선물)', '직장인/학생 (거북목)', '운동선수/헬스러', '온 가족'] },
      { id: 'feature', text: '특별히 원하는 기능?', options: ['무중력 모드', '온열 기능 필수', '스트레칭 모드', '블루투스 스피커'] },
      { id: 'budget', text: '예산은?', options: ['10만원 이하', '10~50만원', '50~200만원', '200~400만원', '400만원 이상'] }
    ]
  }
};

const DEFAULT_QUESTIONS = [
  { id: 'purpose', text: '주 사용 목적이 무엇인가요?', options: ['입문용/가벼운 용도', '일반적인 용도', '전문가/고성능 작업'] },
  { id: 'budget', text: '예산대는 어떻게 생각하시나요?', options: ['가성비 최우선', '적당한 가격과 성능', '최고급 성능 필요'] },
  { id: 'brand', text: '선호하는 브랜드가 있나요?', options: ['대기업 (삼성/LG/애플)', '가성비 브랜드', '상관없음'] },
  { id: 'feature', text: '가장 중요하게 보는 기능은?', options: ['디자인', '내구성', '최신 기능', 'AS 편의성'] },
  { id: 'design', text: '선호하는 디자인 스타일은?', options: ['심플/모던', '화려함/유니크', '레트로', '상관없음'] },
  { id: 'usage_freq', text: '사용 빈도는?', options: ['매일 사용', '일주일에 2~3회', '가끔 사용'] },
  { id: 'priority', text: '구매 시 1순위 고려 사항은?', options: ['가격', '성능', '디자인', '브랜드'] }
];

function QuizContent() {
  const [step, setStep] = useState<'category' | 'question' | 'loading' | 'result'>('category');
  const [category, setCategory] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [result, setResult] = useState<any>(null);
  
  const searchParams = useSearchParams();
  const directQuery = searchParams.get('q');
  const router = useRouter();

  const [randomDesktop, setRandomDesktop] = useState<Banner | null>(null);
  const [randomMobile, setRandomMobile] = useState<Banner | null>(null);

  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{type: 'quiz' | 'search', data: any} | null>(null);

  useEffect(() => {
    setRandomDesktop(DESKTOP_BANNERS[Math.floor(Math.random() * DESKTOP_BANNERS.length)]);
    setRandomMobile(MOBILE_BANNERS[Math.floor(Math.random() * MOBILE_BANNERS.length)]);
  }, []);

  useEffect(() => {
    if (directQuery) {
      setPendingPayload({ type: 'search', data: directQuery });
      setIsSecurityOpen(true);
    }
  }, [directQuery]);

  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    setStep('question');
    setCurrentQIdx(0);
    setAnswers({});
  };

  const handleAnswer = (answer: string) => {
    const questions = QUIZ_DATA[category]?.questions || DEFAULT_QUESTIONS;
    const currentQ = questions[currentQIdx];
    
    const newAnswers = { ...answers, [currentQ.id]: answer };
    setAnswers(newAnswers);

    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx(prev => prev + 1);
    } else {
      setPendingPayload({ type: 'quiz', data: newAnswers });
      setIsSecurityOpen(true);
    }
  };

  const handleVerified = async (token: string) => {
    if (!token) return;
    setIsSecurityOpen(false);

    if (pendingPayload?.type === 'quiz') {
      submitQuiz(pendingPayload.data, token);
    } else if (pendingPayload?.type === 'search') {
      submitDirectSearch(pendingPayload.data, token);
    }
  };

  const submitQuiz = async (finalAnswers: any, token: string) => {
    setStep('loading');
    const selectedCategory = CATEGORIES.find(c => c.id === category);
    const categoryName = selectedCategory ? selectedCategory.name : category;

    try {
      const res = await fetch('/api/recommend/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: categoryName, answers: finalAnswers, turnstileToken: token }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error);
        setStep('category');
        return;
      }

      setResult(data);
      setStep('result');
    } catch (e) {
      alert("오류가 발생했습니다. 다시 시도해주세요.");
      setStep('category');
    }
  };

  const submitDirectSearch = async (queryText: string, token: string) => {
    setStep('loading');
    try {
      const res = await fetch('/api/recommend/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, turnstileToken: token }), 
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        router.push('/quiz');
        setStep('category');
        return;
      }

      setResult(data);
      setStep('result');
    } catch (e) {
      alert("검색 중 오류가 발생했습니다.");
      setStep('category');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-start max-w-4xl mx-auto px-4 pt-12 pb-4 md:py-12 w-full relative min-h-[800px]">
      <SecurityModal 
        isOpen={isSecurityOpen} 
        onClose={() => setIsSecurityOpen(false)} 
        onVerify={handleVerified} 
      />
      
      <DesktopSideBanners />

      {step === 'category' && (
        <div className="space-y-10 animate-fade-in">
          <div className="text-center">
            <h1 className="text-3xl font-black mb-3 text-slate-900">무엇을 찾고 계신가요?</h1>
            <p className="text-slate-500 font-medium">카테고리를 선택하면 AI가 맞춤형 질문을 시작합니다.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => handleCategorySelect(cat.id)} 
                className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 hover:ring-2 hover:ring-indigo-100 hover:bg-slate-50 transition flex flex-col items-center gap-3 shadow-sm group"
              >
                <cat.icon className="w-10 h-10 text-slate-300 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
                <span className="font-bold text-slate-700 group-hover:text-slate-900 break-keep text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'question' && (
        <div className="w-full max-w-2xl mx-auto mt-8">
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
            <span>Question {currentQIdx + 1}</span>
            <span>Step {currentQIdx + 1} / {(QUIZ_DATA[category]?.questions || DEFAULT_QUESTIONS).length}</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full mb-10 overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${((currentQIdx + 1) / (QUIZ_DATA[category]?.questions || DEFAULT_QUESTIONS).length) * 100}%` }}
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
              <h2 className="text-2xl font-bold mb-8 text-slate-900 leading-snug break-keep text-center">
                {(QUIZ_DATA[category]?.questions || DEFAULT_QUESTIONS)[currentQIdx].text}
              </h2>
              <div className="space-y-3">
                {(QUIZ_DATA[category]?.questions || DEFAULT_QUESTIONS)[currentQIdx].options.map((option: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    className="w-full p-5 text-left border-2 border-slate-100 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition flex items-center justify-between group bg-white"
                  >
                    <span className="font-bold text-slate-700 group-hover:text-indigo-700 text-lg">{option}</span>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition" />
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {step === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {directQuery ? `"${directQuery}"` : "답변을 분석하고 있습니다..."}
          </h2>
          <p className="text-slate-500 animate-pulse">최신 데이터와 가격을 조회하여 최적의 제품을 찾고 있습니다.</p>
        </div>
      )}

      {step === 'result' && result && (
        <div className="animate-fade-in pb-10 max-w-2xl mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black mb-4 text-slate-900">맞춤 추천 결과</h2>
            <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl text-indigo-900 text-sm font-medium leading-relaxed break-keep shadow-sm">
              "{result.analysis}"
            </div>
          </div>
          
          <Disclaimer />

          <div className="space-y-8 mt-8">
            {result.recommendations?.map((item: any, idx: number) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 relative overflow-hidden group hover:border-indigo-400 transition-all">
                {idx === 0 && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl shadow-md z-10">
                    MD's BEST PICK
                  </div>
                )}
                
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded-md">
                        {idx + 1}위
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">{item.name}</h3>
                    </div>
                    
                    <div className="text-base font-bold text-indigo-600 bg-indigo-50 inline-block px-3 py-1 rounded-lg self-start">
                        최저가 약 {Number(item.price_estimate?.toString().replace(/[^0-9]/g, '') || 0).toLocaleString()}원
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {item.reason}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {item.tags?.map((tag: string, tIdx: number) => (
                        <span key={tIdx} className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-xs font-medium rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
              <h3 className="text-center font-bold text-slate-800 mb-1">
                추천받은 제품 최저가 찾아보기
              </h3>
              <p className="text-center text-xs text-slate-400 mb-6">
                아래 쇼핑몰에서 실시간 재고와 가격을 확인하세요.
              </p>
              
              <div className="flex flex-wrap justify-center items-center gap-6">
                <div className="hover:opacity-80 transition-opacity">
                  <a target="_blank" href="/api/ad?id=grid_himart" rel="noopener noreferrer nofollow">
                    <img src="https://img.linkprice.com/files/glink/himart/20260129/697b25135c355_120x60.png" width="120" height="60" alt="하이마트" style={{ border: 0 }} />
                  </a>
                </div>

                <div className="hover:opacity-80 transition-opacity">
                  <a target="_blank" href="/api/ad?id=grid_gmarket" rel="noopener noreferrer nofollow">
                    <img src="https://img.linkprice.com/files/glink/gmarket/20191120/5dd48d65a8c5e_120_60.jpg" width="120" height="60" alt="G마켓" style={{ border: 0 }} />
                  </a>
                </div>

                <div className="hover:opacity-80 transition-opacity">
                  <a href="/api/ad?id=grid_coupang" target="_blank" rel="noopener noreferrer nofollow">
                    <img src="https://ads-partners.coupang.com/banners/964225?subId=&traceId=V0-301-5f9bd61900e673c0-I964225&w=120&h=60" alt="쿠팡" width="120" height="60" />
                  </a>
                </div>

                <div className="hover:opacity-80 transition-opacity">
                  <a target="_blank" href="/api/ad?id=grid_aliexpress" rel="noopener noreferrer nofollow">
                    <img src="https://img.linkprice.com/files/glink/aliexpress/20240328/600GgnC4eLAW0_120_60.png" width="120" height="60" alt="알리익스프레스" style={{ border: 0 }} />
                  </a>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-50 text-center">
                 <p className="text-[10px] text-slate-400 font-medium">
                   이 사이트는 제휴 마케팅 활동의 일환으로,<br/>
                   이에 따른 일정액의 수수료를 제공받습니다.
                 </p>
              </div>
          </div>

          <button 
            onClick={() => {
              setStep('category');
              window.history.pushState({}, '', '/quiz'); 
            }}
            className="mt-8 w-full py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition"
          >
            처음부터 다시 하기
          </button>
        </div>
      )}

      <div className="w-full flex justify-center items-center mt-12 mb-4 overflow-hidden">
          <div className="hidden md:block">
            {randomDesktop && (
              <a href={randomDesktop.href} target="_blank" rel="noopener noreferrer nofollow">
                <img 
                  src={randomDesktop.imgSrc} 
                  alt={randomDesktop.alt} 
                  width={randomDesktop.width} 
                  height={randomDesktop.height} 
                  className="max-w-full h-auto rounded-lg"
                  {...(randomDesktop.isCoupang && { referrerPolicy: 'unsafe-url' })}
                />
                {randomDesktop.trackingSrc && (
                   <img src={randomDesktop.trackingSrc} width="1" height="1" alt="" style={{ display: 'none' }} />
                )}
              </a>
            )}
          </div>

          <div className="block md:hidden">
             {randomMobile && (
              <a href={randomMobile.href} target="_blank" rel="noopener noreferrer nofollow">
                <img 
                  src={randomMobile.imgSrc} 
                  alt={randomMobile.alt} 
                  width={randomMobile.width} 
                  height={randomMobile.height} 
                  className="max-w-full h-auto rounded-lg"
                />
                {randomMobile.trackingSrc && (
                   <img src={randomMobile.trackingSrc} width="1" height="1" alt="" style={{ display: 'none' }} />
                )}
              </a>
            )}
          </div>
        </div>

    </div>
  );
}

export default function QuizPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>}>
        <QuizContent />
      </Suspense>
      <Footer />
    </div>
  );
}