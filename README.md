# Off-Term Studio v2

방학마다 비는 대학의 장비와 학생 인력을 기업 외주에 연결하는 캠퍼스 인하우스 프로덕션 데모.

## 화면

| 경로 | 누구 | 내용 |
|---|---|---|
| `/` | 모두 | 기업 / 학생 선택 |
| `/company` | 기업 | 내 발주 목록 |
| `/company/new` | 기업 | 브리프 → AI 분해 → AI 팀 구성 → 조정 → 발주 |
| `/company/orders/:id` | 기업 | 컨펌 교수 · 퇴직 전문가 멘토 · 학생 팀 · 지원자 · 진행 단계 |
| `/student` | 학생 | 모집 중인 과제 (프로필 있으면 적합도순) |
| `/student/projects/:id` | 학생 | 역할별 예상 페이 · 지원 |
| `/student/profile` | 학생 | 이력서(PDF/TXT) → AI가 프로필 작성 → 기업 발주 매칭 후보로 등록 |
| `/student/applications` | 학생 | 지원 현황 (검토 중 / 팀 합류 / 마감) |

주소는 `/#/company`처럼 `#`이 붙습니다. 서버 설정 없이 새로고침해도 페이지가 유지되게 하려는 선택입니다.

## 구조

```
index.html                 Vite 진입점
src/
  main.jsx                 라우팅
  styles.css               디자인 토큰 · 다크모드
  lib/engine.js            역할·가상 크루/교수/멘토·점수·견적·예산 보정·규칙 폴백 (함수와 공유)
  lib/store.jsx            브라우저 저장소(localStorage) 상태
  lib/seed.js              예시 과제
  lib/api.js               API 호출
  components/ui.jsx        헤더 · 공통 UI
  pages/Landing.jsx
  pages/company/*.jsx
  pages/student/*.jsx
netlify/functions/api.mjs  /api/health · /api/analyze · /api/match · /api/resume
static/                    그대로 복사되는 정적 파일 (favicon)
```

- 기술: React 19 + Vite 8 + React Router 7, 아이콘 lucide-react, 글꼴 Pretendard
- 데이터: 방문자 브라우저에만 저장. 심사위원마다 자기만의 데모 공간을 봅니다.
- 인물: 학생·교수·퇴직 멘토·발주사 모두 가상. 학과명만 상명대 서울캠퍼스 편제를 따릅니다.

## AI가 하는 일 / 코드가 하는 일

| 단계 | AI | 코드 |
|---|---|---|
| 발주 분석 | 역할·인원·공수·수주 판단(수락/조건부/거절) | 형식 검증, 예산 상한 보정 |
| 팀 구성 | 후보 중 선택 + 이유 | 후보 선별(점수), 잘못된 선택 제거, 내부 ID 제거 |
| 이력서 | 전공·스킬·강점 추출(개인정보 제외) | 허용된 스킬만 통과, 사용자가 확인 후 저장 |
| 교수·멘토 | — | 주력 역할 기준 배정 |

## 환경변수 (Netlify)

`ANTHROPIC_API_KEY` 또는 `GEMINI_API_KEY` 중 하나. 선택: `AI_PROVIDER`, `AI_MODEL`.
Gemini 설정에서는 PDF 이력서를 읽지 못하므로 텍스트 붙여넣기를 안내합니다.

## 로컬 실행

```bash
npm install
npm run dev        # AI 없이 규칙 모드로 화면 확인
npx netlify-cli dev   # AI 포함 (.env에 키)
```

업데이트·배포 방법은 [DEPLOY.md](DEPLOY.md).
