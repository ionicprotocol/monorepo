import { createPublicClient, createWalletClient, fallback, Hex, http, WalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

import config from "./config";
import { Liquidator } from "./services";
import { LiquidatablePool } from "@ionicprotocol/sdk";
import { setUpSdk } from "./utils";

// Mock the liquidatePositions function
const liquidatePositions = async (liquidator: Liquidator,  options?: { blockNumber?: bigint; }) => {
  const blockNumber = options?.blockNumber;
  console.log("Block number for liquidation:", blockNumber);
  const { logger } = liquidator.sdk;

  // Hardcoded liquidation data without unsupported properties
  const dummyLiquidation: LiquidatablePool = {
    comptroller: '0x8Fb3D4a94D0aA5D6EDaAC3Ed82B59a27f56d923a',
    liquidations: [
      {
        borrower: '0x88dFF072a2ad3880268Ad15BC647Aa4fb71cb7fB',
        repayAmount: BigInt(3014530), // Adjust based on expected type
        cErc20: '0x4341620757Bee7EB4553912FaFC963e59C949147',
        cTokenCollateral: '0x3120B4907851cc9D780eef9aF88ae4d5360175Fd',
        minProfitAmount: BigInt(0),
        flashSwapContract: '0x468cC91dF6F669CaE6cdCE766995Bd7874052FBc',
        redemptionStrategies: ['0x5cA3fd2c285C4138185Ef1BdA7573D415020F3C8'],
        strategyData: [
          '0x000000000000000000000000d988097fb8612cc24eec14542bc03424c656005f000000000000000000000000ac48fcf1049668b285f3dc72483df5ae2162f7e8'
        ],
        debtFundingStrategies: [],
        debtFundingStrategiesData: []
      },
      {
        borrower: '0xF91bb6A963D870EF53Fdd77af3BB341366725dD8',
        repayAmount: BigInt(4688498), // Adjust based on expected type
        cErc20: '0xc53edEafb6D502DAEC5A7015D67936CEa0cD0F52',
        cTokenCollateral: '0xDb8eE6D1114021A94A045956BBeeCF35d13a30F2',
        minProfitAmount: BigInt(0),
        flashSwapContract: '0x468cC91dF6F669CaE6cdCE766995Bd7874052FBc',
        redemptionStrategies: ['0x5cA3fd2c285C4138185Ef1BdA7573D415020F3C8'],
        strategyData: [
          '0x000000000000000000000000d988097fb8612cc24eec14542bc03424c656005f000000000000000000000000ac48fcf1049668b285f3dc72483df5ae2162f7e8'
        ],
        debtFundingStrategies: [],
        debtFundingStrategiesData: []
      }
    ]
  };

  // Log the dummy liquidation details
  logger.info(
    `Liquidating pool: ${dummyLiquidation.comptroller} -- ${dummyLiquidation.liquidations.length} liquidations found`
  );

  // Simulate liquidating the pool using the hardcoded data
  await liquidator.liquidate(dummyLiquidation);

  logger.info("Dummy liquidation process completed.");
};

const run = async () => {
  try {
    const account = privateKeyToAccount(config.adminPrivateKey as Hex);

    // Create public and wallet clients
    const client = createPublicClient({
      chain: base,
      transport: fallback(config.rpcUrls.map((url) => http(url))),
    });

    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: fallback(config.rpcUrls.map((url) => http(url))),
    });

    // Set up the SDK with the correct chain and clients
    const sdk = setUpSdk(config.chainId, client as any, walletClient);

    // Initialize the Liquidator
    const liquidator = new Liquidator(sdk);

    sdk.logger.info(`Starting liquidation bot on chain: ${config.chainId}`);
    sdk.logger.info(
      `Config for bot: ${JSON.stringify({ ...sdk.chainLiquidationConfig, ...config, adminPrivateKey: "***********" })}`
    );

    // Run the dummy liquidation process
    await liquidatePositions(liquidator);

    sdk.logger.info("Dummy liquidation process completed.");
  } catch (error) {
    console.error("Error occurred during liquidation:", error);
  }
};

run();
