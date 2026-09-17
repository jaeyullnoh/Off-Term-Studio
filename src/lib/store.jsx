import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buildPool, sanitizeProfile } from "./engine.js";
import { seedProjects } from "./seed.js";

const KEY = "ots.v2";
const StoreCtx = createContext(null);

function fresh(role = null) {
  return { role, projects: seedProjects(), profile: null, applications: [] };
}
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || "null");
    if (d && Array.isArray(d.projects)) return d;
  } catch { /* 저장소 사용 불가 */ }
  return fresh();
}
function withoutMe(project) {
  const p = structuredClone(project);
  p.roles.forEach((r) => {
    const before = r.assigned.length;
    r.assigned = r.assigned.filter((a) => a.id !== "ME");
    if (r.assigned.length < before && r.count > 1) r.count -= 1;
  });
  return p;
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* 무시 */ }
  }, [state]);

  const pool = useMemo(() => buildPool(state.profile), [state.profile]);

  const actions = useMemo(() => ({
    setRole: (role) => setState((s) => ({ ...s, role })),
    addProject: (p) => setState((s) => ({ ...s, projects: [p, ...s.projects] })),
    updateProject: (id, fn) => setState((s) => ({ ...s, projects: s.projects.map((p) => (p.id === id ? fn(structuredClone(p)) : p)) })),
    removeProject: (id) => setState((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== id), applications: s.applications.filter((a) => a.projectId !== id) })),
    saveProfile: (raw) => setState((s) => ({ ...s, profile: sanitizeProfile(raw) })),
    clearProfile: () => setState((s) => ({ ...s, profile: null, applications: [], projects: s.projects.map(withoutMe) })),
    apply: (projectId, roleKey) =>
      setState((s) => (s.applications.some((a) => a.projectId === projectId) ? s : { ...s, applications: [{ id: "A" + Date.now(), projectId, roleKey, at: new Date().toISOString() }, ...s.applications] })),
    cancelApplication: (projectId) =>
      setState((s) => ({ ...s, applications: s.applications.filter((a) => a.projectId !== projectId), projects: s.projects.map((p) => (p.id === projectId ? withoutMe(p) : p)) })),
    reset: () => setState((s) => fresh(s.role)),
  }), []);

  const value = useMemo(() => ({ ...state, pool, ...actions }), [state, pool, actions]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);

export function nextProjectId(projects) {
  const max = projects.reduce((m, p) => Math.max(m, Number((p.id.match(/(\d+)$/) || [])[1]) || 0), 0);
  return "OTS-" + String(max + 1).padStart(3, "0");
}

// 진행 중(모집 중 포함) 과제에 이미 들어간 학생 → 새 매칭에서 감점
export function busyIds(projects) {
  const ids = new Set();
  projects.forEach((p) => { if (p.status !== "done") p.roles.forEach((r) => r.assigned.forEach((a) => ids.add(a.id))); });
  return [...ids];
}

export function applicationStatus(app, project) {
  if (!project) return { label: "삭제됨", tone: "muted" };
  const inTeam = project.roles.some((r) => r.assigned.some((a) => a.id === "ME"));
  if (inTeam) return { label: "팀 합류", tone: "good" };
  if (project.status !== "recruiting") return { label: "마감", tone: "muted" };
  return { label: "검토 중", tone: "warn" };
}
