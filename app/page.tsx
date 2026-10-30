"use client";
import { useState } from "react";
type Brief = {
  summary: string;
  actions: { owner: string; task: string }[];
  risks: string[];
  source: string;
  prompt_version: string;
  latency_ms: number;
};
const sample =
  "The operations team reviewed onboarding delays. Decision: pilot a shared checklist next week.\nAction: Maya | Draft the onboarding checklist by Friday.\nAction: Leo | Review access requirements with IT.\nRisk: Missing approvals may delay the pilot.";
export default function Page() {
  const [notes, setNotes] = useState(sample),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [brief, setBrief] = useState<Brief | null>(null),
    [approved, setApproved] = useState(false);
  async function generate() {
    setBusy(true);
    setError("");
    setApproved(false);
    setBrief(null);
    try {
      const r = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Request failed");
      setBrief(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Service unavailable");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main>
      <p className="eyebrow">WORKBRIEF / ENTERPRISE AI SANDBOX</p>
      <header>
        <h1>
          From meeting notes
          <br />
          to a clear next step.
        </h1>
        <p>A structured brief. Explicit owners. Human judgment.</p>
      </header>
      <aside>
        Use synthetic notes only. Offline extraction is the default; a
        configured LLM sends notes to your chosen provider. No patient,
        employee, confidential, or regulated data.
      </aside>
      <div className="grid">
        <section>
          <h2>01 / Capture context</h2>
          <label htmlFor="notes">Meeting notes</label>
          <textarea
            id="notes"
            maxLength={6000}
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setApproved(false);
              setBrief(null);
            }}
            rows={14}
          />
          <p>{notes.length} / 6,000 characters · No notes are persisted.</p>
          <button disabled={busy || !notes.trim()} onClick={generate}>
            {busy ? "Preparing brief…" : "Generate review draft"}
          </button>
          <p role="status" aria-live="polite">
            {error ||
              (busy
                ? "Waiting for the local briefing service."
                : "Review every draft before using it.")}
          </p>
        </section>
        <section>
          <h2>02 / Review the draft</h2>
          {brief ? (
            <>
              <span className="badge">
                {brief.source} · {brief.prompt_version} ·{" "}
                {brief.latency_ms.toFixed(1)} ms
              </span>
              <h3>Summary</h3>
              <p>{brief.summary}</p>
              <h3>Action items</h3>
              {brief.actions.length ? (
                <ul>
                  {brief.actions.map((a, i) => (
                    <li key={i}>
                      <strong>{a.owner}</strong>: {a.task}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No explicit action items found.</p>
              )}
              <h3>Risks</h3>
              {brief.risks.length ? (
                <ul>
                  {brief.risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              ) : (
                <p>No explicit risks found.</p>
              )}
              <label className="check">
                <input
                  type="checkbox"
                  checked={approved}
                  onChange={(e) => setApproved(e.target.checked)}
                />{" "}
                I checked this draft against the source notes.
              </label>
              <button
                disabled={!approved}
                onClick={() => {
                  const blob = new Blob([JSON.stringify(brief, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "reviewed-brief.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export reviewed JSON
              </button>
            </>
          ) : (
            <p className="empty">
              Your draft will appear here. Offline mode extracts explicitly
              labelled actions and risks—it does not run a language model.
            </p>
          )}
        </section>
      </div>
      <footer>
        Next.js + TypeScript → REST API → Python validation + provider adapter.
        Prototype, not an enterprise deployment.
      </footer>
    </main>
  );
}
