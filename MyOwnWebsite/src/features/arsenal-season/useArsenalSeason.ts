import { computed, onMounted, onUnmounted, readonly, shallowRef } from "vue";
import { fetchArsenalSeason } from "./arsenalSeasonApi";
import {
  addUpcomingPredictions,
  buildSeasonTrend,
  calculateSeasonSummary,
  getMatchResult,
  type ArsenalFixture,
  type ArsenalSeasonMeta,
  type FixtureFilter,
} from "./arsenalSeason";

export function useArsenalSeason() {
  const activeFilter = shallowRef<FixtureFilter>("all");
  const fixtures = shallowRef<readonly ArsenalFixture[]>([]);
  const meta = shallowRef<ArsenalSeasonMeta | null>(null);
  const isLoading = shallowRef(true);
  const error = shallowRef<string | null>(null);
  let activeController: AbortController | null = null;
  let requestVersion = 0;

  const modeledFixtures = computed(() => addUpcomingPredictions(fixtures.value));
  const summary = computed(() => calculateSeasonSummary(modeledFixtures.value));
  const trend = computed(() => buildSeasonTrend(modeledFixtures.value));
  const nextFixture = computed(() => modeledFixtures.value.find((fixture) => (
    fixture.status === "live" || fixture.status === "upcoming"
  )) ?? null);
  const visibleFixtures = computed(() => {
    if (activeFilter.value === "all") {
      return modeledFixtures.value;
    }

    if (activeFilter.value === "completed") {
      return modeledFixtures.value.filter((fixture) => fixture.status === "completed");
    }

    return modeledFixtures.value.filter((fixture) => fixture.status !== "completed");
  });
  const form = computed(() => fixtures.value
    .filter((fixture) => fixture.status === "completed")
    .map(getMatchResult)
    .filter((result) => result !== null)
    .slice(-5));
  const latestActual = computed(() => [...fixtures.value]
    .reverse()
    .find((fixture) => fixture.status === "completed" && fixture.actual)?.actual ?? null);
  const season = computed(() => meta.value?.season ?? "2026/27");
  const lastUpdated = computed(() => meta.value?.fetchedAt ?? null);
  const isStale = computed(() => meta.value?.stale ?? false);

  const setFilter = (filter: FixtureFilter) => {
    activeFilter.value = filter;
  };

  const refresh = async () => {
    activeController?.abort();
    const controller = new AbortController();
    const version = ++requestVersion;
    activeController = controller;
    isLoading.value = true;
    error.value = null;

    try {
      const payload = await fetchArsenalSeason({ signal: controller.signal });
      if (version !== requestVersion) {
        return;
      }
      fixtures.value = payload.fixtures;
      meta.value = payload.meta;
    }
    catch (cause) {
      if (version !== requestVersion || (cause instanceof DOMException && cause.name === "AbortError")) {
        return;
      }
      error.value = "赛程数据加载失败，请稍后重试。";
    }
    finally {
      if (version === requestVersion) {
        isLoading.value = false;
      }
    }
  };

  onMounted(() => {
    void refresh();
  });

  onUnmounted(() => {
    requestVersion += 1;
    activeController?.abort();
  });

  return {
    activeFilter: readonly(activeFilter),
    error: readonly(error),
    fixtures: readonly(fixtures),
    form,
    isLoading: readonly(isLoading),
    isStale,
    lastUpdated,
    latestActual,
    nextFixture,
    refresh,
    season,
    setFilter,
    summary,
    trend,
    visibleFixtures,
  };
}
