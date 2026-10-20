<script setup lang="ts">
import { computed, onMounted, shallowRef, useTemplateRef, watch } from "vue";
import { useRoute } from "vue-router";
import { ArrowForwardOutline, SearchOutline } from "@vicons/ionicons5";
import ProjectNav from "@/components/projectNav/index.vue";
import GuideHero from "./components/GuideHero.vue";
import GuideSidebar from "./components/GuideSidebar.vue";
import GuideArticle from "./components/GuideArticle.vue";
import { guideArticles, searchGuideArticles } from "./content";

const route = useRoute();
const contentRef = useTemplateRef<HTMLElement>("guideContent");
const query = shallowRef("");
const searching = computed(() => query.value.trim().length > 0);
const results = computed(() => searchGuideArticles(query.value));
const activeIndex = computed(() =>
  Math.max(
    0,
    guideArticles.findIndex((article) => `#${article.id}` === route.hash),
  ),
);
const activeArticle = computed(() => guideArticles[activeIndex.value]!);
const previousArticle = computed(() => guideArticles[activeIndex.value - 1]);
const nextArticle = computed(() => guideArticles[activeIndex.value + 1]);

function scrollToChapter(): void {
  if (route.name !== "guide" || !route.hash) return;

  contentRef.value?.scrollIntoView({
    block: "start",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
}

onMounted(scrollToChapter);
watch(() => route.hash, scrollToChapter, { flush: "post" });
</script>

<template>
  <div class="guide-page">
    <a
      class="skip-link"
      href="#guide-content"
      @click.prevent="contentRef?.focus()"
    >
      跳到教程内容
    </a>
    <div class="guide-shell">
      <ProjectNav tone="warm" :show-default-action="false">
        <template #action>
          <RouterLink to="/cs-items" class="explore-link">
            开始探索
            <ArrowForwardOutline aria-hidden="true" />
          </RouterLink>
        </template>
      </ProjectNav>
      <GuideHero v-model="query" :article-count="guideArticles.length" />
      <div class="guide-layout">
        <GuideSidebar
          :articles="results"
          :active-id="activeArticle.id"
          :searching="searching"
          @select="query = ''"
        />
        <main
          id="guide-content"
          ref="guideContent"
          class="guide-main"
          tabindex="-1"
        >
          <section
            v-if="searching"
            class="search-results"
            aria-labelledby="search-title"
          >
            <p class="results-label" role="status">
              全文搜索 · {{ results.length }} 篇相关教程
            </p>
            <h2 id="search-title" class="results-title">
              “{{ query.trim() }}” 的搜索结果
            </h2>
            <div v-if="results.length" class="results-list">
              <RouterLink
                v-for="article in results"
                :key="article.id"
                :to="{ name: 'guide', hash: `#${article.id}` }"
                class="result-link"
                @click="query = ''"
              >
                <span class="result-category">
                  {{ article.category }} / {{ article.duration }}
                </span>
                <strong>
                  {{ article.title }}
                  <ArrowForwardOutline aria-hidden="true" />
                </strong>
                <p>{{ article.description }}</p>
              </RouterLink>
            </div>
            <div v-else class="empty-results">
              <SearchOutline aria-hidden="true" />
              <h3>暂时没有找到相关教程</h3>
              <p>
                试试「饰品」「登录」或「助手」，也可以清空搜索浏览全部章节。
              </p>
              <button type="button" class="clear-search" @click="query = ''">
                清空搜索
              </button>
            </div>
          </section>
          <GuideArticle
            v-else
            :key="activeArticle.id"
            :article="activeArticle"
            :index="activeIndex"
            :total="guideArticles.length"
            :previous="previousArticle"
            :next="nextArticle"
          />
        </main>
      </div>
      <footer class="guide-footer">
        <span>
          CHONNY LAB
          <span class="footer-divider">/</span>
          教程中心
        </span>
        <span>
          保持好奇，继续探索。
          <span class="footer-dot"></span>
        </span>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.guide-page {
  --guide-text: #f6e9dd;
  --guide-muted: #af9d91;
  --guide-accent: #edb276;
  --guide-border: #f1c3981f;
  min-height: 100vh;
  color: var(--guide-text);
  background:
    radial-gradient(ellipse at 88% 0, #672b2333, transparent 48%),
    linear-gradient(125deg, #1e1115, #190f11 55%, #201217);
  font-family: "Lato", "PingFang SC", "Microsoft YaHei", sans-serif;
}
.guide-page :deep(*) {
  box-sizing: border-box;
}
.guide-page :deep(a:focus-visible),
.guide-page :deep(button:focus-visible),
.guide-page :deep(summary:focus-visible) {
  outline: 2px solid var(--guide-accent);
  outline-offset: 5px;
}
.guide-shell {
  max-width: 1240px;
  margin: 0 auto;
  padding: 20px 40px 0;
}
.explore-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 15px;
  border: 1px solid #efb47740;
  border-radius: 3px;
  background: #edb2760b;
  color: var(--guide-accent);
  font-size: 12px;
  text-decoration: none;
  white-space: nowrap;
}
.explore-link:hover {
  background: #edb27618;
}
.explore-link svg {
  width: 15px;
  height: 15px;
}
.guide-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 64px;
  padding: 42px 0 70px;
}
.guide-main {
  min-width: 0;
  padding: 0 0 0 42px;
  border-left: 1px solid var(--guide-border);
  scroll-margin-top: 160px;
}
.guide-main:focus {
  outline: none;
}
.guide-footer {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 18px;
  padding: 24px 0 30px;
  border-top: 1px solid var(--guide-border);
  color: var(--guide-muted);
  font-size: 10px;
  letter-spacing: 0.06em;
}
.footer-divider {
  margin: 0 12px;
  color: #786257;
}
.footer-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin: 0 0 1px 12px;
  border-radius: 50%;
  background: var(--guide-accent);
}
.skip-link {
  position: absolute;
  top: -100px;
  left: 20px;
  z-index: 50;
  padding: 12px 20px;
  background: var(--guide-text);
  color: #190f11;
}
.skip-link:focus {
  top: 10px;
}
.results-label {
  margin: 0;
  color: var(--guide-accent);
  font-size: 12px;
}
.results-title {
  margin: 18px 0 30px;
  overflow-wrap: anywhere;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.6;
}
.results-list {
  display: grid;
}
.result-link {
  display: block;
  padding: 22px 0;
  border-bottom: 1px solid var(--guide-border);
  text-decoration: none;
}
.result-category {
  color: var(--guide-muted);
  font-size: 10px;
}
.result-link strong {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 10px 0;
  color: var(--guide-text);
  font-size: 17px;
  font-weight: 500;
}
.result-link:hover strong {
  color: var(--guide-accent);
}
.result-link svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--guide-accent);
}
.result-link p,
.empty-results p {
  color: var(--guide-muted);
  font-size: 13px;
  line-height: 1.9;
}
.empty-results {
  padding: 50px 20px;
  border: 1px dashed var(--guide-border);
  text-align: center;
}
.empty-results > svg {
  width: 32px;
  height: 32px;
  color: var(--guide-accent);
}
.empty-results h3 {
  margin-top: 18px;
  font-size: 18px;
  font-weight: 500;
}
.clear-search {
  margin-top: 12px;
  padding: 10px 20px;
  border: 1px solid #edb27655;
  border-radius: 3px;
  background: #edb2760d;
  color: var(--guide-accent);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
@media (max-width: 1100px) {
  .guide-layout {
    grid-template-columns: 200px minmax(0, 1fr);
    gap: 32px;
  }
  .guide-main {
    padding-left: 30px;
  }
}
@media (max-width: 800px) {
  .guide-shell {
    padding: 16px 24px 0;
  }
  .guide-layout {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 30px 0 50px;
  }
  .guide-main {
    padding: 28px 0 0;
    border-left: 0;
    border-top: 1px solid var(--guide-border);
  }
}
@media (max-width: 480px) {
  .guide-shell {
    padding: 12px 18px 0;
  }
  .explore-link {
    padding: 9px 10px;
    font-size: 11px;
  }
}
</style>
