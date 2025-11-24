# Code masterpiece (Frontend)

[![Next.js](https://img.shields.io/badge/Next.js_16_(Canary)-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React_19-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> 최신 웹 기술의 한계를 실험하고, 극한의 사용자 경험(UX)과 개발자 경험(DX)을 동시에 추구한 CMS 기반 블로그 플랫폼입니다.

🔗 **블로그:** [https://codemasterpiece.com](https://www.codemasterpiece.com)

🔗 **Backend Repo:** [https://github.com/DevNathan/codemasterpiece-backend](https://github.com/DevNathan/codemasterpiece-backend)

---

### 목차

1. 개발 주안점
2. 프론트엔드 엔지니어링 표준
3. 테크 스택
4. 트러블슈팅

## 1. 개발 주안점

이 프로젝트는 단순한 기능 구현을 넘어, **실제 운영 가능한 수준의 품질과 유지보수성**을 목표로 개발되었습니다. 특히 다음 3가지를 핵심 가치로 삼았습니다.

### 1) 유지보수성과 확장성을 고려한 아키텍처

기능이 추가될수록 복잡도가 기하급수적으로 증가하는 소프트웨어의 특성을 고려하여, **'변경에 유연한 구조'**를 만드는 데 집중했습니다.
- Feature-First Architecture (비즈니스 로직 응집도 강화)
  > 기존의 기술 중심(Layer-based) 폴더 구조 대신, 도메인(기능) 중심의 폴더 구조를 채택했습니다.
  > src/features/{domain} 하위에 해당 기능의 UI, 상태 관리(State), API 통신 코드를 **응집(Colocation)**시켜, 코드 수정 시 영향 범위를 최소화했습니다.
  > 도메인 간의 불필요한 결합을 방지하고, 공통 로직이 필요한 경우에만 src/shared 계층을 통해 의존성을 관리하여 스파게티 코드를 예방했습니다.
- 철저한 관심사의 분리 (Frontend vs Backend)
  > Next.js의 API Routes 기능을 활용한 풀스택 접근 방식 대신, 확실한 역할 분리를 택했습니다.
  > **Frontend (Next.js)**는 사용자 경험(UX)과 뷰(View) 렌더링에 집중하고, **Backend (Spring Boot)**는 복잡한 비즈니스 로직 처리, 트랜잭션 관리, 데이터 무결성 보장에 집중하도록 설계했습니다.
  > 이를 통해 각 계층이 독립적으로 발전할 수 있는 구조를 확립하고, 디버깅 및 유지보수의 효율성을 극대화했습니다.
  
```bash
tree
├── doc/                        # 개발 프로세스 및 기획 문서 (MoSCoW, Convention)
├── public/                     # 정적 에셋 (Images)
├── src/
│   ├── app/                    # Next.js 16 App Router (Routing & Layouts)
│   │   ├── (main)/             # 메인 레이아웃 그룹
│   │   ├── (post)/             # 게시글 상세 관련 라우트
│   │   └── api/                # Next.js Route Handlers
│   │
│   ├── features/               # ⭐️ Feature-First Architecture (Domain Logic)
│   │   ├── post/               # [Example] 게시글 도메인 (모든 로직 응집)
│   │   │   ├── api/            # - Server Actions & API Fetchers
│   │   │   ├── hook/           # - 도메인 전용 Hooks (usePost, useViewOnVisible)
│   │   │   ├── queries/        # - TanStack Query Keys & Options
│   │   │   ├── schemas/        # - Zod Schemas (DTO Validation)
│   │   │   └── ui/             # - 도메인 종속 컴포넌트 (WriterForm, DetailView)
│   │   ├── auth/               # 인증 도메인
│   │   ├── comment/            # 댓글 도메인
│   │   └── analytics/          # 통계 도메인
│   │
│   ├── shared/                 # Cross-Cutting Concerns (공통 모듈)
│   │   ├── components/
│   │   │   ├── markdown/       # - 커스텀 마크다운 렌더러 (CodeBlock, Heading)
│   │   │   └── shadcn/         # - 디자인 시스템 (Radix UI + Tailwind)
│   │   └── module/             # - 공유 모듈
│   │
│   ├── lib/                    # Configuration & Utilities
│   │   ├── api/                # ⭐️ 커스텀 fetch 기능 (Type-Safe)
│   │   │   ├── clientFetch.ts  # - Client-side Fetch (w/ 리액트 훅 폼 확장)
│   │   │   └── serverFetch.ts  # - Server-side Fetch (w/ 쿠키 포워딩 기능)
│   │   └── constants/          # - 환경 상수 값
│   │
│   └── contexts/               # Global Contexts (Theme, Auth, QueryClient)
│
├── next.config.ts              # Next.js Config
├── package.json                # Dependencies (React 19, Next 16, Tailwind 4)
└── tsconfig.json               # TypeScript Config
```
  
### 2) 예측 가능한 데이터 흐름과 견고한 코드 품질
TypeScript의 정적 타이핑에만 의존하지 않고, 런타임 단계의 안정성까지 확보하는 **방어적 프로그래밍**을 지향했습니다. 또한, 자동화 도구를 통해 코드 품질을 상시 모니터링합니다.

- **런타임 타입 안정성 확보 (Runtime Type Safety)**
  > TypeScript는 컴파일 타임에만 유효하므로, 백엔드 API 응답과 같은 외부 데이터의 정합성을 100% 보장할 수 없습니다. 이를 보완하기 위해 **Zod** 라이브러리를 도입했습니다. API 응답 데이터를 런타임에 스키마(Schema) 기반으로 검증하여, 예상치 못한 데이터로 인한 렌더링 오류를 사전에 차단하고 애플리케이션의 신뢰성을 높였습니다.

- **기술 부채의 선제적 차단 (Automated Quality Control)**
  > 기능 구현에만 집중하다 보면 놓치기 쉬운 불필요한 코드와 의존성 문제를 도구를 통해 해결했습니다.
  > - **Knip**: 사용되지 않는 파일, `export`, 의존성(Dead Code)을 자동으로 탐지하고 제거하여 번들 사이즈를 최적화했습니다.
  > - **Syncpack**: `package.json` 내의 의존성 버전을 일관되게 관리하여, 버전 불일치로 인한 잠재적 오류를 방지하고 유지보수 비용을 줄였습니다.
  
### 3) SEO와 UX의 최적화된 균형 (SEO & UX)
블로그 플랫폼의 핵심 성공 요인은 '검색 엔진 노출(SEO)'과 '사용자 경험(UX)'의 조화에 있다고 판단하여, 이를 기술적으로 뒷받침할 수 있는 스택을 선정했습니다.

- **검색 엔진 최적화 (SEO)를 위한 Next.js 도입**
  > 블로그 콘텐츠가 검색 엔진에 효과적으로 인덱싱되도록 하는 것은 프로젝트의 가장 중요한 요구사항이었습니다.
  > 일반적인 SPA(Single Page Application)의 한계를 극복하기 위해 **Next.js**를 채택, **SSR(Server-Side Rendering)**과 **Metadata API**를 적극 활용했습니다. 이를 통해 크롤러가 콘텐츠를 정확하게 파악하도록 돕고, 초기 로딩 속도(FCP)를 단축하여 이탈률을 줄였습니다.

- **고품질 UX와 접근성(A11y)을 보장하는 Design System**
  > 개발자가 비즈니스 로직에 집중하면서도 사용자에게 일관되고 세련된 인터페이스를 제공하기 위해 **shadcn/ui**를 도입했습니다.
  > **Radix UI** 기반의 Headless 컴포넌트를 활용하여 WAI-ARIA 접근성 표준을 준수하고, 스크린 리더 사용자 등 다양한 환경의 사용자를 고려했습니다. 또한, 복사-붙여넣기 방식의 구조를 통해 커스터마이징의 자유도를 높이면서도 디자인 시스템의 통일성을 유지했습니다.

<br>

> **Performance Metrics (Lighthouse)**
>
> <img width="420" alt="Lighthouse Score" src="https://github.com/user-attachments/assets/ad982e98-be36-4b57-8931-821b783e7c3c" />
>
> * **SEO (91)**: 시맨틱 태그 활용, JSON-LD 구조화 데이터 적용으로 검색 엔진 친화적 구조 확립.
> * **Best Practices (96)**: HTTPS, 보안 표준 준수, 최신 이미지 포맷(WebP) 활용.
> * **Performance (84)**: 고화질 3D 인터랙션이 포함된 상세 페이지임에도 준수한 성능 유지.

<br>

## 2. 프론트엔드 엔지니어링 표준

안정적인 아키텍처 위에서, 최적의 사용자 경험(UX)과 개발자 경험(DX)을 동시에 충족시키기 위해 다음과 같은 **프론트엔드 엔지니어링 원칙**을 적용했습니다.

### 1) Next.js 16 Core: 하이브리드 렌더링 전략 (RSC + SSR)
정적 콘텐츠의 효율성과 사용자 인터랙션의 필요성에 따라 렌더링 방식을 이원화하여 최적의 성능을 구현했습니다.

- **RSC를 통한 고속 데이터 페칭 (Data Fetching)**
  > 페이지 진입 시 가장 무거운 작업인 '게시글 데이터 조회'와 '메타데이터 생성'은 **React Server Components(RSC)** 단계(`page.tsx`)에서 처리합니다. 이를 통해 클라이언트의 워터폴(Waterfall) 현상을 방지하고, 완성된 데이터를 즉시 클라이언트로 전달합니다.

- **Pre-rendered Client Component (SEO & Interactivity)**
  > 마크다운 뷰어(`PostDetailView`)는 코드 복사, 이미지 줌(Zoom), 목차(TOC) 하이라이팅 등 풍부한 **상호작용(Interactivity)**을 제공하기 위해 Client Component로 구현했습니다.
  > 하지만 Next.js의 **Pre-rendering(SSR)** 기법이 적용되므로, 자바스크립트 로드 전에도 완성된 HTML을 즉시 보여주어 **FCP(First Contentful Paint)**와 검색 엔진 최적화(SEO)를 모두 확보했습니다.

### 2) Type-Safe한 데이터 동기화 및 통신 표준화
Backend(Spring Boot)와 Frontend(Next.js) 간의 통신 안정성을 보장하기 위해, 환경별로 최적화된 **Custom Fetch Wrapper**를 설계하여 데이터 흐름을 표준화했습니다.

- **Dual-Fetch Architecture (`serverFetch` / `clientFetch`)**
  > 실행 환경에 따라 서로 다른 제약 사항을 해결하기 위해 Fetch 유틸리티를 분리했습니다.
  > - **ServerFetch**: 내부망 통신(`INTERNAL_DOMAIN`) 자동 라우팅, 쿠키(Cookie) 포워딩, Trace ID 추적을 통한 서버 간 로그 연결.
  > - **ClientFetch**: 브라우저 환경의 CORS 및 인증 헤더 자동 관리, `React Hook Form`과 결합하여 서버의 Validation 에러를 UI 필드에 즉시 매핑하는 자동화 로직 구현.

- **Schema-First Validation & Error Normalization**
  > 모든 API 요청에 **Zod Schema**를 주입하여, 응답 데이터가 예상된 DTO 구조와 일치하는지 런타임에 검증합니다. 또한, HTTP 상태 코드와 무관하게 표준화된 에러 객체(`ApiResult`)를 반환하도록 추상화하여, `try-catch` 지옥 없이 일관된 에러 핸들링을 구현했습니다.

### 3) 선언적 비동기 처리와 에러 핸들링 (UX Engineering)
사용자 경험을 해치지 않으면서 로딩과 에러 상황을 유연하게 대처하기 위해 React의 **선언적(Declarative)** 패턴을 적극 활용했습니다.

- **Streaming SSR & Suspense**
  > Next.js의 스트리밍 기능을 활용하여 페이지의 뼈대(Shell)를 즉시 전송하고, 데이터 로딩이 필요한 부분은 `Suspense`와 스켈레톤 UI로 대체하여 사용자의 **체감 대기 시간(Perceived Latency)**을 단축했습니다.

- **Graceful Degradation (우아한 실패)**
  > 부분적인 API 에러가 전체 페이지의 중단(Crash)으로 이어지지 않도록, 각 기능(Feature) 단위로 `Error Boundary`를 적용했습니다. 에러 발생 시 해당 컴포넌트만 '재시도 UI'로 대체되어 서비스의 가용성을 유지합니다.

### 4) Headless UI 기반의 합성 컴포넌트 설계
디자인 변경에 유연하게 대처하고 로직의 재사용성을 높이기 위해 **Headless UI** 패턴을 채택했습니다.

- **기능과 스타일의 분리**
  > 접근성(WAI-ARIA)과 복잡한 인터랙션 로직은 **Radix UI** 라이브러리에 위임하고, 스타일링은 **Tailwind CSS**로 처리하여 각자의 역할에 집중하도록 설계했습니다.

- **Compound Component Pattern**
  > 재사용성이 높은 컴포넌트는 부모-자식 관계의 합성 컴포넌트(`Dialog.Root`, `Trigger`, `Content`)로 구현하여, 사용하는 개발자가 상황에 맞춰 레이아웃을 자유롭게 조합할 수 있는 유연성을 확보했습니다.
  
<br>

## 3. 테크 스택

| 분류 (Category) | 사용 기술 (Technologies) |
| :--- | :--- |
| **IDE** | [![Intellij](https://img.shields.io/badge/IntelliJ_IDEA-000000?style=for-the-badge&logo=intellij-idea&logoColor=white)](https://www.jetbrains.com/idea) |
| **Language** | [![TypeScript](https://img.shields.io/badge/TypeScript_5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) |
| **Framework** | [![Next.js](https://img.shields.io/badge/Next.js_16_(Canary)-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/) [![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/) |
| **Styling & UI** | [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) [![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radix-ui&logoColor=white)](https://www.radix-ui.com/) [![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/) [![Lucide](https://img.shields.io/badge/Lucide_Icons-F05032?style=for-the-badge&logo=lucide&logoColor=white)](https://lucide.dev/) |
| **State & Logic** | [![TanStack Query](https://img.shields.io/badge/TanStack_Query_v5-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query) [![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/) [![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)](https://react-hook-form.com/) |
| **Tooling** | [![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/) [![Turbopack](https://img.shields.io/badge/Turbopack-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://turbo.build/) [![Knip](https://img.shields.io/badge/Knip-F7B93E?style=for-the-badge&logo=knip&logoColor=white)](https://knip.dev/) |

<br>

## 4. 트러블슈팅 사례

### 1) API 통신 계층의 파편화 해결과 미들웨어 런타임 제약 극복

* **문제 상황 (Boilerplate Hell)**
  > Next.js의 기본 `fetch`는 강력하지만, 실제 운영 환경에서는 네트워크 에러 처리(`try-catch`), 응답 상태 코드 확인(`!res.ok`), 공통 응답 규격 파싱(`ApiResult`) 등의 보일러플레이트 코드가 매 요청마다 반복되는 비효율이 발생했습니다.

* **해결 과정 (Abstraction & Type Safety)**
  > **Fetch Wrapper 설계**: `serverFetch`와 `clientFetch`를 구현하여 반복되는 에러 핸들링 로직을 중앙화하고, 환경별(Server/Client) 제약 사항을 캡슐화했습니다.
  > **Zod 통합**: 요청 시 `dataSchema`를 주입받아, 성공 응답뿐만 아니라 에러 응답까지 런타임에 검증하도록 하여 **'예측 가능한 통신 계층'**을 구축했습니다.

* **기술적 난관 (Edge Runtime Constraint)**
  > API Proxy 역할을 하는 미들웨어(Middleware)에서 `serverFetch`를 재사용하려 했으나 런타임 에러가 발생했습니다. 원인 분석 결과, `next/headers`의 `cookies()` 함수는 Node.js 기반의 Server Component 컨텍스트에 의존하므로, **Edge Runtime** 기반의 미들웨어에서는 사용할 수 없었습니다.

* **최종 해결 (Static Fetch Separation)**
  > 미들웨어 및 SSG(Static Site Generation)와 같이 사용자 세션(Cookie)이 없거나 필요 없는 환경을 위해 **`staticServerFetch`**를 분리 구현했습니다. 불필요한 헤더 의존성을 제거하고 `AbortController` 기반의 타임아웃 처리를 추가하여, 런타임 환경에 구애받지 않는 순수한 서버 사이드 요청 유틸리티를 확보했습니다.

### 2) 복잡한 비동기 상태 관리의 응집도 향상과 트레이드오프 분석

* **문제 상황 (Props Drilling & Scattered Logic)**
  > 대댓글(Nested Reply), 페이지네이션, 좋아요, 숨김 처리 등 복잡한 기능이 얽힌 '댓글 시스템'을 구현하면서, 관련 로직이 여러 컴포넌트에 산재되어 유지보수가 어렵고 심각한 Props Drilling이 발생했습니다.

* **해결 과정 (Context as a Controller)**
  > **Logic Colocation**: `CommentContext`를 도입하여 UI 렌더링을 제외한 모든 비즈니스 로직(데이터 페칭, Mutation, 캐시 업데이트)을 한곳으로 응집시켰습니다.
  > **Optimistic Updates**: 사용자 경험(UX)을 위해 `React Query`의 캐시를 직접 조작하여, 서버 응답을 기다리지 않고 UI를 즉시 갱신(좋아요/삭제 등)하는 낙관적 업데이트 패턴을 적용했습니다.

* **기술적 성찰 (Retrospective)**
  > **성과**: 복잡한 상태 관리 로직을 캡슐화함으로써 하위 컴포넌트(`CommentList`, `CommentItem`)는 렌더링에만 집중할 수 있는 순수성을 확보했습니다.
  > **한계 및 개선점**: 모든 로직을 Context에 몰아넣다 보니 파일 크기가 커지고 책임이 과중되는(God Object) 경향이 있었습니다. 향후에는 낙관적 업데이트 로직을 별도의 커스텀 훅(`useOptimisticMutation`)으로 분리하여 Context의 부하를 줄이고 관심사를 더 세밀하게 분리할 계획입니다.
  
<br>

## 5. 설치 및 실행 가이드 (Getting Started)

이 프로젝트는 **Node.js 25.x** 및 **pnpm** 환경을 권장합니다.

### 로컬 개발 환경 (Manual)

1.  **Repository Clone**
    ```bash
    git clone [https://github.com/DevNathan/codemasterpiece-front.git](https://github.com/DevNathan/codemasterpiece-front.git)
    cd codemasterpiece-front
    ```

2.  **Install Dependencies**
    엄격한 의존성 관리를 위해 `pnpm`을 사용합니다.
    ```bash
    pnpm install
    ```

3.  **Environment Setup**
    `.env.schema` 파일을 복사하여 `.env.local`을 생성하고, API 엔드포인트 등 필수 환경변수를 설정합니다.
    ```bash
    cp .env.schema .env.local
    ```

4.  **Run Development Server**
    Turbopack을 사용하여 고속 개발 서버를 실행합니다.
    ```bash
    next dev
    ```
