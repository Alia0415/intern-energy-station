/* ============ 日报 / 周报 · 记录完成与卡点，复盘沉淀成长证据 ============ */

const REPORT_GEN = {
  highlight: { title: "工作亮点 · 智能草稿", body: "• 独立完成实习看板首页埋点联调，从依赖指导到端到端交付；\n• 主动沉淀学习笔记，开始用「事实-分析-结论」结构表达；\n• 遇到卡点能清晰记录现象，具备良好的问题意识。" },
  mentor: { title: "导师版总结 · 智能草稿", body: "林之遥今日表现稳定：独立完成埋点联调并提交评审，质量意识在线。卡点集中在「灰度发布环境权限未打通」，属流程性而非能力问题。建议：带看一次完整发布、明确对接人清单即可快速补齐。整体处于「适应与融入」阶段的健康节奏。" },
};

// 把一段文本按换行/分号/句号拆成条目（日报提交时用于统计与列表化）
function splitLines(t) { return String(t || "").split(/[\n；;。]+/).map((s) => s.trim()).filter(Boolean); }

/* ---------- 日报填写 ---------- */
function DailyTab() {
  const D = window.APP_DATA;
  const [daily, setDaily] = usePersist("ies3_daily2", D.daily);
  const [todos, setTodos] = usePersist("ies6_todos", D.todos);
  const [gen, setGen] = useState(null);
  const [genLoading, setGenLoading] = useState(null);
  const [planAdded, setPlanAdded] = usePersist("ies3_planAdded", {});
  const [submitted, setSubmitted] = usePersist("ies_dailyReports", []); // 真实提交的日报历史

  const moods = [{ k: "轻松", c: "#00924C" }, { k: "还不错", c: "#0052D9" }, { k: "有点累", c: "#D9700B" }, { k: "压力有点大", c: "#D54941" }];
  const fields = [
    { key: "done", label: "今日完成", ph: "例如：完成了需求梳理，和导师确认了埋点方案，输出了第一版页面草图" },
    { key: "gain", label: "今日小收获", ph: "例如：理清了埋点上报的完整链路，也学会用「事实-分析-结论」结构写笔记" },
    { key: "blocker", label: "遇到的卡点", ph: "例如：灰度发布环境权限未打通，定位问题花了较多时间" },
    { key: "help", label: "需要导师帮助的地方", ph: "例如：希望能带看一次完整的灰度发布流程，需求验收标准也希望更明确一些" },
  ];
  function set(k, v) { setDaily(d => ({ ...d, [k]: v })); }
  function setPlan(i, k, v) { setDaily(d => ({ ...d, plan: d.plan.map((p, j) => j === i ? { ...p, [k]: v } : p) })); }
  function addPlanRow() { setDaily(d => ({ ...d, plan: [...d.plan, { name: "", estimate: "", source: "日报生成", acceptance: "" }] })); }
  function delPlanRow(i) { setDaily(d => ({ ...d, plan: d.plan.filter((_, j) => j !== i) })); }

  function planToTodo(p, i) {
    if (!p.name.trim()) { window.toast("请先填写计划内容", "给明日计划起个清晰的名字，才能转成待办。", "alert"); return; }
    const key = p.name.trim();
    if (planAdded[key]) { window.toast("已在待办中", "这条明日计划已经同步到待办了。", "list"); return; }
    setTodos(ts => [{ id: "d" + Date.now() + i, name: key, source: "日报生成", sourceRef: `来自 ${daily.date} 日报 · 明日计划`, acceptance: p.acceptance.trim() || "（待补充验收标准）", estimate: p.estimate.trim() || "未估时", status: "todo", week: "this" }, ...ts]);
    setPlanAdded(m => ({ ...m, [key]: true }));
    window.toast("已同步到今日待办", `「${key}」已转为次日待办，出现在首页「今日待办 / 本周待办」。`);
  }
  async function runGen(kind) {
    setGenLoading(kind); setGen(null);
    try {
      const res = await window.aiService.requestDailyDraft(kind, daily);
      setGen(res && res.body ? { ...res, kind } : { ...REPORT_GEN[kind], kind });
    } catch (e) {
      setGen({ ...REPORT_GEN[kind], kind }); // 调用失败兜底到本地草稿，页面不报错
    } finally {
      setGenLoading(null);
    }
  }

  // 「采用」：把生成的亮点 / 导师版总结真正存到本条日报，随提交进入历史
  function adopt(kind, body) {
    setDaily((d) => ({ ...d, [kind === "mentor" ? "mentorSummary" : "highlight"]: body }));
    setGen(null);
    window.toast("已采用", "已附到本条日报，提交后可在「历史记录」中查看。", "check");
  }

  // 「提交日报」：把当天日报真正写入历史（同一天覆盖，避免重复）
  function submitDaily() {
    const filled = [daily.done, daily.gain, daily.blocker, daily.help].some((x) => x && x.trim());
    if (!filled) { window.toast("日报还是空的", "先填写今日完成 / 收获 / 卡点等内容，再提交。", "alert"); return; }
    const doneList = splitLines(daily.done);
    const rec = {
      id: "d" + Date.now(),
      date: daily.date || "今日",
      done: doneList.length,
      undone: 0,
      blockers: daily.blocker && daily.blocker.trim() ? 1 : 0,
      feedback: "未反馈",
      linkedTodos: 0,
      detail: {
        mood: daily.mood || "",
        doneList: doneList.length ? doneList : ["（未填写）"],
        gain: daily.gain || "",
        blocker: daily.blocker || "",
        help: daily.help || "",
        mentorFeedback: "",
        todos: [],
        highlight: daily.highlight || "",
        mentorSummary: daily.mentorSummary || "",
      },
    };
    setSubmitted((list) => [rec, ...list.filter((r) => r.date !== rec.date)]);
    window.toast("日报已提交", "今日日报已保存到「历史记录 · 日报记录」，可随时回看。", "send");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 今日状态 */}
      <div>
        <div className="field-label">今日状态 <span style={{ fontWeight: 400, color: "var(--t3)", marginLeft: 2 }}>· 记录真实感受即可，不用于评判</span></div>
        <div className="mood-row">
          {moods.map(m => (
            <button key={m.k} className={`mood-chip ${daily.mood === m.k ? "on" : ""}`} onClick={() => set("mood", m.k)}>
              <span className="dot" style={{ background: daily.mood === m.k ? "var(--blue)" : m.c }} />{m.k}
            </button>
          ))}
        </div>
      </div>

      {/* 四宫格 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {fields.map(f => (
          <div key={f.key}>
            <div className="field-label">{f.label}</div>
            <textarea className="field" style={{ minHeight: 76 }} value={daily[f.key]} placeholder={f.ph} onChange={e => set(f.key, e.target.value)} />
          </div>
        ))}
      </div>

      <div className="divider" />

      {/* 底部按钮 */}
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => window.toast("草稿已保存", "日报草稿已保存，刷新页面也会保留。")}><Icon name="check" size={13} />保存草稿</button>
        <button className="btn btn-soft btn-sm" onClick={() => runGen("highlight")} disabled={!!genLoading}><Icon name="light" size={13} />提炼工作亮点</button>
        <button className="btn btn-soft btn-sm" onClick={() => runGen("mentor")} disabled={!!genLoading}><Icon name="mentor" size={13} />生成导师版总结</button>
        <button className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }} onClick={submitDaily}><Icon name="send" size={13} />提交日报</button>
      </div>

      {/* 生成结果（仅点击后出现） */}
      {(genLoading || gen) && (
        <div className="card card-pad" style={{ background: "var(--surface-2)" }}>
          {genLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--blue)", fontSize: 13 }}>
              <span className="typing"><span></span><span></span><span></span></span> 正在基于你的日报整理…
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                <span className="chip chip-blue">智能草稿</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>{gen.title}</span>
                <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => adopt(gen.kind, gen.body)}>采用</button>
                <button className="icon-btn" style={{ width: 30, height: 30, border: "none", background: "transparent" }} onClick={() => setGen(null)}><Icon name="x" size={14} /></button>
              </div>
              <div className="bubble bubble-ai" style={{ maxWidth: "100%" }}>{gen.body}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- 周报生成（根据本周日报，经 AI 服务整理；当前为本地 mock） ---------- */
function wkDayNum(str) { const m = (str || "").match(/(\d+)月(\d+)日/); return m ? +m[2] : null; }
const WR_FIELDS = [
  { key: "summary", label: "本周总结", multi: false },
  { key: "completedWork", label: "本周完成工作", multi: true },
  { key: "keyResults", label: "关键成果", multi: true },
  { key: "problems", label: "遇到的问题", multi: true },
  { key: "solutions", label: "解决方式", multi: true },
  { key: "learning", label: "本周收获", multi: true },
  { key: "nextWeekPlan", label: "下周计划", multi: true },
  { key: "needMentorHelp", label: "需要导师帮助的问题", multi: true },
];
const pad2 = (n) => String(n).padStart(2, "0");

function WeeklyTab() {
  const D = window.APP_DATA;
  const [daily] = usePersist("ies3_daily2", D.daily);
  const [reports, setReports] = usePersist("ies_weeklyReports", []);
  const [draft, setDraft] = useState(null);   // 当前周报草稿对象（生成或编辑中）
  const [draftId, setDraftId] = useState(null); // 非空表示在编辑某条已保存周报
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [delId, setDelId] = useState(null);

  // 本周日期范围
  const rangeDays = [...(D.weekly.range || "6月9日 — 6月15日").matchAll(/(\d+)月(\d+)日/g)].map(m => ({ mo: +m[1], d: +m[2] }));
  const ws = rangeDays[0] || { mo: 6, d: 9 }, we = rangeDays[1] || { mo: 6, d: 15 };
  const weekStart = `2026-${pad2(ws.mo)}-${pad2(ws.d)}`, weekEnd = `2026-${pad2(we.mo)}-${pad2(we.d)}`;
  const period = `${weekStart} 至 ${weekEnd}`;
  const weekRange = D.weekly.range;

  // 汇总本周（6/9–6/15）可用日报：今日草稿（若已填）+ 历史日报
  const sources = [];
  const draftFilled = [daily.done, daily.gain, daily.blocker, daily.help].some(x => x && x.trim());
  if (draftFilled) sources.push({ id: "today", date: daily.date, completed: daily.done ? [daily.done] : [], problems: daily.blocker, learning: daily.gain, needHelp: daily.help, preview: daily.done || daily.gain });
  D.dailyHistory.forEach(h => {
    const n = wkDayNum(h.date);
    if (n != null && n >= 9 && n <= 15) sources.push({ id: h.date, date: h.date, completed: h.detail.doneList || [], problems: h.detail.blocker, learning: h.detail.gain, needHelp: h.detail.help, preview: (h.detail.doneList || []).join("；") });
  });

  const [picked, setPicked] = useState(() => { const m = {}; sources.forEach(s => { m[s.id] = true; }); return m; });
  function toggle(id) { setPicked(p => ({ ...p, [id]: !p[id] })); }
  const chosen = sources.filter(s => picked[s.id]);

  async function genFromDailies() {
    if (loading) return;
    if (chosen.length === 0) { window.toast("暂无本周日报", "暂无本周日报，请先填写日报后再生成周报。", "alert"); return; }
    if (chosen.length < 2) window.toast("本周日报较少", "本周日报内容较少，生成的周报可能不完整。", "alert");
    setErr(""); setLoading(true);
    try {
      const res = await window.aiService.requestWeeklyReport(chosen, weekRange);
      setDraft(res); setDraftId(null);
      window.toast("已生成周报草稿", "已根据本周日报生成周报草稿，你可以修改后保存。", "loop");
    } catch (e) {
      setErr("生成失败，请稍后重试，或先手动编辑。");
    } finally {
      setLoading(false);
    }
  }

  function setField(key, val, multi) { setDraft(d => ({ ...d, [key]: multi ? val.split("\n") : val })); }
  function cancelDraft() { setDraft(null); setDraftId(null); }
  function editSaved(r) { setDraft(r); setDraftId(r.id); window.scrollTo && window.scrollTo(0, 0); }

  function saveReport() {
    const clean = { ...draft };
    WR_FIELDS.forEach(f => { if (f.multi) clean[f.key] = (clean[f.key] || []).map(s => s.trim()).filter(Boolean); });
    const now = new Date();
    const stamp = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    setReports(rs => {
      let next = rs.slice();
      const byId = draftId ? next.findIndex(r => r.id === draftId) : -1;
      const byWeek = next.findIndex(r => r.weekStart === weekStart);
      const idx = byId >= 0 ? byId : byWeek;
      const rec = {
        id: idx >= 0 ? next[idx].id : "wr" + Date.now(),
        weekStart, weekEnd, period,
        summary: clean.summary || "",
        completedWork: clean.completedWork || [], keyResults: clean.keyResults || [], problems: clean.problems || [],
        solutions: clean.solutions || [], learning: clean.learning || [], nextWeekPlan: clean.nextWeekPlan || [], needMentorHelp: clean.needMentorHelp || [],
        sourceDailyReportIds: chosen.map(s => s.id),
        createdAt: idx >= 0 ? next[idx].createdAt : stamp, updatedAt: stamp,
      };
      if (idx >= 0) next[idx] = rec; else next = [rec, ...next];
      return next;
    });
    setDraft(null); setDraftId(null);
    window.toast("已保存", "周报已保存到历史周报。", "check");
  }

  function doDelete() {
    setReports(rs => rs.filter(r => r.id !== delId));
    setDelId(null);
    window.toast("已删除", "该周报已从历史记录中删除。");
  }

  const sortedReports = reports.slice().sort((a, b) => (a.weekStart < b.weekStart ? 1 : -1));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 选择本周日报 → 生成 */}
      <div className="card card-pad">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
          <div>
            <div className="card-title">选择本周日报</div>
            <div className="card-sub" style={{ marginTop: 2 }}>周报由日报内容生成 · 勾选要纳入的日报，再生成周报草稿。</div>
          </div>
          <span className="chip chip-blue" style={{ marginLeft: "auto" }}>已选 {chosen.length} / {sources.length}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {sources.length === 0 && <div style={{ padding: "14px 0", color: "var(--t4)", fontSize: 13, textAlign: "center" }}>本周还没有可用的日报，先去「日报填写」记录吧。</div>}
          {sources.map(s => (
            <button key={s.id} className={"wk-src" + (picked[s.id] ? " on" : "")} onClick={() => toggle(s.id)}>
              <span className={"wk-check" + (picked[s.id] ? " on" : "")}>{picked[s.id] && <Icon name="check" size={12} color="#fff" />}</span>
              <div style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{s.date}{s.id === "today" ? " · 今日草稿" : ""}</div>
                <div className="truncate" style={{ fontSize: 11.5, color: "var(--t3)", marginTop: 2 }}>{s.preview || "（无完成记录）"}</div>
              </div>
            </button>
          ))}
        </div>
        {err && <div className="bd-err" style={{ marginTop: 12 }}><Icon name="alert" size={14} color="var(--red)" />{err}</div>}
        <div style={{ marginTop: 14 }}>
          <button className="btn btn-primary" disabled={loading} onClick={genFromDailies}>
            {loading ? <><span className="bd-spin" />正在整理本周日报…</> : <><Icon name="loop" size={14} />根据本周日报生成周报</>}
          </button>
        </div>
      </div>

      {/* 周报草稿（可编辑） */}
      {draft && (
        <div className="card card-pad" style={{ boxShadow: "0 0 0 2px var(--blue-line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <span className="chip chip-blue">{draftId ? "编辑周报" : "周报草稿"}</span>
            <span style={{ fontSize: 12.5, color: "var(--t3)" }}>{draftId ? "修改后保存即更新该周报" : "已生成周报草稿，你可以修改后保存"}</span>
            <span className="card-sub" style={{ marginLeft: "auto" }}>{period}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {WR_FIELDS.map(f => (
              <div key={f.key}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ width: 4, height: 14, borderRadius: 2, background: "var(--blue)" }} />
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--t1)" }}>{f.label}</span>
                </div>
                <textarea className="field" style={{ minHeight: f.multi ? 72 : 56 }}
                  value={f.multi ? (draft[f.key] || []).join("\n") : (draft[f.key] || "")}
                  onChange={e => setField(f.key, e.target.value, f.multi)} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line-2)" }}>
            <button className="btn btn-primary btn-sm" onClick={saveReport}><Icon name="check" size={13} />保存周报</button>
            {!draftId && <button className="btn btn-ghost btn-sm" onClick={genFromDailies} disabled={loading}><Icon name="loop" size={13} />重新生成</button>}
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={cancelDraft}>取消</button>
          </div>
        </div>
      )}

      {/* 历史周报 */}
      <div className="card card-pad">
        <div className="card-title" style={{ marginBottom: 12 }}>历史周报</div>
        {sortedReports.length === 0 ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: "var(--t4)", fontSize: 13 }}>暂无历史周报</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sortedReports.map(r => (
              <div key={r.id} className="task" style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>{r.period}</div>
                  <div className="card-sub" style={{ fontSize: 12, marginTop: 3, lineHeight: 1.55 }}>{r.summary || "（无总结）"}</div>
                  <div style={{ fontSize: 11, color: "var(--t4)", marginTop: 5 }}>创建于 {r.createdAt}{r.updatedAt !== r.createdAt ? " · 更新于 " + r.updatedAt : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => editSaved(r)}><Icon name="pen" size={13} />查看 / 编辑</button>
                  <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => setDelId(r.id)} aria-label="删除"><Icon name="x" size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Confirm open={!!delId} title="删除这份周报？" body="删除后无法恢复，是否确认删除？" confirmText="确认删除" onConfirm={doDelete} onCancel={() => setDelId(null)} />
    </div>
  );
}

/* ---------- 历史详情弹窗 ---------- */
const MOOD_COLOR = { "轻松": "#00924C", "还不错": "#0052D9", "有点累": "#D9700B", "压力有点大": "#D54941" };
function DetailGroup({ title, children }) {
  return (
    <div className="hd-group">
      <div className="hd-group-h">{title}</div>
      <div className="hd-group-b">{children}</div>
    </div>
  );
}

function HistoryDetail({ record, onClose }) {
  useEffect(() => {
    if (!record) return;
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [record, onClose]);
  if (!record) return null;
  const { kind, data } = record;
  const d = data.detail;
  const head = kind === "daily" ? data.date : data.period;
  return (
    <div className="hd-overlay" onClick={onClose}>
      <div className="hd-panel" onClick={e => e.stopPropagation()}>
        <div className="hd-head">
          <div style={{ minWidth: 0 }}>
            <div className="hd-kind">{kind === "daily" ? "日报详情" : "周报详情"}</div>
            <div className="hd-title">{head}</div>
          </div>
          <button className="hd-close" onClick={onClose} aria-label="关闭"><Icon name="x" size={18} /></button>
        </div>
        <div className="hd-body">
          {kind === "daily" ? (
            <>
              {d.mood && (
                <DetailGroup title="今日状态">
                  <span className="mood-pill"><span className="dot" style={{ background: MOOD_COLOR[d.mood] || "var(--t4)" }} />{d.mood}</span>
                </DetailGroup>
              )}
              <DetailGroup title="今日完成"><ul className="hd-list">{d.doneList.map((x, i) => <li key={i}>{x}</li>)}</ul></DetailGroup>
              <DetailGroup title="今日小收获"><p className="hd-p">{d.gain}</p></DetailGroup>
              <DetailGroup title="遇到的卡点"><p className="hd-p">{d.blocker}</p></DetailGroup>
              <DetailGroup title="需要导师帮助的地方"><p className="hd-p">{d.help}</p></DetailGroup>
              <DetailGroup title="导师反馈">
                {d.mentorFeedback ? <div className="hd-fb">{d.mentorFeedback}</div> : <span className="hd-fb-empty">暂未反馈</span>}
              </DetailGroup>
              <DetailGroup title="关联待办">
                <div className="hd-tags">{d.todos.map((x, i) => <span className="hd-tag" key={i}><Icon name="check" size={12} color="var(--blue)" />{x}</span>)}</div>
              </DetailGroup>
              {d.highlight && <DetailGroup title="工作亮点（已采用）"><p className="hd-p" style={{ whiteSpace: "pre-wrap" }}>{d.highlight}</p></DetailGroup>}
              {d.mentorSummary && <DetailGroup title="导师版总结（已采用）"><p className="hd-p" style={{ whiteSpace: "pre-wrap" }}>{d.mentorSummary}</p></DetailGroup>}
            </>
          ) : (
            <>
              <DetailGroup title="本周重点任务"><ul className="hd-list">{d.keyTasks.map((x, i) => <li key={i}>{x}</li>)}</ul></DetailGroup>
              <DetailGroup title="已完成事项"><ul className="hd-list">{d.doneList.map((x, i) => <li key={i}>{x}</li>)}</ul></DetailGroup>
              <DetailGroup title="本周收获">{d.gain.length > 1 ? <ul className="hd-list">{d.gain.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p className="hd-p">{d.gain[0]}</p>}</DetailGroup>
              <DetailGroup title="本周问题">{d.problem.length > 1 ? <ul className="hd-list">{d.problem.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p className="hd-p">{d.problem[0]}</p>}</DetailGroup>
              <DetailGroup title="下周计划"><ul className="hd-list">{d.nextPlan.map((x, i) => <li key={i}>{x}</li>)}</ul></DetailGroup>
              <DetailGroup title="导师反馈">
                {d.mentorFeedback ? <div className="hd-fb">{d.mentorFeedback}</div> : <span className="hd-fb-empty">暂未反馈</span>}
              </DetailGroup>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- 历史记录表格 ---------- */
function FeedbackPill({ feedback }) {
  const on = feedback === "已反馈";
  return (
    <span className={`spill ${on ? "chip-green" : "chip-gray"}`} style={{ fontSize: 11 }}>
      <span className="dot" style={{ background: on ? "var(--green)" : "var(--t4)" }} />{feedback}
    </span>
  );
}

function DailyHistoryTable({ data, onView }) {
  const cols = ["日期", "今日完成", "未完成", "卡点", "导师反馈", "关联待办", ""];
  const tpl = "1.5fr .8fr .7fr .6fr .9fr .8fr .8fr";
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="hist-row hist-head" style={{ gridTemplateColumns: tpl }}>
        {cols.map((c, i) => <span key={i} style={{ textAlign: i > 0 && i < 6 ? "center" : "left" }}>{c}</span>)}
      </div>
      {data.map((h, i) => (
        <div key={i} className="hist-row" style={{ gridTemplateColumns: tpl, borderBottom: i < data.length - 1 ? "1px solid var(--line-2)" : "none" }}>
          <span style={{ fontWeight: 600, color: "var(--t1)" }}>{h.date}</span>
          <span className="num" style={{ textAlign: "center", color: "var(--green)", fontWeight: 700 }}>{h.done}</span>
          <span className="num" style={{ textAlign: "center", color: h.undone > 0 ? "var(--t2)" : "var(--t4)", fontWeight: 700 }}>{h.undone}</span>
          <span className="num" style={{ textAlign: "center", color: h.blockers > 0 ? "var(--orange)" : "var(--t4)", fontWeight: 700 }}>{h.blockers}</span>
          <div style={{ textAlign: "center" }}><FeedbackPill feedback={h.feedback} /></div>
          <span className="num" style={{ textAlign: "center", color: "var(--t2)" }}>{h.linkedTodos} 条</span>
          <div style={{ textAlign: "right" }}><button className="btn btn-ghost btn-sm" onClick={() => onView(h)}>查看详情</button></div>
        </div>
      ))}
    </div>
  );
}

function WeeklyHistoryTable({ data, onView }) {
  const cols = ["周期", "本周完成", "本周收获", "本周问题", "下周计划", "导师反馈", ""];
  const tpl = "1.3fr .8fr .8fr .8fr .8fr .9fr .8fr";
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="hist-row hist-head" style={{ gridTemplateColumns: tpl }}>
        {cols.map((c, i) => <span key={i} style={{ textAlign: i > 0 && i < 6 ? "center" : "left" }}>{c}</span>)}
      </div>
      {data.map((h, i) => (
        <div key={i} className="hist-row" style={{ gridTemplateColumns: tpl, borderBottom: i < data.length - 1 ? "1px solid var(--line-2)" : "none" }}>
          <span style={{ fontWeight: 600, color: "var(--t1)" }}>{h.period}</span>
          <span className="num" style={{ textAlign: "center", color: "var(--green)", fontWeight: 700 }}>{h.done}</span>
          <span style={{ textAlign: "center", color: "var(--t2)", fontWeight: 600, fontSize: 12.5 }}>{h.gain}</span>
          <span style={{ textAlign: "center", color: "var(--t2)", fontWeight: 600, fontSize: 12.5 }}>{h.problem}</span>
          <span style={{ textAlign: "center", color: "var(--t2)", fontWeight: 600, fontSize: 12.5 }}>{h.nextPlan}</span>
          <div style={{ textAlign: "center" }}><FeedbackPill feedback={h.feedback} /></div>
          <div style={{ textAlign: "right" }}><button className="btn btn-ghost btn-sm" onClick={() => onView(h)}>查看详情</button></div>
        </div>
      ))}
    </div>
  );
}

/* ---------- 历史记录 ---------- */
// 把「周报生成」里保存的周报映射成历史表格 / 详情需要的结构
function weeklyToHistoryRow(r) {
  const first = (a) => (Array.isArray(a) && a.length ? a[0] : "—");
  return {
    period: r.period,
    done: (r.completedWork || []).length,
    gain: first(r.learning),
    problem: first(r.problems),
    nextPlan: first(r.nextWeekPlan),
    feedback: "未反馈",
    detail: {
      keyTasks: r.keyResults || [],
      doneList: r.completedWork || [],
      gain: (r.learning && r.learning.length) ? r.learning : [r.summary || "—"],
      problem: (r.problems && r.problems.length) ? r.problems : ["—"],
      nextPlan: (r.nextWeekPlan && r.nextWeekPlan.length) ? r.nextWeekPlan : ["—"],
      mentorFeedback: "",
    },
  };
}

function HistoryTab() {
  const D = window.APP_DATA;
  const [sub, setSub] = useState("daily");
  const [detail, setDetail] = useState(null);
  const [myDailies] = usePersist("ies_dailyReports", []);
  const [myWeeklies] = usePersist("ies_weeklyReports", []);
  // 真实提交/保存的记录排在前，demo 历史在后
  const dailyData = [...myDailies, ...D.dailyHistory];
  const weeklyData = [...myWeeklies.map(weeklyToHistoryRow), ...D.weeklyHistory];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="seg" style={{ alignSelf: "flex-start" }}>
        <button className={sub === "daily" ? "on" : ""} onClick={() => setSub("daily")}>日报记录</button>
        <button className={sub === "weekly" ? "on" : ""} onClick={() => setSub("weekly")}>周报记录</button>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--t3)", lineHeight: 1.6 }}>
        {sub === "daily"
          ? "按天查看已提交的日报、卡点记录与导师反馈，方便回看每天的推进情况。"
          : "按周查看阶段性总结、问题复盘和下周计划，帮助沉淀持续成长记录。"}
      </div>
      {sub === "daily"
        ? <DailyHistoryTable data={dailyData} onView={r => setDetail({ kind: "daily", data: r })} />
        : <WeeklyHistoryTable data={weeklyData} onView={r => setDetail({ kind: "weekly", data: r })} />}
      <HistoryDetail record={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

/* ---------- 容器 ---------- */
function ReportModule({ setTab }) {
  const [sub, setSub] = usePersist("ies3_reportTab", "daily");
  const tabs = [["daily", "日报填写", "doc"], ["weekly", "周报生成", "loop"], ["history", "历史记录", "inbox"]];
  return (
    <div className="scroll">
      <div className="flow page-enter">
        <div className="page-head">
          <div className="page-h1">日报 / 周报</div>
          <div className="page-desc">低成本记录完成与卡点，复盘沉淀成长证据</div>
        </div>

        <div className="card card-pad">
          <div className="tabbar" style={{ marginBottom: 18 }}>
            {tabs.map(([k, lbl, ic]) => (
              <button key={k} className={sub === k ? "on" : ""} onClick={() => setSub(k)}><Icon name={ic} size={15} />{lbl}</button>
            ))}
          </div>
          {sub === "daily" && <DailyTab />}
          {sub === "weekly" && <WeeklyTab />}
          {sub === "history" && <HistoryTab />}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ReportModule });
