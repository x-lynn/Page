<template>
  <div class="page-container fade-in">
    <div class="page-header">
      <h1 class="page-title">🏠 首页</h1>
      <p class="page-subtitle">欢迎使用任务管理系统</p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 30px;">
      <div class="card">
        <div style="font-size: 2em; margin-bottom: 10px;">📊</div>
        <h3 style="margin-bottom: 10px;">任务统计</h3>
        <p style="color: var(--text-secondary);">查看任务完成情况</p>
      </div>
      <div class="card">
        <div style="font-size: 2em; margin-bottom: 10px;">⚡</div>
        <h3 style="margin-bottom: 10px;">快速操作</h3>
        <p style="color: var(--text-secondary);">创建新任务</p>
      </div>
      <div class="card">
        <div style="font-size: 2em; margin-bottom: 10px;">📈</div>
        <h3 style="margin-bottom: 10px;">数据分析</h3>
        <p style="color: var(--text-secondary);">查看任务趋势</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

