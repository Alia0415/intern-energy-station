# 实习能量站 · 业务部新人成长导航智能看板（2.0 · 可部署版）

Vite + React 前端 + Node/Express 后端（含「企鹅」规则库 RAG，接入 DeepSeek）。
**一个 Node 进程同时托管前端静态页面与 `/api` 接口**，因此部署到公网时只需要一个 Node 服务即可，无需单独的前端托管。

---

## 一、本地开发

```bash
npm install
npm run dev:all      # 前端(5173) + 后端(8787) 一起起
```
打开 http://localhost:5173 。Key 配置见下方第三节。

> 只跑前端 `npm run dev`：AI 相关功能会走本地兜底，不报错。

## 二、本地以「生产模式」预览（和公网跑法一致）

```bash
npm run prod         # = vite build 后 node server/index.js
```
打开 http://localhost:8787 （同一个端口既是网页又是 API）。

---

## 三、配置 DeepSeek Key

Key **只在后端读取**，前端代码与打包产物里都不会出现。

- **本地**：复制 `.env.example` 为 `.env.local`，填入 `DEEPSEEK_API_KEY=sk-你的key`。`.env.local` 已被 `.gitignore` 忽略，不会提交。
- **公网部署**：不要提交 Key，改成在托管平台后台配置环境变量 `DEEPSEEK_API_KEY`（见下）。

自检：访问 `/api/health` → `{"ok":true,"hasKey":true}` 表示 Key 已加载。

---

## 四、部署到公网（带 API）

因为有 `/api` 接口，**需要一个能跑 Node 的托管平台**（纯静态托管如 GitHub Pages 不行——那样 AI 功能会失效）。

通用三件套（适用于 Render / Railway / Fly.io / 自己的服务器等）：

| 配置项 | 值 |
|---|---|
| 安装+构建命令 | `npm install && npm run build` |
| 启动命令 | `npm start`（即 `node server/index.js`） |
| 环境变量 | `DEEPSEEK_API_KEY = sk-你的key`（必填）|
| 端口 | 无需手动设；平台会注入 `PORT`，服务已自动读取 |

启动后服务会在平台分配的端口上**同时**提供网页和 `/api`，前端用相对路径 `/api/...` 调用，天然同源、无需跨域配置。

### 以 Render 为例（有免费档，适合新手）

1. 把本项目推到 GitHub（`.env.local`、`node_modules`、`dist` 都已被忽略，不会上传）。
2. Render → New → **Web Service** → 选这个仓库。
3. Runtime 选 **Node**；
   - Build Command：`npm install && npm run build`
   - Start Command：`npm start`
4. Environment → 添加变量 `DEEPSEEK_API_KEY` = 你的 Key。
5. 部署完成后访问 Render 给的网址即可（网页 + 企鹅问答 + 任务拆解 + 周报全可用）。

> 更新代码后重新 push，Render 会自动重新构建部署。

---

## 五、接口一览（server/index.js）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/health` | 健康检查 / Key 是否加载 |
| POST | `/api/penguin-chat` | 企鹅 RAG（后端检索规则库 → 只基于规则作答）|
| POST | `/api/ai/task-breakdown` | 任务拆解 |
| POST | `/api/ai/weekly-report` | 周报生成 |
| 其它 GET | `/*` | 返回打包后的 `index.html`（前端单页应用）|

企鹅 RAG 的可信检索：前端只传 `{role, question}`，**后端用 `searchKnowledgeBase` 自行检索**规则库作为唯一可信上下文，不信任前端传来的规则；检索为空直接返回 no_match 不调用模型；模型失败回退本地规则模板。

---

## 六、目录结构（关键）

```
index.html            入口（#root 主应用 + #penguin-root 企鹅覆盖层）
main.jsx / globals.js 入口与全局垫片（兼容原“全局脚本”写法）
app/components/intern/mentor/hr/report.jsx, data.js, styles.css   三角色工作台（你的 2.0 内容）
penguin.jsx           企鹅 RAG 面板（独立第二个 React 根）
services/
  knowledgeBase.js    16 条规则库 + searchKnowledgeBase + 兜底（前后端共用）
  aiService.js        任务拆解/周报 封装（USE_MOCK_AI=false 即走后端 DeepSeek）
  storageService.js   localStorage 封装
server/index.js       后端：/api/* + 生产环境托管 dist 静态资源
.env.example          环境变量模板（复制为 .env.local 填 Key；公网用平台环境变量）
```

> 原型单文件 `实习能量站.html` 已保留作参考，Vite 不使用它。
