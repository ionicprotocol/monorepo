import { task } from "hardhat/config";
import { Address, encodeFunctionData } from "viem";
import { addTransaction } from "../../chainDeploy/helpers/logging";
import { chainIdToConfig } from "@ionicprotocol/chains";

export default task("levered-positions:configure-pairs").setAction(
  async ({}, { viem, getChainId, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    console.log("deployer: ", deployer);
    const publicClient = await viem.getPublicClient();
    const chainId = parseInt(await getChainId());
    const leveredPairsConfig = chainIdToConfig[chainId].leveragePairs;

    const factory = await viem.getContractAt(
      "ILeveredPositionFactory",
      (await deployments.get("LeveredPositionFactory")).address as Address
    );
    const configuredCollateralMarkets = await factory.read.getWhitelistedCollateralMarkets();

    console.log(`Collateral markets already configured: ${configuredCollateralMarkets.join(", ")}`);

    for (const pool of leveredPairsConfig) {
      console.log(`Configuring pairs for pool: ${pool.pool}`);

      for (const pair of pool.pairs) {
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
            addTransaction({
              to: factory.address,
              value: "0",
              data: encodeFunctionData({
                abi: factory.abi,
                functionName: "_setPairWhitelisted",
                args: [collateral, borrow, true]
              }),
              contractMethod: null,
              contractInputsValues: null
            });
          } else {
            const tx = await factory.write._setPairWhitelisted([collateral, borrow, true]);
            await publicClient.waitForTransactionReceipt({ hash: tx, confirmations: 2 });
            console.log(
              `configured the markets pair:\n - BORROW (market: ${borrow}, underlying: ${borrowToken})\n - COLLATERAL: (market: ${collateral}, underlying: ${collateralToken}) as whitelisted for levered positions: ${tx}`
            );
          }
        }
      }
    }
  }
);
