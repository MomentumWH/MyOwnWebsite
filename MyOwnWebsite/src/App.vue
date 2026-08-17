<script setup lang="ts">
import { NMessageProvider, NDialogProvider } from "naive-ui";
import { shallowRef } from "vue";
import PageAgent from "@/features/page-agent/PageAgent.vue";

const isRouteChanging = shallowRef(false);

const startRouteTransition = () => {
  isRouteChanging.value = true;
};

const finishRouteTransition = () => {
  isRouteChanging.value = false;
};
</script>

<template>
  <n-message-provider>
    <n-dialog-provider>
      <div
        class="route-progress"
        :class="{ 'route-progress--active': isRouteChanging }"
        aria-hidden="true"
      >
        <span></span>
      </div>

      <RouterView v-slot="{ Component, route }">
        <Transition
          name="route-page"
          mode="out-in"
          @before-leave="startRouteTransition"
          @after-enter="finishRouteTransition"
          @enter-cancelled="finishRouteTransition"
          @leave-cancelled="finishRouteTransition"
        >
          <div :key="route.fullPath" class="route-frame">
            <component :is="Component" />
          </div>
        </Transition>
      </RouterView>

      <PageAgent />
    </n-dialog-provider>
  </n-message-provider>
</template>

<style>
:root {
  --route-enter-duration: 440ms;
  --route-leave-duration: 220ms;
  --route-enter-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --route-leave-ease: cubic-bezier(0.4, 0, 0.8, 1);
}

#app,
.route-frame {
  min-height: 100vh;
}

.route-frame {
  position: relative;
  isolation: isolate;
  backface-visibility: hidden;
}

.route-page-enter-active {
  z-index: 1;
  transition:
    opacity var(--route-enter-duration) var(--route-enter-ease),
    transform var(--route-enter-duration) var(--route-enter-ease);
  will-change: opacity, transform;
}

.route-page-leave-active {
  z-index: 0;
  pointer-events: none;
  transition:
    opacity var(--route-leave-duration) var(--route-leave-ease),
    transform var(--route-leave-duration) var(--route-leave-ease);
  will-change: opacity, transform;
}

.route-page-enter-from {
  opacity: 0;
  transform: translate3d(0, 18px, 0) scale(0.985);
  transform-origin: center top;
}

.route-page-leave-to {
  opacity: 0;
  transform: translate3d(0, -8px, 0) scale(0.995);
  transform-origin: center top;
}

.route-progress {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 10000;
  height: 2px;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
  transition: opacity 180ms ease;
}

.route-progress span {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #ffb45f 0%, #ff6b59 48%, #72d8cf 100%);
  box-shadow: 0 0 14px rgba(255, 107, 89, 0.58);
  transform: scaleX(1);
  transform-origin: left;
}

.route-progress--active {
  opacity: 1;
}

.route-progress--active span {
  animation: routeProgress 520ms var(--route-enter-ease) forwards;
}

@keyframes routeProgress {
  0% {
    transform: scaleX(0.04);
  }

  62% {
    transform: scaleX(0.72);
  }

  100% {
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .route-page-enter-active,
  .route-page-leave-active {
    transition-duration: 1ms;
  }

  .route-page-enter-from,
  .route-page-leave-to {
    transform: none;
  }

  .route-progress {
    display: none;
  }
}
</style>
