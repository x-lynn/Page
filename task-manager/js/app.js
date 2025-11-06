// 主应用 - 后台管理系统
class TaskManagerApp {
    constructor() {
        this.sidebar = null;
        this.currentPage = 'home';
        this.pages = {
            home: null,
            tasks: null,
            settings: null
        };
        this.taskModal = null;
        this.tableCreator = null;
    }

    async init() {
        // 等待 Supabase SDK 加载
        await this.waitForSupabase();
        
        // 渲染布局
        this.render();
        
        // 初始化
        this.initialize();
        
        // 加载默认页面
        this.showPage('home');
    }

    waitForSupabase() {
        return new Promise((resolve) => {
            if (window.supabase && typeof window.supabase.createClient === 'function') {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (window.supabase && typeof window.supabase.createClient === 'function') {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
                
                setTimeout(() => {
                    clearInterval(checkInterval);
                    console.warn('Supabase SDK 加载超时');
                    resolve();
                }, 10000);
            }
        });
    }

    render() {
        const app = document.getElementById('app');
        app.innerHTML = '<div class="admin-layout"></div>';
        
        const layout = app.querySelector('.admin-layout');
        
        // 创建侧边栏容器
        const sidebarContainer = document.createElement('div');
        sidebarContainer.id = 'sidebarContainer';
        layout.appendChild(sidebarContainer);
        
        // 创建主内容区容器
        const mainContentContainer = document.createElement('div');
        mainContentContainer.className = 'main-content';
        mainContentContainer.id = 'mainContent';
        layout.appendChild(mainContentContainer);
        
        // 创建侧边栏
        this.sidebar = new window.Sidebar((menu) => this.showPage(menu));
        this.sidebar.mount(sidebarContainer);
        
        // 创建表创建器（稍后绑定到设置页面）
        this.tableCreator = new window.TableCreator(null);
        window.tableCreator = this.tableCreator;
        
        // 创建任务模态框（全局使用）
        this.taskModal = new window.TaskModal(() => {
            // 保存后刷新任务列表
            if (this.pages.tasks) {
                this.pages.tasks.load();
            }
        });
        this.taskModal.mount(document.body);
        window.taskModal = this.taskModal;
    }

    initialize() {
        // 加载保存的配置
        const config = window.Utils.loadConfig();
        if (config) {
            // 如果有配置，自动连接（在设置页面）
            if (config.url && config.key) {
                setTimeout(() => {
                    // 延迟连接，等设置页面加载完成
                    if (this.pages.settings) {
                        // 设置页面会自动连接
                    }
                }, 1000);
            }
        }
    }

    showPage(pageName) {
        this.currentPage = pageName;
        
        // 更新侧边栏激活状态
        if (this.sidebar) {
            this.sidebar.setActiveMenu(pageName);
        }
        
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;
        
        // 根据页面名称渲染对应组件
        switch(pageName) {
            case 'home':
                if (!this.pages.home) {
                    this.pages.home = new window.HomePage();
                }
                this.pages.home.mount(mainContent);
                break;
                
            case 'tasks':
                if (!this.pages.tasks) {
                    this.pages.tasks = new window.TaskTable(
                        (id) => this.editTask(id),
                        (id) => this.deleteTask(id),
                        () => this.addTask()
                    );
                    window.taskTable = this.pages.tasks;
                }
                this.pages.tasks.mount(mainContent);
                // 如果已连接，自动加载任务
                setTimeout(() => {
                    const client = window.supabaseClient?.getClient();
                    if (client) {
                        this.pages.tasks.load();
                    }
                }, 300);
                break;
                
            case 'settings':
                if (!this.pages.settings) {
                    this.pages.settings = new window.SettingsPage();
                }
                this.pages.settings.mount(mainContent);
                // 更新表创建器的引用
                if (this.tableCreator) {
                    this.tableCreator.configPanel = this.pages.settings;
                }
                break;
        }
    }

    addTask() {
        // 打开添加任务模态框
        if (this.taskModal) {
            this.taskModal.show();
        }
    }

    editTask(id) {
        // 打开编辑任务模态框
        if (this.taskModal) {
            this.taskModal.show(id);
        }
    }

    deleteTask(id) {
        // 删除任务由 TaskTable 组件自己处理
        if (this.pages.tasks) {
            this.pages.tasks.deleteTask(id);
        }
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new TaskManagerApp();
    app.init();
});
