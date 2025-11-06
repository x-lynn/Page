// 任务编辑/添加模态框组件
class TaskModal {
    constructor(onSave) {
        this.onSave = onSave;
        this.currentTaskId = null;
        this.element = null;
    }

    render() {
        return `
            <div class="modal-overlay" id="taskModalOverlay" style="display: none;">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2 class="modal-title" id="modalTitle">添加任务</h2>
                        <button class="modal-close" id="modalCloseBtn">×</button>
                    </div>
                    <div class="modal-body">
                        <form id="taskModalForm">
                            <div class="form-group">
                                <label class="form-label" for="modalTaskTitle">任务标题 *</label>
                                <input type="text" class="form-control" id="modalTaskTitle" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="modalTaskDescription">任务描述</label>
                                <textarea class="form-control" id="modalTaskDescription" placeholder="可选"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="modalTaskStatus">状态</label>
                                <select class="form-control" id="modalTaskStatus">
                                    <option value="pending">新建</option>
                                    <option value="in_progress">进行中</option>
                                    <option value="completed">已完成</option>
                                    <option value="cancelled">已取消</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="modalTaskPriority">优先级</label>
                                <select class="form-control" id="modalTaskPriority">
                                    <option value="low">低</option>
                                    <option value="medium" selected>中</option>
                                    <option value="high">高</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="modalTaskDueDate">截止日期</label>
                                <input type="date" class="form-control" id="modalTaskDueDate">
                            </div>
                            <input type="hidden" id="modalTaskId">
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="modalCancelBtn">取消</button>
                        <button class="btn btn-success" id="modalSaveBtn">保存</button>
                    </div>
                </div>
            </div>
        `;
    }

    mount(parent) {
        if (typeof parent === 'string') {
            parent = document.querySelector(parent);
        }
        if (!parent) {
            parent = document.body;
        }
        parent.insertAdjacentHTML('beforeend', this.render());
        this.element = document.getElementById('taskModalOverlay');
        this.attachEvents();
        return this.element;
    }

    attachEvents() {
        document.getElementById('modalCloseBtn').addEventListener('click', () => this.hide());
        document.getElementById('modalCancelBtn').addEventListener('click', () => this.hide());
        document.getElementById('modalSaveBtn').addEventListener('click', () => this.handleSave());
        
        // 点击遮罩层关闭
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.hide();
            }
        });
    }

    show(taskId = null) {
        this.currentTaskId = taskId;
        if (taskId) {
            document.getElementById('modalTitle').textContent = '编辑任务';
            this.loadTask(taskId);
        } else {
            document.getElementById('modalTitle').textContent = '添加任务';
            this.reset();
        }
        this.element.style.display = 'flex';
    }

    hide() {
        this.element.style.display = 'none';
        this.reset();
    }

    reset() {
        document.getElementById('taskModalForm').reset();
        document.getElementById('modalTaskId').value = '';
        document.getElementById('modalTaskStatus').value = 'pending';
        document.getElementById('modalTaskPriority').value = 'medium';
        this.currentTaskId = null;
    }

    async loadTask(id) {
        const client = window.supabaseClient?.getClient();
        if (!client) {
            window.Utils.showStatus('tableStatus', '请先连接 Supabase', 'error');
            return;
        }

        try {
            const { data, error } = await client
                .from('daily_tasks')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            document.getElementById('modalTaskId').value = data.id;
            document.getElementById('modalTaskTitle').value = data.title || '';
            document.getElementById('modalTaskDescription').value = data.description || '';
            document.getElementById('modalTaskStatus').value = data.status || 'pending';
            document.getElementById('modalTaskPriority').value = data.priority || 'medium';
            document.getElementById('modalTaskDueDate').value = data.due_date || '';
        } catch (error) {
            window.Utils.showStatus('tableStatus', `❌ 加载失败: ${error.message}`, 'error');
        }
    }

    async handleSave() {
        const client = window.supabaseClient?.getClient();
        if (!client) {
            window.Utils.showStatus('tableStatus', '请先连接 Supabase', 'error');
            return;
        }

        const id = document.getElementById('modalTaskId').value;
        const title = document.getElementById('modalTaskTitle').value.trim();
        const description = document.getElementById('modalTaskDescription').value.trim();
        const status = document.getElementById('modalTaskStatus').value;
        const priority = document.getElementById('modalTaskPriority').value;
        const dueDate = document.getElementById('modalTaskDueDate').value;

        if (!title) {
            window.Utils.showStatus('tableStatus', '请填写任务标题', 'error');
            return;
        }

        try {
            const taskData = {
                title,
                description: description || null,
                status,
                priority,
                due_date: dueDate || null,
                updated_at: new Date().toISOString()
            };

            if (status === 'completed' && !id) {
                taskData.completed_at = new Date().toISOString();
            }

            let result;
            if (id) {
                result = await client
                    .from('daily_tasks')
                    .update(taskData)
                    .eq('id', id);
            } else {
                result = await client
                    .from('daily_tasks')
                    .insert([taskData]);
            }

            if (result.error) throw result.error;

            window.Utils.showStatus('tableStatus', `✅ ${id ? '更新' : '添加'}任务成功！`, 'success');
            this.hide();
            
            if (this.onSave) {
                this.onSave();
            }
        } catch (error) {
            window.Utils.showStatus('tableStatus', `❌ 操作失败: ${error.message}`, 'error');
        }
    }
}

// 暴露到全局
window.TaskModal = TaskModal;

