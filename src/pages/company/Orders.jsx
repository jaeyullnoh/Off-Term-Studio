import { Link } from "react-router-dom";
import { Briefcase, ChevronRight, Clock, Plus, Users } from "lucide-react";
import { man, quote } from "../../lib/engine.js";
import { useStore } from "../../lib/store.jsx";
import { Avatar, Empty, StatusPill } from "../../components/ui.jsx";

export default function Orders() {
  const { projects, pool, applications } = useStore();
  const mine = projects.filter((p) => p.mine);

  return (
    <main className="container page">
      <div className="page-head">
        <div><h1>내 발주</h1><p>{mine.length}건</p></div>
        <Link to="/company/new" className="btn primary"><Plus size={18} />새 발주</Link>
      </div>

      {mine.length === 0 ? (
        <div className="card">
          <Empty icon={<Briefcase size={24} />} title="아직 발주가 없어요">
            <Link to="/company/new" className="btn primary"><Plus size={16} />첫 발주하기</Link>
          </Empty>
        </div>
      ) : (
        <div className="plist">
          {mine.map((p) => {
            const q = quote(p.roles, pool);
            const team = p.roles.flatMap((r) => r.assigned);
            const apps = applications.filter((a) => a.projectId === p.id && !team.some((t) => t.id === "ME")).length;
            return (
              <Link key={p.id} to={`/company/orders/${p.id}`} className="card link pcard">
                <div className="row between">
                  <StatusPill status={p.status} />
                  <span className="faint small">{p.id}{p.example ? " · 예시" : ""}</span>
                </div>
                <div>
                  <h3>{p.title}</h3>
                  <div className="meta"><span><Clock size={14} />{p.weeks}주</span><span><Users size={14} />{q.people}명</span>{apps > 0 && <span className="chip warn">지원 {apps}</span>}</div>
                </div>
                <div className="foot">
                  <div className="avatars">{team.slice(0, 6).map((a) => <Avatar key={a.id} name={pool.map[a.id]?.name} kind={a.id === "ME" ? "me" : ""} />)}</div>
                  <span className="row" style={{ gap: 4 }}><b className="num">{man(q.contract)}</b><ChevronRight size={18} className="faint" /></span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
