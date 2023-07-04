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

  let currentStrategies: string[] = [];
  let currentInputTokens: string[] = [];
  let currentOutputTokens: string[] = [];

  const strategies: string[] = [];
  const inputTokens: string[] = [];
  const outputTokens: string[] = [];

  const strategyMapping: { [inputToken: string]: { [outputToken: string]: string } } = {};

  [currentStrategies, currentInputTokens, currentOutputTokens] =
    await liquidatorsRegistry.callStatic.getAllPairsStrategies();

  currentInputTokens.map((inputToken, index) => {
    strategyMapping[inputToken] = { [currentOutputTokens[index]]: currentStrategies[index] };
  });

  let update = false;
  for (const inputToken in chainIdToConfig[chainId].redemptionStrategies) {
    const [redemptionStrategyType, outputToken] = chainIdToConfig[chainId].redemptionStrategies[inputToken];
    const redemptionStrategy = await ethers.getContract(redemptionStrategyType, deployer);

    strategies.push(redemptionStrategy.address);
    inputTokens.push(inputToken);
    outputTokens.push(outputToken);

    const existingStrategy =
      strategyMapping[inputToken] ?? strategyMapping[inputToken][outputToken]
        ? strategyMapping[inputToken][outputToken]
        : null;
    if (existingStrategy != redemptionStrategy.address || existingStrategy == null || existingStrategy == undefined) {
      update = true;
    }
  }

  if (update) {
    const tx = await liquidatorsRegistry._resetRedemptionStrategies(strategies, inputTokens, outputTokens);
    console.log("waiting for tx ", tx.hash);
    await tx.wait();
    console.log("_resetRedemptionStrategies: ", tx.hash);
  } else {
    console.log("no redemption strategies to configure in the liquidators registry");
  }
};
