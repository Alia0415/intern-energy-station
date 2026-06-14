/* ============================================================
   penguin.jsx —— 「企鹅」企鹅 API 版 RAG（悬浮入口 + 侧滑面板）
   ------------------------------------------------------------
   · 复用 styles.css 里残留的 .sd-* 样式（原“实习支持助手”设计），
     不新增样式风格、不改动任何现有页面 / 身份选择 / 工作台 / 通知 / 日报周报。
   · 作为独立的第二个 React 根（#penguin-root）挂载，纯覆盖层。
   · 通过 useCurrentRole() 跟随全局身份；登录页（未选身份）不显示入口。

   RAG 调用链（前端这一侧）：
     用户提问
       → 本地 searchKnowledgeBase 仅用于「提前判断 no_match」（point 4）
       → POST /api/penguin-chat {role, question}   // 1)(8) 前端只传 role+question，后端自行检索
       → 后端检索为空 → no_match；命中 → 基于规则作答 + 底部参考规则标签   // 3)(4)(5)
       → 后端不可达 → 本地规则模板兜底，不让页面报错                    // 6)
   注意：后端不信任前端传来的 matchedDocs，一律以服务端检索结果为准。
   API Key 只在后端环境变量里，前端从不接触模型 API。       // 7)
   ============================================================ */
import {
  KNOWLEDGE_BASE,
  searchKnowledgeBase,
  NO_MATCH_MESSAGE,
  buildFallbackAnswer,
} from "./services/knowledgeBase.js";

const PG_ROLE_LABEL = { intern: "实习生", mentor: "带教", hr: "HR" };

// 每个身份的快捷问题：均已确保能命中 16 条规则库 → 点击即走真实 AI 作答（非兜底）
const QUICK = {
  intern: [
    "我的任务延期了，应该怎么说明原因？",
    "任务太大无从下手，应该怎么拆解？",
    "遇到卡点不敢求助，会不会显得能力差？",
    "周报怎么写才算有质量？",
  ],
  mentor: [
    "实习生连续两天日报很简单，我应该怎么跟进？",
    "多久给实习生反馈一次比较合适？",
    "怎么判断周报有没有质量？",
    "怎么发现实习生压力大、状态不好？",
  ],
  hr: [
    "哪些指标适合用于关怀提醒，哪些不能用于绩效判断？",
    "HR 什么时候该介入带教？",
    "怎么识别需要关注的风险信号？",
    "实习数据的使用边界是什么？",
  ],
};

/** 前端 RAG 编排：本地预判 → 只传 role+question 调后端 → 后端不可达时本地兜底 */
async function askPenguin(role, question) {
  // 本地检索仅用于「提前判断 no_match」（point 4）：为空就不必请求后端
  const localDocs = searchKnowledgeBase(question, role);
  if (!localDocs.length) {
    // 5) 没有匹配规则：不调用任何 API，直接返回固定兜底语
    return { kind: "no_match", answer: NO_MATCH_MESSAGE, references: [] };
  }
  try {
    const resp = await fetch("/api/penguin-chat", {
      // 1)(8) 前端只传 role+question；只调用 /api/penguin-chat，绝不直接调模型 API
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, question }),
    });
    if (!resp.ok) throw new Error("api_" + resp.status);
    const data = await resp.json();
    // 后端为唯一可信来源：kind / answer / references 一律以后端返回为准（3）(4)(5)
    return {
      kind: data.kind || "api",
      answer: data.answer || NO_MATCH_MESSAGE,
      references: data.references || [],
    };
  } catch (e) {
    // 6) 后端不可达：用本地规则模板兜底（基于本地检索结果），不抛错、不让页面崩
    return {
      kind: "fallback",
      answer: buildFallbackAnswer(localDocs),
      references: localDocs.map((d) => ({ id: d.id, title: d.title, content: d.content })),
    };
  }
}

/* ---------- 单条回答（含参考规则标签） ---------- */
function AnswerBlock({ m, onToggleRef }) {
  if (m.kind === "no_match") {
    // 兜底语用“不足提示”样式，明确区别于正常回答
    return (
      <div className="sd-empty-note">
        <Icon name="alert" size={15} />
        {m.answer}
      </div>
    );
  }
  const refs = m.references || [];
  const active = refs.find((r) => r.id === m.openRef);
  return (
    <div className="sd-card">
      {refs.length > 0 && (
        <div className="sd-ref-note">
          <Icon name="checkCircle" size={13} color="var(--blue)" />
          企鹅基于 <b>{refs.length}</b> 条团队规则作答
        </div>
      )}
      <div className="sd-sec">
        <div className="sd-sec-body" style={{ whiteSpace: "pre-wrap" }}>{m.answer}</div>
      </div>
      {m.kind === "fallback" && (
        <div className="sd-sec">
          <div className="sd-empty-note">
            <Icon name="alert" size={15} />
            AI 暂时不可用，以上为「规则库」的本地摘要回答（已自动兜底）。
          </div>
        </div>
      )}
      {refs.length > 0 && (
        <div className="sd-sec sd-src-sec">
          <div className="sd-src-h">参考规则</div>
          <div className="sd-src-list">
            {refs.map((r) => (
              <button
                key={r.id}
                className={`sd-src-chip ${m.openRef === r.id ? "is-active" : ""}`}
                onClick={() => onToggleRef(m.id, r.id)}
              >
                <Icon name="doc" size={12} />
                {r.title}
              </button>
            ))}
          </div>
          {active && active.content && (
            <div className="sd-src-excerpt">
              <span className="sd-src-excerpt-t">{active.title}</span>
              {active.content}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- 主组件：悬浮按钮 + 侧滑面板 ---------- */
function PenguinAssistant() {
  const role = useCurrentRole();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  // loading 按身份分桶：各身份的在途请求互不干扰（实习生在等待，不影响带教 / HR）
  const [loadingByRole, setLoadingByRole] = useState({});
  const [size, setSize] = usePersist("penguin_panel_size", { w: 0, h: 0 }); // 0 => 用 CSS 默认尺寸
  // 按身份分别保存对话历史：三个工作台相互独立——切到带教看不到实习生的提问，
  // 切回实习生又能看到自己的历史。持久化到 localStorage，刷新后历史仍在。
  const [chatStore, setChatStore] = usePersist("penguin_chat", {});
  const msgsRef = useRef(null);
  const idRef = useRef(null);
  const resizing = useRef(null);

  // 容错：localStorage 脏值（null / 数组 / 字符串 / 某身份桶非数组）一律退化为空，避免面板白屏
  const safeStore =
    chatStore && typeof chatStore === "object" && !Array.isArray(chatStore) ? chatStore : {};
  // 当前身份下的对话（其它身份的历史互不影响、互不可见）
  const messages = role && Array.isArray(safeStore[role]) ? safeStore[role] : [];
  const loading = !!(role && loadingByRole[role]);

  // 只更新指定身份那一格，绝不触碰其它身份；脏值也安全退化为空数组
  function setRoleMessages(r, updater) {
    setChatStore((store) => {
      const base = store && typeof store === "object" && !Array.isArray(store) ? store : {};
      const cur = Array.isArray(base[r]) ? base[r] : [];
      const next = typeof updater === "function" ? updater(cur) : updater;
      return { ...base, [r]: next };
    });
  }
  function setMessages(updater) { setRoleMessages(role, updater); }

  // id 计数器从“历史中出现过的最大编号 +1”起跳：对清空 / 删除免疫，刷新后也不会与历史撞 React key
  if (idRef.current === null) {
    let maxId = 0;
    for (const arr of Object.values(safeStore)) {
      if (!Array.isArray(arr)) continue;
      for (const m of arr) {
        const n = parseInt(String(m && m.id).slice(1), 10);
        if (Number.isFinite(n) && n > maxId) maxId = n;
      }
    }
    idRef.current = maxId;
  }

  // 切换身份只重置输入框；各身份的历史与各自的加载态都互不影响地保留
  useEffect(() => { setInput(""); }, [role]);

  // 新消息时滚动到底
  useEffect(() => {
    const el = msgsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  if (!role) return null; // 登录 / 身份选择页不显示入口

  function nextId(prefix) { idRef.current += 1; return prefix + idRef.current; }

  async function send(text) {
    const q = String(text != null ? text : input).trim();
    if (!q || loading) return;
    const askRole = role; // 锁定“提问时的身份”：await 期间即使切换身份，这轮问答也只落在该身份
    setInput("");
    setRoleMessages(askRole, (list) => [...list, { id: nextId("u"), who: "me", text: q }]);
    setLoadingByRole((m) => ({ ...m, [askRole]: true }));
    try {
      const res = await askPenguin(askRole, q);
      setRoleMessages(askRole, (list) => [...list, { id: nextId("a"), who: "penguin", openRef: null, ...res }]);
    } finally {
      setLoadingByRole((m) => ({ ...m, [askRole]: false }));
    }
  }

  function toggleRef(msgId, refId) {
    setMessages((list) =>
      list.map((m) => (m.id === msgId ? { ...m, openRef: m.openRef === refId ? null : refId } : m))
    );
  }

  // 拖拽调整尺寸（面板锚定右下角，手柄在左上角；尺寸记忆在 localStorage）
  function onResizeDown(e) {
    e.preventDefault();
    const panel = e.currentTarget.parentElement;
    const rect = panel.getBoundingClientRect();
    resizing.current = { x: e.clientX, y: e.clientY, w: rect.width, h: rect.height };
    window.addEventListener("mousemove", onResizeMove);
    window.addEventListener("mouseup", onResizeUp);
  }
  function onResizeMove(e) {
    const s = resizing.current;
    if (!s) return;
    const w = Math.min(Math.max(s.w + (s.x - e.clientX), 380), window.innerWidth - 40);
    const h = Math.min(Math.max(s.h + (s.y - e.clientY), 460), window.innerHeight - 60);
    setSize({ w: Math.round(w), h: Math.round(h) });
  }
  function onResizeUp() {
    resizing.current = null;
    window.removeEventListener("mousemove", onResizeMove);
    window.removeEventListener("mouseup", onResizeUp);
  }

  const panelStyle = {};
  if (size && size.w) panelStyle.width = size.w + "px";
  if (size && size.h) panelStyle.height = size.h + "px";

  const quick = QUICK[role] || [];

  return (
    <>
      <button className={`sd-fab ${open ? "hide" : ""}`} onClick={() => setOpen(true)} aria-label="企鹅">
        <span className="sd-fab-ic"><PenguinMascot role={role} size={20} /></span>
        企鹅
      </button>

      {open && (
        <div className="sd-panel" style={panelStyle} role="dialog" aria-label="企鹅">
          <div className="sd-resize" onMouseDown={onResizeDown} title="拖动调整大小"><Icon name="split" size={13} /></div>

          <div className="sd-head">
            <span className="sd-head-ic"><PenguinMascot role={role} size={26} /></span>
            <div style={{ minWidth: 0 }}>
              <div className="sd-head-t">企鹅 · 规则助手</div>
              <div className="sd-head-s">只基于团队规则库作答 · 当前身份：{PG_ROLE_LABEL[role] || role}</div>
            </div>
            <div className="sd-head-btns">
              <button className="sd-head-btn" onClick={() => setMessages([])} title="清空对话" aria-label="清空对话"><Icon name="refresh" size={16} /></button>
              <button className="sd-head-btn" onClick={() => setOpen(false)} title="关闭" aria-label="关闭"><Icon name="x" size={16} /></button>
            </div>
          </div>

          <div className="sd-msgs" ref={msgsRef}>
            <div className="sd-row">
              <span className="sd-ava"><PenguinMascot role={role} size={20} /></span>
              <div className="sd-bubble-ai">
                你好，我是企鹅 🐧。我只会根据「{PG_ROLE_LABEL[role]}」规则库来回答，并在底部标注参考了哪些规则。可以点下面的快捷问题，或直接输入。
              </div>
            </div>

            {messages.map((m) =>
              m.who === "me" ? (
                <div key={m.id} className="sd-row me">
                  <div className="sd-bubble-me">{m.text}</div>
                </div>
              ) : (
                <div key={m.id} className="sd-row">
                  <span className="sd-ava"><PenguinMascot role={role} size={20} /></span>
                  <AnswerBlock m={m} onToggleRef={toggleRef} />
                </div>
              )
            )}

            {loading && (
              <div className="sd-row">
                <span className="sd-ava"><PenguinMascot role={role} size={20} /></span>
                <div className="sd-loading">
                  <span className="typing"><span></span><span></span><span></span></span>
                  正在检索规则并作答…
                </div>
              </div>
            )}
          </div>

          {messages.length === 0 && (
            <div className="sd-quick">
              <div className="sd-quick-label">试试这些问题</div>
              <div className="sd-quick-list">
                {quick.map((q, i) => (
                  <button key={i} className="sd-quick-btn" onClick={() => send(q)}>
                    <Icon name="help" size={15} color="var(--blue)" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="sd-input-bar">
            <textarea
              className="sd-input"
              rows={1}
              placeholder={`向「${PG_ROLE_LABEL[role]}」规则库提问…`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button className="sd-send" onClick={() => send()} disabled={loading || !input.trim()} aria-label="发送">
              <Icon name="send" size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- 挂载到独立的第二个 React 根（不影响 #root 主应用） ---------- */
const _penguinRoot = document.getElementById("penguin-root");
if (_penguinRoot) {
  ReactDOM.createRoot(_penguinRoot).render(<PenguinAssistant />);
}

// 便于调试 / 控制台手动验证：window.penguinRag.searchKnowledgeBase / askPenguin
window.penguinRag = { KNOWLEDGE_BASE, searchKnowledgeBase, askPenguin };
