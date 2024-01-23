import { ScoreEnum, ScoreRange } from "../../types";

export const scoreRanges = (value: number, scoreRanges: Array<ScoreRange>) => {
  let score = 0;
  scoreRanges.map((range) => {
    if (Array.isArray(range.range)) {
      if (value >= range.range[0] && value <= range.range[1]) {
        score = range.score;
      }
    } else {
      if (value > range.range) {
        score = range.score;
      }
    }
  });
  return score;
};

export const scoreEnum = (value: string, enumValues: Array<ScoreEnum>) => {
  let score = 0;
  enumValues.map((enumValue) => {
    if (enumValue.enum === value) {
      score = enumValue.score;
    }
  });
  return score;
};
