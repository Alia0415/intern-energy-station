/* ============ HR 工作台 · 看组织，不盯个人 ============
   三页：组织总览 / 问题与支持 / 岗位适配
   原则：能量化就量化、能对应操作才展示、组织问题不归因到个人 ============ */

const TONE_C = { blue: "var(--blue)", green: "var(--green)", orange: "var(--orange)", red: "var(--red)", gray: "var(--t3)" };
const TONE_BG = { blue: "var(--blue-soft)", green: "var(--green-soft)", orange: "var(--orange-soft)", red: "var(--red-soft)", gray: "var(--surface-2)" };

/* ---------- 公用小件 ---------- */
function ModTitle({ children, sub }) {
  return (
    <div className="hr-mod">
      <span className="hr-mod-t">{children}</span>
      {sub && <span className="hr-mod-s">{sub}</span>}
    </div>
  );
}

function Field({ label, children }) {
  return <span className="hr-field"><span className="hr-field-l">{label}</span>{children}</span>;
}

/* 「查看来源」链接 —— 仅当该主题存在可追溯的原始记录时展示 */
function SourceLink({ topic, openSource }) {
  if (!topic || !window.APP_DATA.issueSources || !window.APP_DATA.issueSources[topic]) return null;
  return (
    <button className="src-link" onClick={(e) => { e.stopPropagation(); openSource(topic); }}>
      查看来源<Icon name="arrowRight" size={11} />
    </button>
  );
}

/* ---------- 数据来源抽屉：把聚合数字下钻到逐条原始记录 ---------- */
const VIA_TONE = { "日报": "blue", "求助": "orange", "周报": "purple", "本周待办": "gray" };
function SourceDrawer({ src, onAct, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const shown = src.records.length;
  const total = shown + (src.more || 0);
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="drawer-title">{src.title}</div>
            <div className="drawer-sub">数据依据 · {src.metric}</div>
          </div>
          <button className="icon-btn" style={{ width: 32, height: 32, border: "none" }} onClick={onClose} aria-label="关闭"><Icon name="x" size={16} /></button>
        </div>
        <div className="drawer-body">
          {/* 原始记录 —— 每条聚合数字背后的真实反馈 */}
          <div>
            <div className="src-sec-h">
              <span className="task-meta-k" style={{ fontSize: 12 }}>原始记录</span>
              <span className="src-sec-count">展示 {shown} / {total} 条</span>
            </div>
            <div className="src-collect">{src.collect}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {src.records.map((r, i) => (
                <div key={i} className="src-row">
                  <Avatar person={{ name: r.who }} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="src-row-top">
                      <span className="src-who">{r.who}</span>
                      <span className="src-role">{r.role}</span>
                      <span className={`spill chip-${VIA_TONE[r.via] || "gray"}`} style={{ fontSize: 10.5 }}>{r.via}</span>
                      {r.wait && <span className="spill chip-red" style={{ fontSize: 10.5 }}>{r.wait}未响应</span>}
                      <span className="src-date">{r.date}</span>
                    </div>
                    <div className="src-quote">{r.quote}</div>
                    {r.mentor && <div className="src-mentor">带教导师 · {r.mentor}</div>}
                  </div>
                </div>
              ))}
            </div>
            {src.more > 0 && <div className="src-more">另有 {src.more} 条同类记录已归并到此问题，规则一致、不再逐条展示。</div>}
          </div>

          {/* 影响范围 + 建议动作 */}
          <div className="src-foot-grid">
            <div className="src-kv"><div className="src-kv-k">影响范围</div><div className="src-kv-v">{src.scope}</div></div>
            <div className="src-kv"><div className="src-kv-k">建议动作</div><div className="src-kv-v">{src.action}</div></div>
          </div>
        </div>
        <div className="drawer-foot">
          {src.btn
            ? <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => onAct && onAct(src)}>{src.btn}</button>
            : <span className="src-foot-note">来源为系统自动归类，可在「问题与支持」进一步处理</span>}
        </div>
      </div>
    </div>
  );
}

/* 指标卡 —— 每张含计算口径，趋势仅在有数据依据时展示 */
function OrgKpi({ m }) {
  return (
    <div className="kpi">
      <div className="kpi-top">
        <span className="kpi-ic" style={{ background: TONE_BG[m.tone], color: TONE_C[m.tone] }}><Icon name={m.ico} size={16} /></span>
        <span className="kpi-label">{m.k}</span>
        {m.trend && (
          <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: m.up ? "var(--green)" : "var(--red)", display: "inline-flex", alignItems: "center", gap: 2 }}>
            <Icon name={m.up ? "arrowUp" : "arrowDown"} size={12} />{m.trend}
          </span>
        )}
      </div>
      <div className="kpi-val num">{m.v}<span className="u">{m.u}</span></div>
      <div className="kpi-foot">{m.basis}</div>
    </div>
  );
}

/* ============ 1 · 组织总览 ============ */
function HROverview({ setTab, openSource }) {
  const D = window.APP_DATA;
  return (
    <div className="scroll">
      <div className="flow-wide page-enter">
        <div className="page-head">
          <div className="page-h1">组织总览</div>
          <div className="page-desc">查看本周实习运行指标和需要 HR 处理的事项 · 更新于 今天 11:30</div>
        </div>

        {/* 整体指标 */}
        <div>
          <ModTitle sub="20 人 · 30 天适应期 · 数值后为计算口径">整体指标</ModTitle>
          <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
            {D.overviewMetrics.map(m => <OrgKpi key={m.k} m={m} />)}
          </div>
        </div>

        {/* 实习流程风险 —— HR 待协调事项：集中式列表，细节进抽屉 */}
        <HRExceptions />
      </div>
    </div>
  );
}

/* —— 实习异常跟进：集中式列表 + 详情抽屉 + 记录处理 —— */
function HRExceptions() {
  const D = window.APP_DATA;
  const [rows, setRows] = useState(() => D.internExceptions.map(r => ({ ...r, reminded: false })));
  const [openId, setOpenId] = useState(null);
  const ex = rows.find(x => x.id === openId);
  const GRID = "0.9fr 0.7fr 1fr 0.65fr 0.95fr 188px";

  function remind(id) {
    const t = rows.find(x => x.id === id);
    setRows(p => p.map(x => x.id === id ? { ...x, reminded: true, lastFollow: `已记录跟进动作：${t ? t.toastMsg : ""}` } : x));
    if (t) window.toast("已记录跟进动作", t.toastMsg, "checkCircle");
  }

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="hr-card-head">
        <span className="hr-card-t">实习流程风险</span>
      </div>

      <div className="hrt-summary">当前有 <b className="num">{rows.length}</b> 个流程风险需要 HR 协调推动。</div>

      <div className="hr-thead" style={{ gridTemplateColumns: GRID }}>
        <span>实习生</span><span>责任人</span><span>风险类型</span><span>卡住时长</span><span>HR 动作</span><span></span>
      </div>
      {rows.map(e => (
        <div key={e.id} className="hr-trow" style={{ gridTemplateColumns: GRID }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Avatar person={{ name: e.name }} size={28} />
            <span style={{ fontWeight: 700, color: "var(--t1)" }}>{e.name}</span>
          </div>
          <div style={{ color: "var(--t2)" }}>{e.owner}</div>
          <div style={{ color: "var(--t1)", fontWeight: 600 }}>{e.riskType}</div>
          <div style={{ color: e.overdue ? "var(--red)" : "var(--t2)", fontWeight: e.overdue ? 600 : 400 }}>{e.stuck}</div>
          <div style={{ color: "var(--t2)" }}>{e.hrAction}</div>
          <div className="exc-ops">
            <button className="btn btn-ghost btn-sm" onClick={() => setOpenId(e.id)}>查看详情</button>
            {e.reminded
              ? <span className="hrt-done"><Icon name="check" size={14} />{e.done}</span>
              : <button className="btn btn-primary btn-sm" onClick={() => remind(e.id)}>{e.btn}</button>}
          </div>
        </div>
      ))}

      {ex && <ExceptionDrawer ex={ex} onClose={() => setOpenId(null)} onRemind={(id) => { remind(id); setOpenId(null); }} />}
    </div>
  );
}

/* 流程风险详情抽屉：完整字段 + HR 协调动作（HR 只推动，不替责任人完成） */
function ExceptionDrawer({ ex, onClose, onRemind }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="drawer-title">流程风险详情</div>
            <div className="drawer-sub">HR 负责协调推动，不直接替代责任人完成任务</div>
          </div>
          <button className="icon-btn" style={{ width: 32, height: 32, border: "none" }} onClick={onClose} aria-label="关闭"><Icon name="x" size={16} /></button>
        </div>
        <div className="drawer-body">
          <div className="exc-kv"><div className="exc-kv-k">实习生</div><div className="exc-kv-v">{ex.name} · {ex.dept}</div></div>
          <div className="exc-kv"><div className="exc-kv-k">当前责任人</div><div className="exc-kv-v">{ex.owner}</div></div>
          <div className="exc-kv"><div className="exc-kv-k">风险类型</div><div className="exc-kv-v">{ex.riskType}</div></div>
          <div className="exc-kv"><div className="exc-kv-k">卡住时长</div><div className="exc-kv-v" style={ex.overdue ? { color: "var(--red)", fontWeight: 600 } : null}>{ex.stuck}</div></div>
          <div className="exc-kv"><div className="exc-kv-k">风险说明</div><div className="exc-kv-v">{ex.desc}</div></div>
          <div className="exc-kv"><div className="exc-kv-k">建议 HR 动作</div><div className="exc-kv-v" style={{ color: "var(--blue)", fontWeight: 600 }}>{ex.hrAdvice}</div></div>
          <div className="exc-kv"><div className="exc-kv-k">最近一次跟进记录</div><div className="exc-kv-v" style={{ color: "var(--t3)" }}>{ex.lastFollow}</div></div>
        </div>
        <div className="drawer-foot">
          <button className="btn btn-ghost" onClick={onClose}>关闭</button>
          {ex.reminded
            ? <span className="hrt-done" style={{ marginLeft: "auto" }}><Icon name="check" size={14} />{ex.done}</span>
            : <button className="btn btn-primary" onClick={() => onRemind(ex.id)}>{ex.btn}</button>}
        </div>
      </div>
    </div>
  );
}

/* ============ 2 · 问题与支持 ============ */
function HRIssues({ openSource }) {
  const D = window.APP_DATA;
  return (
    <div className="scroll">
      <div className="flow-wide page-enter">
        <div className="page-head">
          <div className="page-h1">问题与支持</div>
          <div className="page-desc">查看本周高频问题，以及 HR 今天需要处理的事项</div>
        </div>

        {/* 高频问题 Top 5 —— 列表只呈现问题本身，数据依据与原始记录点进去看 */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="hr-card-head">
            <span className="hr-card-t">高频问题</span>
            <span className="hr-mod-s">本周采集 50 条反馈语义归类 · Top 5 · 点击查看原始记录</span>
          </div>
          {D.hotIssues.map((it, i) => (
            <button key={it.rank} className="hot-issue-row" style={{ borderTop: i === 0 ? "none" : "1px solid var(--line-2)" }} onClick={() => openSource(it.topic)}>
              <span className="num hot-issue-rank">{it.rank}</span>
              {it.urgent && <span className="hot-issue-dot" />}
              <span className="hot-issue-name">{it.name}</span>
              <span className="hot-issue-go">查看详情<Icon name="arrowRight" size={13} /></span>
            </button>
          ))}
        </div>

        {/* HR 待处理事项 —— 合并自原「支持动作 + 导师协同事项」，只留今天要处理的 */}
        <HRTasks />
      </div>
    </div>
  );
}

/* —— HR 待处理事项：务实待办列表（系统按业务记录触发，HR 看详情后自行判断）—— */
const HRT_STATUS_TONE = { "待确认": "gray", "已超时": "red", "已解决": "green" };

function HRTasks() {
  const D = window.APP_DATA;
  const [rows, setRows] = useState(() => D.hrTasks.map(t => ({ ...t, note: "" })));
  const [openId, setOpenId] = useState(null);
  const cur = rows.find(x => x.id === openId);

  const pending = rows.filter(t => t.status !== "已解决");
  const overdue = rows.filter(t => t.status === "已超时").length;
  const GRID = "0.82fr 0.82fr 1.55fr 0.85fr 0.78fr 0.62fr 92px";

  function saveNote(id, note) {
    setRows(p => p.map(x => x.id === id ? { ...x, note } : x));
    window.toast("跟进记录已保存", "本条事项的跟进备注已更新。", "checkCircle");
  }
  function resolve(id, note) {
    setRows(p => p.map(x => x.id === id ? { ...x, status: "已解决", note } : x));
    window.toast("已标记解决", "本条待确认事项已标记为已解决。", "checkCircle");
    setOpenId(null);
  }

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="hr-card-head">
        <span className="hr-card-t">HR 待处理事项</span>
      </div>

      <div className="hrt-summary">
        当前有 <b className="num">{pending.length}</b> 条待确认事项
        {overdue > 0 && <>，其中 <b className="num hrt-od-txt">{overdue}</b> 条已超时</>}。
      </div>

      <div className="hr-thead" style={{ gridTemplateColumns: GRID }}>
        <span>事项来源</span><span>涉及对象</span><span>触发原因</span><span>当前责任人</span><span>截止时间</span><span>状态</span><span></span>
      </div>
      {rows.map(t => (
        <div key={t.id} className="hr-trow" style={{ gridTemplateColumns: GRID, opacity: t.status === "已解决" ? 0.62 : 1 }}>
          <div style={{ color: "var(--t2)" }}>{t.source}</div>
          <div style={{ color: "var(--t2)" }}>{t.target}</div>
          <div style={{ color: "var(--t1)", fontWeight: 600 }}>{t.reason}</div>
          <div style={{ color: "var(--t2)" }}>{t.owner}</div>
          <div style={{ color: t.status === "已超时" ? "var(--red)" : "var(--t2)", fontWeight: t.status === "已超时" ? 600 : 400 }}>{t.ddl}</div>
          <div><span className={`chip chip-${HRT_STATUS_TONE[t.status]}`} style={{ fontSize: 11.5 }}>{t.status}</span></div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpenId(t.id)}>查看详情</button>
          </div>
        </div>
      ))}

      {cur && <HRTaskDrawer item={cur} onClose={() => setOpenId(null)} onSaveNote={saveNote} onResolve={resolve} />}
    </div>
  );
}

/* 待处理事项详情弹窗：来源 / 触发规则 / 原始记录 / HR 备注；HR 自行判断处理 */
function HRTaskDrawer({ item, onClose, onSaveNote, onResolve }) {
  const [note, setNote] = useState(item.note || "");
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const done = item.status === "已解决";
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="drawer-title">待处理事项详情</div>
            <div className="drawer-sub">由系统已有业务记录触发，HR 核对来源后自行判断是否沟通、备注或标记解决</div>
          </div>
          <button className="icon-btn" style={{ width: 32, height: 32, border: "none" }} onClick={onClose} aria-label="关闭"><Icon name="x" size={16} /></button>
        </div>
        <div className="drawer-body">
          <div className="exc-kv"><div className="exc-kv-k">事项来源</div><div className="exc-kv-v">{item.source}</div></div>
          <div className="exc-kv"><div className="exc-kv-k">触发规则</div><div className="exc-kv-v">{item.rule}</div></div>
          <div className="exc-kv"><div className="exc-kv-k">涉及对象</div><div className="exc-kv-v">{item.target}</div></div>
          <div className="exc-kv"><div className="exc-kv-k">当前责任人</div><div className="exc-kv-v">{item.owner}</div></div>
          <div className="exc-kv"><div className="exc-kv-k">截止时间</div><div className="exc-kv-v" style={item.status === "已超时" ? { color: "var(--red)", fontWeight: 600 } : null}>{item.ddl}{item.status === "已超时" && " · 已超时"}</div></div>

          <div className="hrt-rec">
            <div className="exc-kv-k" style={{ marginBottom: 10 }}>原始记录</div>
            <div className="hrt-rec-list">
              {item.record.map(r => (
                <div key={r.k} className="hrt-rec-row">
                  <span className="hrt-rec-k">{r.k}</span>
                  <span className="hrt-rec-v">{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 0 }}>
            <div className="field-label" style={{ marginBottom: 7 }}>HR 备注</div>
            <textarea
              className="field"
              rows={3}
              style={{ width: "100%", resize: "vertical", lineHeight: 1.6 }}
              placeholder="请输入跟进记录，例如：已联系带教补充验收标准。"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
        </div>
        <div className="drawer-foot">
          <button className="btn btn-ghost" onClick={onClose}>取消</button>
          <button className="btn btn-soft" onClick={() => onSaveNote(item.id, note)}>保存备注</button>
          {!done && <button className="btn btn-primary" onClick={() => onResolve(item.id, note)}>标记已解决</button>}
        </div>
      </div>
    </div>
  );
}

/* ============ 3 · 岗位适配 ============ */
function HRFit() {
  const D = window.APP_DATA;
  return (
    <div className="scroll">
      <div className="flow-wide page-enter">
        <div className="page-head">
          <div className="page-h1">岗位适配</div>
          <div className="page-desc">基于任务完成、日报周报和导师反馈，观察实习生与当前岗位是否存在错配信号</div>
        </div>

        {/* 适配概览 */}
        <div>
          <ModTitle sub="按下方量化规则自动判定 · 正常 = 总人数 − 已标记">适配概览</ModTitle>
          <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
            {D.fitOverview.map(f => (
              <div key={f.k} className="kpi">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="dot" style={{ width: 8, height: 8, borderRadius: 3, background: TONE_C[f.tone] }} />
                  <span className="kpi-label">{f.k}</span>
                </div>
                <div className="kpi-val num" style={{ color: f.tone === "gray" ? "var(--t1)" : TONE_C[f.tone] }}>{f.v}<span className="u">{f.u}</span></div>
                <div className="kpi-foot" style={{ lineHeight: 1.55 }}>{f.rule}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 岗位适配观察 */}
        <div>
          <ModTitle sub="只展示信号与建议动作，不对实习生能力下判断">岗位适配观察</ModTitle>
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="hr-thead" style={{ gridTemplateColumns: "0.8fr 0.7fr 1fr 1.1fr 1.2fr 1.3fr" }}>
              <span>实习生</span><span>当前岗位</span><span>当前状态</span><span>主要信号</span><span>数据依据</span><span>建议动作</span>
            </div>
            {D.fitObservations.map(o => {
              const st = D.fitState[o.state];
              return (
                <div key={o.name} className="hr-trow" style={{ gridTemplateColumns: "0.8fr 0.7fr 1fr 1.1fr 1.2fr 1.3fr" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <Avatar person={{ name: o.name }} size={28} />
                    <span style={{ fontWeight: 700, color: "var(--t1)" }}>{o.name}</span>
                  </div>
                  <div style={{ color: "var(--t2)" }}>{o.post}</div>
                  <div><span className={`spill chip-${st.tone}`} title={(D.fitRules[o.state] || {}).rule || ""} style={{ fontSize: 11.5, cursor: "help" }}><span className="dot" style={{ background: st.c }} />{o.state}</span></div>
                  <div style={{ color: "var(--t2)" }}>{o.signal}</div>
                  <div style={{ color: "var(--t2)" }}>{o.basis}</div>
                  <div style={{ color: "var(--t2)" }}>{o.action}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 判定规则（量化阈值）· 每个状态如何被判定 */}
        <details className="hr-signals" open>
          <summary>
            <span className="hr-chev" style={{ display: "inline-flex" }}><Icon name="chevron" size={13} strokeMode /></span>
            判定规则 · 每个状态由哪条量化阈值触发
          </summary>
          <div className="hr-signals-body">
            <div className="fit-rule-list">
              {Object.entries(D.fitRules).map(([k, r]) => (
                <div key={k} className="fit-rule-row">
                  <span className={`spill chip-${r.tone}`} style={{ fontSize: 11.5, flexShrink: 0 }}><span className="dot" style={{ background: r.c }} />{r.label}</span>
                  <span className="fit-rule-text">{r.rule}</span>
                </div>
              ))}
            </div>
            <div className="hr-signals-note">
              须先区分「岗位错配」与「组织支持不足」：若问题来自工具、权限或任务说明不清，先归入组织问题处理，不归因到个人岗位。岗位适配只做观察、不下能力结论。
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

function HRWorkbench({ tab, setTab }) {
  const [srcKey, setSrcKey] = useState(null);
  const D = window.APP_DATA;
  const src = srcKey && D.issueSources ? D.issueSources[srcKey] : null;
  function onAct(s) {
    setSrcKey(null);
    if (s.btn === "去协调") window.toast("已发起导师协调", `「${s.title}」已转入导师协同事项，提醒相关导师补充反馈。`, "mentor");
    else window.toast("已创建支持动作", `「${s.title}」已加入支持动作清单，请指派负责人与截止时间。`, "light");
  }
  return (
    <>
      {tab === "overview" && <HROverview setTab={setTab} openSource={setSrcKey} />}
      {tab === "issues" && <HRIssues openSource={setSrcKey} />}
      {tab === "fit" && <HRFit />}
      {src && <SourceDrawer src={src} onAct={onAct} onClose={() => setSrcKey(null)} />}
    </>
  );
}

Object.assign(window, { HRWorkbench });
