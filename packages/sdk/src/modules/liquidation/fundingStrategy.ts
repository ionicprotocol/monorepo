import { FundingStrategyContract } from "@ionicprotocol/types";
import { Address, encodeAbiParameters, getContract, Hex, parseAbiParameters, zeroAddress } from "viem";

import { iUniswapV2FactoryAbi } from "../../generated";
import { IonicBase } from "../../IonicSdk";

export type FundingStrategiesAndDatas = {
  strategies: Address[];
  datas: Hex[];
  flashSwapFundingToken: Address;
};

export const getFundingStrategiesAndDatas = async (
  ionicSdk: IonicBase,
  debtToken: Address
): Promise<FundingStrategiesAndDatas> => {
  const uniswapV2Factory = getContract({
    address: ionicSdk.chainSpecificAddresses.UNISWAP_V2_FACTORY as Address,
    abi: iUniswapV2FactoryAbi,
    client: ionicSdk.publicClient
  });

  const strategies: Address[] = [];
  const datas: Hex[] = [];
  const tokenPath: Address[] = [];

  let fundingToken = debtToken;

  for (const fundingStrategy of ionicSdk.fundingStrategies) {
    const { inputToken, strategy, outputToken } = fundingStrategy;
    if (fundingToken === outputToken) {
      // avoid going in an endless loop
      if (tokenPath.find((p) => p == inputToken)) {
        // if we can supply the funding token with flash loan on uniswap, that's enough
        const pair = await uniswapV2Factory.read.getPair([
          ionicSdk.chainSpecificAddresses.W_TOKEN as Address,
          fundingToken
        ]);
        if (pair !== zeroAddress) {
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

      strategies.push(strategyAddress as Address);
      datas.push(strategyData as Hex);

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
  inputToken: Address,
  fundingToken: Address
): string {
  switch (contract) {
    // IFundsConversionStrategy should be also configured here
    case FundingStrategyContract.UniswapV3LiquidatorFunder:
      const quoter = ionicSdk.chainDeployment["Quoter"].address as Address;
      return encodeAbiParameters(parseAbiParameters("address, address, uint24, address, address"), [
        inputToken,
        fundingToken,
        ionicSdk.chainConfig.specificParams.metadata.uniswapV3Fees?.[inputToken][fundingToken] || 1000,
        ionicSdk.chainConfig.chainAddresses.UNISWAP_V3_ROUTER as Address,
        quoter
      ]);
    default:
      return "";
  }
}
