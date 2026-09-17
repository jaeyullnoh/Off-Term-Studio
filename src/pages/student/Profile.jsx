import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ChevronRight, FileText, PenLine, Sparkles, Trash2, Upload } from "lucide-react";
import { MAJORS, ROLE_MAP, SKILLS, bestRoleFor, ruleProfileFromText, won } from "../../lib/engine.js";
import { api, privacyLine, useHealth } from "../../lib/api.js";
import { useStore } from "../../lib/store.jsx";
import { Avatar, useToast } from "../../components/ui.jsx";

const MAX_BYTES = 3 * 1024 * 1024;
const blank = { name: "", major: "기타", year: 3, skills: [], rate: 16000, weeklyHours: 20, portfolio: false, summary: "", highlights: [], suggestedRoles: [] };

function readFile(file, as) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("파일을 읽지 못했어요."));
    as === "text" ? r.readAsText(file) : r.readAsDataURL(file);
  });
}

export default function Profile() {
  const { profile, saveProfile, clearProfile, projects, pool } = useStore();
  const health = useHealth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const fileRef = useRef(null);

  const [mode, setMode] = useState(profile ? "view" : "choose"); // view | choose | analyzing | form
  const [draft, setDraft] = useState(blank);
  const [aiFilled, setAiFilled] = useState(false);
  const [paste, setPaste] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [over, setOver] = useState(false);
  const [error, setError] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);

  async function analyze({ file, text }) {
    setError("");
    try {
      let body = null;
      if (file) {
        if (file.size > MAX_BYTES) throw new Error("3MB 이하 파일만 올릴 수 있어요.");
        const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
        if (isPdf) body = { pdfBase64: String(await readFile(file, "dataurl")).split(",")[1], fileName: file.name };
        else if (/\.(txt|md)$/i.test(file.name) || file.type.startsWith("text/")) body = { text: String(await readFile(file, "text")).slice(0, 8000) };
        else throw new Error("PDF나 TXT 파일을 올려 주세요.");
      } else {
        if (text.trim().length < 20) throw new Error("20자 이상 붙여넣어 주세요.");
        body = { text: text.slice(0, 8000) };
      }

      setMode("analyzing");
      let result;
      if (health?.ai) {
        const d = await api("/api/resume", body);
        result = d.profile;
        setAiFilled(true);
      } else if (body.text) {
        result = ruleProfileFromText(body.text);
        setAiFilled(false);
      } else {
        throw new Error("AI 연결이 없어 PDF를 읽을 수 없어요. 텍스트로 붙여넣어 주세요.");
      }
      const year = result.year || 3;
      setDraft({ ...blank, ...result, year, rate: 13000 + year * 1000 });
      setMode("form");
    } catch (e) {
      setError(e.message);
      setMode("choose");
    }
  }

  function save() {
    if (!draft.name.trim()) { setError("이름을 적어 주세요."); return; }
    if (draft.skills.length === 0) { setError("스킬을 하나 이상 골라 주세요."); return; }
    saveProfile(draft);
    toast("프로필을 저장했어요");
    setMode("view");
    if (loc.state?.back) nav(loc.state.back);
  }

  if (mode === "view" && profile) {
    const recs = projects.filter((p) => p.status === "recruiting")
      .map((p) => ({ p, best: bestRoleFor(profile, p, pool) }))
      .filter((x) => x.best).sort((a, b) => b.best.pct - a.best.pct).slice(0, 3);
    return (
      <main className="container page">
        <div className="page-head"><div><h1>내 프로필</h1><p>기업 발주 때 AI가 이 정보로 팀을 짜요</p></div></div>
        <div className="card pad-lg stack" id="profile-card">
          <div className="row" style={{ gap: 14 }}>
            <Avatar name={profile.name} kind="me" size="lg" />
            <div style={{ flex: 1 }}><b style={{ fontSize: 18 }}>{profile.name}</b><div className="muted small">{profile.major} {profile.year}학년</div></div>
          </div>
          {profile.summary && <p>{profile.summary}</p>}
          <div className="chips">{profile.skills.map((s) => <span className="chip on" key={s}>{s}</span>)}</div>
          {profile.highlights?.length > 0 && <ul className="bullets">{profile.highlights.map((h) => <li key={h}>{h}</li>)}</ul>}
          <div className="chips"><span className="chip">시급 {won(profile.rate)}</span><span className="chip">주 {profile.weeklyHours}시간</span>{profile.portfolio && <span className="chip">포트폴리오</span>}</div>
          <div className="row">
            <button className="btn sm" onClick={() => { setDraft({ ...blank, ...profile }); setAiFilled(false); setMode("form"); }}><PenLine size={14} />수정</button>
            <button className="btn sm" onClick={() => setMode("choose")}><Upload size={14} />이력서 다시</button>
            {confirmDel
              ? <button className="btn sm" style={{ color: "var(--bad)" }} onClick={() => { clearProfile(); setConfirmDel(false); setMode("choose"); }}>정말 삭제</button>
              : <button className="btn ghost sm" onClick={() => setConfirmDel(true)}><Trash2 size={14} />삭제</button>}
          </div>
        </div>

        <span className="section-title">추천 과제</span>
        {recs.length === 0 ? <p className="muted">지금 맞는 과제가 없어요.</p> : (
          <div className="plist">
            {recs.map(({ p, best }) => (
              <Link key={p.id} to={`/student/projects/${p.id}`} className="card link row between">
                <div><b>{p.title}</b><div className="faint small">{p.client} · {ROLE_MAP[best.role.roleId].label}</div></div>
                <span className="row" style={{ gap: 6 }}><span className="match">{best.pct}%</span><ChevronRight size={18} className="faint" /></span>
              </Link>
            ))}
          </div>
        )}
      </main>
    );
  }

  if (mode === "analyzing") {
    return (
      <main className="container page">
        <div className="card loading"><div className="spinner" /><h2 style={{ fontSize: 20 }}>이력서를 읽고 있어요</h2><span className="faint small">10~30초</span></div>
      </main>
    );
  }

  if (mode === "form") {
    const suggested = (draft.suggestedRoles || []).flatMap((id) => ROLE_MAP[id]?.skills || []);
    const ordered = [...new Set([...draft.skills, ...suggested, ...SKILLS])];
    const toggle = (s) => setDraft({ ...draft, skills: draft.skills.includes(s) ? draft.skills.filter((x) => x !== s) : [...draft.skills, s].slice(0, 12) });
    return (
      <main className="container page">
        <div className="page-head"><div><h1>프로필 확인</h1><p>{aiFilled ? "AI가 채웠어요. 틀린 곳만 고쳐 주세요" : "정보를 채워 주세요"}</p></div></div>
        {aiFilled && <div className="banner ai"><Sparkles size={18} /><span>이력서에 근거한 내용만 넣었어요. 연락처 같은 개인정보는 저장하지 않아요.</span></div>}
        <div className="card stack">
          <div className="grid-3">
            <label className="field"><span>이름</span><input id="p-name" className="input" value={draft.name} maxLength={20} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
            <label className="field"><span>전공</span>
              <select id="p-major" className="input" value={draft.major} onChange={(e) => setDraft({ ...draft, major: e.target.value })}>
                {MAJORS.concat(["기타"]).map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
            <label className="field"><span>학년</span>
              <select id="p-year" className="input" value={draft.year} onChange={(e) => setDraft({ ...draft, year: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5].map((y) => <option key={y} value={y}>{y}학년</option>)}
              </select>
            </label>
          </div>
          <label className="field"><span>한 줄 소개</span><input id="p-summary" className="input" value={draft.summary} maxLength={60} placeholder="예: 모션그래픽과 숏폼 편집을 잘해요" onChange={(e) => setDraft({ ...draft, summary: e.target.value })} /></label>
          <div className="field">
            <span>스킬 <span className="faint">{draft.skills.length}/12</span></span>
            <div className="skill-pick">{ordered.map((s) => <button type="button" key={s} className={`chip btnlike ${draft.skills.includes(s) ? "on" : ""}`} onClick={() => toggle(s)}>{s}</button>)}</div>
          </div>
          <div className="grid-3">
            <label className="field"><span>희망 시급</span>
              <select id="p-rate" className="input" value={draft.rate} onChange={(e) => setDraft({ ...draft, rate: Number(e.target.value) })}>
                {[12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 22000, 25000].map((r) => <option key={r} value={r}>{won(r)}</option>)}
              </select>
            </label>
            <label className="field"><span>방학 중 주당</span>
              <select id="p-hours" className="input" value={draft.weeklyHours} onChange={(e) => setDraft({ ...draft, weeklyHours: Number(e.target.value) })}>
                {[10, 15, 20, 25, 30, 40].map((h) => <option key={h} value={h}>{h}시간</option>)}
              </select>
            </label>
            <label className="field"><span>포트폴리오</span>
              <select className="input" value={draft.portfolio ? "y" : "n"} onChange={(e) => setDraft({ ...draft, portfolio: e.target.value === "y" })}>
                <option value="y">있어요</option><option value="n">없어요</option>
              </select>
            </label>
          </div>
          {error && <p className="small" style={{ color: "var(--bad)" }}>{error}</p>}
          <div className="row between">
            <button className="btn ghost" onClick={() => setMode(profile ? "view" : "choose")}>취소</button>
            <button id="p-save" className="btn primary" onClick={save}>저장</button>
          </div>
        </div>
      </main>
    );
  }

  // choose
  return (
    <main className="container page">
      <div className="page-head"><div><h1>프로필 만들기</h1><p>이력서를 올리면 AI가 채워요</p></div></div>
      {error && <div className="banner bad"><AlertTriangle size={18} /><span>{error}</span></div>}
      <div
        className={`drop ${over ? "over" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) analyze({ file: f }); }}
      >
        <div className="ic"><Upload size={24} /></div>
        <b>이력서 올리기</b>
        <span className="muted small">PDF · TXT, 3MB 이하</span>
        <input ref={fileRef} id="resume-file" type="file" accept=".pdf,.txt,.md,application/pdf,text/plain" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) analyze({ file: f }); }} />
      </div>
      <p className="faint small" style={{ textAlign: "center" }}>{health ? privacyLine(health) : ""} · 연락처는 지우고 올려도 돼요</p>

      <div className="grid-2">
        <button className="card link row" style={{ gap: 12, textAlign: "left" }} onClick={() => setShowPaste(!showPaste)}>
          <FileText size={20} className="faint" /><div><b>텍스트로 붙여넣기</b><div className="faint small">노션·링크드인 내용 복사</div></div>
        </button>
        <button className="card link row" style={{ gap: 12, textAlign: "left" }} onClick={() => { setDraft(blank); setAiFilled(false); setError(""); setMode("form"); }}>
          <PenLine size={20} className="faint" /><div><b>직접 입력</b><div className="faint small">1분이면 끝나요</div></div>
        </button>
      </div>

      {showPaste && (
        <div className="card stack">
          <textarea id="resume-text" className="input" value={paste} maxLength={8000} onChange={(e) => setPaste(e.target.value)} placeholder="이력서 내용을 붙여넣어 주세요" />
          <button id="resume-analyze" className="btn primary" onClick={() => analyze({ text: paste })}><Sparkles size={16} />AI로 채우기</button>
        </div>
      )}
      {profile && <button className="btn ghost" onClick={() => setMode("view")}>돌아가기</button>}
    </main>
  );
}
