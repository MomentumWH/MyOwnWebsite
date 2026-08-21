<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const props = withDefaults(defineProps<{
  showDefaultAction?: boolean;
  tone?: "cool" | "warm";
}>(), {
  showDefaultAction: true,
  tone: "cool",
});

const route = useRoute();
const router = useRouter();
const navLinksRef = useTemplateRef<HTMLElement>("navLinks");

const navItems = [
  { label: "个人博客", path: "/blog" },
  { label: "电商平台", path: "/ecommerce" },
  { label: "数据可视化", path: "/data-visualization" },
  { label: "阿森纳赛季", path: "/arsenal-season" },
  { label: "CS饰品数据", path: "/cs-items" },
];

const pendingPath = shallowRef<string | null>(null);
const activePath = computed(() => pendingPath.value ?? route.path);
const indicatorGeometry = shallowRef({ left: 0, visible: false, width: 0 });
const indicatorStyle = computed(() => ({
  opacity: indicatorGeometry.value.visible ? "1" : "0",
  transform: `translate3d(${indicatorGeometry.value.left}px, 0, 0)`,
  width: `${indicatorGeometry.value.width}px`,
}));

let navigationTimer: number | undefined;
let resizeObserver: ResizeObserver | undefined;

const syncIndicator = () => {
  const navLinks = navLinksRef.value;
  const activeLink = Array.from(navLinks?.querySelectorAll<HTMLButtonElement>(".nav-link") ?? [])
    .find(link => link.dataset.path === activePath.value);

  if (!activeLink) {
    indicatorGeometry.value = { left: 0, visible: false, width: 0 };
    return;
  }

  indicatorGeometry.value = {
    left: activeLink.offsetLeft,
    visible: true,
    width: activeLink.offsetWidth,
  };
};

const goHome = () => {
  router.push("/");
};

const goToRoute = (path: string) => {
  if (path === activePath.value) {
    return;
  }

  pendingPath.value = path;

  if (navigationTimer !== undefined) {
    window.clearTimeout(navigationTimer);
  }

  const transitionDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 160 : 260;
  navigationTimer = window.setTimeout(() => {
    navigationTimer = undefined;
    void router.push(path).catch(() => {
      pendingPath.value = null;
    });
  }, transitionDelay);
};

const goBack = () => {
  router.back();
};

watch(activePath, async () => {
  await nextTick();
  syncIndicator();
});

onMounted(async () => {
  await nextTick();
  syncIndicator();

  if (navLinksRef.value) {
    resizeObserver = new ResizeObserver(syncIndicator);
    resizeObserver.observe(navLinksRef.value);
  }
});

onBeforeUnmount(() => {
  if (navigationTimer !== undefined) {
    window.clearTimeout(navigationTimer);
  }

  resizeObserver?.disconnect();
});
</script>

<template>
  <nav
    class="project-nav"
    :class="`project-nav--${props.tone}`"
    aria-label="项目页面导航"
  >
    <button class="nav-brand" type="button" @click="goHome">
      <span class="brand-mark">C</span>
      <span class="brand-copy">
        <strong>Chonny Lab</strong>
        <small>Project Center</small>
      </span>
    </button>

    <div ref="navLinks" class="nav-links">
      <span
        class="nav-active-track"
        :style="indicatorStyle"
        aria-hidden="true"
      ></span>
      <button
        v-for="item in navItems"
        :key="item.path"
        class="nav-link"
        :class="{ 'nav-link--active': item.path === activePath }"
        :aria-current="item.path === activePath ? 'page' : undefined"
        :data-path="item.path"
        type="button"
        @click="goToRoute(item.path)"
      >
        <span class="nav-link__label">{{ item.label }}</span>
      </button>
    </div>

    <div class="nav-action-wrap">
      <slot name="action">
        <button
          v-if="props.showDefaultAction"
          class="nav-action"
          type="button"
          @click="goBack"
        >
          返回
        </button>
      </slot>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.project-nav {
  position: sticky;
  top: 1rem;
  z-index: 20;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(136, 220, 255, 0.24);
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(9, 24, 58, 0.78), rgba(44, 25, 88, 0.68)),
    linear-gradient(90deg, rgba(0, 238, 255, 0.16), rgba(174, 94, 255, 0.18));
  box-shadow:
    0 18px 48px rgba(3, 9, 34, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 0 32px rgba(94, 178, 255, 0.12);
  backdrop-filter: blur(18px);
}

.nav-brand,
.nav-link,
.nav-action-wrap {
  display: inline-flex;
  justify-content: flex-end;
}

.nav-action {
  border: 0;
  color: #f4fbff;
  font-family: inherit;
  cursor: pointer;
}

.nav-brand {
  display: inline-flex;
  gap: 0.75rem;
  align-items: center;
  min-width: 0;
  padding: 0;
  text-align: left;
  background: transparent;
}

.brand-mark {
  display: inline-grid;
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  place-items: center;
  color: #ffffff;
  font-weight: 900;
  border: 1px solid rgba(203, 246, 255, 0.42);
  border-radius: 14px;
  background: linear-gradient(135deg, #00d9ff 0%, #8f5cff 100%);
  box-shadow:
    0 0 22px rgba(0, 217, 255, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.24);
}

.brand-copy {
  display: grid;
  gap: 0.12rem;
  min-width: 0;
}

.brand-copy strong {
  font-size: 0.98rem;
  line-height: 1.1;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.brand-copy small {
  color: rgba(237, 247, 255, 0.62);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
}

.nav-links {
  position: relative;
  display: flex;
  gap: 0.35rem;
  justify-content: center;
  min-width: 0;
}

.nav-active-track {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
  border-radius: 999px;
  background: rgba(0, 217, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.12);
  transition:
    width 420ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 180ms ease,
    transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: width, transform;
}

.nav-link {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  z-index: 1;
  flex: 0 0 auto;
  padding: 0.62rem 0.95rem;
  color: rgba(237, 247, 255, 0.72);
  font-size: 0.95rem;
  font-weight: 900;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  transition: color 280ms ease, transform 280ms ease, border-color 280ms ease, box-shadow 280ms ease;
}

.nav-link::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: "";
  border-radius: inherit;
  background: rgba(0, 217, 255, 0.1);
  opacity: 0;
  transform: scale(0.72, 0.68);
  transform-origin: center;
  transition: opacity 220ms ease, transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-link__label {
  position: relative;
  z-index: 1;
  display: inline-block;
  transform: translateY(0);
  transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-link:hover {
  color: #ffffff;
  border-color: rgba(138, 220, 255, 0.32);
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.16);
  transform: translateY(-1px);
}

.nav-link:focus-visible {
  outline: 2px solid rgba(95, 231, 255, 0.72);
  outline-offset: 2px;
}

.nav-link:hover::before {
  opacity: 1;
  transform: scale(1);
}

.nav-link--active {
  color: #ffffff;
  border-color: rgba(138, 220, 255, 0.32);
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.16);
  transform: translateY(-1px);
}

.nav-link--active .nav-link__label {
  transform: translateY(-1px);
}

.nav-link--active::after {
  position: absolute;
  right: 22%;
  bottom: 0.28rem;
  left: 22%;
  height: 2px;
  content: "";
  border-radius: 999px;
  background: linear-gradient(90deg, #5fe7ff, #b994ff);
  box-shadow: 0 0 10px rgba(95, 231, 255, 0.72);
  transform: scaleX(1);
  transform-origin: center;
  animation: nav-indicator-in 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes nav-indicator-in {
  from {
    opacity: 0;
    transform: scaleX(0);
  }

  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

.nav-action-wrap {
  display: inline-flex;
  justify-content: flex-end;
}

.nav-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0.68rem 1.15rem;
  font-size: 0.95rem;
  font-weight: 900;
  border: 1px solid rgba(215, 250, 255, 0.38);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(0, 217, 255, 0.9), rgba(143, 92, 255, 0.92));
  box-shadow: 0 10px 28px rgba(0, 217, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.nav-action:hover {
  box-shadow: 0 10px 28px rgba(0, 217, 255, 0.34);
  transform: translateY(-2px);
}

.project-nav--warm {
  border-color: rgba(255, 207, 165, 0.22);
  border-radius: 6px;
  background:
    linear-gradient(110deg, rgba(31, 13, 17, 0.94), rgba(65, 24, 25, 0.9)),
    rgba(24, 10, 14, 0.9);
  box-shadow:
    0 16px 46px rgba(20, 5, 9, 0.38),
    inset 0 1px 0 rgba(255, 232, 211, 0.08);
}

.project-nav--warm .brand-mark {
  color: #261014;
  border-color: rgba(255, 227, 202, 0.68);
  border-radius: 3px;
  background: linear-gradient(135deg, #ffc179, #ff705b);
  box-shadow: 0 0 24px rgba(255, 112, 91, 0.24);
}

.project-nav--warm .brand-copy strong,
.project-nav--warm .brand-copy small {
  letter-spacing: 0;
}

.project-nav--warm .brand-copy small,
.project-nav--warm .nav-link {
  color: rgba(255, 232, 211, 0.66);
}

.project-nav--warm .nav-link {
  border-radius: 3px;
}

.project-nav--warm .nav-link:hover,
.project-nav--warm .nav-link--active {
  color: #fff8ee;
  border-color: rgba(255, 190, 132, 0.28);
  box-shadow: none;
}

.project-nav--warm .nav-link:focus-visible {
  outline-color: rgba(255, 189, 115, 0.72);
}

.project-nav--warm .nav-link::before {
  background: rgba(255, 145, 86, 0.09);
}

.project-nav--warm .nav-active-track {
  border-radius: 3px;
  background: rgba(255, 145, 86, 0.09);
  box-shadow: inset 0 0 0 1px rgba(255, 190, 132, 0.18);
}

.project-nav--warm .nav-link--active::after {
  background: linear-gradient(90deg, #ffbd73, #ff6e5b);
  box-shadow: 0 0 10px rgba(255, 110, 91, 0.52);
}

@media (max-width: 980px) {
  .project-nav {
    grid-template-columns: auto 1fr;
  }

  .nav-links {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-content: flex-start;
    overflow-x: auto;
    padding: 0.1rem 0 0.2rem;
    scrollbar-width: none;
  }

  .nav-links::-webkit-scrollbar {
    display: none;
  }

  .nav-action-wrap {
  display: inline-flex;
  justify-content: flex-end;
}

.nav-action {
    justify-self: end;
  }
}

@media (max-width: 560px) {
  .project-nav {
    top: 0.75rem;
    gap: 0.75rem;
    padding: 0.7rem;
    border-radius: 18px;
  }

  .brand-copy small {
    display: none;
  }

  .nav-link {
    padding: 0.58rem 0.82rem;
    font-size: 0.9rem;
  }

  .nav-action-wrap {
  display: inline-flex;
  justify-content: flex-end;
}

.nav-action {
    min-height: 38px;
    padding: 0.62rem 0.95rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-link,
  .nav-link::before,
  .nav-link__label {
    transition-duration: 120ms;
  }

  .nav-active-track {
    transition-duration: 160ms;
  }

  .nav-link--active::after {
    animation-duration: 160ms;
  }
}
</style>

