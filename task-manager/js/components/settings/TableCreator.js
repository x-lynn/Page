// 表创建器组件（处理直接建表逻辑）
class TableCreator {
    constructor(configPanel) {
        this.configPanel = configPanel;
    }

    async checkExecDdlFunction(serviceKey, url) {
        try {
            const serviceClient = window.supabaseClient.createServiceClient(serviceKey);
            const { data, error: testError } = await serviceClient.rpc('exec_ddl', {
                sql_text: 'SELECT 1;'
            });

            if (!testError) {
                console.log('exec_ddl 函数存在，检查通过');
                return true;
            }

            console.log('exec_ddl 函数检查错误:', testError);
            const isFunctionNotFound = 
                testError.code === '42883' ||
                testError.code === 'P0001' ||
                testError.message?.toLowerCase().includes('function') ||
                testError.message?.toLowerCase().includes('does not exist') ||
                testError.message?.toLowerCase().includes('不存在');

            if (isFunctionNotFound) {
                console.log('exec_ddl 函数不存在');
                return false;
            }

            // 其他错误可能是权限问题，但函数存在
            console.warn('exec_ddl 函数检查时出现其他错误:', testError);
            return false;
        } catch (error) {
            console.error('检查 exec_ddl 函数异常:', error);
            return false;
        }
    }

    async createTasksTable() {
        let serviceKey = '';
        let statusElementId = 'tableStatus';
        
        // 首先尝试从本地存储加载（最可靠的方法）
        const config = window.Utils.loadConfig();
        if (config && config.serviceKey) {
            serviceKey = config.serviceKey;
        }
        
        // 如果本地存储没有，尝试从设置页面获取
        if (!serviceKey) {
            if (this.configPanel && typeof this.configPanel.getServiceKey === 'function') {
                try {
                    serviceKey = this.configPanel.getServiceKey();
                } catch (error) {
                    console.warn('从设置页面获取 Service Key 失败:', error);
                }
            }
            
            // 如果还是没找到，尝试直接读取 DOM 元素
            if (!serviceKey) {
                const settingsServiceKey = document.getElementById('settingsServiceKey');
                if (settingsServiceKey) {
                    serviceKey = settingsServiceKey.value.trim();
                    statusElementId = 'settingsStatus';
                }
            }
        }
        
        if (!serviceKey) {
            window.Utils.showStatus(statusElementId, '⚠️ 请先在设置页面填写 Service Role Key', 'warning');
            // 提示用户去设置页面
            setTimeout(() => {
                if (confirm('需要 Service Role Key 才能直接建表。是否前往设置页面填写？')) {
                    // 触发菜单切换到设置页面
                    if (window.sidebar) {
                        window.sidebar.setActiveMenu('settings');
                        const event = new CustomEvent('menuChange', { detail: 'settings' });
                        window.dispatchEvent(event);
                    }
                }
            }, 100);
            return;
        }

        window.Utils.showStatus(statusElementId, '⏳ 正在检查 exec_ddl 函数...', 'info');

        // 优先从配置获取 URL
        let url = config && config.url ? config.url : '';
        
        // 如果配置没有 URL，尝试从 DOM 元素获取
        if (!url) {
            const urlInput = document.getElementById('settingsUrl') || document.getElementById('supabaseUrl');
            if (urlInput) {
                url = urlInput.value.trim();
            }
        }
        
        // 如果还是没找到 URL
        if (!url) {
            window.Utils.showStatus(statusElementId, '⚠️ 请先配置 Supabase URL 和 Service Role Key', 'error');
            return;
        }
        
        try {
            const functionExists = await this.checkExecDdlFunction(serviceKey, url);

            if (!functionExists) {
                // exec_ddl 函数不存在，需要先创建
                // 由于 Supabase 的限制，无法从前端直接执行 DDL 创建函数
                // 所以我们需要提示用户先创建这个函数
                window.Utils.showStatus(statusElementId, '⏳ exec_ddl 函数不存在，正在尝试自动创建...', 'info');
                
                // 尝试自动创建（通常会失败，因为前端无法直接执行 DDL）
                const created = await this.createExecDdlFunction(serviceKey, url, statusElementId);
                
                if (!created) {
                    // 如果自动创建失败，显示创建函数的提示，并提供一键创建按钮
                    this.showCreateFunctionPromptWithAutoCreate(statusElementId, serviceKey, url);
                    return;
                }
            }

            await this.executeCreateTable(serviceKey, url, statusElementId);
        } catch (error) {
            console.error('创建任务表失败:', error);
            window.Utils.showStatus(statusElementId, `❌ 创建任务表失败: ${error.message}`, 'error');
        }
    }

    async createExecDdlFunction(serviceKey, url, statusElementId) {
        // 注意：Supabase 的 PostgREST API 不支持直接执行 DDL 语句
        // 创建函数需要 DDL 权限，这通常需要通过 Supabase Dashboard 的 SQL Editor 手动执行
        // 或者使用 Supabase Management API（需要额外配置）
        // 这里我们返回 false，让用户通过提示界面手动创建
        return false;
    }

    showCreateFunctionPromptWithAutoCreate(statusElementId, serviceKey, url) {
        const createFunctionSQL = `CREATE OR REPLACE FUNCTION exec_ddl(sql_text text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE sql_text;
END;
$$;`;

        const dataStatusDiv = document.getElementById(statusElementId);
        if (!dataStatusDiv) return;
        
        const sqlId = 'create-function-' + Date.now();
        const autoCreateId = 'auto-create-' + Date.now();
        
        dataStatusDiv.innerHTML = `
            <div class="status info">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong>⚠️ 需要先创建 exec_ddl 函数（只需执行一次）：</strong>
                    <div>
                        <button class="btn btn-sm btn-success" id="${autoCreateId}" style="margin-right: 10px;">🚀 自动创建函数</button>
                        <button class="btn btn-sm" onclick="window.copySQL('${sqlId}', event)">📋 复制 SQL</button>
                    </div>
                </div>
                <pre id="${sqlId}" style="background: var(--light-bg); padding: 15px; border-radius: 5px; font-family: monospace; font-size: 0.9em; white-space: pre-wrap;">${window.Utils.escapeHtml(createFunctionSQL)}</pre>
                <div style="font-size: 0.9em; color: var(--text-secondary); margin-top: 10px;">
                    <strong>方式1（推荐）：</strong> 点击"🚀 自动创建函数"按钮，系统会尝试自动创建<br>
                    <strong>方式2：</strong> 如果自动创建失败，请在 Supabase Dashboard → SQL Editor 中手动执行上述 SQL，然后再次点击"创建任务表"按钮
                </div>
            </div>
        `;
        window.currentSQL = createFunctionSQL;
        
        // 绑定自动创建按钮
        document.getElementById(autoCreateId).addEventListener('click', async () => {
            const btn = document.getElementById(autoCreateId);
            btn.disabled = true;
            btn.textContent = '⏳ 正在创建...';
            
            window.Utils.showStatus(statusElementId, '⏳ 正在尝试自动创建 exec_ddl 函数...', 'info');
            
            // 尝试通过 Supabase Management API 或直接 SQL 执行
            try {
                // 由于 Supabase 的限制，无法从前端直接执行 DDL 创建函数
                // 提示用户需要在 Supabase Dashboard 中手动创建
                window.Utils.showStatus(statusElementId, '⚠️ 由于 Supabase 的安全限制，无法从前端直接创建函数。请在 Supabase Dashboard → SQL Editor 中执行上述 SQL（只需执行一次），然后再次点击"创建任务表"按钮。', 'warning');
                
                // 打开新窗口到 Supabase Dashboard（如果可能）
                const supabaseUrl = url.replace('/rest/v1', '').replace('https://', '').split('.')[0];
                const dashboardUrl = `https://supabase.com/dashboard/project/${supabaseUrl}/sql/new`;
                
                // 尝试打开 Supabase Dashboard（用户需要手动导航）
                if (confirm('是否要在 Supabase Dashboard 中打开 SQL Editor？\n\n执行 SQL 后，请返回此页面再次点击"创建任务表"按钮。')) {
                    window.open(dashboardUrl, '_blank');
                }
                
                btn.disabled = false;
                btn.textContent = '🚀 自动创建函数';
                btn.style.background = '#ffc107';
            } catch (error) {
                window.Utils.showStatus(statusElementId, '⚠️ 自动创建失败，请手动在 Supabase Dashboard → SQL Editor 中执行 SQL', 'warning');
                btn.disabled = false;
                btn.textContent = '🚀 自动创建函数';
                btn.style.background = '#ffc107';
            }
        });
    }

    showCreateFunctionPrompt(statusElementId) {
        this.showCreateFunctionPromptWithAutoCreate(statusElementId, '', '');
    }

    async executeCreateTable(serviceKey, url, statusElementId) {
        window.Utils.showStatus(statusElementId, '⏳ 正在创建任务表...', 'info');

        // 分步执行 SQL，避免多语句执行问题
        const sqlStatements = [
            // 创建表
            `CREATE TABLE IF NOT EXISTS daily_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)`,
            // 创建索引
            `CREATE INDEX IF NOT EXISTS idx_daily_tasks_status ON daily_tasks(status)`,
            `CREATE INDEX IF NOT EXISTS idx_daily_tasks_due_date ON daily_tasks(due_date)`,
            `CREATE INDEX IF NOT EXISTS idx_daily_tasks_created_at ON daily_tasks(created_at)`,
            // 添加注释
            `COMMENT ON TABLE daily_tasks IS '每日任务表'`,
            `COMMENT ON COLUMN daily_tasks.status IS '任务状态: pending(待完成), in_progress(进行中), completed(已完成), cancelled(已取消)'`,
            `COMMENT ON COLUMN daily_tasks.priority IS '任务优先级: low(低), medium(中), high(高)'`
        ];

        try {
            const serviceClient = window.supabaseClient.createServiceClient(serviceKey);
            
            // 先执行创建表的语句
            window.Utils.showStatus(statusElementId, '⏳ 正在创建表结构...', 'info');
            const { error: tableError } = await serviceClient.rpc('exec_ddl', {
                sql_text: sqlStatements[0]
            });

            if (tableError) {
                console.error('创建表失败:', tableError);
                window.Utils.showStatus(statusElementId, `❌ 创建表失败: ${tableError.message || tableError.code || JSON.stringify(tableError)}`, 'error');
                return;
            }

            // 创建索引和注释（这些失败不影响使用，所以只记录警告）
            window.Utils.showStatus(statusElementId, '⏳ 正在创建索引和注释...', 'info');
            for (let i = 1; i < sqlStatements.length; i++) {
                try {
                    const { error: stmtError } = await serviceClient.rpc('exec_ddl', {
                        sql_text: sqlStatements[i]
                    });
                    if (stmtError) {
                        console.warn(`执行语句 ${i} 失败:`, stmtError);
                    }
                } catch (err) {
                    console.warn(`执行语句 ${i} 异常:`, err);
                }
            }

            window.Utils.showStatus(statusElementId, '✅ 任务表创建成功！', 'success');
            setTimeout(() => {
                if (window.taskTable) {
                    window.taskTable.load();
                } else if (window.taskList) {
                    window.taskList.load();
                }
            }, 1000);
        } catch (error) {
            console.error('创建任务表异常:', error);
            window.Utils.showStatus(statusElementId, `❌ 创建表失败: ${error.message || JSON.stringify(error)}`, 'error');
        }
    }
}

// 暴露到全局
window.TableCreator = TableCreator;

// 全局复制 SQL 函数
window.copySQL = async function(sqlId, event) {
    const sql = window.currentSQL || document.getElementById(sqlId)?.textContent;
    if (sql) {
        const success = await window.Utils.copyToClipboard(sql);
        if (success && event) {
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = '✅ 已复制';
            btn.style.background = '#28a745';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 2000);
        }
    }
};
