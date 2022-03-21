/* eslint-disable no-param-reassign */
import axios, { AxiosResponse } from 'axios'
import { Dialog } from 'vant'
import { RequestEnum, ResultEnum } from '@/enums/httpEnum'
import { useUserStoreWidthOut } from '@/store/modules/user'
import { AxiosTransform, RequestOptions, Result } from './types'
import { isUrl, isString } from '../is'
import { joinTimestamp, formatRequestDate, setObjToUrlParams } from '../util'
import checkStatus from './checkStatus'

declare type Recordable<T = any> = Record<string, T> // TODO 如何全局声明

const transform: AxiosTransform = {
  /**
   * @description: 处理请求数据
   */
  transformRequestData: (res: AxiosResponse<Result>, options: RequestOptions) => {
    const {
      isShowMessage = true,
      isShowErrorMessage,
      isShowSuccessMessage,
      successMessageText,
      errorMessageText,
      isTransformResponse,
      isReturnNativeResponse
    } = options

    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse) {
      return res
    }
    // 不进行任何处理，直接返回
    // 用于页面代码可能需要直接获取code，data，message这些信息时开启
    if (!isTransformResponse) {
      return res.data
    }

    const { data } = res

    if (!data) {
      // return '[HTTP] Request has no return value';
      throw new Error('请求出错，请稍候重试')
    }
    //  这里 code，result，message为 后台统一的字段，需要修改为项目自己的接口返回格式
    const { code, result, message } = data
    // 请求成功
    const hasSuccess = data && Reflect.has(data, 'code') && code === ResultEnum.SUCCESS
    // 是否显示提示信息 现在提示信息暂时都用Vant-Dialog提示
    if (isShowMessage) {
      if (hasSuccess && (successMessageText || isShowSuccessMessage)) {
        // 是否显示自定义信息提示
        Dialog({ message: successMessageText || message || '操作成功！' })
      } else if (!hasSuccess && (errorMessageText || isShowErrorMessage)) {
        // 是否显示自定义信息提示
        Dialog({ message: message || errorMessageText || '操作失败！' })
      } else if (!hasSuccess && options.errorMessageMode === 'modal') {
        // errorMessageMode=‘custom-modal’的时候会显示modal错误弹窗，而不是消息提示，用于一些比较重要的错误
        Dialog({ message })
      }
    }

    // 接口请求成功，直接返回结果
    if (code === ResultEnum.SUCCESS) {
      return result
    }
    // 接口请求错误，统一提示错误信息 这里逻辑可以根据项目进行修改
    const errorMsg = message
    switch (code) {
      // 请求失败
      case ResultEnum.ERROR:
        Dialog({ message: errorMsg })
        break
      // 登录超时
      case ResultEnum.TIMEOUT:
        // TODO 此处应该跳转到登陆页面
        Dialog({ message: '登陆超时！' })
        break
      default:
        Dialog({ message: errorMsg })
    }
    throw new Error(errorMsg)
  },

  // 请求之前处理config
  beforeRequestHook: (config, options) => {
    const { apiUrl, joinPrefix, joinParamsToUrl, formatDate, joinTime = true, urlPrefix } = options

    const isUrlStr = isUrl(config.url as string)

    if (!isUrlStr && joinPrefix) {
      config.url = `${urlPrefix}${config.url}`
    }

    if (!isUrlStr && apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`
    }
    const params = config.params || {}
    const data = config.data || false
    if (config.method?.toUpperCase() === RequestEnum.GET) {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false))
      } else {
        // 兼容restful风格
        config.url = `${config.url + params}${joinTimestamp(joinTime, true)}`
        config.params = undefined
      }
    } else if (!isString(params)) {
      if (formatDate) formatRequestDate(params)
      if (Reflect.has(config, 'data') && config.data && Object.keys(config.data).length > 0) {
        config.data = data
        config.params = params
      } else {
        config.data = params
        config.params = undefined
      }
      if (joinParamsToUrl) {
        config.url = setObjToUrlParams(config.url as string, { ...config.params, ...config.data })
      }
    } else {
      // 兼容restful风格
      config.url += params
      config.params = undefined
    }
    return config
  },

  /**
   * @description: 请求拦截器处理
   */
  requestInterceptors: (config, options) => {
    // 请求之前处理config
    const userStore = useUserStoreWidthOut()
    const token = userStore.getToken
    if (token && (config as Recordable)?.requestOptions?.withToken !== false) {
      // jwt token TODO 语法不理解
      if ((config as Recordable)?.options?.authenticationScheme) {
        ;(
          config as Recordable
        ).headers.Authorization = `${options.requestOptions?.authenticationScheme} ${token}`
      } else {
        ;(config as Recordable).headers.Authorization = token
      }
    }
    return config
  },

  /**
   * @description: 响应错误处理
   */
  responseInterceptorsCatch: (error: any) => {
    const { response, code, message } = error || {}
    // TODO 此处要根据后端接口返回格式修改
    const msg: string =
      response && response.data && response.data.message ? response.data.message : ''
    const err: string = error.toString()
    try {
      if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
        Dialog({
          message: '接口请求超时，请刷新页面重试!'
        })
        return false
      }
      if (err && err.includes('Network Error')) {
        Dialog({
          title: '网络异常',
          message: '请检查您的网络连接是否正常!'
        })
        return Promise.reject(error)
      }
    } catch (catchError) {
      throw new Error(catchError as any)
    }
    // 请求是否被取消
    const isCancel = axios.isCancel(error)
    if (!isCancel) {
      checkStatus(error.response && error.response.status, msg)
    } else {
      // eslint-disable-next-line no-console
      console.warn(error, '请求被取消！')
    }
    // return Promise.reject(error);
    return Promise.reject(response?.data)
  }
}

export default transform
