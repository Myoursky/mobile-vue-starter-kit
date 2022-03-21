export interface GlobConfig {
  apiUrl: string
  urlPrefix?: string
}

export interface GlobEnvConfig {
  // 端口号
  VITE_PORT: number
  // 接口地址
  VITE_GLOB_API_URL: string
  // 接口前缀
  VITE_GLOB_API_URL_PREFIX?: string
  // 图片上传地址
  VITE_GLOB_UPLOAD_URL?: string
  // 图片前缀地址
  VITE_GLOB_IMG_URL?: string
}
