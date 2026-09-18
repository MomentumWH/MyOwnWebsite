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
  --page-reveal-duration: 880ms;
  --page-reveal-ease: cubic-bezier(0.16, 1, 0.3, 1);
  --tab-motion-duration: 620ms;
  --tab-motion-ease: cubic-bezier(0.16, 1, 0.3, 1);
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

.page-motion-ready [data-scroll-reveal] {
  opacity: 0;
  transform: translate3d(0, 44px, 0);
  transition:
    opacity var(--page-reveal-duration) var(--page-reveal-ease),
    transform var(--page-reveal-duration) var(--page-reveal-ease);
  transition-delay: var(--page-reveal-delay, 0ms);
  will-change: opacity, transform;
}

.page-motion-ready [data-scroll-reveal="left"] {
  transform: translate3d(-40px, 0, 0);
}

.page-motion-ready [data-scroll-reveal="right"] {
  transform: translate3d(40px, 0, 0);
}

.page-motion-ready [data-scroll-reveal="scale"] {
  transform: translate3d(0, 24px, 0) scale(0.975);
}

.page-motion-ready [data-scroll-reveal].is-revealed {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
  will-change: auto;
}

[data-motion-tabs] {
  position: relative;
  isolation: isolate;
}

[data-motion-tab] {
  position: relative;
  z-index: 1;
}

.motion-tab-indicator {
  position: absolute;
  z-index: 2;
  bottom: 0;
  left: 0;
  height: 2px;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(90deg, #ffb14e 0%, #ff536b 52%, #6f8cff 100%);
  box-shadow: 0 0 16px rgba(255, 111, 104, 0.58);
  transform-origin: left center;
  transition:
    width var(--tab-motion-duration) var(--tab-motion-ease),
    transform var(--tab-motion-duration) var(--tab-motion-ease),
    opacity 180ms ease;
}

[data-motion-tabs][data-motion-tabs-ready="true"] > .motion-tab-indicator {
  opacity: 1;
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

  .page-motion-ready [data-scroll-reveal],
  .page-motion-ready [data-scroll-reveal="left"],
  .page-motion-ready [data-scroll-reveal="right"],
  .page-motion-ready [data-scroll-reveal="scale"] {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .motion-tab-indicator {
    transition: none;
  }
}
</style>
