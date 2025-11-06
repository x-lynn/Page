import { createClient } from '@supabase/supabase-js'
import { ref } from 'vue'

const client = ref(null)
const url = ref('')
const key = ref('')
const serviceKey = ref('')

export function useSupabase() {
  // 初始化客户端
  const init = (supabaseUrl, supabaseKey) => {
    url.value = supabaseUrl
    key.value = supabaseKey
    client.value = createClient(supabaseUrl, supabaseKey)
    return client.value
  }

  // 获取客户端
  const getClient = () => {
    return client.value
  }

  // 创建服务端客户端（使用 Service Role Key）
  const createServiceClient = (serviceRoleKey) => {
    serviceKey.value = serviceRoleKey
    return createClient(url.value, serviceRoleKey)
  }

  // 测试连接
  const testConnection = async (tableName = 'daily_tasks') => {
    if (!client.value) {
      throw new Error('客户端未初始化')
    }

    try {
      const { data, error } = await client.value
        .from(tableName)
        .select('count')
        .limit(1)

      const isTableNotFound = error && (
        error.code === 'PGRST116' ||
        error.message.includes("Could not find the table") ||
        (error.message.includes("relation") && error.message.includes("does not exist"))
      )

      return {
        success: !error || isTableNotFound,
        error: isTableNotFound ? null : error,
        tableExists: !isTableNotFound
      }
    } catch (error) {
      return {
        success: false,
        error: error,
        tableExists: false
      }
    }
  }

  return {
    client,
    url,
    key,
    serviceKey,
    init,
    getClient,
    createServiceClient,
    testConnection
  }
}

