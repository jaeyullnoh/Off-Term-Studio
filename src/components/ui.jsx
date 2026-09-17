import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftRight, Check, ChevronDown } from "lucide-react";
import { useHealth } from "../lib/api.js";
import { useStore } from "../lib/store.jsx";

export function initial(name) {
  if (!name) return "?";
  return name.length >= 3 ? name.slice(1, 2) : name.slice(0, 1);
}

export function Avatar({ name, kind = "", size = "" }) {
  return <div className={`avatar ${kind} ${size}`} aria-hidden="true">{initial(name)}</div>;
}

export function Header() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { setRole } = useStore();
  const health = useHealth();
  const side = pathname.startsWith("/company") ? "company" : pathname.startsWith("/student") ? "student" : null;

  const links = side === "company"
    ? [["/company", "내 발주", true], ["/company/new", "새 발주"]]
    : side === "student"
      ? [["/student", "과제", true], ["/student/applications", "내 지원"], ["/student/profile", "프로필"]]
      : [];

  const swap = () => {
    const to = side === "company" ? "student" : "company";
    setRole(to);
    nav(to === "company" ? "/company" : "/student");
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo"><i />Off-Term Studio</Link>
        {links.length > 0 && (
          <nav className="nav">
            {links.map(([to, label, end]) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "active" : "")}>{label}</NavLink>
            ))}
          </nav>
        )}
        <span className="switch" title={health?.ai ? `AI 연결됨 · ${health.model}` : "AI 미연결 · 규칙 모드"}>
          <span className={`dot ${health?.ai ? "on" : ""}`} />AI
        </span>
        {side && (
          <button className="switch" onClick={swap}>
            <ArrowLeftRight size={14} />{side === "company" ? "학생으로" : "기업으로"}
          </button>
        )}
      </div>
    </header>
  );
}

const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const show = useCallback((text) => setMsg({ text, at: Date.now() }), []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2600);
    return () => clearTimeout(t);
  }, [msg]);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && <div className="toast" role="status"><Check size={16} />{msg.text}</div>}
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

export function Empty({ icon, title, children }) {
  return (
    <div className="empty">
      <div className="ic">{icon}</div>
      <b>{title}</b>
      {children}
    </div>
  );
}

export function Fold({ title, extra, children, open = false }) {
  return (
    <details className="fold" open={open}>
      <summary><span>{title}</span><span className="row">{extra}<ChevronDown size={18} /></span></summary>
      <div className="fold-body">{children}</div>
    </details>
  );
}

const STATUS = { recruiting: "팀 모집 중", active: "제작 중", done: "납품 완료" };
export function StatusPill({ status }) {
  return <span className={`status ${status}`}>{STATUS[status] || status}</span>;
}
export function Timeline({ status }) {
  const order = ["recruiting", "active", "done"];
  const idx = order.indexOf(status);
  return (
    <div className="timeline">
      {order.map((s, i) => (
        <div key={s} className={i <= idx ? "on" : ""}><i />{STATUS[s]}</div>
      ))}
    </div>
  );
}

export function Footer() {
  return <footer className="footer">Off-Term Studio 데모 · 학생·교수·멘토·발주사는 모두 가상 인물입니다</footer>;
}
