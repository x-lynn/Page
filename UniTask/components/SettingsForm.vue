<template>
  <view class="settings-form">
    <view class="form-section">
      <text class="section-label">昵称</text>
      <input 
        class="form-input" 
        v-model="formData.nickname" 
        placeholder="请输入昵称"
        maxlength="20"
      />
    </view>

    <view class="form-section">
      <text class="section-label">Showdoc 推送链接</text>
      <input 
        class="form-input" 
        v-model="formData.showdocPushLink" 
        placeholder="请输入 Showdoc 推送链接（可选）"
        type="text"
      />
      <text class="section-hint">用于接收任务完成通知</text>
    </view>

    <view class="form-actions">
      <view class="btn btn-primary btn-block" @click="handleSave">保存</view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch } from 'vue'

const props = defineProps({
  nickname: {
    type: String,
    default: ''
  },
  showdocPushLink: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['save'])

const formData = ref({
  nickname: props.nickname,
  showdocPushLink: props.showdocPushLink
})

watch(() => [props.nickname, props.showdocPushLink], ([newNickname, newLink]) => {
  formData.value.nickname = newNickname
  formData.value.showdocPushLink = newLink
}, { immediate: true })

const handleSave = () => {
  if (!formData.value.nickname.trim()) {
    uni.showToast({
      title: '请输入昵称',
      icon: 'none'
    })
    return
  }

  emit('save', {
    nickname: formData.value.nickname.trim(),
    showdocPushLink: formData.value.showdocPushLink.trim() || null
  })
}
</script>

<style lang="scss" scoped>
.settings-form {
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

.form-input {
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

.section-hint {
  display: block;
  font-size: 24rpx;
  color: #909399;
  margin-top: 12rpx;
}

.form-actions {
  margin-top: 64rpx;
}
</style>

