<template>
  <view class="page-container">
    <!-- 顶部操作栏 -->
    <view class="page-header">
      <view class="header-actions">
        <view class="action-btn" @click="showFilterModal = true">
          <text class="icon">🔍</text>
          <text class="action-text">筛选</text>
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

      <view v-else-if="filteredTasks.length === 0" class="empty-state">
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无任务</text>
        <view class="btn btn-primary mt-md" @click="handleAddTask">创建第一个任务</view>
      </view>

      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        @click="handleTaskClick"
        @status-change="handleStatusChange"
      />
    </view>

    <!-- 筛选弹窗 -->
    <FilterModal
      v-model:show="showFilterModal"
      :filters="tasksStore.filters"
      @confirm="handleFilterConfirm"
      @reset="handleFilterReset"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '../../stores/tasks'
import { useUserStore } from '../../stores/user'
import TaskCard from '../../components/TaskCard.vue'
import FilterModal from '../../components/FilterModal.vue'

const tasksStore = useTasksStore()
const userStore = useUserStore()
const showFilterModal = ref(false)

const filteredTasks = computed(() => tasksStore.filteredTasks)
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
    url: '/pages/detail/index'
  })
}

// 处理筛选确认
const handleFilterConfirm = (filters) => {
  tasksStore.setFilters(filters)
}

// 处理筛选重置
const handleFilterReset = () => {
  tasksStore.clearFilters()
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
  padding: 24rpx 32rpx;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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

