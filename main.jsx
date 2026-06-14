/* ============================================================
   应用入口 —— 替代原 实习能量站.html 里的一串 <script> 标签
   ------------------------------------------------------------
   以下均为静态 import，会按书写顺序依次求值（深度优先）：
   1) globals.js 必须最先执行，把 React 暴露到全局；
   2) 之后的业务文件保持与原 实习能量站.html 完全一致的加载顺序；
   3) app.jsx 末尾会自动 ReactDOM.createRoot(...).render(<App />)。
   现有 .jsx / .js 文件无需任何改动。
   ============================================================ */
import "./globals.js";
import "./styles.css";

import "./data.js";
import "./services/storageService.js";
import "./services/aiService.js";
import "./components.jsx";
import "./intern.jsx";
import "./report.jsx";
import "./mentor.jsx";
import "./hr.jsx";
import "./app.jsx";

// 问企鹅 RAG —— 独立第二个 React 根挂载到 #penguin-root（覆盖层，不改动主应用）
import "./penguin.jsx";
