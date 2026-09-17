import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Clock, FileUp, Search, Wallet } from "lucide-react";
import { ROLES, ROLE_MAP, bestRoleFor, isSupportRole, man } from "../../lib/engine.js";
import { useStore } from "../../lib/store.jsx";
import { Empty } from "../../components/ui.jsx";

export function maxPay(project, rate) {
  return Math.max(...project.roles.map((r) => (rate || ROLE_MAP[r.roleId].rate) * r.hours));
}

export default function Projects() {
  const { projects, profile, pool, applications } = useStore();
  const [filter, setFilter] = useState("");

  const open = useMemo(() => {
    const list = projects.filter((p) => p.status === "recruiting").map((p) => ({ p, best: profile ? bestRoleFor(profile, p, pool) : null }));
    return list
      .filter(({ p }) => !filter || p.roles.some((r) => r.roleId === filter))
      .sort((a, b) => (b.best?.pct || 0) - (a.best?.pct || 0));
  }, [projects, profile, pool, filter]);

  const usedRoles = ROLES.filter((r) => !isSupportRole(r.id) && projects.some((p) => p.status === "recruiting" && p.roles.some((x) => x.roleId === r.id)));

  return (
    <main className="container page">
      <div className="page-head"><div><h1>모집 중인 과제</h1><p>{open.length}건</p></div></div>

      {!profile && (
        <Link to="/student/profile" className="card link row" style={{ gap: 14 }} id="profile-nudge">
          <div className="avatar me lg"><FileUp size={22} /></div>
          <div style={{ flex: 1 }}><b>이력서 올리고 추천받기</b><div className="muted small">AI가 맞는 과제와 역할을 골라줘요</div></div>
          <ChevronRight size={20} className="faint" />
        </Link>
      )}

      <div className="scroll-x">
        <button className={`chip btnlike ${filter === "" ? "on" : ""}`} onClick={() => setFilter("")}>전체</button>
        {usedRoles.map((r) => <button key={r.id} className={`chip btnlike ${filter === r.id ? "on" : ""}`} onClick={() => setFilter(r.id)}>{r.short}</button>)}
      </div>

      {open.length === 0 ? (
        <div className="card"><Empty icon={<Search size={24} />} title="조건에 맞는 과제가 없어요" /></div>
      ) : (
        <div className="plist">
          {open.map(({ p, best }) => {
            const applied = applications.some((a) => a.projectId === p.id);
            return (
              <Link key={p.id} to={`/student/projects/${p.id}`} className="card link pcard">
                <div className="row between">
                  <span className="faint small">{p.client}</span>
                  {applied ? <span className="chip good">지원함</span> : best && best.pct >= 40 ? <span className="match">{best.pct}% 맞음</span> : null}
                </div>
                <div>
                  <h3>{p.title}</h3>
                  <div className="meta">
                    <span><Clock size={14} />{p.weeks}주</span>
                    <span><Wallet size={14} />최대 {man(maxPay(p, profile?.rate))}</span>
                  </div>
                </div>
                <div className="foot">
                  <div className="chips">{p.roles.filter((r) => !isSupportRole(r.roleId)).map((r) => <span key={r.key} className={`chip ${best?.role.key === r.key ? "on" : ""}`}>{ROLE_MAP[r.roleId].short}</span>)}</div>
                  <ChevronRight size={18} className="faint" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
