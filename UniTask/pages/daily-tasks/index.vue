<template>
  <view class="page-container">
    <!-- 顶部操作栏 -->
    <view class="page-header">
      <view class="header-title">
        <text class="title-text">每日任务</text>
        <text class="title-hint">每天重置完成状态</text>
      </view>
      <view class="header-actions">
        <view class="action-btn" @click="handleResetDailyTasks">
          <text class="icon">🔄</text>
          <text class="action-text">重置</text>
        </view>
        <view class="action-btn" @click="handleAddTask">
          <text class="icon">➕</text>
          <text class="action-text">新建</text>
        </view>
      </view>
    </view>

    <!-- 任务列表 -->
    <view class="task-list">
      <view v-if="loading" class="loading">
        <text>加载中...</text>
      </view>

      <view v-else-if="dailyTasks.length === 0" class="empty-state">
        <text class="empty-icon">🔄</text>
        <text class="empty-text">暂无每日任务</text>
        <view class="btn btn-primary mt-md" @click="handleAddTask">创建每日任务</view>
      </view>

      <TaskCard
        v-for="task in dailyTasks"
        :key="task.id"
        :task="task"
        @click="handleTaskClick"
        @status-change="handleStatusChange"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '../../stores/tasks'
import { useUserStore } from '../../stores/user'
import { TASK_TYPE } from '../../utils/constants'
import TaskCard from '../../components/TaskCard.vue'

const tasksStore = useTasksStore()
const userStore = useUserStore()

const dailyTasks = computed(() => tasksStore.dailyTasks)
const loading = computed(() => tasksStore.loading)

onMounted(async () => {
  await userStore.initUser()
  await tasksStore.fetchTasks()
})

// 下拉刷新
const onPullDownRefresh = async () => {
  await tasksStore.fetchTasks()
  uni.stopPullDownRefresh()
}

// 处理任务点击
const handleTaskClick = (task) => {
  uni.navigateTo({
    url: `/pages/detail/index?id=${task.id}`
  })
}

// 处理状态变更
const handleStatusChange = async (taskId, newStatus) => {
  try {
    await tasksStore.updateTaskStatus(taskId, newStatus)
    uni.showToast({
      title: '更新成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('更新状态失败:', error)
  }
}

// 处理添加任务
const handleAddTask = () => {
  uni.navigateTo({
    url: `/pages/detail/index?type=${TASK_TYPE.DAILY}`
  })
}

// 处理重置每日任务
const handleResetDailyTasks = () => {
  uni.showModal({
    title: '确认重置',
    content: '确定要重置所有每日任务的完成状态吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await tasksStore.resetDailyTasks()
        } catch (error) {
          console.error('重置失败:', error)
        }
      }
    }
  })
}

// 导出页面生命周期函数供 uni-app 调用
export { onPullDownRefresh }
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-header {
  background: #ffffff;
  padding: 32rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-title {
  margin-bottom: 24rpx;
}

.title-text {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8rpx;
}

.title-hint {
  font-size: 24rpx;
  color: #909399;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  gap: 24rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: #f5f7fa;
  border-radius: 8rpx;
  transition: all 0.3s ease;

  &:active {
    background: #e4e7ed;
    transform: scale(0.95);
  }
}

.icon {
  font-size: 28rpx;
}

.action-text {
  font-size: 28rpx;
  color: #303133;
}

.task-list {
  padding: 24rpx 32rpx;
}
</style>

