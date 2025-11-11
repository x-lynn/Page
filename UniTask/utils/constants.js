/**
 * 应用常量定义
 */

// 任务类型
export const TASK_TYPE = {
  STANDARD: 'Standard',
  DAILY: 'Daily'
}

// 任务状态
export const TASK_STATUS = {
  TODO: 'Todo',
  DOING: 'Doing',
  DONE: 'Done'
}

// 任务优先级
export const TASK_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High'
}

// 优先级配置
export const PRIORITY_CONFIG = {
  [TASK_PRIORITY.LOW]: {
    label: '低',
    color: '#909399',
    bgColor: '#f4f4f5'
  },
  [TASK_PRIORITY.MEDIUM]: {
    label: '中',
    color: '#409eff',
    bgColor: '#ecf5ff'
  },
  [TASK_PRIORITY.HIGH]: {
    label: '高',
    color: '#f56c6c',
    bgColor: '#fef0f0'
  }
}

// 状态配置
export const STATUS_CONFIG = {
  [TASK_STATUS.TODO]: {
    label: '待办',
    color: '#909399',
    bgColor: '#f4f4f5'
  },
  [TASK_STATUS.DOING]: {
    label: '进行中',
    color: '#409eff',
    bgColor: '#ecf5ff'
  },
  [TASK_STATUS.DONE]: {
    label: '已完成',
    color: '#67c23a',
    bgColor: '#f0f9ff'
  }
}

// 任务类型配置
export const TASK_TYPE_CONFIG = {
  [TASK_TYPE.STANDARD]: {
    label: '标准任务',
    icon: '📋'
  },
  [TASK_TYPE.DAILY]: {
    label: '每日任务',
    icon: '🔄'
  }
}

