<script setup lang="ts">
import { SBadge, SButton, SProgress, STag } from "@soybeanjs/ui";

interface Props {
  completion: number;
  scenarioLabel: string;
}

defineProps<Props>();

const emit = defineEmits<{
  randomize: [];
}>();
</script>

<template>
  <section class="soybean-hero">
    <div class="hero-copy">
      <SBadge color="primary" size="lg">
        @soybeanjs/ui demo
      </SBadge>
      <h1>用 SoybeanUI 搭建一块精致的 Vue 工作台</h1>
      <p>
        这个示例展示了 SoybeanUI 的主题 Provider、按钮、卡片、标签、输入控件、选择器、开关、滑块、进度条和 Tabs。
      </p>
      <div class="hero-actions">
        <SButton color="primary" size="lg" shadow="md" @click="emit('randomize')">
          随机切换配置
        </SButton>
        <SButton color="carbon" variant="outline" size="lg" as="a" href="https://ui.soybeanjs.cn" target="_blank">
          查看官方文档
        </SButton>
      </div>
    </div>

    <div class="hero-panel" aria-label="当前配置摘要">
      <div class="panel-orbit" />
      <STag color="success" variant="soft" size="lg">
        {{ scenarioLabel }}
      </STag>
      <strong>{{ Math.round(completion) }}%</strong>
      <span>Demo 完成度</span>
      <SProgress :model-value="completion" color="primary" size="lg" />
    </div>
  </section>
</template>

<style scoped>
.soybean-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) 380px;
  gap: 32px;
  align-items: stretch;
  padding: 42px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 36px;
  background:
    radial-gradient(circle at 14% 16%, rgba(16, 185, 129, 0.2), transparent 30%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(240, 247, 255, 0.86));
  box-shadow: 0 28px 90px rgba(15, 23, 42, 0.13);
}

.soybean-hero::after {
  position: absolute;
  inset: auto -120px -160px auto;
  width: 340px;
  height: 340px;
  content: "";
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.16);
  filter: blur(18px);
}

.hero-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.hero-copy h1 {
  max-width: 820px;
  margin: 22px 0 18px;
  color: #0f172a;
  font-size: clamp(42px, 6vw, 82px);
  font-weight: 900;
  letter-spacing: -0.07em;
  line-height: 0.94;
}

.hero-copy p {
  max-width: 720px;
  margin: 0;
  color: #475569;
  font-size: 18px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 30px;
}

.hero-panel {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 320px;
  flex-direction: column;
  justify-content: flex-end;
  padding: 28px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 30px;
  background: #0f172a;
  color: white;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
}

.panel-orbit {
  position: absolute;
  top: 34px;
  right: 34px;
  width: 150px;
  height: 150px;
  border: 1px dashed rgba(255, 255, 255, 0.36);
  border-radius: 999px;
}

.panel-orbit::before,
.panel-orbit::after {
  position: absolute;
  content: "";
  border-radius: inherit;
}

.panel-orbit::before {
  inset: 28px;
  border: 1px solid rgba(96, 165, 250, 0.5);
}

.panel-orbit::after {
  top: 12px;
  left: 28px;
  width: 18px;
  height: 18px;
  background: #34d399;
  box-shadow: 52px 94px 0 #60a5fa;
}

.hero-panel strong {
  display: block;
  margin-top: 32px;
  font-size: 74px;
  font-weight: 900;
  letter-spacing: -0.06em;
  line-height: 1;
}

.hero-panel span {
  display: block;
  margin: 8px 0 22px;
  color: rgba(255, 255, 255, 0.68);
}

@media (max-width: 1100px) {
  .soybean-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .soybean-hero {
    padding: 26px;
    border-radius: 26px;
  }

  .hero-panel {
    min-height: 260px;
  }
}
</style>
