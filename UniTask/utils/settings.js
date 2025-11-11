/**
 * 环境变量和配置管理
 */

/**
 * 获取环境变量
 * @param {string} key - 环境变量键名
 * @returns {string|null} 环境变量值
 */
export function getEnvVar(key) {
  // #ifdef H5
  return import.meta.env[key] || null
  // #endif
  
  // #ifdef MP-WEIXIN
  // 微信小程序中可以通过 process.env 或全局变量获取
  return process.env[key] || null
  // #endif
  
  // #ifdef APP-PLUS
  return process.env[key] || null
  // #endif
  
  return null
}

/**
 * 获取配置值（优先从环境变量，其次从本地存储）
 * @param {string} key - 配置键名
 * @param {any} defaultValue - 默认值
 * @returns {any} 配置值
 */
export function getConfig(key, defaultValue = null) {
  try {
    const value = uni.getStorageSync(key)
    return value !== '' ? value : defaultValue
  } catch (e) {
    console.error('获取配置失败:', e)
    return defaultValue
  }
}

/**
 * 设置配置值到本地存储
 * @param {string} key - 配置键名
 * @param {any} value - 配置值
 */
export function setConfig(key, value) {
  try {
    uni.setStorageSync(key, value)
  } catch (e) {
    console.error('保存配置失败:', e)
  }
}

