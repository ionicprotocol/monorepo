import { task, types } from "hardhat/config";
import { assetFilter } from "../../chainDeploy/helpers/utils";
import { Address, formatEther, parseEther, parseUnits } from "viem";
import { chainDeployConfig, ChainDeployConfig } from "../../chainDeploy";

task("bribes:accept-ownership", "accept ownership").setAction(
  async (taskArgs, { viem, getNamedAccounts, deployments, getChainId }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    const voterLens = await viem.getContractAt("VoterLens", (await deployments.get("VoterLens")).address as Address);
    const bribes = await voterLens.read.getAllBribes();

    const epochStart = [1746057600];

    const ionWethPrice = [2353683912200];

    const lpToken = "0x690A74d2eC0175a69C0962B309E03021C0b5002E";

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

        try {
          // Check if historical price is already set for bribeBorrow
          const bribeBorrowContract = await viem.getContractAt("BribeRewards", bribeBorrow as Address);
          const historicalPricesBorrow = await bribeBorrowContract.read.historicalPrices([lpToken, epochTimestamp]);
          if (historicalPricesBorrow != 0) {
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
  }
);

task("bribes:checkPrices", "view prices").setAction(
  async (taskArgs, { viem, getNamedAccounts, deployments, getChainId }) => {
    const publicClient = await viem.getPublicClient();
    const voterLens = await viem.getContractAt("VoterLens", (await deployments.get("VoterLens")).address as Address);

    const bribes = await voterLens.read.getAllBribes();

    const epochStart = [1748476800];
    const lpToken = "0x0FAc819628a7F612AbAc1CaD939768058cc0170c";

    for (const bribe of bribes) {
      const { bribeSupply, bribeBorrow } = bribe;
      console.log(`Market: ${bribe.market}---------------------------------------------`);

      for (let i = 0; i < epochStart.length; i++) {
        const epochTimestamp = epochStart[i];

        try {
          // Check if historical price is already set for bribeSupply
          const bribeSupplyContract = await viem.getContractAt("BribeRewards", bribeSupply as Address);
          const historicalPricesSupply = await bribeSupplyContract.read.historicalPrices([lpToken, epochTimestamp]);
          if (historicalPricesSupply != 0) {
            console.log(
              `🔍 Historical price already set for bribeSupply at epoch ${epochTimestamp} Price ${historicalPricesSupply} for contract ${bribeSupply} for market ${bribe.market} Skipping...`
            );
          } else {
            console.log(
              `❌  Historical price NOT set for bribeSupply at epoch ${epochTimestamp} Price ${historicalPricesSupply} for contract ${bribeSupply} for market ${bribe.market}  Skipping...`
            );
          }
        } catch (error) {
          console.error(
            `❌ Failed to set historical price for contract ${bribeSupply} for market ${bribe.market} at epoch ${epochTimestamp}:`
          );
        }

        try {
          // Check if historical price is already set for bribeBorrow
          const bribeBorrowContract = await viem.getContractAt("BribeRewards", bribeBorrow as Address);
          const historicalPricesBorrow = await bribeBorrowContract.read.historicalPrices([lpToken, epochTimestamp]);
          if (historicalPricesBorrow != 0) {
            console.log(
              `🔍 Historical price already set for bribeBorrow at epoch ${epochTimestamp}, Price: ${historicalPricesBorrow} for contract ${bribeBorrow} for market ${bribe.market} Skipping...`
            );
          } else {
            console.log(
              `❌  Historical price NOT set for bribeSupply at epoch ${epochTimestamp} Price ${historicalPricesBorrow} for contract ${bribeBorrow} for market ${bribe.market} Skipping...`
            );
          }
        } catch (error) {
          console.error(
            `❌ Failed to set historical price for contract ${bribeBorrow} for market ${bribe.market} at epoch ${epochTimestamp}:`
          );
        }
      }
      console.log("\n");
    }
  }
);

task("bribes:transferOwnership", "transfer ownership").setAction(
  async (taskArgs, { viem, getNamedAccounts, deployments, getChainId }) => {
    const publicClient = await viem.getPublicClient();
    const voterLens = await viem.getContractAt("VoterLens", (await deployments.get("VoterLens")).address as Address);

    const bribes = await voterLens.read.getAllBribes();

    const newOwner = "0x1155b614971f16758C92c4890eD338C9e3ede6b7"; // Replace with the actual new owner address

    for (const bribe of bribes) {
      const { bribeSupply, bribeBorrow } = bribe;

      try {
        // Transfer ownership for bribeSupply
        const bribeSupplyContract = await viem.getContractAt("BribeRewards", bribeSupply as Address);
        const bribeSupplyTx = await bribeSupplyContract.write.transferOwnership([newOwner]);
        const bribeSupplyReceipt = await publicClient.waitForTransactionReceipt({ hash: bribeSupplyTx });
        console.log(
          `✅ Successfully transferred ownership for bribeSupply to ${newOwner} for ${bribeSupply}:`,
          bribeSupplyReceipt.transactionHash
        );

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Failed to transfer ownership for bribeSupply:`, error);
      }

      try {
        // Transfer ownership for bribeBorrow
        const bribeBorrowContract = await viem.getContractAt("BribeRewards", bribeBorrow as Address);
        const bribeBorrowTx = await bribeBorrowContract.write.transferOwnership([newOwner]);
        const bribeBorrowReceipt = await publicClient.waitForTransactionReceipt({ hash: bribeBorrowTx });
        console.log(
          `✅ Successfully transferred ownership for bribeBorrow to ${newOwner} for ${bribeBorrow}:`,
          bribeBorrowReceipt.transactionHash
        );

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Failed to transfer ownership for bribeBorrow:`, error);
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

task("voter:setHistoricalPricesRange", "set historical prices over a range on Voter contract").setAction(
  async (taskArgs, { viem, getNamedAccounts, deployments, getChainId }) => {
    const publicClient = await viem.getPublicClient();
    const lpToken = "0x690A74d2eC0175a69C0962B309E03021C0b5002E";

    const voter = await viem.getContractAt("Voter", "0x141F7f2aa313Ff4C60Dd58fDe493aA2048170429");

    const startEpoch = 1735776000;
    const endEpoch = 1749081600;
    const increment = 604800;

    for (let epoch = startEpoch; epoch <= endEpoch; epoch += increment) {
      console.log(`Sending transaction to set historical price on Voter contract at epoch ${epoch}`);
      const voterTx = await voter.write.setHistoricalPrices([BigInt(epoch), lpToken, BigInt("1000000000000000000")]);
      console.log(`Transaction sent: ${voterTx}`);
      const voterReceipt = await publicClient.waitForTransactionReceipt({ hash: voterTx });
      console.log(
        `✅ Successfully set historical price on Voter contract at epoch ${epoch}:`,
        voterReceipt.transactionHash
      );
    }
  }
);

task("voter:setHistoricalPricesRange", "set historical prices over a range on Voter contract").setAction(
  async (taskArgs, { viem, getNamedAccounts, deployments, getChainId }) => {
    const publicClient = await viem.getPublicClient();
    const lpToken = "0x690A74d2eC0175a69C0962B309E03021C0b5002E";

    const voter = await viem.getContractAt("Voter", "0x141F7f2aa313Ff4C60Dd58fDe493aA2048170429");

    const startEpoch = 1735776000;
    const endEpoch = 1749081600;
    const increment = 604800;

    for (let epoch = startEpoch; epoch <= endEpoch; epoch += increment) {
      console.log(`Sending transaction to set historical price on Voter contract at epoch ${epoch}`);
      const voterTx = await voter.write.setHistoricalPrices([BigInt(epoch), lpToken, BigInt("1000000000000000000")]);
      console.log(`Transaction sent: ${voterTx}`);
      const voterReceipt = await publicClient.waitForTransactionReceipt({ hash: voterTx });
      console.log(
        `✅ Successfully set historical price on Voter contract at epoch ${epoch}:`,
        voterReceipt.transactionHash
      );
    }
  }
);

task("voter:setHistoricalPrice", "set historical prices over a range on Voter contract").setAction(
  async (taskArgs, { viem, getNamedAccounts, deployments, getChainId }) => {
    const publicClient = await viem.getPublicClient();

    const chainId = parseInt(await getChainId());

    const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];
    const lpToken =
      chainId === 34443 ? "0x690A74d2eC0175a69C0962B309E03021C0b5002E" : "0x0FAc819628a7F612AbAc1CaD939768058cc0170c";

    const voter = await viem.getContractAt("Voter", (await deployments.get("Voter")).address as Address);

    // Get the current Unix timestamp
    const currentTimestamp = Math.floor(Date.now() / 1000);
    // Calculate the epoch by floor dividing by 604800 and then multiplying by 604800
    const epoch = Math.floor(currentTimestamp / 604800) * 604800 + 604800;
    const previousEpoch = epoch - 604800;

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short"
    };

    const epochDate = new Date(epoch * 1000).toLocaleString("en-US", options);
    const previousEpochDate = new Date(previousEpoch * 1000).toLocaleString("en-US", options);

    const priceAtPreviousEpoch = await voter.read.historicalPrices([lpToken, BigInt(previousEpoch)]);
    console.log(`Previous epoch date: ${previousEpochDate}`);
    console.log(`Historical price at previous epoch ${previousEpoch}: ${priceAtPreviousEpoch}`);
    const priceAtEpoch = await voter.read.historicalPrices([lpToken, BigInt(epoch)]);
    console.log(`Epoch date: ${epochDate}`);
    console.log(`Current historical price at epoch ${epoch}: ${priceAtEpoch}`);

    const userResponse = await new Promise((resolve) => {
      process.stdout.write("Do you want to continue to set the price for BOTH previous and current epochs? (yes/no): ");
      process.stdin.once("data", (data) => resolve(data.toString().trim()));
    });

    if (typeof userResponse !== "string" || userResponse.toLowerCase() !== "yes") {
      console.log("Operation cancelled by user.");
      return;
    }

    console.log(`Sending transaction to set historical price on Voter contract at epoch ${epoch}`);
    const voterTx = await voter.write.setHistoricalPrices([BigInt(epoch), lpToken, BigInt("1000000000000000000")]);
    console.log(`Transaction sent: ${voterTx}`);
    const voterReceipt = await publicClient.waitForTransactionReceipt({ hash: voterTx });
    console.log(
      `✅ Successfully set historical price on Voter contract at epoch ${epoch}:`,
      voterReceipt.transactionHash
    );
  }
);

task("voter:checkRewards", "set historical prices over a range on Voter contract").setAction(
  async (taskArgs, { viem, getNamedAccounts, deployments, getChainId }) => {
    const publicClient = await viem.getPublicClient();
    const lpToken = "0x0FAc819628a7F612AbAc1CaD939768058cc0170c";

    const voter = await viem.getContractAt("Voter", "0x669A6F5421dA53696fa06f1043CF127d380f6EB9");

    const startEpoch = 1744243200;
    const endEpoch = 1749081600;
    const increment = 604800;

    const bribeRewards = await viem.getContractAt("BribeRewards", "0xe9b889c8c7A5Bbe63e5E2eEafb212cdcF1A60B9f");

    let tokenRewardPerEpoch;
    for (let epoch = startEpoch; epoch <= endEpoch; epoch += increment) {
      tokenRewardPerEpoch = BigInt(
        await bribeRewards.read.tokenRewardsPerEpoch(["0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4", BigInt(epoch)])
      );

      console.log(`Token reward for epoch ${epoch}: ${tokenRewardPerEpoch}`);
    }
  }
);

task("bribe:notifyReward", "Notify reward amount on BribeRewards contract").setAction(
  async (taskArgs, { viem, getNamedAccounts, deployments, getChainId }) => {
    const publicClient = await viem.getPublicClient();
    const { deployer } = await getNamedAccounts();

    // First approve the BribeRewards contract to spend tokens
    const tokenContract = await viem.getContractAt(
      "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
      "0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5"
    );

    const rewardAmount = BigInt("1000000000000000000"); // 1 token in wei
    const bribeRewardsAddress = "0xe9b889c8c7A5Bbe63e5E2eEafb212cdcF1A60B9f";

    console.log(`Approving BribeRewards contract to spend ${formatEther(rewardAmount)} tokens`);
    const approveTx = await tokenContract.write.approve([bribeRewardsAddress, rewardAmount]);
    console.log(`Approval transaction sent: ${approveTx}`);
    const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: approveTx });
    console.log(`✅ Successfully approved BribeRewards contract:`, approveReceipt.transactionHash);

    const bribeRewards = await viem.getContractAt("BribeRewards", "0xe9b889c8c7A5Bbe63e5E2eEafb212cdcF1A60B9f");

    // Example token address and amount - adjust these as needed
    const tokenAddress = "0x3eE5e23eEE121094f1cFc0Ccc79d6C809Ebd22e5";

    console.log(`Notifying reward amount for token: ${tokenAddress}`);
    console.log(`Reward amount: ${formatEther(rewardAmount)}`);

    const userResponse = await new Promise((resolve) => {
      process.stdout.write("Do you want to continue with notifying the reward? (yes/no): ");
      process.stdin.once("data", (data) => resolve(data.toString().trim()));
    });

    if (userResponse.toLowerCase() !== "yes") {
      console.log("Operation cancelled by user.");
      return;
    }

    console.log("Sending transaction to notify reward amount on BribeRewards contract");
    const tx = await bribeRewards.write.notifyRewardAmount([tokenAddress, rewardAmount]);
    console.log(`Transaction sent: ${tx}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`✅ Successfully notified reward amount on BribeRewards contract:`, receipt.transactionHash);
  }
);

task("voter:distribute", "set historical prices over a range on Voter contract").setAction(
  async (taskArgs, { viem, getNamedAccounts, deployments, getChainId }) => {
    const publicClient = await viem.getPublicClient();

    const voter = await viem.getContractAt("Voter", (await deployments.get("Voter")).address as Address);

    const { deployer } = await getNamedAccounts();
    const chainId = parseInt(await getChainId());

    const ionToken = await viem.getContractAt(
      "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
      chainDeployConfig[chainId].config.ION as Address
    );

    const ionBalance = BigInt(await ionToken.read.balanceOf([deployer as Address]));
    console.log(`ION balance in deployer's wallet: ${formatEther(ionBalance)} `);

    if (ionBalance > 0n) {
      console.log("Transferring ION tokens to Voter contract before distribution");
      const transferTx = await ionToken.write.transfer([voter.address, ionBalance]);
      console.log(`Transaction sent: ${transferTx}`);
      const transferReceipt = await publicClient.waitForTransactionReceipt({ hash: transferTx });
      console.log(`✅ Successfully transferred ION tokens to Voter contract:`, transferReceipt.transactionHash);
    } else {
      console.log("No ION tokens to transfer.");
    }

    console.log("Sending transaction to distribute rewards on Voter contract");
    const tx = await voter.write.distributeRewards();
    console.log(`Transaction sent: ${tx}`);
    const voterReceipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`✅ Successfully distributed rewards on Voter contract:`, voterReceipt.transactionHash);
  }
);

task("voter:upgrade", "set historical prices over a range on Voter contract").setAction(
  async (taskArgs, { viem, getNamedAccounts, deployments, getChainId }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();

    const veION = await viem.getContractAt("veION", (await deployments.get("veION")).address as Address);
    const mpo = await viem.getContractAt(
      "MasterPriceOracle",
      (await deployments.get("MasterPriceOracle")).address as Address
    );
    const chainId = parseInt(await getChainId());

    const { config: chainDeployParams }: { config: ChainDeployConfig } = chainDeployConfig[chainId];

    let voter;
    try {
      voter = await deployments.deploy("Voter", {
        from: deployer,
        log: true,
        proxy: {
          proxyContract: "OpenZeppelinTransparentProxy",
          execute: {
            init: {
              methodName: "initialize",
              args: [[chainDeployParams.ION], mpo.address, chainDeployParams.ION, veION.address]
            }
          }
          // owner: multisig
        }
      });
      if (voter.transactionHash) await publicClient.waitForTransactionReceipt({ hash: voter.transactionHash as Hash });
      console.log("voter: ", voter.address);
    } catch (error) {
      console.error("Could not deploy:", error);
    }

    voter = await viem.getContractAt("Voter", (await deployments.get("Voter")).address as Address);
  }
);

task("voter:getVoteDetails", "Get vote details for a specific token ID and LP asset")
  .addParam("tokenid", "The NFT token ID to get vote details for", undefined, types.string)
  .addParam("lpasset", "The LP asset address to get vote details for", undefined, types.string)
  .setAction(async (taskArgs, { viem, deployments }) => {
    const publicClient = await viem.getPublicClient();

    const voter = await viem.getContractAt("Voter", (await deployments.get("Voter")).address as Address);

    const tokenId = BigInt(taskArgs.tokenid);
    const lpAsset = taskArgs.lpasset as Address;

    console.log(`Getting vote details for token ID: ${tokenId} and LP asset: ${lpAsset}`);

    try {
      const voteDetails = await voter.read.getVoteDetails([tokenId, lpAsset]);

      console.log("Raw vote details result:", voteDetails);

      console.log("Vote Details:");
      console.log("=".repeat(50));
      console.log(`Token ID: ${tokenId}`);
      console.log(`LP Asset: ${lpAsset}`);
      console.log(`Used Weight: ${voteDetails.usedWeight}`);
      console.log(`Number of market votes: ${voteDetails.marketVotes.length}`);

      if (voteDetails.marketVotes.length > 0) {
        console.log("\nMarket Votes:");
        console.log("-".repeat(50));
        for (let i = 0; i < voteDetails.marketVotes.length; i++) {
          console.log(`Market ${i + 1}:`);
          console.log(`  Address: ${voteDetails.marketVotes[i]}`);
          console.log(`  Side: ${voteDetails.marketVoteSides[i] === 0 ? "Supply" : "Borrow"}`);
          console.log(`  Vote Weight: ${voteDetails.votes[i]}`);
          console.log("");
        }
      } else {
        console.log("No active votes found for this token ID and LP asset.");
      }
    } catch (error) {
      console.error("Error getting vote details:", error);
    }
  });

task("flywheel:accrueMarket", "Accrue a market on the specified Flywheel contract")
  .addParam("market", "The market (ERC20) address to accrue", undefined, types.string)
  .addParam("user", "The user address to accrue rewards for", undefined, types.string)
  .setAction(async (taskArgs, { viem }) => {
    const publicClient = await viem.getPublicClient();
    const flywheelAddress = "0xA2c2417B7ceE6A5190C5A68A6eAFB9FbE76Bd3f6";
    const market = taskArgs.market as Address;
    const user = taskArgs.user as Address;

    const flywheel = await viem.getContractAt("IonicFlywheel", flywheelAddress);

    try {
      // Use the publicClient to send the transaction
      const txHash = await flywheel.write.accrue([market, user]);
      console.log(`Accrue transaction sent! Hash: ${txHash}`);
      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      if (receipt.status === "success") {
        console.log("Accrue transaction confirmed.");
      } else {
        console.error("Accrue transaction failed:", receipt);
      }
    } catch (error) {
      console.error("Error accruing market on flywheel:", error);
    }
  });

task("voter:getTokenInfo", "Get comprehensive information for a specific token ID")
  .addParam("tokenid", "The NFT token ID to get information for", undefined, types.string)
  .setAction(async (taskArgs, { viem, deployments }) => {
    const publicClient = await viem.getPublicClient();

    const voter = await viem.getContractAt("Voter", (await deployments.get("Voter")).address as Address);
    const ve = await viem.getContractAt("IveION", (await deployments.get("veION")).address as Address);

    const tokenId = BigInt(taskArgs.tokenid);

    console.log(`Getting comprehensive information for token ID: ${tokenId}`);
    console.log("=".repeat(60));

    try {
      // Get basic token info from veION
      console.log("TOKEN OWNERSHIP & BASIC INFO:");
      console.log("-".repeat(40));

      try {
        const owner = await ve.read.ownerOf([tokenId]);
        console.log(`Owner: ${owner}`);
      } catch (error) {
        console.log("Owner: Token does not exist or error fetching owner");
      }

      try {
        const balanceInfo = await ve.read.balanceOfNFT([tokenId]);
        console.log(`Voting LPs: ${balanceInfo[0]}`);
        console.log(`LP Balances: ${balanceInfo[1]}`);
        console.log(`Boosts: ${balanceInfo[2]}`);
      } catch (error) {
        console.log("Balance info: Error fetching balance information");
      }

      // Get voting info from Voter contract
      console.log("\nVOTING INFO:");
      console.log("-".repeat(40));

      const lastVoted = await voter.read.lastVoted([tokenId]);
      console.log(`Last Voted Timestamp: ${lastVoted}`);

      if (lastVoted > 0n) {
        const date = new Date(Number(lastVoted) * 1000);
        console.log(`Last Voted Date: ${date.toISOString()}`);
      }

      const isWhitelisted = await voter.read.isWhitelistedNFT([tokenId]);
      console.log(`Is Whitelisted NFT: ${isWhitelisted}`);

      // Get all LP tokens and check vote details for each
      const lpTokens = await voter.read.getAllLpRewardTokens();
      console.log(`\nTotal LP Tokens: ${lpTokens.length}`);

      console.log("\nVOTE DETAILS PER LP ASSET:");
      console.log("-".repeat(40));

      let hasAnyVotes = false;
      for (let i = 0; i < lpTokens.length; i++) {
        const lpToken = lpTokens[i];
        try {
          const voteDetails = await voter.read.getVoteDetails([tokenId, lpToken]);

          if (voteDetails.usedWeight > 0n || voteDetails.marketVotes.length > 0) {
            hasAnyVotes = true;
            console.log(`\nLP Token ${i + 1}: ${lpToken}`);
            console.log(`  Used Weight: ${voteDetails.usedWeight}`);
            console.log(`  Number of market votes: ${voteDetails.marketVotes.length}`);

            if (voteDetails.marketVotes.length > 0) {
              for (let j = 0; j < voteDetails.marketVotes.length; j++) {
                console.log(`    Market ${j + 1}:`);
                console.log(`      Address: ${voteDetails.marketVotes[j]}`);
                console.log(`      Side: ${voteDetails.marketVoteSides[j] === 0 ? "Supply" : "Borrow"}`);
                console.log(`      Vote Weight: ${voteDetails.votes[j]}`);
              }
            }
          }
        } catch (error) {
          console.log(`  LP Token ${i + 1}: Error fetching vote details`);
        }
      }

      if (!hasAnyVotes) {
        console.log("No active votes found for this token ID across all LP assets.");
      }

      // Get epoch information
      console.log("\nEPOCH INFO:");
      console.log("-".repeat(40));
      const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
      const epochStart = await voter.read.epochStart([currentTimestamp]);
      const epochNext = await voter.read.epochNext([currentTimestamp]);
      const epochVoteStart = await voter.read.epochVoteStart([currentTimestamp]);
      const epochVoteEnd = await voter.read.epochVoteEnd([currentTimestamp]);

      console.log(`Current Timestamp: ${currentTimestamp}`);
      console.log(`Current Epoch Start: ${epochStart}`);
      console.log(`Next Epoch Start: ${epochNext}`);
      console.log(`Current Epoch Vote Start: ${epochVoteStart}`);
      console.log(`Current Epoch Vote End: ${epochVoteEnd}`);

      const epochStartDate = new Date(Number(epochStart) * 1000);
      const epochVoteStartDate = new Date(Number(epochVoteStart) * 1000);
      const epochVoteEndDate = new Date(Number(epochVoteEnd) * 1000);

      console.log(`Current Epoch Start Date: ${epochStartDate.toISOString()}`);
      console.log(`Current Epoch Vote Start Date: ${epochVoteStartDate.toISOString()}`);
      console.log(`Current Epoch Vote End Date: ${epochVoteEndDate.toISOString()}`);
    } catch (error) {
      console.error("Error getting token information:", error);
    }
  });

task("flywheel:getRewardInfo", "Display rewardsCycle for each market in all pools from PoolDirectory").setAction(
  async (taskArgs, { viem, deployments }) => {
    // Get PoolDirectory address from deployments
    const poolDirectoryDeployment = await deployments.get("PoolDirectory_Proxy");
    const poolDirectoryAddress = poolDirectoryDeployment.address;

    // Get PoolDirectory contract
    const poolDirectory = await viem.getContractAt("PoolDirectory", poolDirectoryAddress as Address);

    // Get Voter contract
    const voterDeployment = await deployments.get("Voter");
    const voter = await viem.getContractAt("Voter", voterDeployment.address as Address);

    // Get all pools
    const pools = await poolDirectory.read.getAllPools();

    // Flywheel contract address (update if needed)
    const flywheelAddress = "0xf871E19bf6B7E905B3994E1dF68521BafF636440" as Address;
    // Get Flywheel contract
    const flywheel = await viem.getContractAt("IonicFlywheelDynamicRewards", flywheelAddress);

    // MarketSide enum: Supply = 0, Borrow = 1
    const MarketSide = { Supply: 0, Borrow: 1 };

    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      const poolName = pool.name ? pool.name : `Pool ${i}`;
      const comptroller = pool.comptroller;

      // Get pool's markets
      let markets: Address[] = [];
      try {
        // Get IonicComptroller contract
        const comptrollerContract = await viem.getContractAt("IonicComptroller", comptroller as Address);
        // Get all markets from comptroller
        const allMarkets = await comptrollerContract.read.getAllMarkets();
        markets = Array.isArray(allMarkets) ? (allMarkets as Address[]) : [];
      } catch (err) {
        console.log(`Error fetching markets for pool ${poolName}:`, err);
        continue;
      }

      if (markets.length === 0) {
        continue;
      }

      console.log(`\n${poolName} (${comptroller}):`);
      for (let j = 0; j < markets.length; j++) {
        const market = markets[j] as Address;
        try {
          const flywheelRewardAccumulator = await flywheel.read.rewardAccumulators([market]);

          // Check Supply side only
          const voterSupplyAccumulator = await voter.read.marketToRewardAccumulators([market, MarketSide.Supply]);

          let matchStatus = "";
          if (flywheelRewardAccumulator.toLowerCase() === voterSupplyAccumulator.toLowerCase()) {
            matchStatus = " ✅";
          } else {
            matchStatus = " ❌";
          }

          console.log(`  Market: ${market}`);
          console.log(`    Flywheel: ${flywheelRewardAccumulator}${matchStatus}`);
          console.log(`    Voter Supply: ${voterSupplyAccumulator}`);
        } catch (err) {
          console.log(`  Market: ${market}  Error fetching accumulator:`, err);
        }
      }
    }
  }
);

task("voter:checkAccumulatorBalances", "Check ION balances of all reward accumulators from Voter").setAction(
  async (taskArgs, { viem, deployments, getChainId }) => {
    const chainId = parseInt(await getChainId());

    // Get Voter contract
    const voterDeployment = await deployments.get("Voter");
    const voter = await viem.getContractAt("Voter", voterDeployment.address as Address);

    // Get ION token contract
    const ionAddress = chainDeployConfig[chainId].config.ION as Address;
    const ionToken = await viem.getContractAt("@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20", ionAddress);

    // Get all markets from Voter
    const marketsLength = await voter.read.marketsLength();
    console.log(`Total markets in Voter: ${marketsLength}\n`);

    // MarketSide enum: Supply = 0, Borrow = 1
    const MarketSide = { Supply: 0, Borrow: 1 };

    // Track unique accumulators to avoid duplicates
    const accumulatorBalances = new Map<string, { balance: bigint; markets: string[] }>();

    for (let i = 0; i < Number(marketsLength); i++) {
      try {
        const market = await voter.read.markets([BigInt(i)]);
        const marketAddress = market[0] as Address; // First element is the market address
        const marketSide = market[1] as number; // Second element is the side (0 or 1)

        // Get reward accumulator for this market
        const accumulator = await voter.read.marketToRewardAccumulators([marketAddress, marketSide]);

        if (accumulator && accumulator !== "0x0000000000000000000000000000000000000000") {
          const accumulatorLower = accumulator.toLowerCase();

          // If we haven't seen this accumulator yet, get its balance
          if (!accumulatorBalances.has(accumulatorLower)) {
            const balance = await ionToken.read.balanceOf([accumulator]);
            accumulatorBalances.set(accumulatorLower, {
              balance,
              markets: [`${marketAddress} (${marketSide === 0 ? "Supply" : "Borrow"})`]
            });
          } else {
            // Add this market to the existing accumulator
            const existing = accumulatorBalances.get(accumulatorLower)!;
            existing.markets.push(`${marketAddress} (${marketSide === 0 ? "Supply" : "Borrow"})`);
          }
        }
      } catch (err) {
        console.log(`Error fetching market ${i}:`, err);
      }
    }

    // Display results
    console.log("REWARD ACCUMULATOR ION BALANCES:");
    console.log("=".repeat(80));

    let totalBalance = 0n;
    let index = 1;

    for (const [accumulator, data] of accumulatorBalances) {
      console.log(`\n${index}. Accumulator: ${accumulator}`);
      console.log(`   ION Balance: ${formatEther(data.balance)} ION`);
      console.log(`   Markets (${data.markets.length}):`);
      for (const market of data.markets) {
        console.log(`     - ${market}`);
      }
      totalBalance += data.balance;
      index++;
    }

    console.log("\n" + "=".repeat(80));
    console.log(`Total Unique Accumulators: ${accumulatorBalances.size}`);
    console.log(`Total ION Balance across all accumulators: ${formatEther(totalBalance)} ION`);
  }
);

task("flywheel:getStrategyState", "Get strategyState for all markets from IonicFlywheelCore").setAction(
  async (taskArgs, { viem, deployments }) => {
    // Get PoolDirectory address from deployments
    const poolDirectoryDeployment = await deployments.get("PoolDirectory_Proxy");
    const poolDirectoryAddress = poolDirectoryDeployment.address;

    // Get PoolDirectory contract
    const poolDirectory = await viem.getContractAt("PoolDirectory", poolDirectoryAddress as Address);

    // Get all pools
    const pools = await poolDirectory.read.getAllPools();

    // IonicFlywheelCore contract address
    const flywheelCoreAddress = "0x1eE8E310e992E7932A2a0964b29eC6d820f517A2" as Address;
    const flywheelCore = await viem.getContractAt("IonicFlywheel", flywheelCoreAddress);

    console.log(`IonicFlywheelCore: ${flywheelCoreAddress}\n`);

    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      const poolName = pool.name ? pool.name : `Pool ${i}`;
      const comptroller = pool.comptroller;

      // Get pool's markets
      let markets: Address[] = [];
      try {
        // Get IonicComptroller contract
        const comptrollerContract = await viem.getContractAt("IonicComptroller", comptroller as Address);
        // Get all markets from comptroller
        const allMarkets = await comptrollerContract.read.getAllMarkets();
        markets = Array.isArray(allMarkets) ? (allMarkets as Address[]) : [];
      } catch (err) {
        console.log(`Error fetching markets for pool ${poolName}:`, err);
        continue;
      }

      if (markets.length === 0) {
        continue;
      }

      console.log(`\n${poolName} (${comptroller}):`);
      console.log("=".repeat(80));

      for (let j = 0; j < markets.length; j++) {
        const market = markets[j] as Address;
        try {
          // Call strategyState - returns [index: uint224, lastUpdatedTimestamp: uint32]
          const strategyStateResult = await (flywheelCore.read as any).strategyState([market]);
          const index = strategyStateResult[0]; // uint224 index
          const lastUpdatedTimestamp = strategyStateResult[1]; // uint32 lastUpdatedTimestamp

          // Convert timestamp to readable date
          const date = new Date(Number(lastUpdatedTimestamp) * 1000);
          const dateString = date.toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short"
          });

          console.log(`\nMarket: ${market}`);
          console.log(`  Index: ${index}`);
          console.log(`  Last Updated: ${dateString}`);
          console.log(`  Timestamp: ${lastUpdatedTimestamp}`);
        } catch (err) {
          console.log(`\nMarket: ${market}`);
          console.log(`  Error: ${err}`);
        }
      }
    }
  }
);
