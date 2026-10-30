# WorkBrief

A full-stack enterprise AI workflow prototype: Next.js/React/TypeScript review interface, Next.js REST proxy, and Python briefing service. Turns synthetic meeting notes into a summary, assigned actions, and risks, with an explicit human-review step before JSON export. Not affiliated with Revvity; not a healthcare or diagnostic product.

## Local run

Node 22+ and Python 3.12+. No Python dependencies.

```sh
npm ci
python3 backend/service.py
# In another terminal:
npm run dev
```

Visit localhost:3000. The default offline mode extracts only explicitly labelled `Action: Owner | Task` and `Risk:` lines. It is deterministic parsing, NOT an LLM. Notes and outputs are not persisted. No real enterprise systems or confidential data are integrated.

## Tests and evaluation

```sh
python3 -m unittest discover -s backend -v
python3 backend/evaluate.py
npm run build
```

The six-case synthetic benchmark reports exact-match action/risk extraction and latency. It is deliberately tiny and grammar-constrained. It does not measure LLM quality, employee productivity, business KPI gains, or user satisfaction. The provider adapter is tested with mocked responses; no paid/live LLM API calls were made in development.

## Optional LLM integration

Set `BRIEF_MODE=llm`, `LLM_CHAT_URL` (trusted HTTPS chat-completions endpoint), `LLM_MODEL`, and `LLM_API_KEY` in the Python process environment. The provider must support chat completions and JSON response format. The adapter is provider-configurable, not a tested ChatGPT/Claude product integration. Credentials stay server-side; no credentials ship to the browser. Never commit an environment file.

The versioned prompt separates a system instruction from JSON-encoded notes and requests grounded, structured output without invented owners/deadlines. Schema validation rejects malformed results; provider failures do not silently fall back to a fake LLM response. Prompt boundaries and schema checks DO NOT prevent all hallucinations or prompt injection. Human review remains essential. Opting into LLM mode sends the notes to the configured provider; review its privacy and retention terms yourself first.

## Design and business evaluation

- Prototype workflow: capture context -> generate draft -> review -> export. Editing source notes clears stale output and review approval.
- Next.js route validates input and proxies to a configured local Python service with a timeout. Python validates output shape and reports mode, prompt version, and latency.
- UI distinguishes offline extraction from configured LLM output, provides labelled controls, loading/error states, and disabled export until review acknowledgment.
- Next steps for a real pilot: user interviews, task-specific gold datasets, reviewer correction rate, median time to an approved brief, adoption, and user satisfaction. Establish baseline measurements before claiming productivity impact.

## Docker

`docker compose up --build` is provided as a two-service configuration; Docker execution was not validated locally. The Python service is internal to Compose, and the UI port binds to loopback. Do not expose this unauthenticated prototype publicly.

## Limitations / responsible use

Local synthetic-data demo only. No authentication, enterprise SSO, access control, encrypted persistence, rate limiting, durable audit log, or production hardening. Not designed for patient data, PII, confidential business notes, diagnostics, or compliance-sensitive use. It is not HIPAA-certified or an enterprise deployment. The review checkbox is an interface gate, not a governance audit control. Do not claim real user adoption or measured business gains. Code was developed with AI assistance; inspect and understand the implementation before describing your contribution.
