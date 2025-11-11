<template>
  <view class="page-container">
    <view class="form-container">
      <!-- 任务标题 -->
      <view class="form-section">
        <text class="section-label">任务标题 *</text>
        <input
          class="form-input"
          v-model="formData.title"
          placeholder="请输入任务标题"
          maxlength="100"
        />
      </view>

      <!-- 任务描述 -->
      <view class="form-section">
        <text class="section-label">任务描述</text>
        <textarea
          class="form-textarea"
          v-model="formData.description"
          placeholder="请输入任务描述（可选）"
          maxlength="500"
        />
      </view>

      <!-- 任务类型 -->
      <view class="form-section">
        <text class="section-label">任务类型</text>
        <view class="radio-group">
          <view
            class="radio-item"
            :class="{ active: formData.task_type === 'Standard' }"
            @click="formData.task_type = 'Standard'"
          >
            <text class="radio-icon">📋</text>
            <text class="radio-label">标准任务</text>
          </view>
          <view
            class="radio-item"
            :class="{ active: formData.task_type === 'Daily' }"
            @click="formData.task_type = 'Daily'"
          >
            <text class="radio-icon">🔄</text>
            <text class="radio-label">每日任务</text>
          </view>
        </view>
      </view>

      <!-- 优先级 -->
      <view class="form-section">
        <text class="section-label">优先级</text>
        <view class="radio-group">
          <view
            class="radio-item"
            :class="{ active: formData.priority === 'Low' }"
            @click="formData.priority = 'Low'"
          >
            <PriorityBadge priority="Low" />
            <text class="radio-label">低</text>
          </view>
          <view
            class="radio-item"
            :class="{ active: formData.priority === 'Medium' }"
            @click="formData.priority = 'Medium'"
          >
            <PriorityBadge priority="Medium" />
            <text class="radio-label">中</text>
          </view>
          <view
            class="radio-item"
            :class="{ active: formData.priority === 'High' }"
            @click="formData.priority = 'High'"
          >
            <PriorityBadge priority="High" />
            <text class="radio-label">高</text>
          </view>
        </view>
      </view>

      <!-- 状态 -->
      <view class="form-section">
        <text class="section-label">状态</text>
        <view class="radio-group">
          <view
            class="radio-item"
            :class="{ active: formData.status === 'Todo' }"
            @click="formData.status = 'Todo'"
          >
            <StatusBadge status="Todo" />
            <text class="radio-label">待办</text>
          </view>
          <view
            class="radio-item"
            :class="{ active: formData.status === 'Doing' }"
            @click="formData.status = 'Doing'"
          >
            <StatusBadge status="Doing" />
            <text class="radio-label">进行中</text>
          </view>
          <view
            class="radio-item"
            :class="{ active: formData.status === 'Done' }"
            @click="formData.status = 'Done'"
          >
            <StatusBadge status="Done" />
            <text class="radio-label">已完成</text>
          </view>
        </view>
      </view>

      <!-- 截止日期 -->
      <view class="form-section" v-if="formData.task_type === 'Standard'">
        <text class="section-label">截止日期</text>
        <picker
          mode="date"
          :value="formData.due_date ? formatDate(formData.due_date, 'YYYY-MM-DD') : ''"
          @change="handleDateChange"
        >
          <view class="picker-input">
            <text :class="{ placeholder: !formData.due_date }">
              {{ formData.due_date ? formatDate(formData.due_date, 'YYYY-MM-DD') : '选择截止日期（可选）' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 操作按钮 -->
      <view class="form-actions">
        <view class="btn btn-outline" @click="handleCancel">取消</view>
        <view class="btn btn-danger ml-md" v-if="taskId" @click="handleDelete">删除</view>
        <view class="btn btn-primary flex-1 ml-md" @click="handleSave">保存</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTasksStore } from '../../stores/tasks'
import { TASK_TYPE, TASK_STATUS, TASK_PRIORITY } from '../../utils/constants'
import { formatDate } from '../../utils/helpers'
import PriorityBadge from '../../components/PriorityBadge.vue'
import StatusBadge from '../../components/StatusBadge.vue'

const tasksStore = useTasksStore()
const taskId = ref(null)
const formData = ref({
  title: '',
  description: '',
  task_type: TASK_TYPE.STANDARD,
  priority: TASK_PRIORITY.MEDIUM,
  status: TASK_STATUS.TODO,
  due_date: null
})

onMounted(async () => {
  // 获取路由参数
  // #ifdef H5
  const query = new URLSearchParams(window.location.search)
  taskId.value = query.get('id') || null
  const taskType = query.get('type') || null
  // #endif
  
  // #ifdef MP-WEIXIN || APP-PLUS
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  taskId.value = options.id || null
  const taskType = options.type || null
  // #endif

  if (taskType) {
    formData.value.task_type = taskType
  }

  // 如果是编辑模式，加载任务数据
  if (taskId.value) {
    await loadTask()
  }
})

// 加载任务数据
const loadTask = async () => {
  try {
    await tasksStore.fetchTasks()
    const task = tasksStore.tasks.find(t => t.id === taskId.value)
    if (task) {
      formData.value = {
        title: task.title || '',
        description: task.description || '',
        task_type: task.task_type || TASK_TYPE.STANDARD,
        priority: task.priority || TASK_PRIORITY.MEDIUM,
        status: task.status || TASK_STATUS.TODO,
        due_date: task.due_date || null
      }
    }
  } catch (error) {
    console.error('加载任务失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  }
}

// 处理日期选择
const handleDateChange = (e) => {
  const dateStr = e.detail.value
  if (dateStr) {
    formData.value.due_date = new Date(dateStr).toISOString()
  } else {
    formData.value.due_date = null
  }
}

// 处理保存
const handleSave = async () => {
  if (!formData.value.title.trim()) {
    uni.showToast({
      title: '请输入任务标题',
      icon: 'none'
    })
    return
  }

  try {
    if (taskId.value) {
      // 更新任务
      await tasksStore.updateTask(taskId.value, {
        title: formData.value.title.trim(),
        description: formData.value.description.trim() || null,
        task_type: formData.value.task_type,
        priority: formData.value.priority,
        status: formData.value.status,
        due_date: formData.value.due_date
      })
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    } else {
      // 创建任务
      await tasksStore.createTask({
        title: formData.value.title.trim(),
        description: formData.value.description.trim() || null,
        task_type: formData.value.task_type,
        priority: formData.value.priority,
        status: formData.value.status,
        due_date: formData.value.due_date
      })
      uni.showToast({
        title: '创建成功',
        icon: 'success'
      })
    }

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 处理删除
const handleDelete = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个任务吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await tasksStore.deleteTask(taskId.value)
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (error) {
          console.error('删除失败:', error)
        }
      }
    }
  })
}

// 处理取消
const handleCancel = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 32rpx;
}

.form-container {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
}

.form-section {
  margin-bottom: 48rpx;
}

.section-label {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16rpx;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 24rpx;
  border: 1px solid #dcdfe6;
  border-radius: 8rpx;
  font-size: 28rpx;
  background: #ffffff;
  color: #303133;

  &:focus {
    border-color: #3c9cff;
    outline: none;
  }

  &::placeholder {
    color: #c0c4cc;
  }
}

.form-textarea {
  min-height: 200rpx;
}

.radio-group {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.radio-item {
  flex: 1;
  min-width: 200rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx;
  border: 2px solid #dcdfe6;
  border-radius: 8rpx;
  background: #ffffff;
  transition: all 0.3s ease;

  &.active {
    border-color: #3c9cff;
    background: #ecf5ff;
  }

  &:active {
    transform: scale(0.98);
  }
}

.radio-icon {
  font-size: 32rpx;
}

.radio-label {
  font-size: 28rpx;
  color: #303133;
}

.picker-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  border: 1px solid #dcdfe6;
  border-radius: 8rpx;
  background: #ffffff;
  font-size: 28rpx;
  color: #303133;

  .placeholder {
    color: #c0c4cc;
  }
}

.picker-arrow {
  font-size: 32rpx;
  color: #909399;
}

.form-actions {
  display: flex;
  margin-top: 64rpx;
  gap: 16rpx;
}
</style>

