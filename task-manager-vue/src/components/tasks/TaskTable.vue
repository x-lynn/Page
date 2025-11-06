<template>
  <div class="page-container fade-in">
    <div class="page-header">
      <h1 class="page-title">📝 每日任务列表</h1>
      <p class="page-subtitle">管理和查看所有任务</p>
    </div>
    
    <div class="table-container">
      <div class="table-header">
        <h2 class="table-title">任务列表</h2>
        <div class="search-box">
          <input 
            type="text" 
            class="search-input" 
            v-model="searchKeyword"
            @keypress.enter="handleSearch"
            placeholder="搜索任务标题或描述..."
          >
          <button class="btn search-btn" @click="handleSearch">🔍 搜索</button>
        </div>
      </div>
      
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="filter-group">
            <label class="filter-label">状态筛选：</label>
            <select class="filter-select" v-model="statusFilter" @change="load">
              <option value="all">全部</option>
              <option value="pending">新建</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">优先级筛选：</label>
            <select class="filter-select" v-model="priorityFilter" @change="load">
              <option value="all">全部</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-success" @click="addTask">➕ 添加任务</button>
          <button class="btn" @click="load">🔄 刷新</button>
          <button class="btn btn-secondary" @click="handleCreateTable">📋 创建任务表</button>
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
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="empty-table">
                <div class="empty-table-icon">⏳</div>
                <p>加载中...</p>
              </td>
            </tr>
            <tr v-else-if="filteredTasks.length === 0">
              <td colspan="7" class="empty-table">
                <div class="empty-table-icon">📭</div>
                <p>{{ emptyMessage }}</p>
              </td>
            </tr>
            <tr v-else v-for="task in filteredTasks" :key="task.id">
              <td><strong>{{ escapeHtml(task.title || '无标题') }}</strong></td>
              <td>{{ escapeHtml((task.description || '').substring(0, 50)) }}{{ task.description && task.description.length > 50 ? '...' : '' }}</td>
              <td>
                <span class="status-badge" :class="`status-${task.status}`">
                  {{ statusMap[task.status] || task.status }}
                </span>
              </td>
              <td>
                <span class="priority-badge" :class="`priority-${task.priority}`">
                  {{ priorityMap[task.priority] || task.priority }}
                </span>
              </td>
              <td>{{ task.due_date || '-' }}</td>
              <td>{{ formatDate(task.created_at) }}</td>
              <td>
                <div class="action-buttons">
                  <button 
                    v-if="task.status === 'completed'"
                    class="action-btn action-btn-incomplete" 
                    @click="uncompleteTask(task.id)"
                    title="取消完成"
                  >
                    ↩️ 取消完成
                  </button>
                  <button 
                    v-else-if="task.status !== 'cancelled'"
                    class="action-btn action-btn-complete" 
                    @click="completeTask(task.id)"
                    title="快速完成"
                  >
                    ✅ 完成
                  </button>
                  <button class="action-btn action-btn-edit" @click="editTask(task.id)">
                    编辑
                  </button>
                  <button class="action-btn action-btn-delete" @click="deleteTask(task.id)">
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <TaskModal 
      v-model="showModal" 
      :taskId="editingTaskId"
      @saved="handleTaskSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useStatus, escapeHtml, formatDate, statusMap, priorityMap } from '@/composables/useUtils'
import TaskModal from './TaskModal.vue'
// import { useTableCreator } from '@/composables/useTableCreator'

const { getClient } = useSupabase()
const { showStatus } = useStatus('tableStatus')
// const { createTasksTable } = useTableCreator()

const tasks = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')
const showModal = ref(false)
const editingTaskId = ref(null)

const filteredTasks = computed(() => {
  let result = tasks.value

  // 应用搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(task => 
      (task.title || '').toLowerCase().includes(keyword) ||
      (task.description || '').toLowerCase().includes(keyword)
    )
  }

  return result
})

const emptyMessage = computed(() => {
  if (tasks.value.length === 0) {
    return '暂无任务数据'
  }
  return '没有匹配的任务'
})

const handleSearch = () => {
  load()
}

const load = async () => {
  const client = getClient()
  if (!client) {
    showStatus('请先连接 Supabase', 'error')
    tasks.value = []
    return
  }

  loading.value = true
  const tbody = document.getElementById('taskTable')?.querySelector('tbody')
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-table">
          <div class="empty-table-icon">⏳</div>
          <p>加载中...</p>
        </td>
      </tr>
    `
  }

  try {
    let query = client.from('daily_tasks').select('*')

    // 应用筛选
    if (statusFilter.value !== 'all') {
      query = query.eq('status', statusFilter.value)
    }
    
    if (priorityFilter.value !== 'all') {
      query = query.eq('priority', priorityFilter.value)
    }

    // 排序
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    const isTableNotFound = error && (
      error.code === 'PGRST116' ||
      error.message.includes("Could not find the table") ||
      (error.message.includes("relation") && error.message.includes("does not exist"))
    )

    if (isTableNotFound) {
      tasks.value = []
      showCreateTableSQL()
      return
    }

    if (error) throw error

    tasks.value = data || []
    
    if (tasks.value.length === 0) {
      showStatus('✅ 任务加载成功（空列表）', 'info')
    } else {
      showStatus(`✅ 成功加载 ${tasks.value.length} 条任务`, 'success')
    }
  } catch (error) {
    console.error('加载任务失败:', error)
    tasks.value = []
    showStatus(`❌ 加载失败: ${error.message}`, 'error')
  } finally {
    loading.value = false
  }
}

const addTask = () => {
  editingTaskId.value = null
  showModal.value = true
}

const editTask = (id) => {
  editingTaskId.value = id
  showModal.value = true
}

const handleTaskSaved = () => {
  load()
}

const completeTask = async (id) => {
  const client = getClient()
  if (!client) {
    showStatus('请先连接 Supabase', 'error')
    return
  }

  try {
    const { error } = await client
      .from('daily_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error

    showStatus('✅ 任务已完成！', 'success')
    load()
  } catch (error) {
    showStatus(`❌ 操作失败: ${error.message}`, 'error')
  }
}

const uncompleteTask = async (id) => {
  const client = getClient()
  if (!client) {
    showStatus('请先连接 Supabase', 'error')
    return
  }

  try {
    const { error } = await client
      .from('daily_tasks')
      .update({
        status: 'in_progress',
        completed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error

    showStatus('✅ 已取消完成，恢复到进行中！', 'success')
    load()
  } catch (error) {
    showStatus(`❌ 操作失败: ${error.message}`, 'error')
  }
}

const deleteTask = async (id) => {
  if (!confirm('确定要删除这条任务吗？')) {
    return
  }

  const client = getClient()
  if (!client) {
    showStatus('请先连接 Supabase', 'error')
    return
  }

  try {
    const { error } = await client
      .from('daily_tasks')
      .delete()
      .eq('id', id)

    if (error) throw error

    showStatus('✅ 删除成功！', 'success')
    load()
  } catch (error) {
    showStatus(`❌ 删除失败: ${error.message}`, 'error')
  }
}

const handleCreateTable = async () => {
  const { useTableCreator } = await import('@/composables/useTableCreator')
  const { createTasksTable } = useTableCreator()
  await createTasksTable('tableStatus')
  // 监听刷新事件
  window.addEventListener('refresh-tasks', load, { once: true })
}

const showCreateTableSQL = () => {
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

COMMENT ON TABLE daily_tasks IS '每日任务表';`

  const statusDiv = document.getElementById('tableStatus')
  if (!statusDiv) return
  
  const sqlId = 'tasks-sql-' + Date.now()
  statusDiv.innerHTML = `
    <div class="status info">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <strong>📋 请执行以下 SQL 创建每日任务表：</strong>
        <button class="btn btn-sm" @click="copySQL('${sqlId}')">📋 复制 SQL</button>
      </div>
      <pre id="${sqlId}" style="background: var(--light-bg); padding: 15px; border-radius: 5px; font-family: monospace; font-size: 0.9em; white-space: pre-wrap;">${escapeHtml(sql)}</pre>
    </div>
  `
  
  // 绑定复制按钮
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

onMounted(() => {
  // 如果已连接，自动加载任务
  setTimeout(() => {
    const client = getClient()
    if (client) {
      load()
    }
  }, 300)
})
</script>

