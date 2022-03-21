import type { App } from 'vue'
import { Button, Image as VanImage, Icon, Toast } from 'vant'

const components = [Button, VanImage, Icon, Toast]

export default function setupVant(app: App<Element>) {
  components.forEach((component) => app.use(component))
}
