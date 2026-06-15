/* ============ 实习生工作台 · 看自己，不看别人 ============
   回答：我今天要完成什么？卡住了怎么求助？ ============ */

const SOURCE_OPTIONS = ["导师安排", "项目任务", "任务拆解", "自己添加"];
const SRC_LABEL = { mentor: "带教任务", temp: "个人添加", project: "其他任务", split: "其他任务" };

/* 来源三分类：带教任务(蓝) / 个人添加(绿) / 其他任务(黄) */
const TODO_CATS = [
  { key: "all", label: "任务汇总", tone: "gray" },
  { key: "mentor", label: "带教任务", tone: "blue" },
  { key: "temp", label: "个人添加", tone: "green" },
  { key: "other", label: "其他任务", tone: "orange" },
];
function catOf(t) {
  const s = srcTypeOf(t);
  if (s === "mentor") return "mentor";
  if (s === "temp") return "temp";
  return "other";
}

function srcTypeOf(t) {
  if (t.srcType) return t.srcType;
  if (t.source === "导师安排") return "mentor";
  if (t.source === "项目任务") return "project";
  if (t.source === "任务拆解") return "split";
  return "temp";
}
const TODAY_KEY = () => ((window.APP_DATA.daily && window.APP_DATA.daily.date) || "").split(" ")[0];
function isTodayTask(t) {
  if (t.scope === "today") return true;
  if (t.scope === "week") return false;
  const TODAY = TODAY_KEY();
  return (t.ddl && TODAY && t.ddl.indexOf(TODAY) === 0) || t.status === "doing" || t.status === "stuck";
}
function PriorityChip({ p }) {
  const meta = window.APP_DATA.priorityMeta[p];
  if (!meta) return null;
  return <span className={`chip chip-${meta.tone}`} style={{ fontSize: 11 }}><span className="dot" style={{ background: `var(--${meta.tone === "gray" ? "t3" : meta.tone})` }} />{meta.label}</span>;
}
function writeBreakdownPick(task) {
  try { localStorage.setItem("ies4_breakdown", JSON.stringify({ picked: task, subs: [] })); } catch (e) {}
}

/* 任务旁的协作标记点：红=卡住 / 黄=带教确认中 / 绿=带教已确认 */
function markOf(t) {
  if (t.status === "stuck") return { color: "var(--red)", label: "卡住" };
  if (t.ack === "confirmed") return { color: "var(--green)", label: "带教已确认" };
  if (t.ack === "pending") return { color: "var(--orange)", label: "带教确认中" };
  return null;
}

/* ddl 解析与临期判断："6月12日 18:00"，距当前不足 3 小时则标红点 */
const URGENT_MIN = 180; // 离 ddl 三个小时内
function ddlInfo(t) {
  if (!t.ddl) return null;
  const m = t.ddl.match(/(\d+)月(\d+)日\s*(\d+):(\d+)/);
  if (!m) return null;
  const d = { month: +m[1], day: +m[2], hour: +m[3], minute: +m[4] };
  const now = window.APP_DATA.now;
  const toMin = x => ((x.month * 31 + x.day) * 24 + x.hour) * 60 + x.minute;
  const diff = toMin(d) - toMin(now); // 距离 ddl 还有多少分钟
  const isToday = d.month === now.month && d.day === now.day;
  const pad = n => String(n).padStart(2, "0");
  const time = `${pad(d.hour)}:${pad(d.minute)}`;
  const label = isToday ? `今天 ${time}` : `${d.month}/${d.day} ${time}`;
  const overdue = diff < 0;
  const soon = diff >= 0 && diff <= URGENT_MIN;
  let remainText = "";
  if (overdue) remainText = "已超时";
  else if (diff < 60) remainText = `剩 ${diff} 分钟`;
  else remainText = `剩 ${Math.floor(diff / 60)} 小时${diff % 60 ? Math.round(diff % 60) + " 分钟" : ""}`;
  return { label, diff, overdue, soon, remainText };
}

/* ---------- 单条待办卡（折叠：复选框 + 标题 + 标记；点开看具体内容） ---------- */
function TodoCard({ t, onToggleDone, onStuck, onRequestConfirm, onSeen, onBreakdown, sortable, dragging, isOver, onDragStart, onDragEnter, onDragEnd, onDrop }) {
  const [open, setOpen] = useState(false);
  const done = t.status === "done";
  const isMentor = t.source === "导师安排";
  const stype = srcTypeOf(t);
  const isSplit = stype === "split";
  const urgent = t.priority === "urgent";
  const ddl = ddlInfo(t);
  const ddlAlert = ddl && !done && (ddl.soon || ddl.overdue);
  const carryDate = t.carriedFromDate || t.carriedFrom;
  function toggleOpen() { setOpen(o => !o); if (t.assignedNew && onSeen) onSeen(t.id); }
  return (
    <div className={`task ${done ? "is-done" : ""} ${t.status === "stuck" ? "is-stuck" : ""} ${dragging ? "dragging" : ""} ${isOver ? "drag-over" : ""}`}
      draggable={sortable || undefined}
      onDragStart={sortable ? onDragStart : undefined}
      onDragOver={sortable ? (e => { e.preventDefault(); onDragEnter && onDragEnter(); }) : undefined}
      onDrop={sortable ? (e => { e.preventDefault(); onDrop && onDrop(); }) : undefined}
      onDragEnd={sortable ? onDragEnd : undefined}>
      {/* 折叠行 */}
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        {sortable && <span className="drag-grip" title="拖动调整顺序"><Icon name="more" size={15} /></span>}
        <button className={`chk ${done ? "on" : ""}`} onClick={() => onToggleDone(t.id)} title="标记完成">
          {done && <Icon name="check" size={13} color="#fff" />}
        </button>
        <button onClick={toggleOpen} aria-expanded={open}
          style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 9, textAlign: "left", background: "transparent", border: "none", padding: 0, cursor: "pointer" }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: done ? "var(--t3)" : "var(--t1)", textDecoration: done ? "line-through" : "none" }}>{t.name}</span>
          {ddlAlert && <span className="ddl-reddot" title={`临近截止 · ${ddl.remainText}`} />}
          {ddl && (
            <span className={`ddl-pill ${done ? "" : ddl.overdue ? "overdue" : ddl.soon ? "soon" : ""}`}
              title={done ? `截止 ${ddl.label}` : `截止 ${ddl.label} · ${ddl.remainText}`}>
              <Icon name="clock" size={11} strokeMode />{ddl.label}
            </span>
          )}
          {urgent && !done && <span className="chip chip-red" style={{ fontSize: 10.5, flexShrink: 0 }}><Icon name="alert" size={11} strokeMode />紧急</span>}
          {t.carried && !done && <span className="chip chip-gray" style={{ fontSize: 10.5, flexShrink: 0 }}><Icon name="refresh" size={11} />{carryDate}顺延</span>}
          {t.assignedNew && <span className="chip chip-blue" style={{ fontSize: 10.5, flexShrink: 0 }}><Icon name="mentor" size={11} />导师新派</span>}

          <Icon name="chevron" size={14} color="var(--t4)" strokeMode style={{ marginLeft: "auto", flexShrink: 0, transform: open ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
        </button>
      </div>

      {/* 展开：具体内容 */}
      {open && (
        <div style={{ marginTop: 12, marginLeft: sortable ? 57 : 31 }}>
          {t.acceptance && (
            <div className="todo-acc">
              <div className="task-meta-k" style={{ marginBottom: 3 }}>验收标准 · 做到什么算完成</div>
              <div style={{ fontSize: 12.5, color: "var(--t2)", lineHeight: 1.55 }}>{t.acceptance}</div>
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: t.acceptance ? 11 : 0 }}>
            <div>
              <div className="task-meta-k" style={{ marginBottom: 4 }}>来源</div>
              <div style={{ fontSize: 12.5, color: "var(--t2)" }}>{isSplit ? t.sourceRef : SRC_LABEL[stype]}</div>
            </div>
            {t.ddl && (
              <div>
                <div className="task-meta-k" style={{ marginBottom: 4 }}>截止时间</div>
                <div style={{ fontSize: 12.5, color: "var(--t2)" }}>{t.ddl}</div>
              </div>
            )}
            {t.carried && (
              <div>
                <div className="task-meta-k" style={{ marginBottom: 4 }}>顺延</div>
                <div style={{ fontSize: 12.5, color: "var(--t2)" }}>由 {carryDate} 顺延至今天{t.carryoverCount > 1 ? ` · 已顺延 ${t.carryoverCount} 天` : ""}</div>
              </div>
            )}
          </div>
          {!done && (
            <div className="todo-actions" style={{ marginLeft: 0, marginTop: 13, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {!isSplit && onBreakdown && (
                <button className="btn btn-soft btn-sm" onClick={() => onBreakdown(t)}><Icon name="split" size={13} />拆解任务</button>
              )}
              {isMentor && (
                <button className="btn btn-ghost btn-sm" onClick={() => onRequestConfirm(t.id)}><Icon name="chat" size={13} />请求导师确认</button>
              )}
              {isMentor && (t.status === "stuck"
                ? <button className="tbtn" onClick={() => onStuck(t.id)}><Icon name="refresh" size={13} />恢复进行</button>
                : <button className="tbtn warn" onClick={() => onStuck(t.id)}><Icon name="alert" size={13} strokeMode />标记卡住</button>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- 添加待办 ---------- */
function AddTodo({ onAdd, scope = "week" }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", acceptance: "", ddlDate: "", ddlTime: "" });
  const isToday = scope === "today";
  function fmtDdl(dateStr, timeStr) {
    if (!dateStr) return "";
    const p = dateStr.split("-").map(Number);
    const t = timeStr || "18:00"; // 未填时间默认 18:00
    return `${p[1]}月${p[2]}日 ${t}`;
  }
  function submit() {
    if (!f.name.trim()) { window.toast("请填写任务名称", "给待办起个清晰的名字，方便后续追踪。", "alert"); return; }
    const ddl = fmtDdl(f.ddlDate, f.ddlTime);
    onAdd({ id: "u" + Date.now(), name: f.name.trim(), source: "自己添加", sourceRef: isToday ? "个人添加 · 今天" : "个人添加 · 本周",
      acceptance: f.acceptance.trim() || "（待补充验收标准）", ddl: ddl || undefined, estimate: "未估时", status: "todo", week: "this", scope });
    setF({ name: "", acceptance: "", ddlDate: "", ddlTime: "" }); setOpen(false);
    window.toast("已添加待办", isToday ? "新待办已加入今日，刷新页面也会保留。" : "新待办已加入本周，刷新页面也会保留。");
  }
  if (!open) return (
    <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", borderStyle: "dashed", padding: "11px" }} onClick={() => setOpen(true)}>
      <Icon name="plus" size={15} />{isToday ? "添加今日待办" : "添加本周待办"}
    </button>
  );
  return (
    <div className="card card-pad" style={{ background: "var(--surface-2)" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <div className="card-title">{isToday ? "添加今日待办" : "添加本周待办"}</div>
        <button className="icon-btn" style={{ width: 30, height: 30, marginLeft: "auto", border: "none", background: "transparent" }} onClick={() => setOpen(false)}><Icon name="x" size={15} /></button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div className="field-label">任务名称 <span className="field-req">*</span></div>
          <input className="field" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="例如：整理本周需求评审记录" />
        </div>
        <div>
          <div className="field-label">验收标准 · 做到什么算完成</div>
          <input className="field" value={f.acceptance} onChange={e => setF({ ...f, acceptance: e.target.value })} placeholder="例如：输出 1 页速查并同步导师" />
        </div>
        <div>
          <div className="field-label">截止时间 (ddl) · 选填</div>
          <div style={{ display: "flex", gap: 9 }}>
            <input className="field" style={{ flex: 1 }} type="date" value={f.ddlDate} onChange={e => setF({ ...f, ddlDate: e.target.value })} />
            <input className="field" style={{ width: 130 }} type="time" value={f.ddlTime} onChange={e => setF({ ...f, ddlTime: e.target.value })} />
          </div>
          <div style={{ fontSize: 11.5, color: "var(--t4)", marginTop: 5 }}>不填时间默认当天 18:00；离截止不足 3 小时会在任务旁提醒。</div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
          <button className="btn btn-ghost" onClick={() => setOpen(false)}>取消</button>
          <button className="btn btn-primary" onClick={submit}><Icon name="plus" size={14} />添加待办</button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Tab 1 · 今日待办 ===================== */
/* ---------- 本周甘特图 ---------- */
const GANTT_DAYS = [
  { w: "周一", d: 9 }, { w: "周二", d: 10 }, { w: "周三", d: 11 }, { w: "周四", d: 12 },
  { w: "周五", d: 13 }, { w: "周六", d: 14 }, { w: "周日", d: 15 },
];
function gDayNum(str) { const m = (str || "").match(/(\d+)月(\d+)日/); return m ? +m[2] : null; }
function WeekGantt({ tasks }) {
  const START = 9, N = 7, colW = 100 / N;
  const todayD = window.APP_DATA.now.day;
  const todayIdx = Math.min(N - 1, Math.max(0, todayD - START));
  const rows = tasks.map(t => {
    const end = gDayNum(t.ddl);
    const startRaw = gDayNum(t.start);
    let s = (startRaw != null ? startRaw : (end != null ? end - 1 : todayD)) - START;
    let e = (end != null ? end : START + N - 1) - START;
    s = Math.min(N - 1, Math.max(0, s)); e = Math.min(N - 1, Math.max(0, e));
    if (e < s) e = s;
    return { t, s, e, flexible: end == null };
  });
  return (
    <div className="gantt">
      <div className="gantt-grid gantt-head">
        <div className="gantt-corner">本周任务</div>
        {GANTT_DAYS.map((d, i) => (
          <div key={d.d} className={"gantt-dh" + (i === todayIdx ? " today" : "")}>
            <span className="gantt-dh-w">{d.w}</span><span className="gantt-dh-d">6/{d.d}</span>
          </div>
        ))}
      </div>
      {rows.map(({ t, s, e, flexible }) => {
        const tone = ({ mentor: "blue", temp: "green", other: "orange" })[catOf(t)];
        const done = t.status === "done", stuck = t.status === "stuck";
        const endLabel = flexible ? "灵活安排" : (t.ddl ? "截止 " + t.ddl.replace(/\s.*/, "").replace("月", "/").replace("日", "") : "");
        return (
          <div className="gantt-grid gantt-row" key={t.id}>
            <div className="gantt-label" title={t.name}>
              <span className="cat-dot" style={{ background: `var(--${tone})` }} />
              <span className="gantt-label-tx">{t.name}</span>
            </div>
            <div className="gantt-track" style={{ gridColumn: "2 / 9", backgroundSize: `${colW}% 100%` }}>
              <div className="gantt-today-col" style={{ left: `${todayIdx * colW}%`, width: `${colW}%` }} />
              <div className={"gantt-bar t-" + tone + (done ? " done" : "") + (stuck ? " stuck" : "")}
                style={{ left: `calc(${s * colW}% + 4px)`, width: `calc(${(e - s + 1) * colW}% - 8px)` }}>
                <span className="gantt-bar-tx">{endLabel}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* 本周甘特图弹窗：从「本周待办」右上角按钮点开，与下方待办列表分开 */
function GanttModal({ tasks, period, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal gantt-modal" onClick={e => e.stopPropagation()}>
        <div className="gantt-modal-head">
          <div>
            <div className="msg-modal-title">本周甘特图</div>
            <div className="card-sub" style={{ marginTop: 3 }}>{period} · 按截止时间排布本周任务</div>
          </div>
          <button className="icon-btn" style={{ width: 32, height: 32, border: "none" }} onClick={onClose} aria-label="关闭"><Icon name="x" size={16} /></button>
        </div>
        <div className="gantt-modal-body">
          <WeekGantt tasks={tasks} />
        </div>
      </div>
    </div>
  );
}

function InternToday({ setTab }) {
  const D = window.APP_DATA;
  const [todos, setTodos] = usePersist("ies6_todos", D.todos);
  // 展示本周待办类任务：导师任务 / 项目任务 / 临时任务 / 拆解生成的小任务
  const weekTodos = todos.filter(t => ["导师安排", "自己添加", "项目任务", "任务拆解"].includes(t.source));

  function toggleDone(id) {
    const cur = todos.find(t => t.id === id);
    if (!cur) return;
    const next = cur.status === "done" ? "todo" : "done";
    setTodos(ts => ts.map(t => t.id === id ? { ...t, status: next } : t));
    if (next === "done") window.toast("已标记完成", "做得好，已完成的待办会沉淀为你的成长证据。", "check");
    else window.toast("已取消完成", "任务已回到未开始。");
  }
  function markStuck(id) {
    const cur = todos.find(t => t.id === id);
    if (!cur) return;
    if (cur.status === "stuck") {
      setTodos(ts => ts.map(t => t.id === id ? { ...t, status: "doing" } : t));
      window.toast("已恢复进行", "任务已回到进行中。");
    } else {
      setTodos(ts => ts.map(t => t.id === id ? { ...t, status: "stuck", ack: null } : t));
      window.toast("已标记卡住", "记得在日报里写明卡点，并主动同步导师陈骁——卡住不是问题，及时说出来就好。", "alert");
    }
  }
  function requestConfirm(id) {
    setTodos(ts => ts.map(t => t.id === id ? { ...t, ack: "pending", status: t.status === "stuck" ? "doing" : t.status } : t));
    window.toast("已请求导师确认", "已把验收标准发给导师陈骁，等待 TA 确认。", "chat");
    setTimeout(() => {
      setTodos(ts => ts.map(t => (t.id === id && t.ack === "pending") ? { ...t, ack: "confirmed" } : t));
      window.toast("导师已确认（演示）", "演示环境模拟导师确认并记入成长记录；真实环境由导师在带教端操作。", "check");
    }, 2600);
  }
  function add(t) { setTodos(ts => [t.scope === "today" ? { ...t, sortOrder: Date.now() } : t, ...ts]); }
  function markSeen(id) { setTodos(ts => ts.map(t => t.id === id ? { ...t, assignedNew: false } : t)); }
  function breakdown(t) { writeBreakdownPick(t); window.toast("已送入任务拆解", `「${t.name}」已放入任务拆解，去拆成今天能执行的小任务。`, "split"); setTab && setTab("path"); }

  const [sub, setSub] = usePersist("ies3_todoTab", "today");
  const [cat, setCat] = usePersist("ies_todoCat", "all");
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [showGantt, setShowGantt] = useState(false);
  const TODAY = TODAY_KEY(); // 例 "6月12日"
  // 显示顺序优先读 sortOrder（用户拖拽保存）；缺省的按数组顺序排在后
  const ord = t => (t.sortOrder == null ? Infinity : t.sortOrder);
  const byOrder = (a, b) => ord(a) - ord(b);
  const todayList = weekTodos.filter(isTodayTask).sort(byOrder);
  const weekList = weekTodos.filter(t => !isTodayTask(t)).sort(byOrder);
  const activeList = sub === "today" ? todayList : weekList;
  const sortable = sub === "today";
  const carriedCount = todayList.filter(t => t.carried && t.status !== "done").length;

  function handleDrop(targetId) {
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return; }
    const ids = activeList.map(t => t.id);
    const from = ids.indexOf(dragId), to = ids.indexOf(targetId);
    if (from < 0 || to < 0) { setDragId(null); setOverId(null); return; }
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    const orderMap = {}; ids.forEach((id, i) => { orderMap[id] = i + 1; });
    setTodos(ts => ts.map(t => orderMap[t.id] != null ? { ...t, sortOrder: orderMap[t.id] } : t));
    setDragId(null); setOverId(null);
  }
  const newAssigned = activeList.filter(t => t.assignedNew);
  const c = {
    total: activeList.length,
    doing: activeList.filter(t => t.status === "doing").length,
    stuck: activeList.filter(t => t.status === "stuck").length,
    done: activeList.filter(t => t.status === "done").length,
  };

  const stats = [
    { k: sub === "today" ? "今日待办" : "本周待办", v: c.total, tone: "blue", ico: "list" },
    { k: "进行中", v: c.doing, tone: "blue", ico: "refresh" },
    { k: "卡住了", v: c.stuck, tone: "orange", ico: "alert" },
    { k: "已完成", v: c.done, tone: "green", ico: "check" },
  ];
  const toneC = { blue: "var(--blue)", orange: "var(--orange)", green: "var(--green)" };

  // 今日按来源分类筛选 / 分组
  const catCount = k => k === "all" ? activeList.length : activeList.filter(x => catOf(x) === k).length;
  const displayList = (sub === "today" && cat !== "all") ? activeList.filter(x => catOf(x) === cat) : activeList;
  const renderCard = t => (
    <TodoCard key={t.id} t={t} onToggleDone={toggleDone} onStuck={markStuck} onRequestConfirm={requestConfirm} onSeen={markSeen} onBreakdown={breakdown}
      sortable={sortable}
      dragging={dragId === t.id}
      isOver={sortable && overId === t.id && dragId && dragId !== t.id}
      onDragStart={() => setDragId(t.id)}
      onDragEnter={() => setOverId(t.id)}
      onDragEnd={() => { setDragId(null); setOverId(null); }}
      onDrop={() => handleDrop(t.id)} />
  );

  return (
    <div className="scroll">
      <div className="flow page-enter">
        <div className="page-head">
          <div className="page-h1">待办事项</div>
          <div className="page-desc">研发 · 平台体验组 · 入职第 23 天</div>
        </div>

        {/* 计数条 */}
        <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          {stats.map(s => (
            <div className="kpi" key={s.k} style={{ padding: "13px 15px" }}>
              <div className="kpi-top">
                <span className="kpi-ic" style={{ background: "var(--surface-2)", color: toneC[s.tone] }}><Icon name={s.ico} size={15} /></span>
                <span className="kpi-label">{s.k}</span>
              </div>
              <div className="kpi-val num" style={{ marginTop: 8, color: s.tone === "orange" && s.v > 0 ? "var(--orange)" : "var(--t1)" }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* 今日 / 本周 两个板块 */}
        <div className="card card-pad">
          <div className="tabbar tabbar-today" style={{ marginBottom: 18 }}>
            <button className={sub === "today" ? "on" : ""} onClick={() => setSub("today")}><Icon name="flag" size={15} />今日<span className="tabbar-count">{todayList.length}</span></button>
            <button className={sub === "week" ? "on" : ""} onClick={() => setSub("week")}><Icon name="calendar" size={15} />本周<span className="tabbar-count">{weekList.length}</span></button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div>
              <div className="card-title">{sub === "today" ? "今日待办" : "本周待办"}</div>
              <div className="card-sub" style={{ marginTop: 2 }}>{sub === "today" ? `今天${TODAY ? " " + TODAY : ""} · 优先完成这几件` : "6月9日 — 6月15日 · 本周要推进的事项"}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
              {sub === "week" && weekList.length > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={() => setShowGantt(true)}><Icon name="calendar" size={14} />本周甘特图</button>
              )}
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--t3)" }}>{c.done}/{c.total} 已完成</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {newAssigned.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 11px", background: "var(--blue-soft2)", borderRadius: "var(--r-sm)", fontSize: 12.5, color: "var(--t3)" }}>
                <Icon name="mentor" size={13} color="var(--blue)" />
                <span style={{ color: "var(--t2)", fontWeight: 600 }}>导师陈骁新派了 {newAssigned.length} 件{sub === "today" ? "今日" : "本周"}任务</span>
                <span>，展开查看验收标准。</span>
              </div>
            )}
            {/* 本周甘特图已拆分为右上角「本周甘特图」按钮，点开查看 */}

            {/* 今日：按来源分类筛选 */}
            {sub === "today" && (
              <div className="cat-seg">
                {TODO_CATS.map(g => (
                  <button key={g.key} className={`cat-pill t-${g.tone} ${cat === g.key ? "on" : ""}`} onClick={() => setCat(g.key)}>
                    {g.key !== "all" && <span className="cat-dot" style={{ background: `var(--${g.tone})` }} />}
                    {g.label}<span className="cat-n">{catCount(g.key)}</span>
                  </button>
                ))}
              </div>
            )}

            {displayList.length === 0 && (
              <div style={{ padding: "22px 0", textAlign: "center", color: "var(--t4)", fontSize: 13 }}>
                {activeList.length === 0
                  ? (sub === "today" ? "今天还没有待办，添加一条今天要完成的事吧。" : "本周还没有待办，添加一条吧。")
                  : "该分类下暂无待办，换个分类或在下方添加。"}
              </div>
            )}

            {sub === "today" && cat === "all"
              ? TODO_CATS.filter(g => g.key !== "all").map(g => {
                  const items = activeList.filter(x => catOf(x) === g.key);
                  if (items.length === 0) return null;
                  return (
                    <div key={g.key} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                      <div className="cat-head">
                        <span className="cat-dot" style={{ background: `var(--${g.tone})` }} />{g.label}
                        <span className="cat-n">{items.length}</span>
                      </div>
                      {items.map(renderCard)}
                    </div>
                  );
                })
              : displayList.map(renderCard)}

            <AddTodo onAdd={add} scope={sub === "today" ? "today" : "week"} />
          </div>
        </div>
        {showGantt && <GanttModal tasks={weekList} period="6月9日 — 6月15日" onClose={() => setShowGantt(false)} />}
      </div>
    </div>
  );
}

/* ===================== Tab 2 · 任务拆解 ===================== */
/* 拖入区（空状态） */
function BreakdownEmpty({ onPick, todos }) {
  const [over, setOver] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [free, setFree] = useState("");
  const weekList = todos.filter(t => ["导师安排", "项目任务", "自己添加"].includes(t.source) && t.status !== "done" && !isTodayTask(t));
  function startFree() { if (free.trim()) onPick({ id: "free" + Date.now(), name: free.trim(), source: "自己添加", srcType: "temp", freeform: true }); }

  function drop(e) {
    e.preventDefault(); setOver(false);
    const id = e.dataTransfer.getData("text/plain");
    const task = todos.find(t => t.id === id);
    if (task) onPick(task);
  }
  return (
    <div className="flow page-enter">
      <div className="page-head">
        <div className="page-h1">智能任务拆解</div>
        <div className="page-desc">把模糊任务拆成今天能执行的小任务。</div>
      </div>

      <div
        className={`bd-drop ${over ? "over" : ""}`}
        onDragOver={e => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={drop}>
        <span className="bd-drop-ic"><Icon name="split" size={26} color="var(--blue)" /></span>
        <div className="bd-drop-t">拖入任务开始拆解</div>
        <div className="bd-drop-s">从「本周待办」拖入带教 / 项目 / 个人任务，下一步可上传文件并补充要求</div>
        <div className="bd-drop-hint">适合处理“导师交代了，但我不知道怎么开始”的任务。</div>

        <button className="btn btn-ghost btn-sm bd-pick-btn" onClick={() => setPickerOpen(o => !o)}>
          <Icon name="list" size={13} />从本周待办选择
          <Icon name="chevronDown" size={13} strokeMode style={{ transform: pickerOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
        </button>

        {pickerOpen && (
          <div className="bd-picker">
            {weekList.length === 0 && <div style={{ padding: "14px 0", color: "var(--t4)", fontSize: 12.5 }}>本周待办暂无可拆解的任务。</div>}
            {weekList.map(t => (
              <div key={t.id} className="bd-pick-item" draggable
                onDragStart={e => e.dataTransfer.setData("text/plain", t.id)}
                onClick={() => onPick(t)}>
                <span className="bd-grip"><Icon name="more" size={14} /></span>
                <div style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
                  <div className="truncate" style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{t.name}</div>
                  <div className="card-sub" style={{ fontSize: 11, marginTop: 2 }}>{SRC_LABEL[srcTypeOf(t)]}{t.ddl ? " · 截止 " + t.ddl : ""}</div>
                </div>
                <Icon name="arrowRight" size={14} color="var(--t4)" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bd-or-row"><span>或者</span></div>
      <div className="card card-pad">
        <div className="card-title">直接描述一个任务</div>
        <div className="card-sub" style={{ marginTop: 2, marginBottom: 12 }}>不在本周待办里？直接写下任务，下一步上传文件后让 AI 帮你拆。</div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <input className="field" style={{ flex: 1, minWidth: 220 }} value={free} onChange={e => setFree(e.target.value)}
            placeholder="例如：完成会员权益弹窗的交互稿"
            onKeyDown={e => { if (e.key === "Enter") startFree(); }} />
          <button className="btn btn-primary" disabled={!free.trim()} onClick={startFree}><Icon name="split" size={14} />开始拆解</button>
        </div>
      </div>
    </div>
  );
}

/* 上传文件读为文本（仅文本类文件可提取正文） */
function fileIsText(f) {
  return /\.(txt|md|markdown|json|csv|log|html?|css|jsx?|tsx?|py|java|go|rb|php|xml|yml|yaml|sql|sh|vue)$/i.test(f.name) || (f.type && f.type.indexOf("text") === 0);
}
function readOneFile(f) {
  return new Promise(res => {
    if (!fileIsText(f)) { res({ name: f.name, size: f.size, isText: false, text: "" }); return; }
    const r = new FileReader();
    r.onload = () => res({ name: f.name, size: f.size, isText: true, text: String(r.result || "").slice(0, 8000) });
    r.onerror = () => res({ name: f.name, size: f.size, isText: false, text: "" });
    r.readAsText(f);
  });
}
function readUploadedFiles(list) { return Promise.all(Array.from(list || []).map(readOneFile)); }

/* 建议安排 / 优先级 展示文案 */
const SD_LABEL = { today: "今天", tomorrow: "明天", this_week: "本周" };
const SP_LABEL = { high: "高", medium: "中", low: "低" };

/* 单条小任务（拆解草稿：可勾选 / 编辑 / 删除） */
function SubtaskRow({ s, editing, onToggle, onEdit, onSave, onCancel, onDelete }) {
  const [f, setF] = useState(s);
  useEffect(() => { setF(s); }, [s, editing]);
  if (editing) {
    return (
      <div className="task" style={{ background: "var(--blue-soft2)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div className="field-label">小任务标题</div>
            <input className="field" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} autoFocus />
          </div>
          <div>
            <div className="field-label">说明</div>
            <textarea className="field" style={{ minHeight: 58 }} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 140px" }}>
              <div className="field-label">预计耗时（分钟）</div>
              <input className="field" type="number" min="5" step="5" value={f.estimatedMinutes} onChange={e => setF({ ...f, estimatedMinutes: +e.target.value || 0 })} />
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <div className="field-label">建议安排</div>
              <select className="field" value={f.suggestedDate} onChange={e => setF({ ...f, suggestedDate: e.target.value })}>
                <option value="today">今天</option>
                <option value="tomorrow">明天</option>
                <option value="this_week">本周</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 9 }}>
            <button className="btn btn-ghost btn-sm" onClick={onCancel}>取消</button>
            <button className="btn btn-primary btn-sm" onClick={() => onSave({ ...f, title: (f.title || "").trim() || s.title })}><Icon name="check" size={13} />保存</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="task" style={s.selected ? {} : { opacity: .5 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
        <button className={"bd-check" + (s.selected ? " on" : "")} onClick={onToggle} aria-label="选择加入">{s.selected && <Icon name="check" size={12} color="#fff" />}</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)" }}>{s.title}</div>
          {s.description && <div className="card-sub" style={{ fontSize: 12, marginTop: 3, lineHeight: 1.55 }}>{s.description}</div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            <span className="bd-meta"><Icon name="clock" size={11} strokeMode />{s.estimatedMinutes} 分钟</span>
            <span className="bd-meta">建议 {SD_LABEL[s.suggestedDate] || "本周"}</span>
            <span className="bd-meta">优先级 {SP_LABEL[s.priority] || "中"}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button className="btn btn-ghost btn-sm" onClick={onEdit}><Icon name="pen" size={13} />编辑</button>
          <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={onDelete} aria-label="删除"><Icon name="x" size={14} /></button>
        </div>
      </div>
    </div>
  );
}

function InternBreakdown({ setTab }) {
  const D = window.APP_DATA;
  const [todos, setTodos] = usePersist("ies6_todos", D.todos);
  const [bd, setBd] = usePersist("ies4_breakdown", { picked: null, result: null });
  const [editId, setEditId] = useState(null);
  const [reqText, setReqText] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = React.useRef(null);

  function reset() { setEditId(null); setReqText(""); setFiles([]); setErr(""); setLoading(false); }
  function pick(task) { setBd({ picked: task, result: null }); reset(); }
  function reselect() { setBd({ picked: null, result: null }); reset(); }
  function regen() { setBd(b => ({ ...b, result: null })); setEditId(null); }

  async function onFilePick(e) {
    const read = await readUploadedFiles(e.target.files);
    setFiles(f => [...f, ...read]);
    if (fileRef.current) fileRef.current.value = "";
  }
  function removeFile(i) { setFiles(f => f.filter((_, idx) => idx !== i)); }

  // 调用 AI 服务（当前为本地 mock，后续可在 aiService 中切换为真实后端）
  async function runBreakdown() {
    if (loading) return;
    setErr(""); setLoading(true);
    const p = bd.picked;
    const fileText = files.filter(f => f.isText && f.text).map(f => `【文件：${f.name}】\n${f.text}`).join("\n\n");
    const fileNames = files.filter(f => !f.isText).map(f => f.name).join("、");
    const description = [reqText.trim(), fileText, fileNames ? "相关文件：" + fileNames : ""].filter(Boolean).join("\n\n");
    const task = {
      title: p.name,
      description,
      deadline: p.ddl || "",
      priority: p.priority === "urgent" ? "urgent" : "normal",
      currentTodoList: todos.filter(t => t.status !== "done").map(t => t.name),
    };
    try {
      const res = await window.aiService.requestTaskBreakdown(task);
      const subs = (res && res.subtasks) || [];
      if (!subs.length) throw new Error("没有生成可执行的小任务，补充更具体的要求后再试一次");
      setBd(b => ({ ...b, result: { subtasks: subs, tips: res.tips || "" } }));
      window.toast("已生成拆解草稿", `把「${p.name}」拆成 ${subs.length} 个小任务，确认后再加入待办。`, "split");
    } catch (e) {
      setErr("生成失败，请稍后重试，或先手动编辑。");
    } finally {
      setLoading(false);
    }
  }

  const result = bd.result;
  const subtasks = (result && result.subtasks) || [];
  const selectedCount = subtasks.filter(s => s.selected).length;
  function updateSubs(updater) { setBd(b => ({ ...b, result: { ...b.result, subtasks: updater(b.result.subtasks) } })); }
  function toggleSub(id) { updateSubs(ss => ss.map(x => x.id === id ? { ...x, selected: !x.selected } : x)); }
  function saveSub(f) { updateSubs(ss => ss.map(x => x.id === f.id ? f : x)); setEditId(null); window.toast("已保存", "小任务内容已更新。", "check"); }
  function deleteSub(id) { updateSubs(ss => ss.filter(x => x.id !== id)); window.toast("已删除", "已从拆解草稿中移除该小任务。"); }

  function refOf() { return `由「${bd.picked ? bd.picked.name : "任务"}」拆解生成`; }
  // scope: "today" 仅纳入建议今天的（无则全部所选）；"week" 纳入全部所选
  function addTodos(scope) {
    const chosen = subtasks.filter(s => s.selected);
    if (!chosen.length) { window.toast("请先勾选小任务", "勾选要加入的小任务，再加入待办。", "alert"); return; }
    const toToday = scope === "today";
    let list = chosen;
    if (toToday) {
      const todayOnes = chosen.filter(s => s.suggestedDate === "today");
      list = todayOnes.length ? todayOnes : chosen;
    }
    const ref = refOf();
    const fresh = list.filter(s => !todos.some(t => t.name === s.title && t.sourceRef === ref));
    if (!fresh.length) { window.toast("已在待办中", "所选小任务都已经加入待办了。", "list"); return; }
    const base = Date.now();
    const items = fresh.map((s, i) => ({
      id: "sp" + base + "-" + i, name: s.title, description: s.description || "",
      source: "任务拆解", srcType: "split", sourceRef: ref, sourceTaskId: bd.picked.id,
      acceptance: s.description || "（待补充验收标准）", estimate: s.estimatedMinutes ? s.estimatedMinutes + " 分钟" : "未估时",
      status: "todo", scope: toToday ? "today" : "week", week: "this",
      sortOrder: base + i, isCarriedOver: false, carriedFromDate: "",
    }));
    setTodos(ts => [...ts, ...items]); // 追加到末尾，不自动置顶
    window.toast(toToday ? "已加入今日待办" : "已加入本周待办", `${items.length} 个小任务已加入${toToday ? "今日" : "本周"}待办，可在待办页拖动排序。`, "check");
  }

  if (!bd.picked) {
    return <div className="scroll"><BreakdownEmpty onPick={pick} todos={todos} /></div>;
  }

  const p = bd.picked;
  const meta = D.priorityMeta[p.priority];
  return (
    <div className="scroll">
      <div className="flow page-enter">
        <div className="page-head">
          <div className="page-h1">智能任务拆解</div>
          <div className="page-desc">把模糊任务拆成今天能开始的小步骤</div>
        </div>

        {/* 当前拆解任务 */}
        <div className="card card-pad">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
            <span className="sec-ico" style={{ marginTop: 1 }}><Icon name="split" size={15} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="card-sub" style={{ fontSize: 11.5 }}>当前拆解任务</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)", marginTop: 3, display: "flex", alignItems: "center", gap: 8 }}>
                {p.name}
                {p.priority === "urgent" && <span className="chip chip-red" style={{ fontSize: 10.5 }}><Icon name="alert" size={11} strokeMode />紧急</span>}
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={reselect}><Icon name="refresh" size={13} />重新选择</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 22, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line-2)" }}>
            <div><div className="task-meta-k">来源</div><div style={{ fontSize: 13, color: "var(--t2)", marginTop: 4 }}>{p.freeform ? "直接描述" : "本周待办 · " + SRC_LABEL[srcTypeOf(p)]}</div></div>
            <div><div className="task-meta-k">截止时间</div><div style={{ fontSize: 13, color: "var(--t2)", marginTop: 4 }}>{p.ddl || "未设置"}</div></div>
          </div>
        </div>

        {/* 拆解输入 */}
        {!result && (
          <div className="card card-pad">
            <div className="card-title">补充背景，让拆解更贴合</div>
            <div className="card-sub" style={{ marginTop: 2, marginBottom: 14 }}>把需求文档、设计说明、验收要求贴上来或上传，作为拆解依据。</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div className="field-label">任务背景与具体要求 · 选填</div>
                <textarea className="field" style={{ minHeight: 88 }} value={reqText} onChange={e => setReqText(e.target.value)} placeholder="例如：本次需求评审涉及会员权益弹窗，周三前要产出交互记录，重点说明改动范围、影响的接口和验收点……" />
              </div>
              <div>
                <div className="field-label">相关文件 · 选填（支持 txt / md / json / csv 等文本文件）</div>
                <div className="bd-upload" onClick={() => fileRef.current && fileRef.current.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={async e => { e.preventDefault(); const r = await readUploadedFiles(e.dataTransfer.files); setFiles(f => [...f, ...r]); }}>
                  <Icon name="doc" size={18} color="var(--blue)" />
                  <span>点击上传，或把需求 / 设计文件拖到这里</span>
                  <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={onFilePick} />
                </div>
                {files.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                    {files.map((f, i) => (
                      <span key={i} className={"bd-file" + (f.isText ? "" : " warn")}>
                        <Icon name="doc" size={12} />{f.name}{!f.isText && <em>未读取正文</em>}
                        <button onClick={() => removeFile(i)} aria-label="移除"><Icon name="x" size={11} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {err && <div className="bd-err"><Icon name="alert" size={14} color="var(--red)" />{err}</div>}
              <div>
                <button className="btn btn-primary" disabled={loading} onClick={runBreakdown}>
                  {loading ? <><span className="bd-spin" />正在生成任务拆解草稿…</> : <><Icon name="split" size={14} />开始拆解</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 拆解草稿 */}
        {result && (
          <div className="card card-pad">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
              <div>
                <div className="card-title">拆解草稿</div>
                <div className="card-sub" style={{ marginTop: 2 }}>已生成拆解草稿，你可以修改后加入待办（默认不会自动加入今日）。</div>
              </div>
              <span className="chip chip-blue" style={{ marginLeft: "auto" }}>已选 {selectedCount} / {subtasks.length}</span>
            </div>
            {result.tips && <div className="bd-tips"><Icon name="light" size={14} color="var(--blue)" /><span>{result.tips}</span></div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 12 }}>
              {subtasks.length === 0 && <div style={{ padding: "16px 0", textAlign: "center", color: "var(--t4)", fontSize: 13 }}>小任务已清空，可点「重新拆解」再生成。</div>}
              {subtasks.map(s => (
                <SubtaskRow key={s.id} s={s}
                  editing={editId === s.id}
                  onToggle={() => toggleSub(s.id)}
                  onEdit={() => setEditId(s.id)}
                  onSave={saveSub} onCancel={() => setEditId(null)}
                  onDelete={() => deleteSub(s.id)} />
              ))}
            </div>
            <div className="bd-actions">
              <button className="btn btn-primary btn-sm" disabled={!selectedCount} onClick={() => addTodos("today")}><Icon name="plus" size={13} />加入今日待办</button>
              <button className="btn btn-soft btn-sm" disabled={!selectedCount} onClick={() => addTodos("week")}><Icon name="calendar" size={13} />加入本周待办</button>
              <button className="btn btn-ghost btn-sm" onClick={regen}><Icon name="refresh" size={13} />重新拆解</button>
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={reselect}>清空当前任务</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InternWorkbench({ tab, setTab }) {
  return (
    <>
      {tab === "today" && <InternToday setTab={setTab} />}
      {tab === "path" && <InternBreakdown setTab={setTab} />}
      {tab === "report" && <ReportModule setTab={setTab} />}
    </>
  );
}

Object.assign(window, { InternWorkbench });
