# 每日任务管理应用

一个现代化的、组件化的任务管理应用，使用 Supabase 作为后端。

## 项目结构

```
task-manager/
├── index.html          # 主HTML文件
├── css/
│   ├── main.css        # 全局样式和CSS变量
│   └── components.css  # 组件样式
├── js/
│   ├── app.js          # 主应用入口
│   ├── components/     # 组件目录
│   │   ├── Header.js
│   │   ├── ConfigPanel.js
│   │   ├── TaskForm.js
│   │   ├── TaskList.js
│   │   └── TableCreator.js
│   └── utils/          # 工具函数
│       ├── supabase.js
│       └── helpers.js
└── README.md
```

## 特性

- ✨ **现代化设计**：使用CSS变量和现代设计模式
- 🧩 **组件化架构**：类似Vue的组件系统
- 📱 **响应式布局**：支持移动端和桌面端
- 🎨 **美观UI**：渐变背景、卡片式布局、动画效果
- 🔧 **模块化代码**：代码分离，易于维护

## 使用方法

1. 在浏览器中打开 `index.html`
2. 配置 Supabase 连接信息
3. 创建任务表（如果需要）
4. 开始管理您的任务

## 技术栈

- 原生 JavaScript (ES6 Modules)
- Supabase (后端服务)
- CSS3 (变量、Grid、Flexbox)

