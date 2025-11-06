<template>
  <el-dialog
    v-model="visible"
    :title="currentTaskId ? '编辑任务' : '添加任务'"
    width="600px"
    @close="hide"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="任务标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入任务标题"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="任务描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="可选"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="选择状态" style="width: 100%">
          <el-option label="新建" value="pending" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="优先级" prop="priority">
        <el-select v-model="formData.priority" placeholder="选择优先级" style="width: 100%">
          <el-option label="低" value="low" />
          <el-option label="中" value="medium" />
          <el-option label="高" value="high" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="截止日期" prop="due_date">
        <el-date-picker
          v-model="formData.due_date"
          type="date"
          placeholder="选择截止日期"
          style="width: 100%"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="hide">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { useStatus } from '@/composables/useUtils'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  taskId: String
})

const emit = defineEmits(['update:modelValue', 'saved'])

const { getClient } = useSupabase()
const { showStatus } = useStatus('tableStatus')

const visible = ref(false)
const currentTaskId = ref(null)
const saving = ref(false)
const formRef = ref(null)

const formData = ref({
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  due_date: ''
})

const rules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' }
  ]
}

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
  formRef.value?.clearValidate()
}

const hide = () => {
  visible.value = false
  emit('update:modelValue', false)
  reset()
}

const loadTask = async (id) => {
  const client = getClient()
  if (!client) {
    ElMessage.error('请先连接 Supabase')
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
    ElMessage.error(`加载失败: ${error.message}`)
    showStatus(`❌ 加载失败: ${error.message}`, 'error')
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      saveTask()
    }
  })
}

const saveTask = async () => {
  const client = getClient()
  if (!client) {
    ElMessage.error('请先连接 Supabase')
    return
  }

  saving.value = true

  try {
    const taskData = {
      title: formData.value.title.trim(),
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

    ElMessage.success(`${currentTaskId.value ? '更新' : '添加'}任务成功！`)
    showStatus(`✅ ${currentTaskId.value ? '更新' : '添加'}任务成功！`, 'success')
    hide()
    emit('saved')
  } catch (error) {
    ElMessage.error(`操作失败: ${error.message}`)
    showStatus(`❌ 操作失败: ${error.message}`, 'error')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
