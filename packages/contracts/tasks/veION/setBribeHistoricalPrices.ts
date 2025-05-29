import { task, types } from "hardhat/config";
import { assetFilter } from "../../chainDeploy/helpers/utils";
import { Address, formatEther, parseUnits, zeroAddress } from "viem";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("bribes:accept-ownership", "accept ownership").setAction(
  async (taskArgs, { viem, getNamedAccounts, deployments, getChainId }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    const voterLens = await viem.getContractAt("VoterLens", (await deployments.get("VoterLens")).address as Address);
    const bribes = await voterLens.read.getAllBribes();

    for (const bribe of bribes) {
      const { bribeSupply, bribeBorrow } = bribe;

      if (bribeSupply === zeroAddress || bribeBorrow === zeroAddress) {
        console.log(`🔍 BribeSupply or BribeBorrow is zero address, skipping...`);
        continue;
      }

      const bribeSupplyContract = await viem.getContractAt("BribeRewards", bribeSupply as Address);
      const bribeBorrowContract = await viem.getContractAt("BribeRewards", bribeBorrow as Address);

      const currentOwner = await bribeSupplyContract.read.owner();
      console.log(`🔍 BribeSupply owner: ${currentOwner}`);
      if (currentOwner !== deployer) {
        const pendingOwner = await bribeSupplyContract.read.pendingOwner();
        console.log(`🔍 BribeSupply pendingOwner: ${pendingOwner}`);
        if (pendingOwner !== deployer) {
          console.log(`🔍 BribeSupply pendingOwner is not deployer, skipping...`);
          continue;
        }

        const tx = await bribeSupplyContract.write.acceptOwnership();
        const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`✅ Successfully accepted ownership for bribeSupply: ${bribeSupply}: ${receipt.transactionHash}`);
      } else {
        console.log(`🔍 BribeSupply already owned by deployer Skipping...`);
      }

      const currentOwner2 = await bribeBorrowContract.read.owner();
      console.log(`🔍 BribeBorrow owner: ${currentOwner2}`);
      if (currentOwner2 !== deployer) {
        const pendingOwner2 = await bribeBorrowContract.read.pendingOwner();
        console.log(`🔍 BribeBorrow pendingOwner: ${pendingOwner2}`);
        if (pendingOwner2 !== deployer) {
          console.log(`🔍 BribeBorrow pendingOwner is not deployer, skipping...`);
          continue;
        }

        const tx2 = await bribeBorrowContract.write.acceptOwnership();
        const receipt2 = await publicClient.waitForTransactionReceipt({ hash: tx2 });
        console.log(`✅ Successfully accepted ownership for bribeBorrow: ${bribeBorrow}: ${receipt2.transactionHash}`);
      } else {
        console.log(`🔍 BribeBorrow already owned by deployer Skipping...`);
      }
    }
  }
);

const setHistoricalPrices = async (
  lpToken: Address,
  epochStart: bigint[],
  {
    viem,
    deployments
  }: { viem: HardhatRuntimeEnvironment["viem"]; deployments: HardhatRuntimeEnvironment["deployments"] }
) => {
  const publicClient = await viem.getPublicClient();
  const voterLens = await viem.getContractAt("VoterLens", (await deployments.get("VoterLens")).address as Address);

  const bribes = await voterLens.read.getAllBribes();

  const masterPriceOracle = await viem.getContractAt(
    "MasterPriceOracle",
    (await deployments.get("MasterPriceOracle")).address as Address
  );

  const price = await masterPriceOracle.read.price([lpToken]);

  for (const bribe of bribes) {
    const { bribeSupply, bribeBorrow } = bribe;

    for (let i = 0; i < epochStart.length; i++) {
      const epochTimestamp = epochStart[i];

      try {
        // Check if historical price is already set for bribeSupply
        const bribeSupplyContract = await viem.getContractAt("BribeRewards", bribeSupply as Address);
        const historicalPricesSupply = await bribeSupplyContract.read.historicalPrices([lpToken, epochTimestamp]);
        if (historicalPricesSupply != 0n) {
          console.log(
            `🔍 Historical price already set for bribeSupply at epoch ${epochTimestamp} Price ${historicalPricesSupply} for contract ${bribeSupply} Skipping...`
          );
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }

        // Set historical price for bribeSupply
        const bribeSupplyTx = await bribeSupplyContract.write.setHistoricalPrices([epochTimestamp, lpToken, price]);
        const bribeSupplyReceipt = await publicClient.waitForTransactionReceipt({ hash: bribeSupplyTx });
        console.log(
          `✅ Successfully set historical price for bribeSupply at epoch ${epochTimestamp} for ${bribeSupply}:`,
          bribeSupplyReceipt.transactionHash
        );

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Failed to set historical price for bribeSupply at epoch ${epochTimestamp}:`, error);
      }

      try {
        // Check if historical price is already set for bribeBorrow
        const bribeBorrowContract = await viem.getContractAt("BribeRewards", bribeBorrow as Address);
        const historicalPricesBorrow = await bribeBorrowContract.read.historicalPrices([lpToken, epochTimestamp]);
        if (historicalPricesBorrow != 0n) {
          console.log(
            `🔍 Historical price already set for bribeBorrow at epoch ${epochTimestamp}, Price: ${historicalPricesBorrow} for contract ${bribeBorrow} Skipping...`
          );
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }

        // Set historical price for bribeBorrow
        const bribeBorrowTx = await bribeBorrowContract.write.setHistoricalPrices([epochTimestamp, lpToken, price]);
        const bribeBorrowReceipt = await publicClient.waitForTransactionReceipt({ hash: bribeBorrowTx });
        console.log(
          `✅ Successfully set historical price for bribeBorrow at epoch ${epochTimestamp} for ${bribeBorrow}:`,
          bribeBorrowReceipt.transactionHash
        );

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Failed to set historical price for bribeBorrow at epoch ${epochTimestamp}:`, error);
      }
    }
  }
};

task("bribes:setHistoricalPrices:mode", "set prices").setAction(async (taskArgs, { viem, deployments }) => {
  await setHistoricalPrices("0x690A74d2eC0175a69C0962B309E03021C0b5002E", [1748495055n], {
    viem,
    deployments
  });
});

task("bribes:setHistoricalPrices:base", "set prices").setAction(async (taskArgs, { viem, deployments }) => {
  await setHistoricalPrices("0x0FAc819628a7F612AbAc1CaD939768058cc0170c", [1748495055n], {
    viem,
    deployments
  });
});

task("bribes:setHistoricalPriceSingle", "set prices").setAction(
  async (taskArgs, { viem, getNamedAccounts, deployments, getChainId }) => {
    const publicClient = await viem.getPublicClient();

    const lpToken = "0x0FAc819628a7F612AbAc1CaD939768058cc0170c";

    const bribeRewards1 = await viem.getContractAt("BribeRewards", "0xF261FE42877c5255Ce051B10604c5ECED5675e91");
    const bribeRewards2 = await viem.getContractAt("BribeRewards", "0x7DceCa7710838D7f6A5BfF4d76bb172284aac397");

    console.log(`Sending transaction to set historical price for bribeRewards1 at epoch 1739404800`);
    const bribeTx1 = await bribeRewards1.write.setHistoricalPrices(["1739404800", lpToken, "1930803084600000"]);
    console.log(`Transaction sent: ${bribeTx1}`);
    const bribeReceipt1 = await publicClient.waitForTransactionReceipt({ hash: bribeTx1 });
    console.log(
      `✅ Successfully set historical price for bribeRewards1 at epoch 1739404800:`,
      bribeReceipt1.transactionHash
    );

    console.log(`Sending transaction to set historical price for bribeRewards1 at epoch 1740009600`);
    const bribeTx2 = await bribeRewards1.write.setHistoricalPrices(["1740009600", lpToken, "1809972509300000"]);
    console.log(`Transaction sent: ${bribeTx2}`);
    const bribeReceipt2 = await publicClient.waitForTransactionReceipt({ hash: bribeTx2 });
    console.log(
      `✅ Successfully set historical price for bribeRewards1 at epoch 1740009600:`,
      bribeReceipt2.transactionHash
    );

    console.log(`Sending transaction to set historical price for bribeRewards2 at epoch 1736985600`);
    const bribeTx3 = await bribeRewards2.write.setHistoricalPrices(["1736985600", lpToken, "3243455187900000"]);
    console.log(`Transaction sent: ${bribeTx3}`);
    const bribeReceipt3 = await publicClient.waitForTransactionReceipt({ hash: bribeTx3 });
    console.log(
      `✅ Successfully set historical price for bribeRewards2 at epoch 1736985600:`,
      bribeReceipt3.transactionHash
    );

    console.log(`Sending transaction to set historical price for bribeRewards2 at epoch 1737590400`);
    const bribeTx4 = await bribeRewards2.write.setHistoricalPrices(["1737590400", lpToken, "2986637125500000"]);
    console.log(`Transaction sent: ${bribeTx4}`);
    const bribeReceipt4 = await publicClient.waitForTransactionReceipt({ hash: bribeTx4 });
    console.log(
      `✅ Successfully set historical price for bribeRewards2 at epoch 1737590400:`,
      bribeReceipt4.transactionHash
    );
  }
);
