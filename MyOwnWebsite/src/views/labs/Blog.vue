<script setup lang="ts">
import { markRaw, ref } from "vue";
import ProjectNav from "@/components/projectNav/index.vue";
import { NDrawer, NCarousel } from "naive-ui";

const features = markRaw([
  { name: "文章发布和管理", icon: "📝" },
  { name: "分类和标签系统", icon: "🏷️" },
  { name: "评论和回复功能", icon: "💬" },
  { name: "响应式阅读体验", icon: "📱" },
]);

const techStack = markRaw([
  { name: "Vue 3 + Composition API", icon: "⚡" },
  { name: "Vite", icon: "🚀" },
  { name: "TypeScript", icon: "📘" },
  { name: "Markdown 编辑器", icon: "✍️" },
]);

const imgList = markRaw([
  "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel1.jpeg",
  "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel2.jpeg",
  "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel3.jpeg",
  "https://naive-ui.oss-cn-beijing.aliyuncs.com/carousel-img/carousel4.jpeg",
]);

const showDrawer = ref(false);
const selectDrawer = ref("");

const handleFeatureClick = (featureName: string) => {
  showDrawer.value = true;
  selectDrawer.value = featureName;
};
</script>

<template>
  <div class="project-page">
    <div class="project-shell">
      <ProjectNav />

      <header class="project-hero">
        <div class="hero-copy">
          <span class="section-kicker">Content Lab</span>
          <h1>个人博客</h1>
          <p class="project-subtitle">使用 Vue 3 和 Vite 构建的个人博客系统</p>
        </div>
        <aside class="hero-panel">
          <div class="hero-stat">
            <strong>{{ features.length }}</strong>
            <span>核心功能模块</span>
          </div>
          <div class="hero-stat">
            <strong>{{ techStack.length }}</strong>
            <span>技术栈能力</span>
          </div>
          <div class="hero-stat">
            <strong>Blue Purple</strong>
            <span>延续首页科技视觉语言</span>
          </div>
        </aside>
      </header>

      <main class="content-grid">
        <section class="content-card">
          <span class="section-kicker">Overview</span>
          <h2>项目介绍</h2>
          <p>这是一个面向内容创作与知识沉淀的个人博客系统，覆盖文章发布、分类标签、评论互动和响应式阅读体验。页面以清晰的信息架构承载内容管理流程，同时延续首页的蓝紫科技玻璃风格。</p>
        </section>

        <section class="content-card">
          <div class="section-heading-row">
            <div>
              <span class="section-kicker">Features</span>
              <h2>主要功能</h2>
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

      <section class="content-card">
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
        <n-carousel show-arrow>
          <img
            v-for="item in imgList"
            :key="item"
            class="carousel-img"
            :src="item"
          />
        </n-carousel>
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
.project-link,
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
.project-link:hover,
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
  position: relative;
  display: grid;
  grid-template-columns: minmax(420px, 1fr) minmax(360px, 0.72fr);
  gap: 1.5rem;
  min-height: 320px;
  padding: 1.5rem;
  overflow: hidden;
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
.hero-copy p,
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

.content-grid {
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

.action-section,
.chart-section,
.api-demo-section {
  display: grid;
  gap: 1.25rem;
}

.project-footer {
  display: none;
}

.carousel-img {
  width: 100%;
  height: 440px;
  object-fit: cover;
  border-radius: 18px;
}

:deep(.n-drawer-content) {
  color: #f4fbff;
}

:deep(.n-carousel__dots) {
  bottom: 20px;
}

:deep(.n-carousel__dot) {
  width: 24px;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.4);
}

:deep(.n-carousel__dot--active) {
  width: 32px;
  background-color: white;
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
  .content-grid {
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


