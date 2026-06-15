/* ============================================================
   后端服务 —— 为前端 services/aiService.js 提供 /api/ai/* 接口
   ------------------------------------------------------------
   · API Key 只在后端通过 process.env.DEEPSEEK_API_KEY 读取，
     绝不出现在前端代码或打包产物里。
   · 把 Key 放在项目根目录的 .env.local（已被 .gitignore 忽略）。
   · 前端默认是 mock 模式（aiService.js 里 USE_MOCK_AI = true），
     不开本服务也能完整运行；正式接入 DeepSeek 时把它改成 false 即可，
     页面调用方式无需改动。
   ============================================================ */
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { searchKnowledgeBase, NO_MATCH_MESSAGE, buildFallbackAnswer } from "../services/knowledgeBase.js";

// 优先读取 .env.local，再用 .env 兜底（互不覆盖已存在的变量）
dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 8787;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

/** 取 Key，缺失时直接给前端返回友好提示 */
function requireApiKey(res) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    res.status(500).json({
      error: "missing_api_key",
      message:
        "未检测到 DEEPSEEK_API_KEY。请在项目根目录新建 .env.local 并填入 Key 后重启后端（npm run server）。",
    });
    return null;
  }
  return key;
}

/** 调用 DeepSeek Chat Completions，并解析其 JSON 输出 */
async function callDeepSeek(apiKey, messages) {
  const resp = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`DeepSeek 返回 ${resp.status}: ${text}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}

/** 调用 DeepSeek Chat Completions，返回纯文本（用于问企鹅 RAG 的自然语言回答） */
async function callDeepSeekText(apiKey, messages) {
  const resp = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: DEEPSEEK_MODEL, messages, temperature: 0.2 }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`DeepSeek 返回 ${resp.status}: ${text}`);
  }
  const data = await resp.json();
  return data?.choices?.[0]?.message?.content || "";
}

const ROLE_LABEL = { intern: "实习生", mentor: "带教", hr: "HR" };

// 健康检查 / 自检：确认服务在跑、Key 是否加载
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(process.env.DEEPSEEK_API_KEY),
    model: DEEPSEEK_MODEL,
  });
});

// 一、任务拆解 —— 返回 { subtasks:[...], tips }（与 aiService.mockTaskBreakdown 同构）
app.post("/api/ai/task-breakdown", async (req, res) => {
  const apiKey = requireApiKey(res);
  if (!apiKey) return;
  const {
    taskTitle = "",
    taskDescription = "",
    deadline = "",
    priority = "normal",
  } = req.body || {};
  try {
    const result = await callDeepSeek(apiKey, [
      {
        role: "system",
        content:
          "你是实习生成长辅导助手。把任务拆成 3-5 个今天可执行的小步骤，只输出 JSON：" +
          '{"subtasks":[{"title":string,"description":string,"estimatedMinutes":number,' +
          '"priority":"high"|"medium"|"low","suggestedDate":"today"|"tomorrow"|"this_week"}],' +
          '"tips":string}',
      },
      {
        role: "user",
        content: `任务标题：${taskTitle}\n任务描述：${taskDescription}\n截止时间：${deadline}\n优先级：${priority}`,
      },
    ]);
    const subtasks = (result.subtasks || []).map((s, i) => ({
      id: `sub-${Date.now().toString(36)}-${i}`,
      title: s.title || "",
      description: s.description || "",
      estimatedMinutes: s.estimatedMinutes || 30,
      priority: s.priority || "medium",
      suggestedDate: s.suggestedDate || "today",
      status: "pending",
      selected: true,
    }));
    res.json({ subtasks, tips: result.tips || "" });
  } catch (err) {
    res.status(502).json({ error: "deepseek_failed", message: String(err.message || err) });
  }
});

// 二、周报生成 —— 返回结构与 aiService.mockGenerateWeeklyReport 同构
app.post("/api/ai/weekly-report", async (req, res) => {
  const apiKey = requireApiKey(res);
  if (!apiKey) return;
  const { weekRange = "", dailyReports = [] } = req.body || {};
  try {
    const result = await callDeepSeek(apiKey, [
      {
        role: "system",
        content:
          "你是实习生成长辅导助手。根据本周日报生成周报，只输出 JSON：" +
          '{"summary":string,"completedWork":string[],"keyResults":string[],' +
          '"problems":string[],"solutions":string[],"learning":string[],' +
          '"nextWeekPlan":string[],"needMentorHelp":string[]}',
      },
      {
        role: "user",
        content: `周期：${weekRange}\n日报数据(JSON)：${JSON.stringify(dailyReports)}`,
      },
    ]);
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: "deepseek_failed", message: String(err.message || err) });
  }
});

// 三、日报草稿 —— 「提炼工作亮点 / 生成导师版总结」，基于真实日报，返回 { title, body }
app.post("/api/ai/daily-draft", async (req, res) => {
  const apiKey = requireApiKey(res);
  if (!apiKey) return;
  const { kind = "highlight", daily = {} } = req.body || {};
  const isMentor = kind === "mentor";
  const meta = isMentor
    ? {
        title: "导师版总结 · 智能草稿",
        sys:
          "你是实习生成长辅导助手。根据这份日报，为导师写一段「导师版总结」：客观描述今日表现，" +
          "判断卡点是流程性还是能力性，给出具体可执行的带教建议，并判断当前所处阶段。" +
          "语气中肯、就事论事；只基于日报内容、不编造。",
      }
    : {
        title: "工作亮点 · 智能草稿",
        sys:
          "你是实习生成长辅导助手。根据这份日报，提炼 3-4 条「工作亮点」，聚焦真实成长、主动性与可迁移的能力，" +
          "每条以「• 」开头并用 \\n 分行；只基于日报内容、不编造。",
      };
  try {
    const result = await callDeepSeek(apiKey, [
      {
        role: "system",
        content:
          meta.sys +
          " 严格只依据用户填写的内容作答，不得编造未提及的工作；若填写很少，就只提炼 1-2 条或简短作答。" +
          ' 只输出 JSON：{"title":string,"body":string}。body 用简体中文。',
      },
      {
        role: "user",
        content:
          `今日状态：${daily.mood || "未填"}\n今日完成：${daily.done || "未填"}\n` +
          `今日小收获：${daily.gain || "未填"}\n遇到的卡点：${daily.blocker || "未填"}\n` +
          `需要导师帮助：${daily.help || "未填"}`,
      },
    ]);
    res.json({ title: result.title || meta.title, body: result.body || "" });
  } catch (err) {
    res.status(502).json({ error: "deepseek_failed", message: String(err.message || err) });
  }
});

// 四、问企鹅 RAG —— 可信检索增强：后端「自行检索」，不信任前端传来的 matchedDocs
//   请求体：{ role, question }            ← 前端只传这两项
//   · 后端用 searchKnowledgeBase(question, role) 在服务端检索，作为唯一可信上下文。
//   · 检索为空 → 直接 no_match，不调用 DeepSeek。
//   · 命中 → 用规则原文拼“只能基于规则回答”的强约束 prompt 调用 DeepSeek。
//   · DeepSeek 失败 / 未配置 Key → 基于服务端 matchedDocs 返回 fallback（含 references），不让前端报错。
//   返回体：{ kind: "no_match"|"api"|"fallback", answer, references:[{id,title,content}] }
app.post("/api/penguin-chat", async (req, res) => {
  const { role = "", question = "" } = req.body || {};

  // 安全加固：只信任服务端检索结果，忽略前端可能传来的任何 matchedDocs（防伪造规则内容）
  const matchedDocs = searchKnowledgeBase(question, role);

  // 5) 服务端检索为空 → 直接 no_match，不调用 DeepSeek
  if (!matchedDocs.length) {
    return res.json({ kind: "no_match", answer: NO_MATCH_MESSAGE, references: [] });
  }

  // 参考规则随回答一并返回（含原文，供界面“点击查看规则原文”）
  const references = matchedDocs.map((d) => ({ id: d.id, title: d.title, content: d.content }));

  // 7) Key 只在后端读取；未配置时视为 API 不可用 → 基于规则的 fallback（不让前端报错）
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.json({ kind: "fallback", answer: buildFallbackAnswer(matchedDocs), references });
  }

  // 2)+3)+prompt约束：只把服务端命中的规则原文作为上下文，强制“只能基于规则回答”
  const rulesText = matchedDocs
    .map((d, i) => `【规则${i + 1}：${d.title}】\n${d.content}`)
    .join("\n\n");
  const system = [
    "你叫“企鹅”，是业务部新人成长工作台里的规则助手；用户喊你“企鹅”。",
    "你只能依据下面提供的【规则】来回答用户的问题：规则之外的任何信息都不要补充、不要凭常识发挥、更不要编造。",
    "如果这些规则不足以回答问题，就直接说“根据现有规则暂时无法确定”，并建议补充相关规则。",
    "用简体中文回答，简洁、口语化、可执行；不要在正文里罗列规则编号或“参考规则”，参考来源会由界面单独展示。",
    "",
    "可用规则如下：",
    rulesText,
  ].join("\n");

  try {
    const answer = await callDeepSeekText(apiKey, [
      { role: "system", content: system },
      { role: "user", content: `用户身份：${ROLE_LABEL[role] || role}\n问题：${question}` },
    ]);
    res.json({ kind: "api", answer: String(answer || "").trim(), references });
  } catch (err) {
    // 6) DeepSeek 失败 → 基于服务端 matchedDocs 返回 fallback（含 references），不让页面报错
    console.warn("[penguin-chat] DeepSeek 调用失败，回退本地规则模板：", String(err.message || err));
    res.json({ kind: "fallback", answer: buildFallbackAnswer(matchedDocs), references });
  }
});

// ===== 生产部署：同一个 Node 服务同时托管打包后的前端静态资源 =====
// 部署到公网时只需跑这一个进程：既服务网页，又提供 /api 接口（无需单独的前端托管）。
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..", "dist");
app.use(express.static(distDir));
// 单页应用兜底：非 /api 的请求都回 index.html（直接刷新 / 任意路径都能正常打开）
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(distDir, "index.html"), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`[server] 服务已启动：http://localhost:${PORT}`);
  console.log(
    `[server] DeepSeek Key：${process.env.DEEPSEEK_API_KEY ? "已加载" : "未配置（前端仍可在 mock 模式下运行）"}`
  );
});
