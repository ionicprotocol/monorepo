import { task } from "hardhat/config";
import { Address, encodeFunctionData } from "viem";
import { addTransaction, prepareAndLogTransaction } from "../../chainDeploy/helpers/logging";
import { chainIdToConfig } from "@ionicprotocol/chains";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { LeveragePair } from "../../chainDeploy";

export default task("levered-positions:configure-pairs").setAction(
  async ({}, { viem, getChainId, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    console.log("deployer: ", deployer);
    const chainId = parseInt(await getChainId());
    const leveredPairsConfig = chainIdToConfig[chainId].leveragePairs;

    for (const pool of leveredPairsConfig) {
      await configureLeveredPairs({
        viem,
        deployments,
        deployer: deployer as Address,
        leveredPairs: pool.pairs
      });
    }
  }
);

export const configureLeveredPairs = async ({
  viem,
  deployments,
  deployer,
  leveredPairs,
  whitelisted = true
}: {
  viem: HardhatRuntimeEnvironment["viem"];
  deployments: HardhatRuntimeEnvironment["deployments"];
  deployer: Address;
  leveredPairs: LeveragePair[];
  whitelisted?: boolean;
}) => {
  const publicClient = await viem.getPublicClient();
  const factory = await viem.getContractAt(
    "ILeveredPositionFactory",
    (await deployments.get("LeveredPositionFactory")).address as Address
  );
  const configuredCollateralMarkets = await factory.read.getWhitelistedCollateralMarkets();

  console.log(`Collateral markets already configured: ${configuredCollateralMarkets.join(", ")}`);

  for (const pair of leveredPairs) {
    const { collateral, borrow } = pair;

    const collateralMarket = await viem.getContractAt("CErc20Delegate", collateral);
    const borrowMarket = await viem.getContractAt("CErc20Delegate", borrow);

    const collateralToken = await collateralMarket.read.underlying();
    const borrowToken = await borrowMarket.read.underlying();

    const configuredBorrowableMarkets = await factory.read.getBorrowableMarketsByCollateral([collateral]);
    console.log(
      `Borrow markets already configured for collateral ${collateral}: ${configuredBorrowableMarkets.join(", ")}`
    );

    // check if borrow market is already configured
    if (configuredBorrowableMarkets.includes(borrow) && configuredCollateralMarkets.includes(collateral)) {
      console.log(
        `Borrow (market: ${borrow}, underlying: ${borrowToken}) is already configured for collateral (market: ${collateral}, underlying: ${collateralToken})`
      );
      continue;
    } else {
      console.log(
        `Configuring pair:\n - BORROW (market: ${borrow}, underlying: ${borrowToken})\n - COLLATERAL: (market: ${collateral}, underlying: ${collateralToken})`
      );

      const owner = await factory.read.owner();
      if (owner.toLowerCase() !== deployer.toLowerCase()) {
        console.log(
          `adding transaction to set pair as whitelisted: BORROW (market: ${borrow}, underlying: ${borrowToken}) - COLLATERAL: (market: ${collateral}, underlying: ${collateralToken})`
        );
        await prepareAndLogTransaction({
          contractInstance: factory,
          functionName: "_setPairWhitelisted",
          args: [collateral, borrow, whitelisted],
          description: `Configuring pair: BORROW (market: ${borrow}, underlying: ${borrowToken}) - COLLATERAL: (market: ${collateral}, underlying: ${collateralToken})`,
          inputs: [
            { internalType: "address", name: "_collateralMarket", type: "address" },
            { internalType: "address", name: "_stableMarket", type: "address" },
            { internalType: "bool", name: "whitelisted", type: "bool" }
          ]
        });
      } else {
        const tx = await factory.write._setPairWhitelisted([collateral, borrow, whitelisted]);
        await publicClient.waitForTransactionReceipt({ hash: tx, confirmations: 2 });
        console.log(
          `configured the markets pair:\n - BORROW (market: ${borrow}, underlying: ${borrowToken})\n - COLLATERAL: (market: ${collateral}, underlying: ${collateralToken}) as whitelisted for levered positions: ${tx}`
        );
      }
    }
  }
};
