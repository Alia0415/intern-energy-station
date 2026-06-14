/* ============ 带教工作台 · 简洁实用 ============
   带教只做 4 件事：
   1. 查看我的实习生
   2. 给实习生发布任务
   3. 接收并查看实习生提交
   4. 给提交内容反馈或要求修改
   三个入口：我的实习生 / 发布任务 / 任务处理 ============ */

/* 卡片「发布任务」跳转发布任务页时，临时带过去的预选实习生 */
let pendingPublishMentee = null;

/* 提交状态标签（待反馈蓝 / 已反馈灰 / 需修改橙） */
const SUB_STATUS = {
  pending:  { label: "待反馈", cls: "chip-blue" },
  feedback: { label: "已反馈", cls: "chip-gray" },
  revision: { label: "需修改", cls: "chip-orange" },
};

/* 统一头像：浅蓝底，不按人换色 */
function FlatAvatar({ person, size = 34 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "var(--blue-soft)", color: "var(--blue)",
      display: "grid", placeItems: "center", fontWeight: 700, fontSize: size * 0.4, flexShrink: 0 }}>
      {person.initial || (person.name || "")[0]}
    </div>
  );
}

/* ---------- 我的实习生卡片 ---------- */
function MenteeCard({ it, taskCount, lastSubmit, onDetail, onPublish }) {
  return (
    <div className="card card-pad mentee-card">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <FlatAvatar person={it} size={42} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>{it.name}</div>
          <div className="card-sub" style={{ fontSize: 12, marginTop: 3 }}>{it.title} · 入职 Day {it.day}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 28, marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line-2)" }}>
        <div>
          <div className="num" style={{ fontSize: 18, fontWeight: 700, color: "var(--t1)" }}>{taskCount}</div>
          <div className="card-sub" style={{ fontSize: 11.5, marginTop: 3 }}>当前任务</div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--t2)" }}>{lastSubmit}</div>
          <div className="card-sub" style={{ fontSize: 11.5, marginTop: 3 }}>最近一次提交</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
        <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={onDetail}>查看详情</button>
        <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={onPublish}>发布任务</button>
      </div>
    </div>
  );
}

/* ---------- 提交行（任务处理页） ---------- */
function SubmissionRow({ s, onView }) {
  const st = SUB_STATUS[s.status] || SUB_STATUS.pending;
  return (
    <div className="sub-row">
      <FlatAvatar person={{ name: s.name }} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--t1)" }}>{s.name}</span>
          <span className={`chip ${st.cls}`} style={{ fontSize: 11 }}>{st.label}</span>
          <span className="card-sub" style={{ marginLeft: "auto", fontSize: 11.5, flexShrink: 0 }}>{s.at}</span>
        </div>
        <div className="truncate" style={{ fontSize: 13, color: "var(--t2)", marginTop: 5 }}>{s.task}</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => onView(s, false)}>查看提交</button>
        {s.status === "pending"
          ? <button className="btn btn-primary btn-sm" onClick={() => onView(s, true)}>给反馈</button>
          : <button className="btn btn-ghost btn-sm" onClick={() => onView(s, true)}>查看反馈</button>}
      </div>
    </div>
  );
}

/* ===================== 入口 1 · 我的实习生 ===================== */
function MentorHome({ mentees, assignments, submissions, onDetail, onPublish, setTab }) {
  const lastSubmitOf = id => { const list = submissions.filter(s => s.menteeId === id); return list.length ? list[0].at : "—"; };
  const pending = submissions.filter(s => s.status === "pending");
  return (
    <div className="scroll">
      <div className="flow-wide page-enter">
        <div className="page-head">
          <div className="page-h1">我的实习生</div>
          <div className="page-desc">查看带教中的实习生与当前任务情况</div>
        </div>

        {/* 轻量提示：待处理提交数量，点击跳转任务处理 */}
        {pending.length > 0 && (
          <button className="pending-hint" onClick={() => setTab("process")}>
            <Icon name="inbox" size={15} />
            <span style={{ whiteSpace: "nowrap" }}>有 <strong>{pending.length}</strong> 条待处理提交</span>
            <span className="pending-hint-go">去处理<Icon name="arrowRight" size={13} /></span>
          </button>
        )}

        <div className="mentee-grid">
          {mentees.map(it => (
            <MenteeCard key={it.id} it={it} taskCount={(assignments[it.id] || []).length} lastSubmit={lastSubmitOf(it.id)}
              onDetail={() => onDetail(it.id)} onPublish={() => onPublish(it.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- 发布任务表单字段（页面内 / 抽屉内共用） ---------- */
function PublishFields({ mentees, f, setF }) {
  return (
    <>
      <div>
        <div className="field-label">选择实习生</div>
        <select className="field" value={f.menteeId} onChange={e => setF({ ...f, menteeId: Number(e.target.value) })}>
          {mentees.map(m => <option key={m.id} value={m.id}>{m.name} · {m.title}</option>)}
        </select>
      </div>
      <div>
        <div className="field-label">任务标题 <span className="field-req">*</span></div>
        <input className="field" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="例如：完成订单列表页接口联调" />
      </div>
      <div>
        <div className="field-label">任务说明</div>
        <textarea className="field" style={{ minHeight: 96 }} value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })} placeholder="说明任务背景、要求和验收标准" />
      </div>
      <div>
        <div className="field-label">截止时间</div>
        <input className="field" value={f.ddl} onChange={e => setF({ ...f, ddl: e.target.value })} placeholder="例如：6月14日 18:00" />
      </div>
      <label className="check-line">
        <input type="checkbox" checked={f.urgent} onChange={e => setF({ ...f, urgent: e.target.checked })} />
        <span>设为紧急任务</span>
      </label>
    </>
  );
}

/* ===================== 入口 2 · 发布任务 ===================== */
function PublishTab({ mentees, assignments, onSubmit }) {
  const [f, setF] = useState(() => {
    const id = (pendingPublishMentee && mentees.some(m => m.id === pendingPublishMentee)) ? pendingPublishMentee : mentees[0].id;
    pendingPublishMentee = null;
    return { menteeId: id, name: "", desc: "", ddl: "", urgent: false };
  });
  const all = [];
  mentees.forEach(m => (assignments[m.id] || []).forEach(a => all.push({ ...a, menteeName: m.name })));

  function submit() {
    if (!f.name.trim()) { window.toast("请填写任务标题", "给任务起个清晰的标题，实习生才知道要做什么。", "alert"); return; }
    onSubmit(f);
    setF({ menteeId: f.menteeId, name: "", desc: "", ddl: "", urgent: false });
  }

  return (
    <div className="scroll">
      <div className="flow page-enter">
        <div className="page-head">
          <div className="page-h1">发布任务</div>
          <div className="page-desc">给实习生发布任务并设置截止时间</div>
        </div>

        {/* 任务发布表单 */}
        <div className="card card-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <PublishFields mentees={mentees} f={f} setF={setF} />
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 2 }}>
            <button className="btn btn-primary" onClick={submit}><Icon name="flag" size={14} />发布任务</button>
          </div>
        </div>

        {/* 最近发布（仅历史记录） */}
        <div>
          <div className="sec-row"><div className="sec-title">最近发布</div><span className="card-sub">{all.length} 条</span></div>
          <div className="card" style={{ overflow: "hidden" }}>
            {all.length === 0 && <div style={{ padding: "26px 0", textAlign: "center", color: "var(--t4)", fontSize: 13 }}>还没有发布任务。</div>}
            {all.map((a, i) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: i < all.length - 1 ? "1px solid var(--line-2)" : "none" }}>
                <FlatAvatar person={{ name: a.menteeName }} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="truncate" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--t1)" }}>{a.name}</span>
                    {a.priority === "urgent" && <span className="chip chip-red" style={{ fontSize: 10.5, flexShrink: 0 }}>紧急</span>}
                  </div>
                  <div className="card-sub" style={{ fontSize: 11.5, marginTop: 3 }}>{a.menteeName} · {a.date} 发布{a.ddl ? " · 截止 " + a.ddl : ""}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== 入口 3 · 任务处理（提交 + 反馈合并） ===================== */
function ProcessTab({ submissions, onView }) {
  const [filter, setFilter] = useState("all");
  const tabs = [["all", "全部"], ["pending", "待反馈"], ["feedback", "已反馈"], ["revision", "需修改"]];
  const countOf = k => k === "all" ? submissions.length : submissions.filter(s => s.status === k).length;
  const list = submissions.filter(s => filter === "all" ? true : s.status === filter);
  return (
    <div className="scroll">
      <div className="flow page-enter">
        <div className="page-head">
          <div className="page-h1">任务处理</div>
          <div className="page-desc">查看实习生提交并给予反馈</div>
        </div>

        <div className="card card-pad">
          <div className="tabbar" style={{ marginBottom: 16 }}>
            {tabs.map(([k, label]) => (
              <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{label}<span className="tabbar-count">{countOf(k)}</span></button>
            ))}
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            {list.length === 0 && <div style={{ padding: "26px 0", textAlign: "center", color: "var(--t4)", fontSize: 13 }}>暂无提交。</div>}
            {list.map((s, i) => (
              <div key={s.id} style={{ borderBottom: i < list.length - 1 ? "1px solid var(--line-2)" : "none" }}>
                <SubmissionRow s={s} onView={onView} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== 抽屉：查看提交 + 给反馈 ===================== */
function SubmissionDrawer({ sub, focusFeedback, onClose, onSend }) {
  const [text, setText] = useState(sub.feedback || "");
  const [result, setResult] = useState(sub.needRevision ? "revision" : "pass"); // pass 通过 / revision 需修改
  const fbRef = useRef(null);
  const st = SUB_STATUS[sub.status] || SUB_STATUS.pending;
  const isPending = sub.status === "pending";
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    if (focusFeedback && fbRef.current) fbRef.current.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  function send() {
    if (!text.trim()) { window.toast("请填写反馈内容", "写下你的反馈，实习生才知道下一步怎么做。", "alert"); return; }
    onSend(sub.id, { feedback: text.trim(), needRevision: result === "revision" });
  }
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-head">
          <FlatAvatar person={{ name: sub.name }} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", display: "flex", alignItems: "center", gap: 8 }}>{sub.name}<span className={`chip ${st.cls}`} style={{ fontSize: 11 }}>{st.label}</span></div>
            <div className="card-sub" style={{ marginTop: 3 }}>提交于 {sub.at}</div>
          </div>
          <button className="icon-btn" style={{ width: 32, height: 32, border: "none" }} onClick={onClose} aria-label="关闭"><Icon name="x" size={16} /></button>
        </div>
        <div className="drawer-body">
          <div>
            <div className="task-meta-k" style={{ marginBottom: 5 }}>任务标题</div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--t1)" }}>{sub.task}</div>
          </div>
          <div>
            <div className="task-meta-k" style={{ marginBottom: 5 }}>提交内容</div>
            <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7 }}>{sub.note}</div>
          </div>
          {sub.attach && (
            <div>
              <div className="task-meta-k" style={{ marginBottom: 6 }}>附件</div>
              <span className="attach-chip"><Icon name="link" size={13} />{sub.attach}</span>
            </div>
          )}

          <div className="divider" />

          {isPending ? (
            <>
              <div>
                <div className="field-label">反馈内容 <span className="field-req">*</span></div>
                <textarea ref={fbRef} className="field" style={{ minHeight: 88 }} value={text} onChange={e => setText(e.target.value)} placeholder="写下你的反馈、修改建议或下一步安排" />
              </div>
              <div>
                <div className="field-label">处理结果</div>
                <div className="seg">
                  <button className={result === "pass" ? "on" : ""} onClick={() => setResult("pass")}>通过</button>
                  <button className={result === "revision" ? "on" : ""} onClick={() => setResult("revision")}>需修改</button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <div className="task-meta-k" style={{ marginBottom: 6 }}>我的反馈{sub.fbAt ? " · " + sub.fbAt : ""}</div>
              <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7, paddingLeft: 11, borderLeft: "2px solid var(--line)" }}>{sub.feedback}</div>
              <div style={{ marginTop: 9 }}>
                <span className={`chip ${sub.needRevision ? "chip-orange" : "chip-gray"}`} style={{ fontSize: 11 }}>处理结果：{sub.needRevision ? "需修改" : "通过"}</span>
              </div>
            </div>
          )}
        </div>
        {isPending && (
          <div className="drawer-foot">
            <button className="btn btn-ghost" onClick={onClose}>取消</button>
            <button className="btn btn-primary" onClick={send}><Icon name="send" size={14} />发送反馈</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== 抽屉：实习生详情 ===================== */
function MenteeDrawer({ mentee, tasks, submissions, onClose, onPublish, onView }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-head">
          <FlatAvatar person={mentee} size={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)" }}>{mentee.name}</div>
            <div className="card-sub" style={{ marginTop: 3 }}>{mentee.title} · 入职 Day {mentee.day}</div>
          </div>
          <button className="icon-btn" style={{ width: 32, height: 32, border: "none" }} onClick={onClose} aria-label="关闭"><Icon name="x" size={16} /></button>
        </div>
        <div className="drawer-body">
          <div>
            <div className="sec-row" style={{ marginBottom: 10 }}><div className="task-meta-k" style={{ fontSize: 12 }}>当前任务（{tasks.length}）</div></div>
            {tasks.length === 0 && <div style={{ fontSize: 13, color: "var(--t4)" }}>暂无发布的任务。</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tasks.map(a => (
                <div key={a.id} style={{ padding: "11px 13px", border: "1px solid var(--line)", borderRadius: "var(--r-md)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--t1)" }}>{a.name}</span>
                    {a.priority === "urgent" && <span className="chip chip-red" style={{ fontSize: 10.5, flexShrink: 0 }}>紧急</span>}
                  </div>
                  <div className="card-sub" style={{ fontSize: 11.5, marginTop: 3 }}>{a.date} 发布{a.ddl ? " · 截止 " + a.ddl : ""}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="sec-row" style={{ marginBottom: 10 }}><div className="task-meta-k" style={{ fontSize: 12 }}>提交记录（{submissions.length}）</div></div>
            {submissions.length === 0 && <div style={{ fontSize: 13, color: "var(--t4)" }}>暂无提交记录。</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {submissions.map(s => {
                const st = SUB_STATUS[s.status] || SUB_STATUS.pending;
                return (
                  <button key={s.id} onClick={() => onView(s, false)} style={{ textAlign: "left", padding: "11px 13px", border: "1px solid var(--line)", borderRadius: "var(--r-md)", background: "var(--surface)", cursor: "pointer", transition: ".15s" }} className="mentee-sub">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="truncate" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--t1)", flex: 1 }}>{s.task}</span>
                      <span className={`chip ${st.cls}`} style={{ fontSize: 11, flexShrink: 0 }}>{st.label}</span>
                    </div>
                    <div className="card-sub" style={{ fontSize: 11.5, marginTop: 3 }}>提交于 {s.at}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="drawer-foot">
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => onPublish(mentee.id)}><Icon name="plus" size={14} />给 {mentee.name} 发布任务</button>
        </div>
      </div>
    </div>
  );
}

/* ===================== 容器 ===================== */
function MentorWorkbench({ tab, setTab }) {
  const D = window.APP_DATA;
  const mentees = D.mentees;
  const [assignments, setAssignments] = usePersist("ies4_assignments", D.assignments);
  const [submissions, setSubmissions] = usePersist("ies4_submissions", D.submissions);
  const [todos, setTodos] = usePersist("ies6_todos", D.todos);
  const [drawer, setDrawer] = useState(null); // { type, ... }
  const TODAY = (D.daily && D.daily.date ? D.daily.date : "").split(" ")[0];

  function goPublishTab(menteeId) { pendingPublishMentee = menteeId || null; setTab("publish"); }
  function openSubmission(sub, focus) { setDrawer({ type: "submission", sub, focus }); }
  function openMentee(id) { setDrawer({ type: "mentee", id }); }

  function publish(f) {
    const id = "as" + Date.now();
    const ddl = f.ddl.trim();
    const priority = f.urgent ? "urgent" : "normal";
    const rec = { id, name: f.name.trim(), acceptance: f.desc.trim() || "（待补充任务说明）", ddl, priority, date: TODAY, status: "todo" };
    setAssignments(m => ({ ...m, [f.menteeId]: [rec, ...(m[f.menteeId] || [])] }));
    const mentee = mentees.find(m => m.id === f.menteeId);
    if (f.menteeId === 1) {
      const scope = ddl && TODAY && ddl.indexOf(TODAY) === 0 ? "today" : "week";
      setTodos(ts => [{ id, name: rec.name, source: "导师安排", srcType: "mentor", sourceRef: `导师陈骁 · ${TODAY} 派发`, acceptance: rec.acceptance, priority, status: "todo", week: "this", scope, sortOrder: scope === "today" ? Date.now() : undefined, assignedNew: true, ddl }, ...ts]);
    }
    setDrawer(null);
    window.toast("任务已发布", `已把「${rec.name}」发布给 ${mentee ? mentee.name : "实习生"}${f.urgent ? "（紧急）" : ""}${f.menteeId === 1 ? "，已同步到 TA 的待办" : ""}。`, "check");
  }

  function sendFeedback(subId, fb) {
    setSubmissions(list => list.map(s => s.id === subId
      ? { ...s, feedback: fb.feedback, needRevision: fb.needRevision, status: fb.needRevision ? "revision" : "feedback", fbAt: "刚刚" }
      : s));
    setDrawer(null);
    window.toast("反馈已发送", fb.needRevision ? "已标记为需修改并通知实习生。" : "反馈已发送给实习生。", "check");
  }

  const drawerMentee = drawer && drawer.type === "mentee" ? mentees.find(m => m.id === drawer.id) : null;
  const liveSub = drawer && drawer.type === "submission" ? (submissions.find(s => s.id === drawer.sub.id) || drawer.sub) : null;

  return (
    <>
      {tab === "mentees" && <MentorHome mentees={mentees} assignments={assignments} submissions={submissions} onDetail={openMentee} onPublish={goPublishTab} setTab={setTab} />}
      {tab === "publish" && <PublishTab mentees={mentees} assignments={assignments} onSubmit={publish} />}
      {tab === "process" && <ProcessTab submissions={submissions} onView={openSubmission} />}

      {liveSub && <SubmissionDrawer sub={liveSub} focusFeedback={drawer.focus} onClose={() => setDrawer(null)} onSend={sendFeedback} />}
      {drawerMentee && <MenteeDrawer mentee={drawerMentee} tasks={assignments[drawerMentee.id] || []} submissions={submissions.filter(s => s.menteeId === drawerMentee.id)} onClose={() => setDrawer(null)} onPublish={goPublishTab} onView={openSubmission} />}
    </>
  );
}

Object.assign(window, { MentorWorkbench });
