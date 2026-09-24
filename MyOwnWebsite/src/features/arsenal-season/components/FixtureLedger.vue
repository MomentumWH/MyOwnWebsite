<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from "vue";
import {
  AirplaneOutline,
  ChevronBackOutline,
  ChevronDownOutline,
  ChevronForwardOutline,
  HomeOutline,
} from "@vicons/ionicons5";
import { NIcon } from "naive-ui";
import FixtureAnalysisPanel from "./FixtureAnalysisPanel.vue";
import PersonalPredictionEditor from "./PersonalPredictionEditor.vue";
import {
  buildFixtureAnalysis,
  formatKickoffTime,
  getMatchResult,
  type ArsenalFixture,
  type FixtureAnalysis,
  type FixtureFilter,
  type PersonalScorePredictionDraft,
} from "../arsenalSeason";

const props = defineProps<{
  activeFilter: FixtureFilter;
  fixtures: readonly ArsenalFixture[];
  loading: boolean;
}>();

const emit = defineEmits<{
  filterChange: [filter: FixtureFilter];
  predictionSave: [fixtureId: string, prediction: PersonalScorePredictionDraft];
}>();

const filters: readonly { key: FixtureFilter; label: string }[] = [
  { key: "all", label: "全部赛程" },
  { key: "completed", label: "已完赛" },
  { key: "upcoming", label: "未完赛" },
];

const pageSize = 10;
const pageTransitionDuration = 800;
const currentPage = shallowRef(1);
const expandedFixtureId = shallowRef<string | null>(null);
const isPageTransitioning = shallowRef(false);
let pageTransitionTimer: ReturnType<typeof setTimeout> | null = null;
const totalPages = computed(() => Math.max(1, Math.ceil(props.fixtures.length / pageSize)));
const pageNumbers = computed(() => Array.from(
  { length: totalPages.value },
  (_, index) => index + 1,
));
const pageStart = computed(() => props.fixtures.length === 0
  ? 0
  : (currentPage.value - 1) * pageSize + 1);
const pageEnd = computed(() => Math.min(currentPage.value * pageSize, props.fixtures.length));
const paginatedFixtures = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return props.fixtures.slice(start, start + pageSize);
});
const analysisById = computed(() => new Map(
  props.fixtures.map((fixture) => [fixture.id, buildFixtureAnalysis(fixture)]),
));

const clearPageTransition = () => {
  if (pageTransitionTimer) {
    clearTimeout(pageTransitionTimer);
    pageTransitionTimer = null;
  }
  isPageTransitioning.value = false;
};

watch(totalPages, (value) => {
  if (currentPage.value > value) {
    clearPageTransition();
    currentPage.value = value;
    expandedFixtureId.value = null;
  }
});

const getFixtureAnalysis = (fixtureId: string): FixtureAnalysis => (
  analysisById.value.get(fixtureId)!
);

const toggleFixture = (fixtureId: string) => {
  expandedFixtureId.value = expandedFixtureId.value === fixtureId ? null : fixtureId;
};

const changePage = (page: number) => {
  const targetPage = Math.min(totalPages.value, Math.max(1, page));
  if (targetPage === currentPage.value || isPageTransitioning.value) {
    return;
  }

  currentPage.value = targetPage;
  expandedFixtureId.value = null;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  isPageTransitioning.value = true;
  pageTransitionTimer = setTimeout(() => {
    isPageTransitioning.value = false;
    pageTransitionTimer = null;
  }, pageTransitionDuration);
};

const changeFilter = (filter: FixtureFilter) => {
  clearPageTransition();
  currentPage.value = 1;
  expandedFixtureId.value = null;
  emit("filterChange", filter);
};

onBeforeUnmount(clearPageTransition);

const resultLabel = (fixture: ArsenalFixture) => {
  const result = getMatchResult(fixture);
  const labels = { W: "胜", D: "平", L: "负" } as const;
  if (result) {
    return labels[result];
  }
  if (fixture.status === "live") {
    return "进行中";
  }
  return fixture.prediction ? "预测" : "待赛";
};

const scoreLabel = (fixture: ArsenalFixture) => {
  const score = fixture.actual ?? fixture.prediction;
  return score ? `${score.arsenalScore} : ${score.opponentScore}` : "-- : --";
};

const statusTone = (fixture: ArsenalFixture) => (
  getMatchResult(fixture) ?? (fixture.status === "live" ? "live" : "upcoming")
);
</script>

<template>
  <section class="fixture-ledger" aria-labelledby="fixtures-title">
    <header class="ledger-heading">
      <div>
        <span class="ledger-kicker">Match ledger / Season record</span>
        <h2 id="fixtures-title">赛果与预测记录</h2>
      </div>

      <div class="filter-control" aria-label="筛选赛程">
        <button
          v-for="filter in filters"
          :key="filter.key"
          type="button"
          :class="{ 'is-active': activeFilter === filter.key }"
          @click="changeFilter(filter.key)"
        >
          {{ filter.label }}
        </button>
      </div>
    </header>

    <div class="ledger-table">
      <div class="ledger-row ledger-row--head" aria-hidden="true">
        <span>轮次 / 北京时间</span>
        <span>场地</span>
        <span>对手</span>
        <span class="model-score-heading">比分 / 预测</span>
        <span class="personal-score-heading">个人预测</span>
        <span>难度 / 胜率</span>
        <span>状态 / 分析</span>
      </div>

      <div
        class="ledger-page"
        :class="{ 'is-transitioning': isPageTransitioning }"
        :aria-busy="isPageTransitioning"
      >
        <div
          v-if="isPageTransitioning"
          class="page-transition-status"
          role="status"
          aria-live="polite"
        >
          <i aria-hidden="true"></i>
          <span>正在切换赛程</span>
        </div>

        <article v-for="fixture in paginatedFixtures" :key="fixture.id" class="fixture-entry">
          <div
            class="ledger-row ledger-row--fixture"
            :class="{ 'is-expanded': expandedFixtureId === fixture.id }"
            @click="toggleFixture(fixture.id)"
          >
            <span class="round-cell">
              <strong>{{ fixture.roundLabel ?? (fixture.matchweek === null ? "MW --" : `MW ${fixture.matchweek}`) }}</strong>
              <time
                class="kickoff-time"
                :datetime="fixture.kickoffTime ?? undefined"
              >
                {{ formatKickoffTime(fixture.kickoffTime) }}
              </time>
            </span>

            <span class="venue-cell">
              <NIcon>
                <HomeOutline v-if="fixture.venue === 'home'" />
                <AirplaneOutline v-else />
              </NIcon>
              <span>{{ fixture.venue === "home" ? "主场" : "客场" }}</span>
            </span>

            <span class="opponent-cell">
              <span class="opponent-code">{{ fixture.opponentCode }}</span>
              <strong>{{ fixture.opponent }}</strong>
            </span>

            <strong
              class="score-cell"
              :class="{ 'score-cell--forecast': !fixture.actual && !!fixture.prediction }"
            >
              {{ scoreLabel(fixture) }}
            </strong>

            <PersonalPredictionEditor
              :locked="fixture.status !== 'upcoming'"
              :prediction="fixture.personalPrediction"
              @save="emit('predictionSave', fixture.id, $event)"
            />

            <span class="win-cell">
              <template v-if="fixture.prediction">
                <i><b :style="{ width: `${fixture.prediction.winProbability}%` }"></b></i>
                <strong>{{ fixture.prediction.winProbability }}%</strong>
              </template>
              <strong v-else>{{ fixture.difficulty ? `难度 ${fixture.difficulty}` : "待定" }}</strong>
            </span>

            <span class="status-action">
              <span
                class="status-cell"
                :class="[`status-cell--${statusTone(fixture)}`]"
              >
                {{ resultLabel(fixture) }}
              </span>
              <button
                type="button"
                class="analysis-toggle-button"
                :aria-expanded="expandedFixtureId === fixture.id"
                :aria-controls="`fixture-analysis-${fixture.id}`"
                :aria-label="expandedFixtureId === fixture.id ? '收起比赛分析' : '展开比赛分析'"
                :title="expandedFixtureId === fixture.id ? '收起比赛分析' : '展开比赛分析'"
                @click.stop="toggleFixture(fixture.id)"
              >
                <NIcon class="analysis-toggle" aria-hidden="true">
                  <ChevronDownOutline />
                </NIcon>
              </button>
            </span>
          </div>

          <Transition name="analysis-reveal">
            <FixtureAnalysisPanel
              v-if="expandedFixtureId === fixture.id"
              :id="`fixture-analysis-${fixture.id}`"
              :analysis="getFixtureAnalysis(fixture.id)"
              :fixture="fixture"
            />
          </Transition>
        </article>

        <div v-if="fixtures.length === 0" class="ledger-empty">
          {{ loading ? "正在同步官方赛程" : "当前筛选条件下暂无赛程" }}
        </div>
      </div>
    </div>

    <nav v-if="fixtures.length > 0" class="ledger-pagination" aria-label="赛程分页">
      <span class="page-range" aria-live="polite">
        显示 {{ pageStart }}–{{ pageEnd }} / {{ fixtures.length }} 场
      </span>

      <div class="page-controls">
        <button
          type="button"
          class="page-button page-button--icon"
          :disabled="currentPage === 1 || isPageTransitioning"
          aria-label="上一页"
          title="上一页"
          @click="changePage(currentPage - 1)"
        >
          <NIcon><ChevronBackOutline /></NIcon>
        </button>

        <button
          v-for="page in pageNumbers"
          :key="page"
          type="button"
          class="page-button"
          :class="{ 'is-active': currentPage === page }"
          :disabled="isPageTransitioning"
          :aria-current="currentPage === page ? 'page' : undefined"
          :aria-label="`第 ${page} 页`"
          @click="changePage(page)"
        >
          {{ page.toString().padStart(2, "0") }}
        </button>

        <button
          type="button"
          class="page-button page-button--icon"
          :disabled="currentPage === totalPages || isPageTransitioning"
          aria-label="下一页"
          title="下一页"
          @click="changePage(currentPage + 1)"
        >
          <NIcon><ChevronForwardOutline /></NIcon>
        </button>
      </div>

      <span class="page-count">第 {{ currentPage }} / {{ totalPages }} 页</span>
    </nav>
  </section>
</template>

<style scoped>
.fixture-ledger {
  padding: 72px 0 24px;
}

.ledger-heading {
  display: flex;
  gap: 2rem;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
}

.ledger-kicker {
  color: rgba(255, 255, 255, 0.4);
  font-family: "Fira Code", monospace;
  font-size: 0.68rem;
  text-transform: uppercase;
}

.ledger-heading h2 {
  margin: 7px 0 0;
  color: #ffffff;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 2.7rem;
  font-weight: 600;
  letter-spacing: 0;
}

.filter-control {
  display: inline-grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.035);
}

.filter-control button {
  min-height: 36px;
  padding: 0 14px;
  color: rgba(255, 255, 255, 0.52);
  font: inherit;
  font-size: 0.72rem;
  font-weight: 800;
  cursor: pointer;
  border: 0;
  background: transparent;
  transition: color 160ms ease, background-color 160ms ease;
}

.filter-control button:hover,
.filter-control button.is-active {
  color: #17191d;
  background: #ffffff;
}

.ledger-table {
  border-top: 1px solid rgba(255, 255, 255, 0.14);
}

.ledger-page {
  position: relative;
}

.page-transition-status {
  position: absolute;
  z-index: 3;
  inset: 0;
  display: grid;
  grid-template-rows: 3px 1fr;
  min-height: 84px;
  place-items: center;
  color: rgba(255, 255, 255, 0.72);
  font-family: "Fira Code", monospace;
  font-size: 0.66rem;
  font-weight: 700;
  pointer-events: none;
  background: rgba(14, 16, 19, 0.42);
  backdrop-filter: blur(1px);
}

.page-transition-status i {
  position: relative;
  align-self: start;
  width: 100%;
  height: 3px;
  overflow: hidden;
  background: rgba(232, 255, 100, 0.1);
}

.page-transition-status i::after {
  position: absolute;
  inset: 0;
  content: "";
  background: #e8ff64;
  transform: translateX(-100%);
  animation: page-scan 800ms ease-out both;
}

.ledger-page.is-transitioning .fixture-entry {
  animation: fixture-page-reveal 280ms ease-out both;
}

.ledger-page.is-transitioning .fixture-entry:nth-of-type(2n) {
  animation-delay: 24ms;
}

.ledger-row {
  display: grid;
  grid-template-columns: 108px 76px minmax(190px, 1fr) 86px 124px minmax(118px, 0.45fr) 74px;
  gap: 14px;
  align-items: center;
  min-height: 84px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background-color 160ms ease;
}

.ledger-row--fixture {
  width: 100%;
  box-sizing: border-box;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  background: transparent;
}

.ledger-row--fixture:hover,
.ledger-row--fixture.is-expanded {
  background: rgba(255, 255, 255, 0.035);
}

.ledger-row--head {
  min-height: 42px;
  color: rgba(255, 255, 255, 0.34);
  font-family: "Fira Code", monospace;
  font-size: 0.62rem;
  text-transform: uppercase;
}

.model-score-heading {
  color: rgba(126, 215, 232, 0.78);
}

.personal-score-heading {
  color: rgba(232, 255, 100, 0.82);
}

.round-cell,
.opponent-cell {
  display: grid;
}

.round-cell strong,
.score-cell,
.win-cell strong {
  color: #ffffff;
  font-family: "Fira Code", monospace;
}

.kickoff-time,
.venue-cell span {
  color: rgba(255, 255, 255, 0.42);
  font-size: 0.68rem;
}

.kickoff-time {
  font-family: "Fira Code", monospace;
  white-space: nowrap;
}

.venue-cell,
.win-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}

.venue-cell .n-icon {
  color: #e8ff64;
}

.opponent-cell {
  grid-template-columns: 42px 1fr;
  gap: 12px;
  align-items: center;
}

.opponent-code {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  color: #15171a;
  font-size: 0.68rem;
  font-weight: 950;
  background: #f5f2ec;
}

.opponent-cell strong {
  min-width: 0;
  color: rgba(255, 255, 255, 0.82);
  overflow-wrap: anywhere;
}

.score-cell {
  font-size: 1rem;
}

.score-cell--forecast {
  color: #7ed7e8;
  text-shadow: 0 0 14px rgba(126, 215, 232, 0.18);
}

.win-cell i {
  width: 72px;
  height: 4px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
}

.win-cell b {
  display: block;
  height: 100%;
  background: #e8ff64;
}

.win-cell strong {
  font-size: 0.7rem;
}

.status-cell {
  display: grid;
  min-height: 28px;
  padding: 0 7px;
  place-items: center;
  font-size: 0.68rem;
  font-weight: 950;
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.status-action {
  display: grid;
  grid-template-columns: 1fr 18px;
  gap: 8px;
  align-items: center;
}

.analysis-toggle {
  color: rgba(255, 255, 255, 0.48);
  font-size: 1rem;
  transition: color 180ms ease, transform 220ms ease;
}

.analysis-toggle-button {
  display: grid;
  width: 24px;
  height: 28px;
  padding: 0;
  place-items: center;
  cursor: pointer;
  border: 0;
  background: transparent;
}

.analysis-toggle-button:focus-visible {
  outline: 2px solid #e8ff64;
  outline-offset: 2px;
}

.ledger-row--fixture:hover .analysis-toggle,
.ledger-row--fixture.is-expanded .analysis-toggle {
  color: #e8ff64;
}

.ledger-row--fixture.is-expanded .analysis-toggle {
  transform: rotate(180deg);
}

.analysis-reveal-enter-active,
.analysis-reveal-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.analysis-reveal-enter-from,
.analysis-reveal-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.status-cell--W {
  color: #15171a;
  border-color: #e8ff64;
  background: #e8ff64;
}

.status-cell--D {
  color: #15171a;
  border-color: #e8bc56;
  background: #e8bc56;
}

.status-cell--L {
  color: #ffffff;
  border-color: #e30613;
  background: #e30613;
}

.status-cell--upcoming {
  color: rgba(255, 255, 255, 0.62);
}

.status-cell--live {
  color: #15171a;
  border-color: #ffffff;
  background: #ffffff;
}

.ledger-empty {
  display: grid;
  min-height: 180px;
  place-items: center;
  color: rgba(255, 255, 255, 0.4);
}

.ledger-pagination {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: center;
  min-height: 76px;
  padding: 16px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
}

.page-range,
.page-count {
  color: rgba(255, 255, 255, 0.4);
  font-family: "Fira Code", monospace;
  font-size: 0.64rem;
}

.page-count {
  justify-self: end;
}

.page-controls {
  display: flex;
  gap: 6px;
  align-items: center;
}

.page-button {
  display: grid;
  width: 36px;
  height: 36px;
  padding: 0;
  place-items: center;
  color: rgba(255, 255, 255, 0.58);
  font-family: "Fira Code", monospace;
  font-size: 0.68rem;
  font-weight: 800;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.025);
  transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease;
}

.page-button:hover:not(:disabled),
.page-button:focus-visible {
  color: #e8ff64;
  border-color: rgba(232, 255, 100, 0.5);
}

.page-button:focus-visible {
  outline: 2px solid rgba(232, 255, 100, 0.4);
  outline-offset: 2px;
}

.page-button.is-active {
  color: #15171a;
  border-color: #e8ff64;
  background: #e8ff64;
}

.page-button:disabled {
  cursor: not-allowed;
  opacity: 0.28;
}

.page-button.is-active:disabled {
  cursor: wait;
  opacity: 1;
}

.page-button--icon .n-icon {
  font-size: 1rem;
}

@keyframes page-scan {
  to {
    transform: translateX(100%);
  }
}

@keyframes fixture-page-reveal {
  from {
    opacity: 0.4;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 980px) {
  .ledger-row {
    grid-template-columns: 90px 68px minmax(170px, 1fr) 76px 124px 108px 66px;
    gap: 12px;
  }

  .ledger-table {
    overflow-x: auto;
  }

  .ledger-row {
    min-width: 920px;
  }

  .fixture-entry {
    min-width: 920px;
  }
}

@media (max-width: 680px) {
  .fixture-ledger {
    padding-top: 54px;
  }

  .ledger-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .ledger-heading h2 {
    font-size: 2.15rem;
  }

  .filter-control {
    width: 100%;
  }

  .ledger-pagination {
    grid-template-columns: 1fr auto;
    gap: 12px;
    padding-inline: 4px;
  }

  .page-range {
    grid-column: 1 / -1;
  }

  .page-count {
    justify-self: end;
  }
}

@media (prefers-reduced-motion: reduce) {
  .filter-control button,
  .ledger-row,
  .analysis-toggle,
  .page-button,
  .analysis-reveal-enter-active,
  .analysis-reveal-leave-active {
    transition: none;
  }

  .page-transition-status i::after,
  .ledger-page.is-transitioning .fixture-entry {
    animation: none;
  }
}
</style>
