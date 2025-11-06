// 设置页面组件
class SettingsPage {
    constructor() {
        this.element = null;
    }

    render() {
        return `
            <div class="page-container fade-in">
                <div class="page-header">
                    <h1 class="page-title">⚙️ 设置</h1>
                    <p class="page-subtitle">配置 Supabase 连接信息</p>
                </div>
                
                <div class="card">
                    <h2 class="card-title">Supabase 配置</h2>
                    <div class="form-group">
                        <label class="form-label" for="settingsUrl">Supabase URL</label>
                        <input type="text" class="form-control" id="settingsUrl" 
                               placeholder="https://your-project.supabase.co">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="settingsKey">Supabase Anon Key</label>
                        <input type="text" class="form-control" id="settingsKey" 
                               placeholder="your-anon-key">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="settingsServiceKey">Supabase Service Role Key (可选，用于直接建表)</label>
                        <input type="password" class="form-control" id="settingsServiceKey" 
                               placeholder="service_role key (可选)">
                        <small style="color: var(--text-secondary); font-size: 0.9em; display: block; margin-top: 5px;">
                            在 Settings → API → service_role key 中获取
                        </small>
                    </div>
                    <div class="btn-group">
                        <button class="btn" id="settingsConnectBtn">🔌 连接 Supabase</button>
                        <button class="btn btn-secondary" id="settingsSaveBtn">💾 保存配置</button>
                        <button class="btn btn-secondary" id="settingsLoadBtn">📂 加载配置</button>
                        <button class="btn btn-secondary" id="settingsCreateFunctionBtn">⚙️ 创建执行函数</button>
                    </div>
                    <div id="settingsStatus"></div>
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
        this.loadSavedConfig();
        return this.element;
    }

    attachEvents() {
        document.getElementById('settingsConnectBtn').addEventListener('click', () => this.connect());
        document.getElementById('settingsSaveBtn').addEventListener('click', () => this.saveConfig());
        document.getElementById('settingsLoadBtn').addEventListener('click', () => this.loadConfig());
        document.getElementById('settingsCreateFunctionBtn').addEventListener('click', () => this.showCreateFunctionSQL());
    }

    async connect() {
        const url = document.getElementById('settingsUrl').value.trim();
        const key = document.getElementById('settingsKey').value.trim();

        if (!url || !key) {
            window.Utils.showStatus('settingsStatus', '请填写 Supabase URL 和 Key', 'error');
            return;
        }

        try {
            window.supabaseClient.init(url, key);
            const result = await window.supabaseClient.testConnection();

            if (result.tableExists) {
                window.Utils.showStatus('settingsStatus', '✅ Supabase 连接成功！', 'success');
            } else {
                window.Utils.showStatus('settingsStatus', '⚠️ 连接成功，但任务表不存在。请先创建表', 'info');
            }
        } catch (error) {
            window.Utils.showStatus('settingsStatus', `❌ 连接失败: ${error.message}`, 'error');
        }
    }

    saveConfig() {
        const config = {
            url: document.getElementById('settingsUrl').value,
            key: document.getElementById('settingsKey').value,
            serviceKey: document.getElementById('settingsServiceKey').value
        };
        window.Utils.saveConfig(config);
        window.Utils.showStatus('settingsStatus', '✅ 配置已保存到本地', 'success');
    }

    loadConfig() {
        const config = window.Utils.loadConfig();
        if (config) {
            if (config.url) document.getElementById('settingsUrl').value = config.url;
            if (config.key) document.getElementById('settingsKey').value = config.key;
            if (config.serviceKey) document.getElementById('settingsServiceKey').value = config.serviceKey;
            window.Utils.showStatus('settingsStatus', '✅ 配置已加载', 'info');
        } else {
            window.Utils.showStatus('settingsStatus', 'ℹ️ 没有保存的配置', 'info');
        }
    }

    loadSavedConfig() {
        const config = window.Utils.loadConfig();
        if (config) {
            if (config.url && !document.getElementById('settingsUrl').value) {
                document.getElementById('settingsUrl').value = config.url;
            }
            if (config.key && !document.getElementById('settingsKey').value) {
                document.getElementById('settingsKey').value = config.key;
            }
            if (config.serviceKey) {
                document.getElementById('settingsServiceKey').value = config.serviceKey;
            }
        }
    }

    showCreateFunctionSQL() {
        const sql = `CREATE OR REPLACE FUNCTION exec_ddl(sql_text text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE sql_text;
END;
$$;`;

        const statusDiv = document.getElementById('settingsStatus');
        const sqlId = 'exec-function-' + Date.now();
        statusDiv.innerHTML = `
            <div class="status info">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong>📋 请执行以下 SQL 创建执行函数（只需执行一次）：</strong>
                    <button class="btn btn-sm" onclick="window.copySQL('${sqlId}', event)">📋 复制 SQL</button>
                </div>
                <pre id="${sqlId}" style="background: var(--light-bg); padding: 15px; border-radius: 5px; font-family: monospace; font-size: 0.9em; white-space: pre-wrap;">${window.Utils.escapeHtml(sql)}</pre>
            </div>
        `;
        window.currentSQL = sql;
    }

    getServiceKey() {
        const input = document.getElementById('settingsServiceKey');
        if (!input) {
            // 如果元素不存在，尝试从本地存储加载
            const config = window.Utils.loadConfig();
            return config && config.serviceKey ? config.serviceKey : '';
        }
        return input.value.trim();
    }
}

// 暴露到全局
window.SettingsPage = SettingsPage;

