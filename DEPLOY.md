# Off-Term Studio 배포 튜토리얼

터미널 없이 브라우저만으로 끝나는 순서입니다. 서비스 화면의 버튼 이름은 자주 바뀌니, 설명과 다르면 비슷한 이름을 찾고 막히면 스크린샷을 보내 주세요.

---

## 0. 돈을 꼭 내야 하나?

| 항목 | 비용 | 카드 등록 | 비고 |
|---|---|---|---|
| Gemini API (Google) | 무료 티어 있음 | 필요 없음 | 무료 티어 입력은 Google 서비스 개선에 쓰일 수 있음. 분당·일일 요청 한도 있음 |
| Claude API (Anthropic) | 선불 충전, 최소 $5 | 필요 (해외결제 되는 카드) | 공식 문서에 무료 크레딧 안내 없음. 일부 지역은 가입 시 체험 크레딧이 뜬다는 제3자 글이 있으나 확인 불가 |
| Netlify | Free 플랜 0원 | 필요 없음 | 월 300크레딧, 다 쓰면 그 달엔 사이트가 멈춤 (6번 참고) |
| GitHub | 0원 | 필요 없음 | |

코드는 **키 하나만 넣으면** 동작합니다.

- `GEMINI_API_KEY`만 넣으면 → Gemini 무료 티어 (`gemini-3.8-flash`)
- `ANTHROPIC_API_KEY`만 넣으면 → Claude (`claude-sonnet-5`)
- 둘 다 넣으면 → Claude 우선. `AI_PROVIDER` = `gemini`를 추가하면 Gemini

어느 쪽 결과가 더 좋은지는 실제로 돌려봐야 압니다. 돈을 안 쓰고 싶으면 Gemini로 시작해서 결과를 보고 판단하세요.

---

## 1. 참가 신청부터 (9/18 마감)

배포보다 먼저 끝내세요. 배포는 신청 후에도 할 수 있지만 신청은 마감이 지나면 끝입니다.

---

## 2-A. Gemini API 키 발급 (무료 경로)

1. Chrome에서 **aistudio.google.com** 접속 → Google 계정으로 로그인
2. 처음이면 약관 동의 창 → 동의
3. 화면 왼쪽 메뉴(또는 상단)의 **Get API key** 클릭
4. **Create API key** 클릭 → Google Cloud 프로젝트를 고르라고 하면 기본 프로젝트를 고르거나 새로 만들기
5. `AIza`로 시작하는 긴 문자열이 키입니다 → **복사** → 맥의 '암호' 앱이나 안전한 메모에 저장
6. (선택) aistudio.google.com/rate-limit 에서 모델별 무료 한도 확인

지역 제한 안내가 뜨거나 키 만들기 버튼이 비활성화되어 있으면 그 화면을 캡처해서 보내 주세요.

---

## 2-B. Claude API 키 발급 ($5 경로)

1. **console.anthropic.com** 접속 (platform.claude.com으로 넘어갈 수 있음) → 이메일 또는 Google로 가입 → 메일로 온 로그인 링크 클릭
2. 이름, 조직 이름 입력 (개인이면 본인 이름)
3. **Settings → Billing** 이동
   - 잔액(Credit balance)이 이미 있으면 결제 없이 5번으로
   - 0이면 **Add payment method** → 해외결제 가능한 Visa/Mastercard 등록 (체크카드도 해외결제가 되면 가능)
   - **Buy credits** → **$5** 입력 → 결제 (세금이 붙어 청구될 수 있음)
   - **Auto-reload(자동 충전)는 켜지 마세요.** 꺼져 있으면 충전한 $5 이상은 절대 빠져나가지 않습니다.
4. **지출 한도 설정** — 같은 Billing 페이지의 **Spend limits → Adjust limit** → `5` 또는 `10` 입력 → 저장
   - 자동 충전을 꺼 두면 이미 최대 손실이 $5로 막혀 있어서, 이건 나중에 자동 충전을 켤 때를 위한 2차 안전장치입니다.
   - 한도에 닿으면 사이트는 "AI 요청이 거부되었습니다"를 띄우고 규칙 기반 결과로 넘어갑니다 (사이트가 죽지는 않음).
5. 왼쪽 메뉴 **API Keys → Create Key** → 이름 `off-term-netlify` → 생성
6. `sk-ant-`로 시작하는 키가 **한 번만** 보입니다 → 바로 복사해서 안전한 곳에 저장

> 참고: 분석 1회(AI 호출 2번)는 30~50원 수준으로 추정합니다. $5면 대략 150회 안팎이지만 추정치이니 Console의 Usage에서 실제 값을 확인하세요.

### 키 보안 (A·B 공통)

- 키를 GitHub, 카톡, 노션, 이 채팅창에 붙여넣지 마세요. 키를 넣는 곳은 Netlify 환경변수 한 곳뿐입니다.
- 유출이 의심되면 발급한 곳(AI Studio 또는 Console)에서 키를 삭제하고 새로 만든 뒤 Netlify 값만 교체하세요.

---

## 3. GitHub에 코드 올리기 (터미널 없이)

1. 받은 `off-term-studio.zip`을 더블클릭해 압축 해제
2. 생긴 `off-term-studio` 폴더를 **열어서** 안에 이것들이 있는지 확인
   `DEPLOY.md` `README.md` `netlify.toml` `netlify` 폴더 `public` 폴더
3. **github.com** 로그인 (계정이 없으면 Sign up)
4. 오른쪽 위 **+ → New repository**
   - Repository name: `off-term-studio`
   - Public / Private 아무거나 (Private도 Netlify 연결 가능)
   - **Add a README file 체크하지 않기**
   - **Create repository**
5. 새 저장소 화면의 "Quick setup" 안내 문장에서 **uploading an existing file** 링크 클릭
6. Finder에서 `off-term-studio` 폴더 **안의 항목 전부**를 선택(⌘A)해서 브라우저의 업로드 영역으로 드래그
   - **폴더 자체를 끌면 안 됩니다.** 한 단계 깊어져서 Netlify가 설정 파일을 못 찾습니다.
   - 폴더 드래그는 **Chrome**에서 하세요.
   - `.gitignore`, `.env.example`은 숨김 파일이라 안 보여도 괜찮습니다.
7. 업로드 목록에 `netlify/functions/api.mjs`, `public/shared/engine.js`처럼 **폴더 경로가 붙은 이름**이 보이는지 확인
8. 아래 **Commit changes** 클릭
9. 저장소 첫 화면 파일 목록 맨 위 수준에 `netlify.toml`이 보이면 성공

---

## 4. Netlify에 연결하고 첫 배포

1. **app.netlify.com** → **Sign up** → **GitHub로 가입** (같은 GitHub 계정)
2. 온보딩 질문(팀 이름, 용도)은 적당히 입력. 플랜은 **Free**
3. **Add new project**(또는 Add new site) → **Import an existing project** → **GitHub** → 권한 창에서 **Authorize**
4. 저장소 목록에 `off-term-studio`가 없으면 → 목록 아래 **Configure Netlify on GitHub** → *Only select repositories*에서 `off-term-studio` 선택 → Save → Netlify 화면으로 돌아와 새로고침
5. `off-term-studio` 선택 → 설정 화면에서 확인
   | 항목 | 값 |
   |---|---|
   | Project name | 원하는 이름 → 주소가 `이름.netlify.app`이 됨 (예: `offterm-studio`) |
   | Branch to deploy | `main` |
   | Base directory | 비움 |
   | Build command | 비움 |
   | Publish directory | `public` |
   | Functions directory | `netlify/functions` |
6. 같은 화면에 **Add environment variables** 버튼이 보이면 **지금** 키를 넣으세요 (첫 배포 전에 넣으면 재배포 비용 15크레딧 절약)
   - Key: `GEMINI_API_KEY` (Claude면 `ANTHROPIC_API_KEY`) — 철자 정확히, 대문자
   - Value: 2번에서 복사한 키
7. **Deploy** 클릭 → 1~2분 뒤 상태가 **Published**가 되면 완료
8. 6번 화면에 키 입력칸이 없었다면:
   1. 프로젝트 화면 → **Project configuration → Environment variables**
   2. **Add a variable → Add a single variable**
   3. Key/Value 입력, "Contains secret values" 옵션이 보이면 체크
   4. **Create variable**
   5. **Deploys** 탭 → **Trigger deploy → Deploy project** (환경변수는 새 배포부터 적용됩니다)

---

## 5. 동작 확인

1. 브라우저 주소창에 `https://<이름>.netlify.app/api/health` 입력
   | 보이는 것 | 뜻 | 조치 |
   |---|---|---|
   | `{"ok":true,"ai":true,"provider":"gemini",...}` | 성공 | 2번으로 |
   | `"ai":false` | 키가 안 들어감 | 변수 이름 철자 확인 → Trigger deploy |
   | Page not found | 함수가 배포 안 됨 | Deploys → 최신 배포 → Deploy log에서 Functions 항목에 `api`가 있는지 확인. 없으면 대개 3-6에서 폴더째 올린 경우 → Project configuration → Build & deploy → **Base directory**를 `off-term-studio`로 설정 후 재배포 |
2. `https://<이름>.netlify.app` 메인 화면 상단 칩이 초록색 **AI PM 연결됨**인지 확인
3. 예시 브리프 3개를 하나씩 **브리프 분석하기** → 결과 화면 캡처해서 보내 주세요
   - 실제 AI 응답은 아직 아무도 확인하지 않았습니다. 여기서 이상한 점이 나오면 프롬프트를 고칩니다.
4. 오류가 나면: 프로젝트 화면 → **Logs & metrics → Functions → api** → `[gemini] 400 ...` 또는 `[anthropic] ...`로 시작하는 줄을 복사해서 보내 주세요 (키 값은 로그에 찍히지 않습니다)

---

## 6. 심사 기간에 사이트가 멈추지 않게

Netlify Free 플랜은 **월 300크레딧, 다 쓰면 그 달 동안 사이트가 멈추고 추가 구매가 안 됩니다.**

| 사용 | 크레딧 |
|---|---|
| 프로덕션 배포 1회 (GitHub에 커밋할 때마다 자동 발생) | 15 |
| 분석 1회의 함수 실행 (1GB × 수십 초, 추정) | 약 0.1~0.2 |
| 방문자 요청 1만 건 | 2 |

- 배포가 가장 비쌉니다. **GitHub에서 파일을 하나씩 고쳐 여러 번 커밋하지 마세요.** 고칠 게 있으면 모아서 한 번에 올리세요.
- 300크레딧 = 배포만 하면 20번입니다. 오늘 첫 배포 1~2회, 수정 배포 2~3회 이내로 계획하세요.
- 제출(9/20) 이후에는 재배포를 자제하세요.
- Gemini 무료 한도를 넘으면 사이트가 "무료 사용량 한도" 안내 후 규칙 기반 결과를 보여줍니다. 돈은 나가지 않습니다.

---

## 7. 일정 체크리스트

- [ ] 9/18까지: 참가 신청
- [ ] 키 발급 (2-A 또는 2-B)
- [ ] GitHub 업로드 (3)
- [ ] Netlify 연결 + 키 + 배포 (4)
- [ ] `/api/health` 확인, 예시 3개 캡처 전송 (5)
- [ ] 9/19: 결과 보고 수정 → 한 번에 재배포
- [ ] 스크린샷 5장(16:9) 촬영
- [ ] 9/20: 제출, 이후 배포 중단
