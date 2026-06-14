/* ============ 实习能量站 · Root · 登录 / 身份选择 + 三角色工作台 ============ */
const ROLES = {
  intern: {
    label: "实习生工作台", ico: "user", who: "看自己，不看别人",
    name: "实习生", accent: "var(--blue)", soft: "var(--blue-soft)",
    desc: "查看任务进度、日报周报、反馈建议和成长记录",
    enter: "进入实习生工作台",
    note: "你看到的只和你自己有关，不排名、不比较。这里帮你把任务拆成待办、记录卡点、沉淀成长。",
    user: { name: "林之遥", role: "研发 · 平台体验组 · 实习生", initial: "林" },
    search: "搜索我的待办、路径、日报…",
    tabs: [
      { id: "today", label: "待办事项", ico: "list", sub: "本周与今日的待办和卡点求助" },
      { id: "path", label: "任务拆解", ico: "split", sub: "把模糊任务拆成今天能执行的小任务" },
      { id: "report", label: "日报 / 周报", ico: "doc", sub: "记录完成与卡点 · 复盘沉淀成长证据" },
    ],
  },
  mentor: {
    label: "带教工作台", ico: "mentor", who: "管理实习生与任务",
    name: "带教", accent: "var(--blue)", soft: "var(--blue-soft)",
    desc: "查看实习生、发布任务、查看提交并给予反馈",
    enter: "进入带教工作台",
    note: "管理实习生任务、查看提交并给予反馈。",
    user: { name: "陈骁", role: "研发 · 平台体验组 · 导师", initial: "骁" },
    search: "搜索我的实习生、任务…",
    tabs: [
      { id: "mentees", label: "我的实习生", ico: "users", sub: "查看带教中的实习生与当前任务情况" },
      { id: "publish", label: "发布任务", ico: "flag", sub: "给实习生发布任务并设置截止时间" },
      { id: "process", label: "任务处理", ico: "inbox", sub: "查看实习生提交并给予反馈" },
    ],
  },
  hr: {
    label: "HR 工作台", ico: "dashboard", who: "看组织，不盯个人",
    name: "HR", accent: "var(--blue)", soft: "var(--blue-soft)",
    desc: "查看整体实习状态、风险提醒、带教负担和管理建议",
    enter: "进入 HR 工作台",
    note: "默认查看组织趋势与共性问题，仅在需要协调资源时查看个人支持记录。",
    user: { name: "青禾", role: "业务部 · 人才发展", initial: "禾" },
    search: "搜索高频问题、待处理事项、适配观察…",
    tabs: [
      { id: "overview", label: "组织总览", ico: "dashboard", sub: "本周实习运行指标与需要 HR 处理的事项" },
      { id: "issues", label: "问题与支持", ico: "light", sub: "本周高频问题与 HR 待处理事项" },
      { id: "fit", label: "岗位适配", ico: "target", sub: "观察实习生与当前岗位是否存在错配信号" },
    ],
  },
};
window.ROLES = ROLES;
const ROLE_SEQUENCE = ["intern", "mentor", "hr"];

/* ===================== 登录 / 身份选择页 ===================== */
function LoginCard({ id }) {
  const r = ROLES[id];
  return (
    <button className="login-card" onClick={() => selectRole(id)} style={{ "--c-accent": r.accent, "--c-soft": r.soft }}>
      <div className="login-pic" style={{ background: r.soft }}>
        <PenguinMascot role={id} size={68} />
      </div>
      <div className="login-card-name">{r.name}</div>
      <div className="login-card-desc">{r.desc}</div>
      <div className="login-card-btn" style={{ background: r.accent }}>
        {r.enter}<Icon name="arrowRight" size={15} color="#fff" />
      </div>
    </button>
  );
}

function selectRole(role) {
  setCurrentRole(role);
}

function LoginPage() {
  return (
    <div className="login">
      <div className="login-top">
        <div className="brand-mark"><Icon name="nav" size={18} color="#fff" /></div>
        <div>
          <div className="lt-name">成长导航</div>
          <div className="lt-sub">业务部 · 新人成长工作台</div>
        </div>
      </div>
      <div className="login-body">
        <div className="login-head page-enter">
          <div className="login-badge"><Icon name="nav" size={13} color="var(--blue)" />企鹅 · 实习能量站</div>
          <h1 className="login-title">实习能量站</h1>
          <p className="login-sub">选择你的身份，进入对应工作台</p>
        </div>
        <div className="login-cards">
          {ROLE_SEQUENCE.map(id => <LoginCard key={id} id={id} />)}
        </div>
        <div className="login-foot">演示环境 · 选择身份即可进入对应工作台，进入后可随时切换身份</div>
      </div>
    </div>
  );
}

/* ===================== 工作台 ===================== */
function Workspace({ role }) {
  const [tabMap, setTabMap] = usePersist("ies3_tab", {});
  const [confirmSwitch, setConfirmSwitch] = useState(false);
  const cfg = ROLES[role];
  const tab = (tabMap[role] && cfg.tabs.some(t => t.id === tabMap[role])) ? tabMap[role] : cfg.tabs[0].id;
  function setTab(t) { setTabMap(m => ({ ...m, [role]: t })); }
  const curTab = cfg.tabs.find(t => t.id === tab) || cfg.tabs[0];

  return (
    <div className="app">
      <Sidebar role={role} tab={tab} setTab={setTab} onSwitch={() => setConfirmSwitch(true)} />
      <div className="main">
        <Topbar
          title={curTab.label}
          crumb={cfg.label + " · " + curTab.sub}
          search={cfg.search}
          role={role}
          onSwitch={() => setConfirmSwitch(true)}
          onNavigate={setTab}
        />
        {role === "intern" && <InternWorkbench key={"i" + tab} tab={tab} setTab={setTab} />}
        {role === "mentor" && <MentorWorkbench key={"m" + tab} tab={tab} setTab={setTab} />}
        {role === "hr" && <HRWorkbench key={"h" + tab} tab={tab} setTab={setTab} />}
      </div>
      <Confirm
        open={confirmSwitch}
        title="切换身份"
        body="将退出当前工作台，回到身份选择页。当前身份下的查看进度会保留。确认切换吗？"
        confirmText="回到身份选择"
        onCancel={() => setConfirmSwitch(false)}
        onConfirm={() => { setConfirmSwitch(false); switchRole(); }}
      />
      <ToastHost />
    </div>
  );
}

function switchRole() {
  setCurrentRole(null);
}

/* ===================== Root ===================== */
function App() {
  const role = useCurrentRole();
  if (!role || !ROLES[role]) return <LoginPage />;
  return <Workspace key={role} role={role} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
