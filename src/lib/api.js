import { useEffect, useState } from "react";

export async function api(path, body, timeoutMs = 58000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(path, {
      method: body ? "POST" : "GET",
      headers: body ? { "content-type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      signal: ctl.signal,
    });
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { /* HTML 응답 등 */ }
    if (!res.ok || !data) {
      const err = new Error(
        data?.message || (res.status === 429 ? "요청이 많아요. 1분 뒤 다시 시도해 주세요." : res.status === 404 ? "API가 배포되지 않았어요." : `서버 오류 (${res.status})`)
      );
      err.code = data?.error || `http_${res.status}`;
      throw err;
    }
    return data;
  } catch (e) {
    if (e.name === "AbortError") { const x = new Error("AI 응답이 늦어요. 다시 시도해 주세요."); x.code = "timeout"; throw x; }
    if (!e.code) { e.code = "network"; e.message = "서버에 연결하지 못했어요."; }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// AI 연결 상태 (페이지 전체에서 한 번만 확인)
let healthPromise = null;
export function getHealth() {
  if (!healthPromise) {
    healthPromise = location.protocol === "file:"
      ? Promise.resolve({ ai: false, provider: null, model: null, offline: true })
      : api("/api/health", null, 6000).catch(() => ({ ai: false, provider: null, model: null, offline: true }));
  }
  return healthPromise;
}
export function useHealth() {
  const [health, setHealth] = useState(null);
  useEffect(() => { let alive = true; getHealth().then((h) => alive && setHealth(h)); return () => { alive = false; }; }, []);
  return health;
}
export function privacyLine(health) {
  if (!health?.ai) return "AI 없이 규칙으로 분석해요";
  return health.provider === "gemini" ? "저장 안 함 · Gemini 무료 티어로 전송(구글 개선에 쓰일 수 있음)" : "저장 안 함 · 분석에만 Claude로 전송";
}
