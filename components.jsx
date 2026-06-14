/* ============ 实习能量站 · 共享组件（办公风） ============ */
const { useState, useRef, useEffect, useMemo } = React;

/* ---------- 图标 ---------- */
const ICONS = {
  nav: "M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6l-8-4Zm0 5 5 3-5 3-5-3 5-3Z",
  dashboard: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z",
  list: "M8 6h13v2H8V6Zm0 5h13v2H8v-2Zm0 5h13v2H8v-2ZM3 6h2v2H3V6Zm0 5h2v2H3v-2Zm0 5h2v2H3v-2Z",
  check: "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z",
  checkCircle: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 14-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6Z",
  doc: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 2 4 4h-4V4ZM8 13h8v2H8v-2Zm0 4h8v2H8v-2Zm0-8h4v2H8V9Z",
  chat: "M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 4V5a1 1 0 0 1 1-1Z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z",
  users: "M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-2.7 0-6 1.3-6 4v2h8v-2c0-1 .4-1.9 1-2.6C9.7 13.2 8.8 13 8 13Zm8 0c-.3 0-.7 0-1.1.1A4.9 4.9 0 0 1 16 17v2h6v-2c0-2.7-3.3-4-6-4Z",
  mentor: "M12 3 2 8l10 5 8-4v6h2V8L12 3ZM6 13v3c0 1.7 2.7 3 6 3s6-1.3 6-3v-3l-6 3-6-3Z",
  calendar: "M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7ZM5 9h14v10H5V9Z",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10V6h-2v7l5 3 1-1.7-4-2.3Z",
  flag: "M5 3v18h2v-7h7l1 2h5V5h-6l-1-2H5Z",
  light: "M9 21h6v-1H9v1Zm3-19a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2Z",
  target: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
  alert: "M12 2 1 21h22L12 2Zm0 6 6.5 11h-13L12 8Zm-1 4v3h2v-3h-2Zm0 4v2h2v-2h-2Z",
  plus: "M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z",
  refresh: "M12 5V2L8 6l4 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7Z",
  chevron: "M9 6l6 6-6 6",
  chevronDown: "M6 9l6 6 6-6",
  search: "M10 4a6 6 0 1 0 3.7 10.7l4.3 4.3 1.4-1.4-4.3-4.3A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z",
  bell: "M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-5-1.5-2v-4a5.5 5.5 0 0 0-4-5.3V5a1.5 1.5 0 1 0-3 0v.7A5.5 5.5 0 0 0 6.5 11v4L5 17v1h14v-1Z",
  send: "M3 3l18 9-18 9 4-9-4-9Zm5.5 9L6 16.6 16 12 6 7.4 8.5 12Z",
  arrowRight: "M13 5l7 7-7 7v-4H4v-6h9V5Z",
  arrowUp: "M12 5l6 7h-4v7h-4v-7H6l6-7Z",
  arrowDown: "M12 19l-6-7h4V5h4v7h4l-6 7Z",
  trend: "M3 17l6-6 4 4 7-7v4h2V5h-7v2h4l-6 6-4-4-8 8 2 0Z",
  loop: "M12 6V3L8 7l4 4V8a4 4 0 0 1 4 4h2a6 6 0 0 0-6-6Zm0 12v3l4-4-4-4v3a4 4 0 0 1-4-4H6a6 6 0 0 0 6 6Z",
  pen: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z",
  link: "M3.9 12a3.1 3.1 0 0 1 3.1-3.1h4V7h-4a5 5 0 0 0 0 10h4v-1.9h-4A3.1 3.1 0 0 1 3.9 12Zm4.1 1h8v-2H8v2Zm9-6h-4v1.9h4a3.1 3.1 0 0 1 0 6.2h-4V17h4a5 5 0 0 0 0-10Z",
  inbox: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 12h-4a3 3 0 0 1-6 0H5V5h14v10Z",
  help: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm.9 15.5h-1.8v-1.8h1.8v1.8Zm1.4-6.2c-.5.6-1.1 1-1.4 1.6-.2.4-.2.8-.2 1.3h-1.8c0-.7.1-1.3.4-1.8.3-.5.9-.9 1.3-1.4.4-.5.4-1.3-.2-1.8-.6-.5-1.7-.4-2.1.4l-1.6-.7c.6-1.2 1.9-1.9 3.2-1.7 1.5.2 2.6 1.4 2.6 2.7 0 .6-.2 1.1-.4 1.5Z",
  thumb: "M2 21h4V9H2v12ZM23 10a2 2 0 0 0-2-2h-6.3l1-4.6V3a1.5 1.5 0 0 0-3-.4L8 9v12h11a2 2 0 0 0 2-1.6l2-7V10Z",
  more: "M6 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
  split: "M6 4a3 3 0 1 0 1.95 5.28C8.7 12.5 10.6 14 13 14h1.2a3 3 0 1 0 0-2H13c-1.7 0-3-1.2-3.2-2.8A3 3 0 0 0 6 4Zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm11 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM6 14a3 3 0 1 0 1.95 5.28C8.7 16.5 10.6 16 12 16v-2c-2 0-3.8.7-4.05 2.2A3 3 0 0 0 6 14Zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z",
  x: "M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3 1.4 1.4Z",
};

function Icon({ name, size = 18, color, strokeMode, style }) {
  const d = ICONS[name] || ICONS.list;
  if (strokeMode) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d={d} /></svg>
    );
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color || "currentColor"} style={style}><path d={d} /></svg>;
}

/* ---------- localStorage 持久化 ---------- */
function usePersist(key, initial) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s != null ? JSON.parse(s) : initial; }
    catch (e) { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }, [key, v]);
  return [v, setV];
}

/* ---------- 当前身份（登录页选定，全局共享） ----------
   currentRole 持久化在 localStorage，App 与企鹅面板两个 React 根
   通过自定义事件 ies-role-change 同步，刷新后仍保留当前身份。 */
const ROLE_LABELS = { intern: "实习生", mentor: "带教", hr: "HR" };
const ROLE_ACCENT = { intern: "#0052D9", mentor: "#00924C", hr: "#0052D9" };
function getCurrentRole() {
  try { const r = localStorage.getItem("currentRole"); return ROLE_LABELS[r] ? r : null; }
  catch (e) { return null; }
}
function setCurrentRole(role) {
  try {
    if (role) localStorage.setItem("currentRole", role);
    else localStorage.removeItem("currentRole");
  } catch (e) {}
  window.dispatchEvent(new CustomEvent("ies-role-change", { detail: { role: role || null } }));
}
/* 订阅身份变化 */
function useCurrentRole() {
  const [role, setRole] = useState(() => getCurrentRole());
  useEffect(() => {
    function onChange(e) { setRole(e.detail.role); }
    window.addEventListener("ies-role-change", onChange);
    return () => window.removeEventListener("ies-role-change", onChange);
  }, []);
  return role;
}

/* ---------- 企鹅吉祥物（按身份变色的围巾） ---------- */
function PenguinMascot({ role = "intern", size = 40 }) {
  const accent = ROLE_ACCENT[role] || ROLE_ACCENT.intern;
  const dark = "#2E3A59", darker = "#26314D", crown = "#384768";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" style={{ display: "block" }}>
      {/* 脚 */}
      <path d="M19.5 56.5c0-2.6 2.4-4.2 5-4.2s5 1.6 5 4.2c0 1.7-2.3 2.4-5 2.4s-5-.7-5-2.4Z" fill="#F2A33C" />
      <path d="M34.5 56.5c0-2.6 2.4-4.2 5-4.2s5 1.6 5 4.2c0 1.7-2.3 2.4-5 2.4s-5-.7-5-2.4Z" fill="#F2A33C" />
      {/* 身体（圆润蛋形） */}
      <path d="M32 4.5C20.6 4.5 13.2 14.8 13.2 33.4 13.2 48.6 21 58.8 32 58.8s18.8-10.2 18.8-25.4C50.8 14.8 43.4 4.5 32 4.5Z" fill={dark} />
      {/* 头顶高光 */}
      <path d="M32 4.5c-6.6 0-12 3.7-15.3 11 4.2-3.6 9.6-5.6 15.3-5.6s11.1 2 15.3 5.6C44 8.2 38.6 4.5 32 4.5Z" fill={crown} />
      {/* 鳍 */}
      <path d="M13.7 27.5C9.2 31.6 9 43 13 48c2-2.9 3-10.6 3.4-18.2l-2.7-2.3Z" fill={darker} />
      <path d="M50.3 27.5c4.5 4.1 4.7 15.5.7 20.5-2-2.9-3-10.6-3.4-18.2l2.7-2.3Z" fill={darker} />
      {/* 白肚 / 脸 */}
      <path d="M32 14.6c-8.4 0-13 8.8-13 22 0 10.8 5.6 18 13 18s13-7.2 13-18c0-13.2-4.6-22-13-22Z" fill="#FFFFFF" />
      {/* 腮红 */}
      <ellipse cx="23.8" cy="32.2" rx="3" ry="2.3" fill="#F8B59E" opacity="0.55" />
      <ellipse cx="40.2" cy="32.2" rx="3" ry="2.3" fill="#F8B59E" opacity="0.55" />
      {/* 眼睛 */}
      <circle cx="26.3" cy="26.4" r="3.9" fill="#1D2129" />
      <circle cx="37.7" cy="26.4" r="3.9" fill="#1D2129" />
      <circle cx="27.7" cy="25" r="1.35" fill="#fff" />
      <circle cx="39.1" cy="25" r="1.35" fill="#fff" />
      {/* 嘴（橙色，两段更立体） */}
      <path d="M32 29.4 36.2 33 32 36.2 27.8 33 32 29.4Z" fill="#F6A623" />
      <path d="M32 33h4.2L32 36.2 27.8 33H32Z" fill="#E0901C" />
      {/* 围巾 */}
      <path d="M21 40.8c4.6 3.4 17.4 3.4 22 0l1.6 5.9c-5.2 3.3-20 3.3-25.2 0L21 40.8Z" fill={accent} />
      <path d="m41.6 45.4 5.6-1.4 2.2 9.7-5.8 1.5-2-9.8Z" fill={accent} />
      <path d="m41.6 45.4 5.6-1.4.7 3-5.7 1.4-.6-3Z" fill="#000" opacity="0.12" />
    </svg>
  );
}

/* ---------- 头像（首字 + 稳定底色） ---------- */
const AV_COLORS = [
  ["#EBF1FF", "#0052D9"], ["#E5F4EC", "#00924C"], ["#EEE9FB", "#6A52CC"],
  ["#FCEEDC", "#D9700B"], ["#E4F3F6", "#0A86A8"], ["#FBE9E8", "#D54941"],
];
function Avatar({ person, size = 34 }) {
  const [bg, fg] = AV_COLORS[(person.id || person.name.charCodeAt(0)) % AV_COLORS.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color: fg,
      display: "grid", placeItems: "center", fontWeight: 700, fontSize: size * 0.4, flexShrink: 0 }}>{person.initial || person.name[0]}</div>
  );
}

/* ---------- 进度条 ---------- */
function Bar({ value, color = "var(--blue)", h = 7, track }) {
  return (
    <div className="bar-track" style={{ height: h, background: track || "var(--line-2)" }}>
      <div className="bar-fill" style={{ width: Math.max(0, Math.min(100, value)) + "%", height: "100%", background: color }} />
    </div>
  );
}

/* ---------- 任务状态标签 ---------- */
function TaskStatus({ status }) {
  const m = window.APP_DATA.taskStatus[status] || window.APP_DATA.taskStatus.todo;
  return <span className={`spill chip-${m.tone}`}><span className="dot" style={{ background: m.dot }} />{m.label}</span>;
}

/* ---------- 实习生状态标签（不打分） ---------- */
function PersonStatus({ status, sm }) {
  const D = window.APP_DATA;
  const tone = D.statusTone[status];
  const c = { steady: "#00924C", watch: "#D9700B", followup: "#D54941" }[status];
  return (
    <span className={`spill chip-${tone}`} style={sm ? { fontSize: 11.5, padding: "2px 8px" } : {}}>
      <span className="dot" style={{ background: c }} />{D.statusLabel[status]}
    </span>
  );
}

/* ---------- 横向柱状（简洁，办公风） ---------- */
function HBars({ rows, max }) {
  const m = max || Math.max(...rows.map(r => r.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      {rows.map((r, i) => (
        <div key={i}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>{r.label}</span>
            {r.sub && <span className="card-sub" style={{ fontSize: 11.5 }}>{r.sub}</span>}
            <span className="num" style={{ marginLeft: "auto", fontWeight: 700, color: r.color || "var(--t1)" }}>{r.value}</span>
            {r.unit && <span className="card-sub">{r.unit}</span>}
          </div>
          <Bar value={(r.value / m) * 100} color={r.color || "var(--blue)"} h={8} />
        </div>
      ))}
    </div>
  );
}

/* ---------- 甜甜圈（细，纯色） ---------- */
function Donut({ segments, size = 150, thickness = 16, centerTop, centerSub }) {
  const r = (size - thickness) / 2, c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0);
  let off = 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line-2)" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness}
            strokeDasharray={`${len - 3} ${c - len + 3}`} strokeDashoffset={-off} />;
          off += len; return el;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <div className="num" style={{ fontSize: size * 0.22, fontWeight: 700, color: "var(--t1)", lineHeight: 1 }}>{centerTop}</div>
          <div style={{ fontSize: 11.5, color: "var(--t3)", marginTop: 3 }}>{centerSub}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sidebar ---------- */
function Sidebar({ role, tab, setTab, onSwitch }) {
  const R = window.ROLES, cfg = R[role], D = window.APP_DATA;
  const subPending = (() => { try { const s = JSON.parse(localStorage.getItem("ies4_submissions")); if (Array.isArray(s)) return s.filter(x => x.status === "pending").length; } catch (e) {} return (D.submissions || []).filter(x => x.status === "pending").length; })();
  const badges = {
    intern: { today: D.todos.filter(t => t.status === "stuck").length },
    mentor: { submissions: subPending },
    hr: { issues: D.hrTasks.length },
  };
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Icon name="nav" size={19} color="#fff" /></div>
        <div>
          <div className="brand-name">成长导航</div>
          <div className="brand-sub">业务部 · 新人成长工作台</div>
        </div>
      </div>

      <div className="workspace-tag" style={{ "--ws-accent": ROLE_ACCENT[role] }}>
        <span className="ws-ico"><Icon name={cfg.ico} size={16} /></span>
        <span className="ws-main">
          <span className="ws-name">{cfg.label}</span>
        </span>
      </div>

      <div className="nav-label">{cfg.label}</div>
      <nav className="nav">
        {cfg.tabs.map(t => {
          const b = badges[role] && badges[role][t.id];
          return (
            <button key={t.id} className={`nav-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <span className="nav-ico"><Icon name={t.ico} size={17} /></span>
              <span>{t.label}</span>
              {b ? <span className="nav-pill">{b}</span> : null}
            </button>
          );
        })}
      </nav>

      <div style={{ marginTop: "auto" }} />
      <div className="user-row" onClick={onSwitch} role={onSwitch ? "button" : undefined} style={onSwitch ? { cursor: "pointer" } : undefined} title={onSwitch ? "切换身份" : undefined}>
        <div className="user-av">{cfg.user.initial}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="user-name">{cfg.user.name}</div>
          <div className="user-role truncate">{cfg.user.role}</div>
        </div>
        <Icon name="chevronDown" size={15} color="var(--t4)" />
      </div>
    </aside>
  );
}

/* ---------- 通知中心（顶部铃铛） ---------- */
const NOTIF_TYPE_TONE = {
  日报提醒: "blue", 周报提醒: "purple", 导师反馈: "green", 任务提醒: "orange", 系统建议: "blue",
  待反馈提醒: "orange", 风险提醒: "red", 带教提醒: "orange", 系统通知: "blue",
};
function NotificationBell({ role }) {
  const D = window.APP_DATA;
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [items, setItems] = useState(() => (D.notifications[role] || []).map(n => ({ ...n })));
  const wrapRef = useRef(null);

  useEffect(() => {
    setItems((D.notifications[role] || []).map(n => ({ ...n })));
    setOpen(false);
  }, [role]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); window.removeEventListener("keydown", onKey); };
  }, [open]);

  const unread = items.filter(n => !n.read).length;
  function markRead(id) { setItems(l => l.map(n => n.id === id ? { ...n, read: true } : n)); }
  function markAll() { setItems(l => l.map(n => ({ ...n, read: true }))); window.toast("已全部标为已读", "所有消息都已标记为已读。", "checkCircle"); }
  function viewAll() { setOpen(false); setShowAll(true); }

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <button className={`icon-btn ${open ? "on" : ""}`} onClick={() => setOpen(o => !o)} aria-label="消息提醒" title="消息提醒">
        <Icon name="bell" size={17} />
        {unread > 0 && <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="notif-panel" role="dialog" aria-label="消息提醒">
          <div className="notif-head">
            <div className="notif-title">消息提醒{unread > 0 && <span className="notif-count">{unread} 条未读</span>}</div>
            <button className="notif-link" onClick={markAll} disabled={unread === 0}>标记全部已读</button>
          </div>
          <div className="notif-list">
            {items.length === 0 && <div className="notif-empty">暂无新消息</div>}
            {items.map(n => (
              <button key={n.id} className={`notif-item ${n.read ? "read" : ""}`} onClick={() => markRead(n.id)}>
                <span className={`notif-dot ${n.read ? "off" : ""}`} />
                <div className="notif-item-body">
                  <div className="notif-item-top">
                    <span className="notif-item-title">{n.title}</span>
                  </div>
                  <div className="notif-item-text">{n.body}</div>
                  <div className="notif-item-time">{n.time}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="notif-foot">
            <button className="notif-foot-btn" onClick={viewAll}>查看全部消息<Icon name="arrowRight" size={13} /></button>
          </div>
        </div>
      )}
      {showAll && (
        <div className="overlay" onClick={() => setShowAll(false)}>
          <div className="modal msg-modal" onClick={e => e.stopPropagation()}>
            <div className="msg-modal-head">
              <div>
                <div className="msg-modal-title">全部消息</div>
                <div className="msg-modal-sub">{items.length} 条消息 · {unread} 条未读</div>
              </div>
              <div className="msg-modal-head-actions">
                <button className="notif-link" onClick={markAll} disabled={unread === 0}>标记全部已读</button>
                <button className="icon-btn" onClick={() => setShowAll(false)} aria-label="关闭" title="关闭"><Icon name="x" size={16} /></button>
              </div>
            </div>
            <div className="msg-modal-list">
              {items.length === 0 && <div className="notif-empty">暂无消息</div>}
              {items.map(n => (
                <button key={n.id} className={`notif-item ${n.read ? "read" : ""}`} onClick={() => markRead(n.id)}>
                  <span className={`notif-dot ${n.read ? "off" : ""}`} />
                  <div className="notif-item-body">
                    <div className="notif-item-top">
                      <span className="notif-item-title" style={{ whiteSpace: "normal" }}>{n.title}</span>
                    </div>
                    <div className="notif-item-text">{n.body}</div>
                    <div className="notif-item-time">{n.time}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- 全局搜索 ---------- */
function buildSearchIndex(role) {
  const D = window.APP_DATA;
  const R = window.ROLES[role];
  const idx = [];
  R.tabs.forEach(t => idx.push({ type: "页面", label: t.label, sub: t.sub, tab: t.id }));
  if (role === "intern") {
    let todos = D.todos;
    try { const s = JSON.parse(localStorage.getItem("ies6_todos")); if (Array.isArray(s)) todos = s; } catch (e) {}
    todos.forEach(t => idx.push({ type: "待办", label: t.name, sub: t.source + (t.acceptance ? " · " + t.acceptance : ""), tab: "today" }));
    D.dailyHistory.forEach(d => idx.push({ type: "日报", label: d.date, sub: "日报记录", tab: "report", reportSub: "history" }));
    D.weeklyHistory.forEach(d => idx.push({ type: "周报", label: d.period, sub: "周报记录", tab: "report", reportSub: "history" }));
  } else if (role === "mentor") {
    D.mentees.forEach(m => idx.push({ type: "实习生", label: m.name, sub: m.title + " · 入职 Day " + m.day, tab: "mentees", select: m.id }));
    (D.submissions || []).forEach(s => idx.push({ type: "提交", label: s.task, sub: s.name + " · " + s.at, tab: "process" }));
  } else {
    D.overviewTasks.forEach(t => idx.push({ type: "待处理", label: t.issue, sub: t.basis, tab: "overview" }));
    D.hotIssues.forEach(it => idx.push({ type: "高频问题", label: it.name, sub: it.type + " · " + it.basis, tab: "issues" }));
    D.hrTasks.forEach(t => idx.push({ type: "待处理", label: t.title, sub: t.target + " · " + t.reason, tab: "issues" }));
    D.fitObservations.forEach(o => idx.push({ type: "岗位适配", label: o.name, sub: o.post + " · " + o.state, tab: "fit" }));
  }
  return idx;
}

function SearchPalette({ role, placeholder, onNavigate, onClose }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const index = useMemo(() => buildSearchIndex(role), [role]);
  const kw = q.trim().toLowerCase();
  const results = kw
    ? index.filter(r => (r.label + " " + (r.sub || "")).toLowerCase().includes(kw)).slice(0, 14)
    : index.filter(r => r.type === "页面");
  function go(r) {
    if (!r) return;
    if (r.select != null) { try { localStorage.setItem("ies3_mentorSel", JSON.stringify(r.select)); } catch (e) {} }
    if (r.reportSub) { try { localStorage.setItem("ies3_reportTab", JSON.stringify(r.reportSub)); } catch (e) {} }
    onNavigate && onNavigate(r.tab);
    onClose();
  }
  useEffect(() => {
    inputRef.current && inputRef.current.focus();
    function onKey(e) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
      else if (e.key === "Enter") { e.preventDefault(); go(results[active]); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [results, active]);
  useEffect(() => { setActive(0); }, [q]);
  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-input-row">
          <Icon name="search" size={18} color="var(--t3)" />
          <input ref={inputRef} className="search-input" placeholder={placeholder || "搜索…"} value={q} onChange={e => setQ(e.target.value)} />
          <button className="icon-btn" onClick={onClose} style={{ width: 30, height: 30, border: "none", flexShrink: 0 }} aria-label="关闭"><Icon name="x" size={15} /></button>
        </div>
        <div className="search-results">
          {results.length === 0 && <div className="search-empty">没有找到{kw ? `「${q.trim()}」` : ""}相关的内容</div>}
          {results.map((r, i) => (
            <button key={i} className={`search-res ${i === active ? "on" : ""}`} onMouseEnter={() => setActive(i)} onClick={() => go(r)}>
              <span className="search-res-type">{r.type}</span>
              <span className="search-res-main">
                <span className="search-res-label">{r.label}</span>
                {r.sub && <span className="search-res-sub">{r.sub}</span>}
              </span>
              <Icon name="arrowRight" size={14} color="var(--t4)" />
            </button>
          ))}
        </div>
        <div className="search-foot">↑↓ 选择 · Enter 打开 · Esc 关闭</div>
      </div>
    </div>
  );
}

/* ---------- Topbar ---------- */
function Topbar({ title, crumb, search, role, onSwitch, onNavigate }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const isMentor = role === "mentor";
  return (
    <header className="topbar">
      <div>
        <div className="top-title">{title}</div>
        <div className="top-crumb">{crumb}</div>
      </div>
      <div className="top-spacer" />
      <button className="search" onClick={() => setSearchOpen(true)}><Icon name="search" size={15} /><span>{search || "搜索…"}</span></button>
      <div className="id-chip">
        <span className="id-dot" style={{ background: ROLE_ACCENT[role] }} />
        <span className="id-label">当前身份</span>
        <span className="id-role">{ROLE_LABELS[role]}</span>
      </div>
      {<button className="btn btn-ghost btn-sm" onClick={onSwitch}><Icon name="loop" size={15} />切换身份</button>}
      {!isMentor && <NotificationBell role={role} />}
      {searchOpen && <SearchPalette role={role} placeholder={search} onNavigate={onNavigate} onClose={() => setSearchOpen(false)} />}
    </header>
  );
}

/* ---------- Toast ---------- */
function ToastHost() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    let n = 0;
    function onToast(e) {
      const id = ++n;
      setItems(l => [...l, { id, ...e.detail }]);
      setTimeout(() => setItems(l => l.filter(x => x.id !== id)), 3400);
    }
    window.addEventListener("ies-toast", onToast);
    return () => window.removeEventListener("ies-toast", onToast);
  }, []);
  return (
    <div className="toast-wrap">
      {items.map(t => (
        <div key={t.id} className="toast toast-in">
          <span className="toast-ic"><Icon name={t.ico || "check"} size={16} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="toast-t">{t.title}</div>
            {t.body && <div className="toast-b">{t.body}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
window.toast = (title, body, ico) => window.dispatchEvent(new CustomEvent("ies-toast", { detail: { title, body, ico } }));

/* ---------- 确认弹窗 ---------- */
function Confirm({ open, title, body, confirmText = "确认", danger, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--t1)" }}>{title}</div>
          <div style={{ fontSize: 13.5, color: "var(--t2)", lineHeight: 1.65, marginTop: 10 }}>{body}</div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
            <button className="btn btn-ghost" onClick={onCancel}>取消</button>
            <button className="btn btn-primary" style={danger ? { background: "var(--red)" } : {}} onClick={onConfirm}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, usePersist, Avatar, Bar, TaskStatus, PersonStatus, HBars, Donut, Sidebar, Topbar, ToastHost, Confirm,
  PenguinMascot, getCurrentRole, setCurrentRole, useCurrentRole, ROLE_LABELS, ROLE_ACCENT, NotificationBell,
});
