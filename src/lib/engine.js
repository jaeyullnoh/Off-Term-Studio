/*
 * Off-Term Studio — shared engine (브라우저와 Netlify 함수가 같은 파일을 씀)
 * 역할·장비·가상 크루·가상 교수/퇴직 멘토 데이터, 적합도 점수, 견적, 예산 보정, 규칙 기반 폴백
 * 인물은 모두 가상입니다.
 */

export const PRICING = { payShare: 0.6, directCostShare: 0.1, marginShare: 0.3, roundTo: 10000 };

export const ROLES = [
  { id: "pm", label: "기획·PM", short: "PM", rate: 17000, majors: ["경영학부", "융합경영학과", "글로벌경영학과", "행정학부"],
    skills: ["일정관리", "클라이언트커뮤니케이션", "견적", "리서치", "노션", "설문조사"], deliverable: "일정·소통·납품 관리" },
  { id: "rights", label: "권리 검토", short: "권리", rate: 16000, majors: ["지적재산권전공"],
    skills: ["저작권검토", "라이선스대장", "계약서검토", "상표조사"], deliverable: "소재 라이선스 대장" },
  { id: "brand", label: "브랜딩·디자인", short: "디자인", rate: 17000, majors: ["생활예술전공", "조형예술전공", "애니메이션전공"],
    skills: ["로고", "브랜드가이드", "패키지디자인", "편집디자인", "포스터", "SNS콘텐츠", "타이포그래피", "Figma"], deliverable: "로고·인쇄·SNS 디자인" },
  { id: "illust", label: "일러스트·캐릭터", short: "일러스트", rate: 16000, majors: ["애니메이션전공", "조형예술전공"],
    skills: ["캐릭터", "일러스트", "이모티콘", "웹툰", "컨셉아트", "SNS콘텐츠"], deliverable: "캐릭터·일러스트" },
  { id: "motion", label: "영상·모션", short: "영상", rate: 18000, majors: ["애니메이션전공"],
    skills: ["모션그래픽", "2D애니메이션", "3D애니메이션", "영상편집", "촬영", "스토리보드", "사운드디자인"], deliverable: "영상·모션그래픽" },
  { id: "web", label: "웹 개발", short: "웹", rate: 18000, majors: ["컴퓨터과학전공", "휴먼AI공학전공"],
    skills: ["React", "반응형웹", "랜딩페이지", "Figma", "UI디자인"], deliverable: "반응형 웹페이지" },
  { id: "app", label: "앱·백엔드", short: "앱", rate: 19000, majors: ["컴퓨터과학전공", "지능IOT융합전공", "핀테크전공"],
    skills: ["앱개발", "Flutter", "백엔드", "Node.js", "데이터베이스", "API연동"], deliverable: "앱·서버" },
  { id: "game", label: "게임 개발", short: "게임", rate: 18000, majors: ["게임전공"],
    skills: ["Unity", "Unreal", "게임기획", "레벨디자인", "게임UI", "3D모델링"], deliverable: "게임 빌드" },
  { id: "model3d", label: "3D·프린팅", short: "3D", rate: 18000, majors: ["게임전공", "애니메이션전공", "스마트생산전공"],
    skills: ["Blender", "3D모델링", "3D프린팅", "제품목업", "렌더링", "3D애니메이션"], deliverable: "3D 모델·렌더" },
  { id: "sound", label: "사운드·음악", short: "사운드", rate: 17000, majors: ["음악학부"],
    skills: ["작곡", "사운드디자인", "효과음", "믹싱", "녹음", "영상편집"], deliverable: "BGM·효과음" },
  { id: "copy", label: "카피·콘텐츠", short: "카피", rate: 15000, majors: ["역사콘텐츠전공", "한일문화콘텐츠전공", "문헌정보학전공", "국어교육과"],
    skills: ["카피라이팅", "네이밍", "상세페이지", "스토리텔링", "블로그콘텐츠", "일본어번역", "리서치"], deliverable: "카피·원고" },
  { id: "data", label: "데이터·리서치", short: "데이터", rate: 17000, majors: ["빅데이터융합전공", "경제금융학부", "경영학부"],
    skills: ["데이터분석", "설문조사", "Python", "대시보드"], deliverable: "조사·분석 리포트" },
  { id: "fashion", label: "패션·의상", short: "패션", rate: 17000, majors: ["의류학과"],
    skills: ["패턴CAD", "봉제", "룩북스타일링", "의상제작"], deliverable: "의상·패턴" },
  { id: "space", label: "공간·팝업", short: "공간", rate: 17000, majors: ["공간환경학부", "생활예술전공"],
    skills: ["공간디자인", "전시기획", "SketchUp", "팝업스토어"], deliverable: "공간 설계·설치 가이드" },
];
export const ROLE_MAP = Object.fromEntries(ROLES.map((r) => [r.id, r]));
export const isSupportRole = (id) => id === "pm" || id === "rights";

export const EQUIPMENT = [
  { id: "workstation", label: "워크스테이션·렌더팜", roles: ["motion", "model3d", "game"] },
  { id: "tablet", label: "액정 타블렛", roles: ["illust", "brand"] },
  { id: "booth", label: "방음 녹음 부스", roles: ["sound"] },
  { id: "printer3d", label: "3D 프린터", roles: ["model3d"] },
  { id: "mocap", label: "모션캡처 스튜디오", roles: [] },
  { id: "patterncad", label: "패턴CAD", roles: ["fashion"] },
  { id: "camera", label: "촬영 장비", roles: ["motion"] },
];
export const EQUIPMENT_MAP = Object.fromEntries(EQUIPMENT.map((e) => [e.id, e]));

// 과제 컨펌 교수 (가상 인물 · 학과명은 상명대 서울캠퍼스 편제)
export const PROFESSORS = [
  { id: "PF1", name: "한지원", major: "애니메이션전공", roles: ["motion", "illust"] },
  { id: "PF2", name: "류민석", major: "게임전공", roles: ["game", "model3d"] },
  { id: "PF3", name: "서정훈", major: "컴퓨터과학전공", roles: ["web", "app"] },
  { id: "PF4", name: "윤서경", major: "생활예술전공", roles: ["brand"] },
  { id: "PF5", name: "백승우", major: "음악학부", roles: ["sound"] },
  { id: "PF6", name: "남궁혜린", major: "의류학과", roles: ["fashion"] },
  { id: "PF7", name: "임태현", major: "공간환경학부", roles: ["space"] },
  { id: "PF8", name: "조은비", major: "빅데이터융합전공", roles: ["data"] },
  { id: "PF9", name: "정하윤", major: "역사콘텐츠전공", roles: ["copy"] },
  { id: "PF10", name: "김다온", major: "지적재산권전공", roles: ["rights"] },
];
// 제작 자문 퇴직 전문가 (가상 인물)
export const MENTORS = [
  { id: "MT1", name: "장경수", career: "前 광고대행사 크리에이티브 디렉터", years: 28, roles: ["brand", "copy", "illust"] },
  { id: "MT2", name: "박영란", career: "前 방송사 영상 PD", years: 25, roles: ["motion", "sound"] },
  { id: "MT3", name: "이재형", career: "前 게임사 개발 PD", years: 22, roles: ["game", "model3d"] },
  { id: "MT4", name: "최성민", career: "前 IT기업 개발팀장", years: 24, roles: ["web", "app", "data"] },
  { id: "MT5", name: "권미숙", career: "前 패션 브랜드 디자인실장", years: 26, roles: ["fashion", "space"] },
];

// 가상 크루 (데모용 · 실존 인물 아님) rate: 시급 · weeklyHours: 방학 중 주당 가능 시간
export const STUDENTS = [
    {id: "C01", name: "정도윤", major: "경영학부", year: 2, skills: ["노션", "클라이언트커뮤니케이션", "견적"], portfolio: false, projects: 0, rating: null, rate: 15000, weeklyHours: 20},
    {id: "C02", name: "한태오", major: "글로벌경영학과", year: 3, skills: ["견적", "클라이언트커뮤니케이션", "리서치", "설문조사"], portfolio: true, projects: 1, rating: 4.2, rate: 17000, weeklyHours: 30},
    {id: "C03", name: "노우진", major: "경영학부", year: 4, skills: ["노션", "일정관리", "견적"], portfolio: true, projects: 2, rating: 4.2, rate: 18500, weeklyHours: 12},
    {id: "C04", name: "차재희", major: "글로벌경영학과", year: 3, skills: ["클라이언트커뮤니케이션", "리서치", "노션", "견적"], portfolio: true, projects: 1, rating: 4.3, rate: 17000, weeklyHours: 20},
    {id: "C05", name: "배채린", major: "행정학부", year: 4, skills: ["견적", "클라이언트커뮤니케이션", "리서치", "설문조사"], portfolio: true, projects: 3, rating: 4.5, rate: 19000, weeklyHours: 15},
    {id: "C06", name: "홍하율", major: "지적재산권전공", year: 3, skills: ["저작권검토", "라이선스대장", "상표조사"], portfolio: true, projects: 1, rating: 4.7, rate: 17000, weeklyHours: 20},
    {id: "C07", name: "권유나", major: "지적재산권전공", year: 2, skills: ["저작권검토", "라이선스대장", "상표조사"], portfolio: true, projects: 0, rating: null, rate: 15000, weeklyHours: 30},
    {id: "C08", name: "우가온", major: "지적재산권전공", year: 3, skills: ["라이선스대장", "계약서검토", "상표조사", "저작권검토"], portfolio: true, projects: 4, rating: 4.7, rate: 19000, weeklyHours: 20},
    {id: "C09", name: "박지호", major: "지적재산권전공", year: 4, skills: ["계약서검토", "저작권검토"], portfolio: true, projects: 1, rating: 4.4, rate: 18000, weeklyHours: 25},
    {id: "C10", name: "손서하", major: "조형예술전공", year: 3, skills: ["타이포그래피", "브랜드가이드", "포스터", "로고"], portfolio: true, projects: 4, rating: 4.2, rate: 19000, weeklyHours: 12},
    {id: "C11", name: "신새봄", major: "애니메이션전공", year: 3, skills: ["브랜드가이드", "패키지디자인", "로고", "SNS콘텐츠"], portfolio: true, projects: 1, rating: 4.2, rate: 17000, weeklyHours: 12},
    {id: "C12", name: "유예린", major: "애니메이션전공", year: 3, skills: ["로고", "편집디자인", "타이포그래피", "Figma"], portfolio: true, projects: 3, rating: 4.2, rate: 18000, weeklyHours: 20},
    {id: "C13", name: "오태린", major: "조형예술전공", year: 3, skills: ["패키지디자인", "타이포그래피", "포스터", "SNS콘텐츠"], portfolio: false, projects: 0, rating: null, rate: 16000, weeklyHours: 25},
    {id: "C14", name: "구현우", major: "생활예술전공", year: 4, skills: ["SNS콘텐츠", "타이포그래피", "포스터", "패키지디자인"], portfolio: false, projects: 0, rating: null, rate: 17000, weeklyHours: 30},
    {id: "C15", name: "하다온", major: "애니메이션전공", year: 2, skills: ["이모티콘", "캐릭터", "컨셉아트", "SNS콘텐츠"], portfolio: true, projects: 0, rating: null, rate: 15000, weeklyHours: 12},
    {id: "C16", name: "김이준", major: "애니메이션전공", year: 2, skills: ["캐릭터", "일러스트", "웹툰"], portfolio: true, projects: 1, rating: 4.4, rate: 16000, weeklyHours: 15},
    {id: "C17", name: "안민재", major: "애니메이션전공", year: 3, skills: ["이모티콘", "컨셉아트", "SNS콘텐츠"], portfolio: true, projects: 4, rating: 4.3, rate: 19000, weeklyHours: 12},
    {id: "C18", name: "황로운", major: "조형예술전공", year: 2, skills: ["이모티콘", "컨셉아트", "캐릭터", "일러스트"], portfolio: true, projects: 0, rating: null, rate: 15000, weeklyHours: 15},
    {id: "C19", name: "심서진", major: "애니메이션전공", year: 2, skills: ["모션그래픽", "2D애니메이션", "3D애니메이션"], portfolio: true, projects: 1, rating: 4.4, rate: 17000, weeklyHours: 15},
    {id: "C20", name: "주도현", major: "애니메이션전공", year: 3, skills: ["3D애니메이션", "영상편집", "스토리보드", "사운드디자인"], portfolio: true, projects: 1, rating: 4.7, rate: 18000, weeklyHours: 25},
    {id: "C21", name: "황하린", major: "애니메이션전공", year: 3, skills: ["영상편집", "촬영", "스토리보드", "사운드디자인"], portfolio: true, projects: 4, rating: 4.5, rate: 20000, weeklyHours: 15},
    {id: "C22", name: "하무진", major: "애니메이션전공", year: 3, skills: ["스토리보드", "촬영", "2D애니메이션"], portfolio: true, projects: 0, rating: null, rate: 17000, weeklyHours: 25},
    {id: "C23", name: "오윤슬", major: "애니메이션전공", year: 2, skills: ["스토리보드", "3D애니메이션", "촬영", "모션그래픽", "사운드디자인"], portfolio: false, projects: 0, rating: null, rate: 16000, weeklyHours: 20},
    {id: "C24", name: "하초아", major: "컴퓨터과학전공", year: 3, skills: ["랜딩페이지", "Figma", "반응형웹"], portfolio: true, projects: 1, rating: 4.4, rate: 18000, weeklyHours: 30},
    {id: "C25", name: "문지안", major: "컴퓨터과학전공", year: 3, skills: ["랜딩페이지", "UI디자인", "React", "반응형웹"], portfolio: true, projects: 0, rating: null, rate: 17000, weeklyHours: 20},
    {id: "C26", name: "임수아", major: "휴먼AI공학전공", year: 3, skills: ["React", "Figma", "랜딩페이지", "UI디자인"], portfolio: true, projects: 3, rating: 4.4, rate: 19000, weeklyHours: 12},
    {id: "C27", name: "황지성", major: "휴먼AI공학전공", year: 2, skills: ["랜딩페이지", "UI디자인", "Figma"], portfolio: true, projects: 1, rating: 4.3, rate: 17000, weeklyHours: 12},
    {id: "C28", name: "손한결", major: "컴퓨터과학전공", year: 2, skills: ["UI디자인", "React"], portfolio: true, projects: 0, rating: null, rate: 16000, weeklyHours: 20},
    {id: "C29", name: "심수빈", major: "핀테크전공", year: 4, skills: ["백엔드", "API연동", "Flutter"], portfolio: true, projects: 0, rating: null, rate: 18000, weeklyHours: 30},
    {id: "C30", name: "최민규", major: "핀테크전공", year: 3, skills: ["데이터베이스", "앱개발", "Flutter"], portfolio: false, projects: 0, rating: null, rate: 17000, weeklyHours: 12},
    {id: "C31", name: "전건우", major: "지능IOT융합전공", year: 4, skills: ["앱개발", "백엔드"], portfolio: true, projects: 3, rating: 4.7, rate: 20000, weeklyHours: 25},
    {id: "C32", name: "임규리", major: "게임전공", year: 4, skills: ["Unreal", "Unity", "레벨디자인"], portfolio: true, projects: 2, rating: 4.5, rate: 19500, weeklyHours: 20},
    {id: "C33", name: "황세아", major: "게임전공", year: 4, skills: ["게임UI", "게임기획", "Unity", "레벨디자인"], portfolio: true, projects: 3, rating: 4.7, rate: 20000, weeklyHours: 15},
    {id: "C34", name: "최소율", major: "게임전공", year: 4, skills: ["레벨디자인", "Unreal", "게임UI", "게임기획"], portfolio: true, projects: 1, rating: 4.2, rate: 19000, weeklyHours: 12},
    {id: "C35", name: "백예준", major: "게임전공", year: 2, skills: ["게임기획", "레벨디자인", "게임UI"], portfolio: false, projects: 0, rating: null, rate: 16000, weeklyHours: 12},
    {id: "C36", name: "송보민", major: "애니메이션전공", year: 2, skills: ["Blender", "3D프린팅"], portfolio: true, projects: 1, rating: 4.3, rate: 16000, weeklyHours: 20},
    {id: "C37", name: "손주원", major: "애니메이션전공", year: 3, skills: ["렌더링", "3D모델링", "Blender", "제품목업", "3D애니메이션"], portfolio: true, projects: 2, rating: 4.4, rate: 17500, weeklyHours: 15},
    {id: "C38", name: "송은호", major: "스마트생산전공", year: 3, skills: ["렌더링", "제품목업", "3D모델링", "Blender", "3D애니메이션"], portfolio: true, projects: 1, rating: 4.8, rate: 17000, weeklyHours: 25},
    {id: "C39", name: "서하람", major: "음악학부", year: 2, skills: ["녹음", "사운드디자인", "믹싱", "영상편집"], portfolio: false, projects: 0, rating: null, rate: 15000, weeklyHours: 20},
    {id: "C40", name: "변승호", major: "음악학부", year: 3, skills: ["작곡", "효과음", "믹싱"], portfolio: true, projects: 4, rating: 4.3, rate: 19000, weeklyHours: 12},
    {id: "C41", name: "구이안", major: "음악학부", year: 2, skills: ["효과음", "작곡"], portfolio: true, projects: 1, rating: 4.6, rate: 16000, weeklyHours: 20},
    {id: "C42", name: "송나연", major: "음악학부", year: 4, skills: ["믹싱", "효과음", "작곡", "녹음", "영상편집"], portfolio: true, projects: 1, rating: 4.8, rate: 18000, weeklyHours: 12},
    {id: "C43", name: "안재원", major: "역사콘텐츠전공", year: 2, skills: ["카피라이팅", "네이밍", "스토리텔링", "리서치"], portfolio: true, projects: 1, rating: 4.8, rate: 16000, weeklyHours: 20},
    {id: "C44", name: "전시은", major: "문헌정보학전공", year: 2, skills: ["카피라이팅", "상세페이지", "스토리텔링"], portfolio: true, projects: 1, rating: 4.8, rate: 16000, weeklyHours: 25},
    {id: "C45", name: "강연우", major: "국어교육과", year: 4, skills: ["스토리텔링", "상세페이지", "리서치"], portfolio: true, projects: 0, rating: null, rate: 17000, weeklyHours: 30},
    {id: "C46", name: "서채원", major: "역사콘텐츠전공", year: 4, skills: ["일본어번역", "블로그콘텐츠", "카피라이팅"], portfolio: false, projects: 0, rating: null, rate: 17000, weeklyHours: 15},
    {id: "C47", name: "서시우", major: "빅데이터융합전공", year: 2, skills: ["데이터분석", "설문조사", "Python"], portfolio: true, projects: 1, rating: 4.7, rate: 16000, weeklyHours: 25},
    {id: "C48", name: "김준서", major: "빅데이터융합전공", year: 3, skills: ["대시보드", "데이터분석", "Python"], portfolio: true, projects: 3, rating: 4.5, rate: 18000, weeklyHours: 30},
    {id: "C49", name: "장서윤", major: "의류학과", year: 2, skills: ["봉제", "의상제작", "패턴CAD"], portfolio: false, projects: 0, rating: null, rate: 15000, weeklyHours: 25},
    {id: "C50", name: "성라희", major: "의류학과", year: 4, skills: ["봉제", "룩북스타일링", "패턴CAD"], portfolio: true, projects: 1, rating: 4.4, rate: 18000, weeklyHours: 25},
    {id: "C51", name: "조윤재", major: "생활예술전공", year: 3, skills: ["공간디자인", "전시기획", "SketchUp"], portfolio: false, projects: 0, rating: null, rate: 16000, weeklyHours: 20},
    {id: "C52", name: "박다은", major: "공간환경학부", year: 4, skills: ["전시기획", "공간디자인", "SketchUp"], portfolio: true, projects: 0, rating: null, rate: 17000, weeklyHours: 30}
];

export const MAJORS = [...new Set(ROLES.flatMap((r) => r.majors).concat(STUDENTS.map((s) => s.major)))].sort();
export const SKILLS = [...new Set(ROLES.flatMap((r) => r.skills))];

// ─── 유틸 ─────────────────────────────────────────────────────────────
const clamp = (n, lo, hi) => { n = Number(n); if (!Number.isFinite(n)) n = lo; return Math.max(lo, Math.min(hi, Math.round(n))); };
const uniq = (arr) => [...new Set(arr)];
const roundUp = (n, unit) => Math.ceil(n / unit) * unit;
export const cut = (str, len) => (str.length > len ? str.slice(0, len - 1).replace(/\s+\S*$/, "") + "…" : str);
export const won = (n) => Math.round(n).toLocaleString("ko-KR") + "원";
export const man = (n) => (Math.round(n / 1000) / 10).toLocaleString("ko-KR") + "만 원";

// ─── 내 프로필(학생 본인)을 포함한 크루 풀 ─────────────────────────────
export function sanitizeProfile(raw) {
  if (!raw || typeof raw !== "object") return null;
  const year = clamp(raw.year || 3, 1, 5);
  const skills = uniq((Array.isArray(raw.skills) ? raw.skills : []).map(String).filter((t) => SKILLS.includes(t))).slice(0, 12);
  const name = String(raw.name || "").trim().slice(0, 20);
  if (!name) return null;
  return {
    id: "ME",
    name,
    major: MAJORS.includes(raw.major) ? raw.major : "기타",
    year,
    skills,
    portfolio: Boolean(raw.portfolio),
    projects: 0,
    rating: null,
    rate: clamp(raw.rate || 13000 + year * 1000, 10000, 30000),
    weeklyHours: clamp(raw.weeklyHours || 20, 5, 40),
    summary: cut(String(raw.summary || "").trim(), 80),
    highlights: (Array.isArray(raw.highlights) ? raw.highlights : []).map((x) => cut(String(x).trim(), 60)).filter(Boolean).slice(0, 3),
  };
}
export function buildPool(profile) {
  const me = sanitizeProfile(profile);
  const list = me ? STUDENTS.concat([me]) : STUDENTS;
  return { list, map: Object.fromEntries(list.map((s) => [s.id, s])) };
}
export const DEFAULT_POOL = buildPool(null);

// ─── 적합도 점수 (설명 가능한 규칙) ───────────────────────────────────
export function scoreStudent(s, role, ctx = {}) {
  const def = ROLE_MAP[role.roleId];
  if (!def || !s) return null;
  const wanted = role.skills && role.skills.length ? role.skills : def.skills;
  const matched = wanted.filter((t) => s.skills.includes(t));
  const pool = s.skills.filter((t) => def.skills.includes(t));
  const majorFit = def.majors.includes(s.major);
  const weeks = Math.max(1, Number(ctx.weeks) || 4);
  const capacity = s.weeklyHours * weeks;
  const fits = capacity >= (Number(role.hours) || 0);
  const busy = Boolean(ctx.busy && ctx.busy.includes(s.id));
  const parts = {
    major: majorFit ? 30 : 0,
    skills: Math.min(matched.length, 4) * 12 + Math.min(pool.length, 4) * 4,
    portfolio: s.portfolio ? 8 : 0,
    rating: s.rating ? Math.round((s.rating - 4) * 20) : 4,
    capacity: fits ? 10 : -15,
    busy: busy ? -25 : 0,
  };
  const score = Object.values(parts).reduce((a, b) => a + b, 0);
  return { id: s.id, score, parts, majorFit, matched, pool, wanted, capacity, fits, busy, eligible: majorFit || pool.length >= 2 };
}
// 0~100 적합도 (학생 화면용)
export const matchPercent = (sc) => (sc ? Math.max(0, Math.min(99, Math.round(((sc.score + 10) / 120) * 100))) : 0);

export function rankCandidates(role, ctx, limit = 8, pool = DEFAULT_POOL) {
  return pool.list.map((s) => scoreStudent(s, role, ctx)).filter((r) => r && r.eligible)
    .sort((a, b) => b.score - a.score || pool.map[a.id].rate - pool.map[b.id].rate)
    .slice(0, limit);
}

export function ruleReason(sc, pool = DEFAULT_POOL) {
  const s = pool.map[sc.id];
  const bits = [];
  if (sc.majorFit) bits.push(s.major);
  if (sc.matched.length) bits.push(sc.matched.slice(0, 2).join("·"));
  else if (sc.pool.length) bits.push(sc.pool.slice(0, 2).join("·"));
  bits.push(s.rating ? `평점 ${s.rating}` : "신규");
  if (!sc.fits) bits.push("시간 부족");
  if (sc.busy) bits.push("진행 중 과제 있음");
  return bits.join(" · ");
}

// ─── 견적 ─────────────────────────────────────────────────────────────
export function quote(roles, pool = DEFAULT_POOL) {
  const lines = roles.map((r) => {
    const def = ROLE_MAP[r.roleId] || { rate: 16000, label: r.roleId };
    const people = [];
    for (let i = 0; i < r.count; i++) {
      const st = r.assigned && r.assigned[i] && pool.map[r.assigned[i].id];
      const rate = st ? st.rate : def.rate;
      people.push({ id: st ? st.id : null, name: st ? st.name : "미배정", rate, subtotal: rate * r.hours });
    }
    return { key: r.key, roleId: r.roleId, label: def.label, count: r.count, hours: r.hours, people, subtotal: people.reduce((n, p) => n + p.subtotal, 0) };
  });
  const pay = lines.reduce((n, l) => n + l.subtotal, 0);
  const contract = pay > 0 ? roundUp(pay / PRICING.payShare, PRICING.roundTo) : 0;
  const direct = Math.round(contract * PRICING.directCostShare);
  return { lines, pay, contract, direct, margin: contract - pay - direct, hours: lines.reduce((n, l) => n + l.count * l.hours, 0), people: lines.reduce((n, l) => n + l.count, 0) };
}

// ─── AI 응답·입력 정규화 ──────────────────────────────────────────────
export function normalizeBreakdown(raw) {
  raw = raw || {};
  const seen = {};
  let roles = (Array.isArray(raw.roles) ? raw.roles : []).map((r) => {
    const id = String(r.role_id || r.roleId || "").trim();
    const def = ROLE_MAP[id];
    if (!def || seen[id]) return null;
    seen[id] = 1;
    return {
      roleId: id,
      count: clamp(r.count, 1, isSupportRole(id) ? 1 : 3),
      hours: clamp(r.hours_per_person != null ? r.hours_per_person : r.hours, 2, 160),
      focus: cut(String(r.focus || def.deliverable), 60),
      skills: uniq((Array.isArray(r.skills) ? r.skills : []).map(String).filter((t) => def.skills.includes(t))).slice(0, 4),
    };
  }).filter(Boolean);
  const decision = ["accept", "conditional", "decline"].includes(raw.decision) ? raw.decision : "accept";
  const production = roles.filter((r) => !isSupportRole(r.roleId));
  if (decision === "decline") roles = [];
  else if (!production.length) return null;
  if (decision !== "decline" && !seen.pm) roles.unshift({ roleId: "pm", count: 1, hours: 12, focus: "일정·소통·납품 관리", skills: [] });
  if (decision !== "decline" && !seen.rights) roles.push({ roleId: "rights", count: 1, hours: 6, focus: "소재 라이선스 대장", skills: [] });
  const w = (id) => (id === "pm" ? -1 : id === "rights" ? 99 : 0);
  roles.sort((a, b) => w(a.roleId) - w(b.roleId));
  const strList = (v, n, len) => (Array.isArray(v) ? v : []).map((x) => cut(String(x).trim(), len)).filter(Boolean).slice(0, n);
  return {
    decision,
    decisionReason: cut(String(raw.decision_reason || raw.decisionReason || "").trim(), 200),
    title: cut(String(raw.title || "제작 프로젝트").trim(), 40),
    summary: cut(String(raw.summary || "").trim(), 160),
    weeks: clamp(raw.duration_weeks != null ? raw.duration_weeks : raw.weeks, 1, 12),
    deliverables: strList(raw.deliverables, 6, 60),
    equipment: uniq((Array.isArray(raw.equipment) ? raw.equipment : []).map(String).filter((e) => EQUIPMENT_MAP[e])),
    risks: strList(raw.risks, 3, 200),
    questions: strList(raw.questions_for_client || raw.questions, 3, 160),
    roles: roles.map((r, i) => ({ ...r, key: "r" + (i + 1) })),
  };
}

// ─── 예산 상한 보정 ───────────────────────────────────────────────────
export const BUDGETS = [
  { id: "", label: "미정" }, { id: "under100", label: "100만 원 이하" }, { id: "100-200", label: "100~200만 원" },
  { id: "200-300", label: "200~300만 원" }, { id: "300-500", label: "300~500만 원" }, { id: "over500", label: "500만 원 이상" },
];
const BUDGET_CAP = { under100: 100, "100-200": 200, "200-300": 300, "300-500": 500 };
export function fitBudget(project, budgetKey, pool = DEFAULT_POOL) {
  const capMan = BUDGET_CAP[budgetKey || ""];
  if (!project || !capMan || !project.roles.length) return project;
  const capPay = capMan * 10000 * PRICING.payShare;
  const estRate = (role) => {
    const top = rankCandidates(role, { weeks: project.weeks }, 3, pool);
    return top.length ? top.reduce((n, c) => n + pool.map[c.id].rate, 0) / top.length : ROLE_MAP[role.roleId].rate;
  };
  const est = project.roles.reduce((n, r) => n + r.count * r.hours * estRate(r), 0);
  if (est <= capPay) { project.budgetFit = { status: "ok", cap: capMan }; return project; }
  const before = roundUp(est / PRICING.payShare, PRICING.roundTo) / 10000;
  const factor = (capPay * 0.95) / est;
  if (factor >= 0.6) {
    project.roles.forEach((r) => { r.hours = Math.max(2, Math.floor(r.hours * factor)); });
    const pct = Math.round((1 - factor) * 100);
    project.budgetFit = { status: "scaled", cap: capMan, percent: pct, before, note: `AI 제안 ${before}만 원 → 예산 ${capMan}만 원에 맞춰 공수 ${pct}% 줄임` };
  } else {
    project.budgetFit = { status: "over", cap: capMan, before, note: `AI 제안 ${before}만 원 · 예산 ${capMan}만 원을 크게 넘어 범위 조정 필요` };
  }
  return project;
}

// ─── 규칙 기반 폴백 ───────────────────────────────────────────────────
const KEYWORDS = [
  ["brand", /브랜드|브랜딩|로고|BI|CI|패키지|포스터|리플렛|전단|명함|굿즈|인쇄|SNS\s?(피드|카드)|카드뉴스|현수막|피치덱|IR/i],
  ["illust", /일러스트|캐릭터|이모티콘|웹툰|삽화|마스코트|굿즈/i],
  ["motion", /영상|모션|애니메이션|숏폼|릴스|쇼츠|유튜브|트레일러|티저|촬영/i],
  ["web", /웹|홈페이지|랜딩|사이트|반응형|프론트/i],
  ["app", /앱|어플|서버|백엔드|API|예약\s?시스템|관리자\s?페이지|DB/i],
  ["game", /게임\s?(개발|제작|기획)|유니티|Unity|언리얼|Unreal|레벨\s?디자인|미니\s?게임/i],
  ["model3d", /3D|목업|모델링|렌더|프린팅|시제품|피규어/i],
  ["sound", /사운드|음악|BGM|효과음|징글|녹음|성우|오디오|로고송/i],
  ["copy", /카피|문구|네이밍|상세\s?페이지|슬로건|원고|스토리|블로그|번역|일본어/i],
  ["data", /데이터|설문|시장\s?조사|사용자\s?조사|고객\s?조사|분석|리서치|대시보드|통계/i],
  ["fashion", /의류|의상|패턴|룩북|유니폼|봉제|패션/i],
  ["space", /팝업|전시|공간|부스|매장\s?연출|인테리어/i],
];
const BUDGET_MID = { "": 150, under100: 90, "100-200": 150, "200-300": 250, "300-500": 400, over500: 600 };
export const IP_RISK = /디즈니|마블|픽사|포켓몬|산리오|헬로\s?키티|짱구|도라에몽|카카오\s?프렌즈|라인\s?프렌즈|지브리|원작과\s?(똑같|비슷|동일)|캐릭터를?\s?그대로|로고를?\s?그대로|짝퉁|레플리카/i;

export function ruleBreakdown(input) {
  const text = String(input.brief || "");
  const firstLine = text.split(/[\n.!?]/)[0].replace(/\s+/g, " ").trim();
  if (IP_RISK.test(text)) {
    return normalizeBreakdown({
      decision: "decline",
      decision_reason: "타사 캐릭터·브랜드를 허락 없이 상업적으로 쓰는 요청이라 맡을 수 없어요. 라이선스 계약이 있거나 오리지널로 바꾸면 다시 검토할게요.",
      title: `${input.client ? input.client + " " : ""}요청 검토`, summary: firstLine, duration_weeks: Number(input.weeks) || 4,
      risks: ["저작권·상표권 침해 소지"], questions_for_client: ["권리자와 라이선스 계약이 있나요?"], roles: [],
    });
  }
  let ids = KEYWORDS.filter((k) => k[1].test(text)).map((k) => k[0]);
  if (!ids.length) ids = ["brand", "copy"];
  ids = ids.slice(0, 5);
  const budget = BUDGET_MID[input.budget || ""] || 150;
  const payTarget = budget * 10000 * PRICING.payShare;
  const W = { pm: 0.12, rights: 0.05 };
  const prodShare = (1 - W.pm - W.rights) / ids.length;
  const roles = ["pm", ...ids, "rights"].map((id) => {
    const def = ROLE_MAP[id];
    const share = W[id] != null ? W[id] : prodShare;
    const count = isSupportRole(id) ? 1 : (share * payTarget) / def.rate > 70 ? 2 : 1;
    return { role_id: id, count, hours_per_person: Math.max(4, Math.round((share * payTarget) / def.rate / count)), focus: def.deliverable, skills: [] };
  });
  const risks = ["폰트·이미지·AI 생성물의 상업 라이선스 확인 필요"];
  if (budget <= 100 && ids.length >= 3) risks.push("예산 대비 범위가 넓어요");
  return fitBudget(normalizeBreakdown({
    title: `${input.client ? input.client + " " : ""}${ROLE_MAP[ids[0]].label.split("·")[0]} 과제`,
    summary: cut(firstLine, 120) || "브리프 기반 제작 과제",
    duration_weeks: Number(input.weeks) || (budget >= 300 ? 6 : 4),
    deliverables: ids.map((id) => ROLE_MAP[id].deliverable),
    equipment: EQUIPMENT.filter((e) => e.roles.some((r) => ids.includes(r))).map((e) => e.id),
    risks,
    questions_for_client: ["납품 파일 형식과 사용처", "참고 레퍼런스", "수정 횟수와 1차 시안 일정"],
    roles,
  }), input.budget);
}

export function ruleMatch(project, ctx = {}, pool = DEFAULT_POOL) {
  const used = new Set();
  const out = {};
  project.roles.forEach((role) => {
    const picks = [];
    rankCandidates(role, { weeks: project.weeks, busy: ctx.busy }, 30, pool).forEach((sc) => {
      if (picks.length >= role.count || used.has(sc.id)) return;
      used.add(sc.id);
      picks.push({ id: sc.id, reason: ruleReason(sc, pool), source: "rule" });
    });
    out[role.key] = picks;
  });
  return out;
}

export function sanitizeText(text, project, teamIds, pool = DEFAULT_POOL) {
  let bad = false;
  const out = String(text || "")
    .replace(/\b(C\d{2}|ME)\b/g, (m) => {
      const st = pool.map[m];
      if (!st) { bad = true; return m; }
      if (teamIds && !teamIds.includes(m)) bad = true;
      return st.name;
    })
    .replace(/\b(r\d{1,2})\b/g, (m) => {
      const role = project && project.roles.find((r) => r.key === m);
      return role ? ROLE_MAP[role.roleId].label : m;
    });
  return bad ? null : out;
}

export function reconcileAssignments(project, aiPicks, ctx = {}, pool = DEFAULT_POOL) {
  const used = new Set();
  const out = {};
  project.roles.forEach((role) => {
    const allowed = rankCandidates(role, { weeks: project.weeks, busy: ctx.busy }, ctx.limit || 8, pool).map((c) => c.id);
    const picks = [];
    (aiPicks[role.key] || []).forEach((p) => {
      const id = String(p.student_id || p.id || "");
      if (picks.length >= role.count || !allowed.includes(id) || used.has(id)) return;
      used.add(id);
      const reason = sanitizeText(String(p.reason || ""), project, [id], pool);
      picks.push({ id, reason: cut(reason || "AI 추천", 90), source: "ai" });
    });
    out[role.key] = picks;
  });
  project.roles.forEach((role) => {
    const picks = out[role.key];
    rankCandidates(role, { weeks: project.weeks, busy: ctx.busy }, 30, pool).forEach((sc) => {
      if (picks.length >= role.count || used.has(sc.id)) return;
      used.add(sc.id);
      picks.push({ id: sc.id, reason: ruleReason(sc, pool), source: "rule" });
    });
  });
  return out;
}

// ─── 담당 교수·퇴직 멘토 배정 ─────────────────────────────────────────
export function mainRole(project) {
  const prod = (project.roles || []).filter((r) => !isSupportRole(r.roleId));
  if (!prod.length) return null;
  return prod.reduce((a, b) => (b.count * b.hours > a.count * a.hours ? b : a)).roleId;
}
export function pickSupervisors(project) {
  const main = mainRole(project);
  const professor = PROFESSORS.find((p) => p.roles.includes(main)) || PROFESSORS[3];
  const mentor = MENTORS.find((m) => m.roles.includes(main)) || MENTORS[0];
  return { professorId: professor.id, mentorId: mentor.id };
}
export const PROFESSOR_MAP = Object.fromEntries(PROFESSORS.map((p) => [p.id, p]));
export const MENTOR_MAP = Object.fromEntries(MENTORS.map((m) => [m.id, m]));

// ─── 학생: 이력서 텍스트에서 규칙 기반 추출 (AI 미사용 시) ─────────────
export function ruleProfileFromText(text) {
  const t = String(text || "");
  const skills = SKILLS.filter((s) => t.toLowerCase().includes(s.toLowerCase()));
  const major = MAJORS.find((m) => t.includes(m)) || "기타";
  const y = t.match(/([1-5])\s?학년/);
  return { name: "", major, year: y ? Number(y[1]) : 3, skills, portfolio: /포트폴리오|behance|github|notion\.site|portfolio/i.test(t), summary: "", highlights: [] };
}

// 학생 프로필 기준 과제별 최적 역할
export function bestRoleFor(profile, project, pool) {
  const me = pool.map.ME;
  if (!me) return null;
  let best = null;
  project.roles.forEach((role) => {
    const sc = scoreStudent(me, role, { weeks: project.weeks });
    if (sc && sc.eligible && (!best || sc.score > best.sc.score)) best = { role, sc, pct: matchPercent(sc) };
  });
  return best;
}
