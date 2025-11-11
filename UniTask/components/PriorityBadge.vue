<template>
  <view class="priority-badge" :class="`priority-${priority.toLowerCase()}`">
    <text class="badge-text">{{ config.label }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { PRIORITY_CONFIG } from '../utils/constants'

const props = defineProps({
  priority: {
    type: String,
    required: true,
    validator: (value) => ['Low', 'Medium', 'High'].includes(value)
  }
})

const config = computed(() => PRIORITY_CONFIG[props.priority] || PRIORITY_CONFIG.Medium)
</script>

<style lang="scss" scoped>
.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-size: 20rpx;
  font-weight: 500;

  &.priority-low {
    background-color: #f4f4f5;
    color: #909399;
  }

  &.priority-medium {
    background-color: #ecf5ff;
    color: #409eff;
  }

  &.priority-high {
    background-color: #fef0f0;
    color: #f56c6c;
  }
}

.badge-text {
  line-height: 1;
}
</style>

