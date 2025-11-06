# 任务管理系统 - Vue 版本

一个现代化的、基于 Vue 3 的任务管理应用，使用 Supabase 作为后端。

## 特性

- ✨ **现代化设计**：使用 Vue 3 Composition API 和现代设计模式
- 🧩 **组件化架构**：Vue 3 组件系统
- 📱 **响应式布局**：支持移动端和桌面端
- 🎨 **美观UI**：渐变背景、卡片式布局、动画效果
- 🔧 **模块化代码**：代码分离，易于维护
- 🚀 **GitHub Pages 支持**：配置为可部署到 GitHub Pages

## 技术栈

- Vue 3 (Composition API)
- Vue Router 4 (Hash 模式，适合 GitHub Pages)
- Vite (构建工具)
- Supabase (后端服务)
- CSS3 (变量、Grid、Flexbox)

## 项目结构

```
task-manager-vue/
├── public/              # 静态资源
├── src/
│   ├── assets/         # 资源文件
│   │   └── css/        # 样式文件
│   ├── components/     # Vue 组件
│   │   ├── common/     # 通用组件
│   │   │   └── Sidebar.vue
│   │   ├── home/       # 首页组件
│   │   │   └── HomePage.vue
│   │   ├── tasks/      # 任务管理组件
│   │   │   ├── TaskTable.vue
│   │   │   └── TaskModal.vue
│   │   └── settings/   # 设置组件
│   │       └── SettingsPage.vue
│   ├── composables/    # 组合式函数
│   │   ├── useSupabase.js
│   │   ├── useUtils.js
│   │   └── useTableCreator.js
│   ├── router/         # 路由配置
│   │   └── index.js
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:5173` 运行

### 3. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录

### 4. 预览生产版本

```bash
npm run preview
```

## 部署到 GitHub Pages

### 方法 1: 手动部署

1. 构建项目（`base` 路径已配置为 `/Page/task-manager-vue/`）：
   ```bash
   npm run build
   ```

3. 将 `dist` 目录的内容推送到 GitHub 仓库的 `gh-pages` 分支：
   ```bash
   # 进入 dist 目录
   cd dist
   
   # 初始化 git（如果还没有）
   git init
   git add .
   git commit -m "Deploy to GitHub Pages"
   
   # 添加远程仓库（根据你的实际仓库地址）
   git remote add origin https://github.com/x-lynn/Page.git
   
   # 推送到 gh-pages 分支
   git push -f origin main:gh-pages
   ```

4. 在 GitHub 仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支

### 方法 2: 使用 GitHub Actions 自动部署

1. 创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. `vite.config.js` 中的 `base` 已配置为 `/Page/task-manager-vue/`

3. 推送代码到 GitHub，GitHub Actions 会自动构建和部署

**注意**：如果项目在 `Page` 仓库的子目录中，可能需要调整 GitHub Actions 工作流的路径设置。

## 使用方法

1. 在浏览器中打开应用
2. 进入"设置"页面，配置 Supabase 连接信息：
   - Supabase URL
   - Supabase Anon Key
   - Supabase Service Role Key (可选，用于直接建表)
3. 点击"连接 Supabase"测试连接
4. 如果任务表不存在，可以：
   - 点击"创建任务表"按钮（需要 Service Role Key）
   - 或者在 Supabase Dashboard 的 SQL Editor 中手动执行 SQL
5. 进入"每日任务列表"页面开始管理任务

## 配置说明

### Supabase 配置

- **Supabase URL**: 你的 Supabase 项目 URL
- **Supabase Anon Key**: 匿名密钥（用于客户端操作）
- **Supabase Service Role Key**: 服务角色密钥（用于直接建表，可选）

### 路由模式

项目使用 **Hash 模式** (`createWebHashHistory`)，这是为了兼容 GitHub Pages 的静态托管限制。如果部署到支持服务器端路由的环境，可以改为 History 模式。

## 开发说明

### 添加新功能

1. 在 `src/components` 中创建新组件
2. 在 `src/router/index.js` 中添加路由
3. 在 `src/composables` 中添加可复用的逻辑

### 样式定制

所有样式变量定义在 `src/assets/css/main.css` 的 `:root` 中，可以修改这些变量来定制主题。

## 许可证

MIT

