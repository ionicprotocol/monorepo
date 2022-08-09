import { RedemptionStrategyContract } from "@midas-capital/types";
import { BytesLike, Contract, ethers } from "ethers";

import { IUniswapV2Pair__factory } from "../../../lib/contracts/typechain/factories/IUniswapV2Pair__factory";
import { MidasBase } from "../../MidasSdk";

export type StrategiesAndDatas = {
  strategies: string[];
  datas: BytesLike[];
};

export type StrategyAndData = {
  strategyAddress: string;
  strategyData: BytesLike;
  outputToken: string;
};

export const getRedemptionStrategiesAndDatas = async (
  fuse: MidasBase,
  inputToken: string,
  expectedOutputToken: string | null
): Promise<StrategiesAndDatas> => {
  const strategies: string[] = [];
  const datas: BytesLike[] = [];
  const tokenPath: string[] = [];

  if (expectedOutputToken) {
    let tokenToRedeem = inputToken;
    while (tokenToRedeem != expectedOutputToken && tokenToRedeem in fuse.redemptionStrategies) {
      const { strategyAddress, strategyData, outputToken } = (await getStrategyAndData(
        fuse,
        tokenToRedeem
      )) as StrategyAndData;

      if (tokenPath.find((p) => p == outputToken)) break;

      tokenPath.push(outputToken);
      strategies.push(strategyAddress);
      datas.push(strategyData);

      tokenToRedeem = outputToken;
    }
  }

  return {
    strategies,
    datas,
  };
};

const pickPreferredToken = (fuse: MidasBase, tokens: string[]): string => {
  const wtoken = fuse.chainSpecificAddresses.W_TOKEN;
  const stableToken = fuse.chainSpecificAddresses.STABLE_TOKEN;
  const wBTCToken = fuse.chainSpecificAddresses.W_BTC_TOKEN;

  if (tokens.find((t) => t == wtoken)) {
    return wtoken;
  } else if (tokens.find((t) => t == stableToken)) {
    return stableToken;
  } else if (tokens.find((t) => t == wBTCToken)) {
    return wBTCToken;
  } else {
    return tokens[0];
  }
};

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

      const tokens: string[] = [];
      while (true) {
        try {
          const underlying = await curveLpOracle.callStatic.underlyingTokens(token, tokens.length);
          tokens.push(underlying);
        } catch (e) {
          break;
        }
      }

      const preferredOutputToken = pickPreferredToken(fuse, tokens);
      return {
        strategyAddress: redemptionStrategyContract.address,
        strategyData: new ethers.utils.AbiCoder().encode(["uint256", "address"], [0, preferredOutputToken]),
        outputToken: preferredOutputToken,
      };

    case RedemptionStrategyContract.XBombLiquidator: {
      return { strategyAddress: redemptionStrategyContract.address, strategyData: [], outputToken };
    }
    case RedemptionStrategyContract.UniswapLpTokenLiquidator: {
      const lpToken = IUniswapV2Pair__factory.connect(token, fuse.provider);

      const token0 = await lpToken.callStatic.token0();
      const token1 = await lpToken.callStatic.token1();

      if (token0 != outputToken && token1 != outputToken) {
        throw new Error(`Output token ${outputToken} does not match either of the pair tokens! ${token0} ${token1}`);
      }

      const token0IsOutputToken = token0 == outputToken;

      // token0 is the output token if swapToken0Path.length == 0
      // else output token is the last in swapToken0Path
      const swapToken0Path = !token0IsOutputToken ? [token0, outputToken] : [];
      const swapToken1Path = token0IsOutputToken ? [token1, outputToken] : [];

      return {
        strategyAddress: redemptionStrategyContract.address,
        strategyData: new ethers.utils.AbiCoder().encode(
          ["address", "address[]", "address[]"],
          [fuse.chainSpecificAddresses.UNISWAP_V2_ROUTER, swapToken0Path, swapToken1Path]
        ),
        outputToken,
      };
    }
    case RedemptionStrategyContract.JarvisLiquidatorFunder: {
      return { strategyAddress: redemptionStrategyContract.address, strategyData: [], outputToken: outputToken };
    }
    default: {
      return { strategyAddress: redemptionStrategyContract.address, strategyData: [], outputToken: outputToken };
    }
  }
};
