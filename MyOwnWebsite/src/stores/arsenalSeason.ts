import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, shallowRef } from "vue";
import { StorageKeys } from "@/constants/storage";
import { isArsenalSeasonPayload } from "@/features/arsenal-season/arsenalSeasonApi";
import type {
  ArsenalDiscipline,
  ArsenalSeasonPayload,
  PersonalScorePrediction,
  PersonalScorePredictionDraft,
} from "@/features/arsenal-season/arsenalSeason";

const emptyDiscipline: ArsenalDiscipline = {
  redCards: 0,
  yellowCards: 0,
};

export const ArsenalSeasonStorageKey = StorageKeys.arsenalSeasonCache;

interface ArsenalSeasonCache {
  payload: ArsenalSeasonPayload | null;
  personalPredictions: Record<string, PersonalScorePrediction>;
  version: 1;
}

const emptyCache = (): ArsenalSeasonCache => ({
  payload: null,
  personalPredictions: {},
  version: 1,
});

const isScore = (value: unknown): value is number => (
  Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 20
);

const isPersonalPrediction = (value: unknown): value is PersonalScorePrediction => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const prediction = value as Partial<PersonalScorePrediction>;
  return isScore(prediction.arsenalScore)
    && isScore(prediction.opponentScore)
    && typeof prediction.updatedAt === "string";
};

const readCache = (): ArsenalSeasonCache => {
  if (typeof localStorage === "undefined") {
    return emptyCache();
  }

  try {
    const rawCache = localStorage.getItem(ArsenalSeasonStorageKey);
    if (!rawCache) {
      return emptyCache();
    }

    const parsed: unknown = JSON.parse(rawCache);
    if (!parsed || typeof parsed !== "object") {
      return emptyCache();
    }

    const candidate = parsed as Partial<ArsenalSeasonCache>;
    const predictions = candidate.personalPredictions;
    const validPredictions = predictions && typeof predictions === "object"
      ? Object.fromEntries(Object.entries(predictions).filter(([, value]) => (
          isPersonalPrediction(value)
        )))
      : {};

    return {
      payload: isArsenalSeasonPayload(candidate.payload) ? candidate.payload : null,
      personalPredictions: validPredictions,
      version: 1,
    };
  }
  catch {
    return emptyCache();
  }
};

const predictionKey = (season: string, fixtureId: string) => `${season}::${fixtureId}`;

export const useArsenalSeasonStore = defineStore("arsenal-season", () => {
  const initialCache = readCache();
  const payload = shallowRef<ArsenalSeasonPayload | null>(initialCache.payload);
  const personalPredictions = shallowRef<Record<string, PersonalScorePrediction>>(
    initialCache.personalPredictions,
  );

  const fixtures = computed(() => payload.value?.fixtures ?? []);
  const discipline = computed(() => payload.value?.discipline ?? emptyDiscipline);
  const meta = computed(() => payload.value?.meta ?? null);
  const fixturesWithPersonalPredictions = computed(() => {
    const season = payload.value?.meta.season;
    if (!season) {
      return fixtures.value;
    }

    return fixtures.value.map((fixture) => {
      const personalPrediction = personalPredictions.value[predictionKey(season, fixture.id)];
      return personalPrediction ? { ...fixture, personalPrediction } : fixture;
    });
  });

  const persist = () => {
    if (typeof localStorage === "undefined") {
      return;
    }

    try {
      localStorage.setItem(ArsenalSeasonStorageKey, JSON.stringify({
        payload: payload.value,
        personalPredictions: personalPredictions.value,
        version: 1,
      } satisfies ArsenalSeasonCache));
    }
    catch {
      // The page remains usable when storage is unavailable or full.
    }
  };

  const replaceSeasonPayload = (nextPayload: ArsenalSeasonPayload) => {
    payload.value = nextPayload;
    persist();
  };

  const savePersonalPrediction = (
    fixtureId: string,
    draft: PersonalScorePredictionDraft,
  ) => {
    const season = payload.value?.meta.season;
    const fixtureExists = payload.value?.fixtures.some((fixture) => fixture.id === fixtureId);
    if (!season || !fixtureExists || !isScore(draft.arsenalScore) || !isScore(draft.opponentScore)) {
      return false;
    }

    personalPredictions.value = {
      ...personalPredictions.value,
      [predictionKey(season, fixtureId)]: {
        arsenalScore: draft.arsenalScore,
        opponentScore: draft.opponentScore,
        updatedAt: new Date().toISOString(),
      },
    };
    persist();
    return true;
  };

  return {
    discipline,
    fixtures,
    fixturesWithPersonalPredictions,
    meta,
    payload,
    personalPredictions,
    replaceSeasonPayload,
    savePersonalPrediction,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useArsenalSeasonStore, import.meta.hot));
}
