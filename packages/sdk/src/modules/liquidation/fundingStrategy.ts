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
  fuse: MidasBase,
  debtToken: string
): Promise<FundingStrategiesAndDatas> => {
  const uniswapV2Factory = IUniswapV2Factory__factory.connect(
    fuse.chainSpecificAddresses.UNISWAP_V2_FACTORY,
    fuse.provider
  );

  const strategies: string[] = [];
  const datas: BytesLike[] = [];
  const tokenPath: string[] = [];

  let flashSwapFundingToken = debtToken;
  while (flashSwapFundingToken in fuse.fundingStrategies) {
    const [fundingStrategyContract, outputToken] = fuse.fundingStrategies[flashSwapFundingToken];
    // console.log(`got funding str ${fundingStrategyContract} and output ${outputToken} for ${flashSwapFundingToken}`);

    // avoid going in an endless loop
    if (tokenPath.find((p) => p == outputToken)) break;
    tokenPath.push(outputToken);

    // if it can be flash loaned through uniswap, that's enough
    const pair = await uniswapV2Factory.callStatic.getPair(fuse.chainSpecificAddresses.W_TOKEN, outputToken);
    if (pair !== constants.AddressZero) {
      // TODO: should check if the liquidity is enough or a funding strategy is preferred in the opposite case
      break;
    }

    const strategyAddress = fuse.chainDeployment[fundingStrategyContract].address;
    let strategyData = "";
    switch (fundingStrategyContract) {
      case FundingStrategyContract.JarvisLiquidatorFunder:
        const jarvisPool = fuse.chainConfig.liquidationDefaults.jarvisPools.find(
          (p) => p.collateralToken == flashSwapFundingToken && p.syntheticToken == outputToken
        );
        if (jarvisPool == null) {
          throw new Error(
            `wrong config for the jarvis funding strategy for ${flashSwapFundingToken} - no such pool with syntheticToken ${outputToken}`
          );
        }
        const poolAddress = jarvisPool.liquidityPoolAddress;
        const expirationTime = jarvisPool.expirationTime;
        strategyData = new ethers.utils.AbiCoder().encode(
          ["address", "address", "uint256"],
          [flashSwapFundingToken, poolAddress, expirationTime]
        );
    }

    strategies.push(strategyAddress);
    datas.push(strategyData);

    flashSwapFundingToken = outputToken;
  }

  return {
    strategies,
    datas,
    flashSwapFundingToken,
  };
};
