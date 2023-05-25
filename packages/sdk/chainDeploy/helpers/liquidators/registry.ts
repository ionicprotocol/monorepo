import {LiquidatorsRegistryConfigFnParams} from "../types";
import {LiquidatorsRegistryExtension} from "../../../typechain/LiquidatorsRegistryExtension";
import {LiquidatorsRegistry} from "../../../typechain/LiquidatorsRegistry";

import {chainIdToConfig} from "@midas-capital/chains";

export const configureLiquidatorsRegistry = async ({
                                                    ethers,
                                                    getNamedAccounts,
                                                    chainId,
                                                  }: LiquidatorsRegistryConfigFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const strategies: string[] = [];
  const inputTokens: string[] = [];
  const outputTokens: string[] = [];
  const liquidatorsRegistry = (await ethers.getContract("LiquidatorsRegistry", deployer)) as LiquidatorsRegistry;
  const liquidatorsRegistryExt = (await ethers.getContract("LiquidatorsRegistryExtension", deployer)) as LiquidatorsRegistryExtension;

  for (const inputToken in chainIdToConfig[chainId].redemptionStrategies) {
    const [redemptionStrategyType, outputToken] = chainIdToConfig[chainId].redemptionStrategies[inputToken];
    const redemptionStrategy = await ethers.getContract(redemptionStrategyType, deployer);

    const strategy = await liquidatorsRegistry.callStatic.redemptionStrategiesByTokens(
      inputToken, outputToken
    );
    if (strategy != ethers.constants.AddressZero) {
      strategies.push(redemptionStrategy.address);
      inputTokens.push(inputToken);
      outputTokens.push(outputToken);
    }
  }

  if (strategies.length > 0) {
    const tx = await liquidatorsRegistryExt._setRedemptionStrategies(strategies, inputTokens, outputTokens);
    await tx.wait();
    console.log("_setRedemptionStrategies: ", tx.hash);
  } else {
    console.log("no redemption strategies to add");
  }

}
