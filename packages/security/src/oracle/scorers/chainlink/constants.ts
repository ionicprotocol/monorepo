import { ScoreEnum, ScoreRange } from "../../../types";

export const heartbeatRanges: Array<ScoreRange> = [
  { range: [0, 60], score: 1 },
  { range: [60, 60 * 15], score: 0.9 },
  { range: 60 * 15, score: 0.8 },
];

export const validatorsRanges: Array<ScoreRange> = [
  { range: [0, 10], score: 1 },
  { range: [10, 20], score: 0.9 },
  { range: 20, score: 0.8 },
];

export const feedStatusEnums: Array<ScoreEnum> = [
  { enum: "verified", score: 1 },
  { enum: "monitored", score: 0.9 },
  { enum: "deprecating", score: 0.1 },
];
