<script setup lang="ts">
import { computed } from "vue";
import {
  CheckmarkCircleOutline,
  PulseOutline,
  RadioOutline,
  TrendingUpOutline,
} from "@vicons/ionicons5";
import { NIcon } from "naive-ui";
import ProjectNav from "@/components/projectNav/index.vue";
import FixtureLedger from "@/features/arsenal-season/components/FixtureLedger.vue";
import PredictionBrief from "@/features/arsenal-season/components/PredictionBrief.vue";
import SeasonMomentumChart from "@/features/arsenal-season/components/SeasonMomentumChart.vue";
import {
  competitionLabels,
  formatUpdatedAt,
  type Competition,
} from "@/features/arsenal-season/arsenalSeason";
import { useArsenalSeason } from "@/features/arsenal-season/useArsenalSeason";

const {
  activeFilter,
  activeCompetition,
  error,
  form,
  isLoading,
  isStale,
  lastUpdated,
  latestActual,
  nextFixture,
  refresh,
  savePersonalPrediction,
  season,
  setFilter,
  summary,
  switchCompetition,
  trend,
  visibleFixtures,
} = useArsenalSeason();

const heroStats = computed(() => [
  { label: "已赛", value: summary.value.played.toString().padStart(2, "0") },
  { label: "积分", value: summary.value.points.toString().padStart(2, "0") },
  {
    label: "净胜球",
    value: `${summary.value.goalDifference >= 0 ? "+" : ""}${summary.value.goalDifference}`,
  },
  { label: "赛季预测", value: summary.value.forecastPoints?.toString() ?? "--" },
  { label: "黄牌", tone: "yellow", value: summary.value.yellowCards.toString() },
  { label: "红牌", tone: "red", value: summary.value.redCards.toString() },
  {
    help: "红牌 -3 分，黄牌 -1 分",
    label: "比赛行为分",
    tone: "behavior",
    value: summary.value.behaviorScore.toString(),
  },
]);

const formItems = computed(() => form.value.length > 0 ? form.value : ["-"]);
const goalDifferenceLabel = computed(() => (
  `${summary.value.goalsFor} : ${summary.value.goalsAgainst}`
));
const notice = computed(() => {
  if (error.value) {
    return {
      label: "同步失败",
      message: error.value,
      tone: "error",
    } as const;
  }

  if (isLoading.value) {
    return {
      label: "正在同步",
      message: `正在读取阿森纳当前${isChampionsLeague.value ? "欧冠公开" : "英超官方"}赛季赛程。`,
      tone: "loading",
    } as const;
  }

  if (isStale.value) {
    return {
      label: "缓存数据",
      message: "上游暂时不可用，当前展示最近一次成功同步的数据。",
      tone: "stale",
    } as const;
}

  return {
    label: isChampionsLeague.value ? "ESPN 公开数据" : "FPL 官方数据",
    message: isChampionsLeague.value
      ? "当前赛季欧冠赛程、赛果与赛前预测已接入 ESPN 公开数据源。"
      : "当前赛季赛程、赛果与纪律数据已接入 Fantasy Premier League 数据源。",
    tone: "ready",
  } as const;
});
const updatedAtLabel = computed(() => formatUpdatedAt(lastUpdated.value));
const isChampionsLeague = computed(() => activeCompetition.value === "champions-league");
const competitionOptions: readonly { key: Competition; label: string }[] = [
  { key: "premier-league", label: competitionLabels["premier-league"] },
  { key: "champions-league", label: competitionLabels["champions-league"] },
];
</script>

<template>
  <div class="arsenal-page" :aria-busy="isLoading">
    <div class="pitch-lines" aria-hidden="true"></div>

    <Transition name="data-fetch-cover">
      <div
        v-if="isLoading"
        class="data-fetch-cover"
        role="status"
        aria-live="polite"
      >
        <div class="data-fetch-panel">
          <div class="data-fetch-heading">
            <i aria-hidden="true"></i>
            <span>正在获取数据</span>
          </div>
          <strong>阿森纳赛季数据同步中</strong>
          <p>正在读取{{ isChampionsLeague ? "欧冠" : "英超" }}赛程、赛果与积分走势</p>
          <div class="data-fetch-track" aria-hidden="true"><span></span></div>
        </div>
      </div>
    </Transition>

    <div class="page-shell">
      <ProjectNav tone="warm" :show-default-action="false" />

      <div class="data-notice" :class="`data-notice--${notice.tone}`" role="status" aria-live="polite">
        <span><i></i> {{ notice.label }}</span>
        <p>{{ notice.message }}</p>
        <button v-if="error" type="button" :disabled="isLoading" @click="refresh">重试</button>
        <strong>{{ updatedAtLabel }}</strong>
      </div>

      <header class="season-hero" aria-labelledby="arsenal-season-title">
        <div class="hero-copy">
          <div class="hero-meta">
            <div class="competition-switch" aria-label="选择赛事">
              <button
                v-for="option in competitionOptions"
                :key="option.key"
                type="button"
                :class="{ 'is-active': activeCompetition === option.key }"
                :aria-pressed="activeCompetition === option.key"
                :disabled="isLoading"
                @click="switchCompetition(option.key)"
              >
                {{ option.key === "champions-league" ? "欧冠" : "英超" }}
              </button>
            </div>
            <span>{{ season }} / Match intelligence</span>
          </div>

          <p class="hero-kicker">North London / Season command</p>
          <h1 id="arsenal-season-title">Arsenal</h1>
          <p class="hero-subtitle">
            当前{{ isChampionsLeague ? "欧冠公开" : "英超官方" }}赛季赛程、赛果记录与积分走势。把每轮比赛沉淀为可追踪的数据轨迹。
          </p>

          <div class="form-row">
            <span>近期状态</span>
            <div class="form-sequence" aria-label="近期赛果">
              <i
                v-for="(result, index) in formItems"
                :key="`${result}-${index}`"
                :class="`form--${result}`"
              >
                {{ result }}
              </i>
            </div>
            <span>{{ summary.pointsPerGame.toFixed(2) }} PPG</span>
          </div>
        </div>

        <div class="hero-identity">
          <span class="hero-index">/ AFC · 1886</span>
          <div class="crest-stage">
            <img
              class="arsenal-crest"
              src="https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg"
              alt="阿森纳足球俱乐部队徽"
            />
            <div class="crest-caption">
              <span>Club signal</span>
              <strong>The Gunners</strong>
            </div>
          </div>
        </div>

        <div class="hero-stats" aria-label="赛季核心指标">
          <div
            v-for="stat in heroStats"
            :key="stat.label"
            class="hero-stat"
            :class="stat.tone ? `hero-stat--${stat.tone}` : undefined"
            :title="stat.help"
          >
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        </div>
      </header>

      <main class="season-content">
        <section class="analysis-intro">
          <span class="section-index">01</span>
          <div>
            <p class="section-kicker">{{ isChampionsLeague ? "Champions League" : "Premier League" }} / Probability</p>
            <h2>走势不是一条线，<br />而是一组不断修正的判断。</h2>
          </div>
          <p>
            已结束比赛进入真实积分轨迹，未开赛场次保留官方时间与比赛难度。每次同步后，赛季状态会自动重新计算。
          </p>
        </section>

        <div class="analysis-grid">
          <SeasonMomentumChart :trend="trend" />
          <PredictionBrief :fixture="nextFixture" />
        </div>

        <section class="performance-strip" aria-labelledby="performance-title">
          <header>
            <span class="section-index">02</span>
            <div>
              <p class="section-kicker">Latest result / Match read</p>
              <h2 id="performance-title">最近一场表现切片</h2>
            </div>
          </header>

          <div class="performance-metrics">
            <div>
              <NIcon><TrendingUpOutline /></NIcon>
              <span>最近比分</span>
              <strong>{{ latestActual ? `${latestActual.arsenalScore} : ${latestActual.opponentScore}` : "--" }}</strong>
              <small>阿森纳在前</small>
            </div>
            <div>
              <NIcon><PulseOutline /></NIcon>
              <span>{{ isChampionsLeague ? "官方奖励积分" : "FPL 奖励积分" }}</span>
              <strong>{{ latestActual?.fplBonus ?? "--" }}</strong>
              <small>{{ isChampionsLeague ? "该赛事暂未提供" : "本场球员奖励合计" }}</small>
            </div>
            <div>
              <NIcon><RadioOutline /></NIcon>
              <span>{{ isChampionsLeague ? "表现指标" : "BPS 合计" }}</span>
              <strong>{{ latestActual?.bps ?? "--" }}</strong>
              <small>{{ isChampionsLeague ? "该赛事暂未提供" : "Fantasy 表现指标" }}</small>
            </div>
            <div>
              <NIcon><CheckmarkCircleOutline /></NIcon>
              <span>赛季进失球</span>
              <strong>{{ goalDifferenceLabel }}</strong>
              <small>净胜球 {{ summary.goalDifference >= 0 ? "+" : "" }}{{ summary.goalDifference }}</small>
            </div>
          </div>
        </section>

        <FixtureLedger
          :active-filter="activeFilter"
          :fixtures="visibleFixtures"
          :loading="isLoading"
          @filter-change="setFilter"
          @prediction-save="savePersonalPrediction"
        />
      </main>

      <footer class="page-footer">
        <span>Arsenal season intelligence / {{ isChampionsLeague ? "UEFA Champions League" : "FPL" }}</span>
        <span>Vue 3 + ECharts · Asia/Shanghai</span>
      </footer>
    </div>

    <n-back-top :right="32" />
  </div>
</template>

<style scoped>
.arsenal-page {
  --arsenal-red: #e30613;
  --arsenal-dark: #101216;
  --arsenal-ink: #ffffff;
  --arsenal-muted: rgba(255, 255, 255, 0.56);
  --arsenal-line: rgba(255, 255, 255, 0.13);
  --signal: #e8ff64;
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  color: var(--arsenal-ink);
  font-family: "Lato", "Microsoft YaHei", sans-serif;
  background:
    linear-gradient(110deg, rgba(227, 6, 19, 0.18), transparent 34%),
    linear-gradient(320deg, rgba(26, 106, 156, 0.11), transparent 36%),
    #101216;
}

.arsenal-page::before {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: "";
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(to bottom, #000, transparent 88%);
}

.data-fetch-cover {
  position: fixed;
  z-index: 90;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  pointer-events: auto;
  background: rgba(10, 12, 15, 0.72);
  backdrop-filter: blur(7px) saturate(0.8);
}

.data-fetch-panel {
  width: min(100%, 360px);
  padding: 22px 24px 20px;
  border-top: 1px solid rgba(232, 255, 100, 0.5);
  border-bottom: 1px solid rgba(232, 255, 100, 0.2);
  background: rgba(16, 18, 22, 0.84);
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.36);
}

.data-fetch-heading {
  display: flex;
  gap: 8px;
  align-items: center;
  color: var(--signal);
  font-family: "Fira Code", monospace;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.data-fetch-heading i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--signal);
  box-shadow: 0 0 14px rgba(232, 255, 100, 0.85);
  animation: data-fetch-pulse 1.1s ease-in-out infinite;
}

.data-fetch-panel strong {
  display: block;
  margin-top: 18px;
  color: #ffffff;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.55rem;
  font-weight: 600;
}

.data-fetch-panel p {
  margin: 8px 0 18px;
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.72rem;
}

.data-fetch-track {
  position: relative;
  height: 3px;
  overflow: hidden;
  background: rgba(232, 255, 100, 0.12);
}

.data-fetch-track span {
  position: absolute;
  inset: 0 auto 0 0;
  width: 42%;
  background: var(--signal);
  box-shadow: 0 0 16px rgba(232, 255, 100, 0.8);
  animation: data-fetch-scan 1.35s ease-in-out infinite;
}

.data-fetch-cover-enter-active,
.data-fetch-cover-leave-active {
  transition: opacity 220ms ease;
}

.data-fetch-cover-enter-from,
.data-fetch-cover-leave-to {
  opacity: 0;
}

@keyframes data-fetch-pulse {
  50% {
    opacity: 0.42;
    transform: scale(0.72);
  }
}

@keyframes data-fetch-scan {
  0% {
    transform: translateX(-115%);
  }

  55%,
  100% {
    transform: translateX(285%);
  }
}

.pitch-lines {
  position: fixed;
  top: 18%;
  right: -10vw;
  z-index: 0;
  width: 52vw;
  aspect-ratio: 1.7;
  pointer-events: none;
  opacity: 0.12;
  border: 1px solid #ffffff;
  transform: rotate(-9deg);
  background:
    linear-gradient(90deg, transparent 49.85%, #ffffff 50%, transparent 50.15%),
    radial-gradient(circle at center, transparent 0 17%, #ffffff 17.3% 17.7%, transparent 18%);
}

.page-shell {
  position: relative;
  z-index: 1;
  width: min(1480px, calc(100% - 48px));
  margin: 0 auto;
  padding: 24px 0 32px;
}

.data-notice {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 18px;
  align-items: center;
  min-height: 42px;
  margin-top: 20px;
  padding: 8px 14px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.68rem;
  border-top: 1px solid rgba(232, 255, 100, 0.34);
  border-bottom: 1px solid rgba(232, 255, 100, 0.14);
  background: rgba(232, 255, 100, 0.035);
}

.data-notice span {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  color: var(--signal);
  font-weight: 900;
}

.data-notice i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--signal);
  box-shadow: 0 0 12px rgba(232, 255, 100, 0.72);
  animation: statusPulse 1.8s ease-in-out infinite;
}

.data-notice p {
  margin: 0;
}

.data-notice strong {
  color: rgba(255, 255, 255, 0.42);
  font-weight: 800;
}

.data-notice button {
  min-height: 28px;
  padding: 0 10px;
  color: #15171a;
  font: inherit;
  font-size: 0.68rem;
  font-weight: 900;
  cursor: pointer;
  border: 0;
  background: #ffffff;
}

.data-notice button:disabled {
  cursor: wait;
  opacity: 0.55;
}

.data-notice--error {
  border-top-color: rgba(227, 6, 19, 0.62);
  border-bottom-color: rgba(227, 6, 19, 0.28);
  background: rgba(227, 6, 19, 0.06);
}

.data-notice--error span {
  color: #ff717b;
}

.data-notice--error i {
  background: #ff717b;
  box-shadow: 0 0 12px rgba(255, 113, 123, 0.62);
}

.season-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(360px, 0.9fr);
  grid-template-rows: minmax(410px, 1fr) auto;
  min-height: min(580px, calc(100svh - 190px));
  overflow: hidden;
  border-bottom: 1px solid var(--arsenal-line);
}

.season-hero::after {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 59%;
  width: 1px;
  content: "";
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.16), transparent);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 54px 54px 42px 14px;
  animation: heroReveal 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hero-meta {
  display: flex;
  justify-content: space-between;
  max-width: 680px;
  margin-bottom: 32px;
  color: rgba(255, 255, 255, 0.42);
  font-family: "Fira Code", monospace;
  font-size: 0.67rem;
  text-transform: uppercase;
}

.competition-switch {
  display: inline-flex;
  gap: 4px;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.035);
}

.competition-switch button {
  min-height: 24px;
  padding: 0 9px;
  color: rgba(255, 255, 255, 0.46);
  font: inherit;
  font-size: 0.62rem;
  font-weight: 900;
  cursor: pointer;
  border: 0;
  background: transparent;
  transition: color 180ms ease, background-color 180ms ease;
}

.competition-switch button:hover:not(:disabled),
.competition-switch button.is-active {
  color: #17191d;
  background: var(--signal);
}

.competition-switch button:disabled {
  cursor: wait;
  opacity: 0.55;
}

.hero-kicker,
.section-kicker {
  margin: 0 0 8px;
  color: var(--signal);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 0;
  color: #ffffff;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 6.4rem;
  font-weight: 600;
  line-height: 0.9;
  letter-spacing: 0;
}

.hero-subtitle {
  max-width: 650px;
  margin: 24px 0 0;
  color: var(--arsenal-muted);
  font-size: 1rem;
  line-height: 1.85;
}

.form-row {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-top: 28px;
  color: rgba(255, 255, 255, 0.42);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
}

.form-sequence {
  display: inline-flex;
  gap: 5px;
}

.form-sequence i {
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  color: rgba(255, 255, 255, 0.42);
  font-style: normal;
  border: 1px solid var(--arsenal-line);
}

.form-sequence .form--W {
  color: #15171a;
  border-color: var(--signal);
  background: var(--signal);
}

.form-sequence .form--D {
  color: #15171a;
  border-color: #e8bc56;
  background: #e8bc56;
}

.form-sequence .form--L {
  color: #ffffff;
  border-color: var(--arsenal-red);
  background: var(--arsenal-red);
}

.hero-identity {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 0;
  padding: 52px 14px 42px 62px;
  animation: crestReveal 820ms 100ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hero-index {
  position: absolute;
  top: 28px;
  right: 14px;
  color: rgba(255, 255, 255, 0.36);
  font-family: "Fira Code", monospace;
  font-size: 0.68rem;
}

.crest-stage {
  display: grid;
  justify-items: center;
  width: min(360px, 88%);
}

.arsenal-crest {
  display: block;
  width: min(255px, 72%);
  height: auto;
  max-height: 270px;
  object-fit: contain;
  filter: drop-shadow(0 28px 42px rgba(0, 0, 0, 0.38));
}

.crest-caption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 24px;
  padding-top: 14px;
  border-top: 1px solid var(--arsenal-line);
}

.crest-caption span {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.68rem;
  text-transform: uppercase;
}

.crest-caption strong {
  font-family: Georgia, serif;
  font-size: 1.15rem;
}

.hero-stats {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  border-top: 1px solid var(--arsenal-line);
}

.hero-stat {
  display: flex;
  gap: 9px;
  align-items: baseline;
  min-height: 74px;
  min-width: 0;
  padding: 14px 15px;
}

.hero-stat + .hero-stat {
  border-left: 1px solid var(--arsenal-line);
}

.hero-stat strong {
  color: #ffffff;
  font-family: Georgia, serif;
  font-size: 1.8rem;
}

.hero-stat--yellow strong {
  color: #f4c84a;
}

.hero-stat--red strong {
  color: #ff6570;
}

.hero-stat--behavior strong {
  color: var(--signal);
}

.hero-stat span {
  color: rgba(255, 255, 255, 0.42);
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
}

.season-content {
  display: block;
  min-width: 0;
}

.analysis-intro {
  display: grid;
  grid-template-columns: 64px minmax(360px, 1fr) minmax(320px, 0.85fr);
  gap: 36px;
  align-items: end;
  padding: 82px 14px 42px;
}

.section-index {
  color: rgba(255, 255, 255, 0.36);
  font-family: "Fira Code", monospace;
  font-size: 0.7rem;
}

.analysis-intro h2,
.performance-strip h2 {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 3.2rem;
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: 0;
}

.analysis-intro > p {
  margin: 0;
  color: var(--arsenal-muted);
  line-height: 1.9;
}

.analysis-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(360px, 0.75fr);
  gap: 16px;
}

.performance-strip {
  display: grid;
  grid-template-columns: minmax(300px, 0.7fr) minmax(0, 1.3fr);
  gap: 36px;
  align-items: stretch;
  margin-top: 16px;
  border-top: 1px solid var(--arsenal-line);
  border-bottom: 1px solid var(--arsenal-line);
}

.performance-strip > header {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 18px;
  align-content: center;
  padding: 28px 14px;
}

.performance-strip h2 {
  font-size: 2rem;
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-left: 1px solid var(--arsenal-line);
}

.performance-metrics > div {
  display: grid;
  align-content: center;
  min-height: 170px;
  padding: 24px 18px;
}

.performance-metrics > div + div {
  border-left: 1px solid var(--arsenal-line);
}

.performance-metrics .n-icon {
  margin-bottom: 16px;
  color: var(--signal);
  font-size: 1.2rem;
}

.performance-metrics span,
.performance-metrics small {
  color: rgba(255, 255, 255, 0.42);
  font-size: 0.66rem;
  font-weight: 800;
}

.performance-metrics strong {
  margin: 4px 0;
  color: #ffffff;
  font-family: Georgia, serif;
  font-size: 2rem;
}

.page-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 14px 0;
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.66rem;
  font-weight: 800;
  text-transform: uppercase;
  border-top: 1px solid var(--arsenal-line);
}

@keyframes heroReveal {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes crestReveal {
  from { opacity: 0; clip-path: inset(0 0 100% 0); }
  to { opacity: 1; clip-path: inset(0); }
}

@keyframes statusPulse {
  50% { opacity: 0.4; transform: scale(0.78); }
}

@media (max-width: 1120px) {
  .hero-stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .hero-stat:nth-child(4n + 1) {
    border-left: 0;
  }

  .hero-stat:nth-child(n + 5) {
    border-top: 1px solid var(--arsenal-line);
  }

  .analysis-grid {
    grid-template-columns: 1fr;
  }

  .performance-strip {
    grid-template-columns: 1fr;
  }

  .performance-metrics {
    border-top: 1px solid var(--arsenal-line);
    border-left: 0;
  }
}

@media (max-width: 860px) {
  .data-notice {
    grid-template-columns: auto 1fr;
  }

  .data-notice strong {
    grid-column: 2;
  }

  .season-hero {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .season-hero::after {
    display: none;
  }

  .hero-copy {
    padding: 64px 8px 28px;
  }

  .hero-identity {
    padding: 26px 8px 48px;
  }

  .hero-index {
    top: 10px;
  }

  .hero-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .hero-stat:nth-child(odd) {
    border-left: 0;
  }

  .hero-stat:nth-child(n + 3) {
    border-top: 1px solid var(--arsenal-line);
  }

  .hero-stat--behavior {
    grid-column: 1 / -1;
  }

  .analysis-intro {
    grid-template-columns: 42px 1fr;
  }

  .analysis-intro > p {
    grid-column: 2;
  }

  .performance-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .performance-metrics > div:nth-child(3) {
    border-top: 1px solid var(--arsenal-line);
    border-left: 0;
  }

  .performance-metrics > div:nth-child(4) {
    border-top: 1px solid var(--arsenal-line);
  }
}

@media (max-width: 580px) {
  .page-shell {
    width: min(100% - 28px, 1480px);
    padding-top: 14px;
  }

  .data-notice {
    grid-template-columns: 1fr;
    gap: 7px;
  }

  .data-notice strong {
    grid-column: auto;
  }

  .hero-meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 7px;
  }

  .hero-copy h1 {
    font-size: 4rem;
  }

  .form-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .analysis-intro {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 62px 4px 34px;
  }

  .analysis-intro > p {
    grid-column: auto;
  }

  .analysis-intro h2 {
    font-size: 2.25rem;
  }

  .performance-metrics {
    grid-template-columns: 1fr;
  }

  .performance-metrics > div + div,
  .performance-metrics > div:nth-child(3) {
    border-top: 1px solid var(--arsenal-line);
    border-left: 0;
  }

  .page-footer {
    align-items: flex-start;
    flex-direction: column;
    gap: 7px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .data-fetch-cover-enter-active,
  .data-fetch-cover-leave-active {
    transition-duration: 1ms;
  }

  .data-fetch-heading i,
  .data-fetch-track span {
    animation: none;
  }

  .hero-copy,
  .hero-identity,
  .data-notice i {
    animation: none;
  }
}
</style>
