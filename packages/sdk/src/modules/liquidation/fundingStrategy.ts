import { FundingStrategyContract } from "@midas-capital/types";
import { BytesLike, constants, ethers } from "ethers";

import { IUniswapV2Factory__factory } from "../../../typechain/factories/IUniswapV2Factory__factory";
import { MidasBase } from "../../MidasSdk";

export type FundingStrategiesAndDatas = {
  strategies: string[];
  datas: BytesLike[];
  flashSwapFundingToken: string;
};

export const getFundingStrategiesAndDatas = async (
  midasSdk: MidasBase,
  debtToken: string
): Promise<FundingStrategiesAndDatas> => {
  const uniswapV2Factory = IUniswapV2Factory__factory.connect(
    midasSdk.chainSpecificAddresses.UNISWAP_V2_FACTORY,
    midasSdk.provider
  );

  const strategies: string[] = [];
  const datas: BytesLike[] = [];
  const tokenPath: string[] = [];

  let fundingToken = debtToken;
  while (fundingToken in midasSdk.fundingStrategies) {
    // chain the funding strategy that can give us the needed funding token
    const [fundingStrategyContract, inputToken] = midasSdk.fundingStrategies[fundingToken];

    // avoid going in an endless loop
    if (tokenPath.find((p) => p == inputToken)) {
      // if we can supply the funding token with flash loan on uniswap, that's enough
      const pair = await uniswapV2Factory.callStatic.getPair(midasSdk.chainSpecificAddresses.W_TOKEN, fundingToken);
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

    const strategyAddress = midasSdk.chainDeployment[fundingStrategyContract].address;
    const strategyData = getStrategyData(midasSdk, fundingStrategyContract, inputToken, fundingToken);

    strategies.push(strategyAddress);
    datas.push(strategyData);

    // the new input token on the chain is the next funding token that we should find a way to supply it
    fundingToken = inputToken;
  }

  return {
    strategies,
    datas,
    flashSwapFundingToken: fundingToken,
  };
};

function getStrategyData(
  midasSdk: MidasBase,
  contract: FundingStrategyContract,
  inputToken: string,
  fundingToken: string
): string {
  switch (contract) {
    // IFundsConversionStrategy should be also configured here
    case FundingStrategyContract.UniswapV3LiquidatorFunder:
      const quoter = midasSdk.chainDeployment["Quoter"].address;

      return new ethers.utils.AbiCoder().encode(
        ["address", "address", "uint24", "address", "address"],
        [
          inputToken,
          fundingToken,
          midasSdk.chainConfig.specificParams.metadata.uniswapV3Fees?.[inputToken][fundingToken] || 1000,
          midasSdk.chainConfig.chainAddresses.UNISWAP_V3_ROUTER,
          quoter,
        ]
      );
    case FundingStrategyContract.JarvisLiquidatorFunder:
      const jarvisPool = midasSdk.chainConfig.liquidationDefaults.jarvisPools.find(
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
      const curveV1Oracle = midasSdk.chainDeployment.CurveLpTokenPriceOracleNoRegistry.address;
      const curveV2Oracle = midasSdk.chainDeployment.CurveV2LpTokenPriceOracleNoRegistry.address;
      return new ethers.utils.AbiCoder().encode(
        ["address", "address", "address", "address", "address"],
        [curveV1Oracle, curveV2Oracle, inputToken, fundingToken, midasSdk.chainSpecificAddresses.W_TOKEN]
      );
    default:
      return "";
  }
}
