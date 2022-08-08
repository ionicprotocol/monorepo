import { MidasBase } from "../../MidasSdk";
import { BytesLike, constants } from "ethers";

import { IUniswapV2Factory__factory } from "../../../lib/contracts/typechain/factories/IUniswapV2Factory__factory";

export type FundingStrategiesAndDatas = {
  strategies: string[];
  datas: BytesLike[];
  flashSwapFundingToken: string;
};

export const getFundingStrategiesAndDatas = async (
  fuse: MidasBase,
  debtToken: string,
): Promise<FundingStrategiesAndDatas> => {
  const uniswapV2Factory = IUniswapV2Factory__factory.connect(fuse.chainSpecificAddresses.UNISWAP_V2_FACTORY, fuse.provider);

  const strategies: string[] = [];
  const datas: BytesLike[] = [];
  const tokenPath: string[] = [];

  let liquidationFundingToken = debtToken;
  while (liquidationFundingToken in fuse.fundingStrategies) {
    const [fundingStrategyContract, outputToken] = fuse.fundingStrategies[liquidationFundingToken];
    // console.log(`got funding str ${fundingStrategyContract} and output ${outputToken} for ${liquidationFundingToken}`);

    const strategyAddress = fuse.chainDeployment[fundingStrategyContract].address;
    // let strategyAddress;
    // const contract = fuse.chainDeployment[fundingStrategyContract];
    // if (fundingStrategyContract == "JarvisLiquidatorFunder" && !contract) {
    //   strategyAddress = "0x3e235670D5198Cca0d2c02656EE42E524EF37961";
    // } else {
    //   strategyAddress = contract.address;
    // }

    // avoid going in an endless loop
    if (tokenPath.find((p) => p == outputToken)) break;
    tokenPath.push(outputToken);

    const strategyData = constants.AddressZero;
    strategies.push(strategyAddress);
    datas.push(strategyData);

    liquidationFundingToken = outputToken;

    const pair = await uniswapV2Factory.callStatic.getPair(fuse.chainSpecificAddresses.W_TOKEN, liquidationFundingToken);
    if (pair !== constants.AddressZero) {
      // TODO: should check if the liquidity is enough or a funding strategy is preferred in the opposite case
      break;
    }
  }

  return {
    strategies,
    datas,
    flashSwapFundingToken: liquidationFundingToken
  };
};
