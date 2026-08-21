import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ArsenalSeasonPayload } from "@/features/arsenal-season/arsenalSeason";
import {
  ArsenalSeasonStorageKey,
  useArsenalSeasonStore,
} from "./arsenalSeason";

const createMemoryStorage = (): Storage => {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
};

const createPayload = (
  fetchedAt: string,
  season = "2026/27",
  difficulty = 2,
): ArsenalSeasonPayload => ({
  fixtures: [{
    difficulty,
    id: "fixture-1",
    kickoffTime: "2026-08-21T19:00:00Z",
    matchweek: 1,
    opponent: "Coventry City",
    opponentCode: "COV",
    status: "upcoming",
    venue: "home",
  }],
  meta: {
    fetchedAt,
    season,
    source: "fpl",
    stale: false,
  },
});

describe("arsenal season store", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("overwrites the fixture snapshot while preserving personal predictions", () => {
    const store = useArsenalSeasonStore();
    store.replaceSeasonPayload(createPayload("2026-08-18T03:00:00.000Z", "2026/27", 2));
    expect(store.savePersonalPrediction("fixture-1", {
      arsenalScore: 3,
      opponentScore: 1,
    })).toBe(true);

    store.replaceSeasonPayload(createPayload("2026-08-20T03:00:00.000Z", "2026/27", 4));

    expect(store.payload?.meta.fetchedAt).toBe("2026-08-20T03:00:00.000Z");
    expect(store.payload?.fixtures[0]?.difficulty).toBe(4);
    expect(store.fixturesWithPersonalPredictions[0]?.personalPrediction).toMatchObject({
      arsenalScore: 3,
      opponentScore: 1,
    });

    const persisted = JSON.parse(localStorage.getItem(ArsenalSeasonStorageKey) ?? "{}");
    expect(persisted.payload.meta.fetchedAt).toBe("2026-08-20T03:00:00.000Z");
    expect(Object.values(persisted.personalPredictions)).toHaveLength(1);
  });

  it("hydrates cached fixtures and predictions in a fresh store instance", () => {
    const firstStore = useArsenalSeasonStore();
    firstStore.replaceSeasonPayload(createPayload("2026-08-20T03:00:00.000Z"));
    firstStore.savePersonalPrediction("fixture-1", {
      arsenalScore: 2,
      opponentScore: 0,
    });

    setActivePinia(createPinia());
    const restoredStore = useArsenalSeasonStore();

    expect(restoredStore.fixtures).toHaveLength(1);
    expect(restoredStore.fixturesWithPersonalPredictions[0]?.personalPrediction).toMatchObject({
      arsenalScore: 2,
      opponentScore: 0,
    });
  });

  it("keeps old predictions without applying them to another season", () => {
    const store = useArsenalSeasonStore();
    store.replaceSeasonPayload(createPayload("2026-08-20T03:00:00.000Z"));
    store.savePersonalPrediction("fixture-1", {
      arsenalScore: 1,
      opponentScore: 1,
    });

    store.replaceSeasonPayload(createPayload("2027-08-20T03:00:00.000Z", "2027/28"));

    expect(store.fixturesWithPersonalPredictions[0]?.personalPrediction).toBeUndefined();
    expect(Object.values(store.personalPredictions)).toHaveLength(1);
  });
});
