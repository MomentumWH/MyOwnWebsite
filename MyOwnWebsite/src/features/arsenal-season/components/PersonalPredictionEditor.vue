<script setup lang="ts">
import { computed, shallowRef, watch } from "vue";
import { CheckmarkOutline } from "@vicons/ionicons5";
import { NIcon } from "naive-ui";
import type {
  PersonalScorePrediction,
  PersonalScorePredictionDraft,
} from "../arsenalSeason";

const props = defineProps<{
  locked: boolean;
  prediction?: PersonalScorePrediction;
}>();

const emit = defineEmits<{
  save: [prediction: PersonalScorePredictionDraft];
}>();

const arsenalScore = shallowRef<number | "">(props.prediction?.arsenalScore ?? "");
const opponentScore = shallowRef<number | "">(props.prediction?.opponentScore ?? "");

watch(() => props.prediction, (prediction) => {
  arsenalScore.value = prediction?.arsenalScore ?? "";
  opponentScore.value = prediction?.opponentScore ?? "";
});

const isValidScore = (value: number | "") => (
  typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 20
);

const canSave = computed(() => (
  !props.locked && isValidScore(arsenalScore.value) && isValidScore(opponentScore.value)
));
const hasChanges = computed(() => (
  arsenalScore.value !== props.prediction?.arsenalScore
  || opponentScore.value !== props.prediction?.opponentScore
));

const save = () => {
  if (!canSave.value || !hasChanges.value) {
    return;
  }

  emit("save", {
    arsenalScore: arsenalScore.value as number,
    opponentScore: opponentScore.value as number,
  });
};
</script>

<template>
  <div class="personal-prediction" @click.stop>
    <template v-if="locked">
      <strong v-if="prediction" class="locked-score">
        {{ prediction.arsenalScore }} : {{ prediction.opponentScore }}
      </strong>
      <span v-else class="prediction-empty">未预测</span>
      <small>{{ prediction ? "个人预测" : "已截止" }}</small>
    </template>

    <template v-else>
      <div class="score-editor">
        <input
          v-model.number="arsenalScore"
          type="number"
          inputmode="numeric"
          min="0"
          max="20"
          step="1"
          aria-label="阿森纳个人预测进球数"
          @keydown.enter.stop="save"
        />
        <span aria-hidden="true">:</span>
        <input
          v-model.number="opponentScore"
          type="number"
          inputmode="numeric"
          min="0"
          max="20"
          step="1"
          aria-label="对手个人预测进球数"
          @keydown.enter.stop="save"
        />
        <button
          type="button"
          :disabled="!canSave || !hasChanges"
          aria-label="保存个人比分预测"
          title="保存个人比分预测"
          @click="save"
        >
          <NIcon><CheckmarkOutline /></NIcon>
        </button>
      </div>
      <small>{{ prediction && !hasChanges ? "已保存到本地" : "阿森纳在前" }}</small>
    </template>
  </div>
</template>

<style scoped>
.personal-prediction {
  display: grid;
  gap: 5px;
  align-content: center;
  min-width: 0;
}

.score-editor {
  display: grid;
  grid-template-columns: 32px 8px 32px 28px;
  gap: 4px;
  align-items: center;
}

.score-editor input,
.score-editor button {
  width: 100%;
  height: 28px;
  padding: 0;
  color: #ffffff;
  font-family: "Fira Code", monospace;
  font-size: 0.72rem;
  font-weight: 800;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 0;
  background: rgba(255, 255, 255, 0.045);
}

.score-editor input {
  color: #e8ff64;
  text-align: center;
  border-color: rgba(232, 255, 100, 0.34);
  background: rgba(232, 255, 100, 0.055);
  appearance: textfield;
}

.score-editor input::-webkit-outer-spin-button,
.score-editor input::-webkit-inner-spin-button {
  margin: 0;
  appearance: none;
}

.score-editor input:focus-visible {
  border-color: #e8ff64;
  outline: 1px solid #e8ff64;
  outline-offset: 1px;
}

.score-editor > span {
  color: rgba(232, 255, 100, 0.62);
  font-family: "Fira Code", monospace;
  text-align: center;
}

.score-editor button {
  display: grid;
  place-items: center;
  color: #15171a;
  cursor: pointer;
  border-color: #e8ff64;
  background: #e8ff64;
  transition: opacity 160ms ease, background-color 160ms ease;
}

.score-editor button:hover:not(:disabled) {
  background: #ffffff;
}

.score-editor button:disabled {
  color: rgba(255, 255, 255, 0.3);
  cursor: default;
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.025);
}

.personal-prediction small {
  color: rgba(255, 255, 255, 0.36);
  font-size: 0.6rem;
  white-space: nowrap;
}

.locked-score {
  color: #e8ff64;
  font-family: "Fira Code", monospace;
  font-size: 0.8rem;
}

.prediction-empty {
  color: rgba(255, 255, 255, 0.34);
  font-size: 0.68rem;
}

@media (prefers-reduced-motion: reduce) {
  .score-editor button {
    transition: none;
  }
}
</style>
