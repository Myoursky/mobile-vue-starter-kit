// eslint-disable-next-line import/no-absolute-path
import type { GlobConfig } from '/#/config'

import { getAppEnvConfig } from '@/utils/env'

const useGlobSetting = (): Readonly<GlobConfig> => {
  const { VITE_GLOB_API_URL, VITE_GLOB_API_URL_PREFIX } = getAppEnvConfig()

  // Take global configuration
  const glob: Readonly<GlobConfig> = {
    apiUrl: VITE_GLOB_API_URL,
    urlPrefix: VITE_GLOB_API_URL_PREFIX
  }
  return glob as Readonly<GlobConfig>
}

export default useGlobSetting
