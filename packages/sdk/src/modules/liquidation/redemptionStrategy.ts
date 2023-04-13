import { ethereum } from "@midas-capital/chains";
import { assetSymbols, RedemptionStrategyContract, underlying } from "@midas-capital/types";
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

export const getUniswapV2Router = (midasSdk: MidasBase, asset: string): string => {
  return Object.values(midasSdk.chainConfig.liquidationDefaults.ASSET_SPECIFIC_ROUTER).includes(asset)
    ? midasSdk.chainConfig.liquidationDefaults.ASSET_SPECIFIC_ROUTER[asset]
    : midasSdk.chainConfig.liquidationDefaults.DEFAULT_ROUTER;
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

const getStrategyAndData = async (midasSdk: MidasBase, inputToken: string): Promise<StrategyAndData> => {
  const [redemptionStrategy, outputToken] = midasSdk.redemptionStrategies[inputToken];
  const redemptionStrategyContract = new Contract(
    midasSdk.chainDeployment[redemptionStrategy].address,
    IRedemptionStrategyABI,
    midasSdk.provider
  );

  let actualOutputToken;
  let preferredOutputToken;

  // let outputTokenIndex;
  switch (redemptionStrategy) {
    case RedemptionStrategyContract.CurveLpTokenLiquidatorNoRegistry:
      const curveLpOracleAddress = midasSdk.chainDeployment.CurveLpTokenPriceOracleNoRegistry.address;
      const curveLpOracle = new Contract(curveLpOracleAddress, CurveLpTokenPriceOracleNoRegistryABI, midasSdk.provider);

      let tokens = await curveLpOracle.callStatic.getUnderlyingTokens(inputToken);
      preferredOutputToken = pickPreferredToken(midasSdk, tokens, outputToken);

      // the native asset is not a real erc20 token contract, converting to wrapped
      actualOutputToken = preferredOutputToken;
      if (
        preferredOutputToken == ethers.constants.AddressZero ||
        preferredOutputToken == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
      ) {
        actualOutputToken = midasSdk.chainSpecificAddresses.W_TOKEN;
      }

      return {
        strategyAddress: redemptionStrategyContract.address,
        strategyData: new ethers.utils.AbiCoder().encode(
          ["address", "address", "address"],
          [preferredOutputToken, midasSdk.chainSpecificAddresses.W_TOKEN, curveLpOracleAddress]
        ),
        outputToken: actualOutputToken,
      };
    case RedemptionStrategyContract.SaddleLpTokenLiquidator:
      const saddleLpOracleAddress = midasSdk.chainDeployment.CurveLpTokenPriceOracleNoRegistry.address;
      const saddleLpOracle = new Contract(saddleLpOracleAddress, SaddleLpPriceOracleABI, midasSdk.provider);

      tokens = await saddleLpOracle.callStatic.getUnderlyingTokens(inputToken);
      preferredOutputToken = pickPreferredToken(midasSdk, tokens, outputToken);

      // the native asset is not a real erc20 token contract, converting to wrapped
      actualOutputToken = preferredOutputToken;
      if (
        preferredOutputToken == ethers.constants.AddressZero ||
        preferredOutputToken == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
      ) {
        actualOutputToken = midasSdk.chainSpecificAddresses.W_TOKEN;
      }
      return {
        strategyAddress: redemptionStrategyContract.address,
        strategyData: new ethers.utils.AbiCoder().encode(
          ["address", "address", "address"],
          [preferredOutputToken, saddleLpOracleAddress, midasSdk.chainSpecificAddresses.W_TOKEN]
        ),
        outputToken: actualOutputToken,
      };
    case RedemptionStrategyContract.UniswapLpTokenLiquidator:
    case RedemptionStrategyContract.GelatoGUniLiquidator: {
      const lpToken = IUniswapV2Pair__factory.connect(inputToken, midasSdk.provider);

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
          [getUniswapV2Router(midasSdk, inputToken), swapToken0Path, swapToken1Path]
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
          [getUniswapV2Router(midasSdk, inputToken), swapPath]
        ),
        outputToken,
      };
    }
    case RedemptionStrategyContract.JarvisLiquidatorFunder: {
      const jarvisPool = midasSdk.chainConfig.liquidationDefaults.jarvisPools.find(
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
      const curveV1Oracle = midasSdk.chainDeployment.CurveLpTokenPriceOracleNoRegistry
        ? midasSdk.chainDeployment.CurveLpTokenPriceOracleNoRegistry.address
        : constants.AddressZero;
      const curveV2Oracle = midasSdk.chainDeployment.CurveV2LpTokenPriceOracleNoRegistry
        ? midasSdk.chainDeployment.CurveV2LpTokenPriceOracleNoRegistry.address
        : constants.AddressZero;

      const strategyData = new ethers.utils.AbiCoder().encode(
        ["address", "address", "address", "address", "address"],
        [curveV1Oracle, curveV2Oracle, inputToken, outputToken, midasSdk.chainSpecificAddresses.W_TOKEN]
      );

      return { strategyAddress: redemptionStrategyContract.address, strategyData, outputToken };
    }
    case RedemptionStrategyContract.BalancerSwapLiquidator:
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
    case RedemptionStrategyContract.ERC4626Liquidator:
      let fee: number;
      let underlyingTokens: string[];

      switch (inputToken) {
        case underlying(ethereum.assets, assetSymbols.realYieldUSD): {
          fee = 10;
          underlyingTokens = [
            underlying(ethereum.assets, assetSymbols.USDC),
            underlying(ethereum.assets, assetSymbols.DAI),
            underlying(ethereum.assets, assetSymbols.USDT),
          ];
        }
        case underlying(ethereum.assets, assetSymbols.ethBtcMomentum):
        case underlying(ethereum.assets, assetSymbols.ethBtcTrend): {
          underlyingTokens = [
            underlying(ethereum.assets, assetSymbols.USDC),
            underlying(ethereum.assets, assetSymbols.WETH),
            underlying(ethereum.assets, assetSymbols.WBTC),
          ];
          fee = 500;
        }
        default: {
          fee = 1000;
          underlyingTokens = [inputToken];
        }
      }

      const quoter = midasSdk.chainDeployment["Quoter"].address;
      const strategyData = new ethers.utils.AbiCoder().encode(
        ["address", "uint24", "address", "address[]", "address"],
        [outputToken, fee, midasSdk.chainConfig.chainAddresses.UNISWAP_V3_ROUTER, underlyingTokens, quoter]
      );
      return {
        strategyAddress: redemptionStrategyContract.address,
        strategyData,
        outputToken,
      };
    default: {
      return { strategyAddress: redemptionStrategyContract.address, strategyData: [], outputToken };
    }
  }
};
