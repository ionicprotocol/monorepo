import { BytesLike, Contract, ethers } from "ethers";

import { RedemptionStrategyContract } from "../../enums";
import { MidasBase } from "../../MidasSdk";

// TODO remove
export type StrategiesAndDatas = {
  strategies: string[];
  datas: BytesLike[];
};

export type StrategyAndData = {
  strategyAddress: string;
  strategyData: BytesLike;
  outputToken: string;
};

export const getStrategiesAndDatas = async (fuse: MidasBase, inputToken: string, expectedOutputToken: string | null): Promise<StrategiesAndDatas> => {
  const strategies: string[] = [];
  const datas: BytesLike[] = [];

  let tokenToRedeem = inputToken;
  do {
    if (tokenToRedeem == expectedOutputToken || !(tokenToRedeem in fuse.redemptionStrategies)) {
      return {
        strategies,
        datas
      };
    }

    const { strategyAddress, strategyData, outputToken } = await getStrategyAndData(fuse, tokenToRedeem) as StrategyAndData;
    strategies.push(strategyAddress);
    datas.push(strategyData);
    tokenToRedeem = outputToken;
  } while (true);
}

const getStrategyAndData = async (fuse: MidasBase, token: string): Promise<StrategyAndData> => {
  const [redemptionStrategy, outputToken] = fuse.redemptionStrategies[token];
  const redemptionStrategyContract = new Contract(
    fuse.chainDeployment[redemptionStrategy].address,
    fuse.chainDeployment[redemptionStrategy].abi,
    fuse.provider
  );

  switch (redemptionStrategy) {
    case RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry:
      const curveLpOracleAddress = await redemptionStrategyContract.callStatic.oracle();
      const curveLpOracle = new Contract(
        curveLpOracleAddress,
        fuse.chainDeployment.CurveLpTokenPriceOracleNoRegistry.abi,
        fuse.provider
      );
      const tokens = await curveLpOracle.callStatic.underlyingTokens(token);
      return {
        strategyAddress: redemptionStrategyContract.address,
        strategyData: new ethers.utils.AbiCoder().encode(["uint256", "address"], [0, tokens[0]]),
        outputToken: tokens, // TODO should be correct?
      };

    case RedemptionStrategyContract.XBombLiquidator: {
      return { strategyAddress: redemptionStrategyContract.address, strategyData: [], outputToken: outputToken };
    }
    case RedemptionStrategyContract.UniswapLpTokenLiquidator: {
      return {
        strategyAddress: redemptionStrategyContract.address,
        strategyData: new ethers.utils.AbiCoder().encode(
          ["address", "address[]", "address[]"],
          [fuse.chainSpecificAddresses.UNISWAP_V2_ROUTER, [], []]
        ),
        outputToken: outputToken,
      };
    }
    case RedemptionStrategyContract.JarvisSynthereumLiquidator: {
      return { strategyAddress: redemptionStrategyContract.address, strategyData: [], outputToken: outputToken };
    }
    default: {
      return { strategyAddress: redemptionStrategyContract.address, strategyData: [], outputToken: outputToken };
    }
  }
};
