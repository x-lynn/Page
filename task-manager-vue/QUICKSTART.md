# 快速开始指南

## 1. 安装依赖

```bash
cd task-manager-vue
npm install
```

## 2. 开发模式运行

```bash
npm run dev
```

访问 http://localhost:5173

## 3. 构建生产版本

```bash
npm run build
```

## 4. 部署到 GitHub Pages

### 步骤 1: 构建

（`base` 路径已配置为 `/Page/task-manager-vue/`，无需修改）

```bash
npm run build
```

### 步骤 3: 部署

#### 方法 A: 使用 GitHub Actions（推荐）

1. 确保 `.github/workflows/deploy.yml` 文件存在
2. 推送代码到 GitHub
3. GitHub Actions 会自动构建和部署

#### 方法 B: 手动部署

```bash
cd dist
git init
git add .
git commit -m "Deploy to GitHub Pages"
git remote add origin https://github.com/your-username/your-repo-name.git
git push -f origin main:gh-pages
```

然后在 GitHub 仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支。

## 5. 使用应用

1. 打开应用后，进入"设置"页面
2. 填写 Supabase 配置信息
3. 点击"连接 Supabase"
4. 如果表不存在，点击"创建任务表"
5. 进入"每日任务列表"开始使用

## 注意事项

- 项目使用 **Hash 路由模式**，适合 GitHub Pages 部署
- 如果部署到其他环境，可以修改 `src/router/index.js` 使用 History 模式
- `vite.config.js` 中的 `base` 路径已配置为 `/Page/task-manager-vue/`，匹配你的仓库结构

