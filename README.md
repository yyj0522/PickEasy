픽이지 (PickEasy)
"고민은 AI가, 선택은 쉽고 빠르게" - 실시간 검색(Grounding) 기반 AI IT 제품 큐레이션 플랫폼

웹사이트 바로가기 / 개발일지(노션) 바로가기

본 프로젝트는 기획, 디자인, 풀스택 개발, AI 프롬프트 엔지니어링 및 SEO 최적화까지 전체 사이클을 1인 개발로 완수한 프로젝트입니다.

프로젝트 소개 (Overview)
기존의 쇼핑 추천 서비스나 단순 챗봇들은 "현재 시장의 실시간 가격 변동"을 읽어내지 못하거나, 과거 데이터에 의존한 환각(Hallucination) 현상으로 인해 사용자에게 실질적인 구매 가이드를 제공하지 못하는 한계가 있었습니다.

PickEasy(픽이지)는 이러한 문제를 해결하기 위해 AI-Native 접근법을 채택했습니다. 사용자의 추상적인 요구사항(예: "150만 원대 영상편집용 PC")을 분석하고, Google Search Grounding 기술을 활용해 실시간 시장 최저가를 스크래핑 및 검증하여, 가장 합리적이고 정확한 맞춤형 쇼핑 큐레이션을 제공하는 B2C SaaS 형태의 웹 애플리케이션입니다.

핵심 기능 (Key Features)
실시간 AI PC 견적사 (PC Builder): 예산과 용도를 입력하면 Gemini 모델이 '다나와/컴퓨존' 기반의 실시간 부품 시세를 검색하여 조립 PC 견적을 JSON 형태로 반환 및 렌더링합니다. (특정 부품 가격 폭등 등 시장 상황 실시간 반영)

스마트 맞춤 추천 퀴즈 (Quiz): 사용자의 라이프스타일과 예산 범위를 분석하여, 현재 판매 중인 최적의 IT 기기/가전제품 3가지를 분석 결과와 함께 추천합니다.

AI 스펙 비교 (VS): 복잡한 IT 기기의 스펙(아이폰 vs 갤럭시 등)을 AI가 카테고리별로 분석하고 승자를 판별하여 직관적인 UI로 제공합니다. DB 캐싱을 통해 응답 속도와 API 비용을 최적화했습니다.

주간 랭킹 자동화 (Cron Jobs): 20여 개 IT 카테고리의 최신 인기 순위 TOP 10을 매시간/매주 자동으로 업데이트하고 DB에 저장하여 사용자에게 제공합니다.

기술 스택 및 도입 배경 (Why I chose these)
단순히 유행하는 기술을 쓰는 것이 아니라, '문제 해결'과 '생산성 극대화'라는 명확한 근거(Why)를 가지고 기술을 선택했습니다.

프론트엔드/백엔드: Next.js 14 (App Router)

도입 근거: SSR을 통한 초기 렌더링 속도 개선 및 SEO(Search Engine Optimization) 최적화. API Route를 활용해 외부 LLM API Key 노출을 방지하고 프록시 서버 역할을 수행하기 위해 채택했습니다.

AI & LLM: Google Gemini 2.5 Flash

도입 근거: 실시간 데이터가 필수적인 서비스 특성상 Google Search Grounding 기능이 내장되어 외부 최신 데이터를 가장 빠르고 저렴하게 파이프라인에 통합할 수 있었습니다.

데이터베이스: Supabase (PostgreSQL)

도입 근거: 초기 백엔드 인프라 구축 비용(시간)을 최소화하고, IP 기반 Rate Limiting(사용량 제한) 및 프롬프트 결과 캐싱 로직을 빠르게 구현하기 위해 도입했습니다.

보안 & 인프라: Cloudflare Turnstile & Vercel

도입 근거: 무분별한 봇(Bot) 트래픽으로 인한 LLM API 과금을 방지하기 위해 사용자 친화적인 Turnstile 캡차를 적용했으며, CSP(콘텐츠 보안 정책)를 엄격하게 구성했습니다.

트러블 슈팅 및 AI 엔지니어링 (Troubleshooting)
1. 프롬프트 파이프라인 구축 및 환각(Hallucination) 제어
문제 상황: PC 견적 생성 시, 2026년 메모리 반도체 가격 폭등(DDR5 16GB가 30만 원대) 상황을 AI가 인지하지 못하고 과거 학습 데이터(6만 원대)를 기준으로 잘못된 총액을 계산하는 치명적인 환각 현상 발생.

해결 방안:

프롬프트에 "학습된 지식을 완전 무시하고, 검색 결과가 과거 대비 3~4배 비싸더라도 의심 없이 반영하라"는 명시적 제어(System Prompting)를 추가했습니다.

해외 직구(알리, 아마존 등) 가격이 섞이는 것을 방지하기 위해 검색 쿼리에 '다나와, 컴퓨존 국내 정품' 키워드를 강제 주입(Injection)했습니다.

AI의 텍스트 응답에서 마크다운을 제거하고 순수 JSON 객체만 추출하는 커스텀 파싱 유틸리티(cleanGeminiJson)를 구현하여 안정적인 렌더링 파이프라인을 구축했습니다.

2. LLM API 비용 한도(Quota) 최적화 및 캐싱 전략
문제 상황: 유저 트래픽이 증가함에 따라 Gemini API의 무료 제공량(1,500 RPD)이 빠르게 소진되어 서비스 중단 위험 발생.

해결 방안: 모든 기능에 일괄적으로 AI를 호출하지 않고 기능별 아키텍처를 분리했습니다.

실시간 검색(Grounding) 분리: 가격 변동이 심한 'PC 견적'과 '맞춤 추천'은 검색 툴을 켠 모델을 사용하고, 스펙 변동이 없는 'VS 비교'는 검색 툴을 끈 가벼운 모델(modelNoSearch)을 사용하여 속도와 비용을 최적화했습니다.

DB 캐싱 & 횟수 제한: 한 번 질문된 'VS 비교'나 '동일 예산 PC 견적'은 Supabase DB에 캐싱하여 24시간 이내 동일 요청 시 API 호출 없이(0 RPD) 즉시 반환하도록 설계했습니다. 또한, 기능별로 일일 사용 횟수(PC 3회, 추천 3회, 비교 5회 등)를 분리 적용하여 다수의 유저가 안정적으로 서비스를 이용할 수 있도록 했습니다.

3. 테크니컬 SEO 고도화 및 크롤링 예산(Crawl Budget) 최적화
문제 상황: 서비스 배포 후 구글 서치콘솔에서 '적절한 표준 태그가 포함된 대체 페이지' 오류로 인해 핵심 기능 페이지들이 색인되지 않는 문제 발생.

해결 방안:

layout.tsx에 잘못 전역 설정된 canonical 태그를 제거하여 각 하위 페이지가 고유한 메타데이터를 갖도록 수정했습니다.

Next.js의 sitemap.ts를 활용하여 정적 라우트뿐만 아니라 DB에 쌓이는 랭킹 데이터 기반의 동적 상품 페이지(/product/[slug])까지 자동으로 사이트맵에 생성되도록 구현했습니다.

robots.ts를 통해 /api 등 불필요한 백엔드 라우트의 크롤링을 차단하여 검색 엔진의 크롤링 예산(Crawl Budget) 낭비를 방지하고, 핵심 페이지의 색인 속도를 높였습니다.

로컬 실행 방법 (Getting Started)
Bash
# 1. 저장소 클론
git clone https://github.com/your-github/easypick.git

# 2. 프로젝트 폴더 이동 및 의존성 설치
cd easypick
npm install

# 3. 환경변수 설정 (.env.local)
# 아래 키들을 발급받아 프로젝트 루트에 설정합니다.
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key

# 4. 개발 서버 실행
npm run dev

# 5. 주간 랭킹 업데이트 수동 실행 (선택)
# 별도의 터미널을 열고 파워쉘 스크립트를 실행하여 최신 랭킹 DB를 갱신합니다.
.\update_rankings.ps1
