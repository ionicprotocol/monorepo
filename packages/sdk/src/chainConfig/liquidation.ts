import { BigNumber, constants } from "ethers";

import { LiquidationStrategy, SupportedChains } from "../enums";
import { ChainLiquidationDefaults, SupportedAsset } from "../types";

import {
  assetSymbols,
  auroraAssets,
  bscAssets,
  chapelAssets,
  evmosAssets,
  evmosTestnetAssets,
  ganacheAssets,
  moonbaseAlphaAssets,
  moonbeamAssets,
  neonDevnetAssets,
} from "./assets";

const liquidationDefaults: ChainLiquidationDefaults = {
  [SupportedChains.bsc]: {
    SUPPORTED_OUTPUT_CURRENCIES: [
      constants.AddressZero,
      bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WBNB)!.underlying,
    ],
    SUPPORTED_INPUT_CURRENCIES: [
      constants.AddressZero,
      bscAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WBNB)!.underlying,
    ],
    LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
    MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
    LIQUIDATION_INTERVAL_SECONDS: 40,
  },
  [SupportedChains.chapel]: {
    SUPPORTED_OUTPUT_CURRENCIES: [
      constants.AddressZero,
      chapelAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WBNB)!.underlying,
    ],
    SUPPORTED_INPUT_CURRENCIES: [
      constants.AddressZero,
      chapelAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WBNB)!.underlying,
    ],
    LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
    MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
    LIQUIDATION_INTERVAL_SECONDS: 60,
  },
  [SupportedChains.evmos_testnet]: {
    SUPPORTED_OUTPUT_CURRENCIES: [
      constants.AddressZero,
      evmosTestnetAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WEVMOS)!.underlying,
    ],
    SUPPORTED_INPUT_CURRENCIES: [
      constants.AddressZero,
      evmosTestnetAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WEVMOS)!.underlying,
    ],
    LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
    MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
    LIQUIDATION_INTERVAL_SECONDS: 30,
  },
  [SupportedChains.aurora]: {
    SUPPORTED_OUTPUT_CURRENCIES: [
      constants.AddressZero,
      auroraAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WNEAR)!.underlying,
    ],
    SUPPORTED_INPUT_CURRENCIES: [
      constants.AddressZero,
      auroraAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WNEAR)!.underlying,
    ],
    LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
    MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
    LIQUIDATION_INTERVAL_SECONDS: 30,
  },
  [SupportedChains.evmos]: {
    SUPPORTED_OUTPUT_CURRENCIES: [
      constants.AddressZero,
      evmosAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WEVMOS)!.underlying,
    ],
    SUPPORTED_INPUT_CURRENCIES: [
      constants.AddressZero,
      evmosAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WEVMOS)!.underlying,
    ],
    LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
    MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
    LIQUIDATION_INTERVAL_SECONDS: 30,
  },
  // TODO: fix these
  [SupportedChains.moonbase_alpha]: {
    SUPPORTED_OUTPUT_CURRENCIES: [
      constants.AddressZero,
      moonbaseAlphaAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WDEV)!.underlying,
    ],
    SUPPORTED_INPUT_CURRENCIES: [
      constants.AddressZero,
      moonbaseAlphaAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WDEV)!.underlying,
    ],
    LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
    MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
    LIQUIDATION_INTERVAL_SECONDS: 15,
  },
  [SupportedChains.moonbeam]: {
    SUPPORTED_OUTPUT_CURRENCIES: [
      constants.AddressZero,
      moonbeamAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WGLMR)!.underlying,
    ],
    SUPPORTED_INPUT_CURRENCIES: [
      constants.AddressZero,
      moonbeamAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WGLMR)!.underlying,
    ],
    LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
    MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
    LIQUIDATION_INTERVAL_SECONDS: 30,
  },
  [SupportedChains.ganache]: {
    SUPPORTED_OUTPUT_CURRENCIES: [
      constants.AddressZero,
      ganacheAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WETH)!.underlying,
    ],
    SUPPORTED_INPUT_CURRENCIES: [
      constants.AddressZero,
      ganacheAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WETH)!.underlying,
    ],
    LIQUIDATION_STRATEGY: LiquidationStrategy.DEFAULT,
    MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
    LIQUIDATION_INTERVAL_SECONDS: 2,
  },
  [SupportedChains.neon_devnet]: {
    SUPPORTED_OUTPUT_CURRENCIES: [
      constants.AddressZero,
      neonDevnetAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WNEON)!.underlying,
    ],
    SUPPORTED_INPUT_CURRENCIES: [
      constants.AddressZero,
      neonDevnetAssets.find((a: SupportedAsset) => a.symbol === assetSymbols.WNEON)!.underlying,
    ],
    LIQUIDATION_STRATEGY: LiquidationStrategy.DEFAULT,
    MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
    LIQUIDATION_INTERVAL_SECONDS: 30,
  },
};

export default liquidationDefaults;
