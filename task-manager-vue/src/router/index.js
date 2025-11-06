import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../components/home/HomePage.vue'
import TaskTable from '../components/tasks/TaskTable.vue'
import SettingsPage from '../components/settings/SettingsPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'home',
    component: HomePage
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: TaskTable
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsPage
  }
]

const router = createRouter({
  history: createWebHashHistory(), // 使用 hash 模式，适合 GitHub Pages
  routes
})

export default router

