/* ============================================================
   storageService —— 本地存储统一封装（localStorage）
   ------------------------------------------------------------
   现阶段所有数据存浏览器本地，不依赖后端即可运行。
   将来接入后端 / 数据库时，只需替换下面各方法的实现，
   页面调用方式保持不变。
   ============================================================ */
(function () {
  "use strict";

  // 与现有页面共用同一份待办数组（按 scope 区分今日 / 本周）
  const KEYS = {
    todos: "ies6_todos",            // 今日 + 本周待办（scope: today | week）
    mentorTasks: "ies_mentorTasks", // 导师发布任务
    dailyReports: "ies_dailyReports",
    weeklyReports: "ies_weeklyReports",
    taskBreakdownDraft: "ies4_breakdown",
  };

  function read(key, fallback) {
    try { const s = localStorage.getItem(key); return s == null ? fallback : JSON.parse(s); }
    catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function allTodos() {
    const t = read(KEYS.todos, null);
    return Array.isArray(t) ? t : ((window.APP_DATA && window.APP_DATA.todos) || []);
  }

  window.storageService = {
    KEYS,

    // —— 今日待办（scope=today）——
    getTodayTodos() { return allTodos().filter((t) => t.scope === "today"); },
    saveTodayTodos(list) {
      const others = allTodos().filter((t) => t.scope !== "today");
      write(KEYS.todos, others.concat(list || []));
    },

    // —— 本周待办（scope=week）——
    getWeeklyTodos() { return allTodos().filter((t) => t.scope === "week"); },
    saveWeeklyTodos(list) {
      const others = allTodos().filter((t) => t.scope !== "week");
      write(KEYS.todos, others.concat(list || []));
    },

    // —— 导师发布任务 ——
    getMentorTasks() { return read(KEYS.mentorTasks, []); },
    saveMentorTasks(tasks) { write(KEYS.mentorTasks, tasks || []); },

    // —— 日报 ——
    getDailyReports() { return read(KEYS.dailyReports, []); },
    saveDailyReports(reports) { write(KEYS.dailyReports, reports || []); },

    // —— 周报（含历史）——
    getWeeklyReports() { return read(KEYS.weeklyReports, []); },
    saveWeeklyReports(reports) { write(KEYS.weeklyReports, reports || []); },

    // —— 任务拆解草稿 ——
    getTaskBreakdownDraft() { return read(KEYS.taskBreakdownDraft, null); },
    saveTaskBreakdownDraft(draft) { write(KEYS.taskBreakdownDraft, draft); },
    clearTaskBreakdownDraft() { try { localStorage.removeItem(KEYS.taskBreakdownDraft); } catch (e) {} },
  };
})();
