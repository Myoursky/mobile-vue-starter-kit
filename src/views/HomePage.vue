<template>
  <div class="about">
    <h1>This is an about page111</h1>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

userStore.getInfo()
</script>

<style scoped>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
