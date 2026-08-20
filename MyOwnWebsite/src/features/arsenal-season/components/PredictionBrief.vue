<script setup lang="ts">
import { computed } from "vue";
import { AnalyticsOutline, FlashOutline, ShieldCheckmarkOutline } from "@vicons/ionicons5";
import { NIcon } from "naive-ui";
import { formatKickoffTime, type ArsenalFixture } from "../arsenalSeason";

const props = defineProps<{
  fixture: ArsenalFixture | null;
}>();

const venueLabel = computed(() => props.fixture?.venue === "home" ? "主场" : "客场");
const prediction = computed(() => props.fixture?.prediction ?? null);
const matchweekLabel = computed(() => props.fixture?.matchweek === null
  ? "MW 待定"
  : `MW ${props.fixture?.matchweek ?? "--"}`);
const kickoffLabel = computed(() => formatKickoffTime(props.fixture?.kickoffTime ?? null));
const difficultyLabel = computed(() => props.fixture?.difficulty
  ? `${props.fixture.difficulty} / 5`
  : "待定");
const winRingStyle = computed(() => ({
  background: `conic-gradient(#e30613 0 ${prediction.value?.winProbability ?? 0}%, rgba(255,255,255,0.09) 0 100%)`,
}));
const probabilityRows = computed(() => prediction.value
  ? [
      { label: "胜", value: prediction.value.winProbability, tone: "win" },
      { label: "平", value: prediction.value.drawProbability, tone: "draw" },
      { label: "负", value: prediction.value.lossProbability, tone: "loss" },
    ]
  : []);
</script>

<template>
  <section class="prediction-panel" aria-labelledby="prediction-title">
    <header class="panel-heading">
      <div>
        <span class="panel-kicker">Next match / Official fixture</span>
        <h2 id="prediction-title">下一场比赛</h2>
      </div>
      <span v-if="prediction" class="confidence">置信度 {{ prediction.confidence }}%</span>
    </header>

    <div v-if="fixture" class="prediction-body">
      <div class="matchup">
        <span class="team-code team-code--ars">ARS</span>
        <div class="matchup-center">
          <span>{{ matchweekLabel }} · {{ venueLabel }}{{ prediction ? " · 预测比分" : "" }}</span>
          <strong v-if="prediction">{{ prediction.arsenalScore }} : {{ prediction.opponentScore }}</strong>
          <strong v-else>VS</strong>
          <small>{{ kickoffLabel }}</small>
        </div>
        <span class="team-code">{{ fixture.opponentCode }}</span>
      </div>

      <div v-if="prediction" class="probability-layout">
        <div class="win-ring" :style="winRingStyle">
          <div>
            <strong>{{ prediction.winProbability }}%</strong>
            <span>胜率</span>
          </div>
        </div>

        <div class="probability-bars">
          <div v-for="item in probabilityRows" :key="item.label" class="probability-row">
            <span>{{ item.label }}</span>
            <i><b :class="`bar--${item.tone}`" :style="{ width: `${item.value}%` }"></b></i>
            <strong>{{ item.value }}%</strong>
          </div>
        </div>
      </div>

      <div v-else class="fixture-facts">
        <div>
          <span>FPL 难度</span>
          <strong>{{ difficultyLabel }}</strong>
        </div>
        <div>
          <span>比赛状态</span>
          <strong>{{ fixture.status === "live" ? "进行中" : "待开赛" }}</strong>
        </div>
      </div>

      <p v-if="prediction" class="prediction-summary">{{ prediction.summary }}</p>

      <div v-if="prediction" class="factor-list" aria-label="预测关键因素">
        <span v-for="(factor, index) in prediction.factors" :key="factor">
          <NIcon>
            <ShieldCheckmarkOutline v-if="index === 0" />
            <FlashOutline v-else-if="index === 1" />
            <AnalyticsOutline v-else />
          </NIcon>
          {{ factor }}
        </span>
      </div>
    </div>

    <div v-else class="prediction-empty">等待下一场赛程数据</div>
  </section>
</template>

<style scoped>
.prediction-panel {
  position: relative;
  min-width: 0;
  padding: 28px 30px 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.11);
  background:
    linear-gradient(145deg, rgba(227, 6, 19, 0.09), transparent 38%),
    #16191e;
  box-shadow: inset 3px 0 0 rgba(227, 6, 19, 0.82);
}

.panel-heading {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
}

.panel-kicker {
  color: rgba(255, 255, 255, 0.4);
  font-family: "Fira Code", monospace;
  font-size: 0.67rem;
  text-transform: uppercase;
}

.panel-heading h2 {
  margin: 6px 0 0;
  color: #ffffff;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: 0;
}

.confidence {
  padding: 6px 8px;
  color: #e8ff64;
  font-size: 0.68rem;
  font-weight: 900;
  border: 1px solid rgba(232, 255, 100, 0.3);
}

.prediction-body {
  margin-top: 22px;
}

.matchup {
  display: grid;
  grid-template-columns: 68px 1fr 68px;
  gap: 12px;
  align-items: center;
  padding: 18px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.11);
  border-bottom: 1px solid rgba(255, 255, 255, 0.11);
}

.team-code {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  color: rgba(255, 255, 255, 0.82);
  font-weight: 950;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.025);
}

.team-code--ars {
  color: #ffffff;
  border-color: #e30613;
  background: #e30613;
}

.matchup-center {
  display: grid;
  justify-items: center;
  text-align: center;
}

.matchup-center span,
.matchup-center small {
  color: rgba(255, 255, 255, 0.48);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
}

.matchup-center strong {
  margin: 3px 0;
  color: #ffffff;
  font-family: Georgia, serif;
  font-size: 2.5rem;
  line-height: 1;
}

.probability-layout {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 24px;
  align-items: center;
  padding: 20px 0;
}

.fixture-facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.11);
  border-bottom: 1px solid rgba(255, 255, 255, 0.11);
}

.fixture-facts > div {
  display: grid;
  gap: 6px;
  min-height: 92px;
  padding: 18px;
  align-content: center;
}

.fixture-facts > div + div {
  border-left: 1px solid rgba(255, 255, 255, 0.11);
}

.fixture-facts span {
  color: rgba(255, 255, 255, 0.42);
  font-size: 0.68rem;
  font-weight: 800;
}

.fixture-facts strong {
  color: #ffffff;
  font-family: Georgia, serif;
  font-size: 1.5rem;
}

.fixture-facts > div:first-child strong {
  color: #e8ff64;
}

.win-ring {
  display: grid;
  width: 112px;
  height: 112px;
  padding: 10px;
  place-items: center;
  border-radius: 50%;
}

.win-ring > div {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  align-content: center;
  border-radius: 50%;
  background: #16191e;
}

.win-ring strong {
  color: #ffffff;
  font-family: Georgia, serif;
  font-size: 1.8rem;
}

.win-ring span {
  color: rgba(255, 255, 255, 0.44);
  font-size: 0.68rem;
}

.probability-bars {
  display: grid;
  gap: 11px;
}

.probability-row {
  display: grid;
  grid-template-columns: 18px 1fr 36px;
  gap: 9px;
  align-items: center;
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.72rem;
}

.probability-row i {
  height: 5px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
}

.probability-row b {
  display: block;
  height: 100%;
}

.bar--win { background: #e30613; }
.bar--draw { background: #e8bc56; }
.bar--loss { background: rgba(255, 255, 255, 0.54); }

.probability-row strong {
  color: #ffffff;
  text-align: right;
}

.prediction-summary {
  margin: 0;
  padding: 16px 0;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
  border-top: 1px solid rgba(255, 255, 255, 0.11);
}

.factor-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.11);
}

.factor-list span {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  color: rgba(255, 255, 255, 0.64);
  font-size: 0.7rem;
  font-weight: 800;
}

.factor-list .n-icon {
  color: #e30613;
  font-size: 0.9rem;
}

.prediction-empty {
  display: grid;
  min-height: 320px;
  place-items: center;
  color: rgba(255, 255, 255, 0.4);
}

@media (max-width: 680px) {
  .prediction-panel {
    padding: 22px 16px 16px;
  }

  .probability-layout {
    grid-template-columns: 96px 1fr;
    gap: 16px;
  }

  .win-ring {
    width: 92px;
    height: 92px;
  }
}
</style>
