import { parse } from "csv-parse/sync";

const fplBaseUrl = "https://fantasy.premierleague.com/api";
const historyBaseUrl = "https://www.football-data.co.uk/mmz4281";
const cacheTtlMs = 5 * 60 * 1000;
const staleTtlMs = 24 * 60 * 60 * 1000;
const historySeasonCount = 3;

let cachedSeason = null;

const fetchJson = async (url, source, fetchImpl) => {
  const response = await fetchImpl(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "MyOwnWebsite/1.0 Arsenal season dashboard",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`${source} request failed with status ${response.status}.`);
  }

  return response.json();
};

const fetchHistorySeason = async (season, fetchImpl) => {
  const response = await fetchImpl(`${historyBaseUrl}/${season}/E0.csv`, {
    headers: {
      Accept: "text/csv",
      "User-Agent": "MyOwnWebsite/1.0 Arsenal season dashboard",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Football-Data request failed with status ${response.status}.`);
  }

  return parse(await response.text(), {
    bom: true,
    columns: true,
    relax_column_count: true,
    skip_empty_lines: true,
  });
};

const teamNameAliases = new Map([
  ["brighton", "brighton and hove albion"],
  ["leeds", "leeds united"],
  ["man city", "manchester city"],
  ["man united", "manchester united"],
  ["man utd", "manchester united"],
  ["nott'm forest", "nottingham forest"],
  ["spurs", "tottenham hotspur"],
  ["tottenham", "tottenham hotspur"],
  ["wolves", "wolverhampton wanderers"],
]);

const canonicalTeamName = (value) => {
  const normalized = String(value || "")
    .toLowerCase()
    .replace(/\b(?:fc|afc)\b/g, "")
    .replace(/[^a-z0-9']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return teamNameAliases.get(normalized) || normalized;
};

const normalizeMatchDate = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const parts = value.split("/");
  return parts.length === 3
    ? `${parts[2]}-${parts[1]}-${parts[0]}`
    : value;
};

const getHistoricalSeasons = (fixtures) => {
  const firstKickoff = fixtures
    .map((fixture) => fixture.kickoff_time)
    .filter((value) => typeof value === "string")
    .sort()[0];
  const currentStartYear = firstKickoff
    ? new Date(firstKickoff).getUTCFullYear()
    : new Date().getUTCFullYear();

  return Array.from({ length: historySeasonCount }, (_, index) => {
    const startYear = currentStartYear - index - 1;
    return `${String(startYear).slice(-2)}${String(startYear + 1).slice(-2)}`;
  });
};

export const normalizeHeadToHead = (events) => {
  if (!Array.isArray(events)) {
    return new Map();
  }

  const meetingsByOpponent = new Map();

  events.forEach((event) => {
    const homeTeam = canonicalTeamName(event?.HomeTeam ?? event?.strHomeTeam);
    const awayTeam = canonicalTeamName(event?.AwayTeam ?? event?.strAwayTeam);
    const arsenalIsHome = homeTeam === "arsenal";
    const arsenalIsAway = awayTeam === "arsenal";
    const rawHomeScore = event?.FTHG ?? event?.intHomeScore;
    const rawAwayScore = event?.FTAG ?? event?.intAwayScore;
    const hasScores = rawHomeScore !== null
      && rawHomeScore !== undefined
      && rawHomeScore !== ""
      && rawAwayScore !== null
      && rawAwayScore !== undefined
      && rawAwayScore !== "";
    const homeScore = Number(rawHomeScore);
    const awayScore = Number(rawAwayScore);

    if ((!arsenalIsHome && !arsenalIsAway)
      || !hasScores
      || !Number.isFinite(homeScore)
      || !Number.isFinite(awayScore)) {
      return;
    }

    const opponent = arsenalIsHome ? awayTeam : homeTeam;
    const meeting = {
      date: normalizeMatchDate(event?.Date ?? event?.dateEvent),
      venue: arsenalIsHome ? "home" : "away",
      arsenalScore: arsenalIsHome ? homeScore : awayScore,
      opponentScore: arsenalIsHome ? awayScore : homeScore,
    };
    const meetings = meetingsByOpponent.get(opponent) || [];
    meetings.push(meeting);
    meetingsByOpponent.set(opponent, meetings);
  });

  return new Map(Array.from(meetingsByOpponent, ([opponent, meetings]) => {
    const sample = meetings
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, historySeasonCount * 2);

    return [opponent, {
      meetings: sample.length,
      arsenalWins: sample.filter((meeting) => meeting.arsenalScore > meeting.opponentScore).length,
      draws: sample.filter((meeting) => meeting.arsenalScore === meeting.opponentScore).length,
      opponentWins: sample.filter((meeting) => meeting.arsenalScore < meeting.opponentScore).length,
      goalsFor: sample.reduce((total, meeting) => total + meeting.arsenalScore, 0),
      goalsAgainst: sample.reduce((total, meeting) => total + meeting.opponentScore, 0),
      lastMeeting: sample[0] || null,
      source: "football-data",
    }];
  }));
};

const sumFixtureStat = (fixture, arsenalTeamId, identifier) => {
  const stat = Array.isArray(fixture.stats)
    ? fixture.stats.find((item) => item?.identifier === identifier)
    : null;

  if (!stat) {
    return null;
  }

  const values = fixture.team_h === arsenalTeamId ? stat.h : stat.a;
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  return values.reduce((total, item) => total + (Number(item?.value) || 0), 0);
};

const getSeasonLabel = (fixtures) => {
  const firstKickoff = fixtures
    .map((fixture) => fixture.kickoff_time)
    .filter((value) => typeof value === "string")
    .sort()[0];

  if (!firstKickoff) {
    return "Current season";
  }

  const startYear = new Date(firstKickoff).getUTCFullYear();
  return `${startYear}/${String(startYear + 1).slice(-2)}`;
};

const getFixtureStatus = (fixture) => {
  if (fixture.finished) {
    return "completed";
  }

  if (fixture.started) {
    return "live";
  }

  return "upcoming";
};

export const normalizeArsenalSeason = (bootstrap, fixtures, fetchedAt = new Date().toISOString()) => {
  if (!Array.isArray(bootstrap?.teams) || !Array.isArray(fixtures)) {
    throw new TypeError("FPL returned an unexpected response shape.");
  }

  const arsenal = bootstrap.teams.find((team) => team?.name === "Arsenal");
  if (!arsenal || !Number.isInteger(arsenal.id)) {
    throw new Error("Arsenal is missing from the FPL team list.");
  }

  const teamsById = new Map(bootstrap.teams.map((team) => [team.id, team]));
  const arsenalFixtures = fixtures
    .filter((fixture) => fixture?.team_h === arsenal.id || fixture?.team_a === arsenal.id)
    .map((fixture) => {
      const isHome = fixture.team_h === arsenal.id;
      const opponent = teamsById.get(isHome ? fixture.team_a : fixture.team_h);
      const arsenalScore = isHome ? fixture.team_h_score : fixture.team_a_score;
      const opponentScore = isHome ? fixture.team_a_score : fixture.team_h_score;
      const hasScore = Number.isFinite(arsenalScore) && Number.isFinite(opponentScore);

      return {
        id: String(fixture.id),
        matchweek: Number.isInteger(fixture.event) ? fixture.event : null,
        kickoffTime: typeof fixture.kickoff_time === "string" ? fixture.kickoff_time : null,
        opponent: opponent?.name || "Opponent TBD",
        opponentCode: opponent?.short_name || "TBD",
        venue: isHome ? "home" : "away",
        status: getFixtureStatus(fixture),
        difficulty: Number(isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty) || null,
        ...(hasScore
          ? {
              actual: {
                arsenalScore,
                opponentScore,
                fplBonus: sumFixtureStat(fixture, arsenal.id, "bonus"),
                bps: sumFixtureStat(fixture, arsenal.id, "bps"),
              },
            }
          : {}),
      };
    })
    .sort((left, right) => {
      if (left.matchweek !== right.matchweek) {
        return (left.matchweek ?? Number.MAX_SAFE_INTEGER) - (right.matchweek ?? Number.MAX_SAFE_INTEGER);
      }
      return (left.kickoffTime || "").localeCompare(right.kickoffTime || "");
    });

  if (arsenalFixtures.length === 0) {
    throw new Error("FPL returned no Arsenal fixtures for the current season.");
  }

  return {
    meta: {
      fetchedAt,
      season: getSeasonLabel(arsenalFixtures.map((fixture) => ({ kickoff_time: fixture.kickoffTime }))),
      source: "fpl",
      stale: false,
    },
    fixtures: arsenalFixtures,
  };
};

export const getArsenalSeasonData = async ({
  fetchImpl = fetch,
  now = Date.now(),
} = {}) => {
  if (cachedSeason && now - cachedSeason.cachedAt < cacheTtlMs) {
    return cachedSeason.payload;
  }

  try {
    const [bootstrap, fixtures] = await Promise.all([
      fetchJson(`${fplBaseUrl}/bootstrap-static/`, "FPL", fetchImpl),
      fetchJson(`${fplBaseUrl}/fixtures/`, "FPL", fetchImpl),
    ]);
    const payload = normalizeArsenalSeason(bootstrap, fixtures, new Date(now).toISOString());
    const historyResponses = await Promise.allSettled(
      getHistoricalSeasons(fixtures).map((season) => (
        fetchHistorySeason(season, fetchImpl)
      )),
    );
    const historicalEvents = historyResponses.flatMap((result) => (
      result.status === "fulfilled" && Array.isArray(result.value)
        ? result.value
        : []
    ));
    const headToHeadByOpponent = normalizeHeadToHead(historicalEvents);
    const enrichedPayload = {
      ...payload,
      fixtures: payload.fixtures.map((fixture) => {
        const headToHead = headToHeadByOpponent.get(canonicalTeamName(fixture.opponent));
        return headToHead ? { ...fixture, headToHead } : fixture;
      }),
    };
    cachedSeason = { cachedAt: now, payload: enrichedPayload };
    return enrichedPayload;
  }
  catch (error) {
    if (cachedSeason && now - cachedSeason.cachedAt < staleTtlMs) {
      return {
        ...cachedSeason.payload,
        meta: {
          ...cachedSeason.payload.meta,
          stale: true,
        },
      };
    }

    throw error;
  }
};

export const clearArsenalSeasonCache = () => {
  cachedSeason = null;
};
