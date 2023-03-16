import { RedemptionStrategyContract } from "@midas-capital/types";
import { BytesLike, constants, Contract, ethers } from "ethers";

import CurveLpTokenPriceOracleNoRegistryABI from "../../../abis/CurveLpTokenPriceOracleNoRegistry";
import IRedemptionStrategyABI from "../../../abis/IRedemptionStrategy";
import SaddleLpPriceOracleABI from "../../../abis/SaddleLpPriceOracle";
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
  const tokenPath: string[] = [inputToken];

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

  let actualOutputToken;
  let preferredOutputToken;

  // let outputTokenIndex;
  switch (redemptionStrategy) {
    case RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry:
      const curveLpOracleAddress = fuse.chainDeployment.CurveLpTokenPriceOracleNoRegistry.address;
      const curveLpOracle = new Contract(curveLpOracleAddress, CurveLpTokenPriceOracleNoRegistryABI, fuse.provider);

      let tokens = await curveLpOracle.callStatic.getUnderlyingTokens(inputToken);
      preferredOutputToken = pickPreferredToken(fuse, tokens, outputToken);

      // the native asset is not a real erc20 token contract, converting to wrapped
      actualOutputToken = preferredOutputToken;
      if (
        preferredOutputToken == ethers.constants.AddressZero ||
        preferredOutputToken == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
      ) {
        actualOutputToken = fuse.chainSpecificAddresses.W_TOKEN;
      }

      return {
        strategyAddress: redemptionStrategyContract.address,
        strategyData: new ethers.utils.AbiCoder().encode(
          ["address", "address", "address"],
          [preferredOutputToken, fuse.chainSpecificAddresses.W_TOKEN, curveLpOracleAddress]
        ),
        outputToken: actualOutputToken,
      };
    case RedemptionStrategyContract.SaddleLpTokenLiquidator:
      const saddleLpOracleAddress = fuse.chainDeployment.CurveLpTokenPriceOracleNoRegistry.address;
      const saddleLpOracle = new Contract(saddleLpOracleAddress, SaddleLpPriceOracleABI, fuse.provider);

      tokens = await saddleLpOracle.callStatic.getUnderlyingTokens(inputToken);
      preferredOutputToken = pickPreferredToken(fuse, tokens, outputToken);

      // the native asset is not a real erc20 token contract, converting to wrapped
      actualOutputToken = preferredOutputToken;
      if (
        preferredOutputToken == ethers.constants.AddressZero ||
        preferredOutputToken == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
      ) {
        actualOutputToken = fuse.chainSpecificAddresses.W_TOKEN;
      }
      return {
        strategyAddress: redemptionStrategyContract.address,
        strategyData: new ethers.utils.AbiCoder().encode(
          ["address", "address", "address"],
          [preferredOutputToken, saddleLpOracleAddress, fuse.chainSpecificAddresses.W_TOKEN]
        ),
        outputToken: actualOutputToken,
      };
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
      const curveV1Oracle = fuse.chainDeployment.CurveLpTokenPriceOracleNoRegistry
        ? fuse.chainDeployment.CurveLpTokenPriceOracleNoRegistry.address
        : constants.AddressZero;
      const curveV2Oracle = fuse.chainDeployment.CurveV2LpTokenPriceOracleNoRegistry
        ? fuse.chainDeployment.CurveV2LpTokenPriceOracleNoRegistry.address
        : constants.AddressZero;

      const strategyData = new ethers.utils.AbiCoder().encode(
        ["address", "address", "address", "address", "address"],
        [curveV1Oracle, curveV2Oracle, inputToken, outputToken, fuse.chainSpecificAddresses.W_TOKEN]
      );

      return { strategyAddress: redemptionStrategyContract.address, strategyData, outputToken };
    }
    case RedemptionStrategyContract.BalancerLpTokenLiquidator: {
      const strategyData = new ethers.utils.AbiCoder().encode(["address"], [outputToken]);

      // TODO: add support for multiple pools
      return { strategyAddress: redemptionStrategyContract.address, strategyData, outputToken };
    }
    case RedemptionStrategyContract.XBombLiquidatorFunder: {
      const xbomb = inputToken;
      const bomb = outputToken;
      return {
        strategyAddress: redemptionStrategyContract.address,
        strategyData: new ethers.utils.AbiCoder().encode(["address", "address", "address"], [inputToken, xbomb, bomb]),
        outputToken,
      };
    }
    default: {
      return { strategyAddress: redemptionStrategyContract.address, strategyData: [], outputToken };
    }
  }
};
