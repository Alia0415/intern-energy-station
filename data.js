/* ============ 实习能量站 · 业务部新人成长导航 · Mock 数据 ============
   主线：导师布置任务 → 实习生拆成待办 → 日报记录完成与卡点 →
   卡点提醒导师 → 导师反馈/拆解 → 周报复盘沉淀证据 → HR 汇总共性问题发起组织支持
   原则：只量化过程与支持是否及时，不量化人、不排名、不横向比较
   ================================================================ */
(function () {
  // 20 名实习生 —— 不打分、不排名，只记录过程与状态
  // status: steady 节奏稳定 / watch 需要留意 / followup 建议今天跟进
  const interns = [
    { id: 1,  name: "林之遥", role: "研发", title: "前端研发实习生",  mentor: "陈骁", day: 23, phase: "30天 · 适应期", status: "steady",  todoDone: 6, todoTotal: 8, blocker: "—", blockerDays: 0, helpCount: 0, lastReport: "今天 09:40 提交日报", reportOn: true,  weeklyDone: true },
    { id: 2,  name: "苏睿",   role: "研发", title: "后端研发实习生",  mentor: "陈骁", day: 23, phase: "30天 · 适应期", status: "followup", todoDone: 3, todoTotal: 9, blocker: "联调环境无法访问，已提交 2 次求助", blockerDays: 3, helpCount: 2, lastReport: "2 天前 · 未提交日报", reportOn: false, weeklyDone: false },
    { id: 3,  name: "周乐",   role: "产品", title: "产品策划实习生",  mentor: "李湾", day: 23, phase: "30天 · 适应期", status: "watch",    todoDone: 5, todoTotal: 8, blocker: "需求评审反馈较慢", blockerDays: 2, helpCount: 1, lastReport: "昨天 18:20 更新需求文档", reportOn: true, weeklyDone: true },
    { id: 4,  name: "高远",   role: "销售", title: "商业化销售实习生", mentor: "王野", day: 22, phase: "30天 · 适应期", status: "steady",  todoDone: 6, todoTotal: 8, blocker: "—", blockerDays: 0, helpCount: 0, lastReport: "今天 10:15 完成客户调研", reportOn: true, weeklyDone: true },
    { id: 5,  name: "何夕",   role: "研发", title: "客户端研发实习生", mentor: "陈骁", day: 20, phase: "30天 · 适应期", status: "watch",    todoDone: 5, todoTotal: 8, blocker: "发布流程不熟悉，任务验收标准不清晰", blockerDays: 1, helpCount: 1, lastReport: "今天 11:02 提交代码评审", reportOn: true, weeklyDone: true },
    { id: 6,  name: "罗念",   role: "产品", title: "数据产品实习生",  mentor: "李湾", day: 20, phase: "30天 · 适应期", status: "steady",  todoDone: 7, todoTotal: 8, blocker: "—", blockerDays: 0, helpCount: 0, lastReport: "今天 09:12 完成竞品分析", reportOn: true, weeklyDone: true },
    { id: 7,  name: "叶舟",   role: "销售", title: "渠道销售实习生",  mentor: "王野", day: 19, phase: "30天 · 适应期", status: "followup", todoDone: 3, todoTotal: 8, blocker: "首次客户拜访迟迟未安排，缺少指引", blockerDays: 4, helpCount: 1, lastReport: "3 天前 · 未更新进度", reportOn: false, weeklyDone: false },
    { id: 8,  name: "孟拾",   role: "研发", title: "算法研发实习生",  mentor: "周航", day: 18, phase: "30天 · 适应期", status: "steady",  todoDone: 6, todoTotal: 7, blocker: "—", blockerDays: 0, helpCount: 0, lastReport: "昨天 20:10 提交模型实验", reportOn: true, weeklyDone: true },
    { id: 9,  name: "白杨",   role: "产品", title: "增长产品实习生",  mentor: "李湾", day: 17, phase: "30天 · 适应期", status: "watch",    todoDone: 4, todoTotal: 8, blocker: "下一步任务不清晰", blockerDays: 2, helpCount: 1, lastReport: "今天 08:50 提交周报", reportOn: true, weeklyDone: true },
    { id: 10, name: "顾川",   role: "研发", title: "测试研发实习生",  mentor: "周航", day: 16, phase: "30天 · 适应期", status: "steady",  todoDone: 6, todoTotal: 8, blocker: "—", blockerDays: 0, helpCount: 0, lastReport: "今天 10:40 完成自动化用例", reportOn: true, weeklyDone: true },
    { id: 11, name: "夏知",   role: "销售", title: "商业化销售实习生", mentor: "王野", day: 16, phase: "30天 · 适应期", status: "watch",    todoDone: 4, todoTotal: 7, blocker: "缺少反馈，不确定方向是否正确", blockerDays: 2, helpCount: 1, lastReport: "昨天 17:30 更新客户名单", reportOn: true, weeklyDone: false },
    { id: 12, name: "钟林",   role: "研发", title: "前端研发实习生",  mentor: "陈骁", day: 15, phase: "30天 · 适应期", status: "steady",  todoDone: 6, todoTotal: 7, blocker: "—", blockerDays: 0, helpCount: 0, lastReport: "今天 09:30 提交页面联调", reportOn: true, weeklyDone: true },
    { id: 13, name: "段棠",   role: "产品", title: "产品运营实习生",  mentor: "李湾", day: 14, phase: "30天 · 适应期", status: "watch",    todoDone: 4, todoTotal: 7, blocker: "内部工具不熟悉，效率偏低", blockerDays: 1, helpCount: 0, lastReport: "今天 11:20 整理用户访谈", reportOn: true, weeklyDone: true },
    { id: 14, name: "蒋文",   role: "销售", title: "渠道销售实习生",  mentor: "王野", day: 13, phase: "30天 · 适应期", status: "steady",  todoDone: 5, todoTotal: 7, blocker: "—", blockerDays: 0, helpCount: 0, lastReport: "昨天 19:00 完成话术演练", reportOn: true, weeklyDone: true },
    { id: 15, name: "邹野",   role: "研发", title: "后端研发实习生",  mentor: "周航", day: 12, phase: "30天 · 适应期", status: "watch",    todoDone: 4, todoTotal: 7, blocker: "对业务背景理解不足", blockerDays: 2, helpCount: 0, lastReport: "今天 10:05 提交接口文档", reportOn: true, weeklyDone: true },
    { id: 16, name: "唐宁",   role: "产品", title: "产品策划实习生",  mentor: "李湾", day: 11, phase: "30天 · 适应期", status: "steady",  todoDone: 6, todoTotal: 7, blocker: "—", blockerDays: 0, helpCount: 0, lastReport: "今天 09:55 输出原型方案", reportOn: true, weeklyDone: true },
    { id: 17, name: "薛然",   role: "销售", title: "商业化销售实习生", mentor: "王野", day: 10, phase: "30天 · 适应期", status: "watch",    todoDone: 3, todoTotal: 7, blocker: "客户拜访流程不清楚，不确定优先级", blockerDays: 2, helpCount: 1, lastReport: "昨天 16:40 更新拜访记录", reportOn: true, weeklyDone: false },
    { id: 18, name: "卫然",   role: "研发", title: "客户端研发实习生", mentor: "陈骁", day: 9,  phase: "30天 · 适应期", status: "steady",  todoDone: 6, todoTotal: 7, blocker: "—", blockerDays: 0, helpCount: 0, lastReport: "今天 11:10 修复若干缺陷", reportOn: true, weeklyDone: true },
    { id: 19, name: "彭宇",   role: "产品", title: "数据产品实习生",  mentor: "李湾", day: 8,  phase: "30天 · 适应期", status: "steady",  todoDone: 5, todoTotal: 7, blocker: "—", blockerDays: 0, helpCount: 0, lastReport: "今天 10:30 完成指标梳理", reportOn: true, weeklyDone: true },
    { id: 20, name: "金巧",   role: "销售", title: "渠道销售实习生",  mentor: "王野", day: 7,  phase: "30天 · 适应期", status: "steady",  todoDone: 5, todoTotal: 7, blocker: "—", blockerDays: 0, helpCount: 0, lastReport: "今天 09:20 完成产品知识考核", reportOn: true, weeklyDone: true },
  ];
  interns.forEach(it => { it.initial = it.name[0]; });

  const roleCounts = { 研发: 0, 产品: 0, 销售: 0 };
  interns.forEach(it => roleCounts[it.role]++);
  const statusCounts = { steady: 0, watch: 0, followup: 0 };
  interns.forEach(it => statusCounts[it.status]++);

  // ===================== 实习生本人：林之遥 =====================
  const me = interns.find(i => i.id === 1);

  // 本周待办（默认）—— 每条都有来源、来源类型、优先级、验收标准、预计耗时、截止时间、状态
  // srcType: mentor 导师任务 / project 项目任务 / temp 临时任务 / split 任务拆解
  // priority: urgent 紧急（其余默认 normal，不展示标签）
  // sortOrder: 今日待办的显示顺序，用户可拖拽调整；缺省按数组顺序
  // 顺延：carried 表示未完成自动顺延，carriedFromDate 最初顺延日 / lastCarriedDate 最近顺延日 / carryoverCount 已顺延天数
  const todos = [
    { id: "t2", name: "修复需求评审中的 3 个交互问题", source: "导师安排", srcType: "mentor", sourceRef: "来自 6月10日需求评审", acceptance: "3 个问题全部修复并自测通过，截图同步导师", ddl: "6月12日 18:00", priority: "urgent", status: "doing", scope: "today", sortOrder: 1, week: "this" },
    { id: "t4", name: "打通灰度发布环境权限并跑通一次", source: "导师安排", srcType: "mentor", sourceRef: "来自导师陈骁 · 6月11日", acceptance: "能独立完成一次灰度发布配置", ddl: "6月12日 18:00", status: "stuck", scope: "today", sortOrder: 2, week: "this" },
    { id: "tc1", name: "汇总需求评审结论与待办项", source: "任务拆解", srcType: "split", sourceRef: "由「完成一次需求评审记录」拆解生成", status: "todo", scope: "today", sortOrder: 3, carried: true, carriedFromDate: "6月11日", lastCarriedDate: "6月12日", carryoverCount: 1, week: "this" },
    { id: "t1", name: "完成「会员中心」首页埋点联调", source: "导师安排", srcType: "mentor", sourceRef: "来自导师陈骁 · 6月9日", acceptance: "埋点数据在测试环境正确上报，并经导师确认", ddl: "6月12日 18:00", status: "done", scope: "today", sortOrder: 4, week: "this" },
    { id: "t3", name: "完成一次需求评审记录", source: "项目任务", srcType: "project", sourceRef: "来自 会员中心项目 · 6月10日需求评审", acceptance: "记录背景、问题、结论和下一步，并提交导师确认", start: "6月11日", ddl: "6月13日 18:00", status: "todo", scope: "week", week: "this" },
    { id: "t7", name: "梳理会员中心的埋点字段清单", source: "导师安排", srcType: "mentor", sourceRef: "来自导师陈骁 · 6月11日", acceptance: "输出一份字段表并通过导师确认", start: "6月12日", ddl: "6月14日 18:00", status: "todo", scope: "week", week: "this" },
    { id: "t6", name: "阅读内部组件库 TDesign 规范并输出速查", source: "自己添加", srcType: "temp", sourceRef: "个人学习计划", acceptance: "输出 1 页可复用速查笔记", start: "6月13日", ddl: "6月15日 18:00", status: "todo", scope: "week", week: "this" },
  ];

  // 优先级标签：只标注紧急，普通任务不展示
  const priorityMeta = {
    urgent: { label: "紧急", tone: "red" },
  };

  // 任务拆解库 —— 按任务 id 给出小任务清单；无匹配时用 _generic
  // 每条：name 小任务 / estimate 预计耗时 / suggest 建议完成时间 / acceptance 验收标准
  const breakdowns = {
    t2: [
      { name: "复现并截图记录 3 个交互问题", estimate: "约 30 分钟", suggest: "今天 11:00 前", acceptance: "每个问题有复现步骤和截图" },
      { name: "定位每个问题对应的代码与组件", estimate: "约 40 分钟", suggest: "今天 14:00 前", acceptance: "明确每个问题改动的文件和函数" },
      { name: "逐个修复并本地自测 3 个问题", estimate: "约 90 分钟", suggest: "今天 16:30 前", acceptance: "3 个问题自测全部通过" },
      { name: "截图同步导师并请求验收", estimate: "约 20 分钟", suggest: "今天 17:30 前", acceptance: "导师确认修复无遗漏" },
    ],
    t3: [
      { name: "整理评审会的背景与目标", estimate: "约 20 分钟", suggest: "今天 11:00 前", acceptance: "用 2-3 句说清为什么要做这次评审" },
      { name: "记录讨论中的关键问题与分歧", estimate: "约 30 分钟", suggest: "今天 15:00 前", acceptance: "列出 3-5 个关键问题及不同意见" },
      { name: "汇总结论与后续待办项", estimate: "约 25 分钟", suggest: "今天 16:00 前", acceptance: "每条结论标明负责人和时间" },
      { name: "提交导师确认评审记录", estimate: "约 10 分钟", suggest: "今天 17:00 前", acceptance: "导师确认记录完整可用" },
    ],
    t4: [
      { name: "把权限拆成账号 / 环境 / 发布三类", estimate: "约 20 分钟", suggest: "今天 10:30 前", acceptance: "明确三类权限各缺什么" },
      { name: "逐项提交并跟进权限申请", estimate: "约 40 分钟", suggest: "今天 14:00 前", acceptance: "三类申请均已提交且有跟进人" },
      { name: "在导师陪同下跑通一次灰度发布", estimate: "约 60 分钟", suggest: "今天 16:30 前", acceptance: "独立完成一次灰度发布配置" },
      { name: "整理一份灰度发布 checklist", estimate: "约 25 分钟", suggest: "今天 17:30 前", acceptance: "下次可照着 checklist 独立操作" },
    ],
    t7: [
      { name: "列出会员中心改版涉及的关键用户行为", estimate: "约 30 分钟", suggest: "今天上午", acceptance: "覆盖首页、权益、订单等主要页面" },
      { name: "为每个行为定义埋点字段", estimate: "约 45 分钟", suggest: "今天下午", acceptance: "字段命名符合团队埋点规范" },
      { name: "与导师确认字段口径", estimate: "约 20 分钟", suggest: "今天下班前", acceptance: "字段表通过导师确认" },
    ],
    t6: [
      { name: "通读 TDesign 规范总览与目录", estimate: "约 25 分钟", suggest: "今天上午", acceptance: "标出与本项目相关的章节" },
      { name: "摘录常用组件用法与规范要点", estimate: "约 40 分钟", suggest: "今天下午", acceptance: "覆盖按钮 / 表单 / 反馈三类组件" },
      { name: "整理成 1 页速查笔记", estimate: "约 35 分钟", suggest: "今天下午", acceptance: "一页内可快速检索常用规范" },
      { name: "同步到团队文档并发给导师", estimate: "约 10 分钟", suggest: "今天下班前", acceptance: "链接已同步，导师可访问" },
    ],
    _generic: [
      { name: "明确任务目标与验收标准", estimate: "约 20 分钟", suggest: "今天上午", acceptance: "用一句话写清做到什么算完成" },
      { name: "拆出关键步骤并排序", estimate: "约 30 分钟", suggest: "今天上午", acceptance: "列出 3-5 个可执行步骤" },
      { name: "完成第一个最小可交付步骤", estimate: "约 60 分钟", suggest: "今天下午", acceptance: "有一个可展示的中间产出" },
      { name: "自查并同步导师确认方向", estimate: "约 20 分钟", suggest: "今天下班前", acceptance: "同步进展并确认方向无偏差" },
    ],
  };

  // 日报填写默认内容
  const daily = {
    date: "6月12日 · 周五",
    mood: "还不错",
    done: "",
    gain: "",
    blocker: "",
    help: "",
    plan: [
      { name: "完成 3 个交互问题修复并自测", estimate: "约 2 小时", source: "导师安排", acceptance: "全部修复并自测通过" },
      { name: "参加周一需求评审会并记录要点", estimate: "约 1 小时", source: "团队日程", acceptance: "输出评审记录并提交导师" },
    ],
  };

  // 周报（智能草稿，可编辑、需本人确认后提交）
  const weekly = {
    range: "6月9日 — 6月15日",
    meta: "智能草稿 · 基于本周 4 份日报汇总 · 待本人确认",
    status: "draft", // draft / submitted
    submittedAt: "",
    fields: {
      work: "1. 完成会员中心首页埋点联调并通过评审；\n2. 交付首个独立前端页面需求；\n3. 输出 2 篇技术学习笔记。",
      ability: "1. 任务交付更稳定，能独立完成端到端联调；\n2. 复盘表达从流水账过渡到「事实-分析-结论」结构；\n3. 更熟练地用内部工具与文档提效。",
      problem: "1. 对发布 / 灰度流程仍不熟悉，环境权限未打通；\n2. 遇到卡点时不确定对接人，定位偏慢。",
      nextPlan: "1. 打通灰度发布环境并独立跑通一次；\n2. 独立承接一个中等复杂度模块；\n3. 完成一次需求评审记录。",
      support: "1. 希望带看一次完整的灰度发布流程；\n2. 需求验收标准希望更明确一些。",
    },
  };
  const weeklyFieldDefs = [
    { key: "work", label: "本周主要工作" },
    { key: "ability", label: "本周能力提升" },
    { key: "problem", label: "遇到的问题" },
    { key: "nextPlan", label: "下周计划" },
    { key: "support", label: "需要导师支持" },
  ];

  // 历史记录 · 日报记录（按天查看推进、卡点、导师反馈）
  const dailyHistory = [
    {
      date: "6月11日 · 周四", done: 2, undone: 1, blockers: 1, feedback: "已反馈", linkedTodos: 2,
      detail: {
        mood: "有点累",
        doneList: ["梳理灰度发布流程中的权限申请节点", "输出第一版埋点验收清单"],
        gain: "理清了需求从提交到灰度验证的完整链路，也知道了日报需要写清楚进展、卡点和下一步。",
        blocker: "灰度发布环境权限未打通，定位问题花了较多时间。",
        help: "希望导师带看一次完整灰度发布流程，并明确验收标准。",
        mentorFeedback: "可以先把权限问题拆成账号权限、环境权限、发布权限三类，明天上午一起过一遍。",
        todos: ["确认灰度环境权限", "补充埋点验收清单"],
      },
    },
    {
      date: "6月10日 · 周三", done: 3, undone: 0, blockers: 0, feedback: "已反馈", linkedTodos: 3,
      detail: {
        mood: "还不错",
        doneList: ["完成会员权益页用户路径拆解", "整理需求文档中的关键流程", "和导师确认本期改版的需求范围"],
        gain: "学会把任务拆成输入、处理、输出三个部分，记录起来更清楚。",
        blocker: "暂无明显卡点。",
        help: "希望确认会员权益模块哪些本期做、哪些放到下期。",
        mentorFeedback: "需求拆解可以继续保留，但建议每条任务增加负责人和预计完成时间。",
        todos: ["补充任务负责人", "补充预计完成时间", "整理用户路径图"],
      },
    },
    {
      date: "6月9日 · 周二", done: 2, undone: 1, blockers: 1, feedback: "未反馈", linkedTodos: 2,
      detail: {
        mood: "压力有点大",
        doneList: ["完成竞品会员体系功能拆解", "整理三个相似产品的会员权益结构"],
        gain: "发现做需求不是写得多，而是能让导师快速看到进度、问题和需要支持的地方。",
        blocker: "不确定积分规则的边界，哪些场景前端校验、哪些后端兜底。",
        help: "希望导师帮忙对齐积分规则的前后端职责边界。",
        mentorFeedback: null,
        todos: ["等待积分规则确认", "整理积分前端校验点"],
      },
    },
    {
      date: "6月8日 · 周一", done: 4, undone: 1, blockers: 0, feedback: "已反馈", linkedTodos: 1,
      detail: {
        mood: "轻松",
        doneList: ["参加项目例会", "记录需求变更点", "整理本周任务清单", "初步拆分优先级"],
        gain: "任务拆分后更容易判断优先级，也更方便和导师同步。",
        blocker: "暂无明显卡点。",
        help: "希望确认本周任务优先级是否合理。",
        mentorFeedback: "优先级基本合理，建议先完成会员中心首页，再处理权益弹窗。",
        todos: ["确认本周任务优先级"],
      },
    },
    {
      date: "6月5日 · 周五", done: 3, undone: 0, blockers: 1, feedback: "已反馈", linkedTodos: 2,
      detail: {
        mood: "还不错",
        doneList: ["完成第一版页面走查", "标注三个交互问题", "整理下周优化方向"],
        gain: "页面不仅要还原视觉，还要在不同分辨率和状态下都稳定可用。",
        blocker: "会员等级图标在低分屏下发虚，没找到合适的切图方案。",
        help: "希望导师确认会员等级图标用 SVG 还是雪碧图。",
        mentorFeedback: "建议统一用 SVG，配合 TDesign 的 Icon 组件，分辨率适配更省心。",
        todos: ["替换为 SVG 图标", "回归低分屏显示"],
      },
    },
  ];

  // 历史记录 · 周报记录（按周查看阶段复盘、问题、下周计划）
  const weeklyHistory = [
    {
      period: "6月2日 - 6月8日", done: "5 项", gain: "1 条", problem: "2 条", nextPlan: "4 条", feedback: "已反馈",
      detail: {
        keyTasks: ["交付会员中心首页改版", "完成一次需求评审记录", "梳理积分规则前端校验点"],
        doneList: ["完成首页布局与样式还原", "对接首页接口并联调", "修复页面走查中的 3 个交互问题", "补充积分规则前端校验", "输出第一版埋点方案"],
        gain: ["理解了一个需求从评审、开发到联调上线的完整链路，每个环节都要留痕。"],
        problem: ["接口联调时对字段口径理解有偏差，返工了一次", "对团队的 Git 分支规范还不熟悉"],
        nextPlan: ["完成会员中心首页埋点联调", "打通灰度发布环境", "独立承接权益弹窗模块", "补齐积分规则单元测试"],
        mentorFeedback: "方向正确，下一步重点是把联调和发布流程跑顺，减少返工。",
      },
    },
    {
      period: "5月26日 - 6月1日", done: "6 项", gain: "2 条", problem: "1 条", nextPlan: "5 条", feedback: "已反馈",
      detail: {
        keyTasks: ["交付首个独立页面：会员权益列表", "熟悉团队组件库 TDesign", "完成第一次需求评审"],
        doneList: ["完成权益列表页静态还原", "接入权益列表接口", "处理空态与加载态", "本地自测主要交互", "提交第一次 Code Review"],
        gain: ["写组件前先看团队有没有现成的，能省很多重复工作", "提交 Code Review 前自查一遍，能减少来回沟通"],
        problem: ["第一次 Code Review 改动较多，对团队代码规范还不熟。"],
        nextPlan: ["交付会员中心首页改版", "完成一次需求评审记录", "熟悉灰度发布流程", "补齐组件库速查笔记", "通读团队代码规范"],
        mentorFeedback: "上手速度不错，权益列表页完成度比预期高，可以继续保持。",
      },
    },
    {
      period: "5月19日 - 5月25日", done: "4 项", gain: "2 条", problem: "2 条", nextPlan: "3 条", feedback: "未反馈",
      detail: {
        keyTasks: ["完成开发环境搭建", "熟悉会员中心代码库", "跟进第一个小需求：会员头像挂件"],
        doneList: ["搭好本地开发环境", "跑通项目并能本地预览", "读完会员中心核心模块代码", "完成头像挂件的样式还原"],
        gain: ["读懂现有代码再动手，比直接写更快", "遇到环境问题先查文档和搜历史记录，再问人"],
        problem: ["环境搭建踩了不少坑，依赖版本对不上", "对项目的目录结构还不太熟"],
        nextPlan: ["交付头像挂件需求", "独立承接权益列表页", "通读组件库文档"],
        mentorFeedback: null,
      },
    },
  ];

  // 顶部铃铛 · 通知中心（按身份变化）
  const notifications = {
    intern: [
      { id: "in1", title: "6月11日日报尚未提交", body: "今天的日报还没有提交，建议在下班前补充今日完成、卡点和求助事项。", time: "10 分钟前", type: "日报提醒", read: false },
      { id: "in2", title: "导师已反馈 6月10日日报", body: "导师补充了任务验收口径，建议查看后更新关联待办。", time: "1 小时前", type: "导师反馈", read: false },
      { id: "in3", title: "本周周报今天 18:00 截止", body: "请在周报中整理本周完成事项、问题复盘和下周计划。", time: "今天 09:00", type: "周报提醒", read: true },
      { id: "in4", title: "你有 1 条待处理关联待办", body: "灰度发布流程确认仍未完成，建议今天优先处理。", time: "昨天 18:30", type: "任务提醒", read: true },
    ],
    mentor: [
      { id: "mn1", title: "有 2 名实习生日报待查看", body: "林之遥、陈嘉宁提交了新的日报，建议今天完成反馈。", time: "15 分钟前", type: "待反馈提醒", read: false },
      { id: "mn2", title: "林之遥提交了新的周报", body: "周报中提到灰度发布流程卡点，需要你补充验收标准。", time: "1 小时前", type: "周报提醒", read: false },
      { id: "mn3", title: "有 1 条任务延期说明待确认", body: "延期原因涉及环境权限，请判断是否需要协调资源。", time: "昨天 17:40", type: "任务提醒", read: true },
    ],
    hr: [
      { id: "hr1", title: "2 名实习生连续两天未提交日报", body: "建议先核实是否为任务安排变化、系统使用问题或沟通断层。", time: "20 分钟前", type: "风险提醒", read: false },
      { id: "hr2", title: "1 名带教反馈频率偏低", body: "近三天反馈记录较少，建议结合工作负荷和实习生状态一起判断。", time: "2 小时前", type: "带教提醒", read: false },
      { id: "hr3", title: "本周实习状态周报已生成", body: "可以查看整体实习状态、风险分布和带教负担变化。", time: "今天 09:30", type: "系统通知", read: true },
    ],
  };

  // ===================== 导师工作台：陈骁 =====================
  const mentor = { name: "陈骁", title: "高级前端工程师 · 带教导师", team: "研发 · 平台体验组" };
  const mentees = interns.filter(i => i.mentor === "陈骁"); // 林之遥 苏睿 何夕 钟林 卫然

  // 每个实习生的「为什么今天跟进 + 建议动作」
  const followInfo = {
    2: { why: "联调环境卡住 3 天，已提交 2 次求助但未被响应，连续 2 天未提交日报。", suggest: "安排 10 分钟同步，确认环境权限和接口文档；并把任务拆成可执行小步。", talk: "我看到你这两天日报没有提交，联调环境也卡了几天，我们今天找 10 分钟一起确认一下问题点，看看是权限还是接口文档的事。" },
    5: { why: "日报提到发布流程不熟悉，且该任务缺少明确的验收标准。", suggest: "补充该任务的验收标准，并安排一次发布流程观摩。", talk: "发布流程不用有压力，我先把这个任务的验收标准补清楚，今天带你把流程走一遍，过程中有不清楚的随时打断我。" },
    1: { why: "节奏稳定、主动性强，本周已独立交付首个需求。", suggest: "给一句肯定，并可适度提高一个任务的难度。", talk: "这周状态很稳，首个需求独立交付得很漂亮。下一个任务我会稍微加一点难度，相信你没问题。" },
    12:{ why: "页面联调推进顺利，无明显卡点。", suggest: "保持当前节奏，给一次代码评审的深度反馈。", talk: "页面联调推进得不错，我抽空给你的代码做一次深度评审，帮你把细节再打磨一下。" },
    18:{ why: "缺陷修复效率高、质量意识好。", suggest: "鼓励沉淀一份缺陷复盘，利己也利团队。", talk: "缺陷修复又快又稳，建议把这次的共性成因整理成一篇小复盘，对你和团队都有帮助。" },
  };

  // 导师 Todo（带教待办）
  const mentorTodos = [
    { id: "m1", text: "回复 苏睿 的联调环境卡点", type: "卡点", done: false },
    { id: "m2", text: "给 林之遥 的本周周报反馈", type: "周报", done: false },
    { id: "m3", text: "确认 何夕「发布流程」任务的验收标准", type: "验收", done: false },
    { id: "m4", text: "安排与 苏睿 的一次 1v1", type: "1v1", done: false },
    { id: "m5", text: "标记 钟林 页面联调任务已验收", type: "验收", done: true },
  ];

  // 导师可量化指标（量化过程与支持是否及时，不量化人）
  const mentorMetrics = [
    { k: "今日待反馈", v: "3", u: "人", ico: "chat", tone: "blue" },
    { k: "平均反馈时长", v: "4.2", u: "小时", ico: "clock", tone: "green" },
    { k: "超 24h 未回应求助", v: "1", u: "条", ico: "alert", tone: "orange" },
    { k: "本周 1v1 完成", v: "2", u: "次", ico: "calendar", tone: "blue" },
    { k: "任务验收标准补充", v: "5", u: "条", ico: "doc", tone: "purple" },
  ];

  // 导师反馈记录（历史）
  const feedbackRecords = [
    { who: "林之遥", date: "6月11日 17:20", type: "日报反馈", text: "埋点联调做得很扎实，灰度发布我明天带你走一遍流程。", linked: "6月11日日报" },
    { who: "钟林",   date: "6月11日 16:05", type: "任务验收", text: "页面联调通过验收，接口字段处理得很干净，继续保持。", linked: "页面联调任务" },
    { who: "何夕",   date: "6月10日 18:40", type: "卡点回复", text: "发布流程别急，先按 checklist 跑一遍，有问题随时找我。", linked: "发布流程卡点" },
    { who: "卫然",   date: "6月10日 11:30", type: "鼓励肯定", text: "缺陷修复效率很高，可以试着把共性成因总结成一篇复盘。", linked: "缺陷修复任务" },
  ];

  // 每个实习生的日报记录 / 求助记录（导师在「查看记录」里下钻看到的真实内容）
  const menteeRecords = {
    2: { // 苏睿
      daily: [
        { date: "今天 · 周五", status: "未提交", note: "连续第 2 天未提交日报，建议先确认是否被环境问题卡住。" },
        { date: "昨天 · 周四", status: "未提交", note: "未提交，当天有一条求助未被响应。" },
        { date: "6月10日 · 周三", status: "已提交", done: ["搭好本地联调环境框架", "梳理订单服务接口字段"], blocker: "联调环境无法访问测试库，已发起权限申请但未通过。", help: "希望帮忙确认测试库白名单配置。", feedback: null },
        { date: "6月9日 · 周二", status: "已提交", done: ["阅读订单模块代码", "整理接口调用链路"], blocker: "接口文档版本不一致，不确定以哪份为准。", help: "想确认最新接口文档在哪里。", feedback: "最新文档在 wiki『订单服务 v2』，我把链接发你。" },
      ],
      help: [
        { date: "昨天 14:20", title: "联调环境无法访问测试库", detail: "测试库连接被拒，怀疑白名单未配置，已尝试重启服务与切换网络仍无效。", status: "未响应", waited: "超 24h" },
        { date: "前天 16:05", title: "接口文档找不到最新版", detail: "现有文档字段和实际返回不一致，影响联调进度。", status: "已响应", waited: "2.5h" },
      ],
    },
    5: { // 何夕
      daily: [
        { date: "今天 · 周五", status: "已提交", done: ["提交客户端代码评审", "补充埋点字段说明"], blocker: "发布流程不熟悉，不确定灰度步骤。", help: "希望带看一次完整发布流程。", feedback: null },
        { date: "昨天 · 周四", status: "已提交", done: ["完成首页改版自测", "整理发布前 checklist"], blocker: "任务验收标准不清晰，不确定做到什么算完成。", help: "希望明确这个任务的验收标准。", feedback: "发布流程别急，先按 checklist 跑一遍，明天我带你走一遍。" },
        { date: "6月10日 · 周三", status: "已提交", done: ["修复 2 个 UI 还原问题"], blocker: "—", help: "—", feedback: "还原做得很细致，继续保持。" },
      ],
      help: [
        { date: "今天 10:40", title: "发布 / 灰度流程不熟悉", detail: "第一次接触灰度发布，不清楚步骤和回滚方式，怕影响线上。", status: "已响应", waited: "1.2h" },
      ],
    },
  };

  // 导师派发给各实习生的任务（派给林之遥的会同步进 TA 的待办，显示在今日/本周）
  const assignments = {
    1: [
      { id: "t1", name: "完成「会员中心」首页埋点联调", acceptance: "埋点数据在测试环境正确上报，并经导师确认", ddl: "6月12日 18:00", scope: "today", date: "6月9日" },
      { id: "t2", name: "修复需求评审中的 3 个交互问题", acceptance: "3 个问题全部修复并自测通过，截图同步导师", ddl: "6月13日 18:00", scope: "week", date: "6月10日" },
    ],
    2: [
      { id: "as2a", name: "打通订单服务联调环境", acceptance: "本地可正常联调并提交一次代码", ddl: "6月13日 18:00", scope: "week", date: "6月10日", status: "doing" },
    ],
    5: [
      { id: "as5a", name: "跟我走一遍灰度发布流程并记录", acceptance: "输出一份发布 checklist 并提交导师", ddl: "6月13日 18:00", scope: "week", date: "6月11日", status: "todo" },
    ],
    12: [
      { id: "as12a", name: "页面联调任务收尾并提交验收", acceptance: "通过验收，接口字段处理干净", ddl: "6月11日 18:00", scope: "today", date: "6月11日", status: "done" },
    ],
    18: [],
  };

  // 实习生提交的任务（带教需要查看并反馈）
  // status: pending 待查看 / feedback 已反馈 / revision 需修改
  const submissions = [
    { id: "sub1", menteeId: 1, name: "林之遥", task: "完成「会员中心」首页埋点联调", at: "今天 09:40", status: "pending",
      note: "埋点已接入并在测试环境验证：首页 PV/UV、模块点击均正常上报，附验证截图与字段说明。", attach: "埋点验证截图.png" },
    { id: "sub2", menteeId: 5, name: "何夕", task: "提交客户端首页改版代码评审", at: "今天 11:02", status: "pending",
      note: "首页改版已自测并提交代码评审；发布 / 灰度流程还不太熟悉，想请教一下。", attach: "MR-1287" },
    { id: "sub3", menteeId: 18, name: "卫然", task: "修复客户端若干 UI 还原缺陷", at: "今天 11:10", status: "pending",
      note: "已修复 5 个 UI 还原问题，附前后对比截图。", attach: "对比截图.zip" },
    { id: "sub4", menteeId: 12, name: "钟林", task: "页面联调任务收尾并提交验收", at: "昨天 16:05", status: "feedback",
      note: "接口字段已对齐，列表 / 详情联调通过，自测无异常。", attach: "联调记录.md",
      feedback: "页面联调通过验收，接口字段处理得很干净，继续保持。", needRevision: false, fbAt: "昨天 17:10" },
    { id: "sub5", menteeId: 1, name: "林之遥", task: "输出需求评审记录初稿", at: "昨天 18:20", status: "revision",
      note: "整理了评审背景、关键问题与结论。", attach: "评审记录.md",
      feedback: "结论部分需要补充每条的负责人和时间，补充后再提交。", needRevision: true, fbAt: "昨天 19:00" },
  ];

  // 带教助手 · 智能草稿（后台能力，点击才生成）
  const mentorGen = {
    talk:   ["沟通话术 · 智能草稿已生成", "已为 {name} 生成一段 1v1 开场话术：先肯定近期投入，再以「最近有没有卡住的地方」自然切入卡点，语气温和、不带压力。"],
    split:  ["任务拆解 · 智能草稿已生成", "已把 {name} 当前任务拆成 3 个可执行小步，并标注预计用时与验收点，降低上手门槛。"],
    outline:["1v1 提纲 · 智能草稿已生成", "已生成与 {name} 的面谈提纲：① 最近状态 ② 当前卡点与需要的支持 ③ 下周一个小目标 ④ 你能提供的帮助。"],
  };

  // ===================== HR 工作台（3 页：组织总览 / 问题与支持 / 岗位适配）=====================

  // —— 组织总览 · 整体指标（每张含计算口径，趋势仅在有数据依据时展示）——
  const overviewMetrics = [
    { k: "日报提交率",      v: 90, u: "%", target: 85, basis: "18 / 20 人按时提交", trend: "+4%", up: true,  ico: "doc",    tone: "blue" },
    { k: "周报复盘完成率",  v: 80, u: "%", target: 80, basis: "16 / 20 人完成",     trend: "+6%", up: true,  ico: "loop",   tone: "blue" },
    { k: "待办完成率",      v: 71, u: "%", target: 80, topic: "todo",   belowScope: "全体实习生本周待办", belowAction: "排查未完成待办，提醒导师跟进卡点", basis: "本周待办 完成 / 总数", ico: "check",  tone: "blue" },
    { k: "导师反馈及时率",  v: 74, u: "%", target: 80, topic: "mentor", belowScope: "涉及 2 位导师",       belowAction: "提醒导师或协调其他导师接手",       basis: "目标 ≥ 80%", trend: "-3%", up: false, ico: "mentor", tone: "orange" },
  ];

  // —— 问题与支持 · 高频问题 Top 5 ——（类型标签：流程 / 反馈 / 信息 / 工具 / 导师协同）
  //   count = 反馈人次（用于排序与聚合），topic = 主题键（用于去重）
  const hotIssues = [
    { rank: 1, name: "任务验收标准不清晰", type: "流程",     topic: "review-std", count: 14, basis: "本周 14 人次反馈",                  scope: "涉及 8 名实习生、3 个岗位", action: "制定任务验收标准模板",           btn: "创建支持动作" },
    { rank: 2, name: "导师反馈不及时",     type: "导师协同", topic: "mentor",     count: 3,  basis: "3 条求助超 24h 未响应",             scope: "涉及 2 位导师、4 名实习生", action: "提醒导师反馈或协调其他导师接手", btn: "去协调", urgent: true },
    { rank: 3, name: "环境 / 工具配置慢",  type: "工具",     topic: "tool",       count: 9,  basis: "9 人次反馈",                        scope: "主要集中在研发岗",         action: "统一环境配置说明",               btn: "创建支持动作" },
    { rank: 4, name: "任务背景信息不足",   type: "信息",     topic: "info",       count: 7,  basis: "7 人次在日报中提到\u201c不清楚背景\u201d", scope: "产品岗、运营岗",            action: "补充任务背景字段",               btn: "创建支持动作" },
    { rank: 5, name: "不清楚卡点找谁对接", type: "信息",     topic: "contact",    count: 6,  basis: "6 人次反馈",                        scope: "涉及研发岗、销售岗",       action: "下发各组对接人清单",             btn: "创建支持动作" },
  ];

  // —— 组织总览 · 本周待处理事项 ——
  //   不写死：从「高频问题」与「整体指标低于目标」两路信号自动聚合，
  //   同一主题去重，按严重度排序后取前 3。任一来源数据变化，这里自动跟着变。
  function deriveOverviewTasks(max) {
    const cand = [];
    // 来源 A：高频问题（urgent / 时效突破优先，其次按反馈人次）
    hotIssues.forEach(it => {
      cand.push({
        id: "iss-" + it.rank, topic: it.topic, from: "高频问题",
        issue: it.name, basis: it.basis, scope: it.scope, action: it.action,
        btn: it.urgent ? "去协调" : "去处理",
        tone: it.urgent ? "red" : "orange",
        sev: (it.urgent ? 2000 : 0) + (it.count || 0) * 10,
      });
    });
    // 来源 B：整体指标低于目标（缺口越大越靠前）
    overviewMetrics.forEach(m => {
      if (m.target == null || m.v >= m.target) return;
      const gap = m.target - m.v;
      cand.push({
        id: "kpi-" + m.k, topic: m.topic, from: "指标低于目标",
        issue: m.k + "低于目标",
        basis: "当前 " + m.v + m.u + "，目标 ≥ " + m.target + m.u + "（差 " + gap + m.u + "）",
        scope: m.belowScope || "全体实习生",
        action: m.belowAction || "排查原因并制定改进动作",
        btn: "查看问题",
        tone: gap >= 10 ? "red" : "orange",
        sev: 1000 + gap * 30,
      });
    });
    // 同主题去重（保留严重度更高者），取前 max 条
    cand.sort((a, b) => b.sev - a.sev);
    const seen = new Set(), out = [];
    for (const c of cand) {
      if (c.topic && seen.has(c.topic)) continue;
      if (c.topic) seen.add(c.topic);
      out.push(c);
      if (out.length >= (max || 3)) break;
    }
    return out;
  }
  const overviewTasks = deriveOverviewTasks(3);

  // —— 问题与支持 · HR 待处理事项 ——（只保留 HR 今天真正要处理的事；点按钮即处理）
  //   务实待办列表：系统按已有业务记录触发待确认事项，HR 点详情看来源与原始记录，自己判断处理。
  //   每条：source 事项来源 / target 涉及对象 / reason 触发原因（规则化、可追溯）
  //         owner 当前责任人 / ddl 截止 / status 待确认|已超时|已解决
  //         rule 触发规则（详情用）/ record 原始记录键值对（详情用）
  const hrTasks = [
    {
      id: "t1", source: "任务系统", target: "本周 4 个任务",
      reason: "任务发布时未填写验收标准", owner: "陈晓", ddl: "本周五", status: "待确认",
      rule: "任务发布时，「验收标准」字段为空即触发待确认",
      record: [
        { k: "任务名称", v: "首页改版需求拆解 等 4 个任务" },
        { k: "发布人",   v: "陈晓（产品组带教）" },
        { k: "发布时间", v: "06-10 ~ 06-12" },
        { k: "当前状态", v: "已发布，待实习生领取" },
        { k: "缺失字段", v: "验收标准（4 个任务均为空）" },
      ],
    },
    {
      id: "t2", source: "带教反馈记录", target: "2 名实习生",
      reason: "任务提交超过 24 小时未反馈", owner: "陈晓", ddl: "今日 18:00", status: "已超时",
      rule: "实习生提交任务后，带教 24 小时内未在反馈记录中留下反馈即触发",
      record: [
        { k: "涉及任务", v: "组件库梳理、活动页走查（共 2 个）" },
        { k: "提交时间", v: "06-12 14:20" },
        { k: "当前状态", v: "已提交，等待带教反馈" },
        { k: "等待时长", v: "约 28 小时（已超 24 小时阈值）" },
      ],
    },
    {
      id: "t3", source: "入职流程", target: "1 名实习生",
      reason: "入职任务停留超过 2 天", owner: "平台组", ddl: "明日 12:00", status: "待确认",
      rule: "入职流程中的某一节点停留超过 2 天未流转即触发",
      record: [
        { k: "实习生",   v: "新入职实习生（产品组）" },
        { k: "流程节点", v: "开发环境与权限开通" },
        { k: "开始时间", v: "06-10 09:30" },
        { k: "当前状态", v: "工单待平台组处理，已停留 2 天" },
      ],
    },
    {
      id: "t4", source: "日报记录", target: "产品组实习生",
      reason: "日报中多次提到“不清楚任务目标”", owner: "产品组带教", ddl: "本周五", status: "待确认",
      rule: "同一实习生近 7 天日报中，命中“不清楚/不知道任务目标”关键词 ≥ 3 次即触发",
      record: [
        { k: "日报来源", v: "产品组实习生 · 近 7 天日报" },
        { k: "命中次数", v: "3 次（06-09 / 06-11 / 06-12）" },
        { k: "原文摘录", v: "“还是不太清楚这个任务最终要交付什么”" },
        { k: "当前状态", v: "日报已提交，未在反馈中得到澄清" },
      ],
    },
  ];

  // —— 组织总览 · 实习流程风险 ——（HR 待协调事项：流程卡点 + 责任人未响应；HR 推动而非代办）
  //   HR 视角：关注流程是否卡住、责任人是否未响应；HR 只做协调推动，不替责任人完成任务
  //   主列表字段：name 实习生 / owner 当前责任人 / riskType 风险类型 / stuck 卡住时长 / hrAction HR 动作
  //   btn 主按钮文案 / done 点击后状态 / toastMsg 跟进 toast / 详情字段：desc 风险说明 / hrAdvice 建议 HR 动作 / lastFollow 最近一次跟进记录
  const internExceptions = [
    { id: "ie1", name: "苏睿", dept: "研发 · 平台体验组", owner: "陈晓", overdue: true,
      riskType: "带教反馈超时", stuck: "24 小时", hrAction: "提醒带教反馈",
      btn: "提醒带教", done: "已提醒带教", toastMsg: "已提醒陈晓今日内反馈。",
      desc: "实习生提交任务后，带教超过 24 小时未反馈，可能影响任务推进。",
      hrAdvice: "提醒带教在当天完成反馈，如超过 48 小时仍未处理，可升级至部门主管。",
      lastFollow: "暂无跟进记录" },
    { id: "ie2", name: "顾川", dept: "研发 · 质量工程组", owner: "平台组", overdue: true,
      riskType: "入职权限未完成", stuck: "2 天", hrAction: "转交平台组确认",
      btn: "转交平台组", done: "已转交平台组", toastMsg: "已转交平台组确认账号与权限。",
      desc: "入职权限配置停留超过 2 天未完成，疑似账号或权限未开通，实习生暂时无法进入开发环境。",
      hrAdvice: "转交平台组确认账号与权限开通进度，如当天仍未解决，可同步至 IT 支持。",
      lastFollow: "暂无跟进记录" },
    { id: "ie3", name: "周乐", dept: "产品 · 用户增长组", owner: "李湾", overdue: false,
      riskType: "任务要求不完整", stuck: "1 天", hrAction: "提醒带教补充标准",
      btn: "提醒带教", done: "已提醒带教", toastMsg: "已提醒李湾补充任务验收标准。",
      desc: "任务发布时未填写验收标准，实习生不确定交付到什么程度算完成，已出现一次返工。",
      hrAdvice: "提醒带教补充任务验收标准，明确交付要求，避免重复返工。",
      lastFollow: "暂无跟进记录" },
  ];

  // —— 数据来源（可追溯）：每个高频问题 / 低于目标指标背后的原始记录 ——
  //   口径：日报「卡点 / 求助」字段、求助记录、周报「需要导师支持」字段，按语义归类。
  //   每条 record：who 实习生 / role 岗位 / mentor 导师 / via 来源类型 / date 时间 /
  //                wait 等待时长（求助类）/ quote 原文摘录。more = 同类已归并但未逐条展示的条数。
  const issueSources = {
    "review-std": {
      title: "任务验收标准不清晰", type: "流程", metric: "本周 14 人次反馈",
      scope: "涉及 8 名实习生、3 个岗位", action: "制定《任务验收标准》模板", btn: "创建支持动作",
      collect: "采集自 6月8日–6月12日 日报「卡点 / 求助」字段与周报「需要导师支持」字段，经语义归类",
      records: [
        { who: "何夕", role: "研发", via: "日报", date: "6月11日", quote: "任务验收标准不清晰，不确定做到什么算完成。" },
        { who: "白杨", role: "产品", via: "日报", date: "6月11日", quote: "下一步任务不清晰，不知道交付到什么程度算达标。" },
        { who: "薛然", role: "销售", via: "日报", date: "6月10日", quote: "不确定客户拜访的优先级和完成标准。" },
        { who: "邹野", role: "研发", via: "周报", date: "6月9日", quote: "希望任务能附上明确的验收标准，减少返工。" },
        { who: "段棠", role: "产品", via: "日报", date: "6月11日", quote: "不清楚用户访谈整理到什么颗粒度算完成。" },
        { who: "夏知", role: "销售", via: "日报", date: "6月10日", quote: "缺少反馈，不确定方向是否正确。" },
      ],
      more: 8,
    },
    "mentor": {
      title: "导师反馈不及时", type: "导师协同", metric: "3 条求助超 24h 未响应",
      scope: "涉及 2 位导师、4 名实习生", action: "提醒导师反馈或协调其他导师接手", btn: "去协调",
      collect: "统计求助记录中状态为「未响应」且等待时长 ≥ 24h 的条目，处理入口在「导师协同事项」",
      records: [
        { who: "苏睿", role: "研发", mentor: "陈骁", via: "求助", date: "昨天 14:20", wait: "超 24h", quote: "联调环境无法访问测试库，怀疑白名单未配置。" },
        { who: "叶舟", role: "销售", mentor: "王野", via: "求助", date: "前天 09:10", wait: "超 30h", quote: "首次客户拜访迟迟未安排，缺少指引。" },
        { who: "薛然", role: "销售", mentor: "王野", via: "求助", date: "前天 15:30", wait: "超 24h", quote: "客户拜访流程不清楚，不确定从哪一步开始。" },
      ],
    },
    "tool": {
      title: "环境 / 工具配置慢", type: "工具", metric: "9 人次反馈",
      scope: "主要集中在研发岗", action: "统一环境配置说明", btn: "创建支持动作",
      collect: "采集自日报「卡点」字段中与环境、权限、内部工具相关的条目",
      records: [
        { who: "苏睿", role: "研发", via: "日报", date: "6月10日", quote: "联调环境无法访问测试库，已发起权限申请但未通过。" },
        { who: "段棠", role: "产品", via: "日报", date: "6月11日", quote: "内部工具不熟悉，整理访谈效率偏低。" },
        { who: "邹野", role: "研发", via: "日报", date: "6月10日", quote: "接口文档版本不一致，不确定以哪份为准。" },
        { who: "何夕", role: "研发", via: "日报", date: "6月10日", quote: "发布 / 灰度环境权限未打通，定位问题花了较多时间。" },
      ],
      more: 5,
    },
    "info": {
      title: "任务背景信息不足", type: "信息", metric: "7 人次反馈",
      scope: "产品岗、运营岗", action: "补充任务背景字段", btn: "创建支持动作",
      collect: "采集自日报与周报中提到「不清楚背景 / 不了解业务」的条目",
      records: [
        { who: "邹野", role: "研发", via: "日报", date: "6月11日", quote: "对业务背景理解不足，拿到任务不知道为什么做。" },
        { who: "周乐", role: "产品", via: "日报", date: "6月10日", quote: "需求背景交代得比较少，评审时才补齐信息。" },
        { who: "白杨", role: "产品", via: "周报", date: "6月9日", quote: "希望任务能说明目标和上下游，便于判断优先级。" },
      ],
      more: 4,
    },
    "contact": {
      title: "不清楚卡点找谁对接", type: "信息", metric: "6 人次反馈",
      scope: "涉及研发岗、销售岗", action: "下发各组对接人清单", btn: "创建支持动作",
      collect: "采集自日报「求助」字段中提到「不知道找谁 / 对接人不明」的条目",
      records: [
        { who: "苏睿", role: "研发", via: "日报", date: "6月9日", quote: "遇到环境问题不确定该找平台组还是导师。" },
        { who: "夏知", role: "销售", via: "日报", date: "6月11日", quote: "客户资料的事不清楚该找哪个同事确认。" },
        { who: "段棠", role: "产品", via: "日报", date: "6月10日", quote: "工具权限卡住，不知道对接人是谁。" },
      ],
      more: 3,
    },
    "todo": {
      title: "待办完成率低于目标", type: "指标", metric: "当前 71%，目标 ≥ 80%",
      scope: "全体实习生本周待办", action: "排查未完成待办，提醒导师跟进卡点",
      collect: "统计本周全体实习生待办「已完成 / 总数」，下列为未完成数较多、且多与卡点相关的实习生",
      records: [
        { who: "苏睿", role: "研发", via: "本周待办", date: "进行中", quote: "8 项完成 3 项 · 卡在联调环境无法访问。" },
        { who: "叶舟", role: "销售", via: "本周待办", date: "进行中", quote: "8 项完成 3 项 · 首次客户拜访未安排。" },
        { who: "薛然", role: "销售", via: "本周待办", date: "进行中", quote: "7 项完成 3 项 · 拜访流程不清楚。" },
        { who: "白杨", role: "产品", via: "本周待办", date: "进行中", quote: "8 项完成 4 项 · 下一步任务不清晰。" },
        { who: "夏知", role: "销售", via: "本周待办", date: "进行中", quote: "7 项完成 4 项 · 缺少反馈，方向不确定。" },
      ],
      more: 0,
    },
  };

  // —— 岗位适配 · 判定规则（量化阈值；状态由规则判定，规则在页面中直接展示）——
  const fitRules = {
    正常:           { label: "暂无明显适配风险", tone: "gray",   c: "var(--t3)",     rule: "近两周任务延期 / 返工 / 理解偏差信号 < 2 次，且无组织侧卡点与导师介入建议" },
    需观察:         { label: "需观察",          tone: "orange", c: "var(--orange)", rule: "近两周累计出现 ≥ 2 次任务延期 / 返工 / 理解偏差" },
    需排除组织问题: { label: "需排除组织问题",  tone: "blue",   c: "var(--blue)",   rule: "卡点连续 ≥ 3 天，且原因指向工具 / 权限 / 环境 / 任务说明等组织侧（先排除组织问题，不计入岗位错配）" },
    建议沟通:       { label: "建议沟通",        tone: "red",    c: "var(--red)",    rule: "连续两周触发『需观察』，或 ≥ 2 次明确表达岗位 / 方向调整意愿，或导师提交 HR 介入建议" },
  };

  // —— 岗位适配 · 观察列表（每条 basis 写明触发了哪条量化规则）——
  const fitObservations = [
    { name: "周乐", post: "产品岗", state: "需观察",       signal: "需求理解偏差较多", basis: "近 2 周出现 3 次返工（≥ 2 次 → 需观察）",            action: "安排导师沟通任务理解方式" },
    { name: "苏睿", post: "研发岗", state: "需排除组织问题", signal: "环境配置阻塞",     basis: "连续 4 天日报提到环境问题（≥ 3 天且为组织侧）",       action: "先协调工具环境支持，不判断岗位错配" },
    { name: "夏知", post: "销售岗", state: "建议沟通",       signal: "岗位兴趣方向变化", basis: "近 2 次周报表达希望了解产品方向（≥ 2 次 → 建议沟通）", action: "HR 访谈确认发展兴趣" },
  ];

  // —— 岗位适配 · 适配概览（按状态聚合：正常 = 实习生总数 − 已标记；其余 = 命中该规则的人数）——
  const fitOrder = ["正常", "需观察", "需排除组织问题", "建议沟通"];
  const fitOverview = fitOrder.map(k => {
    const r = fitRules[k];
    const flagged = fitObservations.filter(o => o.state === k).length;
    return { k: r.label, state: k, v: k === "正常" ? interns.length - fitObservations.length : flagged, u: "人", tone: r.tone, rule: r.rule };
  });

  window.APP_DATA = {
    interns, roleCounts, statusCounts,
    me, todos, priorityMeta, breakdowns, daily, weekly, weeklyFieldDefs, dailyHistory, weeklyHistory, notifications,
    now: { month: 6, day: 12, hour: 15, minute: 30 },
    mentor, mentees, followInfo, mentorTodos, mentorMetrics, feedbackRecords, mentorGen, menteeRecords, assignments, submissions,
    overviewMetrics, overviewTasks, hotIssues, hrTasks, internExceptions, fitOverview, fitObservations, fitRules, issueSources,
    statusLabel: { steady: "节奏稳定", watch: "需要留意", followup: "建议今天跟进" },
    statusTone:  { steady: "green",  watch: "orange",   followup: "red" },
    taskStatus: {
      todo:  { label: "未开始", tone: "gray",   dot: "#A9AEB8" },
      doing: { label: "进行中", tone: "blue",   dot: "#0052D9" },
      done:  { label: "已完成", tone: "green",  dot: "#00924C" },
      stuck: { label: "卡住了", tone: "orange", dot: "#D9700B" },
    },
    // 支持动作状态
    actionStatus: {
      todo:    { label: "待开始", tone: "gray",   c: "var(--t3)" },
      doing:   { label: "进行中", tone: "blue",   c: "var(--blue)" },
      done:    { label: "已完成", tone: "green",  c: "var(--green)" },
      overdue: { label: "已逾期", tone: "red",    c: "var(--red)" },
    },
    // 岗位适配状态（由判定规则 fitRules 派生，保证状态与规则一一对应）
    fitState: Object.fromEntries(Object.entries(fitRules).map(([k, r]) => [k, { tone: r.tone, c: r.c }])),
  };
})();
