// 任务表格组件（带查询和操作）
class TaskTable {
    constructor(onEditTask, onDeleteTask, onAddTask) {
        this.onEditTask = onEditTask;
        this.onDeleteTask = onDeleteTask;
        this.onAddTask = onAddTask;
        this.element = null;
        this.searchKeyword = '';
        this.statusFilter = 'all';
        this.priorityFilter = 'all';
    }

    render() {
        return `
            <div class="page-container fade-in">
                <div class="page-header">
                    <h1 class="page-title">📝 每日任务列表</h1>
                    <p class="page-subtitle">管理和查看所有任务</p>
                </div>
                
                <div class="table-container">
                    <div class="table-header">
                        <h2 class="table-title">任务列表</h2>
                        <div class="search-box">
                            <input type="text" class="search-input" id="taskSearchInput" 
                                   placeholder="搜索任务标题或描述...">
                            <button class="btn search-btn" id="searchBtn">🔍 搜索</button>
                        </div>
                    </div>
                    
                    <div class="toolbar">
                        <div class="toolbar-left">
                            <div class="filter-group">
                                <label class="filter-label">状态筛选：</label>
                                <select class="filter-select" id="statusFilter">
                                    <option value="all">全部</option>
                                    <option value="pending">新建</option>
                                    <option value="in_progress">进行中</option>
                                    <option value="completed">已完成</option>
                                    <option value="cancelled">已取消</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label class="filter-label">优先级筛选：</label>
                                <select class="filter-select" id="priorityFilter">
                                    <option value="all">全部</option>
                                    <option value="high">高</option>
                                    <option value="medium">中</option>
                                    <option value="low">低</option>
                                </select>
                            </div>
                        </div>
                        <div class="toolbar-right">
                            <button class="btn btn-success" id="addTaskBtn">➕ 添加任务</button>
                            <button class="btn" id="refreshTableBtn">🔄 刷新</button>
                            <button class="btn btn-secondary" id="createTableBtn">📋 创建任务表</button>
                        </div>
                    </div>
                    
                    <div id="tableStatus"></div>
                    <div class="table-wrapper">
                        <table id="taskTable">
                            <thead>
                                <tr>
                                    <th>任务标题</th>
                                    <th>描述</th>
                                    <th>状态</th>
                                    <th>优先级</th>
                                    <th>截止日期</th>
                                    <th>创建时间</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody id="taskTableBody">
                                <tr>
                                    <td colspan="7" class="empty-table">
                                        <div class="empty-table-icon">⏳</div>
                                        <p>加载中...</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
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
        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('taskSearchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
        
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.statusFilter = e.target.value;
            this.load();
        });
        
        document.getElementById('priorityFilter').addEventListener('change', (e) => {
            this.priorityFilter = e.target.value;
            this.load();
        });
        
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            if (this.onAddTask) {
                this.onAddTask();
            }
        });
        
        document.getElementById('refreshTableBtn').addEventListener('click', () => this.load());
        document.getElementById('createTableBtn').addEventListener('click', () => {
            if (window.tableCreator) {
                window.tableCreator.createTasksTable();
            } else {
                this.showCreateTableSQL();
            }
        });
    }

    handleSearch() {
        this.searchKeyword = document.getElementById('taskSearchInput').value.trim();
        this.load();
    }

    async load() {
        const client = window.supabaseClient?.getClient();
        if (!client) {
            window.Utils.showStatus('tableStatus', '请先连接 Supabase', 'error');
            this.renderEmpty('请先连接 Supabase');
            return;
        }

        const tbody = document.getElementById('taskTableBody');
        if (!tbody) return;

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">
                    <div class="empty-table-icon">⏳</div>
                    <p>加载中...</p>
                </td>
            </tr>
        `;

        try {
            let query = client.from('daily_tasks').select('*');

            // 应用筛选
            if (this.statusFilter !== 'all') {
                query = query.eq('status', this.statusFilter);
            }
            
            if (this.priorityFilter !== 'all') {
                query = query.eq('priority', this.priorityFilter);
            }

            // 排序
            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            const isTableNotFound = error && (
                error.code === 'PGRST116' ||
                error.message.includes("Could not find the table") ||
                (error.message.includes("relation") && error.message.includes("does not exist"))
            );

            if (isTableNotFound) {
                this.renderEmpty('任务表不存在，请先创建表');
                this.showCreateTableSQL();
                return;
            }

            if (error) throw error;

            // 应用搜索过滤
            let filteredData = data || [];
            if (this.searchKeyword) {
                const keyword = this.searchKeyword.toLowerCase();
                filteredData = filteredData.filter(task => 
                    (task.title || '').toLowerCase().includes(keyword) ||
                    (task.description || '').toLowerCase().includes(keyword)
                );
            }

            if (filteredData.length === 0) {
                this.renderEmpty(data.length === 0 ? '暂无任务数据' : '没有匹配的任务');
                window.Utils.showStatus('tableStatus', 
                    data.length === 0 ? '✅ 任务加载成功（空列表）' : `搜索无结果，共 ${data.length} 条任务`, 
                    'info');
                return;
            }

            this.renderTable(filteredData);
            window.Utils.showStatus('tableStatus', `✅ 成功加载 ${filteredData.length} 条任务`, 'success');
        } catch (error) {
            console.error('加载任务失败:', error);
            this.renderEmpty(`加载失败: ${error.message}`);
            window.Utils.showStatus('tableStatus', `❌ 加载失败: ${error.message}`, 'error');
        }
    }

    renderTable(tasks) {
        const tbody = document.getElementById('taskTableBody');
        const statusMap = window.Utils.statusMap;
        const priorityMap = window.Utils.priorityMap;

        tbody.innerHTML = tasks.map(task => `
            <tr>
                <td><strong>${window.Utils.escapeHtml(task.title || '无标题')}</strong></td>
                <td>${window.Utils.escapeHtml((task.description || '').substring(0, 50))}${task.description && task.description.length > 50 ? '...' : ''}</td>
                <td>
                    <span class="status-badge status-${task.status}">
                        ${statusMap[task.status] || task.status}
                    </span>
                </td>
                <td>
                    <span class="priority-badge priority-${task.priority}">
                        ${priorityMap[task.priority] || task.priority}
                    </span>
                </td>
                <td>${task.due_date || '-'}</td>
                <td>${window.Utils.formatDate(task.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        ${task.status === 'completed' ? `
                            <button class="action-btn action-btn-incomplete" onclick="window.taskTable.uncompleteTask('${task.id}')" title="取消完成">
                                ↩️ 取消完成
                            </button>
                        ` : task.status !== 'cancelled' ? `
                            <button class="action-btn action-btn-complete" onclick="window.taskTable.completeTask('${task.id}')" title="快速完成">
                                ✅ 完成
                            </button>
                        ` : ''}
                        <button class="action-btn action-btn-edit" onclick="window.taskTable.editTask('${task.id}')">
                            编辑
                        </button>
                        <button class="action-btn action-btn-delete" onclick="window.taskTable.deleteTask('${task.id}')">
                            删除
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderEmpty(message) {
        const tbody = document.getElementById('taskTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">
                    <div class="empty-table-icon">📭</div>
                    <p>${message}</p>
                </td>
            </tr>
        `;
    }

    editTask(id) {
        if (this.onEditTask) {
            this.onEditTask(id);
        }
    }

    async completeTask(id) {
        const client = window.supabaseClient?.getClient();
        if (!client) {
            window.Utils.showStatus('tableStatus', '请先连接 Supabase', 'error');
            return;
        }

        try {
            const { error } = await client
                .from('daily_tasks')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            window.Utils.showStatus('tableStatus', '✅ 任务已完成！', 'success');
            this.load();
        } catch (error) {
            window.Utils.showStatus('tableStatus', `❌ 操作失败: ${error.message}`, 'error');
        }
    }

    async uncompleteTask(id) {
        const client = window.supabaseClient?.getClient();
        if (!client) {
            window.Utils.showStatus('tableStatus', '请先连接 Supabase', 'error');
            return;
        }

        try {
            const { error } = await client
                .from('daily_tasks')
                .update({
                    status: 'in_progress',
                    completed_at: null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            window.Utils.showStatus('tableStatus', '✅ 已取消完成，恢复到进行中！', 'success');
            this.load();
        } catch (error) {
            window.Utils.showStatus('tableStatus', `❌ 操作失败: ${error.message}`, 'error');
        }
    }

    async deleteTask(id) {
        if (!confirm('确定要删除这条任务吗？')) {
            return;
        }

        const client = window.supabaseClient?.getClient();
        if (!client) {
            window.Utils.showStatus('tableStatus', '请先连接 Supabase', 'error');
            return;
        }

        try {
            const { error } = await client
                .from('daily_tasks')
                .delete()
                .eq('id', id);

            if (error) throw error;

            window.Utils.showStatus('tableStatus', '✅ 删除成功！', 'success');
            this.load();
        } catch (error) {
            window.Utils.showStatus('tableStatus', `❌ 删除失败: ${error.message}`, 'error');
        }
    }

    showCreateTableSQL() {
        const sql = `-- 在 Supabase Dashboard 的 SQL Editor 中执行以下 SQL 创建每日任务表

CREATE TABLE IF NOT EXISTS daily_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_tasks_status ON daily_tasks(status);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_due_date ON daily_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_created_at ON daily_tasks(created_at);

COMMENT ON TABLE daily_tasks IS '每日任务表';`;

        const statusDiv = document.getElementById('tableStatus');
        const sqlId = 'tasks-sql-' + Date.now();
        statusDiv.innerHTML = `
            <div class="status info">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong>📋 请执行以下 SQL 创建每日任务表：</strong>
                    <button class="btn btn-sm" onclick="window.copySQL('${sqlId}', event)">📋 复制 SQL</button>
                </div>
                <pre id="${sqlId}" style="background: var(--light-bg); padding: 15px; border-radius: 5px; font-family: monospace; font-size: 0.9em; white-space: pre-wrap;">${window.Utils.escapeHtml(sql)}</pre>
            </div>
        `;
        window.currentSQL = sql;
    }
}

// 暴露到全局
window.TaskTable = TaskTable;

