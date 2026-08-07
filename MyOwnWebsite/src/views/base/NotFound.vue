<script setup lang="ts">
import { ArrowBackOutline, HomeOutline } from "@vicons/ionicons5";
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <main class="not-found-page">
    <div class="not-found-grid" aria-hidden="true"></div>
    <section class="not-found-content" aria-labelledby="not-found-title">
      <p class="not-found-code">ERROR / 404</p>
      <h1 id="not-found-title">这个页面暂时不存在</h1>
      <p class="not-found-copy">
        地址可能已经变更，或者它还没有加入 Chonny Lab 的项目目录。
      </p>
      <div class="not-found-actions">
        <button type="button" class="not-found-button not-found-button--primary" @click="router.push('/')">
          <n-icon><HomeOutline /></n-icon>
          返回首页
        </button>
        <button type="button" class="not-found-button" @click="router.back()">
          <n-icon><ArrowBackOutline /></n-icon>
          返回上一页
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.not-found-page {
  position: relative;
  display: grid;
  min-height: 100vh;
  overflow: hidden;
  color: #fff8ee;
  background: #251015;
  place-items: center;
}

.not-found-grid {
  position: absolute;
  inset: 0;
  opacity: 0.32;
  background-image:
    linear-gradient(rgba(255, 190, 132, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 190, 132, 0.1) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent);
}

.not-found-content {
  position: relative;
  z-index: 1;
  width: min(560px, calc(100% - 2rem));
  padding: clamp(2rem, 6vw, 5rem);
  border: 1px solid rgba(255, 190, 132, 0.28);
  background: linear-gradient(140deg, rgba(82, 30, 34, 0.92), rgba(35, 14, 18, 0.96));
  box-shadow: 20px 20px 0 rgba(221, 65, 108, 0.12);
}

.not-found-code {
  margin: 0 0 1rem;
  color: #ffb45f;
  font-family: "Fira Code", monospace;
  font-size: 0.76rem;
  letter-spacing: 0.16em;
}

h1 {
  max-width: 10ch;
  margin: 0;
  font-size: clamp(2.2rem, 6vw, 4.6rem);
  line-height: 0.98;
}

.not-found-copy {
  max-width: 34rem;
  margin: 1.5rem 0 0;
  color: rgba(255, 235, 218, 0.72);
  line-height: 1.8;
}

.not-found-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
}

.not-found-button {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  min-height: 42px;
  padding: 0.7rem 1rem;
  color: #fff8ee;
  border: 1px solid rgba(255, 190, 132, 0.3);
  background: rgba(255, 248, 238, 0.06);
  cursor: pointer;
  transition: transform 180ms ease, background 180ms ease;
}

.not-found-button:hover {
  transform: translateY(-2px);
  background: rgba(255, 248, 238, 0.13);
}

.not-found-button--primary {
  border-color: transparent;
  background: #ff6b59;
}

@media (max-width: 560px) {
  .not-found-actions {
    flex-direction: column;
  }

  .not-found-button {
    justify-content: center;
  }
}
</style>
