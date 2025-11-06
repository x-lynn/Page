<template>
  <div v-if="visible" class="modal-overlay" @click.self="hide">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">{{ currentTaskId ? '编辑任务' : '添加任务' }}</h2>
        <button class="modal-close" @click="hide">×</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSave">
          <div class="form-group">
            <label class="form-label" for="modalTaskTitle">任务标题 *</label>
            <input 
              type="text" 
              class="form-control" 
              id="modalTaskTitle" 
              v-model="formData.title"
              required
            >
          </div>
          <div class="form-group">
            <label class="form-label" for="modalTaskDescription">任务描述</label>
            <textarea 
              class="form-control" 
              id="modalTaskDescription" 
              v-model="formData.description"
              placeholder="可选"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="modalTaskStatus">状态</label>
            <select class="form-control" id="modalTaskStatus" v-model="formData.status">
              <option value="pending">新建</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="modalTaskPriority">优先级</label>
            <select class="form-control" id="modalTaskPriority" v-model="formData.priority">
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="modalTaskDueDate">截止日期</label>
            <input 
              type="date" 
              class="form-control" 
              id="modalTaskDueDate"
              v-model="formData.due_date"
            >
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="hide">取消</button>
        <button class="btn btn-success" @click="handleSave">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useStatus } from '@/composables/useUtils'

const props = defineProps({
  modelValue: Boolean,
  taskId: String
})

const emit = defineEmits(['update:modelValue', 'saved'])

const { getClient } = useSupabase()
const { showStatus } = useStatus('tableStatus')

const visible = ref(false)
const currentTaskId = ref(null)

const formData = ref({
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  due_date: ''
})

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal) {
    if (props.taskId) {
      currentTaskId.value = props.taskId
      loadTask(props.taskId)
    } else {
      reset()
    }
  }
})

const reset = () => {
  currentTaskId.value = null
  formData.value = {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: ''
  }
}

const hide = () => {
  visible.value = false
  emit('update:modelValue', false)
  reset()
}

const loadTask = async (id) => {
  const client = getClient()
  if (!client) {
    showStatus('请先连接 Supabase', 'error')
    return
  }

  try {
    const { data, error } = await client
      .from('daily_tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    formData.value = {
      title: data.title || '',
      description: data.description || '',
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      due_date: data.due_date || ''
    }
  } catch (error) {
    showStatus(`❌ 加载失败: ${error.message}`, 'error')
  }
}

const handleSave = async () => {
  const client = getClient()
  if (!client) {
    showStatus('请先连接 Supabase', 'error')
    return
  }

  const title = formData.value.title.trim()
  if (!title) {
    showStatus('请填写任务标题', 'error')
    return
  }

  try {
    const taskData = {
      title,
      description: formData.value.description || null,
      status: formData.value.status,
      priority: formData.value.priority,
      due_date: formData.value.due_date || null,
      updated_at: new Date().toISOString()
    }

    if (taskData.status === 'completed' && !currentTaskId.value) {
      taskData.completed_at = new Date().toISOString()
    }

    let result
    if (currentTaskId.value) {
      result = await client
        .from('daily_tasks')
        .update(taskData)
        .eq('id', currentTaskId.value)
    } else {
      result = await client
        .from('daily_tasks')
        .insert([taskData])
    }

    if (result.error) throw result.error

    showStatus(`✅ ${currentTaskId.value ? '更新' : '添加'}任务成功！`, 'success')
    hide()
    emit('saved')
  } catch (error) {
    showStatus(`❌ 操作失败: ${error.message}`, 'error')
  }
}
</script>

