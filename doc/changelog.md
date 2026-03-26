# Changelog

## [Unreleased]
- 게시글 퀴즈 추가하기

## [1.1.1] - 2026-03-27
### Fixed
- **메타데이터 증발 버그 해결**
- **접근성 명도 대비(Contrast Ratio) 수정**: `CommentForm`의 방사형 그라데이션 아우라 투명도를 대폭 하향(30% -> 3%)하고 위치를 조정하여 텍스트 가독성 확보. `imageFallback` 및 각 폼의 텍스트 명도 대비 규격(WCAG) 충족
- **시맨틱 구조(Hierarchy) 오류 수정**: `PolicyDialog` 내 시맨틱 요소 오남용(불필요한 `h3`, `h5` 태그 남발)을 다른 태그로 대체

### Changed
- **레이아웃 메타데이터 마이그레이션**: `layout.tsx`에 하드코딩되어 있던 `<head>` 태그를 완전히 제거하고, 구글 사이트 소유권 인증 및 `color-scheme` 설정을 Next.js 네이티브 `Metadata` 및 `Viewport` API로 이주
- **동적 텍스트 색상(Foreground) 시스템 도입**: 테마별 포인트 컬러(Amber, Sky, Purple) 변경 시 배경 명도에 맞춰 텍스트 색상이 자동으로 최적의 대비를 유지하도록 CSS 디자인 시스템(`--point-foreground`) 재설계 적용
- **접근성(Accessibility) 속성 부여**: `SizeSelector` 등 스크린 리더가 인식하지 못하던 상호작용 요소들에 `aria-labelledby` 및 명시적 라벨 부여

### Performance
- **웹 성능 지표(Core Web Vitals) 최적화**: 메인 히어로 이미지의 `sizes` 속성 구체화 및 `TypingTitle`의 초기 텍스트 렌더링을 강제하여 LCP 속도 개선 및 CLS(누적 레이아웃 이동) 점수 완전 정상화.

## [1.1.0] - 2026-03-26
### Added
- **Vercel Monitoring**: 실시간 유저 분석 및 성능 감시를 위한 `@vercel/analytics` 및 `@vercel/speed-insights` 도입.
- **Cache Management**: 게시글 캐싱 및 관리 기능 추가

### Changed
- **Server-Side Markdown Parsing**: 클라이언트의 부담을 줄이기 위해 마크다운 파싱 로직을 서버로 전결 이관. 프론트엔드 번들 크기 획기적 감소.
- **Comment State Synchronization**: `CommentContext` 리팩토링을 통해 댓글 표시 개수와 로컬 스토리지 간의 '단일 진실 공급원(SSOT)' 구축.
- **Codebase Cleanup**: `knip`을 도입하여 미사용 파일, 의존성, Export를 전수 조사하고 제거. **Lean and Mean** 코드베이스 달성.

### Performance
- **Rendering Speedup**: 마크다운 서버 렌더링 전환으로 상세 페이지 **LCP 472ms** 달성. **Extreme performance.**
- **Build Optimization**: 불필요한 마크다운 파싱 라이브러리(`react-markdown` 등) 제거를 통한 빌드 타임 및 런타임 최적화.

## [1.0.11] -2026-03-17
### Updated
- vercel에서 구동을 위한 node 25.x -> 24.x 하향 조정
- Next.js 보안 문제에 따른 대응 버전 업데이트 >> 16.1.7
- 디펜던시 최신화

## [1.0.10] - 2025-12-16
### Security
- **긴급 보안 패치**: Next.js React Server Components 관련 원격 코드 실행 취약점('React2Shell') 해결을 위한 핫픽스 적용

## [1.0.9] - 2025-12-14
### Added
- **수식 지원**: 게시글 내 LaTeX 수학 공식($$...$$) 렌더링을 위한 `remark-math`, `rehype-katex` 플러그인 도입 및 스타일 적용

### Fixed
- **Callout 렌더링 수정**: `rehype-raw` 파싱 과정에서 발생하는 줄바꿈(`\n`) 및 공백 노드로 인해 `[!tip]` 등의 트리거 텍스트가 화면에 노출되거나 상단에 불필요한 여백이 생기는 버그 수정
- **중첩 스타일 오류 수정**: 인용문 및 코드 블록 내부에서 Bold, Italic 등의 중첩 마크다운 스타일이 올바르게 적용되지 않던 문제 해결
- **블록 내부 코드 수정**: blockquote안에서 code가 표현될 시 부모 박스를 벗어나는 문제를 해결

## [1.0.8] - 2025-12-05
### Changed
- **마크다운 렌더러 개선**: `blockquote` 및 Callout(Alert) 내부 렌더링 로직을 리팩토링하여, 박스 안에서도 볼드/링크 등의 마크다운 문법과 문단 줄바꿈이 정상적으로 적용되도록 수정 (React Node 보존 방식 적용)
- **스타일 수정**: 인라인 코드(`Code`)에 강제되던 `text-sm` 클래스를 제거하여, 부모 텍스트 크기에 맞춰 자연스럽게 렌더링되도록 변경
- **기능 변경**: 게시글 태그 등록 개수 상한을 20개로 조정

## [1.0.7] - 2025-12-05
### Security
- **보안 패치**: 리액트 서버 컴포넌트 취약점(CVE-2025-55182) 대응 업데이트

## [1.0.6] - 2025-11-24
### Added
- **기능 추가**: 게시글 상세 페이지 하단에 현재 글과 동일한 카테고리의 인접 게시글(이전/다음 각 2개)을 탐색할 수 있는 `MorePosts` 섹션 추가

### Changed
- **UI 개선**: 게시글 목록의 `GridCard` 컴포넌트 구조를 전면 리팩토링하여, 3D 틸트 인터랙션 시 발생하던 테두리 깨짐(Aliasing) 및 레이어 겹침(Anomaly) 현상 해결
- **스타일 수정**: `globals.css`에 누락되었던 스크롤바 관련 CSS 변수(`--scroll-thumb`, `--scroll-track`)를 추가하여 테마(Dark/Light)별 스크롤바 색상 정상화

### Fixed
- **라우팅 오류 수정**: `ResponsiveBreadcrumb` 컴포넌트의 홈 링크가 `/public`으로 잘못 설정되어 발생하던 404 에러 및 RSC 요청 실패 현상 수정
- **코드 정리**: `useViewOnVisible` 훅 내부에 실수로 남아있던 디버깅용 `console.log` 코드 제거

## [1.0.5] - 2025-11-23
### Added
- PWA 지원 및 앱 설치 경험 개선을 위한 웹 앱 매니페스트(`site.webmanifest`) 추가
- 페이지 이동 시 시각적 피드백을 위한 상단 진행바(NextTopLoader) 추가
- 게시글 상세 페이지 진입 시 보여질 스켈레톤 UI(loading.tsx) 추가

### Fixed
- 미들웨어: `site.webmanifest` 및 `/api` 경로 요청 시 404 리다이렉트로 인한 클라이언트 에러 수정
- 폰트: `next/font` 도입으로 CLS(Layout Shift) 최적화 및 커스텀 폰트(Abril Fatface) 굵기 렌더링 오류 수정
- 성능: 개발 모드에서의 CSS 렌더링 차단 리소스 경고 개선

## [1.0.4] - 2025-11-20
### Fixed
- 코멘트 css 수정
- 마크다운 css 수정

## [1.0.3] - 2025-11-20
### Added
- 마크다운 인라인 문법, html 문법 적용되도록 추가
- 이미지를 자세히 볼 수 있는 이미지뷰어 추가
- 코드 디자인 테마를 바꿀 수 있는 CodeThemeChanger 기능 추가

### Fixed
- 마크다운 디자인 일부 수정