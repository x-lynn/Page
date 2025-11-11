/**
 * 任务管理 Store
 */
import { defineStore } from 'pinia'
import { supabase, getCurrentUserId } from '../utils/supabase'
import { TASK_TYPE, TASK_STATUS, TASK_PRIORITY } from '../utils/constants'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
    filters: {
      status: null,
      priority: null,
      taskType: null,
      isArchived: false
    }
  }),

  getters: {
    // 标准任务列表
    standardTasks: (state) => {
      return state.tasks.filter(
        task => task.task_type === TASK_TYPE.STANDARD && !task.is_archived
      )
    },

    // 每日任务列表
    dailyTasks: (state) => {
      return state.tasks.filter(
        task => task.task_type === TASK_TYPE.DAILY && !task.is_archived
      )
    },

    // 已归档任务
    archivedTasks: (state) => {
      return state.tasks.filter(task => task.is_archived)
    },

    // 按状态筛选的任务
    tasksByStatus: (state) => {
      const { status } = state.filters
      const tasks = state.filters.isArchived ? state.archivedTasks : state.standardTasks
      
      if (!status) return tasks
      return tasks.filter(task => task.status === status)
    },

    // 按优先级筛选的任务
    filteredTasks: (state) => {
      let tasks = state.tasksByStatus
      const { priority, taskType } = state.filters

      if (priority) {
        tasks = tasks.filter(task => task.priority === priority)
      }

      if (taskType) {
        tasks = tasks.filter(task => task.task_type === taskType)
      }

      return tasks
    }
  },

  actions: {
    /**
     * 获取所有任务
     */
    async fetchTasks() {
      this.loading = true
      this.error = null

      try {
        const userId = await getCurrentUserId()
        if (!userId) {
          throw new Error('用户未登录')
        }

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        this.tasks = data || []
      } catch (error) {
        console.error('获取任务失败:', error)
        this.error = error.message
        uni.showToast({
          title: '获取任务失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 创建任务
     */
    async createTask(taskData) {
      try {
        const userId = await getCurrentUserId()
        if (!userId) {
          throw new Error('用户未登录')
        }

        const newTask = {
          user_id: userId,
          title: taskData.title,
          description: taskData.description || null,
          due_date: taskData.due_date || null,
          task_type: taskData.task_type || TASK_TYPE.STANDARD,
          priority: taskData.priority || TASK_PRIORITY.MEDIUM,
          status: taskData.status || TASK_STATUS.TODO,
          is_archived: false
        }

        const { data, error } = await supabase
          .from('tasks')
          .insert([newTask])
          .select()
          .single()

        if (error) throw error

        this.tasks.unshift(data)
        return data
      } catch (error) {
        console.error('创建任务失败:', error)
        uni.showToast({
          title: '创建任务失败',
          icon: 'none'
        })
        throw error
      }
    },

    /**
     * 更新任务
     */
    async updateTask(taskId, updates) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .update(updates)
          .eq('id', taskId)
          .select()
          .single()

        if (error) throw error

        const index = this.tasks.findIndex(t => t.id === taskId)
        if (index !== -1) {
          this.tasks[index] = data
        }

        return data
      } catch (error) {
        console.error('更新任务失败:', error)
        uni.showToast({
          title: '更新任务失败',
          icon: 'none'
        })
        throw error
      }
    },

    /**
     * 删除任务
     */
    async deleteTask(taskId) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId)

        if (error) throw error

        this.tasks = this.tasks.filter(t => t.id !== taskId)
      } catch (error) {
        console.error('删除任务失败:', error)
        uni.showToast({
          title: '删除任务失败',
          icon: 'none'
        })
        throw error
      }
    },

    /**
     * 归档任务
     */
    async archiveTask(taskId) {
      return this.updateTask(taskId, { is_archived: true })
    },

    /**
     * 取消归档任务
     */
    async unarchiveTask(taskId) {
      return this.updateTask(taskId, { is_archived: false })
    },

    /**
     * 更新任务状态
     */
    async updateTaskStatus(taskId, status) {
      return this.updateTask(taskId, { status })
    },

    /**
     * 重置每日任务状态
     */
    async resetDailyTasks() {
      try {
        const userId = await getCurrentUserId()
        if (!userId) {
          throw new Error('用户未登录')
        }

        const { error } = await supabase
          .from('tasks')
          .update({ status: TASK_STATUS.TODO })
          .eq('user_id', userId)
          .eq('task_type', TASK_TYPE.DAILY)
          .eq('is_archived', false)

        if (error) throw error

        // 更新本地状态
        this.tasks.forEach(task => {
          if (task.task_type === TASK_TYPE.DAILY && !task.is_archived) {
            task.status = TASK_STATUS.TODO
          }
        })

        uni.showToast({
          title: '每日任务已重置',
          icon: 'success'
        })
      } catch (error) {
        console.error('重置每日任务失败:', error)
        uni.showToast({
          title: '重置失败',
          icon: 'none'
        })
        throw error
      }
    },

    /**
     * 设置筛选条件
     */
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    /**
     * 清除筛选条件
     */
    clearFilters() {
      this.filters = {
        status: null,
        priority: null,
        taskType: null,
        isArchived: false
      }
    }
  }
})

