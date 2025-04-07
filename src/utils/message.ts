/**
 * 消息提示工具
 * 提供统一的消息提示功能
 */
import { ElMessage } from 'element-plus'

type MessageType = 'success' | 'warning' | 'info' | 'error'

/**
 * 显示消息提示
 * @param message 消息内容
 * @param type 消息类型
 * @param duration 显示时长（毫秒）
 */
export function showMessage(message: string, type: MessageType = 'info', duration = 5000) {
  ElMessage({
    message,
    type,
    duration,
    showClose: true,
    center: true,
    offset: 100,
  })
}

/**
 * 显示成功消息
 * @param message 消息内容
 */
export function showSuccess(message: string) {
  showMessage(`🎉 ${message}`, 'success')
}

/**
 * 显示错误消息
 * @param message 消息内容
 */
export function showError(message: string) {
  showMessage(`❌ ${message}`, 'error')
}

/**
 * 显示警告消息
 * @param message 消息内容
 */
export function showWarning(message: string) {
  showMessage(`⚠️ ${message}`, 'warning')
}

/**
 * 显示提示消息
 * @param message 消息内容
 */
export function showInfo(message: string) {
  showMessage(`ℹ️ ${message}`, 'info')
}
