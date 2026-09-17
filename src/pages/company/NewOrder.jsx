import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Ban, Check, ChevronDown, Cpu, Minus, Plus, RefreshCw, Sparkles, Trash2, Wrench } from "lucide-react";
import {
  BUDGETS, EQUIPMENT_MAP, ROLES, ROLE_MAP, isSupportRole, man, pickSupervisors, quote, rankCandidates, ruleBreakdown, ruleMatch, ruleReason, scoreStudent, won,
} from "../../lib/engine.js";
import { api, privacyLine, useHealth } from "../../lib/api.js";
import { busyIds, nextProjectId, useStore } from "../../lib/store.jsx";
import { Avatar, Fold, useToast } from "../../components/ui.jsx";

const EXAMPLES = [
  {
    label: "카페 리브랜딩", client: "카페 누리", budget: "200-300", weeks: "5",
    brief: "성수동 12평 스페셜티 카페입니다. 겨울 시즌에 맞춰 브랜드를 정리하려고 합니다.\n- 로고 다듬기와 간단한 브랜드 가이드\n- 컵 슬리브·스티커 디자인\n- 인스타 릴스 15초 3편 (오전 매장 촬영 가능)\n- 매장 BGM 2곡 (저작권 걱정 없이)",
  },
  {
    label: "인디게임 출시", client: "밤새게임즈", budget: "300-500", weeks: "6",
    brief: "2D 퍼즐 플랫포머를 3월에 스팀에 출시합니다.\n- 60초 트레일러 (플레이 녹화본 제공)\n- 캐릭터 키 비주얼 1장\n- 트레일러 효과음과 짧은 테마곡\n- 상점 소개문 한국어 + 일본어",
  },
  {
    label: "가전 펀딩", client: "한결테크", budget: "300-500", weeks: "4",
    brief: "무선 탁상 가습기 와디즈 펀딩을 준비합니다.\n- 제품 3D 렌더 8컷 (CAD 제공, 컬러 3종)\n- 상세페이지 카피\n- 30초 세로형 모션 영상\n- 알림 신청 랜딩페이지",
  },
];

export default function NewOrder() {
  const nav = useNavigate();
  const toast = useToast();
  const health = useHealth();
  const { projects, pool, profile, addProject } = useStore();

  const [input, setInput] = useState({ brief: "", client: "", budget: "", weeks: "" });
  const [phase, setPhase] = useState("form"); // form | analyzing | matching | proposal | declined
  const [project, setProject] = useState(null);
  const [source, setSource] = useState({});
  const [notice, setNotice] = useState(null);
  const [teamNote, setTeamNote] = useState("");
  const [open, setOpen] = useState(null);
  const [swap, setSwap] = useState(null);
  const [err, setErr] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const runRef = useRef(0);

  useEffect(() => {
    if (phase !== "analyzing" && phase !== "matching") return;
    const t0 = Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 500);
    return () => clearInterval(t);
  }, [phase === "analyzing" || phase === "matching"]); // eslint-disable-line

  const busy = useMemo(() => busyIds(projects), [projects]);
  const ctx = project ? { weeks: project.weeks, busy } : null;

  async function run(forceRule = false) {
    if (input.brief.trim().length < 10) { setErr("10자 이상 적어 주세요."); return; }
    setErr("");
    const id = ++runRef.current;
    const h = health || { ai: false };
    const useAI = !forceRule && h.ai;
    setPhase("analyzing"); setNotice(h.ai || forceRule ? null : "AI 미연결 · 규칙으로 분석했어요"); setTeamNote(""); setOpen(null); setSwap(null);
    const src = { model: h.model };

    let p = null;
    if (useAI) {
      try {
        const d = await api("/api/analyze", input);
        p = d.project; src.analyze = "ai"; src.model = d.meta.model; src.analyzeMs = d.meta.ms;
      } catch (e) {
        setNotice(`AI 분석 실패 · ${e.message} 규칙으로 대신 보여드려요`);
      }
    }
    if (id !== runRef.current) return;
    if (!p) { p = ruleBreakdown(input); src.analyze = "rule"; }
    p.roles.forEach((r) => { r.assigned = []; });
    setSource(src);
    setProject(p);
    if (p.decision === "decline") { setPhase("declined"); return; }

    setPhase("matching");
    let assignments = null;
    if (src.analyze === "ai") {
      try {
        const slim = { title: p.title, summary: p.summary, weeks: p.weeks, roles: p.roles.map(({ key, roleId, count, hours, focus, skills }) => ({ key, roleId, count, hours, focus, skills })) };
        const d = await api("/api/match", { project: slim, busy, profile });
        assignments = d.assignments; src.match = "ai"; src.matchMs = d.meta.ms; setTeamNote(d.teamNote || "");
      } catch (e) {
        setNotice(`AI 매칭 실패 · ${e.message} 점수순으로 배정했어요`);
      }
    }
    if (id !== runRef.current) return;
    if (!assignments) { assignments = ruleMatch(p, { busy }, pool); src.match = "rule"; }
    p.roles.forEach((r) => { r.assigned = (assignments[r.key] || []).filter((a) => pool.map[a.id]).slice(0, r.count); });
    p.roles.forEach((r) => fill(p, r));
    setSource({ ...src });
    setProject({ ...p });
    setPhase("proposal");
  }

  function usedIds(p, except) {
    return p.roles.flatMap((r) => r.assigned.filter((_, i) => !(except && except.key === r.key && except.idx === i)).map((a) => a.id));
  }
  function fill(p, role) {
    const used = usedIds(p);
    for (const c of rankCandidates(role, { weeks: p.weeks, busy }, 40, pool)) {
      if (role.assigned.length >= role.count) break;
      if (used.includes(c.id)) continue;
      role.assigned.push({ id: c.id, reason: ruleReason(c, pool), source: "rule" });
      used.push(c.id);
    }
  }
  function edit(fn) {
    setProject((prev) => { const p = structuredClone(prev); fn(p); return p; });
  }
  const changeCount = (key, d) => edit((p) => {
    const r = p.roles.find((x) => x.key === key);
    r.count = Math.max(1, Math.min(isSupportRole(r.roleId) ? 2 : 4, r.count + d));
    r.assigned = r.assigned.slice(0, r.count);
    fill(p, r);
  });
  const changeHours = (key, d) => edit((p) => { const r = p.roles.find((x) => x.key === key); r.hours = Math.max(2, Math.min(160, r.hours + d)); });
  const removeRole = (key) => edit((p) => { p.roles = p.roles.filter((r) => r.key !== key); });
  const addRole = (roleId) => edit((p) => {
    const n = p.roles.reduce((m, r) => Math.max(m, Number(r.key.slice(1))), 0) + 1;
    const role = { key: "r" + n, roleId, count: 1, hours: 16, focus: ROLE_MAP[roleId].deliverable, skills: [], assigned: [] };
    const ri = p.roles.findIndex((r) => r.roleId === "rights");
    p.roles.splice(ri >= 0 ? ri : p.roles.length, 0, role);
    fill(p, role);
  });
  const pick = (key, idx, sid) => {
    edit((p) => {
      const r = p.roles.find((x) => x.key === key);
      r.assigned[idx] = { id: sid, reason: ruleReason(scoreStudent(pool.map[sid], r, { weeks: p.weeks, busy }), pool), source: "human" };
    });
    setSwap(null);
  };

  function submit() {
    const id = nextProjectId(projects);
    const final = {
      ...project, id, client: input.client.trim() || "우리 회사", budget: input.budget, status: "recruiting", mine: true, example: false,
      source: source.analyze === "ai" ? "ai" : "rule", sourceDetail: source, teamNote, createdAt: new Date().toISOString(),
    };
    Object.assign(final, pickSupervisors(final));
    addProject(final);
    toast("발주했어요");
    nav(`/company/orders/${id}`);
  }

  // ─── 화면 ───
  if (phase === "form") {
    return (
      <main className="container page">
        <div className="page-head"><div><h1>새 발주</h1><p>브리프만 적으면 팀과 견적을 만들어요</p></div></div>
        <div className="steps"><i className="on" /><i /><i /></div>
        <div className="card stack">
          <div className="row between">
            <span className="section-title">예시로 채우기</span>
          </div>
          <div className="examples">
            {EXAMPLES.map((ex) => (
              <button key={ex.label} className="chip btnlike" onClick={() => setInput({ brief: ex.brief, client: ex.client, budget: ex.budget, weeks: ex.weeks })}>{ex.label}</button>
            ))}
          </div>
          <label className="field">
            <span>무엇을 만들까요?</span>
            <textarea id="brief" className="input" maxLength={3000} value={input.brief} onChange={(e) => setInput({ ...input, brief: e.target.value })} placeholder="메일이나 기획서 내용을 그대로 붙여넣어도 돼요" />
          </label>
          <div className="grid-3">
            <label className="field"><span>회사명</span><input id="client" className="input" value={input.client} maxLength={40} onChange={(e) => setInput({ ...input, client: e.target.value })} placeholder="선택" /></label>
            <label className="field"><span>예산</span>
              <select id="budget" className="input" value={input.budget} onChange={(e) => setInput({ ...input, budget: e.target.value })}>
                {BUDGETS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
            </label>
            <label className="field"><span>기간</span>
              <select id="weeks" className="input" value={input.weeks} onChange={(e) => setInput({ ...input, weeks: e.target.value })}>
                <option value="">AI가 판단</option>
                {[2, 3, 4, 5, 6, 8].map((w) => <option key={w} value={w}>{w}주</option>)}
              </select>
            </label>
          </div>
          {err && <p className="small" style={{ color: "var(--bad)" }}>{err}</p>}
          <button id="analyze" className="btn primary lg block" onClick={() => run(false)} disabled={!health}><Sparkles size={18} />팀·견적 받기</button>
          <p className="faint small" style={{ textAlign: "center" }}>{health ? privacyLine(health) : "AI 연결 확인 중…"}</p>
        </div>
      </main>
    );
  }

  if (phase === "analyzing" || (phase === "matching" && !project)) {
    return <Loading step={1} elapsed={elapsed} ai={health?.ai} />;
  }
  if (phase === "matching") return <Loading step={2} elapsed={elapsed} ai={health?.ai} project={project} />;

  if (phase === "declined") {
    return (
      <main className="container page">
        <div className="card pad-lg stack">
          <div className="row"><span className="chip bad"><Ban size={14} />맡을 수 없는 과제</span>{source.analyze === "ai" ? <span className="chip ai">AI 판단</span> : <span className="chip">규칙 판단</span>}</div>
          <h1 style={{ fontSize: 22 }}>{project.title}</h1>
          <p className="muted">{project.decisionReason}</p>
          {project.questions.length > 0 && (
            <div className="stack" style={{ gap: 6 }}>
              <span className="section-title">확인이 필요해요</span>
              <ul className="bullets">{project.questions.map((q) => <li key={q}>{q}</li>)}</ul>
            </div>
          )}
          <div className="row"><button className="btn" onClick={() => setPhase("form")}><ArrowLeft size={16} />브리프 고치기</button></div>
        </div>
      </main>
    );
  }

  // proposal
  const q = quote(project.roles, pool);
  const capMan = { under100: 100, "100-200": 200, "200-300": 300, "300-500": 500 }[input.budget];
  const over = capMan ? q.contract - capMan * 10000 : null;
  const missing = ROLES.filter((r) => !project.roles.some((x) => x.roleId === r.id));

  return (
    <main className="container page">
      <div className="row between">
        <button className="btn ghost sm" onClick={() => setPhase("form")}><ArrowLeft size={16} />브리프</button>
        <div className="steps" style={{ width: 120 }}><i className="on" /><i className="on" /><i /></div>
      </div>

      {notice && <div className="banner warn"><AlertTriangle size={18} /><span>{notice}</span></div>}

      <div className="card pad-lg stack">
        <div className="row">
          {source.analyze === "ai" ? <span className="chip ai"><Sparkles size={13} />AI 제안</span> : <span className="chip">규칙 제안</span>}
          {project.decision === "conditional" && <span className="chip warn">조건부</span>}
        </div>
        <h1 style={{ fontSize: 24 }}>{project.title}</h1>
        {project.summary && <p className="muted">{project.summary}</p>}
        <div className="row between" style={{ alignItems: "flex-end" }}>
          <div className="price"><small>예상 계약금</small><strong className="num" id="contract">{man(q.contract)}</strong></div>
          <div className="chips">
            <span className="chip">{project.weeks}주</span>
            <span className="chip">{q.people}명</span>
            {over != null && (over <= 0 ? <span className="chip good">예산 안</span> : <span className="chip bad">예산 +{man(over)}</span>)}
          </div>
        </div>
        {project.decision === "conditional" && project.decisionReason && <div className="banner warn"><AlertTriangle size={18} /><span>{project.decisionReason}</span></div>}
        {project.budgetFit?.note && (
          <div className={`banner ${project.budgetFit.status === "over" ? "bad" : "good"}`}><Wrench size={18} /><span>{project.budgetFit.note}</span></div>
        )}
        {teamNote && <div className="banner ai"><Sparkles size={18} /><span>{teamNote}</span></div>}
        {project.equipment?.length > 0 && (
          <div className="row small"><span className="faint">교내 장비</span>{project.equipment.map((e) => <span key={e} className="chip">{EQUIPMENT_MAP[e]?.label}</span>)}</div>
        )}
        <WhoDid source={source} fit={project.budgetFit} />
      </div>

      <div className="stack">
        <div className="row between">
          <span className="section-title">팀 <span className="faint">누르면 조정</span></span>
          {missing.length > 0 && (
            <select className="input" style={{ width: "auto", padding: "8px 12px", fontSize: 14 }} value="" onChange={(e) => e.target.value && addRole(e.target.value)} aria-label="역할 추가">
              <option value="">+ 역할</option>
              {missing.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          )}
        </div>

        {project.roles.map((role) => {
          const line = q.lines.find((l) => l.key === role.key);
          const def = ROLE_MAP[role.roleId];
          const isOpen = open === role.key;
          return (
            <div className="role" key={role.key}>
              <button className="role-head" onClick={() => { setOpen(isOpen ? null : role.key); setSwap(null); }} aria-expanded={isOpen}>
                <div className="avatars">{role.assigned.map((a) => <Avatar key={a.id} name={pool.map[a.id]?.name} kind={a.id === "ME" ? "me" : ""} />)}</div>
                <div className="title">
                  <b>{def.label}</b>
                  <div>{role.assigned.map((a) => pool.map[a.id]?.name).join(", ")} · {role.count}명 × {role.hours}h</div>
                </div>
                <div className="sum num">{man(line.subtotal)}</div>
                <ChevronDown size={18} className="faint" style={{ transform: isOpen ? "rotate(180deg)" : "none" }} />
              </button>
              {isOpen && (
                <div className="role-body">
                  {role.assigned.map((a, idx) => {
                    const s = pool.map[a.id];
                    const swapping = swap && swap.key === role.key && swap.idx === idx;
                    return (
                      <div key={a.id} className="stack" style={{ gap: 8 }}>
                        <div className="member">
                          <Avatar name={s.name} kind={a.id === "ME" ? "me" : ""} />
                          <div className="who">
                            <b>{s.name}</b> <span className="faint small">{s.major} {s.year}학년 · {won(s.rate)}/h</span>
                            <div className="why">
                              <span className={`chip ${a.source === "ai" ? "ai" : a.source === "human" ? "good" : ""}`}>{a.source === "ai" ? "AI" : a.source === "human" ? "직접" : "점수"}</span>
                              <span>{a.reason}</span>
                            </div>
                          </div>
                          <button className="btn sm" onClick={() => setSwap(swapping ? null : { key: role.key, idx })}><RefreshCw size={14} />교체</button>
                        </div>
                        {swapping && (
                          <div className="alts">
                            {rankCandidates(role, ctx, 40, pool).filter((c) => !usedIds(project, { key: role.key, idx }).includes(c.id) && c.id !== a.id).slice(0, 4).map((c) => (
                              <button key={c.id} className="alt" onClick={() => pick(role.key, idx, c.id)}>
                                <Avatar name={pool.map[c.id].name} kind={c.id === "ME" ? "me" : ""} />
                                <div><b>{pool.map[c.id].name}</b> · {ruleReason(c, pool)}</div>
                                <span className="faint small num">{c.score}점</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="controls">
                    <div className="stepper"><span>인원</span>
                      <button className="icon-btn" aria-label="인원 줄이기" disabled={role.count <= 1} onClick={() => changeCount(role.key, -1)}><Minus size={14} /></button>
                      <b className="num">{role.count}명</b>
                      <button className="icon-btn" aria-label="인원 늘리기" disabled={role.count >= (isSupportRole(role.roleId) ? 2 : 4)} onClick={() => changeCount(role.key, 1)}><Plus size={14} /></button>
                    </div>
                    <div className="stepper"><span>시간</span>
                      <button className="icon-btn" aria-label="시간 줄이기" disabled={role.hours <= 2} onClick={() => changeHours(role.key, -2)}><Minus size={14} /></button>
                      <b className="num">{role.hours}h</b>
                      <button className="icon-btn" aria-label="시간 늘리기" onClick={() => changeHours(role.key, 2)}><Plus size={14} /></button>
                    </div>
                    {!isSupportRole(role.roleId) && <button className="btn ghost sm" onClick={() => removeRole(role.key)}><Trash2 size={14} />역할 빼기</button>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Fold title="견적 근거" extra={<span className="faint small num">{man(q.contract)}</span>}>
        {q.lines.map((l) => (
          <div className="qrow" key={l.key}><span>{l.label} <span className="faint">{l.count}명 × {l.hours}h</span></span><span className="num">{won(l.subtotal)}</span></div>
        ))}
        <div className="qrow"><span>학생 페이 합계</span><span className="num">{won(q.pay)}</span></div>
        <div className="qrow"><span className="faint">÷ 60% (라이선스·감수 10%, 운영 30%)</span><span /></div>
        <div className="qrow total"><span>계약금</span><span className="num">{won(q.contract)}</span></div>
      </Fold>

      {(project.risks.length > 0 || project.questions.length > 0) && (
        <Fold title="확인할 것" extra={<span className="faint small">{project.risks.length + project.questions.length}</span>}>
          {project.risks.length > 0 && <ul className="bullets">{project.risks.map((r) => <li key={r}>{r}</li>)}</ul>}
          {project.questions.length > 0 && <ul className="bullets">{project.questions.map((r) => <li key={r}>{r}</li>)}</ul>}
        </Fold>
      )}

      <div className="sticky-cta">
        <div className="container">
          <div><div className="faint small">{project.roles.length}개 역할 · {q.people}명</div><b className="num">{man(q.contract)}</b></div>
          <button id="submit" className="btn primary lg" onClick={submit}><Check size={18} />발주하기</button>
        </div>
      </div>
    </main>
  );
}

export function WhoDid({ source, fit }) {
  if (!source) return null;
  const sec = (ms) => (ms >= 1000 ? ` ${Math.round(ms / 1000)}초` : "");
  return (
    <div className="row small" style={{ gap: 6 }}>
      <Cpu size={14} className="faint" />
      <span className={`chip ${source.analyze === "ai" ? "ai" : ""}`}>{source.analyze === "ai" ? "AI" : "규칙"} 과제 분석{sec(source.analyzeMs)}</span>
      <span className={`chip ${source.match === "ai" ? "ai" : ""}`}>{source.match === "ai" ? "AI" : "점수"} 팀 선택{sec(source.matchMs)}</span>
      {fit?.status === "scaled" && <span className="chip">코드 예산 보정</span>}
    </div>
  );
}

function Loading({ step, elapsed, ai, project }) {
  const items = ["과제 나누기", "팀 고르기", "견적 계산"];
  return (
    <main className="container page">
      <div className="card loading">
        <div className="spinner" />
        <h2 style={{ fontSize: 20 }}>{ai ? "AI PM이 보고 있어요" : "분석 중이에요"}</h2>
        <ol>
          {items.map((t, i) => (
            <li key={t} className={i + 1 < step ? "done" : i + 1 === step ? "on" : ""}>{i + 1 < step ? <Check size={16} /> : <span style={{ width: 16 }}>{i + 1}</span>}{t}</li>
          ))}
        </ol>
        {project && (
          <div className="stack" style={{ gap: 8, justifyItems: "center" }}>
            <b>{project.title}</b>
            <div className="chips" style={{ justifyContent: "center" }}>{project.roles.map((r) => <span key={r.key} className="chip on">{ROLE_MAP[r.roleId].short} {r.count}명</span>)}</div>
          </div>
        )}
        <span className="faint small num">{elapsed}초</span>
      </div>
    </main>
  );
}
