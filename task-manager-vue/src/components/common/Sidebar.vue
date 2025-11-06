<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h1>📋 任务管理</h1>
    </div>
    <div class="sidebar-menu">
      <div 
        v-for="item in menuItems" 
        :key="item.path"
        class="menu-item" 
        :class="{ active: currentRoute === item.path }"
        @click="navigate(item.path)"
      >
        <span class="menu-item-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { path: '/home', label: '首页', icon: '🏠' },
  { path: '/tasks', label: '每日任务列表', icon: '📝' },
  { path: '/settings', label: '设置', icon: '⚙️' }
]

const currentRoute = computed(() => route.path)

const navigate = (path) => {
  router.push(path)
}
</script>

