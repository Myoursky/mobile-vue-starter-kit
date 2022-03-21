import http from '@/utils/http'

export interface BasicResponseModel<T = any> {
  code: number
  message: string
  data: any
  success: boolean
  timestamp: number
  result: T
}

/**
 * @description: 获取用户信息
 */
export function getUserInfo() {
  return http.request({
    url: '/user',
    method: 'get'
  })
}
