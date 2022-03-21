import { createApp } from 'vue'
import router from '@/router'
import App from '@/App.vue'
import setupVant from '@/plugins/index'
import { setupStore } from '@/store'

const app = createApp(App)

// 注册Vant组件
setupVant(app)

// 状态管理
setupStore(app)

app.use(router)

app.mount('#app')
