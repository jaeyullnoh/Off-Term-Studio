# 사이트 업데이트 튜토리얼

## 최종본 업데이트 (v2 → 최종)

v2를 이미 배포했다면 빌드 설정은 그대로 두면 됩니다.

1. zip을 풀고, 폴더 **안의 항목 전부**를 GitHub 저장소 **Add file → Upload files**에 끌어다 놓기
2. **Commit changes** 한 번 → Netlify 자동 배포(1~2분, 15크레딧)
3. Deploys 탭에서 **Published** 확인 → 사이트에서 ⌘⇧R
4. 확인할 곳: 첫 화면 아래 "작동 방식 보기", 발주 결과 카드의 초록/보라 안내와 "교내 장비"
5. 새 버전은 저장 공간 이름이 바뀌어서, 예전에 테스트한 데이터 없이 깨끗한 예시 상태로 시작합니다

아래는 v1에서 처음 v2로 넘어갈 때의 전체 과정입니다.

---

이미 `off-term-studio.netlify.app`이 GitHub 저장소와 연결되어 있다는 전제입니다. API 키 환경변수는 그대로 유지되므로 다시 넣을 필요가 없습니다.

v2는 빌드가 필요한 React 프로젝트라 **Netlify 빌드 설정 확인(2단계)** 이 새로 생겼습니다.

---

## 1. zip 풀기

1. `off-term-studio-v2.zip` 더블클릭
2. 생긴 `off-term-studio` 폴더를 열어 이것들이 있는지 확인

   `DEPLOY.md` `README.md` `index.html` `netlify.toml` `package.json` `package-lock.json` `vite.config.js` `netlify` `src` `static`

   (`node_modules`, `dist`는 없어야 정상입니다. Netlify가 만듭니다.)

---

## 2. Netlify 빌드 설정 확인 (코드 올리기 전에)

1. app.netlify.com → `off-term-studio` 프로젝트
2. **Project configuration → Build & deploy → Build settings → Configure**
3. 아래처럼 바꾸고 **Save**
   | 항목 | 값 |
   |---|---|
   | Base directory | 비움 |
   | Build command | `npm run build` |
   | Publish directory | `dist` |
   | Functions directory | `netlify/functions` |

`netlify.toml`에도 같은 값이 있어서 파일이 우선 적용되지만, 화면 설정과 달라서 헷갈리지 않게 맞춰 둡니다. 저장만으로는 배포되지 않습니다.

---

## 3. GitHub에 올리기

### 방법 A. 브라우저로 덮어쓰기 (지난번과 같은 방식, 추천)

1. Chrome에서 github.com → `off-term-studio` 저장소
2. **Add file → Upload files**
3. Finder에서 1단계 폴더 **안의 항목 전부**(⌘A)를 드래그
   - 폴더 자체를 끌면 안 됩니다
   - 목록에 `src/pages/company/NewOrder.jsx`처럼 경로가 붙어 보이면 정상
4. 아래 **Commit changes** 한 번 클릭 → Netlify가 자동으로 빌드·배포 (15크레딧)

예전 버전의 `public` 폴더는 저장소에 남지만 v2 빌드에는 쓰이지 않습니다(확인함). 지우고 싶다면 방법 B를 쓰세요.

### 방법 B. GitHub Desktop (옛 파일까지 깔끔하게)

1. **desktop.github.com** 에서 GitHub Desktop 설치 → 실행 → **Sign in to GitHub.com**
2. **File → Clone repository** → `off-term-studio` 선택 → Local path는 기본값 → **Clone**
3. 메뉴 **Repository → Show in Finder**
4. 열린 폴더의 **보이는 파일·폴더 전부 휴지통으로** (숨김 폴더 `.git`은 Finder에 안 보여서 안전)
5. 1단계 폴더 안의 항목 전부를 이 폴더로 복사
   - 숨김 파일까지 복사하려면 Finder에서 ⌘⇧. (마침표)로 숨김 파일 보이기
6. GitHub Desktop으로 돌아오면 왼쪽에 바뀐 파일 목록이 뜸
7. 왼쪽 아래 Summary에 `v2: 기업/학생 분리` 입력 → **Commit to main**
8. 위쪽 **Push origin** 클릭 → Netlify가 자동 배포

---

## 4. 배포 확인

1. Netlify 프로젝트 → **Deploys** 탭 → 맨 위 배포 클릭
2. 로그에 `npm run build` → `✓ built` → **Published**가 뜨면 성공 (1~2분)
3. 실패(Failed)하면 로그 마지막 30줄을 복사해서 보내 주세요. 실패한 배포는 크레딧이 들지 않고, 이전 사이트가 그대로 떠 있습니다.
4. 브라우저에서 확인
   - `https://off-term-studio.netlify.app/api/health` → `"ai":true`
   - `https://off-term-studio.netlify.app` → 기업/학생 선택 화면
   - 예전 화면이 보이면 **⌘⇧R**(강력 새로고침)

---

## 5. 문제가 생기면 되돌리기

Netlify **Deploys** 탭 → 예전 성공 배포 클릭 → **Publish deploy**.
빌드 없이 바로 예전 사이트로 돌아갑니다.

---

## 6. 크레딧 메모

- 커밋 1번 = 배포 1번 = 15크레딧 (월 300)
- 파일을 하나씩 고쳐 여러 번 커밋하지 말고, 모아서 한 번에
- 9/20 제출 후에는 배포를 멈추세요
