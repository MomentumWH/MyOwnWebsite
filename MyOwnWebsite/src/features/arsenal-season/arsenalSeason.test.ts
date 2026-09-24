import { describe, expect, it } from "vitest";
import {
  addUpcomingPredictions,
  buildMatchPrediction,
  buildSeasonTrend,
  buildFixtureAnalysis,
  calculateSeasonSummary,
  formatKickoffTime,
  formatMatchDate,
  getMatchResult,
  type ArsenalFixture,
} from "./arsenalSeason";

const createFixture = (overrides: Partial<ArsenalFixture>): ArsenalFixture => ({
  difficulty: 3,
  id: "fixture-1",
  kickoffTime: "2026-08-21T19:00:00Z",
  matchweek: 1,
  opponent: "Coventry City",
  opponentCode: "COV",
  status: "upcoming",
  venue: "home",
  ...overrides,
});

describe("arsenal season analytics", () => {
  it("calculates official completed results without inventing a forecast", () => {
    const fixtures = [
      createFixture({
        actual: { arsenalScore: 2, bps: 78, fplBonus: 6, opponentScore: 1 },
        id: "completed-1",
        status: "completed",
      }),
      createFixture({ id: "upcoming-2", matchweek: 2 }),
    ];
    const summary = calculateSeasonSummary(fixtures, {
      redCards: 2,
      yellowCards: 10,
    });

    expect(getMatchResult(fixtures[0]!)).toBe("W");
    expect(summary).toMatchObject({
      played: 1,
      points: 3,
      wins: 1,
      goalsFor: 2,
      goalsAgainst: 1,
      goalDifference: 1,
      forecastPoints: null,
      yellowCards: 10,
      redCards: 2,
      behaviorScore: -16,
    });
  });

  it("keeps actual points and optional projected points separate", () => {
    const fixtures = [
      createFixture({
        actual: { arsenalScore: 1, bps: 62, fplBonus: 3, opponentScore: 1 },
        id: "completed-1",
        status: "completed",
      }),
      createFixture({
        id: "upcoming-2",
        matchweek: 2,
        prediction: {
          arsenalScore: 2,
          confidence: 70,
          drawProbability: 25,
          factors: [],
          lossProbability: 15,
          opponentScore: 1,
          summary: "",
          winProbability: 60,
        },
      }),
    ];
    const trend = buildSeasonTrend(fixtures);
    const summary = calculateSeasonSummary(fixtures);
    const championsLeagueSummary = calculateSeasonSummary(
      fixtures,
      { redCards: 0, yellowCards: 0 },
      8,
    );

    expect(trend[0]).toMatchObject({ actual: 1 });
    expect(trend[0]?.projected).toBe(1.8);
    expect(trend[1]?.actual).toBeNull();
    expect(trend[1]?.projected).toBe(3.9);
    expect(summary.forecastPoints).not.toBeNull();
    expect(championsLeagueSummary.forecastPoints).toBe(12);
  });

  it("keeps historical forecast points independent from actual results", () => {
    const fixtures = [
      createFixture({
        actual: { arsenalScore: 2, bps: 62, fplBonus: 3, opponentScore: 0 },
        id: "completed-1",
        status: "completed",
      }),
      createFixture({
        id: "upcoming-2",
        matchweek: 2,
        prediction: {
          arsenalScore: 2,
          confidence: 70,
          drawProbability: 25,
          factors: [],
          lossProbability: 15,
          opponentScore: 1,
          summary: "",
          winProbability: 60,
        },
      }),
      createFixture({
        id: "upcoming-3",
        matchweek: 3,
        prediction: {
          arsenalScore: 1,
          confidence: 60,
          drawProbability: 25,
          factors: [],
          lossProbability: 45,
          opponentScore: 1,
          summary: "",
          winProbability: 30,
        },
      }),
    ];

    const trend = buildSeasonTrend(fixtures);

    expect(trend[0]?.actual).toBe(3);
    expect(trend[0]?.projected).toBe(1.8);
    expect(trend[1]?.projected).toBe(3.9);
    expect(trend[2]?.projected).toBe(5);
  });

  it("formats UTC kickoffs in the dashboard timezone", () => {
    const kickoff = "2026-08-21T19:00:00Z";

    expect(formatMatchDate(kickoff)).toBe("08.22");
    expect(formatKickoffTime(kickoff)).toBe("08.22 03:00");
  });

  it("builds a substantial preview from fixture difficulty and head-to-head facts", () => {
    const fixture = createFixture({
      difficulty: 4,
      opponent: "Chelsea",
      opponentCode: "CHE",
      headToHead: {
        meetings: 4,
        arsenalWins: 3,
        draws: 1,
        opponentWins: 0,
        goalsFor: 9,
        goalsAgainst: 3,
        lastMeeting: {
          date: "2026-03-01",
          venue: "home",
          arsenalScore: 2,
          opponentScore: 1,
        },
        source: "football-data",
      },
    });

    const analysis = buildFixtureAnalysis(fixture);

    expect(analysis.summary.length).toBeGreaterThan(100);
    expect(analysis.summary).toContain("3 胜 1 平 0 负");
    expect(analysis.summary).toContain("2:1");
    expect(analysis.evidenceLabel).toContain("Football-Data");
  });

  it("states the limitation when no historical meeting sample is available", () => {
    const analysis = buildFixtureAnalysis(createFixture({ opponent: "Coventry City" }));

    expect(analysis.summary.length).toBeGreaterThan(100);
    expect(analysis.summary).toContain("没有找到双方有效交锋样本");
    expect(analysis.evidenceLabel).toBe("公开历史样本暂缺");
  });

  it("predicts a valid score and probabilities from fixture facts", () => {
    const prediction = buildMatchPrediction(createFixture({
      difficulty: 2,
      venue: "home",
    }));

    expect(prediction).toMatchObject({
      arsenalScore: 2,
      opponentScore: 1,
      winProbability: 67,
    });
    expect(
      prediction.winProbability
      + prediction.drawProbability
      + prediction.lossProbability,
    ).toBe(100);
    expect(prediction.summary).toContain("参考比分");
  });

  it("adds predictions only to upcoming fixtures", () => {
    const upcoming = createFixture({ id: "upcoming" });
    const completed = createFixture({
      actual: { arsenalScore: 2, bps: 70, fplBonus: 5, opponentScore: 0 },
      id: "completed",
      status: "completed",
    });
    const live = createFixture({ id: "live", status: "live" });
    const result = addUpcomingPredictions([upcoming, completed, live]);

    expect(result[0]?.prediction).toBeDefined();
    expect(result[1]?.prediction).toBeUndefined();
    expect(result[2]?.prediction).toBeUndefined();
  });
});
