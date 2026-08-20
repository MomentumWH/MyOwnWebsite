import { describe, expect, it } from "vitest";
import { fetchArsenalSeason, isArsenalSeasonPayload } from "./arsenalSeasonApi";

const payload = {
  meta: {
    fetchedAt: "2026-08-18T03:00:00.000Z",
    season: "2026/27",
    source: "fpl",
    stale: false,
  },
  fixtures: [
    {
      difficulty: 2,
      id: "1",
      kickoffTime: "2026-08-21T19:00:00Z",
      matchweek: 1,
      opponent: "Coventry City",
      opponentCode: "COV",
      headToHead: {
        meetings: 2,
        arsenalWins: 1,
        draws: 1,
        opponentWins: 0,
        goalsFor: 3,
        goalsAgainst: 1,
        lastMeeting: {
          date: "2024-01-01",
          venue: "home",
          arsenalScore: 2,
          opponentScore: 0,
        },
        source: "football-data",
      },
      status: "upcoming",
      venue: "home",
    },
  ],
} as const;

describe("arsenal season API", () => {
  it("accepts the normalized server payload", () => {
    expect(isArsenalSeasonPayload(payload)).toBe(true);
    expect(isArsenalSeasonPayload({ ...payload, fixtures: [{ id: 1 }] })).toBe(false);
  });

  it("loads data through the same-origin football endpoint", async () => {
    let requestedUrl = "";
    const fetchImpl: typeof fetch = async (input) => {
      requestedUrl = String(input);
      return new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    };

    const result = await fetchArsenalSeason({ fetchImpl });

    expect(requestedUrl).toBe("/api/football/arsenal-season");
    expect(result.fixtures).toHaveLength(1);
    expect(result.fixtures[0]?.opponent).toBe("Coventry City");
  });
});
