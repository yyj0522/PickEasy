<div align="center">

# 픽이지 (PickEasy)
**고민은 AI가, 선택은 쉽고 빠르게 - 실시간 검색(Grounding) 기반 AI IT 제품 큐레이션 플랫폼**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

[웹사이트 바로가기](https://www.easypick-ai.com/) 

</div>

## 프로젝트 소개 (Overview)
기존의 쇼핑 추천 서비스나 단순 챗봇들은 "현재 시장의 실시간 가격 변동"을 읽어내지 못하거나, 과거 데이터에 의존한 환각(Hallucination) 현상으로 인해 사용자에게 실질적인 구매 가이드를 제공하지 못하는 한계가 있었습니다. 특히 PC 부품이나 IT 기기는 하루가 다르게 가격이 변동하기 때문에 실시간 데이터 연동이 필수적이었습니다.

픽이지(PickEasy)는 이러한 문제를 해결하기 위해 AI-Native 접근법을 채택하여 기획된 B2C SaaS 웹 애플리케이션입니다. 사용자의 추상적인 요구사항(예: "150만 원대 영상편집용 PC")을 분석하고, Google Search Grounding 기술을 활용해 실시간 시장 최저가를 스크래핑 및 검증하여, 가장 합리적이고 정확한 맞춤형 쇼핑 큐레이션을 제공합니다.

초기 기획부터 Next.js 기반의 하이브리드 백엔드 아키텍처 설계, 외부 데이터 연동, 지능형 AI 에이전트 프롬프트 파이프라인 구축, 그리고 테크니컬 SEO 최적화까지 전체 풀사이클(Full-cycle)을 1인 개발로 주도하여 완성한 프로젝트입니다.

## 핵심 기능 (Key Features)
* **실시간 AI PC 견적사 (PC Builder):** 예산과 용도를 입력하면 Gemini 모델이 '다나와/컴퓨존' 기반의 실시간 부품 시세를 검색하여 조립 PC 견적을 JSON 형태로 반환 및 렌더링합니다. (특정 부품 가격 폭등 등 최신 시장 상황 완벽 반영)
* **스마트 맞춤 추천 퀴즈:** 사용자의 라이프스타일과 예산 범위를 분석하여, 현재 판매 중인 최적의 IT 기기/가전제품 3가지를 상세한 분석 결과와 함께 추천합니다.
* **AI 스펙 비교 (VS):** 복잡한 IT 기기의 스펙(예: 아이폰 vs 갤럭시)을 AI가 카테고리별로 분석하고 승자를 판별하여 직관적인 UI로 제공합니다. DB 캐싱을 통해 응답 속도와 API 비용을 최적화했습니다.
* **주간 랭킹 자동화 (Cron Jobs):** 20여 개 IT 카테고리의 최신 인기 순위 TOP 10을 매시간 및 매주 자동으로 업데이트하고 DB에 저장하여 사용자에게 최신 트렌드를 제공합니다.
* **보안 및 트래픽 제어 (Rate Limiting):** Cloudflare Turnstile을 통한 봇 방어 및 악성 요청 차단 로직을 구현했으며, IP 및 기능별(PC 견적 3회, 비교 5회 등) 일일 호출 횟수 제한을 두어 LLM API 과금을 선제적으로 방어합니다.

## 기술 스택 및 도입 배경
* **프론트엔드/백엔드 (Next.js 14, React, TypeScript)**
  * 검색 엔진 최적화(SEO)와 빠른 초기 로딩 속도(SSR/SSG)를 확보하고, API Route를 활용해 외부 LLM API Key 노출을 방지하는 하이브리드 백엔드 아키텍처를 구축하기 위해 App Router 방식을 도입했습니다.
* **스타일링 (Tailwind CSS)**
  * 일관된 디자인 시스템 유지 및 빠른 UI 프로토타이핑, 다양한 디바이스에 대응하는 반응형 레이아웃을 구현하기 위해 유틸리티 우선의 Tailwind CSS를 채택했습니다.
* **AI & LLM (Google Gemini 2.5 Flash)**
  * 실시간 데이터가 필수적인 서비스 특성상, Google Search Grounding 기능이 내장되어 외부 데이터 소스를 가장 빠르고 비용 효율적으로 업무 자동화 파이프라인에 통합할 수 있어 도입했습니다.
* **백엔드/BaaS (Supabase)**
  * 프론트엔드 뷰와 AI 로직 구현에 집중하면서도, 안정적인 관계형 DB(PostgreSQL)를 활용해 사용자 Rate Limiting 데이터와 AI 프롬프트 캐싱 데이터를 실시간으로 처리하기 위해 채택했습니다.

## 트러블 슈팅 및 UX 최적화 (Troubleshooting)

### 1. 프롬프트 파이프라인 구축 및 환각(Hallucination) 제어
* **문제 상황:** PC 견적 생성 시, 2026년 메모리 반도체 가격 폭등 상황을 AI가 인지하지 못하고 과거 학습 데이터를 기준으로 잘못된 총액을 계산하는 치명적인 환각 현상이 발생했습니다.
* **해결 방안:** 1. 프롬프트에 "학습된 지식을 완전 무시하고, 검색 결과가 과거 대비 비싸더라도 의심 없이 반영하라"는 명시적 제어(System Prompting)를 추가하여 AI 에이전트의 로직을 고도화했습니다.
  2. 해외 직구 가격 혼입을 막기 위해 검색 쿼리에 '다나와, 컴퓨존 국내 정품' 키워드를 강제 주입(Injection)했습니다.
  3. AI 응답에서 마크다운을 제거하고 순수 JSON 객체만 추출하는 커스텀 파싱 유틸리티를 구현하여 안정적인 렌더링 파이프라인을 구축했습니다.

### 2. LLM API 비용 한도(Quota) 최적화 및 캐싱 전략
* **문제 상황:** 유저 트래픽이 증가함에 따라 Gemini API의 무료 제공량(1,500 RPD)이 빠르게 소진되어 서비스 중단 위험이 발생했습니다.
* **해결 방안:** 1. 모든 기능에 일괄적으로 AI를 호출하지 않고 **기능별 아키텍처를 분리**했습니다. 가격 변동이 심한 기능은 '검색 툴이 켜진 모델'을, 스펙 변동이 없는 기능은 '검색 툴이 꺼진 가벼운 모델'을 사용하여 속도와 비용을 최적화했습니다.
  2. 24시간 이내의 동일 요청(예: 동일 예산 PC 견적)은 Supabase DB에서 캐싱된 데이터를 즉시 반환하도록 설계하여 불필요한 API 호출(0 RPD)을 원천 차단했습니다.

### 3. 테크니컬 SEO 고도화 및 크롤링 예산(Crawl Budget) 최적화
* **문제 상황:** 서비스 최초 배포 후 구글 서치콘솔에서 '적절한 표준 태그가 포함된 대체 페이지' 오류로 인해 핵심 기능 페이지들이 정상적으로 색인되지 않는 문제가 발생했습니다.
* **해결 방안:** 1. `layout.tsx`에 잘못 전역 설정된 `canonical` 태그를 제거하여 각 하위 페이지가 고유한 메타데이터를 갖도록 아키텍처를 수정했습니다.
  2. `sitemap.ts`를 활용하여 정적 라우트뿐만 아니라 DB에 쌓이는 랭킹 데이터 기반의 동적 상품 페이지(`/product/[slug]`)까지 자동으로 생성되도록 구현했습니다.
  3. `robots.ts`를 통해 `/api` 등 불필요한 백엔드 라우트의 크롤링을 차단하여 검색 엔진의 크롤링 예산 낭비를 방지하고 핵심 페이지의 노출 속도를 극대화했습니다.

## 설치 및 로컬 실행 방법 (Getting Started)

```powershell
# 1. 저장소 클론
git clone [https://github.com/사용자계정/easypick.git](https://github.com/사용자계정/easypick.git)

# 2. 프로젝트 폴더로 이동
cd easypick

# 3. 의존성 패키지 설치
npm install

# 4. 환경변수 설정
# 프로젝트 루트 경로에 .env.local 파일을 생성하고 아래 데이터를 입력합니다.
New-Item -Path . -Name ".env.local" -ItemType "file" -Value "GEMINI_API_KEY=`"your_gemini_api_key`"`nNEXT_PUBLIC_SUPABASE_URL=`"your_supabase_url`"`nSUPABASE_SERVICE_ROLE_KEY=`"your_supabase_service_role_key`"`nNEXT_PUBLIC_TURNSTILE_SITE_KEY=`"your_turnstile_site_key`""

# 5. 개발 서버 실행
npm run dev

# 6. 주간 랭킹 업데이트 수동 실행 (선택 사항)
# 새로운 PowerShell 창을 열고 아래 스크립트를 실행하여 최신 랭킹 데이터를 갱신합니다.
.\update_rankings.ps1
```
