/*
 * Off-Term Studio — shared engine
 * 브라우저(<script src>)와 Netlify 함수(import) 양쪽에서 같은 파일을 씁니다.
 * - 역할 카탈로그 / 교내 장비 / 가상 크루 데이터
 * - 크루 적합도 점수(규칙 기반, 설명 가능)
 * - 견적 계산 (학생 페이 60% · 직접원가 10% · 운영 마진 30%)
 * - AI가 응답하지 못할 때 쓰는 규칙 기반 분해·매칭
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.OTS = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // ─── 단가 구조 (Q3-2 사업계획과 동일) ───────────────────────────────
  var PRICING = {
    payShare: 0.6, // 학생 페이 = 계약금의 60%
    directCostShare: 0.1, // 상용 라이선스·건별 감수료
    marginShare: 0.3, // 회사 매출총이익
    roundTo: 10000,
  };

  // ─── 역할 카탈로그 (상명대 서울캠퍼스 실제 학부·전공 기준) ────────────
  var ROLES = [
    { id: "pm", label: "기획·PM", rate: 17000, majors: ["경영학부", "융합경영학과", "글로벌경영학과", "행정학부"],
      skills: ["일정관리", "클라이언트커뮤니케이션", "견적", "리서치", "노션", "설문조사"],
      deliverable: "일정표·주간 보고·납품 체크리스트" },
    { id: "rights", label: "권리·라이선스 검토", rate: 16000, majors: ["지적재산권전공"],
      skills: ["저작권검토", "라이선스대장", "계약서검토", "상표조사"],
      deliverable: "소재별 출처·라이선스·권리이전 범위 대장" },
    { id: "brand", label: "브랜딩·그래픽 디자인", rate: 17000, majors: ["생활예술전공", "조형예술전공", "애니메이션전공"],
      skills: ["로고", "브랜드가이드", "패키지디자인", "편집디자인", "포스터", "SNS콘텐츠", "타이포그래피", "Figma"],
      deliverable: "로고·가이드·인쇄/SNS 시안" },
    { id: "illust", label: "일러스트·캐릭터", rate: 16000, majors: ["애니메이션전공", "조형예술전공"],
      skills: ["캐릭터", "일러스트", "이모티콘", "웹툰", "컨셉아트", "SNS콘텐츠"],
      deliverable: "캐릭터 시트·일러스트 원본" },
    { id: "motion", label: "모션그래픽·영상", rate: 18000, majors: ["애니메이션전공"],
      skills: ["모션그래픽", "2D애니메이션", "3D애니메이션", "영상편집", "촬영", "스토리보드", "사운드디자인"],
      deliverable: "스토리보드·완성 영상(세로/가로)" },
    { id: "web", label: "웹 퍼블리싱·프론트엔드", rate: 18000, majors: ["컴퓨터과학전공", "휴먼AI공학전공"],
      skills: ["React", "반응형웹", "랜딩페이지", "Figma", "UI디자인"],
      deliverable: "반응형 페이지·소스·배포" },
    { id: "app", label: "앱·백엔드 개발", rate: 19000, majors: ["컴퓨터과학전공", "지능IOT융합전공", "핀테크전공"],
      skills: ["앱개발", "Flutter", "백엔드", "Node.js", "데이터베이스", "API연동"],
      deliverable: "앱/서버 소스·API 문서" },
    { id: "game", label: "게임 개발", rate: 18000, majors: ["게임전공"],
      skills: ["Unity", "Unreal", "게임기획", "레벨디자인", "게임UI", "3D모델링"],
      deliverable: "플레이 가능한 빌드·기획서" },
    { id: "model3d", label: "3D 모델링·프린팅", rate: 18000, majors: ["게임전공", "애니메이션전공", "스마트생산전공"],
      skills: ["Blender", "3D모델링", "3D프린팅", "제품목업", "렌더링", "3D애니메이션"],
      deliverable: "3D 원본·렌더 이미지·출력물" },
    { id: "sound", label: "사운드·음악", rate: 17000, majors: ["음악학부"],
      skills: ["작곡", "사운드디자인", "효과음", "믹싱", "녹음", "영상편집"],
      deliverable: "BGM·효과음 원본(WAV)·스템" },
    { id: "copy", label: "카피·콘텐츠 기획", rate: 15000, majors: ["역사콘텐츠전공", "한일문화콘텐츠전공", "문헌정보학전공", "국어교육과"],
      skills: ["카피라이팅", "네이밍", "상세페이지", "스토리텔링", "블로그콘텐츠", "일본어번역", "리서치"],
      deliverable: "카피 시트·상세페이지 원고" },
    { id: "data", label: "데이터 분석·리서치", rate: 17000, majors: ["빅데이터융합전공", "경제금융학부", "경영학부"],
      skills: ["데이터분석", "설문조사", "Python", "대시보드"],
      deliverable: "조사 설계·분석 리포트" },
    { id: "fashion", label: "패션·의상 제작", rate: 17000, majors: ["의류학과"],
      skills: ["패턴CAD", "봉제", "룩북스타일링", "의상제작"],
      deliverable: "패턴 파일·샘플 의상·룩북" },
    { id: "space", label: "공간·팝업 디자인", rate: 17000, majors: ["공간환경학부", "생활예술전공"],
      skills: ["공간디자인", "전시기획", "SketchUp", "팝업스토어"],
      deliverable: "공간 도면·3D 시안·설치 가이드" },
  ];
  var ROLE_MAP = {};
  ROLES.forEach(function (r) { ROLE_MAP[r.id] = r; });

  // ─── 교내 장비 (공간 협약 후 예약제) ───────────────────────────────
  var EQUIPMENT = [
    { id: "workstation", label: "고사양 워크스테이션·렌더팜", roles: ["motion", "model3d", "game"] },
    { id: "tablet", label: "액정 타블렛", roles: ["illust", "brand"] },
    { id: "booth", label: "방음 녹음 부스", roles: ["sound"] },
    { id: "printer3d", label: "3D 프린터", roles: ["model3d"] },
    { id: "mocap", label: "모션캡처 스튜디오", roles: [] },
    { id: "patterncad", label: "패턴CAD", roles: ["fashion"] },
    { id: "camera", label: "촬영 장비(카메라·조명)", roles: ["motion"] },
  ];
  var EQUIPMENT_MAP = {};
  EQUIPMENT.forEach(function (e) { EQUIPMENT_MAP[e.id] = e; });

  // ─── 가상 크루 데이터 (데모용 · 실존 인물 아님) ─────────────────────
  // rate: 시급(원) · weeklyHours: 방학 중 주당 가능 시간 · rating: 이전 프로젝트 평점(없으면 신규)
  var STUDENTS = [
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
  var STUDENT_MAP = {};
  STUDENTS.forEach(function (s) { STUDENT_MAP[s.id] = s; });

  // ─── 유틸 ─────────────────────────────────────────────────────────
  function clamp(n, lo, hi) { n = Number(n); if (!isFinite(n)) n = lo; return Math.max(lo, Math.min(hi, Math.round(n))); }
  function uniq(arr) { var seen = {}; return arr.filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; }); }
  function roundUp(n, unit) { return Math.ceil(n / unit) * unit; }

  // ─── 크루 적합도 점수 (설명 가능한 규칙) ───────────────────────────
  // role: {roleId, hours, skills[]} · ctx: {weeks, busy: [studentId]}
  function scoreStudent(s, role, ctx) {
    ctx = ctx || {};
    var def = ROLE_MAP[role.roleId];
    if (!def) return null;
    var wanted = role.skills && role.skills.length ? role.skills : def.skills;
    var matched = wanted.filter(function (t) { return s.skills.indexOf(t) >= 0; });
    var pool = s.skills.filter(function (t) { return def.skills.indexOf(t) >= 0; });
    var majorFit = def.majors.indexOf(s.major) >= 0;
    var weeks = Math.max(1, Number(ctx.weeks) || 4);
    var capacity = s.weeklyHours * weeks;
    var fits = capacity >= (Number(role.hours) || 0);
    var busy = !!(ctx.busy && ctx.busy.indexOf(s.id) >= 0);
    var parts = {
      major: majorFit ? 30 : 0,
      skills: Math.min(matched.length, 4) * 12 + Math.min(pool.length, 4) * 4,
      portfolio: s.portfolio ? 8 : 0,
      rating: s.rating ? Math.round((s.rating - 4) * 20) : 4,
      capacity: fits ? 10 : -15,
      busy: busy ? -25 : 0,
    };
    var total = 0; for (var k in parts) total += parts[k];
    return {
      id: s.id, score: total, parts: parts, majorFit: majorFit,
      matched: matched, pool: pool, wanted: wanted,
      capacity: capacity, fits: fits, busy: busy,
      eligible: majorFit || pool.length >= 2,
    };
  }

  function rankCandidates(role, ctx, limit) {
    return STUDENTS.map(function (s) { return scoreStudent(s, role, ctx); })
      .filter(function (r) { return r && r.eligible; })
      .sort(function (a, b) { return b.score - a.score || STUDENT_MAP[a.id].rate - STUDENT_MAP[b.id].rate; })
      .slice(0, limit || 8);
  }

  function ruleReason(sc) {
    var s = STUDENT_MAP[sc.id];
    var bits = [];
    if (sc.majorFit) bits.push(s.major);
    if (sc.matched.length) bits.push("요구 스킬 " + sc.matched.length + "/" + sc.wanted.length + "(" + sc.matched.slice(0, 2).join("·") + ")");
    else if (sc.pool.length) bits.push("관련 스킬 " + sc.pool.slice(0, 2).join("·"));
    bits.push(s.rating ? "평점 " + s.rating + "·" + s.projects + "건" : "신규 크루");
    if (!sc.fits) bits.push("가능시간 부족 주의");
    if (sc.busy) bits.push("다른 프로젝트 진행 중");
    return bits.join(" · ");
  }

  // ─── 견적 ─────────────────────────────────────────────────────────
  // roles: [{roleId, count, hours, assigned:[{id}]}]
  function quote(roles) {
    var lines = roles.map(function (r) {
      var def = ROLE_MAP[r.roleId] || { rate: 16000, label: r.roleId };
      var people = [];
      for (var i = 0; i < r.count; i++) {
        var a = r.assigned && r.assigned[i];
        var st = a && STUDENT_MAP[a.id];
        people.push({ id: st ? st.id : null, name: st ? st.name : "미배정", rate: st ? st.rate : def.rate, hours: r.hours, subtotal: (st ? st.rate : def.rate) * r.hours });
      }
      var subtotal = people.reduce(function (n, p) { return n + p.subtotal; }, 0);
      return { key: r.key, roleId: r.roleId, label: def.label, count: r.count, hours: r.hours, people: people, subtotal: subtotal };
    });
    var pay = lines.reduce(function (n, l) { return n + l.subtotal; }, 0);
    var contract = pay > 0 ? roundUp(pay / PRICING.payShare, PRICING.roundTo) : 0;
    var direct = Math.round(contract * PRICING.directCostShare);
    var margin = contract - pay - direct;
    var hours = lines.reduce(function (n, l) { return n + l.count * l.hours; }, 0);
    return { lines: lines, pay: pay, contract: contract, direct: direct, margin: margin, hours: hours, people: lines.reduce(function (n, l) { return n + l.count; }, 0) };
  }

  // ─── 입력 정규화 (AI 응답/사용자 입력 모두 이 함수를 통과) ─────────
  function normalizeBreakdown(raw) {
    raw = raw || {};
    var seen = {};
    var roles = (Array.isArray(raw.roles) ? raw.roles : []).map(function (r) {
      var id = String(r.role_id || r.roleId || "").trim();
      var def = ROLE_MAP[id];
      if (!def || seen[id]) return null;
      seen[id] = 1;
      var skills = (Array.isArray(r.skills) ? r.skills : []).map(String).filter(function (t) { return def.skills.indexOf(t) >= 0; });
      return {
        roleId: id,
        count: clamp(r.count, 1, id === "pm" || id === "rights" ? 1 : 3),
        hours: clamp(r.hours_per_person != null ? r.hours_per_person : r.hours, 2, 160),
        focus: String(r.focus || def.deliverable).slice(0, 80),
        skills: uniq(skills).slice(0, 4),
      };
    }).filter(Boolean);
    var production = roles.filter(function (r) { return r.roleId !== "pm" && r.roleId !== "rights"; });
    if (!production.length) return null;
    if (!seen.pm) roles.unshift({ roleId: "pm", count: 1, hours: 12, focus: "일정·커뮤니케이션·납품 관리", skills: [] });
    if (!seen.rights) roles.push({ roleId: "rights", count: 1, hours: 6, focus: "소재 라이선스 대장 작성", skills: [] });
    // pm 맨 앞, rights 맨 뒤
    roles.sort(function (a, b) { return weight(a.roleId) - weight(b.roleId); });
    function weight(id) { return id === "pm" ? -1 : id === "rights" ? 99 : 0; }
    function strList(v, n, len) { return (Array.isArray(v) ? v : []).map(function (x) { return String(x).trim().slice(0, len); }).filter(Boolean).slice(0, n); }
    return {
      title: String(raw.title || "제작 프로젝트").trim().slice(0, 40),
      summary: String(raw.summary || "").trim().slice(0, 160),
      weeks: clamp(raw.duration_weeks != null ? raw.duration_weeks : raw.weeks, 1, 12),
      deliverables: strList(raw.deliverables, 6, 60),
      equipment: uniq((Array.isArray(raw.equipment) ? raw.equipment : []).map(String).filter(function (e) { return EQUIPMENT_MAP[e]; })),
      risks: strList(raw.risks, 3, 120),
      questions: strList(raw.questions_for_client || raw.questions, 3, 120),
      roles: roles.map(function (r, i) { r.key = "r" + (i + 1); return r; }),
    };
  }

  // ─── 규칙 기반 분해 (AI 미연결 시) ────────────────────────────────
  var KEYWORDS = [
    ["brand", /브랜드|브랜딩|로고|BI|CI|패키지|포스터|리플렛|전단|명함|굿즈|인쇄|SNS\s?(피드|카드)|카드뉴스|현수막/i],
    ["illust", /일러스트|캐릭터|이모티콘|웹툰|삽화|마스코트|굿즈/i],
    ["motion", /영상|모션|애니메이션|숏폼|릴스|쇼츠|유튜브|트레일러|티저|광고\s?영상|촬영/i],
    ["web", /웹|홈페이지|랜딩|사이트|반응형|프론트/i],
    ["app", /앱|어플|서버|백엔드|API|예약\s?시스템|관리자\s?페이지|DB/i],
    ["game", /게임\s?(개발|제작|기획)|유니티|Unity|언리얼|Unreal|레벨\s?디자인|프로토타입|미니\s?게임/i],
    ["model3d", /3D|목업|모델링|렌더|프린팅|시제품|피규어/i],
    ["sound", /사운드|음악|BGM|효과음|징글|녹음|성우|오디오|로고송/i],
    ["copy", /카피|문구|네이밍|상세\s?페이지|슬로건|원고|스토리|블로그|번역|일본어/i],
    ["data", /데이터|설문|시장\s?조사|사용자\s?조사|고객\s?조사|분석|리서치|대시보드|통계/i],
    ["fashion", /의류|의상|패턴|룩북|유니폼|굿즈\s?의류|봉제|패션/i],
    ["space", /팝업|전시|공간|부스|매장\s?연출|인테리어/i],
  ];
  var BUDGET_MID = { "": 150, "under100": 90, "100-200": 150, "200-300": 250, "300-500": 400, "over500": 600 };
  var WEIGHT = { pm: 0.12, rights: 0.05 };

  function ruleBreakdown(input) {
    var text = String(input.brief || "");
    var ids = KEYWORDS.filter(function (k) { return k[1].test(text); }).map(function (k) { return k[0]; });
    if (!ids.length) ids = ["brand", "copy"];
    ids = ids.slice(0, 5);
    var budget = BUDGET_MID[input.budget || ""] || 150;
    var payTarget = budget * 10000 * PRICING.payShare;
    var prodShare = (1 - WEIGHT.pm - WEIGHT.rights) / ids.length;
    var all = ["pm"].concat(ids, ["rights"]);
    var weeks = Number(input.weeks) || (budget >= 300 ? 6 : 4);
    var roles = all.map(function (id) {
      var def = ROLE_MAP[id];
      var share = WEIGHT[id] != null ? WEIGHT[id] : prodShare;
      var count = id === "pm" || id === "rights" ? 1 : (share * payTarget / def.rate > 70 ? 2 : 1);
      var hours = Math.max(4, Math.round((share * payTarget) / def.rate / count));
      return { role_id: id, count: count, hours_per_person: hours, focus: def.deliverable, skills: [] };
    });
    var eq = EQUIPMENT.filter(function (e) { return e.roles.some(function (r) { return ids.indexOf(r) >= 0; }); }).map(function (e) { return e.id; });
    var risks = ["폰트·스톡 이미지·AI 생성물 사용 시 상업 라이선스 확인 필요"];
    if (ids.indexOf("sound") >= 0) risks.push("공간 협약 전에는 방음 부스 대신 외부 녹음실 대관이 필요할 수 있음");
    if (budget <= 100 && ids.length >= 3) risks.push("예산 대비 역할이 많아 1차 납품 범위 축소를 권장");
    var firstLine = text.split(/[\n.!?]/)[0].replace(/\s+/g, " ").trim();
    return normalizeBreakdown({
      title: (input.client ? input.client + " " : "") + ROLE_MAP[ids[0]].label.split("·")[0] + " 제작",
      summary: firstLine.slice(0, 120) || "브리프 기반 제작 과제",
      duration_weeks: weeks,
      deliverables: ids.map(function (id) { return ROLE_MAP[id].deliverable; }),
      equipment: eq,
      risks: risks,
      questions_for_client: ["최종 납품 파일 형식과 사용 매체(인쇄/웹/영상)", "참고 레퍼런스와 피하고 싶은 방향", "수정 횟수와 1차 시안 일정"],
      roles: roles,
    });
  }

  // ─── 규칙 기반 매칭 ───────────────────────────────────────────────
  function ruleMatch(project, ctx) {
    ctx = ctx || {};
    var used = {};
    var out = {};
    project.roles.forEach(function (role) {
      var picks = [];
      rankCandidates(role, { weeks: project.weeks, busy: ctx.busy }, 20).forEach(function (sc) {
        if (picks.length >= role.count || used[sc.id]) return;
        used[sc.id] = 1;
        picks.push({ id: sc.id, reason: ruleReason(sc), source: "rule" });
      });
      out[role.key] = picks;
    });
    return out;
  }

  // AI가 고른 배정을 검증하고 빈 자리는 규칙으로 보충
  function reconcileAssignments(project, aiPicks, ctx) {
    ctx = ctx || {};
    var used = {};
    var out = {};
    project.roles.forEach(function (role) {
      var allowed = rankCandidates(role, { weeks: project.weeks, busy: ctx.busy }, ctx.limit || 8).map(function (c) { return c.id; });
      var picks = [];
      (aiPicks[role.key] || []).forEach(function (p) {
        if (picks.length >= role.count) return;
        var id = String(p.student_id || p.id || "");
        if (allowed.indexOf(id) < 0 || used[id]) return;
        used[id] = 1;
        picks.push({ id: id, reason: String(p.reason || "").slice(0, 90) || "AI 추천", source: "ai" });
      });
      out[role.key] = picks;
    });
    project.roles.forEach(function (role) {
      var picks = out[role.key];
      if (picks.length >= role.count) return;
      rankCandidates(role, { weeks: project.weeks, busy: ctx.busy }, 20).forEach(function (sc) {
        if (picks.length >= role.count || used[sc.id]) return;
        used[sc.id] = 1;
        picks.push({ id: sc.id, reason: "규칙 보충 · " + ruleReason(sc), source: "rule" });
      });
    });
    return out;
  }

  return {
    PRICING: PRICING, ROLES: ROLES, ROLE_MAP: ROLE_MAP, EQUIPMENT: EQUIPMENT, EQUIPMENT_MAP: EQUIPMENT_MAP,
    STUDENTS: STUDENTS, STUDENT_MAP: STUDENT_MAP,
    scoreStudent: scoreStudent, rankCandidates: rankCandidates, ruleReason: ruleReason,
    quote: quote, normalizeBreakdown: normalizeBreakdown,
    ruleBreakdown: ruleBreakdown, ruleMatch: ruleMatch, reconcileAssignments: reconcileAssignments,
  };
});
