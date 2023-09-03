import { chainIdToConfig } from "@ionicprotocol/chains";

import { ILiquidatorsRegistry } from "../../../typechain/ILiquidatorsRegistry";
import { LiquidatorsRegistryConfigFnParams } from "../types";

export const configureLiquidatorsRegistry = async ({
  ethers,
  getNamedAccounts,
  chainId
}: LiquidatorsRegistryConfigFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const lr = await ethers.getContract("LiquidatorsRegistry");
  const liquidatorsRegistry = (await ethers.getContractAt(
    "ILiquidatorsRegistry",
    lr.address,
    deployer
  )) as ILiquidatorsRegistry;

  {
    const strategies: string[] = [];
    const inputTokens: string[] = [];
    const outputTokens: string[] = [];

    for (const redemptionStrategy of chainIdToConfig[chainId].redemptionStrategies) {
      const { strategy, outputToken, inputToken } = redemptionStrategy;
      const redemptionStrategyContract = await ethers.getContract(strategy, deployer);

      strategies.push(redemptionStrategyContract.address);
      inputTokens.push(inputToken);
      outputTokens.push(outputToken);
    }
    const matching = await liquidatorsRegistry.callStatic.pairsStrategiesMatch(strategies, inputTokens, outputTokens);
    if (!matching) {
      const tx = await liquidatorsRegistry._resetRedemptionStrategies(strategies, inputTokens, outputTokens);
      console.log("waiting for tx ", tx.hash);
      await tx.wait();
      console.log("_resetRedemptionStrategies: ", tx.hash);
    } else {
      console.log("no redemption strategies to configure in the liquidators registry");
    }
  }

  {
    // TODO check if same instead of updating every time
    const fees: number[] = [];
    const inputTokens: string[] = [];
    const outputTokens: string[] = [];

    const uniswapV3Fees = chainIdToConfig[chainId].specificParams.metadata.uniswapV3Fees;
    for(const inputToken in uniswapV3Fees) {
      for (const outputToken in uniswapV3Fees[inputToken]) {
        inputTokens.push(inputToken);
        outputTokens.push(outputToken);
        fees.push(uniswapV3Fees[inputToken][outputToken]);
      }
    }

    const tx = await liquidatorsRegistry._setUniswapV3Fees(inputTokens, outputTokens, fees);
    console.log("waiting for tx ", tx.hash);
    await tx.wait();
    console.log("_setUniswapV3Fees: ", tx.hash);
  }
};
