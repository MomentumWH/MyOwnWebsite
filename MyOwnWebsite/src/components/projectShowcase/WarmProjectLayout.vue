<script setup lang="ts">
import ProjectNav from "@/components/projectNav/index.vue";

interface ProjectStat {
  label: string;
  value: string | number;
}

defineProps<{
  eyebrow: string;
  pageCode: string;
  stats: readonly ProjectStat[];
  subtitle: string;
  title: string;
}>();
</script>

<template>
  <div class="warm-project-page">
    <div class="ambient-lines" aria-hidden="true"></div>

    <div class="project-shell">
      <ProjectNav tone="warm" />

      <header class="project-hero">
        <div class="hero-copy">
          <div class="hero-meta">
            <span>Project archive / {{ pageCode }}</span>
            <span>Chonny Lab / 2026</span>
          </div>
          <p class="hero-kicker">{{ eyebrow }}</p>
          <h1>{{ title }}</h1>
          <p class="hero-subtitle">{{ subtitle }}</p>
        </div>

        <div class="hero-visual">
          <span class="hero-index">/ {{ pageCode }}</span>
          <slot name="visual"></slot>
        </div>

        <div class="hero-stats" aria-label="项目概览">
          <div v-for="stat in stats" :key="stat.label" class="hero-stat">
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        </div>
      </header>

      <main class="project-content">
        <slot></slot>
      </main>

      <footer class="project-footer">
        <span>Chonny Lab / Project Center</span>
        <span>{{ eyebrow }}</span>
      </footer>
    </div>

    <n-back-top :right="32" />
  </div>
</template>

<style scoped lang="scss">
.warm-project-page {
  --ink: #fff8ee;
  --muted: rgba(255, 235, 218, 0.66);
  --line: rgba(255, 212, 174, 0.2);
  --amber: #ffb45f;
  --coral: #ff6b59;
  --rose: #dd416c;
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  color: var(--ink);
  font-family: "Lato", "Microsoft YaHei", sans-serif;
  background:
    linear-gradient(118deg, rgba(255, 139, 75, 0.1) 0%, transparent 28%),
    linear-gradient(300deg, rgba(205, 49, 90, 0.12) 0%, transparent 34%),
    linear-gradient(145deg, #160b0f 0%, #291014 42%, #471d19 74%, #1a0c12 100%);
}

.warm-project-page::before {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: "";
  background-image:
    linear-gradient(rgba(255, 222, 192, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 222, 192, 0.045) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(to bottom, #000 0%, transparent 82%);
}

.warm-project-page::after {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: "";
  background:
    linear-gradient(105deg, transparent 0 58%, rgba(255, 180, 95, 0.05) 58.1% 58.3%, transparent 58.4%),
    repeating-linear-gradient(115deg, transparent 0 96px, rgba(255, 255, 255, 0.018) 97px 98px);
}

.ambient-lines {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 0;
  width: 44vw;
  height: 100vh;
  pointer-events: none;
  border-left: 1px solid rgba(255, 180, 95, 0.08);
  background:
    repeating-linear-gradient(105deg, transparent 0 72px, rgba(255, 160, 94, 0.028) 73px 74px),
    linear-gradient(120deg, transparent, rgba(255, 114, 82, 0.025));
}

.project-shell {
  position: relative;
  z-index: 1;
  width: min(1480px, calc(100% - 48px));
  margin: 0 auto;
  padding: 24px 0 32px;
}

.project-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr);
  grid-template-rows: minmax(440px, 1fr) auto;
  min-height: min(620px, calc(100svh - 150px));
  margin-top: 20px;
  overflow: hidden;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.project-hero::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 58%;
  width: 1px;
  content: "";
  background: linear-gradient(to bottom, transparent, rgba(255, 199, 153, 0.34), transparent);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 3rem 4rem 3rem 1rem;
}

.hero-meta,
.project-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--muted);
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}

.hero-meta {
  max-width: 680px;
  margin-bottom: 2.2rem;
}

.hero-kicker {
  margin: 0 0 0.8rem;
  color: var(--amber);
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
}

.hero-copy h1 {
  max-width: 820px;
  margin: 0;
  color: var(--ink);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 5.4rem;
  font-weight: 600;
  line-height: 0.96;
  letter-spacing: 0;
  overflow-wrap: anywhere;
}

.hero-subtitle {
  max-width: 650px;
  margin: 1.6rem 0 0;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.9;
}

.hero-visual {
  position: relative;
  display: grid;
  align-content: center;
  min-width: 0;
  padding: 3.5rem 1rem 3.5rem 4rem;
}

.hero-index {
  position: absolute;
  top: 2rem;
  right: 1rem;
  color: rgba(255, 221, 191, 0.44);
  font-family: "Fira Code", monospace;
  font-size: 0.74rem;
}

.hero-stats {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--line);
}

.hero-stat {
  display: flex;
  gap: 1rem;
  align-items: baseline;
  padding: 1rem 1.2rem;
}

.hero-stat + .hero-stat {
  border-left: 1px solid var(--line);
}

.hero-stat strong {
  color: var(--coral);
  font-family: Georgia, serif;
  font-size: 1.8rem;
}

.hero-stat span {
  color: var(--muted);
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}

.project-content {
  display: grid;
}

.project-footer {
  padding: 1.4rem 1rem 0;
  border-top: 1px solid var(--line);
}

@media (max-width: 980px) {
  .project-hero {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .project-hero::before {
    display: none;
  }

  .hero-copy {
    padding: 4rem 0.5rem 2rem;
  }

  .hero-visual {
    padding: 1rem 0.5rem 3rem;
  }
}

@media (max-width: 680px) {
  .project-shell {
    width: min(100% - 28px, 1480px);
    padding-top: 14px;
  }

  .hero-meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.45rem;
  }

  .hero-copy h1 {
    font-size: 3.35rem;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .hero-stat + .hero-stat {
    border-top: 1px solid var(--line);
    border-left: 0;
  }

  .project-footer {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.45rem;
  }
}
</style>
