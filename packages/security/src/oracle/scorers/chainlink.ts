import { ChainLinkFeed, ScoreEnum, ScoreRange } from "../../types";

import { scoreEnum, scoreRanges } from "./generic";

const heartbeatRanges: Array<ScoreRange> = [
  { range: [0, 60], score: 1 },
  { range: [60, 60 * 15], score: 0.9 },
  { range: 60 * 15, score: 0.8 },
];

const validatorsRanges: Array<ScoreRange> = [
  { range: [0, 10], score: 1 },
  { range: [10, 20], score: 0.9 },
  { range: 20, score: 0.8 },
];

const feedStatusEnums: Array<ScoreEnum> = [
  { enum: "verified", score: 1 },
  { enum: "monitored", score: 0.9 },
  { enum: "deprecating", score: 0.1 },
];

export function scoreChainLinkFeed(feed: ChainLinkFeed): number {
  console.log(feed);
  const heartbeatScore = scoreRanges(feed.heartbeat, heartbeatRanges);
  const validatorScore = scoreRanges(feed.validators, validatorsRanges);
  const feedStatusScore = scoreEnum(feed.feedStatus, feedStatusEnums);
  return heartbeatScore * validatorScore * feedStatusScore;
}
