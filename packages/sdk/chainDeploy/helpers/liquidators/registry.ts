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
    const matchingStrategies = await liquidatorsRegistry.callStatic.pairsStrategiesMatch(
      strategies,
      inputTokens,
      outputTokens
    );
    if (!matchingStrategies) {
      const tx = await liquidatorsRegistry._resetRedemptionStrategies(strategies, inputTokens, outputTokens);
      console.log("waiting for tx ", tx.hash);
      await tx.wait();
      console.log("_resetRedemptionStrategies: ", tx.hash);
    } else {
      console.log("no redemption strategies to configure in the liquidators registry");
    }
  }

  {
    // UniswapV3 Fees
    const fees: number[] = [];
    let inputTokens: string[] = [];
    let outputTokens: string[] = [];
    const uniswapV3Fees = chainIdToConfig[chainId].specificParams.metadata.uniswapV3Fees;
    for (const inputToken in uniswapV3Fees) {
      for (const outputToken in uniswapV3Fees[inputToken]) {
        inputTokens.push(inputToken);
        outputTokens.push(outputToken);
        fees.push(uniswapV3Fees[inputToken][outputToken]);
      }
    }

    const matchingFees = await liquidatorsRegistry.callStatic.uniswapPairsFeesMatch(inputTokens, outputTokens, fees);

    if (!matchingFees) {
      const tx = await liquidatorsRegistry._setUniswapV3Fees(inputTokens, outputTokens, fees);
      console.log("waiting for tx ", tx.hash);
      await tx.wait();
      console.log("_setUniswapV3Fees: ", tx.hash);
    } else {
      console.log(`UniV3 fees don't need to be updated`);
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
        const router = assetSpecificRouters[inputToken][outputToken];
        if (!router) throw new Error(`missing router address in the chain specific params for in/out tokens ${inputToken} ${outputTokens}`);
        routers.push(router);
      }
    }

    const matchingRouters = await liquidatorsRegistry.callStatic.uniswapPairsRoutersMatch(
      inputTokens,
      outputTokens,
      routers
    );

    if (!matchingRouters) {
      const tx = await liquidatorsRegistry._setUniswapV3Routers(inputTokens, outputTokens, routers);
      console.log("waiting for tx ", tx.hash);
      await tx.wait();
      console.log("_setUniswapV3Router: ", tx.hash);
    } else {
      console.log(`UniV3 routers don't need to be updated`);
    }
  }
};
