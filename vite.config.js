import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 后端默认端口（与 server/index.js 一致）。如在 .env.local 改了 PORT，这里同步改一下即可。
const API_PORT = 8787;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      // 前端 /api/* 代理到本地后端：接入 DeepSeek 后生效；mock 模式下用不到，不开后端也能跑。
      "/api": `http://localhost:${API_PORT}`,
    },
  },
});
