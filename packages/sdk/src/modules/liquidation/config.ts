import { BigNumber, constants } from "ethers";
import { FuseBase } from "../../Fuse";
import { SupportedChains } from "../../network";

export enum LiquidationStrategy {
  DEFAULT = "DEFAULT",
  UNISWAP = "UNISWAP",
}

export enum LiquidationKind {
  DEFAULT_NATIVE_BORROW = "DEFAULT_NATIVE_BORROW",
  DEFAULT_TOKEN_BORROW = "DEFAULT_TOKEN_BORROW",
  UNISWAP_NATIVE_BORROW = "UNISWAP_NATIVE_BORROW",
  UNISWAP_TOKEN_BORROW = "UNISWAP_TOKEN_BORROW",
}

export const defaults = (fuse: FuseBase) => {
  return {
    [SupportedChains.bsc]: {
      SUPPORTED_OUTPUT_CURRENCIES: [
        "0x0000000000000000000000000000000000000000",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
        "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
        "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
      ],
      SUPPORTED_INPUT_CURRENCIES: [
        "0x0000000000000000000000000000000000000000",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      ],
      LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
      MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
    },
    [SupportedChains.chapel]: {
      SUPPORTED_OUTPUT_CURRENCIES: [
        "0x0000000000000000000000000000000000000000",
        "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
        "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee",
        "0x8babbb98678facc7342735486c851abd7a0d17ca",
        "0x6ce8dA28E2f864420840cF74474eFf5fD80E65B8",
      ],
      SUPPORTED_INPUT_CURRENCIES: [
        "0x0000000000000000000000000000000000000000",
        "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
      ],
      LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
      MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
    },
    [SupportedChains.evmos_testnet]: {
      SUPPORTED_OUTPUT_CURRENCIES: [
        "0x0000000000000000000000000000000000000000",
        "0x0b67B0A0Ed150B9F06e0ee90D2f1d3c4b3016D5D",
      ],
      SUPPORTED_INPUT_CURRENCIES: [
        "0x0000000000000000000000000000000000000000",
        "0x0b67B0A0Ed150B9F06e0ee90D2f1d3c4b3016D5D",
      ],
      LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
      MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
    },
    // TODO: fix these
    [SupportedChains.moonbase_alpha]: {
      SUPPORTED_OUTPUT_CURRENCIES: ["0x0000000000000000000000000000000000000000"],
      SUPPORTED_INPUT_CURRENCIES: ["0x0000000000000000000000000000000000000000"],
      LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
      MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
    },
    [SupportedChains.moonbeam]: {
      SUPPORTED_OUTPUT_CURRENCIES: [
        "0x0000000000000000000000000000000000000000",
        "0xAcc15dC74880C9944775448304B263D191c6077F", // WGLMR
      ],
      SUPPORTED_INPUT_CURRENCIES: [
        "0x0000000000000000000000000000000000000000",
        "0xAcc15dC74880C9944775448304B263D191c6077F", // WGLMR
      ],
      LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
      MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
    },
    [SupportedChains.ganache]: {
      SUPPORTED_OUTPUT_CURRENCIES: [
        "0x0000000000000000000000000000000000000000",
        fuse.chainDeployment.TOUCHToken ? fuse.chainDeployment.TOUCHToken.address : null,
        fuse.chainDeployment.TRIBEToken ? fuse.chainDeployment.TRIBEToken.address : null,
      ],
      SUPPORTED_INPUT_CURRENCIES: [
        "0x0000000000000000000000000000000000000000",
        fuse.chainDeployment.TOUCHToken ? fuse.chainDeployment.TOUCHToken.address : null,
        fuse.chainDeployment.TRIBEToken ? fuse.chainDeployment.TRIBEToken.address : null,
      ],
      LIQUIDATION_STRATEGY: LiquidationStrategy.DEFAULT,
      MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
    },
  };
};

export type ChainLiquidationConfig = {
  SUPPORTED_OUTPUT_CURRENCIES: Array<string>;
  SUPPORTED_INPUT_CURRENCIES: Array<string>;
  LIQUIDATION_STRATEGY: LiquidationStrategy;
  MINIMUM_PROFIT_NATIVE: BigNumber;
};

export const getChainLiquidationConfig = (fuse: FuseBase): ChainLiquidationConfig => {
  return {
    SUPPORTED_OUTPUT_CURRENCIES: process.env.SUPPORTED_OUTPUT_CURRENCIES
      ? process.env.SUPPORTED_OUTPUT_CURRENCIES.split(",")
      : defaults(fuse)[fuse.chainId].SUPPORTED_OUTPUT_CURRENCIES,
    SUPPORTED_INPUT_CURRENCIES: process.env.SUPPORTED_INPUT_CURRENCIES
      ? process.env.SUPPORTED_INPUT_CURRENCIES.split(",")
      : defaults(fuse)[fuse.chainId].SUPPORTED_INPUT_CURRENCIES,
    LIQUIDATION_STRATEGY: process.env.LIQUIDATION_STRATEGY
      ? process.env.LIQUIDATION_STRATEGY
      : defaults(fuse)[fuse.chainId].LIQUIDATION_STRATEGY,
    MINIMUM_PROFIT_NATIVE: process.env.MINIMUM_PROFIT_NATIVE
      ? BigNumber.from(process.env.MINIMUM_PROFIT_NATIVE)
      : defaults(fuse)[fuse.chainId].MINIMUM_PROFIT_NATIVE,
  };
};

export const getLiquidationKind = (
  liquidationStrategy: LiquidationStrategy,
  underlyingToken: string
): LiquidationKind => {
  if (liquidationStrategy === LiquidationStrategy.UNISWAP) {
    if (underlyingToken == constants.AddressZero) {
      return LiquidationKind.UNISWAP_NATIVE_BORROW;
    } else {
      return LiquidationKind.UNISWAP_TOKEN_BORROW;
    }
  } else if (liquidationStrategy === LiquidationStrategy.DEFAULT) {
    if (underlyingToken == constants.AddressZero) {
      return LiquidationKind.DEFAULT_NATIVE_BORROW;
    } else {
      return LiquidationKind.DEFAULT_TOKEN_BORROW;
    }
  } else {
    throw `Invalid liquidation strategy: ${liquidationStrategy}`;
  }
};
