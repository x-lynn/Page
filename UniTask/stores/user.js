/**
 * 用户管理 Store
 */
import { defineStore } from 'pinia'
import { supabase, getCurrentUserId } from '../utils/supabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    userProfile: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    nickname: (state) => state.userProfile?.nickname || '匿名用户',
    showdocPushLink: (state) => state.userProfile?.showdoc_push_link || ''
  },

  actions: {
    /**
     * 初始化用户信息
     */
    async initUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          this.user = session.user
          await this.fetchUserProfile()
        }
      } catch (error) {
        console.error('初始化用户失败:', error)
        this.error = error.message
      }
    },

    /**
     * 获取用户资料
     */
    async fetchUserProfile() {
      this.loading = true
      this.error = null

      try {
        const userId = await getCurrentUserId()
        if (!userId) {
          throw new Error('用户未登录')
        }

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          // 如果用户资料不存在，创建默认资料
          if (error.code === 'PGRST116') {
            await this.createUserProfile()
            return
          }
          throw error
        }

        this.userProfile = data
      } catch (error) {
        console.error('获取用户资料失败:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    /**
     * 创建用户资料
     */
    async createUserProfile() {
      try {
        const userId = await getCurrentUserId()
        if (!userId) {
          throw new Error('用户未登录')
        }

        const newProfile = {
          id: userId,
          nickname: '匿名用户',
          showdoc_push_link: null
        }

        const { data, error } = await supabase
          .from('users')
          .insert([newProfile])
          .select()
          .single()

        if (error) throw error

        this.userProfile = data
      } catch (error) {
        console.error('创建用户资料失败:', error)
        throw error
      }
    },

    /**
     * 更新用户资料
     */
    async updateUserProfile(updates) {
      try {
        const userId = await getCurrentUserId()
        if (!userId) {
          throw new Error('用户未登录')
        }

        const { data, error } = await supabase
          .from('users')
          .update({
            ...updates,
            last_activity: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single()

        if (error) throw error

        this.userProfile = data
        return data
      } catch (error) {
        console.error('更新用户资料失败:', error)
        uni.showToast({
          title: '更新失败',
          icon: 'none'
        })
        throw error
      }
    },

    /**
     * 更新昵称
     */
    async updateNickname(nickname) {
      return this.updateUserProfile({ nickname })
    },

    /**
     * 更新 Showdoc 推送链接
     */
    async updateShowdocPushLink(link) {
      return this.updateUserProfile({ showdoc_push_link: link || null })
    },

    /**
     * 登出
     */
    async signOut() {
      try {
        await supabase.auth.signOut()
        this.user = null
        this.userProfile = null
      } catch (error) {
        console.error('登出失败:', error)
        throw error
      }
    }
  }
})

