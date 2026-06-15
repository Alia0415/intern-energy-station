# Intern Energy Station · Onboarding Growth Dashboard

> 🌐 **Live demo**: https://intern-ai-hr-d9g2t0q9c36bb1a6a-1443398117.ap-shanghai.app.tcloudbase.com/
> 📖 **中文说明**：[README.md](README.md)
> (Deployed on Tencent CloudBase Run — frontend and backend API served by the same service.)

An onboarding growth workspace for three roles — **Intern / Mentor / HR** — with a built-in rule-base RAG assistant named **Penguin** (retrieval-augmented Q&A over a team rule base, powered by DeepSeek).

Stack: **Vite + React 18** (frontend) + **Node / Express** (backend). **A single Node process serves both the static frontend and the `/api` endpoints**, so one deployment ships the API too.

---

## Live access

- Web: open the live link above, pick a role, then use the **Penguin** assistant at the bottom-right.
- Health check: append `/api/health` to the link — `{"ok":true,"hasKey":true,"model":"deepseek-chat"}` means the backend is up and the key is loaded.
- Free tier: the service sleeps after long inactivity; the first open takes ~30–60s to wake, then it's fast.

---

## Screenshots

**Role selection**
![Role selection](screenshots/login.png)
> Pick one of three roles — Intern / Mentor / HR — to enter a dedicated growth workspace.

**Intern workbench**
![Intern workbench](screenshots/intern.png)
> Daily/weekly report history with per-day completions, blockers, and mentor feedback; the "Penguin" Q&A assistant sits at the bottom-right.

**Mentor workbench**
![Mentor workbench](screenshots/mentor.png)
> Intern list + details + AI mentoring assistant (talking points / task breakdown / 1:1 outline) + quick feedback.

**HR dashboard**
![HR dashboard](screenshots/hr-current.png)
> KPI cards, role-distribution and learning-progress charts, an AI weekly growth summary, and auto-categorized common issues.

**Penguin · rule-base Q&A (RAG)**
![Penguin Q&A](screenshots/ai-answer.png)
> Answers strictly from the team rule base, citing which rules were used.

**Smart task breakdown**
![Task breakdown](screenshots/breakdown-result.png)
> Splits a vague task into actionable subtasks with estimated duration, suggested timing, and priority — added to the to-do list in one click.

**Weekly report draft**
![Weekly report](screenshots/weekly-edit.png)
> Auto-aggregated from the week's daily logs into an editable weekly draft, ready to save or submit to the mentor.

---

## Local development

```bash
npm install
npm run dev:all      # frontend (5173) + backend (8787) together
```
Open http://localhost:5173 . Running only `npm run dev` is fine — AI features fall back locally without errors.

Preview locally in "production mode" (same as live, single port):
```bash
npm run prod         # = vite build, then node server/index.js → open http://localhost:8787
```

---

## DeepSeek key

The key is **read only on the backend**; it never appears in frontend code or the build output.

- **Local**: copy `.env.example` to `.env.local` and set `DEEPSEEK_API_KEY=sk-your-key`. `.env.local` is gitignored and never committed.
- **Production (Tencent Cloud)**: do not put it in code — set it as the CloudBase Run **environment variable** `DEEPSEEK_API_KEY`.

---

## Penguin RAG (core)

Answers only from the team rule base — not a generic chatbot. Trusted retrieval flow:

```
Frontend: local searchKnowledgeBase only pre-checks for "no_match"
   → POST /api/penguin-chat { role, question }          // frontend sends only role + question
Backend: matchedDocs = searchKnowledgeBase(question, role)  // sole source of truth; ignores any rules sent by the client
   → no match    → "no_match", DeepSeek not called
   → 2-3 hits    → builds a "answer ONLY from these rules" prompt → DeepSeek → kind:"api"
   → call fails / no key → kind:"fallback" (local summary from the rules) + references
Returns: { kind, answer, references:[{id,title,content}] }
```

- Rule base: `services/knowledgeBase.js` (**16 rules**, shared by frontend and backend, fields `id/title/roles/tags/content`).
- The three workspaces are **independent**: each role's conversation history is bucketed and persisted, so the Mentor view never shows the Intern's questions, and switching back to Intern restores its own history.
- Each answer carries **reference-rule** tags; clicking one expands the rule's original text for side-by-side verification.

---

## Deploy to Tencent CloudBase Run

This project is already live this way. CloudBase Run starts from a **Docker image** (the root `Dockerfile` builds the frontend and starts Node to serve both `dist` and `/api`).

### Deploy / update steps

1. Build a clean package (only Git-tracked files; `node_modules` / `dist` / `.env.local` auto-excluded):
   ```bash
   git archive --format=zip -o deploy.zip HEAD
   ```
2. Tencent Cloud Console → **CloudBase** → pick an environment → **CloudBase Run → Services → New Service**.
3. "New local-code deployment":
   - Package type: **Zip**, upload `deploy.zip`
   - Service name: starts with a lowercase letter (e.g. `intern-ai-hr`)
   - **Service port: `8787`** (must match the port in the `Dockerfile`)
   - Build: **Dockerfile** (default; file named `Dockerfile`)
   - **Environment variable: `DEEPSEEK_API_KEY` = your key**
4. Deploy, wait for the version status to become **"Normal"**, then open the **default domain** assigned by CloudBase Run (the live link above).

> To update later: change code → `git commit` → re-run `git archive --format=zip -o deploy.zip HEAD` → upload the new zip as a new version.
> You can also switch the source to the GitHub repo for push-to-deploy.

Source repo: https://github.com/Alia0415/intern-energy-station

---

## API reference (server/index.js)

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check / whether the key is loaded |
| POST | `/api/penguin-chat` | Penguin RAG (backend retrieves the rule base → answers only from rules) |
| POST | `/api/ai/task-breakdown` | Task breakdown (DeepSeek) |
| POST | `/api/ai/weekly-report` | Weekly report (DeepSeek) |
| other GET | `/*` | Serves the built `index.html` (SPA) |

---

## Project layout (key files)

```
Dockerfile / .dockerignore   CloudBase Run container build (one image: build frontend + run backend)
index.html                   Entry (#root main app + #penguin-root Penguin overlay)
main.jsx / globals.js        Entry + global shim (keeps the original "global script" style working)
app/components/intern/mentor/hr/report.jsx, data.js, styles.css   the three-role workspaces
penguin.jsx                  Penguin RAG panel (a separate, second React root)
services/
  knowledgeBase.js           16-rule base + searchKnowledgeBase + fallback (shared by FE/BE)
  aiService.js               task-breakdown / weekly-report wrapper (USE_MOCK_AI=false → backend DeepSeek)
  storageService.js          localStorage wrapper
server/index.js              Backend: /api/* + serves the dist static build in production
.env.example                 Env template (copy to .env.local for the key; use CloudBase env vars in production)
```

> The single-file prototype `实习能量站.html` is kept for reference; Vite does not use it.

---

## Security notes

- `.env.local` (with the DeepSeek key) is gitignored and excluded from the deploy image; in production the key lives only in the CloudBase Run environment variable.
- The build output `dist/` contains no key and no DeepSeek URL; the frontend only calls the same-origin `/api/*` and never the model API directly.
