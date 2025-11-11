/**
 * Supabase 客户端初始化和认证管理
 */
import { createClient } from '@supabase/supabase-js'
import { getEnvVar } from './settings'

// Supabase 配置为系统级设置，从环境变量获取
const SUPABASE_URL = getEnvVar('VUE_APP_SUPABASE_URL')
const SUPABASE_ANON_KEY = getEnvVar('VUE_APP_SUPABASE_ANON_KEY')

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase 配置缺失，请检查环境变量 VUE_APP_SUPABASE_URL 和 VUE_APP_SUPABASE_ANON_KEY')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  // 针对 uni-app 环境的特殊配置
  auth: {
    // 核心：通过本地存储机制实现设备身份持久化
    persistSession: true, // 保持匿名会话的持久性，Supabase 会在本地存储一个 token
    storage: {
      // uni-app 适配器：将 Supabase 的存储操作映射到 uni.setStorageSync/uni.getStorageSync
      getItem: (key) => {
        try {
          return uni.getStorageSync(key)
        } catch (e) {
          console.error('获取存储失败:', e)
          return null
        }
      },
      setItem: (key, value) => {
        try {
          uni.setStorageSync(key, value)
        } catch (e) {
          console.error('设置存储失败:', e)
        }
      },
      removeItem: (key) => {
        try {
          uni.removeStorageSync(key)
        } catch (e) {
          console.error('删除存储失败:', e)
        }
      },
    }
  }
})

/**
 * 自动静默登录：
 * 1. 检查是否存在活跃会话（即本地存储中是否有有效的匿名 token）。
 * 2. 如果不存在，则调用 signInAnonymously() 创建一个新的匿名用户，并将其 UUID 存储在设备本地。
 * 3. 任何数据操作都必须等待此过程完成后才能进行。
 */
export async function ensureAuth() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('获取会话失败:', sessionError)
      throw sessionError
    }
    
    if (!session) {
      // 如果没有会话，自动进行匿名登录
      const { data, error } = await supabase.auth.signInAnonymously()
      
      if (error) {
        console.error('自动匿名登录失败:', error.message)
        throw error
      }
      
      console.log('匿名登录成功，用户ID:', data.user?.id)
      return data.user
    }
    
    return session.user
  } catch (error) {
    console.error('认证过程出错:', error)
    throw error
  }
}

/**
 * 获取当前用户ID
 * @returns {Promise<string|null>} 用户ID
 */
export async function getCurrentUserId() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id || null
  } catch (error) {
    console.error('获取用户ID失败:', error)
    return null
  }
}

/**
 * 登出当前用户
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return true
  } catch (error) {
    console.error('登出失败:', error)
    throw error
  }
}

