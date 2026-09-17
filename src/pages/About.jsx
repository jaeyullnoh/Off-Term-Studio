import { Link } from "react-router-dom";
import { useHealth } from "../lib/api.js";
import { ArrowRight, Briefcase, GraduationCap, MonitorOff, ShieldCheck } from "lucide-react";

const PROBLEMS = [
  { icon: <GraduationCap size={20} />, who: "학생", text: "방학에 돈과 경력이 같이 남는 일이 없어요" },
  { icon: <Briefcase size={20} />, who: "기업", text: "100~500만 원짜리 제작을 믿고 맡길 곳이 없어요" },
  { icon: <MonitorOff size={20} />, who: "대학", text: "방학마다 고가 실습 장비가 멈춰 있어요" },
];

// 실제 처리 순서
const PIPELINE = [
  ["기업이 브리프 작성", "메일·기획서를 그대로 붙여넣기", "사람"],
  ["과제 분해 · 수주 판단", "역할·인원·공수, 맡을지·조건부·거절", "AI"],
  ["후보 점수 · 예산 보정", "전공·스킬·가능 시간 점수, 예산 상한 맞춤", "코드"],
  ["팀 선택 · 이유 작성", "후보 안에서만 고르고 근거를 남김", "AI"],
  ["조정 · 발주", "인원·시간·교체를 기업이 결정", "사람"],
  ["교수 컨펌 · 퇴직 전문가 자문", "주력 분야에 맞춰 배정", "코드"],
];

const GUARDS = [
  "타사 캐릭터·상표 무단 사용 요청은 거절",
  "예산을 넘긴 AI 제안은 코드가 보정",
  "브리프·이력서 속 지시문은 무시",
  "이력서에서 연락처 같은 개인정보는 뽑지 않음",
  "AI 응답은 형식 검증 후 사용, 실패하면 규칙으로 계속",
  "API 키는 서버에만 · 요청 횟수 제한",
];

export default function About() {
  const health = useHealth();
  const aiLabel = health?.provider === "gemini" ? "Gemini API" : "Claude API";
  return (
    <main className="container page">
      <div className="page-head"><div><h1>작동 방식</h1><p>AI PM이 소액 외주의 관리 비용을 줄여요</p></div></div>

      <div className="grid-3">
        {PROBLEMS.map((p) => (
          <div key={p.who} className="card problem">
            <div className="ic">{p.icon}</div>
            <span className="faint small" style={{ fontWeight: 700 }}>{p.who}</span>
            <b>{p.text}</b>
          </div>
        ))}
      </div>

      <div className="stack">
        <span className="section-title">발주가 팀이 되기까지</span>
        <ol className="pipeline">
          {PIPELINE.map(([title, desc, who]) => (
            <li key={title}>
              <div><b>{title}</b><span>{desc}</span></div>
              <span className={`chip ${who === "AI" ? "ai" : who === "코드" ? "on" : ""}`}>{who}</span>
            </li>
          ))}
        </ol>
        <p className="faint small">학생이 올린 이력서도 AI가 프로필로 바꿔 3·4단계 후보에 들어가요.</p>
      </div>

      <div className="card stack">
        <span className="section-title">계약금은 이렇게 나눠요</span>
        <div className="splitbar" aria-label="학생 페이 60%, 라이선스·감수 10%, 운영 30%">
          <div style={{ width: "60%", background: "var(--accent)" }}>학생 페이 60%</div>
          <div style={{ width: "10%", background: "var(--warn)" }}>10%</div>
          <div style={{ width: "30%", background: "var(--ink-2)" }}>운영 30%</div>
        </div>
        <p className="faint small">10%는 상용 라이선스와 건별 감수 비용이에요.</p>
      </div>

      <div className="card stack">
        <span className="section-title"><ShieldCheck size={18} />안전장치</span>
        <ul className="bullets">{GUARDS.map((g) => <li key={g}>{g}</li>)}</ul>
      </div>

      <div className="card stack">
        <span className="section-title">이 데모에서 알아둘 점</span>
        <ul className="bullets">
          <li>학생·교수·멘토·발주사는 가상 인물이에요. 학과명만 상명대 서울캠퍼스 편제를 따랐어요.</li>
          <li>입력한 발주·프로필은 이 브라우저에만 저장돼요.</li>
          <li>학교 공간·장비 협약은 아직 체결 전이에요.</li>
        </ul>
        <div className="chips"><span className="chip">React</span><span className="chip">Vite</span><span className="chip">Netlify Functions</span><span className="chip ai">{aiLabel}</span></div>
      </div>

      <div className="grid-2">
        <Link to="/company/new" className="btn primary lg">발주 넣어보기 <ArrowRight size={18} /></Link>
        <Link to="/student/profile" className="btn lg">이력서 올려보기 <ArrowRight size={18} /></Link>
      </div>
    </main>
  );
}
