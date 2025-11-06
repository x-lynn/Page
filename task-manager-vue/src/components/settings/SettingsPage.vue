<template>
  <div class="page-container fade-in">
    <el-page-header>
      <template #content>
        <div class="page-header">
          <h1 class="page-title">⚙️ 设置</h1>
          <p class="page-subtitle">配置 Supabase 连接信息</p>
        </div>
      </template>
    </el-page-header>
    
    <el-card class="mt-4">
      <template #header>
        <h2 class="card-title">Supabase 配置</h2>
      </template>
      
      <el-form :model="formData" label-width="200px">
        <el-form-item label="Supabase URL">
          <el-input 
            v-model="formData.url"
            placeholder="https://your-project.supabase.co"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="Supabase Anon Key">
          <el-input 
            v-model="formData.key"
            placeholder="your-anon-key"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="Service Role Key">
          <el-input 
            v-model="formData.serviceKey"
            type="password"
            placeholder="service_role key (可选)"
            clearable
            show-password
          />
          <el-text type="info" size="small" class="mt-2">
            在 Settings → API → service_role key 中获取（可选，用于直接建表）
          </el-text>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="connect" :icon="Connection">
            连接 Supabase
          </el-button>
          <el-button @click="saveConfig" :icon="Document">
            保存配置
          </el-button>
          <el-button @click="loadConfig" :icon="FolderOpened">
            加载配置
          </el-button>
          <el-button @click="showCreateFunctionSQL" :icon="Setting">
            创建执行函数
          </el-button>
        </el-form-item>
      </el-form>
      
      <div id="settingsStatus" class="mt-4"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useStatus, useConfig } from '@/composables/useUtils'
import { Connection, Document, FolderOpened, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

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
    ElMessage.error('请填写 Supabase URL 和 Key')
    return
  }

  try {
    init(url, key)
    const result = await testConnection()

    if (result.tableExists) {
      ElMessage.success('Supabase 连接成功！')
      showStatus('✅ Supabase 连接成功！', 'success')
    } else {
      ElMessage.warning('连接成功，但任务表不存在。请先创建表')
      showStatus('⚠️ 连接成功，但任务表不存在。请先创建表', 'info')
    }
  } catch (error) {
    ElMessage.error(`连接失败: ${error.message}`)
    showStatus(`❌ 连接失败: ${error.message}`, 'error')
  }
}

const saveConfig = () => {
  saveConfigToStorage({
    url: formData.value.url,
    key: formData.value.key,
    serviceKey: formData.value.serviceKey
  })
  ElMessage.success('配置已保存到本地')
  showStatus('✅ 配置已保存到本地', 'success')
}

const loadConfig = () => {
  const config = loadConfigFromStorage()
  if (config) {
    if (config.url) formData.value.url = config.url
    if (config.key) formData.value.key = config.key
    if (config.serviceKey) formData.value.serviceKey = config.serviceKey
    ElMessage.info('配置已加载')
    showStatus('✅ 配置已加载', 'info')
  } else {
    ElMessage.info('没有保存的配置')
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
  const escapedSql = sql.replace(/`/g, '\\`').replace(/\${/g, '\\${')
  
  statusDiv.innerHTML = `
    <div class="el-alert el-alert--info is-light">
      <div class="el-alert__content">
        <div class="el-alert__title">请执行以下 SQL 创建执行函数（只需执行一次）</div>
        <div class="mt-2">
          <button class="el-button el-button--small" id="copy-btn-${sqlId}">📋 复制 SQL</button>
        </div>
        <pre id="${sqlId}" style="background: #f5f7fa; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 0.9em; white-space: pre-wrap; margin-top: 10px;">${escapedSql}</pre>
      </div>
    </div>
  `
  
  window.currentSQL = sql
  const copyBtn = document.getElementById(`copy-btn-${sqlId}`)
  if (copyBtn) {
    copyBtn.onclick = async () => {
      const { copyToClipboard } = await import('@/composables/useUtils')
      const success = await copyToClipboard(sql)
      if (success) {
        ElMessage.success('SQL 已复制到剪贴板')
      }
    }
  }
}

// 暴露方法供外部使用
defineExpose({
  getServiceKey
})
</script>

<style scoped>
.mt-2 {
  margin-top: 8px;
}

.mt-4 {
  margin-top: 16px;
}
</style>
