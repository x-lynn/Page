<template>
  <div id="app">
    <el-container class="admin-layout">
      <el-aside width="250px">
        <Sidebar />
      </el-aside>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import Sidebar from './components/common/Sidebar.vue'
</script>

<style>
#app {
  min-height: 100vh;
}

.admin-layout {
  min-height: 100vh;
}

.main-content {
  padding: 30px;
  background: #f5f6fa;
}
</style>
