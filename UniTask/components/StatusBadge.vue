<template>
  <view class="status-badge" :class="`status-${status.toLowerCase()}`">
    <text class="badge-text">{{ config.label }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { STATUS_CONFIG } from '../utils/constants'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['Todo', 'Doing', 'Done'].includes(value)
  }
})

const config = computed(() => STATUS_CONFIG[props.status] || STATUS_CONFIG.Todo)
</script>

<style lang="scss" scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-size: 20rpx;
  font-weight: 500;

  &.status-todo {
    background-color: #f4f4f5;
    color: #909399;
  }

  &.status-doing {
    background-color: #ecf5ff;
    color: #409eff;
  }

  &.status-done {
    background-color: #f0f9ff;
    color: #67c23a;
  }
}

.badge-text {
  line-height: 1;
}
</style>

