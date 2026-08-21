<script setup lang="ts">
import { NMessageProvider, NDialogProvider } from "naive-ui";
import PageAgent from "@/features/page-agent/PageAgent.vue";
</script>

<template>
  <n-message-provider>
    <n-dialog-provider>
      <div class="route-stage">
        <RouterView v-slot="{ Component, route }">
          <Transition name="route-fade" mode="out-in">
            <div :key="route.path" class="route-frame">
              <component :is="Component" />
            </div>
          </Transition>
        </RouterView>
      </div>

      <PageAgent />
    </n-dialog-provider>
  </n-message-provider>
</template>

<style>
:root {
  --route-fade-enter-duration: 620ms;
  --route-fade-leave-duration: 380ms;
  --route-fade-enter-ease: cubic-bezier(0.16, 1, 0.3, 1);
  --route-fade-leave-ease: cubic-bezier(0.4, 0, 1, 1);
}

#app,
.route-stage,
.route-frame {
  min-height: 100vh;
}

#app {
  background: #16090d;
}

.route-stage {
  position: relative;
  isolation: isolate;
  overflow: clip;
  background:
    repeating-linear-gradient(90deg, transparent 0 88px, rgba(255, 177, 118, 0.04) 89px 90px),
    repeating-linear-gradient(0deg, transparent 0 88px, rgba(207, 55, 91, 0.035) 89px 90px),
    linear-gradient(118deg, #16090d 0%, #2a1015 38%, #4f1d20 62%, #1b0a0e 100%);
}

.route-stage::before {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: "";
  background:
    linear-gradient(132deg, transparent 0 34%, rgba(255, 173, 95, 0.075) 47%, transparent 61%),
    linear-gradient(308deg, transparent 0 52%, rgba(207, 55, 91, 0.1) 66%, transparent 78%);
  background-size: 180% 180%, 160% 160%;
  animation: route-backdrop-shimmer 6s ease-in-out infinite alternate;
}

@keyframes route-backdrop-shimmer {
  from {
    background-position: 0% 50%, 100% 50%;
  }

  to {
    background-position: 100% 50%, 0% 50%;
  }
}

.route-frame {
  position: relative;
  z-index: 1;
  isolation: isolate;
  backface-visibility: hidden;
}

.route-fade-enter-active {
  transition:
    opacity var(--route-fade-enter-duration) var(--route-fade-enter-ease),
    transform var(--route-fade-enter-duration) var(--route-fade-enter-ease),
    filter var(--route-fade-enter-duration) var(--route-fade-enter-ease);
  will-change: opacity, transform, filter;
}

.route-fade-leave-active {
  pointer-events: none;
  transition:
    opacity var(--route-fade-leave-duration) var(--route-fade-leave-ease),
    transform var(--route-fade-leave-duration) var(--route-fade-leave-ease),
    filter var(--route-fade-leave-duration) var(--route-fade-leave-ease);
  will-change: opacity, transform, filter;
}

.route-fade-enter-from {
  opacity: 0;
  transform: translate3d(0, 18px, 0) scale(0.995);
  filter: blur(4px);
}

.route-fade-enter-to {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
  filter: blur(0);
}

.route-fade-leave-from {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
  filter: blur(0);
}

.route-fade-leave-to {
  opacity: 0;
  transform: translate3d(0, -10px, 0) scale(0.998);
  filter: blur(2px);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --route-fade-enter-duration: 580ms;
    --route-fade-leave-duration: 360ms;
  }

  .route-fade-enter-from,
  .route-fade-enter-to,
  .route-fade-leave-from,
  .route-fade-leave-to {
    transform: none;
    filter: none;
  }

  .route-stage::before {
    animation-duration: 12s;
  }
}
</style>
