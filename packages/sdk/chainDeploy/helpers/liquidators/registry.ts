import { chainIdToConfig } from "@midas-capital/chains";

import { ILiquidatorsRegistry } from "../../../typechain/ILiquidatorsRegistry";
import { LiquidatorsRegistryConfigFnParams } from "../types";

export const configureLiquidatorsRegistry = async ({
  ethers,
  getNamedAccounts,
  chainId,
}: LiquidatorsRegistryConfigFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const lr = await ethers.getContract("LiquidatorsRegistry");
  const liquidatorsRegistry = (await ethers.getContractAt(
    "ILiquidatorsRegistry",
    lr.address,
    deployer
  )) as ILiquidatorsRegistry;

  const strategies: string[] = [];
  const inputTokens: string[] = [];
  const outputTokens: string[] = [];

  for (const inputToken in chainIdToConfig[chainId].redemptionStrategies) {
    const [redemptionStrategyType, outputToken] = chainIdToConfig[chainId].redemptionStrategies[inputToken];
    const redemptionStrategy = await ethers.getContract(redemptionStrategyType, deployer);

    strategies.push(redemptionStrategy.address);
    inputTokens.push(inputToken);
    outputTokens.push(outputToken);
  }
  const match = await liquidatorsRegistry.callStatic.pairsStrategiesMatch(strategies, inputTokens, outputTokens);
  if (match) {
    const tx = await liquidatorsRegistry._resetRedemptionStrategies(strategies, inputTokens, outputTokens);
    console.log("waiting for tx ", tx.hash);
    await tx.wait();
    console.log("_resetRedemptionStrategies: ", tx.hash);
  } else {
    console.log("no redemption strategies to configure in the liquidators registry");
  }
};
