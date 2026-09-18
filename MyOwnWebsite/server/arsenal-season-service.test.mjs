import { describe, expect, it } from "vitest";
import { normalizeArsenalDiscipline } from "./arsenal-season-service.mjs";

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
});
