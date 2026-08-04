<script setup lang="ts">
import { shallowRef } from "vue";
import WarmProjectLayout from "./WarmProjectLayout.vue";

interface ShowcaseItem {
  icon: string;
  name: string;
}

const props = defineProps<{
  eyebrow: string;
  features: readonly ShowcaseItem[];
  images: readonly string[];
  kind: "data" | "editorial";
  overview: string;
  pageCode: string;
  subtitle: string;
  techStack: readonly ShowcaseItem[];
  title: string;
}>();

const showDrawer = shallowRef(false);
const selectedFeature = shallowRef("");

const drawerContentStyle = {
  background: "linear-gradient(135deg, rgba(35, 14, 18, 0.98), rgba(82, 30, 34, 0.98))",
  backdropFilter: "blur(20px)",
};

const openFeature = (featureName: string) => {
  selectedFeature.value = featureName;
  showDrawer.value = true;
};
</script>

<template>
  <WarmProjectLayout
    :eyebrow="eyebrow"
    :page-code="pageCode"
    :stats="[
      { value: features.length, label: 'Feature modules' },
      { value: techStack.length, label: 'Core technologies' },
      { value: kind === 'data' ? 'LIVE' : 'STORY', label: 'Project mode' },
    ]"
    :subtitle="subtitle"
    :title="title"
  >
    <template #visual>
      <div class="showcase-preview" :class="`showcase-preview--${kind}`">
        <div class="preview-header">
          <span>{{ kind === "data" ? "Realtime signal" : "Reading system" }}</span>
          <i></i>
        </div>

        <template v-if="kind === 'editorial'">
          <strong class="editorial-mark">Aa</strong>
          <div class="editorial-lines" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>
          <p>Ideas become an interface.</p>
        </template>

        <template v-else>
          <div class="data-value">
            <strong>84.6</strong>
            <span>+12.4%</span>
          </div>
          <div class="data-bars" aria-hidden="true">
            <i v-for="height in [38, 54, 46, 72, 61, 88, 78, 96]" :key="height" :style="{ height: `${height}%` }"></i>
          </div>
          <p>Streaming insight / 08 dimensions</p>
        </template>
      </div>
    </template>

    <section class="overview-section">
      <span class="section-number">01</span>
      <div>
        <p class="section-kicker">Overview / Intent</p>
        <h2>项目介绍</h2>
      </div>
      <p class="overview-copy">{{ overview }}</p>
    </section>

    <section class="feature-section">
      <div class="section-heading">
        <div>
          <p class="section-kicker">Capabilities / Explore</p>
          <h2>主要功能</h2>
        </div>
        <span>{{ features.length.toString().padStart(2, "0") }} Modules</span>
      </div>

      <div class="feature-grid">
        <button
          v-for="(feature, index) in features"
          :key="feature.name"
          class="feature-tile"
          type="button"
          @click="openFeature(feature.name)"
        >
          <span class="feature-index">0{{ index + 1 }}</span>
          <span class="feature-icon" aria-hidden="true">{{ feature.icon }}</span>
          <strong>{{ feature.name }}</strong>
          <span class="feature-command">Open preview ↗</span>
        </button>
      </div>
    </section>

    <section class="tech-section">
      <div class="section-heading">
        <div>
          <p class="section-kicker">Technology / Foundation</p>
          <h2>技术栈</h2>
        </div>
        <span>{{ techStack.length.toString().padStart(2, "0") }} Tools</span>
      </div>

      <div class="tech-rail">
        <div v-for="(tech, index) in techStack" :key="tech.name" class="tech-item">
          <span>0{{ index + 1 }}</span>
          <i aria-hidden="true">{{ tech.icon }}</i>
          <strong>{{ tech.name }}</strong>
        </div>
      </div>
    </section>

    <n-drawer
      v-model:show="showDrawer"
      height="72%"
      placement="bottom"
      :content-style="drawerContentStyle"
    >
      <n-drawer-content :title="selectedFeature" :native-scrollbar="false">
        <n-carousel show-arrow class="preview-carousel">
          <img
            v-for="(image, index) in props.images"
            :key="image"
            class="carousel-img"
            :src="image"
            :alt="`${title}预览图 ${index + 1}`"
          />
        </n-carousel>
      </n-drawer-content>
    </n-drawer>
  </WarmProjectLayout>
</template>

<style scoped lang="scss">
.showcase-preview {
  position: relative;
  display: grid;
  align-content: space-between;
  width: min(430px, 100%);
  min-height: 330px;
  padding: 1.5rem;
  overflow: hidden;
  border: 1px solid rgba(255, 212, 174, 0.22);
  background:
    linear-gradient(145deg, rgba(255, 179, 95, 0.1), transparent 46%),
    rgba(255, 245, 235, 0.025);
  clip-path: polygon(10% 0, 100% 0, 100% 88%, 88% 100%, 0 100%, 0 10%);
  box-shadow: 28px 28px 0 rgba(255, 112, 81, 0.055);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 235, 218, 0.62);
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
}

.preview-header i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a7ef9d;
  box-shadow: 0 0 14px rgba(167, 239, 157, 0.7);
}

.editorial-mark {
  color: transparent;
  font-family: Georgia, serif;
  font-size: 8rem;
  font-weight: 600;
  line-height: 1;
  -webkit-text-stroke: 1px rgba(255, 190, 137, 0.66);
}

.editorial-lines {
  display: grid;
  gap: 0.55rem;
}

.editorial-lines span {
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 187, 124, 0.7), transparent);
}

.editorial-lines span:nth-child(2) { width: 82%; }
.editorial-lines span:nth-child(3) { width: 68%; }
.editorial-lines span:nth-child(4) { width: 44%; }

.showcase-preview p {
  margin: 0;
  color: rgba(255, 235, 218, 0.62);
  font-family: "Fira Code", monospace;
  font-size: 0.72rem;
}

.data-value {
  display: flex;
  gap: 1rem;
  align-items: baseline;
}

.data-value strong {
  font-family: Georgia, serif;
  font-size: 5.4rem;
  font-weight: 500;
}

.data-value span {
  color: #72d8cf;
  font-weight: 900;
}

.data-bars {
  display: flex;
  gap: 0.45rem;
  align-items: end;
  height: 120px;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 212, 174, 0.18);
}

.data-bars i {
  flex: 1;
  min-height: 10px;
  background: linear-gradient(to top, #dd416c, #ffb45f);
}

.overview-section {
  display: grid;
  grid-template-columns: 70px minmax(240px, 0.7fr) minmax(360px, 1.3fr);
  gap: 3rem;
  align-items: end;
  padding: 6.5rem 1rem;
  border-bottom: 1px solid rgba(255, 212, 174, 0.2);
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
.section-heading h2 {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 3.4rem;
  font-weight: 600;
  letter-spacing: 0;
}

.overview-copy {
  margin: 0;
  color: rgba(255, 235, 218, 0.68);
  font-size: 1rem;
  line-height: 1.95;
}

.feature-section,
.tech-section {
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
  grid-template-rows: auto 1fr auto;
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

.feature-index,
.feature-command {
  color: rgba(255, 235, 218, 0.56);
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}

.feature-icon {
  align-self: center;
  font-size: 2.5rem;
}

.feature-tile strong {
  align-self: end;
  margin-bottom: 0.5rem;
  font-family: Georgia, serif;
  font-size: 1.35rem;
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
  font-style: normal;
  font-size: 1.35rem;
}

.tech-item strong {
  min-width: 0;
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
  .tech-rail {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
  .tech-section {
    padding: 5rem 0.4rem;
  }

  .overview-section h2,
  .section-heading h2 {
    font-size: 2.5rem;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .feature-grid,
  .tech-rail {
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
}

@media (prefers-reduced-motion: reduce) {
  .feature-tile {
    transition: none;
  }
}
</style>
