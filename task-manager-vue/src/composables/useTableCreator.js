import { useSupabase } from './useSupabase'
import { useConfig } from './useUtils'

export function useTableCreator() {
  const { createServiceClient, url } = useSupabase()
  const { loadConfig } = useConfig()

  const checkExecDdlFunction = async (serviceKey, supabaseUrl) => {
    try {
      const serviceClient = createServiceClient(serviceKey)
      const { data, error: testError } = await serviceClient.rpc('exec_ddl', {
        sql_text: 'SELECT 1;'
      })

      if (!testError) {
        console.log('exec_ddl 函数存在，检查通过')
        return true
      }

      console.log('exec_ddl 函数检查错误:', testError)
      const isFunctionNotFound = 
        testError.code === '42883' ||
        testError.code === 'P0001' ||
        testError.message?.toLowerCase().includes('function') ||
        testError.message?.toLowerCase().includes('does not exist') ||
        testError.message?.toLowerCase().includes('不存在')

      if (isFunctionNotFound) {
        console.log('exec_ddl 函数不存在')
        return false
      }

      console.warn('exec_ddl 函数检查时出现其他错误:', testError)
      return false
    } catch (error) {
      console.error('检查 exec_ddl 函数异常:', error)
      return false
    }
  }

  const createTasksTable = async (statusElementId = 'tableStatus') => {
    const config = loadConfig()
    let serviceKey = config?.serviceKey || ''
    
    if (!serviceKey) {
      const settingsServiceKey = document.getElementById('settingsServiceKey')
      if (settingsServiceKey) {
        serviceKey = settingsServiceKey.value.trim()
        statusElementId = 'settingsStatus'
      }
    }
    
    if (!serviceKey) {
      const { useStatus } = await import('./useUtils')
      const { showStatus } = useStatus(statusElementId)
      showStatus('⚠️ 请先在设置页面填写 Service Role Key', 'warning')
      return
    }

    const supabaseUrl = url.value || config?.url || ''
    if (!supabaseUrl) {
      const { useStatus } = await import('./useUtils')
      const { showStatus } = useStatus(statusElementId)
      showStatus('⚠️ 请先配置 Supabase URL 和 Service Role Key', 'error')
      return
    }

    try {
      const functionExists = await checkExecDdlFunction(serviceKey, supabaseUrl)

      if (!functionExists) {
        // 显示创建函数的提示
        showCreateFunctionPrompt(statusElementId, serviceKey, supabaseUrl)
        return
      }

      await executeCreateTable(serviceKey, supabaseUrl, statusElementId)
    } catch (error) {
      console.error('创建任务表失败:', error)
      const { useStatus } = await import('./useUtils')
      const { showStatus } = useStatus(statusElementId)
      showStatus(`❌ 创建任务表失败: ${error.message}`, 'error')
    }
  }

  const showCreateFunctionPrompt = (statusElementId, serviceKey, supabaseUrl) => {
    const createFunctionSQL = `CREATE OR REPLACE FUNCTION exec_ddl(sql_text text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE sql_text;
END;
$$;`

    const statusDiv = document.getElementById(statusElementId)
    if (!statusDiv) return
    
    const sqlId = 'create-function-' + Date.now()
    statusDiv.innerHTML = `
      <div class="status info">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong>⚠️ 需要先创建 exec_ddl 函数（只需执行一次）：</strong>
          <button class="btn btn-sm" onclick="window.copySQL('${sqlId}')">📋 复制 SQL</button>
        </div>
        <pre id="${sqlId}" style="background: var(--light-bg); padding: 15px; border-radius: 5px; font-family: monospace; font-size: 0.9em; white-space: pre-wrap;">${createFunctionSQL}</pre>
        <div style="font-size: 0.9em; color: var(--text-secondary); margin-top: 10px;">
          请在 Supabase Dashboard → SQL Editor 中手动执行上述 SQL，然后再次点击"创建任务表"按钮
        </div>
      </div>
    `
    
    window.currentSQL = createFunctionSQL
    window.copySQL = async (id) => {
      const { copyToClipboard } = await import('./useUtils')
      const sql = window.currentSQL || document.getElementById(id)?.textContent
      if (sql) {
        const success = await copyToClipboard(sql)
        if (success) {
          const btn = document.querySelector(`button[onclick*="${id}"]`)
          if (btn) {
            const originalText = btn.textContent
            btn.textContent = '✅ 已复制'
            btn.style.background = '#28a745'
            setTimeout(() => {
              btn.textContent = originalText
              btn.style.background = ''
            }, 2000)
          }
        }
      }
    }
  }

  const executeCreateTable = async (serviceKey, supabaseUrl, statusElementId) => {
    const { useStatus } = await import('./useUtils')
    const { showStatus } = useStatus(statusElementId)
    
    showStatus('⏳ 正在创建任务表...', 'info')

    const sqlStatements = [
      `CREATE TABLE IF NOT EXISTS daily_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)`,
      `CREATE INDEX IF NOT EXISTS idx_daily_tasks_status ON daily_tasks(status)`,
      `CREATE INDEX IF NOT EXISTS idx_daily_tasks_due_date ON daily_tasks(due_date)`,
      `CREATE INDEX IF NOT EXISTS idx_daily_tasks_created_at ON daily_tasks(created_at)`,
      `COMMENT ON TABLE daily_tasks IS '每日任务表'`
    ]

    try {
      const serviceClient = createServiceClient(serviceKey)
      
      showStatus('⏳ 正在创建表结构...', 'info')
      const { error: tableError } = await serviceClient.rpc('exec_ddl', {
        sql_text: sqlStatements[0]
      })

      if (tableError) {
        console.error('创建表失败:', tableError)
        showStatus(`❌ 创建表失败: ${tableError.message || tableError.code || JSON.stringify(tableError)}`, 'error')
        return
      }

      showStatus('⏳ 正在创建索引和注释...', 'info')
      for (let i = 1; i < sqlStatements.length; i++) {
        try {
          const { error: stmtError } = await serviceClient.rpc('exec_ddl', {
            sql_text: sqlStatements[i]
          })
          if (stmtError) {
            console.warn(`执行语句 ${i} 失败:`, stmtError)
          }
        } catch (err) {
          console.warn(`执行语句 ${i} 异常:`, err)
        }
      }

      showStatus('✅ 任务表创建成功！', 'success')
      setTimeout(() => {
        // 触发任务列表刷新
        window.dispatchEvent(new CustomEvent('refresh-tasks'))
      }, 1000)
    } catch (error) {
      console.error('创建任务表异常:', error)
      showStatus(`❌ 创建表失败: ${error.message || JSON.stringify(error)}`, 'error')
    }
  }

  return {
    createTasksTable
  }
}

