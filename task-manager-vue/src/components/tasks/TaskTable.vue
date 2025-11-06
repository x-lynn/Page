<template>
  <div class="page-container fade-in">
    <el-page-header>
      <template #content>
        <div class="page-header">
          <h1 class="page-title">📝 每日任务列表</h1>
          <p class="page-subtitle">管理和查看所有任务</p>
        </div>
      </template>
    </el-page-header>
    
    <el-card class="mt-4">
      <template #header>
        <div class="card-header-flex">
          <h2 class="table-title">任务列表</h2>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索任务标题或描述..."
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>
      
      <div class="toolbar">
        <div class="toolbar-left">
          <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 150px" @change="load">
            <el-option label="全部" value="all" />
            <el-option label="新建" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
          
          <el-select v-model="priorityFilter" placeholder="优先级筛选" style="width: 150px" @change="load">
            <el-option label="全部" value="all" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </div>
        
        <div class="toolbar-right">
          <el-button type="success" @click="addTask" :icon="Plus">
            添加任务
          </el-button>
          <el-button @click="load" :icon="Refresh">
            刷新
          </el-button>
          <el-button @click="handleCreateTable" :icon="Document">
            创建任务表
          </el-button>
        </div>
      </div>
      
      <div id="tableStatus" class="mt-4"></div>
      
      <el-table
        v-loading="loading"
        :data="filteredTasks"
        stripe
        style="width: 100%"
        empty-text="暂无任务数据"
      >
        <el-table-column prop="title" label="任务标题" min-width="150">
          <template #default="{ row }">
            <strong>{{ row.title || '无标题' }}</strong>
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.description || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ statusMap[row.status] || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">
              {{ priorityMap[row.priority] || row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="due_date" label="截止日期" width="120">
          <template #default="{ row }">
            {{ row.due_date || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'completed'"
              size="small"
              type="warning"
              @click="uncompleteTask(row.id)"
              :icon="RefreshLeft"
            >
              取消完成
            </el-button>
            <el-button
              v-else-if="row.status !== 'cancelled'"
              size="small"
              type="success"
              @click="completeTask(row.id)"
              :icon="Check"
            >
              完成
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="editTask(row.id)"
              :icon="Edit"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteTask(row.id)"
              :icon="Delete"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
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
import { useStatus, formatDate, statusMap, priorityMap } from '@/composables/useUtils'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Refresh, Document, RefreshLeft, Check, Edit, Delete } from '@element-plus/icons-vue'
import TaskModal from './TaskModal.vue'

const { getClient } = useSupabase()
const { showStatus } = useStatus('tableStatus')

const tasks = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')
const showModal = ref(false)
const editingTaskId = ref(null)

const filteredTasks = computed(() => {
  let result = tasks.value

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(task => 
      (task.title || '').toLowerCase().includes(keyword) ||
      (task.description || '').toLowerCase().includes(keyword)
    )
  }

  return result
})

const getStatusType = (status) => {
  const types = {
    'pending': 'info',
    'in_progress': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return types[status] || 'info'
}

const getPriorityType = (priority) => {
  const types = {
    'low': 'success',
    'medium': 'warning',
    'high': 'danger'
  }
  return types[priority] || 'info'
}

const handleSearch = () => {
  load()
}

const load = async () => {
  const client = getClient()
  if (!client) {
    ElMessage.error('请先连接 Supabase')
    tasks.value = []
    return
  }

  loading.value = true

  try {
    let query = client.from('daily_tasks').select('*')

    if (statusFilter.value !== 'all') {
      query = query.eq('status', statusFilter.value)
    }
    
    if (priorityFilter.value !== 'all') {
      query = query.eq('priority', priorityFilter.value)
    }

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
      ElMessage.info('任务加载成功（空列表）')
      showStatus('✅ 任务加载成功（空列表）', 'info')
    } else {
      ElMessage.success(`成功加载 ${tasks.value.length} 条任务`)
      showStatus(`✅ 成功加载 ${tasks.value.length} 条任务`, 'success')
    }
  } catch (error) {
    console.error('加载任务失败:', error)
    tasks.value = []
    ElMessage.error(`加载失败: ${error.message}`)
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
    ElMessage.error('请先连接 Supabase')
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

    ElMessage.success('任务已完成！')
    showStatus('✅ 任务已完成！', 'success')
    load()
  } catch (error) {
    ElMessage.error(`操作失败: ${error.message}`)
    showStatus(`❌ 操作失败: ${error.message}`, 'error')
  }
}

const uncompleteTask = async (id) => {
  const client = getClient()
  if (!client) {
    ElMessage.error('请先连接 Supabase')
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

    ElMessage.success('已取消完成，恢复到进行中！')
    showStatus('✅ 已取消完成，恢复到进行中！', 'success')
    load()
  } catch (error) {
    ElMessage.error(`操作失败: ${error.message}`)
    showStatus(`❌ 操作失败: ${error.message}`, 'error')
  }
}

const deleteTask = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条任务吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
  } catch {
    return
  }

  const client = getClient()
  if (!client) {
    ElMessage.error('请先连接 Supabase')
    return
  }

  try {
    const { error } = await client
      .from('daily_tasks')
      .delete()
      .eq('id', id)

    if (error) throw error

    ElMessage.success('删除成功！')
    showStatus('✅ 删除成功！', 'success')
    load()
  } catch (error) {
    ElMessage.error(`删除失败: ${error.message}`)
    showStatus(`❌ 删除失败: ${error.message}`, 'error')
  }
}

const handleCreateTable = async () => {
  const { useTableCreator } = await import('@/composables/useTableCreator')
  const { createTasksTable } = useTableCreator()
  await createTasksTable('tableStatus')
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
  const escapedSql = sql.replace(/`/g, '\\`').replace(/\${/g, '\\${')
  
  statusDiv.innerHTML = `
    <div class="el-alert el-alert--info is-light">
      <div class="el-alert__content">
        <div class="el-alert__title">请执行以下 SQL 创建每日任务表</div>
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

onMounted(() => {
  setTimeout(() => {
    const client = getClient()
    if (client) {
      load()
    }
  }, 300)
})
</script>

<style scoped>
.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.toolbar-left {
  display: flex;
  gap: 10px;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

.mt-4 {
  margin-top: 16px;
}
</style>
