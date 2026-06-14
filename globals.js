/* ============================================================
   globals —— 让旧版「全局脚本」风格的文件零改动运行
   ------------------------------------------------------------
   原项目用 <script> 直接挂载，依赖全局的 React / ReactDOM，
   以及 useState / useEffect 等 hooks（如 components.jsx 顶部的
   `const { useState } = React`，以及 app.jsx 里的 ReactDOM.createRoot）。
   这里在加载任何业务文件「之前」把它们暴露到 window 上。
   main.jsx 通过「最先 import 本文件」来保证执行顺序。
   ============================================================ */
import React from "react";
import * as ReactDOMClient from "react-dom/client";

window.React = React;
window.ReactDOM = ReactDOMClient;   // app.jsx 使用 ReactDOM.createRoot(...)
Object.assign(window, React);       // 暴露 useState / useEffect / useRef / useMemo … 为全局
