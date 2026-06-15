/* ============================================================
   aiService —— AI 能力统一封装（当前阶段：本地 mock）
   ------------------------------------------------------------
   现阶段不接真实后端 / 不接真实模型 / 前端不含任何密钥。
   将来接入自有后端时，只需把 USE_MOCK_AI 改为 false，
   下方已预留好 fetch('/api/ai/...') 的调用位置，无需改动页面。
   ============================================================ */
(function () {
  "use strict";

  // 切到自有后端时改为 false 即可（其余代码无需改动）
  const USE_MOCK_AI = false;

  /* ---------- 小工具 ---------- */
  const uid = (p) => (p || "id") + "-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1e4).toString(36);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function splitItems(text) {
    return String(text || "")
      .split(/[\n；;。]+/)
      .map((s) => s.replace(/^[\s0-9.、)）·\-]+/, "").trim())
      .filter(Boolean);
  }
  function dedup(arr) {
    const seen = new Set(); const out = [];
    arr.forEach((x) => { const k = x.trim(); if (k && !seen.has(k)) { seen.add(k); out.push(k); } });
    return out;
  }

  /* ============================================================
     一、任务拆解 mock
     输入 task: { title, description, deadline, priority, ... }
     输出 { subtasks:[...], tips }
     ============================================================ */
  // 按关键词路由到不同的拆解模板，让结果贴合任务类型（而非千篇一律）
  const TEMPLATES = [
    {
      test: /评审|纪要|记录|会议|复盘/,
      steps: (t) => [
        { title: "梳理「" + t + "」的背景与目标", desc: "用 2-3 句说清这次要解决什么、面向谁。", min: 25 },
        { title: "记录讨论中的关键问题与分歧", desc: "列出 3-5 个关键点及不同意见，标注待确认项。", min: 40 },
        { title: "汇总结论与后续待办", desc: "每条结论标明负责人和时间点。", min: 30 },
        { title: "整理成文并提交导师确认", desc: "按团队模板成稿，发给导师确认无遗漏。", min: 20 },
      ],
      tips: "建议先确认这份记录的交付格式和提交对象，再动手整理。",
    },
    {
      test: /埋点|数据|上报|统计|指标/,
      steps: (t) => [
        { title: "列出涉及的关键用户行为", desc: "覆盖主要页面与核心操作路径。", min: 30 },
        { title: "为每个行为定义埋点字段", desc: "字段命名遵循团队埋点规范，标注类型与触发时机。", min: 45 },
        { title: "与导师确认字段口径", desc: "确认无歧义、可复用后再开发。", min: 20 },
        { title: "接入并在测试环境验证上报", desc: "确认 PV/UV、点击事件正确上报。", min: 60 },
      ],
      tips: "字段口径最容易返工，建议先和导师对齐一版再写代码。",
    },
    {
      test: /发布|灰度|上线|部署|回滚/,
      steps: (t) => [
        { title: "把权限拆成账号 / 环境 / 发布三类", desc: "逐类确认各缺什么、找谁申请。", min: 25 },
        { title: "逐项提交并跟进权限申请", desc: "确保每条申请都有跟进人和预计通过时间。", min: 40 },
        { title: "在导师陪同下跑通一次完整流程", desc: "记录每一步操作与回滚方式。", min: 60 },
        { title: "整理一份发布 checklist", desc: "下次可照着 checklist 独立操作。", min: 30 },
      ],
      tips: "第一次接触发布流程，务必先确认回滚方式，避免影响线上。",
    },
    {
      test: /修复|缺陷|bug|问题|报错|异常/i,
      steps: (t) => [
        { title: "复现并截图记录问题", desc: "写清复现步骤、预期与实际表现。", min: 30 },
        { title: "定位问题对应的代码与组件", desc: "明确每个问题改动的文件和函数。", min: 40 },
        { title: "逐个修复并本地自测", desc: "确认改动不影响相邻功能。", min: 75 },
        { title: "提交自测结果并请求验收", desc: "附前后对比，请导师确认修复无遗漏。", min: 20 },
      ],
      tips: "建议先把问题复现清楚再改，避免改了之后无法验证。",
    },
    {
      test: /阅读|学习|规范|文档|调研|熟悉/,
      steps: (t) => [
        { title: "通读材料总览，标出相关章节", desc: "先建立整体框架，再深入细节。", min: 25 },
        { title: "摘录与当前工作相关的要点", desc: "聚焦能马上用上的部分。", min: 45 },
        { title: "整理成 1 页速查笔记", desc: "一页内可快速检索常用规范。", min: 35 },
        { title: "同步到团队文档并发给导师", desc: "确认链接可访问。", min: 15 },
      ],
      tips: "学习类任务容易发散，建议先框定「这次要解决什么问题」。",
    },
    {
      test: /接口|联调|对接|集成/,
      steps: (t) => [
        { title: "确认接口文档与字段口径", desc: "以最新版文档为准，列出入参与返回。", min: 30 },
        { title: "搭好本地联调环境", desc: "确认能正常请求到测试数据。", min: 40 },
        { title: "完成数据对接与状态处理", desc: "覆盖加载态、空态与异常态。", min: 75 },
        { title: "联调自测并记录问题", desc: "把字段不一致等问题同步给后端。", min: 30 },
      ],
      tips: "联调前先和后端对齐字段口径，能省掉大量返工。",
    },
    {
      test: /设计|交互|稿|页面|还原|组件|样式/,
      steps: (t) => [
        { title: "拆解「" + t + "」涉及的页面与状态", desc: "列出正常 / 空 / 加载 / 异常各状态。", min: 30 },
        { title: "完成静态布局与样式还原", desc: "对照设计稿核对间距、字号与颜色。", min: 75 },
        { title: "接入数据并处理交互细节", desc: "覆盖点击、校验与边界情况。", min: 60 },
        { title: "本地自测并提交 Code Review", desc: "自查一遍规范后再提交。", min: 25 },
      ],
      tips: "动手前先看团队是否有现成组件，能省很多重复工作。",
    },
  ];
  const GENERIC = {
    steps: (t) => [
      { title: "明确「" + t + "」的目标与验收标准", desc: "用一句话写清做到什么算完成。", min: 20 },
      { title: "拆出关键步骤并排序", desc: "列出 3-5 个可执行步骤，标注先后。", min: 30 },
      { title: "完成第一个最小可交付步骤", desc: "先做出一个可展示的中间产出。", min: 60 },
      { title: "自查并同步导师确认方向", desc: "同步进展，确认方向无偏差。", min: 20 },
    ],
    tips: "建议先确认交付格式和截止时间，再开始动手。",
  };

  function pickTemplate(title) {
    return TEMPLATES.find((tpl) => tpl.test.test(title)) || GENERIC;
  }

  function mockTaskBreakdown(task) {
    const title = (task && task.title) || "任务";
    const urgent = task && task.priority === "urgent";
    const tpl = pickTemplate(title);
    let steps = tpl.steps(title).slice();
    // 紧急任务多拆一步收尾确认，普通任务保留 4 步
    if (urgent && steps.length < 5) {
      steps.push({ title: "向导师同步进度与风险", desc: "紧急任务及时暴露卡点，避免临近截止才发现问题。", min: 15 });
    }
    const prByIndex = (i) => (i === 0 ? "high" : i < steps.length - 1 ? "medium" : "low");
    const dateNormal = (i) => (i === 0 ? "today" : i === 1 ? "today" : i === 2 ? "tomorrow" : "this_week");
    const dateUrgent = (i) => (i < 3 ? "today" : "tomorrow");
    const subtasks = steps.map((s, i) => ({
      id: uid("sub"),
      title: s.title,
      description: s.desc,
      estimatedMinutes: s.min,
      priority: urgent ? (i < 2 ? "high" : "medium") : prByIndex(i),
      suggestedDate: urgent ? dateUrgent(i) : dateNormal(i),
      status: "pending",
      selected: true,
    }));
    return { subtasks, tips: tpl.tips };
  }

  /* ============================================================
     二、周报生成 mock
     输入 dailyReports: [{ date, completed:[], problems, solutions, learning, needHelp }]
          weekRange: "6月9日 — 6月15日"
     输出 { summary, completedWork, keyResults, problems, solutions, learning, nextWeekPlan, needMentorHelp }
     ============================================================ */
  function mockGenerateWeeklyReport(dailyReports, weekRange) {
    const reports = Array.isArray(dailyReports) ? dailyReports : [];
    const completed = [];
    const problems = [];
    const solutions = [];
    const learning = [];
    const help = [];
    reports.forEach((r) => {
      if (!r) return;
      (Array.isArray(r.completed) ? r.completed : splitItems(r.completed || r.workContent || r.done)).forEach((x) => completed.push(x));
      splitItems(r.problems || r.blocker).forEach((x) => problems.push(x));
      splitItems(r.solutions).forEach((x) => solutions.push(x));
      splitItems(r.learning || r.gain).forEach((x) => learning.push(x));
      splitItems(r.needHelp || r.help).forEach((x) => help.push(x));
    });
    const cw = dedup(completed);
    const pb = dedup(problems);
    const sv = dedup(solutions);
    const lr = dedup(learning);
    const hp = dedup(help);
    const empty = (arr, alt) => (arr.length ? arr : [alt || "暂无明确记录"]);

    const summary =
      reports.length === 0
        ? "本周暂无日报记录。"
        : `本周（${weekRange || ""}）共记录 ${reports.length} 天日报，完成 ${cw.length} 项主要工作` +
          (pb.length ? `，仍有 ${pb.length} 项问题待跟进。` : "，整体推进顺利。");

    return {
      summary,
      completedWork: empty(cw, "暂无明确记录"),
      keyResults: cw.slice(0, 3).length ? cw.slice(0, 3) : ["暂无明确记录"],
      problems: empty(pb, "本周无明显卡点"),
      solutions: empty(sv, "暂无明确记录"),
      learning: empty(lr, "暂无明确记录"),
      // 下周计划：基于本周未解决问题与求助推导，不凭空编造
      nextWeekPlan: (hp.length || pb.length)
        ? dedup([].concat(hp.map((h) => "推进解决：" + h)).concat(pb.map((p) => "跟进：" + p))).slice(0, 4)
        : ["延续本周节奏，承接下一阶段任务"],
      needMentorHelp: empty(hp, "暂无需要导师协助的事项"),
    };
  }

  /* ============================================================
     三、对外请求入口（页面只调用这两个）
     当前走 mock；未来把 USE_MOCK_AI 改 false 即走自有后端。
     ============================================================ */
  async function requestTaskBreakdown(task) {
    if (USE_MOCK_AI) {
      await wait(700); // 模拟处理耗时
      return mockTaskBreakdown(task);
    }
    // ===== 预留：接入自有后端后启用 =====
    return fetch("/api/ai/task-breakdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskTitle: task.title,
        taskDescription: task.description || "",
        deadline: task.deadline || "",
        priority: task.priority || "normal",
        currentTodoList: task.currentTodoList || [],
      }),
    }).then((res) => res.json());
  }

  async function requestWeeklyReport(dailyReports, weekRange) {
    if (USE_MOCK_AI) {
      await wait(900); // 模拟处理耗时
      return mockGenerateWeeklyReport(dailyReports, weekRange);
    }
    // ===== 预留：接入自有后端后启用 =====
    return fetch("/api/ai/weekly-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekRange, dailyReports }),
    }).then((res) => res.json());
  }

  // 日报「提炼工作亮点 / 生成导师版总结」—— 返回 { title, body }
  function mockDailyDraft(kind, daily) {
    const d = daily || {};
    if (kind === "mentor") {
      return {
        title: "导师版总结 · 智能草稿",
        body: `今日完成：${d.done || "（未填写）"}。卡点：${d.blocker || "无明显卡点"}。建议：${d.help ? "围绕「" + d.help + "」给予支持" : "保持当前节奏，按需跟进"}。`,
      };
    }
    const items = [d.done, d.gain, d.blocker].filter(Boolean).map((x) => "• " + x);
    return {
      title: "工作亮点 · 智能草稿",
      body: items.length ? items.join("\n") : "• （请先填写今日完成与收获，再提炼亮点）",
    };
  }

  async function requestDailyDraft(kind, daily) {
    if (USE_MOCK_AI) {
      await wait(800); // 模拟处理耗时
      return mockDailyDraft(kind, daily);
    }
    return fetch("/api/ai/daily-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, daily }),
    }).then((res) => {
      if (!res.ok) throw new Error("api_" + res.status);
      return res.json();
    });
  }

  window.aiService = {
    USE_MOCK_AI,
    mockTaskBreakdown,
    mockGenerateWeeklyReport,
    mockDailyDraft,
    requestTaskBreakdown,
    requestWeeklyReport,
    requestDailyDraft,
  };
})();
