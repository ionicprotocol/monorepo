import { ChainRedemptionStrategy } from "../types";
import { RedemptionStrategy, SupportedChains } from "../enums";

const chainRedemptionStrategies: ChainRedemptionStrategy = {
  [SupportedChains.bsc]: {
    // dai3EPS
    "0x0BC3a8239B0a63E945Ea1bd6722Ba747b9557e56": RedemptionStrategy.CurveLpTokenLiquidatorNoRegistry,
    // 3EPS
    "0xaF4dE8E872131AE328Ce21D909C74705d3Aaf452": RedemptionStrategy.CurveLpTokenLiquidatorNoRegistry,
    // ust3EPS
    "0x151F1611b2E304DEd36661f65506f9D7D172beba": RedemptionStrategy.CurveLpTokenLiquidatorNoRegistry,
    // xBOMB
    "0xAf16cB45B8149DA403AF41C63AbFEBFbcd16264b": RedemptionStrategy.XBombLiquidator,
    // jBRL
    "0x316622977073BBC3dF32E7d2A9B3c77596a0a603": RedemptionStrategy.jBRLLiquidator,
  },
  [SupportedChains.moonbase_alpha]: {},
  [SupportedChains.chapel]: {},
  [SupportedChains.aurora]: {},
  [SupportedChains.moonbeam]: {},
  [SupportedChains.evmos_testnet]: {},
  [SupportedChains.evmos]: {
    "0x -- Kinesis": RedemptionStrategy.CurveLpTokenLiquidatorNoRegistry,
  },
  [SupportedChains.ganache]: {},
};

export default chainRedemptionStrategies;
