import { Link } from "react-router-dom";
import { ChevronRight, Inbox } from "lucide-react";
import { ROLE_MAP } from "../../lib/engine.js";
import { applicationStatus, useStore } from "../../lib/store.jsx";
import { Empty } from "../../components/ui.jsx";

export default function Applications() {
  const { applications, projects } = useStore();
  const teamOnly = projects.filter((p) => p.roles.some((r) => r.assigned.some((a) => a.id === "ME")) && !applications.some((a) => a.projectId === p.id));

  const rows = applications.map((a) => ({ a, p: projects.find((x) => x.id === a.projectId) }))
    .concat(teamOnly.map((p) => ({ a: { id: "T" + p.id, projectId: p.id, roleKey: p.roles.find((r) => r.assigned.some((x) => x.id === "ME")).key }, p, invited: true })));

  return (
    <main className="container page">
      <div className="page-head"><div><h1>내 지원</h1><p>{rows.length}건</p></div></div>
      {rows.length === 0 ? (
        <div className="card">
          <Empty icon={<Inbox size={24} />} title="아직 지원한 과제가 없어요">
            <Link to="/student" className="btn primary">과제 보기</Link>
          </Empty>
        </div>
      ) : (
        <div className="plist">
          {rows.map(({ a, p, invited }) => {
            const st = applicationStatus(a, p);
            const role = p?.roles.find((r) => r.key === a.roleKey);
            return (
              <Link key={a.id} to={p ? `/student/projects/${p.id}` : "/student"} className="card link row between">
                <div><b>{p?.title || "삭제된 과제"}</b><div className="faint small">{p?.client} · {role ? ROLE_MAP[role.roleId].label : ""}{invited ? " · AI 추천" : ""}</div></div>
                <span className="row" style={{ gap: 6 }}><span className={`chip ${st.tone}`}>{st.label}</span><ChevronRight size={18} className="faint" /></span>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
