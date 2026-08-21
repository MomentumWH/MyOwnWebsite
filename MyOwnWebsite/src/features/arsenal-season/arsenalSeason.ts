export type FixtureFilter = "all" | "completed" | "upcoming";
export type FixtureStatus = "completed" | "live" | "upcoming";
export type FixtureVenue = "home" | "away";
export type MatchResult = "W" | "D" | "L";

export interface MatchPrediction {
  arsenalScore: number;
  confidence: number;
  drawProbability: number;
  factors: readonly string[];
  lossProbability: number;
  opponentScore: number;
  summary: string;
  winProbability: number;
}

export interface MatchActual {
  arsenalScore: number;
  bps: number | null;
  fplBonus: number | null;
  opponentScore: number;
}

export interface PersonalScorePrediction {
  arsenalScore: number;
  opponentScore: number;
  updatedAt: string;
}

export type PersonalScorePredictionDraft = Pick<
  PersonalScorePrediction,
  "arsenalScore" | "opponentScore"
>;

export interface HeadToHeadMeeting {
  arsenalScore: number;
  date: string;
  opponentScore: number;
  venue: FixtureVenue;
}

export interface HeadToHeadSummary {
  arsenalWins: number;
  draws: number;
  goalsAgainst: number;
  goalsFor: number;
  lastMeeting: HeadToHeadMeeting | null;
  meetings: number;
  opponentWins: number;
  source: "football-data";
}

export interface FixtureAnalysis {
  evidenceLabel: string;
  phaseLabel: string;
  summary: string;
  tendency: string;
}

export interface ArsenalFixture {
  actual?: MatchActual;
  difficulty: number | null;
  headToHead?: HeadToHeadSummary;
  id: string;
  kickoffTime: string | null;
  matchweek: number | null;
  opponent: string;
  opponentCode: string;
  personalPrediction?: PersonalScorePrediction;
  prediction?: MatchPrediction;
  status: FixtureStatus;
  venue: FixtureVenue;
}

export interface ArsenalSeasonMeta {
  fetchedAt: string;
  season: string;
  source: "fpl";
  stale: boolean;
}

export interface ArsenalSeasonPayload {
  fixtures: readonly ArsenalFixture[];
  meta: ArsenalSeasonMeta;
}

export interface SeasonSummary {
  draws: number;
  forecastPoints: number | null;
  goalDifference: number;
  goalsAgainst: number;
  goalsFor: number;
  losses: number;
  played: number;
  points: number;
  pointsPerGame: number;
  wins: number;
}

export interface SeasonTrendPoint {
  actual: number | null;
  label: string;
  opponent: string;
  projected: number | null;
}

const matchDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Shanghai",
});

const kickoffFormatter = new Intl.DateTimeFormat("zh-CN", {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Shanghai",
});

const updatedAtFormatter = new Intl.DateTimeFormat("zh-CN", {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Shanghai",
});

const toDateParts = (value: string | null, formatter: Intl.DateTimeFormat) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
};

export const formatMatchDate = (value: string | null) => {
  const parts = toDateParts(value, matchDateFormatter);
  return parts ? `${parts.month}.${parts.day}` : "待定";
};

export const formatKickoffTime = (value: string | null) => {
  const parts = toDateParts(value, kickoffFormatter);
  return parts
    ? `${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`
    : "开球时间待定";
};

export const formatUpdatedAt = (value: string | null) => {
  const parts = toDateParts(value, updatedAtFormatter);
  return parts
    ? `${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`
    : "尚未同步";
};

export const getMatchResult = (fixture: ArsenalFixture): MatchResult | null => {
  if (fixture.status !== "completed" || !fixture.actual) {
    return null;
  }

  if (fixture.actual.arsenalScore === fixture.actual.opponentScore) {
    return "D";
  }

  return fixture.actual.arsenalScore > fixture.actual.opponentScore ? "W" : "L";
};

export const getMatchPoints = (fixture: ArsenalFixture) => {
  const result = getMatchResult(fixture);

  if (result === "W") {
    return 3;
  }

  if (result === "D") {
    return 1;
  }

  return 0;
};

export const getExpectedPoints = (fixture: ArsenalFixture) => (
  fixture.prediction
    ? (fixture.prediction.winProbability * 3 + fixture.prediction.drawProbability) / 100
    : null
);

const predictionBaseline = {
  1: { arsenalGoals: 2.7, draw: 16, opponentGoals: 0.6, win: 76 },
  2: { arsenalGoals: 2.2, draw: 22, opponentGoals: 0.8, win: 64 },
  3: { arsenalGoals: 1.7, draw: 28, opponentGoals: 1.2, win: 48 },
  4: { arsenalGoals: 1.3, draw: 27, opponentGoals: 1.6, win: 35 },
  5: { arsenalGoals: 1, draw: 23, opponentGoals: 2, win: 22 },
} as const;

const clamp = (value: number, minimum: number, maximum: number) => (
  Math.min(maximum, Math.max(minimum, value))
);

export const buildMatchPrediction = (fixture: ArsenalFixture): MatchPrediction => {
  const difficulty = clamp(Math.round(fixture.difficulty ?? 3), 1, 5) as keyof typeof predictionBaseline;
  const baseline = predictionBaseline[difficulty];
  const history = fixture.headToHead;
  const historyForm = history && history.meetings > 0
    ? (history.arsenalWins - history.opponentWins) / history.meetings
    : 0;
  const historyGoalEdge = history && history.meetings > 0
    ? clamp((history.goalsFor - history.goalsAgainst) / history.meetings, -2, 2)
    : 0;
  const venueGoalAdjustment = fixture.venue === "home" ? 0.18 : -0.12;
  const arsenalExpectedGoals = baseline.arsenalGoals
    + venueGoalAdjustment
    + historyGoalEdge * 0.14;
  const opponentExpectedGoals = baseline.opponentGoals
    - venueGoalAdjustment * 0.35
    - historyGoalEdge * 0.08;
  const winProbability = clamp(Math.round(
    baseline.win + (fixture.venue === "home" ? 3 : -2) + historyForm * 8,
  ), 12, 82);
  const drawProbability = clamp(Math.round(
    baseline.draw - Math.abs(historyForm) * 2,
  ), 15, 32);
  const lossProbability = 100 - winProbability - drawProbability;
  const arsenalScore = clamp(Math.round(arsenalExpectedGoals), 0, 4);
  const opponentScore = clamp(Math.round(opponentExpectedGoals), 0, 4);
  const factors = [
    `FPL 难度 ${difficulty}/5`,
    fixture.venue === "home" ? "阿森纳主场优势" : "阿森纳客场作战",
    history
      ? `近三季交锋 ${history.arsenalWins}胜${history.draws}平${history.opponentWins}负`
      : "公开交锋样本有限",
  ];
  const confidence = clamp(
    56 + Math.min(history?.meetings ?? 0, 6) * 3 - (fixture.difficulty === null ? 8 : 0),
    48,
    74,
  );

  return {
    arsenalScore,
    confidence,
    drawProbability,
    factors,
    lossProbability,
    opponentScore,
    summary: `模型结合 FPL 赛程难度、${fixture.venue === "home" ? "主场" : "客场"}因素${history ? `及近三季 ${history.meetings} 次交锋数据` : "及当前可用公开数据"}，给出 ${arsenalScore}:${opponentScore} 的参考比分。该结果不包含临场首发与最新伤停变化。`,
    winProbability,
  };
};

export const addUpcomingPredictions = (
  fixtures: readonly ArsenalFixture[],
): readonly ArsenalFixture[] => fixtures.map((fixture) => (
  fixture.status === "upcoming"
    ? { ...fixture, prediction: buildMatchPrediction(fixture) }
    : fixture
));

const getAnalysisTendency = (fixture: ArsenalFixture) => {
  const difficulty = fixture.difficulty ?? 3;

  if (difficulty <= 2) {
    return fixture.venue === "home" ? "阿森纳明显占优" : "阿森纳更被看好";
  }

  if (difficulty === 3) {
    return fixture.venue === "home" ? "阿森纳略占主动" : "胜负取决于临场效率";
  }

  if (difficulty === 4) {
    return fixture.venue === "home" ? "强强对话，阿森纳有主场支点" : "客场硬仗，比赛趋于均衡";
  }

  return fixture.venue === "home" ? "高强度考验，需控制转换风险" : "赛程中的重点攻坚战";
};

const getHistorySentence = (fixture: ArsenalFixture) => {
  const history = fixture.headToHead;

  if (!history || history.meetings === 0) {
    return `近三季公开英超赛果中没有找到双方有效交锋样本，因此历史对赛不会被强行纳入结论；对${fixture.opponent}的判断主要来自本场赛程难度与主客场环境。`;
  }

  const lastMeeting = history.lastMeeting;
  const lastMeetingSentence = lastMeeting
    ? `最近一次交手阿森纳${lastMeeting.venue === "home" ? "主场" : "客场"}以 ${lastMeeting.arsenalScore}:${lastMeeting.opponentScore} ${lastMeeting.arsenalScore > lastMeeting.opponentScore ? "取胜" : lastMeeting.arsenalScore === lastMeeting.opponentScore ? "战平" : "告负"}。`
    : "";

  return `近三季英超 ${history.meetings} 次交锋中，阿森纳取得 ${history.arsenalWins} 胜 ${history.draws} 平 ${history.opponentWins} 负，合计进 ${history.goalsFor} 球、失 ${history.goalsAgainst} 球。${lastMeetingSentence}`;
};

export const buildFixtureAnalysis = (fixture: ArsenalFixture): FixtureAnalysis => {
  const venueLabel = fixture.venue === "home" ? "主场" : "客场";
  const difficultyLabel = fixture.difficulty === null
    ? "官方难度尚未确定"
    : `FPL 难度为 ${fixture.difficulty}/5`;
  const tendency = getAnalysisTendency(fixture);
  const phaseLabel = fixture.status === "completed"
    ? "赛前视角回看"
    : fixture.status === "live"
      ? "即时比赛判断"
      : "模型赛前分析";
  const tacticalFocus = fixture.venue === "home"
    ? "预计阿森纳会主动提高控球位置，通过边路宽度和禁区前沿的连续压迫争取先手，同时要防范对手由守转攻后的第一脚纵向传递。"
    : "预计阿森纳需要先稳定客场节奏，减少中场丢球后的开放式攻防，再依靠前场压迫和定位球寻找领先机会。"

  return {
    evidenceLabel: fixture.headToHead
      ? `近三季英超交锋 · Football-Data`
      : "公开历史样本暂缺",
    phaseLabel,
    tendency,
    summary: `阿森纳本轮${venueLabel}对阵${fixture.opponent}，${difficultyLabel}，基础判断为“${tendency}”。${getHistorySentence(fixture)}${tacticalFocus}综合这些有限信息，本场预测倾向仅作为赛前阅读参考，首发阵容、伤停和临场状态仍可能显著改变比赛走向。`,
  };
};

export const calculateSeasonSummary = (
  fixtures: readonly ArsenalFixture[],
): SeasonSummary => {
  const completed = fixtures.filter((fixture) => fixture.status === "completed" && fixture.actual);
  const results = completed.map(getMatchResult);
  const points = completed.reduce((total, fixture) => total + getMatchPoints(fixture), 0);
  const goalsFor = completed.reduce((total, fixture) => total + (fixture.actual?.arsenalScore ?? 0), 0);
  const goalsAgainst = completed.reduce((total, fixture) => total + (fixture.actual?.opponentScore ?? 0), 0);
  const canForecast = fixtures.length > 0 && fixtures.every((fixture) => (
    fixture.status === "completed" || fixture.prediction
  ));
  const expectedPoints = canForecast
    ? fixtures.reduce((total, fixture) => (
        total + (fixture.status === "completed"
          ? getMatchPoints(fixture)
          : (getExpectedPoints(fixture) ?? 0))
      ), 0)
    : null;

  return {
    played: completed.length,
    points,
    wins: results.filter((result) => result === "W").length,
    draws: results.filter((result) => result === "D").length,
    losses: results.filter((result) => result === "L").length,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    pointsPerGame: completed.length > 0 ? points / completed.length : 0,
    forecastPoints: expectedPoints === null
      ? null
      : Math.round((expectedPoints / fixtures.length) * 38),
  };
};

export const buildSeasonTrend = (
  fixtures: readonly ArsenalFixture[],
): readonly SeasonTrendPoint[] => {
  let actualPoints = 0;
  let projectedPoints: number | null = fixtures.some((fixture) => fixture.prediction) ? 0 : null;

  return fixtures.map((fixture) => {
    if (fixture.status === "completed") {
      const matchPoints = getMatchPoints(fixture);
      actualPoints += matchPoints;
      if (projectedPoints !== null) {
        projectedPoints += matchPoints;
      }
    }
    else if (projectedPoints !== null) {
      const expectedPoints = getExpectedPoints(fixture);
      projectedPoints = expectedPoints === null ? null : projectedPoints + expectedPoints;
    }

    return {
      label: fixture.matchweek === null ? "MW--" : `MW${fixture.matchweek}`,
      opponent: fixture.opponentCode,
      actual: fixture.status === "completed" ? actualPoints : null,
      projected: projectedPoints === null ? null : Number(projectedPoints.toFixed(1)),
    };
  });
};
