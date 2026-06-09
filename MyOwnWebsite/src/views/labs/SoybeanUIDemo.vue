<script setup lang="ts">
import { SConfigProvider, SSeparator, STabs } from "@soybeanjs/ui";
import SoybeanControlPanel from "@/components/soybeanDemo/SoybeanControlPanel.vue";
import SoybeanHero from "@/components/soybeanDemo/SoybeanHero.vue";
import SoybeanShowcase from "@/components/soybeanDemo/SoybeanShowcase.vue";
import { useSoybeanDemo } from "@/composables/useSoybeanDemo";

const {
  activeTab,
  completion,
  enableMotion,
  metrics,
  note,
  projectName,
  randomizeDemo,
  scenarioLabel,
  scenarioOptions,
  selectedScenario,
  tabs,
  teamSize,
} = useSoybeanDemo();

const themeConfig = {
  theme: {
    base: "slate",
    primary: "cyan",
    feedback: "classic",
    radius: "1rem",
  },
  size: "md",
};
</script>

<template>
  <SConfigProvider :theme="themeConfig">
    <main class="soybean-page">
      <div class="tech-ambient" aria-hidden="true">
        <span class="tech-ambient__orb tech-ambient__orb--blue"></span>
        <span class="tech-ambient__orb tech-ambient__orb--mint"></span>
        <span class="tech-ambient__orb tech-ambient__orb--violet"></span>
        <span class="tech-ambient__beam"></span>
      </div>
      <SoybeanHero :completion="completion" :scenario-label="scenarioLabel" @randomize="randomizeDemo" />

      <section class="demo-tabs-section">
        <STabs v-model="activeTab" :items="tabs" enable-indicator fill="outline" size="lg">
          <template #content="tab">
            <div v-if="tab.value === 'overview'" class="tab-panel">
              <SoybeanControlPanel
                v-model:enable-motion="enableMotion"
                v-model:note="note"
                v-model:project-name="projectName"
                v-model:selected-scenario="selectedScenario"
                v-model:team-size="teamSize"
                :completion="completion"
                :scenario-label="scenarioLabel"
                :scenario-options="scenarioOptions"
              />
              <SoybeanShowcase
                :completion="completion"
                :enable-motion="enableMotion"
                :metrics="metrics"
                :note="note"
                :project-name="projectName"
                :scenario-label="scenarioLabel"
                :team-size="teamSize"
              />
            </div>

            <div v-else-if="tab.value === 'components'" class="info-panel">
              <h2>本页用到的 SoybeanUI 组件</h2>
              <p>SConfigProvider、SButton、SCard、STabs、SInput、SSelect、SSwitch、SSlider、STextarea、SProgress、STag、SBadge、SSeparator。</p>
              <SSeparator label="组合思路" />
              <p>页面负责组合，composable 负责状态，子组件只接收 props 并通过 emits 回传，方便复用和维护。</p>
            </div>

            <div v-else class="info-panel theme-panel">
              <h2>主题配置示例</h2>
              <p>当前页面使用局部 SConfigProvider 设置主题，所以不会影响站点其它页面。</p>
              <pre><code>{{ JSON.stringify(themeConfig, null, 2) }}</code></pre>
            </div>
          </template>
        </STabs>
      </section>
    </main>
  </SConfigProvider>
</template>

<style scoped>
.soybean-page {
  --demo-surface: rgba(15, 23, 42, 0.78);
  --demo-surface-strong: rgba(2, 6, 23, 0.9);
  --demo-border: rgba(148, 163, 184, 0.18);
  --demo-text: #e2e8f0;
  --demo-muted: #94a3b8;
  --demo-cyan: #22d3ee;
  --demo-blue: #60a5fa;

  position: relative;
  min-height: 100vh;
  padding: 42px;
  overflow: hidden;
  isolation: isolate;
  color: var(--demo-text);
  color-scheme: dark;
  background:
    linear-gradient(rgba(148, 163, 184, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.045) 1px, transparent 1px),
    radial-gradient(circle at 12% 12%, rgba(34, 211, 238, 0.2), transparent 34%),
    radial-gradient(circle at 88% 0%, rgba(59, 130, 246, 0.2), transparent 30%),
    linear-gradient(135deg, #020617 0%, #0f172a 48%, #111827 100%);
  background-size: 42px 42px, 42px 42px, auto, auto, auto;
}

.soybean-page::before {
  position: absolute;
  inset: -34%;
  z-index: 0;
  content: "";
  background:
    conic-gradient(
      from 140deg at 50% 50%,
      rgba(34, 211, 238, 0.22),
      rgba(14, 165, 233, 0.2),
      rgba(99, 102, 241, 0.18),
      rgba(34, 211, 238, 0.22)
    );
  filter: blur(92px);
  opacity: 0.62;
  animation: ambient-spin 28s linear infinite;
}

.soybean-page::after {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: "";
  background:
    linear-gradient(115deg, transparent 14%, rgba(125, 211, 252, 0.18) 22%, transparent 34%),
    radial-gradient(circle at 50% 100%, rgba(34, 211, 238, 0.18), transparent 42%);
  opacity: 0.36;
  transform: translateX(-18%);
  animation: scan-drift 9s ease-in-out infinite alternate;
}

.soybean-page > :not(.tech-ambient) {
  position: relative;
  z-index: 1;
}

.tech-ambient {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.tech-ambient__orb {
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 999px;
  filter: blur(46px);
  mix-blend-mode: screen;
  opacity: 0.58;
  animation: orb-float 12s ease-in-out infinite;
}

.tech-ambient__orb--blue {
  top: 8%;
  left: 3%;
  background: rgba(56, 189, 248, 0.34);
}

.tech-ambient__orb--mint {
  right: 8%;
  bottom: 16%;
  width: 380px;
  height: 380px;
  background: rgba(20, 184, 166, 0.28);
  animation-delay: -4s;
}

.tech-ambient__orb--violet {
  top: 34%;
  right: 24%;
  width: 240px;
  height: 240px;
  background: rgba(129, 140, 248, 0.28);
  animation-delay: -8s;
}

.tech-ambient__beam {
  position: absolute;
  top: 8%;
  left: -18%;
  width: 44%;
  height: 140%;
  background: linear-gradient(90deg, transparent, rgba(125, 211, 252, 0.24), transparent);
  filter: blur(18px);
  transform: rotate(18deg);
  animation: beam-pass 10s cubic-bezier(0.45, 0, 0.2, 1) infinite;
}

@keyframes ambient-spin {
  to {
    transform: rotate(1turn);
  }
}

@keyframes scan-drift {
  to {
    transform: translateX(18%);
  }
}

@keyframes orb-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    transform: translate3d(42px, -34px, 0) scale(1.12);
  }
}

@keyframes beam-pass {
  0% {
    transform: translateX(-25%) rotate(18deg);
    opacity: 0;
  }

  18%,
  64% {
    opacity: 0.46;
  }

  100% {
    transform: translateX(320%) rotate(18deg);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .soybean-page::before,
  .soybean-page::after,
  .tech-ambient__orb,
  .tech-ambient__beam {
    animation: none;
  }
}

:deep(.soybean-hero),
:deep(.control-card),
:deep(.preview-card),
.info-panel {
  border-color: var(--demo-border);
  background:
    linear-gradient(145deg, rgba(15, 23, 42, 0.88), rgba(2, 6, 23, 0.72));
  color: var(--demo-text);
  color-scheme: dark;
  box-shadow:
    0 24px 90px rgba(0, 0, 0, 0.38),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(22px);
}

:deep(.hero-copy h1),
:deep(.dark-card h2),
:deep(.metric-item strong),
:deep(.switch-row strong),
:deep(.footer-summary strong),
.info-panel h2 {
  color: #f8fafc;
  text-shadow: 0 0 28px rgba(34, 211, 238, 0.16);
}

:deep(.hero-copy p),
:deep(.dark-card p),
:deep(.switch-row p),
:deep(.field-row),
:deep(.row-between),
:deep(.footer-summary span),
.info-panel p {
  color: var(--demo-muted);
}

:deep(.hero-panel),
:deep(.dark-card),
.theme-panel pre,
:deep(.code-card) {
  border: 1px solid rgba(125, 211, 252, 0.16);
  background:
    radial-gradient(circle at 72% 12%, rgba(34, 211, 238, 0.2), transparent 34%),
    linear-gradient(145deg, rgba(2, 6, 23, 0.96), rgba(15, 23, 42, 0.9));
  color: #e0f2fe;
}

:deep(.metric-item),
:deep(.switch-row) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(15, 23, 42, 0.62);
}

:deep(.tone-primary) {
  background: #22d3ee;
}

:deep(.tone-success) {
  background: #2dd4bf;
}

:deep(.tone-warning) {
  background: #f59e0b;
}

:deep(.tone-carbon) {
  background: #020617;
}
:deep([role="tablist"]),
:deep(input),
:deep(textarea),
:deep([role="combobox"]) {
  border-color: rgba(125, 211, 252, 0.16);
  background-color: rgba(2, 6, 23, 0.64);
  color: var(--demo-text);
}

:deep(input::placeholder),
:deep(textarea::placeholder) {
  color: rgba(148, 163, 184, 0.72);
}

:deep([role="tab"]) {
  color: var(--demo-muted);
}

:deep([role="tab"][aria-selected="true"]),
:deep([role="tab"][data-state="active"]) {
  color: #f8fafc;
}

.demo-tabs-section {
  margin-top: 28px;
}

.tab-panel {
  display: grid;
  grid-template-columns: minmax(360px, 0.85fr) minmax(0, 1.15fr);
  gap: 24px;
  align-items: stretch;
  padding-top: 24px;
}

.info-panel {
  display: grid;
  gap: 18px;
  padding: 34px;
  margin-top: 24px;
  border: 1px solid var(--demo-border);
  border-radius: 30px;
}

.info-panel h2 {
  margin: 0;
  color: #f8fafc;
  font-size: 32px;
  letter-spacing: -0.04em;
}

.info-panel p {
  max-width: 860px;
  margin: 0;
  color: var(--demo-muted);
  font-size: 17px;
  line-height: 1.8;
}

.theme-panel pre {
  overflow: auto;
  padding: 22px;
  border-radius: 22px;
  background: #020617;
  color: #bae6fd;
}

@media (max-width: 1180px) {
  .tab-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .soybean-page {
    padding: 18px;
  }

  .info-panel {
    padding: 24px;
    border-radius: 24px;
  }
}
</style>
