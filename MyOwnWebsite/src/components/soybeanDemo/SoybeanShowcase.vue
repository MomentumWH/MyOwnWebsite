<script setup lang="ts">
import { SBadge, SCard, SProgress, STag } from "@soybeanjs/ui";
import type { SoybeanMetric } from "@/composables/useSoybeanDemo";

interface Props {
  completion: number;
  enableMotion: boolean;
  metrics: SoybeanMetric[];
  note: string;
  projectName: string;
  scenarioLabel: string;
  teamSize: number[];
}

defineProps<Props>();
</script>

<template>
  <div class="showcase-grid" :class="{ 'is-animated': enableMotion }">
    <SCard class="preview-card dark-card" title="实时预览" description="根据左侧控制台自动生成摘要。">
      <div class="preview-head">
        <SBadge color="success" size="lg">
          {{ scenarioLabel }}
        </SBadge>
        <STag color="primary" variant="soft">
          {{ teamSize[0] }} 人团队
        </STag>
      </div>
      <h2>{{ projectName }}</h2>
      <p>{{ note }}</p>
      <SProgress :model-value="completion" color="success" size="lg" />
      <template #footer>
        <span class="mini-caption">SoybeanUI components are reactive.</span>
      </template>
    </SCard>

    <SCard class="preview-card metric-card" title="组件状态" description="颜色、尺寸、变体组合。">
      <div class="metric-list">
        <article v-for="metric in metrics" :key="metric.label" class="metric-item">
          <div>
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
          </div>
          <STag :color="metric.color" variant="soft">
            {{ metric.trend }}
          </STag>
        </article>
      </div>
    </SCard>

    <SCard class="preview-card palette-card" title="主题 Token" description="SConfigProvider 可集中控制 size、radius、primary 等。">
      <div class="palette-strip">
        <span class="tone tone-primary" />
        <span class="tone tone-success" />
        <span class="tone tone-warning" />
        <span class="tone tone-carbon" />
      </div>
      <div class="code-card">
        <code>theme.primary = "blue"</code>
        <code>theme.radius = "1rem"</code>
        <code>size = "md"</code>
      </div>
    </SCard>
  </div>
</template>

<style scoped>
.showcase-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 22px;
}

.preview-card {
  border-color: rgba(15, 23, 42, 0.08);
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.08);
}

.dark-card {
  grid-row: span 2;
  overflow: hidden;
  background:
    radial-gradient(circle at 76% 4%, rgba(96, 165, 250, 0.36), transparent 28%),
    linear-gradient(145deg, #111827, #020617);
  color: white;
}

.preview-head {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.dark-card h2 {
  margin: 34px 0 14px;
  font-size: clamp(34px, 5vw, 64px);
  font-weight: 900;
  letter-spacing: -0.06em;
  line-height: 0.96;
}

.dark-card p {
  min-height: 96px;
  margin: 0 0 30px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 17px;
  line-height: 1.8;
}

.mini-caption {
  color: rgba(255, 255, 255, 0.56);
  font-size: 13px;
}

.metric-list {
  display: grid;
  gap: 14px;
}

.metric-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.82);
}

.metric-item span {
  display: block;
  color: #64748b;
  font-size: 13px;
}

.metric-item strong {
  display: block;
  margin-top: 4px;
  color: #0f172a;
  font-size: 28px;
  letter-spacing: -0.05em;
}

.palette-strip {
  display: grid;
  grid-template-columns: 1.4fr 1fr 0.75fr 1.2fr;
  gap: 10px;
  min-height: 110px;
}

.tone {
  border-radius: 22px;
}

.tone-primary {
  background: #2563eb;
}

.tone-success {
  background: #16a34a;
}

.tone-warning {
  background: #f59e0b;
}

.tone-carbon {
  background: #0f172a;
}

.code-card {
  display: grid;
  gap: 8px;
  margin-top: 18px;
  padding: 16px;
  border-radius: 18px;
  background: #0f172a;
  color: #bfdbfe;
  font-family: "Fira Code", monospace;
  font-size: 13px;
}

.is-animated .dark-card {
  animation: float-preview 4s ease-in-out infinite;
}

@keyframes float-preview {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

@media (max-width: 1100px) {
  .showcase-grid {
    grid-template-columns: 1fr;
  }

  .dark-card {
    grid-row: auto;
  }
}

@media (max-width: 720px) {
  .metric-item {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
