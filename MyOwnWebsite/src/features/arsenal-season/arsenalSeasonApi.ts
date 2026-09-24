import type {
  ArsenalFixture,
  ArsenalSeasonPayload,
  HeadToHeadMeeting,
  HeadToHeadSummary,
  MatchActual,
  Competition,
} from "./arsenalSeason";

interface FetchArsenalSeasonOptions {
  competition?: Competition;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === "object" && value !== null
);

const isNullableNumber = (value: unknown): value is number | null => (
  value === null || (typeof value === "number" && Number.isFinite(value))
);

const isCardCount = (value: unknown): value is number => (
  typeof value === "number" && Number.isInteger(value) && value >= 0
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
  && (value.source === "football-data" || value.source === "thesportsdb")
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
  && (value.competition === undefined
    || value.competition === "premier-league"
    || value.competition === "champions-league")
  && (value.matchweek === null || typeof value.matchweek === "number")
  && (value.kickoffTime === null || typeof value.kickoffTime === "string")
  && (value.roundLabel === undefined || value.roundLabel === null || typeof value.roundLabel === "string")
  && typeof value.opponent === "string"
  && typeof value.opponentCode === "string"
  && (value.venue === "home" || value.venue === "away")
  && (value.venueName === undefined || value.venueName === null || typeof value.venueName === "string")
  && (value.status === "completed" || value.status === "live" || value.status === "upcoming")
  && isNullableNumber(value.difficulty)
  && (value.actual === undefined || isMatchActual(value.actual))
  && (value.headToHead === undefined || isHeadToHeadSummary(value.headToHead))
);

export const isArsenalSeasonPayload = (value: unknown): value is ArsenalSeasonPayload => {
  if (
    !isRecord(value)
    || !isRecord(value.discipline)
    || !isRecord(value.meta)
    || !Array.isArray(value.fixtures)
  ) {
    return false;
  }

  return isCardCount(value.discipline.yellowCards)
    && isCardCount(value.discipline.redCards)
    && (value.meta.source === "espn"
      || value.meta.source === "fpl"
      || value.meta.source === "thesportsdb")
    && typeof value.meta.fetchedAt === "string"
    && (value.meta.matchCount === undefined
      || (typeof value.meta.matchCount === "number" && value.meta.matchCount > 0))
    && typeof value.meta.season === "string"
    && typeof value.meta.stale === "boolean"
    && value.fixtures.every(isFixture);
};

export const fetchArsenalSeason = async ({
  competition = "premier-league",
  fetchImpl = fetch,
  signal,
}: FetchArsenalSeasonOptions = {}): Promise<ArsenalSeasonPayload> => {
  const endpoint = competition === "premier-league"
    ? "/api/football/arsenal-season"
    : `/api/football/arsenal-season?competition=${encodeURIComponent(competition)}`;
  const response = await fetchImpl(endpoint, {
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
