<template>
  <view class="task-card card" @click="handleClick">
    <view class="task-header">
      <view class="task-title-wrapper">
        <text class="task-title" :class="{ 'task-done': task.status === 'Done' }">
          {{ task.title }}
        </text>
        <view class="task-badges">
          <PriorityBadge :priority="task.priority" />
          <StatusBadge :status="task.status" class="ml-sm" />
        </view>
      </view>
      <view class="task-type-icon" v-if="task.task_type === 'Daily'">
        🔄
      </view>
    </view>

    <view class="task-description" v-if="task.description">
      <text class="description-text">{{ task.description }}</text>
    </view>

    <view class="task-footer">
      <view class="task-meta">
        <text class="meta-item" v-if="task.due_date">
          📅 {{ formatDate(task.due_date, 'YYYY-MM-DD') }}
        </text>
        <text class="meta-item" v-if="task.created_at">
          {{ formatRelativeTime(task.created_at) }}
        </text>
      </view>
      <view class="task-actions" @click.stop>
        <view 
          class="action-btn" 
          v-if="task.status !== 'Done'"
          @click="handleStatusChange('Done')"
        >
          ✓
        </view>
        <view 
          class="action-btn" 
          v-else
          @click="handleStatusChange('Todo')"
        >
          ↻
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import PriorityBadge from './PriorityBadge.vue'
import StatusBadge from './StatusBadge.vue'
import { formatDate, formatRelativeTime } from '../utils/helpers'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'status-change'])

const handleClick = () => {
  emit('click', props.task)
}

const handleStatusChange = (newStatus) => {
  emit('status-change', props.task.id, newStatus)
}
</script>

<style lang="scss" scoped>
.task-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }
}

.task-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.task-title-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.task-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #303133;
  line-height: 1.5;

  &.task-done {
    text-decoration: line-through;
    color: #909399;
  }
}

.task-badges {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.task-type-icon {
  font-size: 32rpx;
  margin-left: 16rpx;
}

.task-description {
  margin-bottom: 16rpx;
  padding-top: 16rpx;
  border-top: 1px solid #ebeef5;
}

.description-text {
  font-size: 28rpx;
  color: #606266;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.task-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16rpx;
  border-top: 1px solid #ebeef5;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 24rpx;
  flex: 1;
}

.meta-item {
  font-size: 24rpx;
  color: #909399;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.action-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f7fa;
  color: #409eff;
  font-size: 32rpx;
  transition: all 0.3s ease;

  &:active {
    background: #ecf5ff;
    transform: scale(0.9);
  }
}
</style>

