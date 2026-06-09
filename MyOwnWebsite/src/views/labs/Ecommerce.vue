<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";
import { useRouter } from "vue-router";
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
const router = useRouter();

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

const goBack = () => {
  router.back();
};

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
    <header class="fade-in-section">
      <div class="header-line">
        <div class="header-line-backButton">
          <button @click="goBack" class="back-button">Back</button>
        </div>
        <div class="header-line-title">
          <h1>Ecommerce Platform</h1>
        </div>
        <div class="header-line-content">
          <p class="project-subtitle">Built with Nuxt 3 and vue-echarts.</p>
        </div>
      </div>
    </header>

    <section class="project-details fade-in-section">
      <h2>Overview</h2>
      <p>
        This page demonstrates product browsing, auth flow, charts, and basic
        API requests while keeping the original data access pattern intact.
      </p>
    </section>

    <section class="project-features fade-in-section">
      <h2>Key Features</h2>
      <div class="features-grid">
        <div
          v-for="feature in features"
          :key="feature.name"
          class="feature-card"
          @click="handleFeatureClick(feature.name)"
        >
          <span class="feature-icon">{{ feature.icon }}</span>
          <h3>{{ feature.name }}</h3>
        </div>
      </div>
    </section>

    <section class="project-tech fade-in-section">
      <h2>Tech Stack</h2>
      <div class="tech-grid">
        <div
          v-for="tech in techStack"
          :key="tech.name"
          class="tech-card"
        >
          <span class="tech-icon">{{ tech.icon }}</span>
          <h3>{{ tech.name }}</h3>
        </div>
      </div>
    </section>

    <section class="project-details fade-in-section">
      <n-list clickable hoverable class="nListBoxBackgroundColor">
        <n-list-item>
          <template #prefix>
            <n-button>Prefix</n-button>
          </template>
          <template #suffix>
            <n-button>Suffix</n-button>
          </template>
          <n-thing
            title="Thing"
            title-extra="extra"
            description="description"
          />
        </n-list-item>
        <n-list-item>
          <template #prefix>
            <n-button>Prefix</n-button>
          </template>
          <template #suffix>
            <n-button>Suffix</n-button>
          </template>
          <n-thing title="Thing" title-extra="extra" description="description">
            Biu<br />
            Biu<br />
            Biu<br />
          </n-thing>
        </n-list-item>
      </n-list>
    </section>

    <footer class="project-footer fade-in-section"></footer>

    <n-drawer
      v-model:show="showDrawer"
      height="70%"
      placement="bottom"
      :content-style="{
        borderRadius: '24px 24px 0 0',
        background:
          'linear-gradient(135deg, rgba(153, 215, 239, 0.95) 0%, rgba(174, 183, 132, 0.95) 100%)',
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

    <section class="chart-section fade-in-section">
      <h2>Category Share</h2>
      <VChart :option="ringChartOption" autoresize class="ring-chart" />
    </section>

    <section class="api-demo-section fade-in-section">
      <h2>API Demo</h2>

      <n-card title="User Login" class="demo-card">
        <div class="login-form">
          <div class="form-group">
            <label>Username</label>
            <input
              v-model="loginData.username"
              type="text"
              placeholder="Enter username"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input
              v-model="loginData.password"
              type="password"
              placeholder="Enter password"
              class="form-input"
            />
          </div>
          <n-button
            type="primary"
            @click="handleLogin"
            :loading="loginLoading"
            class="submit-btn"
          >
            Login
          </n-button>
        </div>
      </n-card>

      <n-card title="Fetch Products" class="demo-card">
        <div class="product-demo">
          <n-button
            type="info"
            @click="handleFetchProducts"
            :loading="loading"
            class="fetch-btn"
          >
            Fetch Products
          </n-button>

          <div v-if="apiError" class="error-message">
            {{ apiError }}
          </div>

          <div v-if="products.length > 0" class="products-list">
            <div
              v-for="(product, index) in products"
              :key="product.id ?? product.name ?? index"
              class="product-item"
            >
              <div class="product-info">
                <h4>Product {{ index + 1 }}</h4>
                <p>{{ JSON.stringify(product, null, 2) }}</p>
              </div>
            </div>
          </div>

          <div v-if="loading" class="loading-container">
            <n-spin size="large" />
            <p>Loading...</p>
          </div>
        </div>
      </n-card>
    </section>

    <n-back-top :right="100" />
  </div>
</template>
<style lang="scss" scoped>
.project-page {
  min-width: 1200px;
  margin: 0 auto;
  padding: 2rem 4rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #919776 0%, #72cbee 100%);
  color: white;
}

.project-header {
  margin-bottom: 3rem;
  text-align: center;
}

.project-footer {
  margin-top: 4rem;
  text-align: center;
}

.back-button {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #8a97d3 0%, #36e4a1 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
.header-line {
  display: flex;
  //justify-content: center;
  //align-items: center;
  flex-direction: column;
}
.header-line-title {
  text-align: center;
  flex: 1;
}
.header-line-content {
  text-align: center;
  flex: 1;
}
.header-line-backButton {
  margin-bottom: 2rem;
  text-align: left;
  flex: 1;
}
.project-header h1 {
  font-size: 3rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 闂傚倷鑳剁划顖滃垝閻樿鍨傚ù鐓庣摠閸ゅ霉閸忓吋缍戦柣鎰躬閺岋綁骞囬棃娑橆潾婵犮垻鎳撻ˇ閬嶅焵?*/
.chart-section {
  margin-top: 4rem;
  margin-bottom: 4rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.chart-section h2 {
  font-size: 1.75rem;
  color: white;
  margin-bottom: 2rem;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.ring-chart {
  width: 100%;
  height: 500px;
}

.project-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.project-details {
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.project-details h2 {
  font-size: 1.75rem;
  color: white;
  margin-bottom: 1rem;
}

.project-details p {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
}

.project-features {
  margin-bottom: 3rem;
}

.project-features h2 {
  font-size: 1.75rem;
  color: white;
  margin-bottom: 2rem;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  will-change: transform, opacity;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.3);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  color: white;
}

.project-tech {
  margin-bottom: 3rem;
}

.project-tech h2 {
  font-size: 1.75rem;
  color: white;
  margin-bottom: 2rem;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.tech-card {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  will-change: transform, opacity;
}

.tech-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.3);
}

.tech-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.tech-card h3 {
  font-size: 1.25rem;
  color: white;
}

.fade-in-section {
  will-change: transform, opacity;
}

.drawer-content {
  padding: 2rem;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  will-change: transform, opacity;
}

.drawer-content h3 {
  font-size: 1.5rem;
  color: white;
  margin-bottom: 2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.carousel-item {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.carousel-img {
  will-change: transform, opacity;
}

:deep(.n-carousel) {
  flex: 1;
  min-height: 0;
}

:deep(.n-carousel__slides) {
  height: 100%;
}

:deep(.n-carousel__slide) {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.n-carousel__dots) {
  bottom: 20px;
}

:deep(.n-carousel__dot) {
  background-color: rgba(255, 255, 255, 0.4);
  width: 24px;
  height: 4px;
}

:deep(.n-carousel__dot--active) {
  background-color: white;
  width: 32px;
}

.feature-card {
  cursor: pointer;
}
.nListBoxBackgroundColor {
  background: linear-gradient(
    135deg,
    rgba(153, 215, 239, 0.95) 0%,
    rgba(174, 183, 132, 0.95) 100%
  );
  border-radius: 20px;
}
:deep(.n-list.n-list--hoverable .n-list-item:hover) {
  background: linear-gradient(
    135deg,
    rgba(174, 183, 132, 0.95) 0%,
    rgba(153, 215, 239, 0.95) 100%
  );
  border-radius: 20px;
}

/* API Demo闂傚倷绀侀幖顐ょ矓閹绢喖搴婇柤纰卞墯椤?*/
.api-demo-section {
  margin-top: 4rem;
  margin-bottom: 4rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.api-demo-section h2 {
  font-size: 1.75rem;
  color: white;
  margin-bottom: 2rem;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.demo-card {
  margin: 2rem;
  //flex: 1;
  background: transparent;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  //border: none;
  will-change: transform, opacity;
}

.login-form {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
}

.form-input {
  //flex: 1;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}

.product-demo {
  padding: 1rem;
}

.fetch-btn {
  margin-bottom: 1.5rem;
  padding: 0.75rem 2rem;
  font-size: 1rem;
}

.error-message {
  padding: 1rem;
  margin-bottom: 1rem;
  background: #fee;
  border-left: 4px solid #f56565;
  border-radius: 4px;
  color: #c53030;
}

.products-list {
  margin-top: 1rem;
}

.product-item {
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  will-change: transform, opacity;
}

.product-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-size: 1.1rem;
}

.product-info p {
  margin: 0;
  color: #4a5568;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-all;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #666;
}

.loading-container p {
  margin-top: 1rem;
  font-size: 1rem;
}
:deep(.n-card) {
  width: auto;
}
</style>
