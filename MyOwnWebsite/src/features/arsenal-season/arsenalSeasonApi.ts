import type {
  ArsenalFixture,
  ArsenalSeasonPayload,
  HeadToHeadMeeting,
  HeadToHeadSummary,
  MatchActual,
} from "./arsenalSeason";

interface FetchArsenalSeasonOptions {
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === "object" && value !== null
);

const isNullableNumber = (value: unknown): value is number | null => (
  value === null || (typeof value === "number" && Number.isFinite(value))
);

const isMatchActual = (value: unknown): value is MatchActual => (
  isRecord(value)
  && typeof value.arsenalScore === "number"
  && typeof value.opponentScore === "number"
  && isNullableNumber(value.fplBonus)
  && isNullableNumber(value.bps)
);

const isHeadToHeadMeeting = (value: unknown): value is HeadToHeadMeeting => (
  isRecord(value)
  && typeof value.date === "string"
  && (value.venue === "home" || value.venue === "away")
  && typeof value.arsenalScore === "number"
  && typeof value.opponentScore === "number"
);

const isHeadToHeadSummary = (value: unknown): value is HeadToHeadSummary => (
  isRecord(value)
  && value.source === "football-data"
  && typeof value.meetings === "number"
  && typeof value.arsenalWins === "number"
  && typeof value.draws === "number"
  && typeof value.opponentWins === "number"
  && typeof value.goalsFor === "number"
  && typeof value.goalsAgainst === "number"
  && (value.lastMeeting === null || isHeadToHeadMeeting(value.lastMeeting))
);

const isFixture = (value: unknown): value is ArsenalFixture => (
  isRecord(value)
  && typeof value.id === "string"
  && (value.matchweek === null || typeof value.matchweek === "number")
  && (value.kickoffTime === null || typeof value.kickoffTime === "string")
  && typeof value.opponent === "string"
  && typeof value.opponentCode === "string"
  && (value.venue === "home" || value.venue === "away")
  && (value.status === "completed" || value.status === "live" || value.status === "upcoming")
  && isNullableNumber(value.difficulty)
  && (value.actual === undefined || isMatchActual(value.actual))
  && (value.headToHead === undefined || isHeadToHeadSummary(value.headToHead))
);

export const isArsenalSeasonPayload = (value: unknown): value is ArsenalSeasonPayload => {
  if (!isRecord(value) || !isRecord(value.meta) || !Array.isArray(value.fixtures)) {
    return false;
  }

  return value.meta.source === "fpl"
    && typeof value.meta.fetchedAt === "string"
    && typeof value.meta.season === "string"
    && typeof value.meta.stale === "boolean"
    && value.fixtures.every(isFixture);
};

export const fetchArsenalSeason = async ({
  fetchImpl = fetch,
  signal,
}: FetchArsenalSeasonOptions = {}): Promise<ArsenalSeasonPayload> => {
  const response = await fetchImpl("/api/football/arsenal-season", {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Arsenal season request failed with status ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (!isArsenalSeasonPayload(payload)) {
    throw new Error("Arsenal season response has an unexpected shape.");
  }

  return payload;
};
