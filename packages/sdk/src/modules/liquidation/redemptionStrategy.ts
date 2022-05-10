import { BytesLike, Contract, ethers } from "ethers";
import { FuseBase } from "../../Fuse";
import { SupportedChains } from "../../network";

type TokenToStrategy = {
  [chainId: number]: {
    [token: string]: string;
  };
};

export type StrategyAndData = {
  strategyAddress: string[];
  strategyData: BytesLike[];
};

enum RedemptionStrategy {
  CurveLpTokenLiquidatorNoRegistry = "CurveLpTokenLiquidatorNoRegistry",
  XBombLiquidator = "XBombLiquidator",
  jBRLLiquidator = "jBRLLiquidator",
}

const tokenToStrategyMapping: TokenToStrategy = {
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
  [SupportedChains.moonbeam]: {},
  [SupportedChains.evmos_testnet]: {},
  [SupportedChains.evmos]: {
    "0x -- Kinesis": RedemptionStrategy.CurveLpTokenLiquidatorNoRegistry,
  },
  [SupportedChains.ganache]: {},
};

export const requiresCustomStrategy = (chainId: number, token: string) => {
  return token in tokenToStrategyMapping[chainId];
};

export const getStrategyAndData = async (fuse: FuseBase, token: string): Promise<StrategyAndData> => {
  const { chainId } = await fuse.provider.getNetwork();
  if (!requiresCustomStrategy(chainId, token)) return { strategyData: [], strategyAddress: [] };

  const redemptionStrategy = tokenToStrategyMapping[chainId][token] as RedemptionStrategy;
  const redemptionStrategyContract = new Contract(
    fuse.chainDeployment[redemptionStrategy].address,
    fuse.chainDeployment[redemptionStrategy].abi,
    fuse.provider
  );
  let strategyAndData = { strategyAddress: [redemptionStrategyContract.address] };

  switch (redemptionStrategy) {
    case RedemptionStrategy.CurveLpTokenLiquidatorNoRegistry:
      const curveLpOracleAddress = await redemptionStrategyContract.callStatic.oracle();
      const curveLpOracle = new Contract(
        curveLpOracleAddress,
        fuse.chainDeployment.CurveLpTokenPriceOracleNoRegistry.abi,
        fuse.provider
      );
      const tokens = await curveLpOracle.callStatic.underlyingTokens(token);
      return {
        ...strategyAndData,
        strategyData: [new ethers.utils.AbiCoder().encode(["uint256", "address"], [0, tokens[0]])],
      };

    case RedemptionStrategy.XBombLiquidator: {
      return { ...strategyAndData, strategyData: [] };
    }
    case RedemptionStrategy.jBRLLiquidator: {
      return { ...strategyAndData, strategyData: [] };
    }
    default: {
      return { ...strategyAndData, strategyData: [] };
    }
  }
};
