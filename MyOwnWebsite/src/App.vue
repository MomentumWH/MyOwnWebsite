<script setup lang="ts">
import { NMessageProvider,NDialogProvider } from 'naive-ui'
import Home from './views/Home.vue'
</script>

<template>
    <n-message-provider>
      <n-dialog-provider>
        <RouterView />
      </n-dialog-provider>
    </n-message-provider>
</template>
