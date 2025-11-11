<template>
  <view id="app">
    <view class="app-container"></view>
  </view>
</template>

<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { ensureAuth } from './utils/supabase'

onLaunch(() => {
  console.log('App Launch')
  // 应用启动时确保用户已认证
  ensureAuth().catch(err => {
    console.error('认证初始化失败:', err)
    uni.showToast({
      title: '初始化失败，请重试',
      icon: 'none'
    })
  })
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
/* 引入全局样式 */
@import './styles/common.scss';

#app {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.app-container {
  width: 100%;
  min-height: 100vh;
}
</style>

