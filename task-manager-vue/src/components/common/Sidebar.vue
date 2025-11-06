<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h1>📋 任务管理</h1>
    </div>
    <el-menu
      :default-active="currentRoute"
      class="sidebar-menu"
      router
      background-color="#2c3e50"
      text-color="#fff"
      active-text-color="#667eea"
    >
      <el-menu-item index="/home">
        <el-icon><House /></el-icon>
        <span>首页</span>
      </el-menu-item>
      <el-menu-item index="/tasks">
        <el-icon><Document /></el-icon>
        <span>每日任务列表</span>
      </el-menu-item>
      <el-menu-item index="/settings">
        <el-icon><Setting /></el-icon>
        <span>设置</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { House, Document, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const currentRoute = computed(() => route.path)
</script>

<style scoped>
.sidebar {
  height: 100vh;
  background: #2c3e50;
  display: flex;
  flex-direction: column;
}

.sidebar-menu {
  flex: 1;
  border-right: none;
}

.sidebar-header {
  padding: 20px;
  background: #1a252f;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h1 {
  color: white;
  font-size: 1.5em;
  margin: 0;
}

:deep(.el-menu-item) {
  height: 56px;
  line-height: 56px;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(102, 126, 234, 0.2) !important;
  border-left: 3px solid #667eea;
}
</style>
