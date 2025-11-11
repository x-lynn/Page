<template>
  <view class="page-container">
    <!-- 用户信息卡片 -->
    <view class="user-card card">
      <view class="user-avatar">
        <text class="avatar-icon">👤</text>
      </view>
      <view class="user-info">
        <text class="user-nickname">{{ userStore.nickname }}</text>
        <text class="user-id">ID: {{ userStore.user?.id?.substring(0, 8) || '--' }}...</text>
      </view>
    </view>

    <!-- 设置表单 -->
    <view class="settings-card card">
      <view class="card-title">个人设置</view>
      <SettingsForm
        :nickname="userStore.nickname"
        :showdoc-push-link="userStore.showdocPushLink"
        @save="handleSaveSettings"
      />
    </view>

    <!-- 统计信息 -->
    <view class="stats-card card">
      <view class="card-title">任务统计</view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ stats.total }}</text>
          <text class="stat-label">总任务</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.todo }}</text>
          <text class="stat-label">待办</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.doing }}</text>
          <text class="stat-label">进行中</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.done }}</text>
          <text class="stat-label">已完成</text>
        </view>
      </view>
    </view>

    <!-- 其他操作 -->
    <view class="actions-card card">
      <view class="action-item" @click="handleRefresh">
        <text class="action-icon">🔄</text>
        <text class="action-text">刷新数据</text>
        <text class="action-arrow">›</text>
      </view>
      <view class="action-item" @click="handleAbout">
        <text class="action-icon">ℹ️</text>
        <text class="action-text">关于应用</text>
        <text class="action-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTasksStore } from '../../stores/tasks'
import { useUserStore } from '../../stores/user'
import SettingsForm from '../../components/SettingsForm.vue'
import { TASK_STATUS } from '../../utils/constants'

const tasksStore = useTasksStore()
const userStore = useUserStore()

// 统计数据
const stats = computed(() => {
  const tasks = tasksStore.tasks.filter(t => !t.is_archived)
  return {
    total: tasks.length,
    todo: tasks.filter(t => t.status === TASK_STATUS.TODO).length,
    doing: tasks.filter(t => t.status === TASK_STATUS.DOING).length,
    done: tasks.filter(t => t.status === TASK_STATUS.DONE).length
  }
})

onMounted(async () => {
  await userStore.initUser()
  await tasksStore.fetchTasks()
})

// 处理保存设置
const handleSaveSettings = async (settings) => {
  try {
    await userStore.updateUserProfile(settings)
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

// 处理刷新
const handleRefresh = async () => {
  uni.showLoading({ title: '刷新中...' })
  try {
    await Promise.all([
      tasksStore.fetchTasks(),
      userStore.fetchUserProfile()
    ])
    uni.hideLoading()
    uni.showToast({
      title: '刷新成功',
      icon: 'success'
    })
  } catch (error) {
    uni.hideLoading()
    console.error('刷新失败:', error)
  }
}

// 处理关于
const handleAbout = () => {
  uni.showModal({
    title: 'UniTask',
    content: '个人任务管理应用\n版本: 1.0.0\n\n一个简洁、高效的任务管理工具',
    showCancel: false
  })
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 32rpx;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 32rpx;
  margin-bottom: 32rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 64rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-nickname {
  font-size: 36rpx;
  font-weight: 600;
  color: #303133;
}

.user-id {
  font-size: 24rpx;
  color: #909399;
}

.settings-card,
.stats-card,
.actions-card {
  margin-bottom: 32rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #303133;
  margin-bottom: 32rpx;
  padding-bottom: 16rpx;
  border-bottom: 1px solid #ebeef5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 600;
  color: #3c9cff;
}

.stat-label {
  font-size: 24rpx;
  color: #909399;
}

.action-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid #ebeef5;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    opacity: 0.6;
  }
}

.action-icon {
  font-size: 32rpx;
  margin-right: 24rpx;
}

.action-text {
  flex: 1;
  font-size: 28rpx;
  color: #303133;
}

.action-arrow {
  font-size: 32rpx;
  color: #c0c4cc;
}
</style>

