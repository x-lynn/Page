<template>
  <view class="filter-modal" v-if="show" @click="handleMaskClick">
    <view class="modal-content" @click.stop>
      <view class="modal-header">
        <text class="modal-title">筛选条件</text>
        <text class="modal-close" @click="handleClose">✕</text>
      </view>

      <view class="modal-body">
        <!-- 状态筛选 -->
        <view class="filter-section">
          <text class="section-title">状态</text>
          <view class="filter-options">
            <view 
              class="filter-option" 
              :class="{ active: filters.status === null }"
              @click="handleFilterChange('status', null)"
            >
              全部
            </view>
            <view 
              class="filter-option" 
              :class="{ active: filters.status === 'Todo' }"
              @click="handleFilterChange('status', 'Todo')"
            >
              待办
            </view>
            <view 
              class="filter-option" 
              :class="{ active: filters.status === 'Doing' }"
              @click="handleFilterChange('status', 'Doing')"
            >
              进行中
            </view>
            <view 
              class="filter-option" 
              :class="{ active: filters.status === 'Done' }"
              @click="handleFilterChange('status', 'Done')"
            >
              已完成
            </view>
          </view>
        </view>

        <!-- 优先级筛选 -->
        <view class="filter-section">
          <text class="section-title">优先级</text>
          <view class="filter-options">
            <view 
              class="filter-option" 
              :class="{ active: filters.priority === null }"
              @click="handleFilterChange('priority', null)"
            >
              全部
            </view>
            <view 
              class="filter-option" 
              :class="{ active: filters.priority === 'Low' }"
              @click="handleFilterChange('priority', 'Low')"
            >
              低
            </view>
            <view 
              class="filter-option" 
              :class="{ active: filters.priority === 'Medium' }"
              @click="handleFilterChange('priority', 'Medium')"
            >
              中
            </view>
            <view 
              class="filter-option" 
              :class="{ active: filters.priority === 'High' }"
              @click="handleFilterChange('priority', 'High')"
            >
              高
            </view>
          </view>
        </view>

        <!-- 任务类型筛选 -->
        <view class="filter-section">
          <text class="section-title">任务类型</text>
          <view class="filter-options">
            <view 
              class="filter-option" 
              :class="{ active: filters.taskType === null }"
              @click="handleFilterChange('taskType', null)"
            >
              全部
            </view>
            <view 
              class="filter-option" 
              :class="{ active: filters.taskType === 'Standard' }"
              @click="handleFilterChange('taskType', 'Standard')"
            >
              标准任务
            </view>
            <view 
              class="filter-option" 
              :class="{ active: filters.taskType === 'Daily' }"
              @click="handleFilterChange('taskType', 'Daily')"
            >
              每日任务
            </view>
          </view>
        </view>
      </view>

      <view class="modal-footer">
        <view class="btn btn-outline" @click="handleReset">重置</view>
        <view class="btn btn-primary flex-1 ml-md" @click="handleConfirm">确定</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits, defineModel } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  filters: {
    type: Object,
    default: () => ({
      status: null,
      priority: null,
      taskType: null
    })
  }
})

const emit = defineEmits(['update:show', 'confirm', 'reset'])

const handleClose = () => {
  emit('update:show', false)
}

const handleMaskClick = () => {
  handleClose()
}

const handleFilterChange = (key, value) => {
  // 这里只是临时更新，等确认时才真正应用
  const newFilters = { ...props.filters, [key]: value }
  emit('update:filters', newFilters)
}

const handleConfirm = () => {
  emit('confirm', props.filters)
  handleClose()
}

const handleReset = () => {
  emit('reset')
}
</script>

<style lang="scss" scoped>
.filter-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  width: 100%;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1px solid #ebeef5;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #303133;
}

.modal-close {
  font-size: 40rpx;
  color: #909399;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 32rpx;
}

.filter-section {
  margin-bottom: 48rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #606266;
  margin-bottom: 24rpx;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.filter-option {
  padding: 16rpx 32rpx;
  border-radius: 8rpx;
  background: #f5f7fa;
  color: #606266;
  font-size: 28rpx;
  transition: all 0.3s ease;

  &.active {
    background: #3c9cff;
    color: #ffffff;
  }

  &:active {
    transform: scale(0.95);
  }
}

.modal-footer {
  display: flex;
  padding: 32rpx;
  border-top: 1px solid #ebeef5;
  gap: 16rpx;
}
</style>

