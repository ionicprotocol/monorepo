import { task, types } from "hardhat/config";
import { assetFilter } from "../../chainDeploy/helpers/utils";
import { Address, formatEther, parseUnits } from "viem";

task("bribes:setHistoricalPrices", "set prices").setAction(
  async (taskArgs, { viem, getNamedAccounts, deployments, getChainId }) => {
    const publicClient = await viem.getPublicClient();
    const voterLens = await viem.getContractAt("VoterLens", (await deployments.get("VoterLens")).address as Address);

    const bribes = await voterLens.read.getAllBribes();

    const epochStart = [
      1736985600, 1737590400, 1738195200, 1738800000, 1739404800, 1740009600, 1740614400, 1741219200, 1741824000
    ];

    const ionWethPrice = [
      3243455187900000, 2986637125500000, 2622975603700000, 2009975272900000, 1930803084600000, 1809972509300000,
      1743559706300000, 1544020839400000, 1512613743900000
    ];

    const lpToken = "0x0FAc819628a7F612AbAc1CaD939768058cc0170c";

    for (const bribe of bribes) {
      const { bribeSupply, bribeBorrow } = bribe;

      for (let i = 0; i < epochStart.length; i++) {
        const epochTimestamp = epochStart[i];
        const price = ionWethPrice[i];

        try {
          // Set historical price for bribeSupply
          const bribeSupplyContract = await viem.getContractAt("BribeRewards", bribeSupply as Address);
          const bribeSupplyTx = await bribeSupplyContract.write.setHistoricalPrices([epochTimestamp, lpToken, price]);

          const bribeSupplyReceipt = await publicClient.waitForTransactionReceipt({ hash: bribeSupplyTx });
          console.log(
            `✅ Successfully set historical price for bribeSupply at epoch ${epochTimestamp} for ${bribeSupply}:`,
            bribeSupplyReceipt.transactionHash
          );
        } catch (error) {
          console.error(`❌ Failed to set historical price for bribeSupply at epoch ${epochTimestamp}:`, error);
        }

        try {
          // Set historical price for bribeBorrow
          const bribeBorrowContract = await viem.getContractAt("BribeRewards", bribeBorrow as Address);
          const bribeBorrowTx = await bribeBorrowContract.write.setHistoricalPrices([epochTimestamp, lpToken, price]);

          const bribeBorrowReceipt = await publicClient.waitForTransactionReceipt({ hash: bribeBorrowTx });
          console.log(
            `✅ Successfully set historical price for bribeBorrow at epoch ${epochTimestamp} for ${bribeBorrow}:`,
            bribeBorrowReceipt.transactionHash
          );
        } catch (error) {
          console.error(`❌ Failed to set historical price for bribeBorrow at epoch ${epochTimestamp}:`, error);
        }
      }
    }
  }
);
