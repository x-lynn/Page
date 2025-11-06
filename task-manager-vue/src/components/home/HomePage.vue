<template>
  <div class="page-container fade-in">
    <el-page-header>
      <template #content>
        <div class="page-header">
          <h1 class="page-title">🏠 首页</h1>
          <p class="page-subtitle">欢迎使用任务管理系统</p>
        </div>
      </template>
    </el-page-header>
    
    <el-row :gutter="20" class="mt-4">
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header-icon">📊</div>
          </template>
          <h3>任务统计</h3>
          <el-text type="info">查看任务完成情况</el-text>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header-icon">⚡</div>
          </template>
          <h3>快速操作</h3>
          <el-text type="info">创建新任务</el-text>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header-icon">📈</div>
          </template>
          <h3>数据分析</h3>
          <el-text type="info">查看任务趋势</el-text>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
</script>

<style scoped>
.card-header-icon {
  font-size: 2em;
  text-align: center;
}

.mt-4 {
  margin-top: 16px;
}
</style>
