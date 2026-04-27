<script setup lang="ts">
import vueLogo from "@/assets/vue.svg";
</script>

<template>
  <div class="about">
    <h1>About This Project</h1>
    <p>This is a Vue 3 project with Vite, Pinia, and Vue Router.</p>
    <img :src="vueLogo" alt="Vue logo" width="100" height="100" />
  </div>
</template>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
</style>
