import { defineStore } from 'pinia'
import { store } from '@/store'
import { createStorage } from '@/utils/Storage'
import ACCESS_TOKEN from '@/store/mutation-types'
import { getUserInfo } from '@/api/system/user'

const Storage = createStorage({ storage: localStorage })

export interface IUserState {
  token: string
  username: string
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): IUserState => ({
    token: Storage.get(ACCESS_TOKEN, ''),
    username: ''
  }),
  getters: {
    getToken(): string {
      return this.token
    },
    getNickname(): string {
      return this.username
    }
  },
  actions: {
    setToken(token: string) {
      this.token = token
    },
    // 获取用户信息
    getInfo() {
      return new Promise((resolve, reject) => {
        getUserInfo()
          .then((res) => {
            const result = res
            console.log(result)
            resolve(res)
          })
          .catch((error) => {
            reject(error)
          })
      })
    }
  }
})

// Need to be used outside the setup
export function useUserStoreWidthOut() {
  return useUserStore(store)
}
