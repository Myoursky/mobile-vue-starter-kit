import axios, { AxiosRequestConfig, Canceler } from 'axios'
import qs from 'qs'
import { isFunction } from '@/utils/is/index'

class AxiosCanceler {
  // 声明一个 Map 用于存储每个请求的标识 和 取消函数
  private pendingMap: Map<string, Canceler>

  constructor() {
    this.pendingMap = new Map<string, Canceler>()
  }

  static getPendingUrl = (config: AxiosRequestConfig) =>
    [config.method, config.url, qs.stringify(config.data), qs.stringify(config.params)].join('&')

  /**
   * 添加请求
   * @param {Object} config
   */
  addPending(config: AxiosRequestConfig) {
    this.removePending(config)
    const url = AxiosCanceler.getPendingUrl(config)
    // eslint-disable-next-line no-param-reassign
    config.cancelToken =
      config.cancelToken ||
      new axios.CancelToken((cancel) => {
        if (!this.pendingMap.has(url)) {
          // 如果 pending 中不存在当前请求，则添加进去
          this.pendingMap.set(url, cancel)
        }
      })
  }

  /**
   * @description: 清空所有pending
   */
  removeAllPending() {
    this.pendingMap.forEach((cancel) => {
      if (cancel && isFunction(cancel)) cancel()
    })
    this.pendingMap.clear()
  }

  /**
   * 移除请求
   * @param {Object} config
   */
  removePending(config: AxiosRequestConfig) {
    const url = AxiosCanceler.getPendingUrl(config)
    if (this.pendingMap.has(url)) {
      // 如果在 pending 中存在当前请求标识，需要取消当前请求，并且移除
      const cancel = this.pendingMap.get(url)
      if (cancel) cancel(url)
      this.pendingMap.delete(url)
    }
  }

  /**
   * @description: 重置
   */
  reset(): void {
    this.pendingMap = new Map<string, Canceler>()
  }
}

export default AxiosCanceler
