import { ChainLinkFeedStatus } from "./oracle/scorers/chainlink/types";

export type ScoreRange = {
  range: [number, number] | number;
  score: number;
};

export type ScoreEnum = {
  enum: ChainLinkFeedStatus;
  score: number;
};
