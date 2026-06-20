<div align="center">

# PickEasy (픽이지)

**고민은 AI가, 선택은 쉽고 빠르게 - 실시간 검색(Grounding) 기반 AI IT 제품 큐레이션 플랫폼**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

</div>

### 1. 서비스명 및 한 줄 소개
* **서비스명:** PickEasy (픽이지)
* **한 줄 소개:** 실시간 시장 가격 변동을 반영하여 사용자 맞춤형 IT 제품/가전 견적과 스펙 비교를 제공하는 AI 쇼핑 큐레이션 에이전트 서비스입니다.

### 2. 문제 정의
기존 쇼핑 챗봇이나 추천 서비스는 과거 데이터에 의존하여 '현재 시장의 실시간 가격 변동'을 반영하지 못하거나, 존재하지 않는 스펙을 지어내는 환각(Hallucination) 현상이 발생합니다. 특히 PC 부품 등 가격 변동성이 큰 IT 기기 시장에서, 사용자의 추상적인 요구사항(예: "150만 원대 영상편집용 PC")을 정확히 분석하고 실질적인 실시간 구매 가이드를 제공하는 지능형 에이전트가 필요하다고 정의했습니다.

### 3. 주요 기능
* **실시간 AI PC 견적사:** 예산과 용도 입력 시, 실시간 부품 시세를 검색하여 조립 PC 견적을 JSON 형태로 반환 및 렌더링.
* **스마트 맞춤 추천 퀴즈:** 사용자의 라이프스타일과 예산을 분석해 최적의 IT/가전제품 3가지 큐레이션.
* **AI 스펙 비교 (VS):** 복잡한 IT 기기 스펙(예: 아이폰 vs 갤럭시)을 카테고리별로 분석하고 승자를 판별.
* **주간 랭킹 자동화 (Cron Jobs):** 20여 개 IT 카테고리의 최신 인기 순위를 매시간/매주 자동 업데이트.

### 4. 사용 기술 스택
* **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
* **Backend & DB:** Supabase (PostgreSQL, Storage)
* **AI & LLM:** Google Gemini 2.5 Flash (Search Grounding 적용)
* **Infra & Security:** Vercel 배포, Cloudflare Turnstile (봇 방어)

### 5. 실행 방법
```powershell
# 저장소 클론
git clone [https://github.com/](https://github.com/)[본인아이디]/pickeasy.git
cd pickeasy

# 패키지 설치
npm install

# 환경 변수 설정 (.env.local 파일 생성 후 키 입력)
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# GEMINI_API_KEY=...

# 개발 서버 실행
npm run dev
