import { isObject, isString } from './is'

export const deepClone = (obj: any) => {
  if (obj === null) return null
  const clone = { ...obj }
  Object.keys(clone).forEach((key) => {
    if (typeof obj[key] === 'object') {
      clone[key] = deepClone(obj[key])
    } else {
      clone[key] = obj[key]
    }
  })
  if (Array.isArray(obj) && obj.length) {
    clone.length = obj.length
    return Array.from(clone)
  }
  return clone
}

export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  const keys = Object.keys(target)
  keys.forEach((key) => {
    if (isObject(src[key])) {
      // eslint-disable-next-line no-param-reassign
      src[key] = deepMerge(src[key], target[key])
    } else {
      // eslint-disable-next-line no-param-reassign
      src[key] = target[key]
    }
  })
  return src
}

export function joinTimestamp(join: boolean, restful = false): string | object {
  if (!join) {
    return restful ? '' : {}
  }
  const now = new Date().getTime()
  if (restful) {
    return `?_t=${now}`
  }
  return { _t: now }
}

declare type Recordable<T = any> = Record<string, T> // TODO 如何全局声明
/**
 * @description: Format request parameter time
 */
export function formatRequestDate(params: Recordable) {
  const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm'
  if (Object.prototype.toString.call(params) !== '[object Object]') {
    return
  }
  const keys = Object.keys(params)
  keys.forEach((key) => {
    /* eslint no-underscore-dangle: ["error", { "allow": ["_isAMomentObject"] }] */
    if (params[key] && params[key]._isAMomentObject) {
      // eslint-disable-next-line no-param-reassign
      params[key] = params[key].format(DATE_TIME_FORMAT)
    }
    if (isString(key)) {
      const value = params[key]
      if (value) {
        try {
          // eslint-disable-next-line no-param-reassign
          params[key] = isString(value) ? value.trim() : value
        } catch (error) {
          throw new Error(error as any)
        }
      }
    }
    if (isObject(params[key])) {
      formatRequestDate(params[key])
    }
  })
}

/**
 * 将对象添加当作参数拼接到URL上面
 * @param baseUrl 需要拼接的url
 * @param obj 参数对象
 * @returns {string} 拼接后的对象
 * 例子:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: any): string {
  let parameters = ''
  let url = ''
  const keys = Object.keys(obj)
  keys.forEach((key) => {
    // parameters += `${key}=${encodeURIComponent(obj[key])}&`
    parameters += `${key}=${encodeURIComponent(obj[key])}&`
  })
  parameters = parameters.replace(/&$/, '')
  if (/\?$/.test(baseUrl)) {
    url = baseUrl + parameters
  } else {
    url = baseUrl.replace(/\/?$/, '?') + parameters
  }
  return url
}
