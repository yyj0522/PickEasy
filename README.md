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
```

### 6. 배포 URL
* https://www.easypick-ai.com/

### 7. 테스트 계정 정보
* 본 서비스는 별도의 로그인이나 회원가입 절차 없이 모든 핵심 기능(AI 에이전트 큐레이션)을 즉시 테스트해 보실 수 있습니다.

### 8. LLM/Agent 동작 구조
* **Search Grounding 결합:** Gemini 모델에 Google Search Grounding을 활성화하여 에이전트가 답변 생성 전 최신 '다나와/컴퓨존 국내 정품' 시세를 강제 탐색하도록 쿼리를 주입(Injection)합니다.
* **System Prompting 제어:** "학습된 지식을 무시하고 실시간 검색 결과의 가격을 최우선으로 반영하라"는 프롬프트를 통해 가격 변동장(예: 메모리 반도체 폭등)에서의 환각 현상을 억제합니다.
* **JSON 파싱 파이프라인:** LLM의 자연어 응답에서 마크다운을 제거하고 순수 JSON 객체 포맷만 추출하여 프론트엔드 UI 컴포넌트로 즉시 매핑합니다.

### 9. 데이터 흐름
1. **Client:** 사용자가 요구사항(예산, 용도 등)을 입력하여 Next.js API Route로 전송합니다.
2. **Middleware (Rate Limiting):** IP 및 기능별 일일 호출 횟수를 확인하여 무단 트래픽을 차단합니다.
3. **Supabase (Cache Hit):** 24시간 이내 동일한 조건의 요청이 존재할 경우 DB에서 즉시 결과를 반환합니다(API 비용 0).
4. **AI Agent (Cache Miss):** 캐시가 없을 경우 Gemini API를 호출하여 실시간 검색을 수행하고 응답을 생성합니다.
5. **DB Update & Response:** 생성된 JSON 결과를 Supabase에 저장(캐싱)한 뒤, 클라이언트에 전달하여 화면에 렌더링합니다.

### 10. 본인이 중점적으로 구현한 부분
* **Edge Request 최적화 및 Vercel 배포 효율화:** 로컬에 존재하던 정적 에셋(이미지 등)을 Supabase Storage로 전면 마이그레이션하고 API 라우트 로직을 수정하여, Vercel 환경에서의 Edge Request 병목을 해소하고 로딩 속도를 극대화했습니다.
* **LLM API 비용 한도(Quota) 방어 아키텍처:** 기능별로 '검색 툴이 켜진 모델'과 '꺼진 모델'을 분리 라우팅하고, Supabase를 활용한 자체 프롬프트 캐싱 시스템을 구축하여 API 호출 비용을 획기적으로 절감했습니다.
* **테크니컬 SEO 파이프라인:** `sitemap.ts`를 통한 동적 라우트 자동 생성 및 `robots.ts` 최적화를 통해 크롤링 예산을 관리하여 오가닉 트래픽 유입을 강화했습니다.

### 11. 구현하지 못한 부분
* **멀티 턴(Multi-turn) 대화형 인터페이스:** 현재는 사용자의 단일 입력(단답형 폼)에 대한 One-shot 큐레이션으로 동작하며, 에이전트와 지속적으로 티키타카 하며 조건을 좁혀나가는 채팅형 UI는 구현되지 않았습니다.
* **개인화된 유저 히스토리:** 로그인 세션 관리가 적용되지 않아, 사용자가 과거에 추천받은 견적이나 스펙 비교 결과를 마이페이지 형태로 저장하고 관리하는 기능이 누락되어 있습니다.

### 12. 향후 개선 방향
* **RAG(Retrieval-Augmented Generation) 도입:** 외부 검색 엔진에만 의존하지 않고, 특정 커머스 도메인의 상품 DB를 벡터화(Vector DB)하여 임베딩 기반으로 추천 정확도를 높이는 구조로 고도화할 계획입니다.
* **스트리밍(SSE) 응답 적용:** LLM의 응답 대기 시간 동안 사용자의 이탈을 막기 위해 SSE(Server-Sent Events)를 활용한 타아핑 애니메이션 및 로딩 상태 동기화를 적용하고자 합니다.

### 13. AI 개발 도구 활용 여부
* 전체 프로젝트의 기획 고도화 및 코드 리팩토링 과정에서 ChatGPT와 Claude를 활용해 아이디에이션을 진행했습니다.
* Cursor IDE를 메인 개발 환경으로 사용하여, Next.js 보일러플레이트 작성, 컴포넌트 분리, 그리고 Supabase DB 스키마 설계 과정에서 AI의 자동 완성 및 코드 리뷰 기능을 적극 활용해 개발 생산성(Time-to-market)을 끌어올렸습니다.
