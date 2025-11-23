# Changelog

## [Unreleased]
- 게시글 퀴즈 추가하기

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