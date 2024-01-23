import { FundingStrategyContract } from "@ionicprotocol/types";
import { BytesLike, constants, ethers } from "ethers";

import { IUniswapV2Factory__factory } from "../../../typechain/factories/IUniswapV2Factory__factory";
import { IonicBase } from "../../IonicSdk";

export type FundingStrategiesAndDatas = {
  strategies: string[];
  datas: BytesLike[];
  flashSwapFundingToken: string;
};

export const getFundingStrategiesAndDatas = async (
  ionicSdk: IonicBase,
  debtToken: string
): Promise<FundingStrategiesAndDatas> => {
  const uniswapV2Factory = IUniswapV2Factory__factory.connect(
    ionicSdk.chainSpecificAddresses.UNISWAP_V2_FACTORY,
    ionicSdk.provider
  );

  const strategies: string[] = [];
  const datas: BytesLike[] = [];
  const tokenPath: string[] = [];

  let fundingToken = debtToken;

  for (const fundingStrategy of ionicSdk.fundingStrategies) {
    const { inputToken, strategy, outputToken } = fundingStrategy;
    if (fundingToken === outputToken) {
      // avoid going in an endless loop
      if (tokenPath.find((p) => p == inputToken)) {
        // if we can supply the funding token with flash loan on uniswap, that's enough
        const pair = await uniswapV2Factory.callStatic.getPair(ionicSdk.chainSpecificAddresses.W_TOKEN, fundingToken);
        if (pair !== constants.AddressZero) {
          break;
        } else {
          throw new Error(
            `circular path in the chain of funding for ${debtToken}: ${JSON.stringify(
              tokenPath
            )} already includes ${inputToken}`
          );
        }
      }
      tokenPath.push(inputToken);

      const strategyAddress = ionicSdk.chainDeployment[strategy].address;
      const strategyData = getStrategyData(ionicSdk, strategy, inputToken, fundingToken);

      strategies.push(strategyAddress);
      datas.push(strategyData);

      // the new input token on the chain is the next funding token that we should find a way to supply it
      fundingToken = inputToken;
    }
  }

  return {
    strategies,
    datas,
    flashSwapFundingToken: fundingToken
  };
};

function getStrategyData(
  ionicSdk: IonicBase,
  contract: FundingStrategyContract,
  inputToken: string,
  fundingToken: string
): string {
  switch (contract) {
    // IFundsConversionStrategy should be also configured here
    case FundingStrategyContract.UniswapV3LiquidatorFunder:
      const quoter = ionicSdk.chainDeployment["Quoter"].address;

      return new ethers.utils.AbiCoder().encode(
        ["address", "address", "uint24", "address", "address"],
        [
          inputToken,
          fundingToken,
          ionicSdk.chainConfig.specificParams.metadata.uniswapV3Fees?.[inputToken][fundingToken] || 1000,
          ionicSdk.chainConfig.chainAddresses.UNISWAP_V3_ROUTER,
          quoter
        ]
      );
    case FundingStrategyContract.JarvisLiquidatorFunder:
      const jarvisPool = ionicSdk.chainConfig.liquidationDefaults.jarvisPools.find(
        (p) => p.collateralToken == inputToken && p.syntheticToken == fundingToken
      );
      if (jarvisPool == null) {
        throw new Error(
          `wrong config for the jarvis funding strategy for ${fundingToken} - no such pool with syntheticToken ${inputToken}`
        );
      }
      const poolAddress = jarvisPool.liquidityPoolAddress;
      const expirationTime = jarvisPool.expirationTime;
      return new ethers.utils.AbiCoder().encode(
        ["address", "address", "uint256"],
        [inputToken, poolAddress, expirationTime]
      );
    case FundingStrategyContract.XBombLiquidatorFunder:
      return new ethers.utils.AbiCoder().encode(["address"], [inputToken]);
    case FundingStrategyContract.CurveSwapLiquidatorFunder:
      const curveV1Oracle = ionicSdk.chainDeployment.CurveLpTokenPriceOracleNoRegistry;
      const curveV2Oracle = ionicSdk.chainDeployment.CurveV2LpTokenPriceOracleNoRegistry;
      const curveV1OracleAddress = curveV1Oracle ? curveV1Oracle.address : constants.AddressZero;
      const curveV2OracleAddress = curveV2Oracle ? curveV2Oracle.address : constants.AddressZero;
      return new ethers.utils.AbiCoder().encode(
        ["address", "address", "address", "address", "address"],
        [curveV1OracleAddress, curveV2OracleAddress, inputToken, fundingToken, ionicSdk.chainSpecificAddresses.W_TOKEN]
      );
    default:
      return "";
  }
}
