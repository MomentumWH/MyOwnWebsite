<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NDrawer, NCarousel, NCarouselItem } from 'naive-ui'

const router = useRouter()
const features = ref([
  { name: '商品展示和搜索', icon: '🔍' },
  { name: '购物车和结算', icon: '🛒' },
  { name: '用户登录和注册', icon: '👤' },
  { name: '订单管理', icon: '📦' }
])

const techStack = ref([
  { name: 'Nuxt 3', icon: '⚡' },
  { name: 'Tailwind CSS', icon: '🎨' },
  { name: 'Pinia', icon: '🍍' },
  { name: 'Stripe 支付', icon: '💳' }
])

const showDrawer = ref(false)
const currentFeature = ref('')

const carouselImages = ref([
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=e-commerce%20product%20display%20page%20with%20modern%20UI&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shopping%20cart%20checkout%20page%20design&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20login%20and%20register%20interface&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=order%20management%20dashboard&image_size=square_hd'
])

const goBack = () => {
  router.back()
}

const handleFeatureClick = (featureName: string) => {
  currentFeature.value = featureName
  showDrawer.value = true
}
</script>

<template>
  <div class="project-page">
    <!-- class="project-header" -->
    <header >
       
      <div  class="header-line">
        <div  class="header-line-backButton">
          <button @click="goBack" class="back-button">
            ← 返回首页
          </button>
        </div>
        <div  class="header-line-title">
          <h1>电商平台</h1>
        </div>
        <div  class="header-line-content">
          <p class="project-subtitle">基于 Nuxt 3 的电商平台项目</p>
        </div>
      </div>
    </header>

    <section class="project-details">
      <h2>项目介绍</h2>
      <p>这是一个功能完整的电商平台，支持商品展示、购物车管理、订单结算等功能，采用现代化的技术栈构建，提供良好的用户体验。</p>
    </section>

    <section class="project-features">
      <h2>主要功能</h2>
      <div class="features-grid">
        <div v-for="(feature, index) in features" :key="feature.name" class="feature-card" :style="{ animationDelay: `${index * 0.2}s` }" @click="handleFeatureClick(feature.name)">
          <span class="feature-icon">{{ feature.icon }}</span>
          <h3>{{ feature.name }}</h3>
        </div>
      </div>
    </section>

    <section class="project-tech">
      <h2>技术栈</h2>
      <div class="tech-grid">
        <div v-for="(tech, index) in techStack" :key="tech.name" class="tech-card" :style="{ animationDelay: `${index * 0.2}s` }">
          <span class="tech-icon">{{ tech.icon }}</span>
          <h3>{{ tech.name }}</h3>
        </div>
      </div>
    </section>

    <footer class="project-footer">
      <!-- <button @click="goBack" class="back-button">
        ← 返回首页
      </button> -->
    </footer>

    <n-drawer
      v-model:show="showDrawer"
      :width="'100%'"
      height="70%"
      placement="bottom"
      :native-scrollbar="false"
      :drawer-style="{ 
        borderRadius: '24px 24px 0 0',
        background: 'linear-gradient(135deg, rgba(145, 151, 118, 0.95) 0%, rgba(114, 203, 238, 0.95) 100%)',
        backdropFilter: 'blur(20px)'
      }"
      :content-style="{ padding: 0 }"
    >
      <n-drawer-content 
        title="功能展示" 
        closable 
        :title-style="{ 
          color: 'white', 
          fontSize: '1.5rem',
          fontWeight: 600
        }"
      >
        <div class="drawer-content">
          <h3>{{ currentFeature }}</h3>
          <n-carousel
            :show-dots="true"
            :autoplay="true"
            :interval="3000"
            dot-type="line"
          >
            <n-carousel-item v-for="(image, index) in carouselImages" :key="index">
              <div class="carousel-item">
                <img :src="image" :alt="`功能展示 ${index + 1}`" class="carousel-image" />
              </div>
            </n-carousel-item>
          </n-carousel>
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style  lang="scss" scoped>
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
.header-line{
  display: flex;
  //justify-content: center;
  //align-items: center;
  flex-direction: column;  
}
.header-line-title{
    text-align: center;
    flex:1;
}
.header-line-content{
    text-align: center;
    flex:1;
  }
.header-line-backButton{
    margin-bottom: 2rem;
    text-align: left;
    flex:1;
}
.project-header h1 {
  font-size: 3rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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
  animation: fadeInUp 1s ease forwards;
  opacity: 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  animation: fadeInUp 1s ease forwards;
  opacity: 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
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

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.drawer-content {
  padding: 2rem;
  text-align: center;
  animation: drawerFadeIn 0.5s ease-out;
  height: 100%;
  display: flex;
  flex-direction: column;
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

@keyframes drawerFadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
