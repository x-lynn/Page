import { ref } from 'vue'

// 转义 HTML
export function escapeHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 格式化日期
export function formatDate(dateString) {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 复制到剪贴板
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (err) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

// 状态映射
export const statusMap = {
  'pending': '新建',
  'in_progress': '进行中',
  'completed': '已完成',
  'cancelled': '已取消'
}

// 优先级映射
export const priorityMap = {
  'low': '低',
  'medium': '中',
  'high': '高'
}

// 优先级颜色
export const priorityColors = {
  'low': '#28a745',
  'medium': '#ffc107',
  'high': '#dc3545'
}

// 显示状态消息的 composable
export function useStatus(elementId) {
  const showStatus = (message, type = 'info') => {
    const statusDiv = document.getElementById(elementId)
    if (!statusDiv) return
    
    statusDiv.className = `status ${type}`
    statusDiv.textContent = message
    statusDiv.classList.remove('hidden')
  }
  
  return { showStatus }
}

// 配置管理
export function useConfig() {
  const saveConfig = (config) => {
    localStorage.setItem('supabaseConfig', JSON.stringify(config))
  }
  
  const loadConfig = () => {
    const configStr = localStorage.getItem('supabaseConfig')
    if (configStr) {
      return JSON.parse(configStr)
    }
    return null
  }
  
  return { saveConfig, loadConfig }
}

