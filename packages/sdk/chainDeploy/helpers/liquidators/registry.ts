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
    // UniV3 Fees
    const fees: number[] = [];
    let inputTokens: string[] = [];
    let outputTokens: string[] = [];

    const uniswapV3Fees = chainIdToConfig[chainId].specificParams.metadata.uniswapV3Fees;
    for (const inputToken in uniswapV3Fees) {
      for (const outputToken in uniswapV3Fees[inputToken]) {
        const existingConfig = await liquidatorsRegistry.callStatic.uniswapV3Fees(inputToken, outputToken);
        if (existingConfig != uniswapV3Fees[inputToken][outputToken]) {
          inputTokens.push(inputToken);
          outputTokens.push(outputToken);
          fees.push(uniswapV3Fees[inputToken][outputToken]);
        }
      }
    }

    if (fees.length > 0) {
      console.log(`updating uniswapV3Fees for ${inputTokens.join(", ")} ${outputTokens.join(", ")} ${fees.join(", ")}`);
      const tx = await liquidatorsRegistry._setUniswapV3Fees(inputTokens, outputTokens, fees);
      console.log("waiting for tx ", tx.hash);
      await tx.wait();
      console.log("_setUniswapV3Fees: ", tx.hash);
    }

    // Custom UniV3 Routers
    const routers: string[] = [];
    inputTokens = [];
    outputTokens = [];

    const assetSpecificRouters = chainIdToConfig[chainId].specificParams.metadata.uniswapV3Routers;
    for (const inputToken in assetSpecificRouters) {
      for (const outputToken in assetSpecificRouters[inputToken]) {
        inputTokens.push(inputToken);
        outputTokens.push(outputToken);
        routers.push(assetSpecificRouters[inputToken][outputToken]);
      }
    }

    for (const [idx, inputToken] of inputTokens.entries()) {
      const outputToken = outputTokens[idx];
      const existingConfig = await liquidatorsRegistry.callStatic["customUniV3Router"](inputToken, outputToken);
      if (existingConfig != routers[idx]) {
        console.log(`updating uniswapV3Fees for ${inputToken} ${outputToken} from ${existingConfig} to ${fees[idx]}`);
        const tx = await liquidatorsRegistry._setUniswapV3Router(inputToken, outputToken, routers[idx]);
        console.log("waiting for tx ", tx.hash);
        await tx.wait();
        console.log("_setUniswapV3Fees: ", tx.hash);
      }
    }
  }
};
