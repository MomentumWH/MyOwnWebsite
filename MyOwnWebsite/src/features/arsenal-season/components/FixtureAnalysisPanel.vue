<script setup lang="ts">
import { computed } from "vue";
import type { ArsenalFixture, FixtureAnalysis } from "../arsenalSeason";

const props = defineProps<{
  analysis: FixtureAnalysis;
  fixture: ArsenalFixture;
}>();

const historyRecord = computed(() => {
  const history = props.fixture.headToHead;
  return history
    ? `${history.arsenalWins}胜 ${history.draws}平 ${history.opponentWins}负`
    : "暂无有效样本";
});

const goalsRecord = computed(() => {
  const history = props.fixture.headToHead;
  return history ? `${history.goalsFor} : ${history.goalsAgainst}` : "-- : --";
});
</script>

<template>
  <section class="fixture-analysis" :aria-label="`${fixture.opponent}比赛分析`">
    <header class="analysis-heading">
      <span class="analysis-index">Analysis / {{ fixture.opponentCode }}</span>
      <strong>{{ analysis.phaseLabel }}</strong>
      <span>{{ analysis.evidenceLabel }}</span>
    </header>

    <div class="analysis-copy">
      <span class="analysis-tendency">{{ analysis.tendency }}</span>
      <p>{{ analysis.summary }}</p>
      <small>基于公开赛程、赛事强度及可用历史赛果生成，不代表俱乐部或数据源官方观点。</small>
    </div>

    <dl class="analysis-evidence">
      <div>
        <dt>交锋样本</dt>
        <dd>{{ fixture.headToHead?.meetings ?? 0 }} 场</dd>
      </div>
      <div>
        <dt>阿森纳记录</dt>
        <dd>{{ historyRecord }}</dd>
      </div>
      <div>
        <dt>样本进失球</dt>
        <dd>{{ goalsRecord }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.fixture-analysis {
  position: relative;
  display: grid;
  grid-template-columns: minmax(170px, 0.42fr) minmax(360px, 1.25fr) minmax(300px, 0.72fr);
  gap: 34px;
  padding: 28px 24px 30px 30px;
  overflow: hidden;
  border-bottom: 1px solid rgba(232, 255, 100, 0.28);
  background:
    linear-gradient(90deg, rgba(232, 255, 100, 0.08), transparent 32%),
    rgba(255, 255, 255, 0.025);
}

.fixture-analysis::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  content: "";
  background: #e8ff64;
}

.analysis-heading {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 7px;
}

.analysis-heading strong {
  color: #ffffff;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.18rem;
  font-weight: 600;
}

.analysis-heading > span:last-child,
.analysis-index {
  color: rgba(255, 255, 255, 0.42);
  font-family: "Fira Code", monospace;
  font-size: 0.62rem;
}

.analysis-index {
  color: #e8ff64;
  text-transform: uppercase;
}

.analysis-copy {
  min-width: 0;
}

.analysis-tendency {
  display: inline-block;
  margin-bottom: 10px;
  color: #e8ff64;
  font-size: 0.72rem;
  font-weight: 900;
}

.analysis-copy p {
  margin: 0;
  color: rgba(255, 255, 255, 0.76);
  font-size: 0.86rem;
  line-height: 1.95;
}

.analysis-copy small {
  display: block;
  margin-top: 12px;
  color: rgba(255, 255, 255, 0.32);
  font-size: 0.62rem;
  line-height: 1.6;
}

.analysis-evidence {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-self: stretch;
  margin: 0;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.analysis-evidence > div {
  display: flex;
  justify-content: center;
  flex-direction: column;
  min-width: 0;
  padding: 0 14px;
}

.analysis-evidence > div + div {
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.analysis-evidence dt {
  color: rgba(255, 255, 255, 0.36);
  font-size: 0.61rem;
  font-weight: 800;
}

.analysis-evidence dd {
  margin: 7px 0 0;
  color: #ffffff;
  font-family: "Fira Code", monospace;
  font-size: 0.74rem;
  font-weight: 800;
  overflow-wrap: anywhere;
}

@media (max-width: 1120px) {
  .fixture-analysis {
    grid-template-columns: 180px minmax(420px, 1fr);
  }

  .analysis-evidence {
    grid-column: 1 / -1;
    min-height: 68px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-left: 0;
  }
}

@media (max-width: 680px) {
  .fixture-analysis {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 24px 20px 26px;
  }

  .analysis-evidence {
    grid-column: auto;
  }
}
</style>
