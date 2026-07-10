<script setup lang="ts">
import { computed } from "vue";
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

const navItems = [
  { label: "个人博客", path: "/blog" },
  { label: "电商平台", path: "/ecommerce" },
  { label: "数据可视化", path: "/data-visualization" },
  { label: "CS饰品数据", path: "/cs-items" },
];

const activePath = computed(() => route.path);

const goHome = () => {
  router.push("/");
};

const goToRoute = (path: string) => {
  if (path === route.path) {
    return;
  }

  router.push(path);
};

const goBack = () => {
  router.back();
};
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

    <div class="nav-links">
      <button
        v-for="item in navItems"
        :key="item.path"
        class="nav-link"
        :class="{ 'nav-link--active': item.path === activePath }"
        type="button"
        @click="goToRoute(item.path)"
      >
        {{ item.label }}
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
  display: flex;
  gap: 0.35rem;
  justify-content: center;
  min-width: 0;
}

.nav-link {
  position: relative;
  flex: 0 0 auto;
  padding: 0.62rem 0.95rem;
  color: rgba(237, 247, 255, 0.72);
  font-size: 0.95rem;
  font-weight: 900;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  transition: color 0.25s ease, transform 0.25s ease, border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
}

.nav-link:hover,
.nav-link--active {
  color: #ffffff;
  border-color: rgba(138, 220, 255, 0.32);
  background: rgba(0, 217, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.16);
  transform: translateY(-1px);
}

.nav-link--active::after {
  position: absolute;
  right: 30%;
  bottom: 0.28rem;
  left: 30%;
  height: 2px;
  content: "";
  border-radius: 999px;
  background: linear-gradient(90deg, #5fe7ff, #b994ff);
  box-shadow: 0 0 10px rgba(95, 231, 255, 0.72);
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
  background: rgba(255, 145, 86, 0.09);
  box-shadow: none;
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
</style>

