<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const features = ref([
  { name: '文章发布和管理', icon: '📝' },
  { name: '分类和标签系统', icon: '🏷️' },
  { name: '评论和回复功能', icon: '💬' },
  { name: '响应式设计', icon: '📱' }
])

const techStack = ref([
  { name: 'Vue 3 + Composition API', icon: '⚡' },
  { name: 'Vite', icon: '🚀' },
  { name: 'TypeScript', icon: '📘' },
  { name: 'Markdown 编辑器', icon: '✍️' }
])

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="project-page">
    <header class="project-header">
      <h1>个人博客</h1>
      <p class="project-subtitle">使用 Vue 3 和 Vite 构建的个人博客系统</p>
    </header>

    <section class="project-details">
      <h2>项目介绍</h2>
      <p>这是一个功能完整的个人博客系统，支持文章发布、分类管理、评论互动等功能，采用现代化的技术栈构建，提供良好的用户体验。</p>
    </section>

    <section class="project-features">
      <h2>主要功能</h2>
      <div class="features-grid">
        <div v-for="(feature, index) in features" :key="feature.name" class="feature-card" :style="{ animationDelay: `${index * 0.2}s` }">
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
      <button @click="goBack" class="back-button">
        ← 返回首页
      </button>
    </footer>
  </div>
</template>

<style scoped>
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
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #8a5ab9 100%);
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
</style>
