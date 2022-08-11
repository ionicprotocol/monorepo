import { FundingStrategyContract } from "@midas-capital/types";
import { BytesLike, constants, ethers } from "ethers";

import { IUniswapV2Factory__factory } from "../../../lib/contracts/typechain/factories/IUniswapV2Factory__factory";
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
    // if it can be flash loaned through uniswap, that's enough
    const pair = await uniswapV2Factory.callStatic.getPair(midasSdk.chainSpecificAddresses.W_TOKEN, fundingToken);
    if (pair !== constants.AddressZero) {
      // TODO: should check if the liquidity is enough or a funding strategy is preferred in the opposite case
      break;
    }

    // find a funding strategy that can supply us with the needed funding token
    const [fundingStrategyContract, inputToken] = midasSdk.fundingStrategies[fundingToken];
    // console.log(`got funding str ${fundingStrategyContract} and output ${inputToken} for ${flashSwapFundingToken}`);

    // avoid going in an endless loop
    if (tokenPath.find((p) => p == inputToken)) break;
    tokenPath.push(inputToken);

    const strategyAddress = midasSdk.chainDeployment[fundingStrategyContract].address;
    const strategyData = getStrategyData(midasSdk, fundingStrategyContract, inputToken, fundingToken);

    strategies.push(strategyAddress);
    datas.push(strategyData);

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
        [fundingToken, poolAddress, expirationTime]
      );
    // case FundingStrategyContract.XBombLiquidatorFunder:
    //   return new ethers.utils.AbiCoder().encode(["address"], [inputToken]);
  }
}
