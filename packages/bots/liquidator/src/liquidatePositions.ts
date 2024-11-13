import {
  BotType,
  ErroredPool,
  ExtendedPoolAssetStructOutput,
  icErc20Abi,
  ionicComptrollerAbi,
  ionicLiquidatorAbi,
  ionicUniV3LiquidatorAbi,
  poolDirectoryAbi,
  poolLensAbi,
  PoolUserStruct,
  PoolUserWithAssets,
  PublicPoolUserWithData,
  SCALE_FACTOR_ONE_18_WEI,
  SCALE_FACTOR_UNDERLYING_DECIMALS,
} from "@ionicprotocol/sdk";
import { Address, encodeAbiParameters, encodeFunctionData, parseEther } from "viem";
import { Client, OpportunityParams } from "@pythnetwork/express-relay-evm-js";
import dotenv from "dotenv";

import { client, sdk, walletClient } from "./run";
import { logger } from "./logger";
import config from "./config";
import { sendDiscordNotification } from "./services/PERdiscord";
import { DiscordService } from "./services/discordnew";
dotenv.config();
const discordService = new DiscordService(config.chainId);
// Validate the API key exists
if (!config.LIFIAPIKEY) {
  throw new Error("LIFIAPIKEY is required in config");
}

const pythClient: Client = new Client({ baseUrl: config.expressRelayEndpoint });

const PAGE_SIZE = 500; // Define the page size for pagination
// const BATCH_SIZE = 100; // Define the batch size for processing assets
const HF_MIN = parseEther("0.5");
const MAX_HEALTH_FACTOR = parseEther("1");

async function getFusePoolUsers(comptroller: Address, botType: BotType) {
  const poolUsers: PoolUserStruct[] = [];
  let page = 0;

  const healthFactorThreshold = await client.readContract({
    abi: ionicUniV3LiquidatorAbi,
    address: sdk.contracts.IonicLiquidator.address,
    functionName: "healthFactorThreshold",
  });

  while (true) {
    const [, users] = await client.readContract({
      abi: ionicComptrollerAbi,
      address: comptroller,
      functionName: "getPaginatedBorrowers",
      args: [BigInt(page), BigInt(PAGE_SIZE)],
    });
    if (users.length === 0) {
      break;
    }

    // Process assets in batches

    // const healthFactors = await client.multicall({
    //   contracts: users.map((user) => ({
    //     abi: poolLensAbi,
    //     functionName: "getHealthFactor",
    //     address: sdk.contracts.PoolLens.address,
    //     args: [user, comptroller],
    //   })),
    // });

    const healthFactors = await Promise.all(
      users.map(async (user) => {
        return await client.readContract({
          abi: poolLensAbi,
          functionName: "getHealthFactor",
          address: sdk.contracts.PoolLens.address,
          args: [user, comptroller],
        });
      })
    );

    healthFactors.forEach((health, index) => {
      if (health < MAX_HEALTH_FACTOR && health > HF_MIN && botType === BotType.Pyth) {
        // console.log("I am in pyth loop")
        poolUsers.push({ account: users[index], health });
      } else if (health < healthFactorThreshold && health > HF_MIN && botType === BotType.Standard) {
        // console.log("I am in standard loop, ")
        poolUsers.push({ account: users[index], health });
      }
    });

    page++;
  }

  return {
    comptroller,
    users: poolUsers,
  };
}

const getPoolsAndUsers = async (botType: BotType) => {
  const [, allPools] = await client.readContract({
    abi: poolDirectoryAbi,
    address: sdk.contracts.PoolDirectory.address,
    functionName: "getActivePools",
  });
  const validPools: PublicPoolUserWithData[] = [];
  const erroredPools: Array<ErroredPool> = [];
  const startTime = performance.now();
  const poolPromises = allPools.map(async (pool) => {
    const { comptroller, name } = pool;
    let userCount;
    const poolStartTime = performance.now();
    logger.info(`Processing pool ${name} (${comptroller})...`);
    try {
      const poolUsers = await getFusePoolUsers(comptroller, botType);
      const closeFactor = await client.readContract({
        abi: ionicComptrollerAbi,
        address: comptroller,
        functionName: "closeFactorMantissa",
      });
      const liquidationIncentive = await client.readContract({
        abi: ionicComptrollerAbi,
        address: comptroller,
        functionName: "liquidationIncentiveMantissa",
      });
      validPools.push({
        comptroller,
        users: poolUsers.users,
        closeFactor,
        liquidationIncentive,
      });
      userCount = poolUsers.users.length;
    } catch (e) {
      const msg = `Error getting pool users for ${comptroller}: ${e}`;
      logger.error(msg);
      erroredPools.push({ comptroller, msg, error: e });
    }
    const poolEndTime = performance.now();
    logger.info(
      `Processing pool ${name} (${comptroller}) took ${(poolEndTime - poolStartTime).toFixed(
        2
      )} milliseconds, ${userCount} users in shortfall`
    );
  });
  await Promise.all(poolPromises);
  const endTime = performance.now();
  logger.info(`Total time taken to read all users: ${(endTime - startTime).toFixed(2)} milliseconds`);
  return { validPools, erroredPools };
};

const getLiquidationPenalty = async (collateralCToken: Address, liquidationIncentive: bigint) => {
  const protocolSeizeShareMantissa = await client.readContract({
    abi: icErc20Abi,
    address: collateralCToken,
    functionName: "protocolSeizeShareMantissa",
  });
  const feeSeizeShareMantissa = await client.readContract({
    abi: icErc20Abi,
    address: collateralCToken,
    functionName: "feeSeizeShareMantissa",
  });
  return liquidationIncentive + protocolSeizeShareMantissa + feeSeizeShareMantissa;
};

async function getPotentialPythLiquidation(borrower: PoolUserWithAssets, closeFactor: bigint, comptroller: Address) {
  // Get debt and collateral
  borrower = { ...borrower };

  for (let asset of borrower.assets!) {
    asset = { ...asset };
    const scaleFactor = 10n ** (18n - asset.underlyingDecimals);
    asset.borrowBalanceWei = (asset.borrowBalance * asset.underlyingPrice * scaleFactor) / SCALE_FACTOR_ONE_18_WEI;
    asset.supplyBalanceWei = (asset.supplyBalance * asset.underlyingPrice * scaleFactor) / SCALE_FACTOR_ONE_18_WEI;
    if (asset.borrowBalance > 0) borrower.debt.push(asset);
    if (asset.membership && asset.supplyBalance > 0) borrower.collateral.push(asset);
  }

  if (!borrower.collateral!.length) {
    logger.error(`Borrower has no collateral ${borrower.account}`);
    return undefined;
  }

  // Sort debt and collateral from highest to lowest ETH value
  borrower.debt.sort((a, b) => (b!.borrowBalanceWei! > a!.borrowBalanceWei! ? 1 : -1));
  borrower.collateral.sort((a, b) => (b!.supplyBalanceWei! > a!.supplyBalanceWei! ? 1 : -1));

  const debtAsset = borrower.debt[0];
  const collateralAsset = borrower.collateral[0];

  if (debtAsset.borrowBalanceWei! < 3877938057596160n) {
    logger.info(`Borrow too small, skipping liquidation. Vault: ${borrower.account}`);
    return undefined;
  } else {
    logger.info(`Sufficiently Large Borrow, processing liquidation. Vault: ${borrower.account}`);
  }
  // Get debt and collateral prices
  const repayAmount = (debtAsset.borrowBalance * closeFactor) / SCALE_FACTOR_ONE_18_WEI;

  const seizeTokens = await client.readContract({
    abi: ionicComptrollerAbi,
    address: comptroller,
    functionName: "liquidateCalculateSeizeTokens",
    args: [debtAsset.cToken, collateralAsset.cToken, repayAmount],
  });
  const seizeTokenAmount = seizeTokens[1];
  const protocolSeizeShareMantissa = await client.readContract({
    abi: icErc20Abi,
    address: collateralAsset.cToken,
    functionName: "protocolSeizeShareMantissa",
  });
  const feeSeizeShareMantissa = await client.readContract({
    abi: icErc20Abi,
    address: collateralAsset.cToken,
    functionName: "feeSeizeShareMantissa",
  });
  const exchangeRate = await client.readContract({
    abi: icErc20Abi,
    address: collateralAsset.cToken,
    functionName: "exchangeRateCurrent",
  });

  const protocolFee = (seizeTokenAmount * protocolSeizeShareMantissa) / SCALE_FACTOR_ONE_18_WEI;
  const seizeFee = (seizeTokenAmount * feeSeizeShareMantissa) / SCALE_FACTOR_ONE_18_WEI;

  const actualAmountSeized = seizeTokenAmount - protocolFee - seizeFee;

  const BUY_TOKENS_SCALE_FACTOR = 1000n;
  const BUY_TOKENS_OFFSET = 999n;
  const underlyingAmountSeized =
    (actualAmountSeized * exchangeRate * BUY_TOKENS_OFFSET) / (BUY_TOKENS_SCALE_FACTOR * SCALE_FACTOR_ONE_18_WEI);

  return {
    borrower: borrower.account,
    repayAmount,
    underlyingAmountSeized,
    cErc20: debtAsset.cToken,
    cTokenCollateral: collateralAsset.cToken,
    collateralAssetUnderlyingToken: collateralAsset.underlyingToken,
    debtAssetUnderlyingToken: debtAsset.underlyingToken,
  };
}

const getPotentialLiquidation = async (
  borrower: PoolUserWithAssets,
  closeFactor: bigint,
  liquidationIncentive: bigint
) => {
  // Get debt and collateral
  borrower = { ...borrower };
  for (let asset of borrower.assets!) {
    asset = { ...asset };
    asset.borrowBalanceWei = (asset.borrowBalance * asset.underlyingPrice) / SCALE_FACTOR_ONE_18_WEI;
    asset.supplyBalanceWei = (asset.supplyBalance * asset.underlyingPrice) / SCALE_FACTOR_ONE_18_WEI;
    if (asset.borrowBalance > 0n) borrower.debt.push(asset);
    if (asset.membership && asset.supplyBalance > 0) borrower.collateral.push(asset);
  }
  if (!borrower.collateral!.length) {
    logger.error(`Borrower has no collateral ${borrower.account}`);
    return null;
  }
  // Sort debt and collateral from highest to lowest ETH value
  borrower.debt.sort((a, b) => (b.borrowBalanceWei! > a.borrowBalanceWei! ? 1 : -1));
  borrower.collateral.sort((a, b) => (b.supplyBalanceWei! > a.supplyBalanceWei! ? 1 : -1));
  const debtAsset = borrower.debt[0];
  const collateralAsset = borrower.collateral[0];
  // Get debt and collateral prices
  const debtAssetUnderlyingPrice = debtAsset.underlyingPrice;
  const collateralAssetUnderlyingPrice = collateralAsset.underlyingPrice;
  const debtAssetDecimals = debtAsset.underlyingDecimals;
  const collateralAssetDecimals = collateralAsset.underlyingDecimals;
  const collateralAssetUnderlyingToken = collateralAsset.underlyingToken;
  const debtAssetUnderlyingToken = debtAsset.underlyingToken;
  // xcDOT: 10 decimals
  const actualCollateral = collateralAsset.supplyBalance;
  // Get liquidation amount
  // USDC: 6 decimals
  let repayAmount = (debtAsset.borrowBalance * closeFactor) / SCALE_FACTOR_ONE_18_WEI;
  const penalty = await getLiquidationPenalty(collateralAsset.cToken, liquidationIncentive);
  // Scale to 18 decimals
  let liquidationValue = (repayAmount * debtAssetUnderlyingPrice) / 10n ** BigInt(debtAssetDecimals);
  // 18 decimals
  let seizeValue = (liquidationValue * penalty) / SCALE_FACTOR_ONE_18_WEI;
  // xcDOT: 10 decimals
  let seizeAmount =
    (seizeValue * // 18 decimals
      SCALE_FACTOR_ONE_18_WEI) /
    collateralAssetUnderlyingPrice / // -> 36 decimals // -> 18 decimals
    SCALE_FACTOR_UNDERLYING_DECIMALS(collateralAsset); // -> decimals
  // Check if actual collateral is too low to seize seizeAmount; if so, recalculate liquidation amount
  if (seizeAmount > actualCollateral) {
    // 10 decimals
    seizeAmount = actualCollateral;
    // 18 decimals
    seizeValue =
      (seizeAmount *
        // 28 decimals
        collateralAssetUnderlyingPrice) /
      // 18 decimals
      BigInt(10) ** BigInt(collateralAssetDecimals);
    // 18 decimals
    liquidationValue = (seizeValue * SCALE_FACTOR_ONE_18_WEI) / penalty;
    // 18 decimals
    repayAmount =
      (liquidationValue * SCALE_FACTOR_ONE_18_WEI) /
      debtAssetUnderlyingPrice /
      SCALE_FACTOR_UNDERLYING_DECIMALS(debtAsset);
  }
  if (repayAmount <= 0n) {
    logger.info("Liquidation amount is zero, doing nothing");
    return undefined;
  }
  return {
    borrower: borrower.account,
    repayAmount,
    cErc20: borrower.debt[0].cToken as Address,
    cTokenCollateral: borrower.collateral[0].cToken as Address,
    collateralAssetUnderlyingToken,
    debtAssetUnderlyingToken,
  };
};

const liquidateUsers = async (poolUsers: PoolUserStruct[], pool: PublicPoolUserWithData, botType: BotType) => {
  let i: number = 0;
  const liquidations = [];
  const errors = [];
  for (const user of poolUsers) {
    try {
      const userAssets = await client.simulateContract({
        abi: poolLensAbi,
        address: sdk.contracts.PoolLens.address,
        functionName: "getPoolAssetsByUser",
        args: [pool.comptroller, user.account],
      });
      const userWithAssets = {
        ...user,
        debt: [],
        collateral: [],
        assets: userAssets.result as ExtendedPoolAssetStructOutput[],
      };

      if (botType == BotType.Standard) {
        const liquidationParams = await getPotentialLiquidation(
          userWithAssets,
          pool.closeFactor,
          pool.liquidationIncentive
        );

        if (!liquidationParams) {
          logger.warn("Liquidation params are undefined, doing nothing");
          continue;
        }

        const url = `https://li.quest/v1/quote/toAmount?fromChain=${config.chainId}&toChain=${config.chainId}&fromToken=${liquidationParams.collateralAssetUnderlyingToken}&toToken=${liquidationParams.debtAssetUnderlyingToken}&fromAddress=${sdk.contracts.IonicLiquidator.address}&toAddress=${sdk.contracts.IonicLiquidator.address}&toAmount=${liquidationParams.repayAmount}&fee=0`;

        const options = {
          method: "GET",
          headers: {
            "x-lifi-api-key": process.env.LIFIAPIKEY || "",
          },
        };

        const data = await fetch(url, options);
        const json = await data.json();
        if (!json.transactionRequest) {
          logger.error(`Quote not received for liquidation ${JSON.stringify(liquidationParams)}, url: ${url}`);
          continue;
        }
        try {
          // ... existing quote fetching code ...

          const tx = await walletClient.writeContract({
            address: sdk.contracts.IonicLiquidator.address,
            abi: ionicUniV3LiquidatorAbi,
            functionName: "safeLiquidateWithAggregator",
            args: [
              liquidationParams.borrower,
              liquidationParams.repayAmount,
              liquidationParams.cErc20,
              liquidationParams.cTokenCollateral,
              json.transactionRequest.to,
              json.transactionRequest.data,
            ],
            chain: walletClient.chain,
          });

          logger.info(`Liquidation tx: ${tx}`);

          try {
            // Wait for transaction receipt
            const receipt = await sdk.publicClient.waitForTransactionReceipt({
              hash: tx,
            });

            // Create simplified receipt for Discord
            const simplifiedReceipt = {
              transactionHash: receipt.transactionHash,
              contractAddress: sdk.contracts.IonicLiquidator.address,
              from: receipt.from,
              to: receipt.to,
              status: receipt.status,
            };

            if (receipt.status === "success") {
              // Format success message
              // const successMsg = `Transaction Hash: ${receipt.transactionHash}\n` +
              const successMsg =
                `Transaction Hash: ${
                  config.chainName === "mode"
                    ? `[${receipt.transactionHash}](https://explorer.mode.network/tx/${receipt.transactionHash})`
                    : `[${receipt.transactionHash}](https://basescan.org/tx/${receipt.transactionHash})`
                }\n` +
                //  `Contract Address: ${sdk.contracts.IonicLiquidator.address}\n` +
                `From: ${receipt.from}\n` +
                `To: ${receipt.to}\n` +
                `Borrower: ${liquidationParams.borrower}\n` +
                `Repay Amount: ${liquidationParams.repayAmount.toString()}\n` +
                `Block: ${receipt.blockNumber}\n` +
                `Gas Used: ${receipt.gasUsed}\n`;
              +`Status: **${receipt.status}**\n`;

              // Send success notification
              await discordService.sendLiquidationSuccess([simplifiedReceipt], successMsg);
              liquidations.push({
                type: BotType.Standard,
                liquidationParams,
                tx,
              });
            } else {
              // Send failure notification
              await discordService.sendLiquidationFailure(
                { liquidations: [liquidationParams] } as any,
                `Transaction failed with status: ${receipt.status}`
              );
            }
          } catch (error: any) {
            // Handle transaction confirmation error
            logger.error(`Transaction confirmation failed: ${error.message}`);
            await discordService.sendLiquidationFailure(
              { liquidations: [liquidationParams] } as any,
              `Transaction confirmation failed: ${error.message}`
            );
          }
        } catch (error: any) {
          // Handle transaction submission error
          logger.error(`Failed to submit liquidation: ${error.message}`);
          await discordService.sendLiquidationFailure(
            { liquidations: [liquidationParams] } as any,
            `Transaction submission failed: ${error.message}`
          );
        }
      } else {
        const liquidationParams = await getPotentialPythLiquidation(userWithAssets, pool.closeFactor, pool.comptroller);
        if (!liquidationParams) {
          logger.info("Liquidation params are undefined, doing nothing");
          continue;
        }
        logger.info(`--------------------------------------------------------`);
        logger.info(`Borrower Address: ${liquidationParams.borrower}`);
        logger.info(`Repay Amount: ${liquidationParams.repayAmount.toString()}`);
        logger.info(`cErc20 Address: ${liquidationParams.cErc20}`);
        logger.info(`cToken Collateral Address: ${liquidationParams.cTokenCollateral}`);
        logger.info(`Minimum Output Amount: ${liquidationParams.underlyingAmountSeized.toString()}`);

        if (liquidationParams.collateralAssetUnderlyingToken && liquidationParams.debtAssetUnderlyingToken) {
          logger.info(
            `Buying Token (Underlying): ${
              liquidationParams.collateralAssetUnderlyingToken
            }, Amount: ${liquidationParams.underlyingAmountSeized.toString()}`
          );
          logger.info(
            `Selling Token (Underlying): ${
              liquidationParams.debtAssetUnderlyingToken
            }, Amount: ${liquidationParams.repayAmount.toString()}`
          );

          const calldata = encodeFunctionData({
            abi: ionicLiquidatorAbi,
            functionName: "safeLiquidatePyth",
            args: [
              liquidationParams.borrower,
              liquidationParams.repayAmount,
              liquidationParams.cErc20,
              liquidationParams.cTokenCollateral,
              0n,
            ],
          });
          logger.info(`Calldata: ${calldata}`);

          const permissionkeyPayload = encodeAbiParameters(
            [{ type: "address", name: "borrower" }],
            [liquidationParams.borrower]
          );
          const permissionKey = encodeAbiParameters(
            [
              { type: "address", name: "contract" },
              { type: "bytes", name: "vaultId" },
            ],
            [sdk.contracts.IonicLiquidator.address, permissionkeyPayload]
          );
          logger.info(`Permission Key: ${permissionKey}`);

          const opportunity: OpportunityParams = {
            chainId: config.chainName,
            targetContract: sdk.contracts.IonicLiquidator.address,
            targetCalldata: calldata as `0x${string}`,
            permissionKey: permissionKey as `0x${string}`,
            targetCallValue: BigInt(0),
            buyTokens: [
              {
                token: liquidationParams.collateralAssetUnderlyingToken as `0x${string}`,
                amount: BigInt(liquidationParams.underlyingAmountSeized.toString()),
              },
            ],
            sellTokens: [
              {
                token: liquidationParams.debtAssetUnderlyingToken as `0x${string}`,
                amount: BigInt(liquidationParams.repayAmount.toString()),
              },
            ],
          };

          logger.info("Opportunity:", JSON.stringify(opportunity, null, 2));

          await pythClient.submitOpportunity(opportunity);
          logger.info("Opportunity submitted successfully:", opportunity);
          await sendDiscordNotification(opportunity);

          liquidations.push({
            type: BotType.Pyth,
            liquidationParams,
            opportunity,
          });
        }
      }
      logger.info(`${++i}/${poolUsers.length}`);
    } catch (e) {
      logger.error(
        `Error while liquidating user ${JSON.stringify(user)}, comptroller: ${pool.comptroller}... Error: ${e}`
      );
      errors.push({
        comptroller: pool.comptroller,
        user: user,
        error: {
          message: (e as Error).message,
          stack: (e as Error).stack,
        },
      });
    }
  }
  return { liquidations, errors };
};

async function gatherLiquidationsFromPoolsAndLiquidate(pools: Array<PublicPoolUserWithData>, botType: BotType) {
  const liquidations = [];
  const errors = [];
  for (const pool of pools) {
    const { liquidations: _liquidations, errors: _errors } = await liquidateUsers(pool.users, pool, botType);
    if (_liquidations.length > 0) {
      liquidations.push({
        comptroller: pool.comptroller,
        liquidations: _liquidations,
      });
    }
    if (_errors.length > 0) {
      errors.push({
        comptroller: pool.comptroller,
        errors: _errors,
      });
    }
  }
  return { liquidations, errors };
}

const fetchAndLiquidate = async (botType: BotType) => {
  // Get potential liquidations from public pools
  const { validPools } = await getPoolsAndUsers(botType);

  const { liquidations, errors } = await gatherLiquidationsFromPoolsAndLiquidate(validPools, botType);

  return { liquidations, errors };
};

export const liquidatePositions = async (botType: BotType) => {
  const { liquidations, errors } = await fetchAndLiquidate(botType);

  logger.info(`Processed liquidations: ${JSON.stringify(liquidations, null, 2)}`);
  if (errors.length > 0) {
    logger.error(`Errored liquidations: ${JSON.stringify(errors, null, 2)}`);
  }
};
