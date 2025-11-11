# UniTask - 个人任务管理应用

一个基于 uni-app 和 Supabase 构建的简洁、高效、跨平台个人任务管理工具。

## 功能特性

- ✅ 任务管理（标准任务、每日任务）
- ✅ 任务状态跟踪（待办、进行中、已完成）
- ✅ 优先级设置（低、中、高）
- ✅ 任务筛选和排序
- ✅ 任务归档功能
- ✅ 每日任务自动重置（手动）
- ✅ 用户个性化设置
- ✅ 跨设备数据同步

## 技术栈

- **前端框架**: uni-app (Vue 3)
- **状态管理**: Pinia
- **后端服务**: Supabase (PostgreSQL + Auth + Realtime)
- **部署平台**: H5 (GitHub Pages) / 微信小程序

## 项目结构

```
task-manager/
├── pages/              # 页面文件
│   ├── index/         # 标准任务列表页
│   ├── daily-tasks/   # 每日任务列表页
│   ├── detail/        # 任务详情/编辑页
│   └── profile/       # 个人中心页
├── components/         # 可复用组件
│   ├── TaskCard.vue
│   ├── PriorityBadge.vue
│   ├── StatusBadge.vue
│   ├── FilterModal.vue
│   └── SettingsForm.vue
├── stores/            # Pinia 状态管理
│   ├── tasks.js       # 任务管理 Store
│   └── user.js        # 用户管理 Store
├── utils/             # 工具函数
│   ├── supabase.js    # Supabase 客户端
│   ├── settings.js    # 配置管理
│   ├── constants.js   # 常量定义
│   └── helpers.js     # 通用工具函数
├── styles/            # 全局样式
│   └── common.scss
├── App.vue            # 应用入口
├── main.js            # 主文件
├── pages.json         # 页面配置
├── manifest.json      # 应用配置
└── package.json       # 依赖配置
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入你的 Supabase 配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```
VUE_APP_SUPABASE_URL=your_supabase_url_here
VUE_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. 创建 Supabase 数据库表

在 Supabase 控制台中执行以下 SQL：

```sql
-- 创建 tasks 表
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  task_type VARCHAR NOT NULL DEFAULT 'Standard',
  priority VARCHAR NOT NULL DEFAULT 'Medium',
  status VARCHAR NOT NULL DEFAULT 'Todo',
  created_at TIMESTAMPTZ DEFAULT now(),
  is_archived BOOLEAN NOT NULL DEFAULT false
);

-- 创建 users 表
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_activity TIMESTAMPTZ,
  nickname VARCHAR DEFAULT '匿名用户',
  showdoc_push_link TEXT
);

-- 启用 RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- tasks 表 RLS 策略
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- users 表 RLS 策略
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 4. 运行项目

#### H5 开发

```bash
npm run dev:h5
```

#### 微信小程序开发

```bash
npm run dev:mp-weixin
```

### 5. 构建项目

#### H5 构建

```bash
npm run build:h5
```

#### 微信小程序构建

```bash
npm run build:mp-weixin
```

## 核心功能说明

### 任务类型

- **标准任务**: 常规任务，可设置截止日期
- **每日任务**: 每天可重置完成状态的任务

### 任务状态

- **待办 (Todo)**: 未开始的任务
- **进行中 (Doing)**: 正在进行的任务
- **已完成 (Done)**: 已完成的任务

### 优先级

- **低 (Low)**: 低优先级任务
- **中 (Medium)**: 中等优先级任务
- **高 (High)**: 高优先级任务

## 开发说明

### 代码规范

- 使用 Vue 3 Composition API
- 组件采用 `<script setup>` 语法
- 样式使用 SCSS，遵循 BEM 命名规范
- 工具函数统一放在 `utils` 目录

### 状态管理

- 使用 Pinia 进行状态管理
- `tasksStore`: 管理任务相关状态和操作
- `userStore`: 管理用户相关状态和操作

### 数据同步

- 应用启动时自动进行匿名登录
- 所有数据操作通过 Supabase SDK 进行
- 支持实时同步（可选，通过 Supabase Realtime）

## 部署

### H5 部署到 GitHub Pages

1. 配置 GitHub Actions（参考设计文档）
2. 推送代码到 main 分支
3. 自动构建并部署到 GitHub Pages

### 微信小程序部署

1. 配置微信小程序 AppID
2. 使用微信开发者工具上传代码
3. 提交审核并发布

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

