// 侧边栏菜单组件
class Sidebar {
    constructor(onMenuChange) {
        this.onMenuChange = onMenuChange;
        this.currentMenu = 'home';
        this.element = null;
    }

    render() {
        return `
            <div class="sidebar">
                <div class="sidebar-header">
                    <h1>📋 任务管理</h1>
                </div>
                <div class="sidebar-menu">
                    <div class="menu-item ${this.currentMenu === 'home' ? 'active' : ''}" data-menu="home">
                        <span class="menu-item-icon">🏠</span>
                        <span>首页</span>
                    </div>
                    <div class="menu-item ${this.currentMenu === 'tasks' ? 'active' : ''}" data-menu="tasks">
                        <span class="menu-item-icon">📝</span>
                        <span>每日任务列表</span>
                    </div>
                    <div class="menu-item ${this.currentMenu === 'settings' ? 'active' : ''}" data-menu="settings">
                        <span class="menu-item-icon">⚙️</span>
                        <span>设置</span>
                    </div>
                </div>
            </div>
        `;
    }

    mount(parent) {
        if (typeof parent === 'string') {
            parent = document.querySelector(parent);
        }
        parent.innerHTML = this.render();
        this.element = parent.firstElementChild;
        this.attachEvents();
        return this.element;
    }

    attachEvents() {
        const menuItems = this.element.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const menu = item.dataset.menu;
                this.setActiveMenu(menu);
                if (this.onMenuChange) {
                    this.onMenuChange(menu);
                }
            });
        });
    }

    setActiveMenu(menu) {
        this.currentMenu = menu;
        const menuItems = this.element.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            if (item.dataset.menu === menu) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// 暴露到全局
window.Sidebar = Sidebar;

