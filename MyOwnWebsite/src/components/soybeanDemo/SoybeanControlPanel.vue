<script setup lang="ts">
import { SButton, SCard, SInput, SSelect, SSeparator, SSlider, SSwitch, STag, STextarea } from "@soybeanjs/ui";
import { computed } from "vue";
import type { SoybeanSelectOption } from "@/composables/useSoybeanDemo";

interface Props {
  completion: number;
  enableMotion: boolean;
  note: string;
  projectName: string;
  scenarioLabel: string;
  scenarioOptions: SoybeanSelectOption[];
  selectedScenario: string;
  teamSize: number[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:enableMotion": [value: boolean];
  "update:note": [value: string];
  "update:projectName": [value: string];
  "update:selectedScenario": [value: string];
  "update:teamSize": [value: number[]];
}>();

const teamSizeLabel = computed(() => `${props.teamSize[0]} 人协作`);
</script>

<template>
  <SCard class="control-card" title="交互控制台" description="这些控件都由 SoybeanUI 组件驱动，并通过 v-model 联动右侧预览。" split>
    <div class="control-grid">
      <label class="field-row">
        <span>项目名称</span>
        <SInput
          :model-value="projectName"
          clearable
          placeholder="输入项目名称"
          size="lg"
          @update:model-value="emit('update:projectName', $event)"
        />
      </label>

      <label class="field-row">
        <span>业务场景</span>
        <SSelect
          :items="scenarioOptions"
          :model-value="selectedScenario"
          placeholder="选择场景"
          size="lg"
          @update:model-value="emit('update:selectedScenario', $event)"
        />
      </label>
    </div>

    <SSeparator label="体验参数" />

    <div class="slider-block">
      <div class="row-between">
        <span>团队规模</span>
        <STag color="info" variant="soft">
          {{ teamSizeLabel }}
        </STag>
      </div>
      <SSlider
        :max="12"
        :min="3"
        :model-value="teamSize"
        :step="1"
        color="primary"
        @update:model-value="emit('update:teamSize', $event)"
      />
    </div>

    <div class="switch-row">
      <div>
        <strong>动效开关</strong>
        <p>开启后预览卡片会启用更活泼的视觉节奏。</p>
      </div>
      <SSwitch
        :model-value="enableMotion"
        color="success"
        size="lg"
        @update:model-value="emit('update:enableMotion', $event)"
      />
    </div>

    <label class="field-row">
      <span>项目备注</span>
      <STextarea
        :model-value="note"
        :maxlength="120"
        placeholder="记录这个 demo 的说明"
        resize="none"
        size="lg"
        @update:model-value="emit('update:note', $event)"
      />
    </label>

    <template #footer>
      <div class="footer-summary">
        <div>
          <span>当前场景</span>
          <strong>{{ scenarioLabel }}</strong>
        </div>
        <SButton color="primary" variant="soft">
          完成度 {{ Math.round(completion) }}%
        </SButton>
      </div>
    </template>
  </SCard>
</template>

<style scoped>
.control-card {
  height: 100%;
  border-color: rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(18px);
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.field-row {
  display: grid;
  gap: 10px;
  color: #334155;
  font-size: 14px;
  font-weight: 700;
}

.slider-block {
  display: grid;
  gap: 16px;
  margin: 22px 0;
}

.row-between,
.switch-row,
.footer-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.row-between {
  color: #334155;
  font-weight: 800;
}

.switch-row {
  padding: 18px;
  margin-bottom: 22px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.04), rgba(59, 130, 246, 0.08));
}

.switch-row strong,
.footer-summary strong {
  display: block;
  color: #0f172a;
}

.switch-row p {
  margin: 6px 0 0;
  color: #64748b;
  line-height: 1.6;
}

.footer-summary {
  width: 100%;
}

.footer-summary span {
  color: #64748b;
  font-size: 13px;
}

@media (max-width: 720px) {
  .control-grid,
  .switch-row,
  .footer-summary {
    grid-template-columns: 1fr;
  }

  .switch-row,
  .footer-summary {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
