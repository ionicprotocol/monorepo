import { task } from "hardhat/config";
import { Address, parseEther, parseUnits } from "viem";
import {
  bsdETH_MARKET,
  eUSD,
  eUSD_MARKET,
  hyUSD_MARKET,
  OGN,
  USDC,
  uSOL_MARKET,
  uSUI_MARKET,
  wsuperOETH_MARKET
} from ".";

task("base:add-bribes", async (_, { viem, deployments }) => {
  console.log("🚀 Starting bribe addition task...");
  const publicClient = await viem.getPublicClient();
  const bribesToAdd = [
    {
      market: eUSD_MARKET,
      side: "supply",
      amount: parseEther("100"),
      token: eUSD
    },
    {
      market: eUSD_MARKET,
      side: "borrow",
      amount: parseEther("100"),
      token: eUSD
    },
    {
      market: bsdETH_MARKET,
      side: "supply",
      amount: parseEther("100"),
      token: eUSD
    },
    {
      market: hyUSD_MARKET,
      side: "supply",
      amount: parseEther("100"),
      token: eUSD
    },
    {
      market: wsuperOETH_MARKET,
      side: "supply",
      amount: parseEther("1400"),
      token: OGN
    },
    {
      market: uSOL_MARKET,
      side: "supply",
      amount: parseUnits("100", 6),
      token: USDC
    },
    {
      market: uSUI_MARKET,
      side: "supply",
      amount: parseUnits("100", 6),
      token: USDC
    }
  ];

  console.log(`📋 Found ${bribesToAdd.length} bribes to process`);

  let successCount = 0;
  const failures = [];

  for (let i = 0; i < bribesToAdd.length; i++) {
    const bribe = bribesToAdd[i];
    console.log(`\n⏳ Processing bribe ${i + 1}/${bribesToAdd.length}:`);
    console.log(`   Market: ${bribe.market}`);
    console.log(`   Side: ${bribe.side}`);
    console.log(`   Amount: ${bribe.amount} (${bribe.token})`);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    try {
      const rewardAccum = (
        await deployments.get(`RewardAccumulator_${bribe.market}_${bribe.side === "supply" ? 0 : 1}`)
      ).address as Address;
      console.log(`   Reward Accumulator: ${rewardAccum}`);

      const bribeRewards = await viem.getContractAt(
        "BribeRewards",
        (await deployments.get(`BribeRewards_${rewardAccum}`)).address as Address
      );
      console.log(`   BribeRewards Contract: ${bribeRewards.address}`);

      // approve the bribe rewards contract to spend the token
      const rewardToken = await viem.getContractAt("EIP20Interface", bribe.token as Address);
      console.log(`   Approving token spend...`);
      const tx = await rewardToken.write.approve([bribeRewards.address as Address, bribe.amount]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`   ✅ Approved ${bribe.amount} ${bribe.side} bribe to ${bribe.market}`);
      console.log(`   📜 Approval TX: ${tx}`);

      console.log(`   Adding reward...`);
      const tx2 = await bribeRewards.write.notifyRewardAmount([bribe.token as Address, bribe.amount]);
      await publicClient.waitForTransactionReceipt({ hash: tx2 });
      console.log(`   ✅ Added ${bribe.amount} ${bribe.side} bribe to ${bribe.market}`);
      console.log(`   📜 Reward TX: ${tx2}`);

      successCount++;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ Failed to process bribe for ${bribe.market} (${bribe.side}):`);
      console.error(`   Error: ${errorMessage}`);
      failures.push({
        market: bribe.market,
        side: bribe.side,
        error: errorMessage
      });
    }
  }

  console.log("\n📊 Bribe Addition Summary:");
  console.log(`   Total bribes: ${bribesToAdd.length}`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${failures.length}`);

  if (failures.length > 0) {
    console.log("\n❌ Failed bribes:");
    failures.forEach((failure, index) => {
      console.log(`   ${index + 1}. Market: ${failure.market}, Side: ${failure.side}`);
      console.log(`      Error: ${failure.error}`);
    });
  }

  console.log("\n✨ Bribe addition task completed!");
});
