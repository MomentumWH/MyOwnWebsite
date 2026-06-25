<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch } from "vue";
import { NButton, NDrawer, NDrawerContent } from "naive-ui";
import type {
  CsgoFilterGroup,
  CsgoFilterOption,
  CsgoFilterValues,
} from "./filterDrawerTypes";

const props = withDefaults(
  defineProps<{
    show: boolean;
    groups: CsgoFilterGroup[];
    selectedValues: CsgoFilterValues;
    width?: number;
    allValueSuffix?: string;
  }>(),
  {
    width: 500,
    allValueSuffix: "-all",
  },
);

const emit = defineEmits<{
  "update:show": [value: boolean];
  "update:selectedValues": [value: CsgoFilterValues];
  reset: [value: CsgoFilterValues];
  apply: [value: CsgoFilterValues];
  opened: [drawerElement: HTMLElement];
}>();

const drawerRef = useTemplateRef<HTMLElement>("drawerRef");
const activeFilterNav = ref(0);
const groupRefs = ref<(HTMLElement | null)[]>([]);

const cloneSelectedValues = (values: CsgoFilterValues) =>
  Object.fromEntries(Object.entries(values).map(([groupName, selected]) => [groupName, [...selected]]));

const buildEmptySelectedValues = () =>
  Object.fromEntries(props.groups.map((group) => [group.name, [] as string[]]));

const getGroupValues = (groupName: string) => props.selectedValues[groupName] ?? [];

const updateGroupValues = (groupName: string, values: string[]) => {
  emit("update:selectedValues", {
    ...cloneSelectedValues(props.selectedValues),
    [groupName]: values,
  });
};

const setGroupRef = (el: Element | null, index: number) => {
  groupRefs.value[index] = el instanceof HTMLElement ? el : null;
};

const updateActiveFilterNavByScroll = (contentEl: HTMLElement) => {
  const viewportMiddle = contentEl.scrollTop + contentEl.clientHeight / 2;
  const currentIndex = groupRefs.value.reduce((activeIndex, groupEl, index) => {
    if (!groupEl) {
      return activeIndex;
    }

    return groupEl.offsetTop <= viewportMiddle ? index : activeIndex;
  }, 0);

  activeFilterNav.value = currentIndex;
};

const scrollToGroup = (index: number) => {
  const groupEl = groupRefs.value[index];
  const contentEl = groupEl?.parentElement;

  if (!groupEl || !contentEl) {
    return;
  }

  activeFilterNav.value = index;
  contentEl.scrollTo({
    top: groupEl.offsetTop,
    behavior: "smooth",
  });
};

const handleFilterContentScroll = (event: Event) => {
  requestAnimationFrame(() => {
    updateActiveFilterNavByScroll(event.target as HTMLElement);
  });
};

const clearFilterSection = (groupValues: string[], options: CsgoFilterOption[]) => {
  const sectionValues = new Set(options.map((option) => option.value));
  return groupValues.filter((value) => !sectionValues.has(value));
};

const toggleFilter = (groupName: string, optionValue: string, sectionOptions: CsgoFilterOption[]) => {
  const currentValues = getGroupValues(groupName);

  if (optionValue.endsWith(props.allValueSuffix)) {
    updateGroupValues(groupName, clearFilterSection(currentValues, sectionOptions));
    return;
  }

  updateGroupValues(
    groupName,
    currentValues.includes(optionValue)
      ? currentValues.filter((value) => value !== optionValue)
      : [...currentValues, optionValue],
  );
};

const isOptionSelected = (groupName: string, optionValue: string, sectionOptions: CsgoFilterOption[]) => {
  const currentValues = getGroupValues(groupName);

  if (optionValue.endsWith(props.allValueSuffix)) {
    const sectionValues = new Set(sectionOptions.map((option) => option.value));
    return !currentValues.some((value) => sectionValues.has(value));
  }

  return currentValues.includes(optionValue);
};

const resetFilters = () => {
  const emptyValues = buildEmptySelectedValues();
  emit("update:selectedValues", emptyValues);
  emit("reset", emptyValues);
};

const applyFilters = () => {
  emit("apply", cloneSelectedValues(props.selectedValues));
  emit("update:show", false);
};

const resetFilterDrawerScroll = async () => {
  activeFilterNav.value = 0;
  groupRefs.value = [];
  await nextTick();

  const contentEl = drawerRef.value?.querySelector<HTMLElement>(".filter-content");
  if (contentEl) {
    contentEl.scrollTop = 0;
    updateActiveFilterNavByScroll(contentEl);
  }
};

watch(
  () => props.show,
  async (isOpen) => {
    if (!isOpen) {
      return;
    }

    await resetFilterDrawerScroll();

    if (drawerRef.value) {
      emit("opened", drawerRef.value);
    }
  },
);

watch(
  () => props.groups,
  () => {
    groupRefs.value = [];
  },
);
</script>

<template>
  <n-drawer
    :show="show"
    class="filter-drawer"
    content-class="filter-drawer-content-panel"
    placement="right"
    :width="width"
    :native-scrollbar="false"
    @update:show="emit('update:show', $event)"
  >
    <n-drawer-content
      body-class="filter-drawer-body"
      body-content-class="filter-drawer-body-content"
      :bordered="false"
      :show-header="false"
    >
      <div ref="drawerRef" class="filter-drawer-wrapper">
        <div class="filter-content" @scroll="handleFilterContentScroll">
          <div
            v-for="(group, index) in groups"
            :key="group.name"
            class="filter-group"
            :ref="(el) => setGroupRef(el, index)"
          >
            <div
              v-for="section in group.sections"
              :key="section.title"
              class="filter-section"
            >
              <h4 class="group-title">{{ section.title }}</h4>
              <div class="filter-options">
                <button
                  v-for="option in section.options"
                  :key="option.value"
                  class="filter-option"
                  :class="{
                    active: isOptionSelected(group.name, option.value, section.options),
                  }"
                  type="button"
                  @click="toggleFilter(group.name, option.value, section.options)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="filter-nav">
          <button
            v-for="(group, index) in groups"
            :key="group.name"
            class="nav-item"
            :class="{ active: activeFilterNav === index }"
            type="button"
            @click="scrollToGroup(index)"
          >
            {{ group.name }}
          </button>
        </div>
      </div>

      <div class="filter-drawer-footer">
        <n-button class="footer-btn reset-btn" @click="resetFilters">
          重置
        </n-button>
        <n-button type="primary" class="footer-btn apply-btn" @click="applyFilters">
          完成
        </n-button>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped lang="scss">
:global(.filter-drawer.n-drawer) {
  background: #212322 !important;
  box-shadow: -18px 0 36px rgba(0, 0, 0, 0.24);
}

:global(.filter-drawer .n-drawer-content-wrapper),
:global(.filter-drawer .filter-drawer-content-panel) {
  height: 100%;
  background: #212322 !important;
  color: #d7d6cc;
}

:global(.filter-drawer .n-drawer-content) {
  height: 100%;
  background: #212322 !important;
}

:global(.filter-drawer .n-drawer-body),
:global(.filter-drawer .filter-drawer-body) {
  height: 100vh;
  background: #212322 !important;
}

:global(.filter-drawer .n-drawer-body-content-wrapper),
:global(.filter-drawer .filter-drawer-body-content) {
  height: 100%;
  padding: 0 !important;
  overflow: hidden;
  background: #212322 !important;
}

.filter-drawer-wrapper {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 64px;
  height: calc(100vh - 76px);
  max-height: calc(100vh - 76px);
  background: #212322;
}

.filter-content {
  min-width: 0;
  padding: 0 12px 28px 6px;
  overflow-y: auto;
  background: #212322;
  scrollbar-color: rgba(61, 124, 220, 0.7) rgba(255, 255, 255, 0.03);
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.03);
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: #3577d8;
  }
}

.filter-group {
  min-height: calc(100vh - 76px);
  padding: 8px 0 24px;
}

.filter-section {
  margin-bottom: 8px;
}

.group-title {
  margin: 0 0 8px;
  color: #6f91bc;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
}

.filter-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 10px;
}

.filter-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.075);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.012);
  color: #9b9a91;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;

  &:hover {
    border-color: rgba(61, 124, 220, 0.44);
    background: rgba(61, 124, 220, 0.08);
    color: #c5d5ec;
  }

  &.active {
    border-color: rgba(61, 124, 220, 0.72);
    background: rgba(61, 124, 220, 0.16);
    color: #e4efff;
  }
}

.filter-nav {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 18px;
  align-items: stretch;
  padding: 8px 0;
  border-left: 1px solid rgba(255, 255, 255, 0.025);
  background: rgba(30, 32, 31, 0.96);

  .nav-item {
    position: relative;
    justify-content: center;
    min-height: 30px;
    padding: 0 6px;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: #8f8e86;
    font-size: 13px;
    font-weight: 900;
    text-align: center;
    cursor: pointer;
    transition: color 0.18s ease;

    &:hover {
      color: #9ebff2;
      background: transparent;
    }

    &.active {
      color: #b9b8ab;

      &::before {
        position: absolute;
        top: 0;
        left: -1px;
        width: 2px;
        height: 100%;
        content: "";
        border-radius: 999px;
        background: #3179df;
      }

      &::after {
        display: none;
      }
    }
  }
}

.filter-drawer-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  height: 76px;
  padding: 16px 16px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.025);
  background: #212322;
}

.footer-btn {
  flex: 0 0 82px;
  height: 32px;
  border-radius: 3px;
  font-size: 13px;
  font-weight: 900;
}

.reset-btn {
  background: #3d4659;
  border: 1px solid rgba(255, 255, 255, 0.04);
  color: #d7d6cc;

  &:hover {
    background: #485269;
    color: #fff;
    border-color: rgba(255, 255, 255, 0.08);
  }
}

.apply-btn {
  background: #3d62a0;
  border: 1px solid rgba(255, 255, 255, 0.04);
  color: #f1f6ff;

  &:hover {
    background: #4771b9;
  }
}

@media (max-width: 640px) {
  .filter-drawer-wrapper {
    grid-template-columns: minmax(0, 1fr) 58px;
  }

  .filter-options {
    grid-template-columns: 1fr;
  }
}
</style>
