<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";
import ProjectNav from "@/components/projectNav/index.vue";
import { useMessage } from "naive-ui";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import { TooltipComponent, LegendComponent } from "echarts/components";
import { animate, createTimeline, stagger } from "animejs";
import VChart from "vue-echarts";
import { fetchProducts, login } from "@/services/apiCalls";

use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent]);

const message = useMessage();
const features = ref([
  { name: "Product display and search", icon: "P" },
  { name: "Cart and checkout", icon: "C" },
  { name: "User auth", icon: "U" },
  { name: "Order management", icon: "O" },
]);

const techStack = ref([
  { name: "Nuxt 3", icon: "N" },
  { name: "Tailwind CSS", icon: "T" },
  { name: "Pinia", icon: "P" },
  { name: "Stripe", icon: "S" },
]);

const showDrawer = ref(false);
const currentFeature = ref("");
const selectDrawer = ref("");

const imgList = ref([
  "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel1.jpeg",
  "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel2.jpeg",
  "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel3.jpeg",
  "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel4.jpeg",
]);

const chartData = ref([
  { name: "Electronics", value: 35 },
  { name: "Fashion", value: 25 },
  { name: "Home", value: 20 },
  { name: "Food", value: 15 },
  { name: "Other", value: 5 },
]);

const ringChartOption = computed(() => ({
  tooltip: {
    trigger: "item",
    formatter: "{a} <br/>{b} : {c}%",
  },
  legend: {
    orient: "horizontal",
    bottom: "5%",
    left: "center",
    textStyle: {
      color: "white",
      fontSize: 14,
    },
  },
  series: [
    {
      name: "Categories",
      type: "pie",
      radius: ["20%", "70%"],
      center: ["50%", "40%"],
      roseType: "area",
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: "#fff",
        borderWidth: 2,
      },
      label: {
        show: true,
        position: "outside",
        formatter: "{b}: {c}%",
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: "bold",
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)",
        },
      },
      data: chartData.value,
    },
  ],
}));

const products = ref<any[]>([]);
const loading = ref(false);
const apiError = ref<string | null>(null);
const loginData = ref({
  username: "",
  password: "",
});
const loginLoading = ref(false);
const pageRef = useTemplateRef<HTMLElement>("pageRef");
const drawerContentRef = useTemplateRef<HTMLElement>("drawerContentRef");

let introTimeline: ReturnType<typeof createTimeline> | null = null;
let drawerAnimation: ReturnType<typeof animate> | null = null;
let drawerImageAnimation: ReturnType<typeof animate> | null = null;
let productAnimation: ReturnType<typeof animate> | null = null;

const handleFeatureClick = (featureName: string) => {
  currentFeature.value = featureName;
  showDrawer.value = true;
  selectDrawer.value = featureName;
};

const handleFetchProducts = async () => {
  loading.value = true;
  apiError.value = null;

  try {
    const result = await fetchProducts();
    products.value = result || [];
    message.success("Products loaded");
  } catch (error: any) {
    apiError.value = error.message || "Failed to load products";
    message.error(apiError.value);
  } finally {
    loading.value = false;
  }
};

const handleLogin = async () => {
  if (!loginData.value.username || !loginData.value.password) {
    message.warning("Please enter username and password");
    return;
  }

  loginLoading.value = true;

  try {
    const result = await login(
      loginData.value.username,
      loginData.value.password,
    );

    if (result.token) {
      localStorage.setItem("token", result.token);
      message.success("Login success");
      loginData.value = { username: "", password: "" };
    }
  } catch (error: any) {
    message.error(error.message || "Login failed");
  } finally {
    loginLoading.value = false;
  }
};

const animatePageIntro = () => {
  if (!pageRef.value) {
    return;
  }

  introTimeline?.revert();

  const sectionTargets = pageRef.value.querySelectorAll(".fade-in-section");
  const featureTargets = pageRef.value.querySelectorAll(".feature-card");
  const techTargets = pageRef.value.querySelectorAll(".tech-card");
  const demoCardTargets = pageRef.value.querySelectorAll(".demo-card");

  introTimeline = createTimeline({
    defaults: {
      duration: 820,
      ease: "outExpo",
    },
  })
    .add(sectionTargets, {
      opacity: { from: 0 },
      y: { from: 32 },
    })
    .add(
      featureTargets,
      {
        opacity: { from: 0 },
        y: { from: 48 },
        scale: { from: 0.92 },
        delay: stagger(140),
        duration: 720,
        ease: "outBack",
      },
      "-=480",
    )
    .add(
      techTargets,
      {
        opacity: { from: 0 },
        y: { from: 40 },
        scale: { from: 0.94 },
        delay: stagger(120),
        duration: 680,
      },
      "-=520",
    )
    .add(
      demoCardTargets,
      {
        opacity: { from: 0 },
        y: { from: 28 },
        delay: stagger(120),
        duration: 620,
        ease: "outCubic",
      },
      "-=360",
    );
};

const animateDrawerContent = async () => {
  if (!showDrawer.value) {
    return;
  }

  await nextTick();

  if (!drawerContentRef.value) {
    return;
  }

  drawerAnimation?.revert();
  drawerImageAnimation?.revert();

  drawerAnimation = animate(drawerContentRef.value, {
    opacity: { from: 0 },
    y: { from: 52 },
    duration: 520,
    ease: "outCubic",
  });

  const carouselImages = drawerContentRef.value.querySelectorAll(".carousel-img");

  drawerImageAnimation = animate(carouselImages, {
    opacity: { from: 0 },
    scale: { from: 0.9 },
    delay: stagger(110),
    duration: 560,
    ease: "outExpo",
  });
};

const animateProducts = async () => {
  await nextTick();

  if (!pageRef.value || products.value.length === 0) {
    return;
  }

  productAnimation?.revert();

  productAnimation = animate(pageRef.value.querySelectorAll(".product-item"), {
    opacity: { from: 0 },
    y: { from: 24 },
    delay: stagger(90),
    duration: 520,
    ease: "outCubic",
  });
};

onMounted(() => {
  animatePageIntro();
});

watch(showDrawer, (isOpen) => {
  if (isOpen) {
    void animateDrawerContent();
  }
});

watch(
  () => products.value.length,
  (length, previousLength) => {
    if (length > 0 && length !== previousLength) {
      void animateProducts();
    }
  },
);

onBeforeUnmount(() => {
  introTimeline?.revert();
  drawerAnimation?.revert();
  drawerImageAnimation?.revert();
  productAnimation?.revert();
});
</script>
<template>
  <div ref="pageRef" class="project-page">
    <div class="project-shell">
      <ProjectNav class="fade-in-section" />

      <header class="project-hero fade-in-section">
        <div class="hero-copy">
          <span class="section-kicker">Commerce Lab</span>
          <h1>Ecommerce Platform</h1>
          <p class="project-subtitle">
            Built with Nuxt 3 and vue-echarts. 展示商品浏览、用户认证、图表统计与接口请求能力。
          </p>
        </div>
        <aside class="hero-panel">
          <div class="hero-stat">
            <strong>{{ features.length }}</strong>
            <span>核心业务能力</span>
          </div>
          <div class="hero-stat">
            <strong>{{ techStack.length }}</strong>
            <span>关键技术栈</span>
          </div>
          <div class="hero-stat">
            <strong>{{ products.length }}</strong>
            <span>已加载商品数据</span>
          </div>
        </aside>
      </header>

      <main class="content-grid">
        <section class="content-card fade-in-section">
          <span class="section-kicker">Overview</span>
          <h2>项目介绍</h2>
          <p>
            This page demonstrates product browsing, auth flow, charts, and basic
            API requests while keeping the original data access pattern intact.
            页面结构已统一为首页同款蓝紫科技玻璃风格。
          </p>
        </section>

        <section class="content-card fade-in-section">
          <div class="section-heading-row">
            <div>
              <span class="section-kicker">Key Features</span>
              <h2>核心功能</h2>
            </div>
            <span class="section-count">{{ features.length }} 项能力</span>
          </div>
          <div class="features-grid">
            <article
              v-for="feature in features"
              :key="feature.name"
              class="feature-card"
              @click="handleFeatureClick(feature.name)"
            >
              <span class="feature-icon">{{ feature.icon }}</span>
              <h3>{{ feature.name }}</h3>
            </article>
          </div>
        </section>
      </main>

      <section class="content-card fade-in-section">
        <div class="section-heading-row">
          <div>
            <span class="section-kicker">Tech Stack</span>
            <h2>技术栈</h2>
          </div>
          <span class="section-count">{{ techStack.length }} 项技术</span>
        </div>
        <div class="tech-grid">
          <article v-for="tech in techStack" :key="tech.name" class="tech-card">
            <span class="tech-icon">{{ tech.icon }}</span>
            <h3>{{ tech.name }}</h3>
          </article>
        </div>
      </section>

      <section class="content-card chart-section fade-in-section">
        <div class="section-heading-row">
          <div>
            <span class="section-kicker">Analytics</span>
            <h2>Category Share</h2>
          </div>
          <span class="section-count">Rose Chart</span>
        </div>
        <VChart :option="ringChartOption" autoresize class="ring-chart" />
      </section>

      <section class="content-card api-demo-section fade-in-section">
        <div class="section-heading-row">
          <div>
            <span class="section-kicker">API Demo</span>
            <h2>接口演示</h2>
          </div>
          <span class="section-count">Login / Products</span>
        </div>

        <div class="demo-grid">
          <n-card title="User Login" class="demo-card">
            <form class="login-form" @submit.prevent="handleLogin">
              <div class="form-group">
                <label>Username</label>
                <input
                  v-model="loginData.username"
                  class="form-input"
                  type="text"
                  placeholder="Enter username"
                />
              </div>
              <div class="form-group">
                <label>Password</label>
                <input
                  v-model="loginData.password"
                  class="form-input"
                  type="password"
                  placeholder="Enter password"
                />
              </div>
              <button class="demo-action submit-btn" :disabled="loginLoading">
                {{ loginLoading ? "Logging in..." : "Login" }}
              </button>
            </form>
          </n-card>

          <n-card title="Product Data" class="demo-card">
            <div class="product-demo">
              <button class="demo-action fetch-btn" :disabled="loading" @click="handleFetchProducts">
                {{ loading ? "Loading..." : "Fetch Products" }}
              </button>

              <div v-if="apiError" class="error-message">
                {{ apiError }}
              </div>

              <div v-if="loading" class="loading-container">
                <p>Loading products...</p>
              </div>

              <div v-if="products.length" class="products-list">
                <article v-for="product in products" :key="product.id || product.name" class="product-item">
                  <div class="product-info">
                    <h4>{{ product.name || product.title || 'Product Item' }}</h4>
                    <p>{{ product.description || JSON.stringify(product, null, 2) }}</p>
                  </div>
                </article>
              </div>
            </div>
          </n-card>
        </div>
      </section>
    </div>

    <n-drawer
      v-model:show="showDrawer"
      height="70%"
      placement="bottom"
      :content-style="{
        borderRadius: '24px 24px 0 0',
        background: 'linear-gradient(135deg, rgba(9, 24, 58, 0.96), rgba(49, 16, 95, 0.96))',
        backdropFilter: 'blur(20px)',
      }"
      style="border-radius: 24px 24px 0 0"
    >
      <n-drawer-content :title="selectDrawer" :native-scrollbar="false">
        <div ref="drawerContentRef" class="drawer-content">
          <n-carousel show-arrow>
            <img
              v-for="item in imgList"
              :key="item"
              class="carousel-img"
              :src="item"
            />
          </n-carousel>
        </div>
      </n-drawer-content>
    </n-drawer>

    <n-back-top :right="100" />
  </div>
</template>
<style lang="scss" scoped>
.project-page {
  position: relative;
  min-width: 1200px;
  min-height: 100vh;
  padding: 2rem 4rem 4rem;
  overflow-x: hidden;
  color: #f4fbff;
  font-family: "Arial", "Microsoft YaHei", sans-serif;
  background:
    radial-gradient(circle at 12% 18%, rgba(0, 224, 255, 0.28), transparent 28%),
    radial-gradient(circle at 88% 12%, rgba(165, 92, 255, 0.38), transparent 30%),
    radial-gradient(circle at 50% 88%, rgba(73, 108, 255, 0.28), transparent 36%),
    linear-gradient(135deg, #050816 0%, #0b1741 42%, #31105f 72%, #14091f 100%);
  background-attachment: fixed;
}

.project-page::before {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: "";
  background-image:
    linear-gradient(rgba(102, 220, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(102, 220, 255, 0.08) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.85), transparent 88%);
}

.project-page::after {
  position: fixed;
  inset: -20%;
  z-index: 0;
  pointer-events: none;
  content: "";
  background:
    conic-gradient(from 120deg at 30% 50%, transparent, rgba(0, 238, 255, 0.14), transparent 28%),
    conic-gradient(from 280deg at 72% 48%, transparent, rgba(177, 91, 255, 0.18), transparent 30%);
  filter: blur(18px);
  animation: auroraFloat 16s ease-in-out infinite alternate;
}

.project-shell {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 1.5rem;
  width: min(1480px, 100%);
  margin: 0 auto;
}


.back-button,
.demo-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0.75rem 1.25rem;
  color: white;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  border: 1px solid rgba(215, 250, 255, 0.38);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(0, 217, 255, 0.9), rgba(143, 92, 255, 0.92));
  box-shadow: 0 10px 28px rgba(0, 217, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.back-button:hover,
.demo-action:hover {
  box-shadow: 0 10px 28px rgba(0, 217, 255, 0.34);
  transform: translateY(-2px);
}

.project-hero,
.content-card,
.feature-card,
.tech-card,
.demo-card {
  contain: layout paint;
  border: 1px solid rgba(136, 220, 255, 0.24);
  box-shadow:
    0 24px 80px rgba(3, 9, 34, 0.36),
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    0 0 36px rgba(94, 178, 255, 0.14);
  backdrop-filter: blur(18px);
}

.project-hero {
  display: grid;
  grid-template-columns: minmax(420px, 1fr) minmax(360px, 0.72fr);
  gap: 1.5rem;
  min-height: 320px;
  padding: 1.5rem;
  border-radius: 28px;
  background:
    linear-gradient(135deg, rgba(22, 42, 92, 0.72), rgba(74, 32, 128, 0.7)),
    linear-gradient(90deg, rgba(0, 238, 255, 0.2), rgba(174, 94, 255, 0.22));
}

.hero-copy,
.hero-panel,
.content-card {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(9, 24, 58, 0.68), rgba(44, 25, 88, 0.58));
}

.hero-copy,
.hero-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2.2rem;
  border: 1px solid rgba(138, 220, 255, 0.18);
}

.section-kicker {
  display: inline-flex;
  margin-bottom: 0.7rem;
  color: #6ff0ff;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-shadow: 0 0 16px rgba(0, 238, 255, 0.46);
}

.project-hero h1 {
  margin: 0;
  color: #f7fbff;
  font-family: "Times New Roman", Times, serif;
  font-size: clamp(3rem, 5vw, 5rem);
  line-height: 1.02;
  text-shadow: 0 0 24px rgba(172, 128, 255, 0.36);
}

.project-subtitle,
.content-card p,
.action-copy p {
  color: rgba(237, 247, 255, 0.78);
  line-height: 1.85;
}

.project-subtitle {
  max-width: 760px;
  margin: 1rem 0 0;
  font-size: 1.15rem;
}

.hero-panel {
  gap: 1rem;
}

.hero-stat {
  display: grid;
  gap: 0.35rem;
  padding: 1rem 1.1rem;
  border: 1px solid rgba(138, 220, 255, 0.18);
  border-radius: 16px;
  background: rgba(0, 217, 255, 0.08);
}

.hero-stat strong {
  color: #f4fbff;
  font-size: 1.35rem;
}

.hero-stat span {
  color: rgba(237, 247, 255, 0.68);
  font-size: 0.9rem;
}

.content-grid,
.demo-grid {
  display: grid;
  grid-template-columns: minmax(360px, 0.85fr) minmax(560px, 1.15fr);
  gap: 1.5rem;
}

.content-card {
  padding: 2rem;
}

.section-heading-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.content-card h2,
.section-heading-row h2 {
  margin: 0;
  color: #c7f6ff;
  font-size: 1.75rem;
  text-shadow: 0 0 18px rgba(0, 238, 255, 0.42);
}

.section-count {
  flex: 0 0 auto;
  padding: 0.42rem 0.8rem;
  color: #dffaff;
  font-size: 0.88rem;
  font-weight: 800;
  border: 1px solid rgba(138, 220, 255, 0.22);
  border-radius: 999px;
  background: rgba(0, 217, 255, 0.08);
}

.features-grid,
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1rem;
}

.feature-card,
.tech-card {
  display: grid;
  gap: 0.8rem;
  min-height: 150px;
  padding: 1.35rem;
  color: #f4fbff;
  cursor: pointer;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(12, 31, 72, 0.78), rgba(53, 27, 101, 0.72));
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.tech-card {
  cursor: default;
}

.feature-card:hover,
.tech-card:hover {
  border-color: rgba(122, 232, 255, 0.48);
  box-shadow: 0 22px 58px rgba(0, 0, 0, 0.32), 0 0 32px rgba(0, 238, 255, 0.2);
  transform: translateY(-6px);
}

.feature-icon,
.tech-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  font-size: 1.7rem;
  border: 1px solid rgba(203, 246, 255, 0.28);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(0, 194, 255, 0.22), rgba(143, 92, 255, 0.3));
}

.feature-card h3,
.tech-card h3 {
  margin: 0;
  font-size: 1.08rem;
  line-height: 1.45;
}

.chart-section,
.api-demo-section {
  display: grid;
  gap: 1.25rem;
}

.ring-chart {
  width: 100%;
  height: 440px;
}

.demo-card {
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(12, 31, 72, 0.72), rgba(53, 27, 101, 0.68));
}

:deep(.n-card) {
  color: #f4fbff;
  border: 1px solid rgba(138, 220, 255, 0.18);
  background: transparent;
}

:deep(.n-card-header) {
  color: #c7f6ff;
  font-weight: 900;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(237, 247, 255, 0.78);
  font-weight: 800;
}

.form-input {
  width: 100%;
  padding: 0.8rem 0.9rem;
  color: #f4fbff;
  border: 1px solid rgba(138, 220, 255, 0.22);
  border-radius: 12px;
  outline: none;
  background: rgba(5, 8, 22, 0.46);
}

.form-input:focus {
  border-color: rgba(111, 240, 255, 0.62);
  box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.12);
}

.error-message,
.product-item,
.loading-container {
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid rgba(138, 220, 255, 0.16);
  border-radius: 14px;
  background: rgba(5, 8, 22, 0.36);
}

.error-message {
  color: #ffb4ad;
  border-color: rgba(255, 124, 124, 0.28);
}

.products-list {
  display: grid;
  gap: 1rem;
  max-height: 420px;
  margin-top: 1rem;
  overflow: auto;
}

.product-info h4 {
  margin: 0 0 0.5rem;
  color: #f4fbff;
}

.product-info p {
  margin: 0;
  color: rgba(237, 247, 255, 0.72);
  white-space: pre-wrap;
  word-break: break-word;
}

.carousel-img {
  width: 100%;
  height: 440px;
  object-fit: cover;
  border-radius: 18px;
}

.drawer-content {
  height: 100%;
}

@keyframes auroraFloat {
  0% { transform: translate3d(-2%, -1%, 0) rotate(0deg) scale(1); }
  100% { transform: translate3d(2%, 1%, 0) rotate(8deg) scale(1.08); }
}

@media (max-width: 1280px) {
  .project-page {
    min-width: 0;
    padding: 1.5rem;
  }

  .project-hero,
  .content-grid,
  .demo-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .project-page {
    padding: 1rem;
  }

  .hero-copy,
  .hero-panel,
  .content-card {
    padding: 1.25rem;
  }

  .project-hero h1 {
    font-size: 3rem;
  }

  .section-heading-row {
    flex-direction: column;
  }
}
</style>


