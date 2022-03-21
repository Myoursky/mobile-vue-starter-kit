import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios'
import { deepClone } from '@/utils/util'
import { isFunction } from '@/utils/is'
import AxiosCanceler from './AxiosCanceler'

import type { RequestOptions, CreateAxiosOptions, Result } from './types'

/**
 * @description:  axios模块
 */
class VAxios {
  private axiosInstance: AxiosInstance

  private options: CreateAxiosOptions

  constructor(options: CreateAxiosOptions) {
    this.options = options
    this.axiosInstance = axios.create(options)
    this.setupInterceptors()
  }

  private getTransform() {
    const { transform } = this.options
    return transform
  }

  /**
   * @description: 拦截器配置
   */
  private setupInterceptors() {
    const transform = this.getTransform()
    if (!transform) {
      return
    }
    const {
      requestInterceptors,
      requestInterceptorsCatch,
      responseInterceptors,
      responseInterceptorsCatch
    } = transform

    const axiosCanceler = new AxiosCanceler()

    // 请求拦截器配置处理
    this.axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
      const ignoreCancel = this.options.requestOptions?.ignoreCancelToken
      if (!ignoreCancel) axiosCanceler.addPending(config)
      if (requestInterceptors && isFunction(requestInterceptors)) {
        // eslint-disable-next-line no-param-reassign
        config = requestInterceptors(config, this.options)
      }
      return config
    }, undefined)

    // 请求拦截器错误捕获
    if (requestInterceptorsCatch && isFunction(requestInterceptorsCatch))
      this.axiosInstance.interceptors.request.use(undefined, requestInterceptorsCatch)

    // 响应结果拦截器处理
    this.axiosInstance.interceptors.response.use((res: AxiosResponse<any>) => {
      if (res) axiosCanceler.removePending(res.config)
      if (responseInterceptors && isFunction(responseInterceptors)) {
        // eslint-disable-next-line no-param-reassign
        res = responseInterceptors(res)
      }
      return res
    }, undefined)

    // 响应结果拦截器错误捕获
    if (responseInterceptorsCatch && isFunction(responseInterceptorsCatch))
      this.axiosInstance.interceptors.response.use(undefined, responseInterceptorsCatch)
  }

  getAxios(): AxiosInstance {
    return this.axiosInstance
  }

  /**
   * @description:  创建axios实例
   */
  private createAxios(config: CreateAxiosOptions): void {
    this.axiosInstance = axios.create(config)
  }

  /**
   * @description: 重新配置axios
   */
  configAxios(config: CreateAxiosOptions) {
    if (!this.axiosInstance) {
      return
    }
    this.createAxios(config)
  }

  /**
   * @description: 设置通用header
   */
  setHeader(headers: any): void {
    if (!this.axiosInstance) {
      return
    }
    Object.assign(this.axiosInstance.defaults.headers, headers)
  }

  /**
   * @description:   请求方法
   */
  request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    let conf: AxiosRequestConfig = deepClone(config)
    const transform = this.getTransform()

    const { requestOptions } = this.options

    const opt: RequestOptions = { ...requestOptions, ...options }

    const { beforeRequestHook, requestCatch, transformRequestData } = transform || {}
    if (beforeRequestHook && isFunction(beforeRequestHook)) {
      conf = beforeRequestHook(conf, opt)
    }

    // 这里重新 赋值成最新的配置
    // @ts-ignore
    conf.requestOptions = opt

    return new Promise((resolve, reject) => {
      this.axiosInstance
        .request<any, AxiosResponse<Result>>(conf) // <>内容啥意思
        .then((res: AxiosResponse<Result>) => {
          // 请求是否被取消
          const isCancel = axios.isCancel(res)
          if (transformRequestData && isFunction(transformRequestData) && !isCancel) {
            try {
              const ret = transformRequestData(res, opt)
              resolve(ret)
            } catch (err) {
              reject(err || new Error('request error!'))
            }
            return
          }
          resolve(res as unknown as Promise<T>)
        })
        .catch((e: Error) => {
          if (requestCatch && isFunction(requestCatch)) {
            reject(requestCatch(e))
            return
          }
          reject(e)
        })
    })
  }
}

export default VAxios
