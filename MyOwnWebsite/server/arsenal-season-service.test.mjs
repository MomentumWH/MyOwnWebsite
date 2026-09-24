import { describe, expect, it } from "vitest";
import {
  normalizeArsenalDiscipline,
  normalizeChampionsLeagueEvents,
} from "./arsenal-season-service.mjs";

describe("arsenal season service", () => {
  it("aggregates official FPL card totals for Arsenal players only", () => {
    const elements = [
      { team: 1, yellow_cards: 4, red_cards: 0 },
      { team: 1, yellow_cards: 3, red_cards: 1 },
      { team: 2, yellow_cards: 9, red_cards: 2 },
    ];

    expect(normalizeArsenalDiscipline(elements, 1)).toEqual({
      redCards: 1,
      yellowCards: 7,
    });
  });

  it("normalizes Arsenal Champions League events from ESPN", () => {
    const payload = normalizeChampionsLeagueEvents([
      {
        id: "ucl-1",
        date: "2026-11-24T20:00:00Z",
        season: { year: 2026, slug: "league-phase" },
        competitions: [{
          status: { type: { state: "pre", completed: false } },
          venue: { fullName: "Emirates Stadium" },
          competitors: [
            { id: "359", homeAway: "home", name: "Arsenal", abbreviation: "ARS", score: "0" },
            { id: "1", homeAway: "away", name: "Borussia Dortmund", abbreviation: "BVB", score: "0" },
          ],
        }],
      },
      {
        id: "ucl-2",
        date: "2026-09-16T19:00:00Z",
        season: { year: 2026, slug: "league-phase" },
        competitions: [{
          status: { type: { state: "post", completed: true } },
          competitors: [
            { id: "2", homeAway: "home", name: "PSV Eindhoven", abbreviation: "PSV", score: "2" },
            { id: "359", homeAway: "away", name: "Arsenal", abbreviation: "ARS", score: "1" },
          ],
        }],
      },
      {
        id: "other",
        date: "2026-09-16T19:00:00Z",
        season: { year: 2026, slug: "league-phase" },
        competitions: [{
          status: { type: { state: "post", completed: true } },
          competitors: [
            { id: "3", homeAway: "home", name: "Barcelona", abbreviation: "BAR", score: "0" },
            { id: "4", homeAway: "away", name: "Inter", abbreviation: "INT", score: "0" },
          ],
        }],
      },
    ], "2026-09-20T00:00:00.000Z", "2026-2027");

    expect(payload.meta).toMatchObject({
      competition: "champions-league",
      season: "2026/27",
      source: "espn",
      matchCount: 2,
    });
    expect(payload.fixtures).toHaveLength(2);
    expect(payload.fixtures[0]).toMatchObject({
      id: "ucl-ucl-2",
      actual: { arsenalScore: 1, opponentScore: 2 },
      opponent: "PSV Eindhoven",
      venue: "away",
    });
  });
});
