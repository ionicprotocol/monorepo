import { DeviationPeriodConfig, DeviationThresholdConfig, PriceChangeKind } from "../../types";

export const defaultPriceDeviationPeriods: DeviationPeriodConfig = {
  [PriceChangeKind.SHORT]: 3 * 60 * 1000, // 3 minute,
  [PriceChangeKind.LONG]: 15 * 60 * 1000, // 15 minute,
};

export const lsdPriceChangeDefaults: { priceDeviationThresholds: DeviationThresholdConfig } = {
  priceDeviationThresholds: {
    [PriceChangeKind.SHORT]: 10,
    [PriceChangeKind.LONG]: 20,
  },
};

export const stablePriceChangeDefaults: { priceDeviationThresholds: DeviationThresholdConfig } = {
  priceDeviationThresholds: {
    [PriceChangeKind.SHORT]: 3,
    [PriceChangeKind.LONG]: 8,
  },
};

export const smallCapPriceChangeDefaults: { priceDeviationThresholds: DeviationThresholdConfig } = {
  priceDeviationThresholds: {
    [PriceChangeKind.SHORT]: 20,
    [PriceChangeKind.LONG]: 40,
  },
};

export const midCapPriceChangeDefaults: { priceDeviationThresholds: DeviationThresholdConfig } = {
  priceDeviationThresholds: {
    [PriceChangeKind.SHORT]: 15,
    [PriceChangeKind.LONG]: 30,
  },
};
