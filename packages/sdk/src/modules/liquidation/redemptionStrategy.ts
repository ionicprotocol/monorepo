import { RedemptionStrategyContract } from "@midas-capital/types";
import { BytesLike, Contract, ethers } from "ethers";

import CurveLpTokenPriceOracleNoRegistryABI from "../../../abis/CurveLpTokenPriceOracleNoRegistry";
import IRedemptionStrategyABI from "../../../abis/IRedemptionStrategy";
import { ICurvePool__factory } from "../../../typechain/factories/ICurvePool__factory";
import { IUniswapV2Pair__factory } from "../../../typechain/factories/IUniswapV2Pair__factory";
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
): Promise<[StrategiesAndDatas, string[]]> => {
  const strategies: string[] = [];
  const datas: BytesLike[] = [];
  const tokenPath: string[] = [];

  if (expectedOutputToken) {
    let tokenToRedeem = inputToken;
    // chain redemptions as long as it is redeemable and is not the needed output token
    while (tokenToRedeem != expectedOutputToken && tokenToRedeem in fuse.redemptionStrategies) {
      const { strategyAddress, strategyData, outputToken } = (await getStrategyAndData(
        fuse,
        tokenToRedeem
      )) as StrategyAndData;

      // avoid going in an endless loop
      // it is not mission critical to reach the expected output token,
      // so just break instead of throwing
      if (tokenPath.find((p) => p == outputToken)) break;

      tokenPath.push(outputToken);
      strategies.push(strategyAddress);
      datas.push(strategyData);

      tokenToRedeem = outputToken;
    }
  }

  return [
    {
      strategies,
      datas,
    },
    tokenPath,
  ];
};

export const getUniswapV2Router = (fuse: MidasBase, asset: string): string => {
  return Object.values(fuse.chainConfig.liquidationDefaults.ASSET_SPECIFIC_ROUTER).includes(asset)
    ? fuse.chainConfig.liquidationDefaults.ASSET_SPECIFIC_ROUTER[asset]
    : fuse.chainConfig.liquidationDefaults.DEFAULT_ROUTER;
};

const pickPreferredToken = (fuse: MidasBase, tokens: string[], strategyOutputToken: string): string => {
  const wtoken = fuse.chainSpecificAddresses.W_TOKEN;
  const stableToken = fuse.chainSpecificAddresses.STABLE_TOKEN;
  const wBTCToken = fuse.chainSpecificAddresses.W_BTC_TOKEN;

  if (tokens.find((t) => t == strategyOutputToken)) {
    return strategyOutputToken;
  } else if (tokens.find((t) => t == wtoken)) {
    return wtoken;
  } else if (tokens.find((t) => t == stableToken)) {
    return stableToken;
  } else if (tokens.find((t) => t == wBTCToken)) {
    return wBTCToken;
  } else {
    return tokens[0];
  }
};

const getStrategyAndData = async (fuse: MidasBase, inputToken: string): Promise<StrategyAndData> => {
  const [redemptionStrategy, outputToken] = fuse.redemptionStrategies[inputToken];
  const redemptionStrategyContract = new Contract(
    fuse.chainDeployment[redemptionStrategy].address,
    IRedemptionStrategyABI,
    fuse.provider
  );

  switch (redemptionStrategy) {
    case RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry:
      const curveLpOracleAddress = fuse.chainDeployment.CurveLpTokenPriceOracleNoRegistry.address;
      const curveLpOracle = new Contract(curveLpOracleAddress, CurveLpTokenPriceOracleNoRegistryABI, fuse.provider);

      const tokens = await getCurvePoolUnderlyingTokens(fuse, await curveLpOracle.callStatic.poolOf(inputToken));

      const preferredOutputToken = pickPreferredToken(fuse, tokens, outputToken);
      const outputTokenIndex = tokens.indexOf(preferredOutputToken);

      // the native asset is not a real erc20 token contract, converting to wrapped
      let actualOutputToken = preferredOutputToken;
      if (
        preferredOutputToken == ethers.constants.AddressZero ||
        preferredOutputToken == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
      ) {
        actualOutputToken = fuse.chainSpecificAddresses.W_TOKEN;
      }

      return {
        strategyAddress: redemptionStrategyContract.address,
        strategyData: new ethers.utils.AbiCoder().encode(
          ["uint256", "address", "address", "address"],
          [outputTokenIndex, preferredOutputToken, fuse.chainSpecificAddresses.W_TOKEN, curveLpOracleAddress]
        ),
        outputToken: actualOutputToken,
      };

    case RedemptionStrategyContract.XBombLiquidatorFunder: {
      const xbomb = inputToken;
      const bomb = outputToken;
      return {
        strategyAddress: redemptionStrategyContract.address,
        strategyData: new ethers.utils.AbiCoder().encode(["address", "address", "address"], [inputToken, xbomb, bomb]),
        outputToken,
      };
    }
    case RedemptionStrategyContract.UniswapLpTokenLiquidator:
    case RedemptionStrategyContract.GelatoGUniLiquidator: {
      const lpToken = IUniswapV2Pair__factory.connect(inputToken, fuse.provider);

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
          [getUniswapV2Router(fuse, inputToken), swapToken0Path, swapToken1Path]
        ),
        outputToken,
      };
    }
    case RedemptionStrategyContract.UniswapV2LiquidatorFunder: {
      const swapPath = [inputToken, outputToken];
      return {
        strategyAddress: redemptionStrategyContract.address,
        strategyData: new ethers.utils.AbiCoder().encode(
          ["address", "address[]"],
          [getUniswapV2Router(fuse, inputToken), swapPath]
        ),
        outputToken,
      };
    }
    case RedemptionStrategyContract.JarvisLiquidatorFunder: {
      const jarvisPool = fuse.chainConfig.liquidationDefaults.jarvisPools.find(
        (p) => p.collateralToken == outputToken && p.syntheticToken == inputToken
      );
      if (jarvisPool == null) {
        throw new Error(
          `wrong config for the jarvis redemption strategy for ${inputToken} - no such pool with collateralToken ${outputToken}`
        );
      }
      const poolAddress = jarvisPool.liquidityPoolAddress;
      const expirationTime = jarvisPool.expirationTime;
      const strategyData = new ethers.utils.AbiCoder().encode(
        ["address", "address", "uint256"],
        [inputToken, poolAddress, expirationTime]
      );

      return { strategyAddress: redemptionStrategyContract.address, strategyData, outputToken };
    }
    case RedemptionStrategyContract.CurveSwapLiquidator: {
      // look up a pool for which the output token is an underlying
      // and the input token is either the LP token or an underlying
      const curvePool = fuse.chainConfig.liquidationDefaults.curveSwapPools.find((p) =>
        p.coins.find((c) => c == outputToken && (p.poolAddress == inputToken || p.coins.find((c) => c == inputToken)))
      );
      if (curvePool == null) {
        throw new Error(
          `wrong config for the curve swap redemption strategy for ${inputToken} - no such pool with output token ${outputToken}`
        );
      }

      const i = curvePool.coins.indexOf(inputToken);
      const j = curvePool.coins.indexOf(outputToken);

      const strategyData = new ethers.utils.AbiCoder().encode(
        ["address", "int128", "int128", "address", "address"],
        [curvePool.poolAddress, i, j, outputToken, fuse.chainSpecificAddresses.W_TOKEN]
      );

      return { strategyAddress: redemptionStrategyContract.address, strategyData, outputToken };
    }
    default: {
      return { strategyAddress: redemptionStrategyContract.address, strategyData: [], outputToken };
    }
  }
};

const getCurvePoolUnderlyingTokens = async (fuse: MidasBase, poolAddress: string): Promise<string[]> => {
  const tokens: string[] = [];

  while (true) {
    try {
      const curvePool = new Contract(poolAddress, ICurvePool__factory.abi, fuse.provider);
      const underlying = await curvePool.callStatic.coins(tokens.length);
      tokens.push(underlying);
    } catch (ignored) {
      break;
    }
  }

  return tokens;
};
