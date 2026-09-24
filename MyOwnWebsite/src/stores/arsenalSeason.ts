import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, shallowRef } from "vue";
import { StorageKeys } from "@/constants/storage";
import { isArsenalSeasonPayload } from "@/features/arsenal-season/arsenalSeasonApi";
import type {
  ArsenalDiscipline,
  ArsenalSeasonPayload,
  Competition,
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
  payloads?: Partial<Record<Competition, ArsenalSeasonPayload>>;
  activeCompetition?: Competition;
  personalPredictions: Record<string, PersonalScorePrediction>;
  version: 2;
}

const emptyCache = (): ArsenalSeasonCache => ({
  activeCompetition: "premier-league",
  payload: null,
  payloads: {},
  personalPredictions: {},
  version: 2,
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
    const cachedPayloads = candidate.payloads && typeof candidate.payloads === "object"
      ? Object.fromEntries(Object.entries(candidate.payloads).filter(([key, value]) => (
          isCompetition(key) && isArsenalSeasonPayload(value)
        ))) as Partial<Record<Competition, ArsenalSeasonPayload>>
      : {};

    return {
      payload: isArsenalSeasonPayload(candidate.payload) ? candidate.payload : null,
      payloads: cachedPayloads,
      activeCompetition: isCompetition(candidate.activeCompetition)
        ? candidate.activeCompetition
        : undefined,
      personalPredictions: validPredictions,
      version: 2,
    };
  }
  catch {
    return emptyCache();
  }
};

const predictionKey = (season: string, fixtureId: string) => `${season}::${fixtureId}`;
const competitionKey = (competition: Competition, season: string, fixtureId: string) => (
  `${competition}::${season}::${fixtureId}`
);

const isCompetition = (value: unknown): value is Competition => (
  value === "premier-league" || value === "champions-league"
);

export const useArsenalSeasonStore = defineStore("arsenal-season", () => {
  const initialCache = readCache();
  const initialPayload = initialCache.payload;
  const initialCompetition = isCompetition(initialCache.activeCompetition)
    ? initialCache.activeCompetition
    : (initialPayload?.meta.competition ?? "premier-league");
  const cachedPayloads: Partial<Record<Competition, ArsenalSeasonPayload>> = {
    ...(initialCache.payloads ?? {}),
    ...(initialPayload && !initialCache.payloads?.[initialCompetition]
      ? { [initialCompetition]: initialPayload }
      : {}),
  };
  const activeCompetition = shallowRef<Competition>(initialCompetition);
  const payload = shallowRef<ArsenalSeasonPayload | null>(
    cachedPayloads[initialCompetition] ?? null,
  );
  const payloads = shallowRef(cachedPayloads);
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
      const competition = payload.value?.meta.competition ?? "premier-league";
      const personalPrediction = personalPredictions.value[
        competitionKey(competition, season, fixture.id)
      ] ?? personalPredictions.value[predictionKey(season, fixture.id)];
      return personalPrediction ? { ...fixture, personalPrediction } : fixture;
    });
  });

  const persist = () => {
    if (typeof localStorage === "undefined") {
      return;
    }

    try {
      localStorage.setItem(ArsenalSeasonStorageKey, JSON.stringify({
        activeCompetition: activeCompetition.value,
        payload: payload.value,
        payloads: payloads.value,
        personalPredictions: personalPredictions.value,
        version: 2,
      } satisfies ArsenalSeasonCache));
    }
    catch {
      // The page remains usable when storage is unavailable or full.
    }
  };

  const replaceSeasonPayload = (nextPayload: ArsenalSeasonPayload) => {
    const competition = nextPayload.meta.competition ?? "premier-league";
    nextPayload = {
      ...nextPayload,
      meta: {
        ...nextPayload.meta,
        competition,
      },
      fixtures: nextPayload.fixtures.map((fixture) => ({
        ...fixture,
        competition: fixture.competition ?? competition,
      })),
    };
    payloads.value = { ...payloads.value, [competition]: nextPayload };
    activeCompetition.value = competition;
    payload.value = nextPayload;
    persist();
  };

  const selectCompetition = (competition: Competition) => {
    activeCompetition.value = competition;
    payload.value = payloads.value[competition] ?? null;
    persist();
  };

  const savePersonalPrediction = (
    fixtureId: string,
    draft: PersonalScorePredictionDraft,
  ) => {
    const season = payload.value?.meta.season;
    const competition = payload.value?.meta.competition ?? "premier-league";
    const fixtureExists = payload.value?.fixtures.some((fixture) => fixture.id === fixtureId);
    if (!season || !fixtureExists || !isScore(draft.arsenalScore) || !isScore(draft.opponentScore)) {
      return false;
    }

    personalPredictions.value = {
      ...personalPredictions.value,
      [competitionKey(competition, season, fixtureId)]: {
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
    activeCompetition,
    fixtures,
    fixturesWithPersonalPredictions,
    meta,
    payload,
    personalPredictions,
    payloads,
    replaceSeasonPayload,
    savePersonalPrediction,
    selectCompetition,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useArsenalSeasonStore, import.meta.hot));
}
