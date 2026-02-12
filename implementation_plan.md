# AI 페르소나 with 감성 이미지 자동생성/관리 앱 개발 계획

## 📌 확정 사항
- **배포**: Vercel
- **저장소**: GitHub만 (MVP)
- **이미지**: 외부 생성 이미지 업로드/관리만 (AI 생성 미포함)
- **인증**: GitHub PAT 입력 방식
- **네이밍**: `NN_캐릭터명_동작.png` (예: `01_zino_coding.png`)
- **추가 기능**: 이미지 리사이징

## 📋 구현 플랜 (Implementation Plan)

### Sprint 1: 인프라 및 UI 뼈대 구축 (Current)

#### 1. Design System & CSS Architecture
- **Goal**: 다크 테마 기반의 글래스모피즘(Glassmorphism) UI 구축
- **Files**:
  - `style.css`: CSS 변수(Color, Spacing, Blur), Reset, Typography, Utility Classes 정의.
  - `src/styles/glass.css`: 글래스모피즘 전용 효과 (Backdrop-filter, Border, Gradient)

#### 2. Layout Structure
- **Goal**: 3단 레이아웃 구현 (Editor | Manager | Preview)
- **Files**:
  - `index.html`: 시멘틱 태그 구조화 (`<header>`, `<main>`, `<aside>`)
  - `src/layout.js`: 동적 레이아웃 렌더링 및 영역 분할 로직

#### 3. Component Architecture (Vanilla JS)
- **Goal**: 컴포넌트 기반와 유사한 모듈화
- **Files**:
  - `src/components/Header.js`: 로고 및 네비게이션
  - `src/components/PersonaList.js`: 페르소나 목록 (Manager 영역)
  - `src/components/Editor.js`: 마크다운 편집기 (Editor 영역)
  - `src/components/Preview.js`: 실시간 미리보기 (Preview 영역)

### Sprint 4: 페르소나 컨버터 및 최종 테스트 (Current)

#### 1. Editor Integration
- **Goal**: 편집 내용의 GitHub 동기화 및 포맷 변환
- **Files**:
  - `src/components/Editor.js`:
    - 'Save to GitHub' 버튼 활성화.
    - `persona/{filename}` 경로로 커밋 (GitHubService 활용).
    - 'Copy as Prompt (TXT)' 버튼 추가 (Markdown -> Plain Text 변환).

#### 2. Persona List Interaction
- **Goal**: 파일 선택 시 데이터 바인딩 로직 강화
- **Files**:
  - `src/main.js`: `persona-loaded` 이벤트 시 현재 선택된 파일명 상태 관리 (저장 대상 식별용).
  - `src/components/PersonaList.js`: 클릭 시 활성 상태(Highlight) 표시.

#### 3. Polishing & Vercel
- **Goal**: 배포 가능한 수준의 마감 처리
- **Actions**:
  - 에러 처리 (API 실패 시 알림).
  - 로딩 인디케이터 적용.
  - Vercel 배포 설정 (`vercel.json` 등 필요 시).

### [NEW] 고급 이미지 엔진 (Sprint 2 확장)

#### 1. UI 옵션 강화
- **비율 선택**: `Original`, `1:1 Square (Center Crop)`
- **해상도 선택**: `256px`, `512px`
- **일괄 관리**: `Upload All`, `Clear List` 버튼 추가

#### 2. 리사이징 엔진 고도화
- `processImage` 함수 수정:
  - 선택된 비율에 따른 캔버스 크기 계산 및 크로핑 로직.
  - 선택된 타겟 해상도로 최종 출력 조절.

#### 3. 일괄 업로드 프로세스
- 현재 이미지 그리드의 모든 유효한(`VALID`) 항목을 순차적으로 GitHub API로 전송.
- 개별 상태 표시 및 전체 진행률 바(선택 사항) 제공.

## Verification Plan

### Manual Verification
- **Ratio Test**: 1:1 선택 후 가로가 긴 이미지를 드롭하여 중앙 크롭 확인.
- **Resolution Test**: 256px 선택 후 업로드된 파일 크기 및 정보 확인.
- **Bulk Flow**: 5개 이상의 이미지를 한꺼번에 드롭 -> Target ID 일괄 적용 -> Upload All 클릭 -> GitHub 저장소에 모두 올라갔는지 확인.
