import { Address } from "viem";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PublicClient } from "viem";

export const setRewardsAccumulators = async (
  deployments: HardhatRuntimeEnvironment["deployments"],
  viem: HardhatRuntimeEnvironment["viem"],
  publicClient: PublicClient,
  ionAddress: Address,
  markets: Address[]
) => {
  const emissionsManager = await deployments.get("EmissionsManager");
  const veIONFlywheelSupply = await deployments.get("IonicFlywheel_veION");
  const veIONFlywheelSupplyContract = await viem.getContractAt("IonicFlywheel", veIONFlywheelSupply.address as Address);

  const flywheelRewardsContractSupply = await viem.getContractAt(
    "IonicFlywheelDynamicRewards",
    (await deployments.get("IonicFlywheelDynamicRewards_veION")).address as Address
  );

  const veIONFlywheelBorrow = await deployments.get("IonicFlywheelBorrow_veION_Borrow");
  const veIONFlywheelBorrowContract = await viem.getContractAt("IonicFlywheel", veIONFlywheelBorrow.address as Address);

  // Set emissions manager
  let tx = await veIONFlywheelSupplyContract.write.setEmissionsManager([emissionsManager.address as Address]);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  tx = await veIONFlywheelBorrowContract.write.setEmissionsManager([emissionsManager.address as Address]);
  await publicClient.waitForTransactionReceipt({ hash: tx });

  const flywheelRewardsContractBorrow = await viem.getContractAt(
    "IonicFlywheelDynamicRewards",
    (await deployments.get("IonicFlywheelDynamicRewards_veION_Borrow")).address as Address
  );

  for (const market of markets) {
    const symbol = await (await viem.getContractAt("EIP20Interface", market as Address)).read.symbol();
    console.log("symbol: ", symbol);
    // supply side config
    const _rewardAccumulatorSupply = (await deployments.get(`RewardAccumulator_${market}_0`)).address as Address;
    let tx = await flywheelRewardsContractSupply.write.setRewardAccumulators([
      [market as Address],
      [_rewardAccumulatorSupply]
    ]);
    await publicClient.waitForTransactionReceipt({ hash: tx });

    console.log("Reward accumulator set for market supply: ", market, tx);

    const rewardAccumulator = await viem.getContractAt("RewardAccumulator", _rewardAccumulatorSupply);
    try {
      tx = await rewardAccumulator.write.approve([ionAddress, flywheelRewardsContractSupply.address as Address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("Reward accumulator approved for market supply: ", market, tx);
    } catch (e) {
      console.log("Reward accumulator already approved for market supply: ", market, tx);
    }
    // borrow side config
    const _rewardAccumulatorBorrow = (await deployments.get(`RewardAccumulator_${market}_1`)).address as Address;
    tx = await flywheelRewardsContractBorrow.write.setRewardAccumulators([
      [market as Address],
      [_rewardAccumulatorBorrow]
    ]);
    await publicClient.waitForTransactionReceipt({ hash: tx });

    console.log("Reward accumulator set for market borrow: ", market, tx);

    const rewardAccumulatorBorrow = await viem.getContractAt("RewardAccumulator", _rewardAccumulatorBorrow);
    try {
      tx = await rewardAccumulatorBorrow.write.approve([ionAddress, flywheelRewardsContractBorrow.address as Address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log("Reward accumulator approved for market borrow: ", market, tx);
    } catch (e) {
      console.log("Reward accumulator already approved for market borrow: ", market, tx);
    }
  }
};
