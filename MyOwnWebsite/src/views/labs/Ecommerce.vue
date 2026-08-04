<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, useTemplateRef, watch } from "vue";
import WarmProjectLayout from "@/components/projectShowcase/WarmProjectLayout.vue";
import { useMessage } from "naive-ui";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import { LegendComponent, TooltipComponent } from "echarts/components";
import { animate, stagger } from "animejs";
import VChart from "vue-echarts";
import { fetchProducts, login } from "@/services/apiCalls";

use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent]);

interface ProductRecord {
  description?: string;
  id?: number | string;
  name?: string;
  title?: string;
  [key: string]: unknown;
}

interface LoginResponse {
  token?: string;
}

const message = useMessage();

const features = [
  { name: "Product display and search", icon: "PD" },
  { name: "Cart and checkout", icon: "CO" },
  { name: "User auth", icon: "UA" },
  { name: "Order management", icon: "OM" },
] as const;

const techStack = [
  { name: "Nuxt 3", icon: "N3" },
  { name: "Tailwind CSS", icon: "TW" },
  { name: "Pinia", icon: "PI" },
  { name: "Stripe", icon: "ST" },
] as const;

const previewImages = [
  "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel1.jpeg",
  "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel2.jpeg",
  "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel3.jpeg",
  "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel4.jpeg",
] as const;

const chartData = [
  { name: "Electronics", value: 35 },
  { name: "Fashion", value: 25 },
  { name: "Home", value: 20 },
  { name: "Food", value: 15 },
  { name: "Other", value: 5 },
] as const;

const showDrawer = shallowRef(false);
const selectedFeature = shallowRef("");
const products = shallowRef<ProductRecord[]>([]);
const loading = shallowRef(false);
const apiError = shallowRef<string | null>(null);
const loginLoading = shallowRef(false);
const loginData = ref({ username: "", password: "" });
const pageRef = useTemplateRef<HTMLElement>("pageRef");
const drawerContentRef = useTemplateRef<HTMLElement>("drawerContentRef");

let drawerAnimation: ReturnType<typeof animate> | null = null;
let drawerImageAnimation: ReturnType<typeof animate> | null = null;
let productAnimation: ReturnType<typeof animate> | null = null;

const projectStats = computed(() => [
  { value: features.length, label: "Business modules" },
  { value: techStack.length, label: "Core technologies" },
  { value: products.value.length.toString().padStart(2, "0"), label: "Loaded products" },
]);

const ringChartOption = computed(() => ({
  color: ["#ffb45f", "#ff6b59", "#dd416c", "#72d8cf", "#b98bff"],
  tooltip: {
    trigger: "item",
    backgroundColor: "rgba(35, 14, 18, 0.96)",
    borderColor: "rgba(255, 190, 132, 0.32)",
    textStyle: { color: "#fff8ee" },
    formatter: "{b}: {c}%",
  },
  legend: {
    orient: "horizontal",
    bottom: 0,
    left: "center",
    textStyle: { color: "rgba(255, 235, 218, 0.68)", fontSize: 12 },
  },
  series: [
    {
      name: "Categories",
      type: "pie",
      radius: ["34%", "72%"],
      center: ["50%", "44%"],
      roseType: "area",
      itemStyle: {
        borderColor: "#251015",
        borderRadius: 2,
        borderWidth: 3,
      },
      label: {
        color: "rgba(255, 241, 227, 0.82)",
        formatter: "{b}\n{c}%",
        fontSize: 12,
        lineHeight: 18,
      },
      data: chartData,
    },
  ],
}));

const drawerContentStyle = {
  background: "linear-gradient(135deg, rgba(35, 14, 18, 0.98), rgba(82, 30, 34, 0.98))",
  backdropFilter: "blur(20px)",
};

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const readErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const normalizeProducts = (result: unknown): ProductRecord[] => {
  if (Array.isArray(result)) {
    return result as ProductRecord[];
  }

  if (result && typeof result === "object" && "data" in result) {
    const data = (result as { data?: unknown }).data;
    return Array.isArray(data) ? data as ProductRecord[] : [];
  }

  return [];
};

const normalizeLoginResponse = (result: unknown): LoginResponse => {
  if (!result || typeof result !== "object") {
    return {};
  }

  if ("data" in result && (result as { data?: unknown }).data) {
    return (result as { data: LoginResponse }).data;
  }

  return result as LoginResponse;
};

const productKey = (product: ProductRecord, index: number) =>
  product.id ?? product.name ?? product.title ?? `product-${index}`;

const productTitle = (product: ProductRecord) =>
  product.name ?? product.title ?? "Product Item";

const productDescription = (product: ProductRecord) =>
  product.description ?? JSON.stringify(product, null, 2);

const openFeature = (featureName: string) => {
  selectedFeature.value = featureName;
  showDrawer.value = true;
};

const handleFetchProducts = async () => {
  loading.value = true;
  apiError.value = null;

  try {
    products.value = normalizeProducts(await fetchProducts());
    message.success(`Loaded ${products.value.length} products`);
  } catch (error: unknown) {
    apiError.value = readErrorMessage(error, "Failed to load products");
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
    const result = normalizeLoginResponse(await login(
      loginData.value.username,
      loginData.value.password,
    ));

    if (result.token) {
      localStorage.setItem("token", result.token);
      message.success("Login success");
      loginData.value = { username: "", password: "" };
    } else {
      message.warning("The API did not return a token");
    }
  } catch (error: unknown) {
    message.error(readErrorMessage(error, "Login failed"));
  } finally {
    loginLoading.value = false;
  }
};

const animateDrawerContent = async () => {
  if (!showDrawer.value || prefersReducedMotion()) {
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
    y: { from: 32 },
    duration: 420,
    ease: "outCubic",
  });
  drawerImageAnimation = animate(
    drawerContentRef.value.querySelectorAll(".carousel-img"),
    {
      opacity: { from: 0 },
      scale: { from: 0.96 },
      delay: stagger(80),
      duration: 460,
      ease: "outExpo",
    },
  );
};

const animateProducts = async () => {
  await nextTick();
  if (!pageRef.value || products.value.length === 0 || prefersReducedMotion()) {
    return;
  }

  productAnimation?.revert();
  productAnimation = animate(pageRef.value.querySelectorAll(".product-item"), {
    opacity: { from: 0 },
    y: { from: 18 },
    delay: stagger(70),
    duration: 420,
    ease: "outCubic",
  });
};

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
  drawerAnimation?.revert();
  drawerImageAnimation?.revert();
  productAnimation?.revert();
});
</script>

<template>
  <WarmProjectLayout
    eyebrow="Commerce lab / Storefront system"
    page-code="003"
    :stats="projectStats"
    subtitle="围绕商品浏览、认证、交易数据与接口联调构建的电商前端实验场。"
    title="Ecommerce Platform"
  >
    <template #visual>
      <div class="commerce-terminal">
        <div class="terminal-header">
          <span>Store pulse / Live</span>
          <i></i>
        </div>
        <div class="terminal-value">
          <span>Net sales</span>
          <strong>¥ 84,620</strong>
          <small>+18.6% / This month</small>
        </div>
        <div class="terminal-orders">
          <div><span>#2048</span><strong>Electronics</strong><i>¥ 1,299</i></div>
          <div><span>#2047</span><strong>Fashion</strong><i>¥ 689</i></div>
          <div><span>#2046</span><strong>Home</strong><i>¥ 428</i></div>
        </div>
      </div>
    </template>

    <div ref="pageRef" class="commerce-content">
      <section class="overview-section">
        <span class="section-number">01</span>
        <div>
          <p class="section-kicker">Overview / Store logic</p>
          <h2>项目介绍</h2>
        </div>
        <p>
          页面保留商品浏览、用户认证、品类分析和接口请求能力，并把展示结构调整为更接近运营工作台的阅读节奏。
        </p>
      </section>

      <section class="feature-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Capabilities / Explore</p>
            <h2>核心功能</h2>
          </div>
          <span>04 Modules</span>
        </div>
        <div class="feature-grid">
          <button
            v-for="(feature, index) in features"
            :key="feature.name"
            class="feature-tile"
            type="button"
            @click="openFeature(feature.name)"
          >
            <span>0{{ index + 1 }}</span>
            <strong>{{ feature.icon }}</strong>
            <h3>{{ feature.name }}</h3>
            <small>Open preview ↗</small>
          </button>
        </div>
      </section>

      <section class="tech-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Technology / Foundation</p>
            <h2>技术栈</h2>
          </div>
          <span>04 Tools</span>
        </div>
        <div class="tech-rail">
          <div v-for="(tech, index) in techStack" :key="tech.name" class="tech-item">
            <span>0{{ index + 1 }}</span>
            <i>{{ tech.icon }}</i>
            <strong>{{ tech.name }}</strong>
          </div>
        </div>
      </section>

      <section class="analytics-section">
        <div class="analytics-copy">
          <span class="section-number">03</span>
          <p class="section-kicker">Analytics / Category share</p>
          <h2>销售结构</h2>
          <p>用玫瑰图观察各品类贡献，让界面在视觉表达之外保留可比较的数据结构。</p>
        </div>
        <VChart :option="ringChartOption" autoresize class="ring-chart" />
      </section>

      <section class="api-section">
        <div class="section-heading">
          <div>
            <p class="section-kicker">API demo / Connected tools</p>
            <h2>接口演示</h2>
          </div>
          <span>Login / Products</span>
        </div>

        <div class="demo-grid">
          <n-card title="User Login" class="demo-card">
            <form class="login-form" @submit.prevent="handleLogin">
              <label class="form-field">
                <span>Username</span>
                <input v-model="loginData.username" type="text" placeholder="Enter username" />
              </label>
              <label class="form-field">
                <span>Password</span>
                <input v-model="loginData.password" type="password" placeholder="Enter password" />
              </label>
              <button class="demo-action" type="submit" :disabled="loginLoading">
                {{ loginLoading ? "Logging in..." : "Login" }}
              </button>
            </form>
          </n-card>

          <n-card title="Product Data" class="demo-card">
            <button class="demo-action" type="button" :disabled="loading" @click="handleFetchProducts">
              {{ loading ? "Loading..." : "Fetch Products" }}
            </button>
            <p v-if="apiError" class="error-message">{{ apiError }}</p>
            <p v-else-if="loading" class="loading-message">Loading products...</p>
            <div v-else-if="products.length" class="products-list">
              <article
                v-for="(product, index) in products"
                :key="productKey(product, index)"
                class="product-item"
              >
                <h4>{{ productTitle(product) }}</h4>
                <p>{{ productDescription(product) }}</p>
              </article>
            </div>
            <p v-else class="empty-message">No product data loaded.</p>
          </n-card>
        </div>
      </section>
    </div>

    <n-drawer
      v-model:show="showDrawer"
      height="72%"
      placement="bottom"
      :content-style="drawerContentStyle"
    >
      <n-drawer-content :title="selectedFeature" :native-scrollbar="false">
        <div ref="drawerContentRef" class="drawer-content">
          <n-carousel show-arrow class="preview-carousel">
            <img
              v-for="(image, index) in previewImages"
              :key="image"
              class="carousel-img"
              :src="image"
              :alt="`电商平台预览图 ${index + 1}`"
            />
          </n-carousel>
        </div>
      </n-drawer-content>
    </n-drawer>
  </WarmProjectLayout>
</template>

<style scoped lang="scss">
.commerce-terminal {
  display: grid;
  gap: 1.4rem;
  width: min(440px, 100%);
  min-height: 340px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 212, 174, 0.22);
  background:
    linear-gradient(145deg, rgba(255, 179, 95, 0.1), transparent 46%),
    rgba(255, 245, 235, 0.025);
  clip-path: polygon(10% 0, 100% 0, 100% 88%, 88% 100%, 0 100%, 0 10%);
  box-shadow: 28px 28px 0 rgba(255, 112, 81, 0.055);
}

.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 235, 218, 0.62);
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
}

.terminal-header i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a7ef9d;
  box-shadow: 0 0 14px rgba(167, 239, 157, 0.7);
}

.terminal-value {
  display: grid;
  gap: 0.3rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid rgba(255, 212, 174, 0.2);
}

.terminal-value span,
.terminal-value small {
  color: rgba(255, 235, 218, 0.56);
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}

.terminal-value strong {
  font-family: Georgia, serif;
  font-size: 3.7rem;
  font-weight: 500;
}

.terminal-value small {
  color: #72d8cf;
}

.terminal-orders {
  display: grid;
}

.terminal-orders div {
  display: grid;
  grid-template-columns: 62px 1fr auto;
  gap: 0.8rem;
  align-items: center;
  min-height: 44px;
  border-bottom: 1px solid rgba(255, 212, 174, 0.14);
  font-size: 0.78rem;
}

.terminal-orders span,
.terminal-orders i {
  color: rgba(255, 235, 218, 0.52);
  font-style: normal;
}

.commerce-content {
  display: grid;
}

.overview-section {
  display: grid;
  grid-template-columns: 70px minmax(240px, 0.7fr) minmax(360px, 1.3fr);
  gap: 3rem;
  align-items: end;
  padding: 6.5rem 1rem;
  border-bottom: 1px solid rgba(255, 212, 174, 0.2);
}

.overview-section > p,
.analytics-copy > p:last-child {
  margin: 0;
  color: rgba(255, 235, 218, 0.68);
  line-height: 1.95;
}

.section-number,
.section-heading > span {
  color: rgba(255, 215, 181, 0.44);
  font-family: "Fira Code", monospace;
  font-size: 0.74rem;
  text-transform: uppercase;
}

.section-kicker {
  margin: 0 0 0.65rem;
  color: #ffb45f;
  font-size: 0.74rem;
  font-weight: 900;
  text-transform: uppercase;
}

.overview-section h2,
.section-heading h2,
.analytics-copy h2 {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 3.4rem;
  font-weight: 600;
  letter-spacing: 0;
}

.feature-section,
.tech-section,
.analytics-section,
.api-section {
  padding: 6.5rem 1rem;
  border-bottom: 1px solid rgba(255, 212, 174, 0.2);
}

.section-heading {
  display: flex;
  gap: 2rem;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 2.3rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid rgba(255, 212, 174, 0.2);
  border-left: 1px solid rgba(255, 212, 174, 0.2);
}

.feature-tile {
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  min-width: 0;
  min-height: 250px;
  padding: 1.25rem;
  color: #fff8ee;
  font: inherit;
  text-align: left;
  cursor: pointer;
  border: 0;
  border-right: 1px solid rgba(255, 212, 174, 0.2);
  border-bottom: 1px solid rgba(255, 212, 174, 0.2);
  background: rgba(255, 245, 235, 0.025);
  transition: background-color 200ms ease, transform 200ms ease;
}

.feature-tile:hover {
  z-index: 1;
  background: rgba(255, 145, 86, 0.1);
  transform: translateY(-5px);
}

.feature-tile > span,
.feature-tile small {
  color: rgba(255, 235, 218, 0.52);
  font-size: 0.68rem;
  text-transform: uppercase;
}

.feature-tile strong {
  align-self: center;
  color: #ffb45f;
  font-family: Georgia, serif;
  font-size: 2.7rem;
}

.feature-tile h3 {
  margin: 0 0 0.45rem;
  font-family: Georgia, serif;
  font-size: 1.25rem;
  overflow-wrap: anywhere;
}

.tech-rail {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid rgba(255, 212, 174, 0.2);
  border-bottom: 1px solid rgba(255, 212, 174, 0.2);
}

.tech-item {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 0.8rem;
  align-items: center;
  min-height: 84px;
  padding: 1rem;
}

.tech-item + .tech-item {
  border-left: 1px solid rgba(255, 212, 174, 0.2);
}

.tech-item span {
  color: rgba(255, 235, 218, 0.46);
  font-family: "Fira Code", monospace;
  font-size: 0.68rem;
}

.tech-item i {
  color: #ffb45f;
  font-style: normal;
  font-weight: 900;
}

.analytics-section {
  display: grid;
  grid-template-columns: minmax(280px, 0.7fr) minmax(480px, 1.3fr);
  gap: 4rem;
  align-items: center;
  background: linear-gradient(100deg, rgba(255, 173, 95, 0.05), rgba(207, 55, 91, 0.045));
}

.analytics-copy {
  display: grid;
  gap: 0.8rem;
}

.ring-chart {
  width: 100%;
  height: 440px;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.demo-card {
  min-width: 0;
  border-radius: 4px;
}

:deep(.n-card) {
  color: #fff8ee;
  border: 1px solid rgba(255, 212, 174, 0.2);
  background: rgba(255, 245, 235, 0.035);
}

:deep(.n-card-header) {
  color: #fff0df;
  font-family: Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 212, 174, 0.14);
}

.login-form,
.form-field {
  display: grid;
}

.login-form {
  gap: 1rem;
}

.form-field {
  gap: 0.45rem;
}

.form-field span {
  color: rgba(255, 235, 218, 0.66);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
}

.form-field input {
  width: 100%;
  min-height: 44px;
  padding: 0 0.8rem;
  color: #fff8ee;
  border: 1px solid rgba(255, 212, 174, 0.2);
  border-radius: 3px;
  outline: none;
  background: rgba(22, 9, 13, 0.56);
}

.form-field input:focus {
  border-color: rgba(255, 180, 95, 0.72);
  box-shadow: 0 0 0 3px rgba(255, 180, 95, 0.1);
}

.demo-action {
  min-height: 44px;
  padding: 0 1rem;
  color: #261014;
  font: inherit;
  font-weight: 900;
  cursor: pointer;
  border: 1px solid #ffbd7a;
  border-radius: 3px;
  background: linear-gradient(120deg, #ffc17f, #ff765f);
  transition: transform 180ms ease, filter 180ms ease;
}

.demo-action:hover:not(:disabled) {
  filter: brightness(1.06);
  transform: translateY(-2px);
}

.demo-action:disabled {
  cursor: wait;
  opacity: 0.58;
}

.error-message,
.loading-message,
.empty-message,
.product-item {
  padding: 0.9rem;
  margin: 0.9rem 0 0;
  border: 1px solid rgba(255, 212, 174, 0.14);
  background: rgba(22, 9, 13, 0.42);
}

.error-message {
  color: #ffaaa1;
  border-color: rgba(255, 107, 89, 0.3);
}

.loading-message,
.empty-message {
  color: rgba(255, 235, 218, 0.58);
}

.products-list {
  display: grid;
  gap: 0.7rem;
  max-height: 360px;
  margin-top: 0.9rem;
  overflow: auto;
}

.product-item {
  margin: 0;
}

.product-item h4 {
  margin: 0 0 0.4rem;
}

.product-item p {
  margin: 0;
  color: rgba(255, 235, 218, 0.62);
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.preview-carousel,
.carousel-img {
  width: 100%;
  height: min(520px, 58vh);
}

.carousel-img {
  display: block;
  object-fit: cover;
}

@media (max-width: 980px) {
  .feature-grid,
  .tech-rail,
  .demo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .analytics-section {
    grid-template-columns: 1fr;
  }

  .tech-item:nth-child(3) {
    border-left: 0;
  }

  .tech-item:nth-child(n + 3) {
    border-top: 1px solid rgba(255, 212, 174, 0.2);
  }
}

@media (max-width: 720px) {
  .overview-section {
    grid-template-columns: 1fr;
    gap: 1.4rem;
    padding: 5rem 0.4rem;
  }

  .feature-section,
  .tech-section,
  .analytics-section,
  .api-section {
    padding: 5rem 0.4rem;
  }

  .overview-section h2,
  .section-heading h2,
  .analytics-copy h2 {
    font-size: 2.5rem;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .feature-grid,
  .tech-rail,
  .demo-grid {
    grid-template-columns: 1fr;
  }

  .feature-tile {
    min-height: 220px;
  }

  .tech-item + .tech-item,
  .tech-item:nth-child(3) {
    border-top: 1px solid rgba(255, 212, 174, 0.2);
    border-left: 0;
  }

  .terminal-value strong {
    font-size: 3rem;
  }

  .ring-chart {
    height: 360px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .feature-tile,
  .demo-action {
    transition: none;
  }
}
</style>
