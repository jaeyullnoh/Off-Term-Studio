import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, GraduationCap, Minus, Sparkles, UserPlus } from "lucide-react";
import { EQUIPMENT_MAP, MENTOR_MAP, PROFESSOR_MAP, ROLE_MAP, man, matchPercent, quote, scoreStudent, won } from "../../lib/engine.js";
import { WhoDid } from "./NewOrder.jsx";
import { useStore } from "../../lib/store.jsx";
import { Avatar, Fold, Timeline, useToast } from "../../components/ui.jsx";

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { projects, pool, applications, updateProject, removeProject } = useStore();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const p = projects.find((x) => x.id === id);
  if (!p) return <main className="container page"><p>과제를 찾을 수 없어요. <Link to="/company" className="muted">내 발주로</Link></p></main>;

  const q = quote(p.roles, pool);
  const prof = PROFESSOR_MAP[p.professorId];
  const mentor = MENTOR_MAP[p.mentorId];
  const inTeam = (sid) => p.roles.some((r) => r.assigned.some((a) => a.id === sid));
  const apps = applications.filter((a) => a.projectId === p.id && pool.map.ME && !inTeam("ME"));

  const addApplicant = (roleKey) => {
    updateProject(p.id, (draft) => {
      const r = draft.roles.find((x) => x.key === roleKey) || draft.roles[0];
      r.count = Math.min(4, r.count + 1);
      r.assigned.push({ id: "ME", reason: "직접 지원", source: "applicant" });
      return draft;
    });
    toast("팀에 추가했어요");
  };
  const removeMember = (roleKey, sid) => updateProject(p.id, (draft) => {
    const r = draft.roles.find((x) => x.key === roleKey);
    r.assigned = r.assigned.filter((a) => a.id !== sid);
    r.count = Math.max(1, r.assigned.length);
    return draft;
  });
  const advance = () => {
    const next = p.status === "recruiting" ? "active" : "done";
    updateProject(p.id, (d) => ({ ...d, status: next }));
    toast(next === "active" ? "팀을 확정했어요" : "납품 완료");
  };

  return (
    <main className="container page">
      <div className="row between">
        <Link to="/company" className="btn ghost sm"><ArrowLeft size={16} />내 발주</Link>
        <span className="faint small">{p.id}</span>
      </div>

      <div className="card pad-lg stack">
        <div className="row">{p.source === "ai" ? <span className="chip ai"><Sparkles size={13} />AI 구성</span> : p.example ? <span className="chip">예시</span> : <span className="chip">규칙 구성</span>}</div>
        <h1 style={{ fontSize: 24 }}>{p.title}</h1>
        {p.summary && <p className="muted">{p.summary}</p>}
        <div className="row between" style={{ alignItems: "flex-end" }}>
          <div className="price"><small>계약금</small><strong className="num">{man(q.contract)}</strong></div>
          <div className="chips"><span className="chip">{p.weeks}주</span><span className="chip">{q.people}명</span></div>
        </div>
        {p.equipment?.length > 0 && (
          <div className="row small"><span className="faint">교내 장비</span>{p.equipment.map((e) => <span key={e} className="chip">{EQUIPMENT_MAP[e]?.label}</span>)}</div>
        )}
        {p.sourceDetail && <WhoDid source={p.sourceDetail} fit={p.budgetFit} />}
        <Timeline status={p.status} />
      </div>

      <div className="grid-2">
        {prof && (
          <div className="card person" id="professor">
            <Avatar name={prof.name} kind="prof" size="lg" />
            <div><div className="role-name">과제 컨펌 교수</div><b>{prof.name} 교수</b><div className="desc">{prof.major}</div></div>
          </div>
        )}
        {mentor && (
          <div className="card person" id="mentor">
            <Avatar name={mentor.name} kind="mentor" size="lg" />
            <div><div className="role-name">제작 자문 · 퇴직 전문가</div><b>{mentor.name}</b><div className="desc">{mentor.career} · {mentor.years}년</div></div>
          </div>
        )}
      </div>

      {apps.length > 0 && p.status === "recruiting" && (
        <div className="card stack" id="applicants">
          <span className="section-title"><UserPlus size={18} />지원자 {apps.length}</span>
          {apps.map((a) => {
            const s = pool.map.ME;
            const role = p.roles.find((r) => r.key === a.roleKey) || p.roles[0];
            const pct = matchPercent(scoreStudent(s, role, { weeks: p.weeks }));
            return (
              <div className="member" key={a.id}>
                <Avatar name={s.name} kind="me" />
                <div className="who"><b>{s.name}</b> <span className="faint small">{s.major} {s.year}학년</span><div>{ROLE_MAP[role.roleId].label} 지원 · 적합도 {pct}%</div></div>
                <button className="btn primary sm" onClick={() => addApplicant(role.key)}><Check size={14} />팀에 추가</button>
              </div>
            );
          })}
        </div>
      )}

      <div className="card stack" id="team">
        <span className="section-title"><GraduationCap size={18} />학생 팀 {q.people}명</span>
        {p.roles.map((r) => (
          <div key={r.key} className="stack" style={{ gap: 8 }}>
            <div className="faint small" style={{ fontWeight: 700 }}>{ROLE_MAP[r.roleId].label} · {r.hours}h</div>
            {r.assigned.map((a) => {
              const s = pool.map[a.id];
              if (!s) return null;
              return (
                <div className="member" key={a.id}>
                  <Avatar name={s.name} kind={a.id === "ME" ? "me" : ""} />
                  <div className="who"><b>{s.name}</b> <span className="faint small">{s.major} {s.year}학년</span><div className="faint">{a.reason}</div></div>
                  {p.status === "recruiting" && r.assigned.length > 1
                    ? <button className="icon-btn" aria-label={`${s.name} 빼기`} onClick={() => removeMember(r.key, a.id)}><Minus size={14} /></button>
                    : <span className="faint small num">{won(s.rate * r.hours)}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <Fold title="견적 근거" extra={<span className="faint small num">{man(q.contract)}</span>}>
        {q.lines.map((l) => <div className="qrow" key={l.key}><span>{l.label} <span className="faint">{l.count}명 × {l.hours}h</span></span><span className="num">{won(l.subtotal)}</span></div>)}
        <div className="qrow"><span>학생 페이</span><span className="num">{won(q.pay)}</span></div>
        <div className="qrow total"><span>계약금</span><span className="num">{won(q.contract)}</span></div>
      </Fold>

      {(p.risks?.length > 0 || p.questions?.length > 0) && (
        <Fold title="확인할 것">
          <ul className="bullets">{[...(p.risks || []), ...(p.questions || [])].map((t) => <li key={t}>{t}</li>)}</ul>
        </Fold>
      )}

      <div className="row between">
        {p.example ? <span /> : confirmCancel
          ? <button className="btn sm" style={{ color: "var(--bad)" }} onClick={() => { removeProject(p.id); nav("/company"); }}>정말 취소</button>
          : <button className="btn ghost sm" onClick={() => setConfirmCancel(true)}>발주 취소</button>}
        {p.status !== "done" && <button id="advance" className="btn primary" onClick={advance}><Check size={16} />{p.status === "recruiting" ? "팀 확정" : "납품 완료"}</button>}
      </div>
    </main>
  );
}
