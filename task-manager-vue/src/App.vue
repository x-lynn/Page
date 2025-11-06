<template>
  <div id="app">
    <div class="admin-layout">
      <Sidebar />
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './components/common/Sidebar.vue'
</script>

