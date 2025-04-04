import { task } from "hardhat/config";
import { ION, MODE_NATIVE_MARKET, USDC_NATIVE_MARKET, USDT_NATIVE_MARKET, WETH_NATIVE_MARKET } from ".";
import { Address, parseEther } from "viem";

task("mode:add-bribes", async (_, { viem, deployments }) => {
  const publicClient = await viem.getPublicClient();
  const bribesToAdd = [
    // {
    //   market: MODE_NATIVE_MARKET,
    //   side: "supply",
    //   amount: parseEther("69420"),
    //   token: ION
    // },
    {
      market: WETH_NATIVE_MARKET,
      side: "supply",
      amount: parseEther("69"),
      token: ION
    },
    {
      market: USDC_NATIVE_MARKET,
      side: "supply",
      amount: parseEther("69"),
      token: ION
    },
    {
      market: USDT_NATIVE_MARKET,
      side: "supply",
      amount: parseEther("69"),
      token: ION
    }
  ];
  for (const bribe of bribesToAdd) {
    const rewardAccum = (await deployments.get(`RewardAccumulator_${bribe.market}_${bribe.side === "supply" ? 0 : 1}`))
      .address as Address;
    const bribeRewards = await viem.getContractAt(
      "BribeRewards",
      (await deployments.get(`BribeRewards_${rewardAccum}`)).address as Address
    );
    // approve the bribe rewards contract to spend the token
    const ionToken = await viem.getContractAt("EIP20Interface", ION);
    const tx = await ionToken.write.approve([bribeRewards.address as Address, bribe.amount]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`Approved ${bribe.amount} ${bribe.side} bribe to ${bribe.market} - ${tx}`);
    const tx2 = await bribeRewards.write.notifyRewardAmount([bribe.token as Address, bribe.amount]);
    await publicClient.waitForTransactionReceipt({ hash: tx2 });
    console.log(`Added ${bribe.amount} ${bribe.side} bribe to ${bribe.market} - ${tx2}`);
  }
});

task("mode:distribute-rewards", async (_, { viem, deployments }) => {
  const publicClient = await viem.getPublicClient();
  const voter = await viem.getContractAt("Voter", (await deployments.get("Voter")).address as Address);
  const tx = await voter.write.distributeRewards();
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log(`Distributed rewards - ${tx}`);
  const tx2 = await voter.write.toggleDistributionTimelockAlive([true]);
  await publicClient.waitForTransactionReceipt({ hash: tx2 });
  console.log(`Toggled distribution timelock alive - ${tx2}`);
});