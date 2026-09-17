import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Clock, Send } from "lucide-react";
import { EQUIPMENT_MAP, MENTOR_MAP, PROFESSOR_MAP, ROLE_MAP, isSupportRole, man, matchPercent, scoreStudent } from "../../lib/engine.js";
import { applicationStatus, useStore } from "../../lib/store.jsx";
import { Avatar, useToast } from "../../components/ui.jsx";

export default function ProjectDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { projects, profile, pool, applications, apply, cancelApplication } = useStore();
  const p = projects.find((x) => x.id === id);
  if (!p) return <main className="container page"><p>과제를 찾을 수 없어요. <Link to="/student" className="muted">목록으로</Link></p></main>;

  const prof = PROFESSOR_MAP[p.professorId];
  const mentor = MENTOR_MAP[p.mentorId];
  const myApp = applications.find((a) => a.projectId === p.id);
  const st = myApp ? applicationStatus(myApp, p) : null;
  const me = pool.map.ME;

  const doApply = (roleKey) => {
    if (!profile) { nav("/student/profile", { state: { back: `/student/projects/${p.id}` } }); return; }
    apply(p.id, roleKey);
    toast("지원했어요");
  };

  const roles = p.roles
    .map((r) => ({ r, sc: me ? scoreStudent(me, r, { weeks: p.weeks }) : null }))
    .sort((a, b) => Number(isSupportRole(a.r.roleId)) - Number(isSupportRole(b.r.roleId)) || (b.sc?.score || 0) - (a.sc?.score || 0));

  return (
    <main className="container page">
      <Link to="/student" className="btn ghost sm" style={{ justifySelf: "start" }}><ArrowLeft size={16} />과제</Link>

      <div className="card pad-lg stack">
        <span className="faint small">{p.client}</span>
        <h1 style={{ fontSize: 24 }}>{p.title}</h1>
        {p.summary && <p className="muted">{p.summary}</p>}
        <div className="chips"><span className="chip"><Clock size={13} />{p.weeks}주</span>{(p.equipment || []).map((e) => <span key={e} className="chip">{EQUIPMENT_MAP[e]?.label}</span>)}{st && <span className={`chip ${st.tone}`}>{st.label}</span>}</div>
      </div>

      <div className="grid-2">
        {prof && <div className="card person"><Avatar name={prof.name} kind="prof" /><div><div className="role-name">컨펌 교수</div><b>{prof.name} 교수</b><div className="desc">{prof.major}</div></div></div>}
        {mentor && <div className="card person"><Avatar name={mentor.name} kind="mentor" /><div><div className="role-name">현업 멘토</div><b>{mentor.name}</b><div className="desc">{mentor.career}</div></div></div>}
      </div>

      <span className="section-title">역할</span>
      <div className="stack">
        {roles.map(({ r, sc }) => {
          const def = ROLE_MAP[r.roleId];
          const pct = sc && sc.eligible ? matchPercent(sc) : null;
          const pay = (me?.rate || def.rate) * r.hours;
          const mine = myApp?.roleKey === r.key;
          return (
            <div className="card stack" key={r.key} style={{ gap: 10 }}>
              <div className="row between">
                <div><b>{def.label}</b><div className="faint small">{r.focus}</div></div>
                {pct != null && <span className="match">{pct}%</span>}
              </div>
              <div className="row between">
                <div className="chips"><span className="chip">{r.hours}시간</span><span className="chip">약 {man(pay)}</span><span className="chip">{r.count}자리</span></div>
                {mine ? (
                  st?.label === "검토 중"
                    ? <button className="btn sm" onClick={() => { cancelApplication(p.id); toast("지원을 취소했어요"); }}>지원 취소</button>
                    : <span className={`chip ${st?.tone}`}><Check size={13} />{st?.label}</span>
                ) : (
                  <button className="btn primary sm" disabled={Boolean(myApp) || p.status !== "recruiting"} onClick={() => doApply(r.key)}><Send size={14} />지원</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!profile && <p className="faint small" style={{ textAlign: "center" }}>지원하려면 프로필이 필요해요</p>}
    </main>
  );
}
