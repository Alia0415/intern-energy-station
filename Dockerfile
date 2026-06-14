# 实习能量站 · 单镜像部署（构建前端 + 运行后端，同一进程托管 dist 静态页面与 /api）
# 适用于腾讯云「云开发 CloudBase 云托管」/ 任意容器平台
FROM node:20-alpine

WORKDIR /app

# 1) 先装依赖（含 devDependencies —— 构建前端需要 vite）
COPY package.json package-lock.json ./
RUN npm install --include=dev

# 2) 复制源码并把前端打包到 dist/
COPY . .
RUN npm run build

# 3) 监听端口（请与云托管控制台里的「服务端口」保持一致）
ENV PORT=8787
EXPOSE 8787

# 4) 启动：Node 同时托管 dist 前端与 /api 接口
CMD ["node", "server/index.js"]
