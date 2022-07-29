import { BytesLike, Contract, ethers } from "ethers";

import { RedemptionStrategy } from "../../enums";
import { MidasBase } from "../../MidasSdk";

export type StrategyAndData = {
  strategyAddress: string[];
  strategyData: BytesLike[];
};

export const getStrategyAndData = async (fuse: MidasBase, token: string): Promise<StrategyAndData> => {
  if (!(token in fuse.redemptionStrategies)) return { strategyData: [], strategyAddress: [] };

  const redemptionStrategy = fuse.redemptionStrategies[token] as RedemptionStrategy;
  const redemptionStrategyContract = new Contract(
    fuse.chainDeployment[redemptionStrategy].address,
    fuse.chainDeployment[redemptionStrategy].abi,
    fuse.provider
  );
  const strategyAndData = {
    strategyAddress: [redemptionStrategyContract.address],
  };

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
    case RedemptionStrategy.UniswapLpTokenLiquidator: {
      return {
        ...strategyAndData,
        strategyData: [
          new ethers.utils.AbiCoder().encode(
            ["address", "address[]", "address[]"],
            [fuse.chainSpecificAddresses.UNISWAP_V2_ROUTER, [], []]
          ),
        ],
      };
    }
    case RedemptionStrategy.JarvisSynthereumLiquidator: {
      return { ...strategyAndData, strategyData: [] };
    }
    default: {
      return { ...strategyAndData, strategyData: [] };
    }
  }
};
