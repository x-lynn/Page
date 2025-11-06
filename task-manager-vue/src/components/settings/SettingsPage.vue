<template>
  <div class="page-container fade-in">
    <div class="page-header">
      <h1 class="page-title">⚙️ 设置</h1>
      <p class="page-subtitle">配置 Supabase 连接信息</p>
    </div>
    
    <div class="card">
      <h2 class="card-title">Supabase 配置</h2>
      <div class="form-group">
        <label class="form-label" for="settingsUrl">Supabase URL</label>
        <input 
          type="text" 
          class="form-control" 
          id="settingsUrl" 
          v-model="formData.url"
          placeholder="https://your-project.supabase.co"
        >
      </div>
      <div class="form-group">
        <label class="form-label" for="settingsKey">Supabase Anon Key</label>
        <input 
          type="text" 
          class="form-control" 
          id="settingsKey" 
          v-model="formData.key"
          placeholder="your-anon-key"
        >
      </div>
      <div class="form-group">
        <label class="form-label" for="settingsServiceKey">Supabase Service Role Key (可选，用于直接建表)</label>
        <input 
          type="password" 
          class="form-control" 
          id="settingsServiceKey" 
          v-model="formData.serviceKey"
          placeholder="service_role key (可选)"
        >
        <small style="color: var(--text-secondary); font-size: 0.9em; display: block; margin-top: 5px;">
          在 Settings → API → service_role key 中获取
        </small>
      </div>
      <div class="btn-group">
        <button class="btn" @click="connect">🔌 连接 Supabase</button>
        <button class="btn btn-secondary" @click="saveConfig">💾 保存配置</button>
        <button class="btn btn-secondary" @click="loadConfig">📂 加载配置</button>
        <button class="btn btn-secondary" @click="showCreateFunctionSQL">⚙️ 创建执行函数</button>
      </div>
      <div id="settingsStatus"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useStatus, useConfig } from '@/composables/useUtils'

const { init, testConnection } = useSupabase()
const { showStatus } = useStatus('settingsStatus')
const { saveConfig: saveConfigToStorage, loadConfig: loadConfigFromStorage } = useConfig()

const formData = ref({
  url: '',
  key: '',
  serviceKey: ''
})

onMounted(() => {
  loadSavedConfig()
})

const loadSavedConfig = () => {
  const config = loadConfigFromStorage()
  if (config) {
    if (config.url) formData.value.url = config.url
    if (config.key) formData.value.key = config.key
    if (config.serviceKey) formData.value.serviceKey = config.serviceKey
  }
}

const connect = async () => {
  const url = formData.value.url.trim()
  const key = formData.value.key.trim()

  if (!url || !key) {
    showStatus('请填写 Supabase URL 和 Key', 'error')
    return
  }

  try {
    init(url, key)
    const result = await testConnection()

    if (result.tableExists) {
      showStatus('✅ Supabase 连接成功！', 'success')
    } else {
      showStatus('⚠️ 连接成功，但任务表不存在。请先创建表', 'info')
    }
  } catch (error) {
    showStatus(`❌ 连接失败: ${error.message}`, 'error')
  }
}

const saveConfig = () => {
  saveConfigToStorage({
    url: formData.value.url,
    key: formData.value.key,
    serviceKey: formData.value.serviceKey
  })
  showStatus('✅ 配置已保存到本地', 'success')
}

const loadConfig = () => {
  const config = loadConfigFromStorage()
  if (config) {
    if (config.url) formData.value.url = config.url
    if (config.key) formData.value.key = config.key
    if (config.serviceKey) formData.value.serviceKey = config.serviceKey
    showStatus('✅ 配置已加载', 'info')
  } else {
    showStatus('ℹ️ 没有保存的配置', 'info')
  }
}

const getServiceKey = () => {
  return formData.value.serviceKey.trim()
}

const showCreateFunctionSQL = () => {
  const sql = `CREATE OR REPLACE FUNCTION exec_ddl(sql_text text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE sql_text;
END;
$$;`

  const statusDiv = document.getElementById('settingsStatus')
  if (!statusDiv) return
  
  const sqlId = 'exec-function-' + Date.now()
  statusDiv.innerHTML = `
    <div class="status info">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <strong>📋 请执行以下 SQL 创建执行函数（只需执行一次）：</strong>
        <button class="btn btn-sm" @click="copySQL('${sqlId}')">📋 复制 SQL</button>
      </div>
      <pre id="${sqlId}" style="background: var(--light-bg); padding: 15px; border-radius: 5px; font-family: monospace; font-size: 0.9em; white-space: pre-wrap;">${sql}</pre>
    </div>
  `
  
  window.currentSQL = sql
  const copyBtn = statusDiv.querySelector('button')
  if (copyBtn) {
    copyBtn.onclick = async () => {
      const { copyToClipboard } = await import('@/composables/useUtils')
      const success = await copyToClipboard(sql)
      if (success) {
        copyBtn.textContent = '✅ 已复制'
        copyBtn.style.background = '#28a745'
        setTimeout(() => {
          copyBtn.textContent = '📋 复制 SQL'
          copyBtn.style.background = ''
        }, 2000)
      }
    }
  }
}

// 暴露方法供外部使用
defineExpose({
  getServiceKey
})
</script>

