import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Check, GraduationCap } from "lucide-react";
import { useStore } from "../lib/store.jsx";
import { STUDENTS, PROFESSORS, MENTORS } from "../lib/engine.js";

export default function Landing() {
  const nav = useNavigate();
  const { setRole, projects } = useStore();
  const go = (role) => { setRole(role); nav(role === "company" ? "/company" : "/student"); };
  const open = projects.filter((p) => p.status === "recruiting").length;

  return (
    <main className="container">
      <section className="hero">
        <span className="eyebrow">상명대 서울캠퍼스 · 방학 인하우스 프로덕션</span>
        <h1>방학에 비는 캠퍼스로<br />진짜 외주를 합니다</h1>
        <p>어떤 분이신가요?</p>
      </section>

      <section className="choose">
        <button className="choice" onClick={() => go("company")}>
          <div className="ic"><Building2 size={26} /></div>
          <h2>기업이에요</h2>
          <ul>
            <li><Check size={16} />브리프 하나로 팀·견적 받기</li>
            <li><Check size={16} />교수 컨펌 · 현업 멘토 자문</li>
            <li><Check size={16} />100만 원대부터</li>
          </ul>
          <span className="go">과제 맡기기 <ArrowRight size={18} /></span>
        </button>

        <button className="choice student" onClick={() => go("student")}>
          <div className="ic"><GraduationCap size={26} /></div>
          <h2>학생이에요</h2>
          <ul>
            <li><Check size={16} />모집 중인 과제 {open}건</li>
            <li><Check size={16} />이력서 올리면 AI가 매칭</li>
            <li><Check size={16} />페이 + 실제 클라이언트 경력</li>
          </ul>
          <span className="go">과제 찾기 <ArrowRight size={18} /></span>
        </button>
      </section>

      <section className="stats">
        <div><strong className="num">{STUDENTS.length}명</strong><span>등록 크루</span></div>
        <div><strong className="num">{PROFESSORS.length}명</strong><span>컨펌 교수</span></div>
        <div><strong className="num">{MENTORS.length}명</strong><span>퇴직 전문가 멘토</span></div>
      </section>
    </main>
  );
}
