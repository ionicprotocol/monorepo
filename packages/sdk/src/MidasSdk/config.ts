import { SupportedChains } from "@midas-capital/types";

import { chainSpecificParams } from "../chainConfig";

export const COMPTROLLER_ERROR_CODES: Array<string> = [
  "NO_ERROR",
  "UNAUTHORIZED",
  "COMPTROLLER_MISMATCH",
  "INSUFFICIENT_SHORTFALL",
  "INSUFFICIENT_LIQUIDITY",
  "INVALID_CLOSE_FACTOR",
  "INVALID_COLLATERAL_FACTOR",
  "INVALID_LIQUIDATION_INCENTIVE",
  "MARKET_NOT_ENTERED", // no longer possible
  "MARKET_NOT_LISTED",
  "MARKET_ALREADY_LISTED",
  "MATH_ERROR",
  "NONZERO_BORROW_BALANCE",
  "PRICE_ERROR",
  "REJECTION",
  "SNAPSHOT_ERROR",
  "TOO_MANY_ASSETS",
  "TOO_MUCH_REPAY",
  "SUPPLIER_NOT_WHITELISTED",
  "BORROW_BELOW_MIN",
  "SUPPLY_ABOVE_MAX",
  "NONZERO_TOTAL_SUPPLY",
];

export const CTOKEN_ERROR_CODES: Array<string> = [
  "NO_ERROR",
  "UNAUTHORIZED",
  "BAD_INPUT",
  "COMPTROLLER_REJECTION",
  "COMPTROLLER_CALCULATION_ERROR",
  "INTEREST_RATE_MODEL_ERROR",
  "INVALID_ACCOUNT_PAIR",
  "INVALID_CLOSE_AMOUNT_REQUESTED",
  "INVALID_COLLATERAL_FACTOR",
  "MATH_ERROR",
  "MARKET_NOT_FRESH",
  "MARKET_NOT_LISTED",
  "TOKEN_INSUFFICIENT_ALLOWANCE",
  "TOKEN_INSUFFICIENT_BALANCE",
  "TOKEN_INSUFFICIENT_CASH",
  "TOKEN_TRANSFER_IN_FAILED",
  "TOKEN_TRANSFER_OUT_FAILED",
  "UTILIZATION_ABOVE_MAX",
];

export const JUMP_RATE_MODEL_CONF = (chainId: SupportedChains) => {
  return {
    interestRateModel: "JumpRateModel",
    interestRateModelParams: {
      blocksPerYear: chainSpecificParams[chainId].blocksPerYear,
      baseRatePerYear: "20000000000000000",
      multiplierPerYear: "200000000000000000",
      jumpMultiplierPerYear: "2000000000000000000",
      kink: "900000000000000000",
    },
  };
};

export const WHITE_PAPER_RATE_MODEL_CONF = (chainId: SupportedChains) => {
  return {
    interestRateModel: "WhitePaperInterestRateModel",
    interestRateModelParams: {
      blocksPerYear: chainSpecificParams[chainId].blocksPerYear,
      baseRatePerYear: "20000000000000000",
      multiplierPerYear: "200000000000000000",
    },
  };
};

export const ANKR_BNB_INTEREST_RATE_MODEL_CONF = (chainId: SupportedChains) => {
  return {
    interestRateModel: "AnkrBNBInterestRateModel",
    interestRateModelParams: {
      blocksPerYear: chainSpecificParams[chainId].blocksPerYear,
      baseRatePerYear: "25600000000000000",
      multiplierPerYear: "32000000000000000",
      kink: "800000000000000000",
      day: 3, // set day period
      abnbr: "0xBb1Aa6e59E5163D8722a122cd66EBA614b59df0d",
    },
  };
};
