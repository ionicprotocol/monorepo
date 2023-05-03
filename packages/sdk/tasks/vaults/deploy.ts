import { constants } from "ethers";
import { task, types } from "hardhat/config";

import { CErc20 } from "../../typechain/CErc20";
import { CompoundMarketERC4626 } from "../../typechain/CompoundMarketERC4626";
import { OptimizedAPRVaultFirstExtension } from "../../typechain/OptimizedAPRVaultFirstExtension";
import { OptimizedAPRVaultSecondExtension } from "../../typechain/OptimizedAPRVaultSecondExtension";

export default task("deploy-optimized:all")
  .addParam("marketsAddresses", "Comma-separated addresses of the markets", undefined, types.string)
  .setAction(async ({ marketsAddresses }, { ethers, run, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    let asset;
    const markets = marketsAddresses.split(",");
    for (let i = 0; i < markets.length; i++) {
      const cErc20 = (await ethers.getContractAt("CErc20", markets[i])) as CErc20;
      const marketUnderlying = await cErc20.callStatic.underlying();
      if (!asset) asset = marketUnderlying;
      if (asset != marketUnderlying) throw new Error(`The vault adapters should be for the same underlying`);
    }

    const adapters = [];
    for (let i = 0; i < markets.length; i++) {
      const marketAddress = markets[i];
      await run("optimized-adapters:deploy", {
        marketAddress,
      });

      const adapter = (await ethers.getContract(
        `CompoundMarketERC4626_${marketAddress}`,
        deployer
      )) as CompoundMarketERC4626;
      adapters.push(adapter.address);
    }

    await run("optimized-vault:deploy", {
      assetAddress: asset,
      adaptersAddresses: adapters.join(","),
    });
  });

task("deploy-optimized:wbnb:chapel").setAction(async ({}, { run }) => {
  await run("deploy-optimized:all", {
    marketsAddresses: "0xc436c7848C6144cf04fa241ac8311864F8572ed3,0xddA148e5917A1c2DCfF98139aBBaa41636840830",
  });
});

task("deploy-optimized:bomb:chapel").setAction(async ({}, { run }) => {
  await run("deploy-optimized:all", {
    marketsAddresses: "0xfa60851E76728eb31EFeA660937cD535C887fDbD",
  });
});

task("deploy-vault-flywheel")
  .addParam("vaultAddress", "Address of the vault", undefined, types.string)
  .addParam("rewardToken", "Address of the reward token to add a flywheel for", undefined, types.string)
  .setAction(async ({ vaultAddress, rewardToken }, { ethers, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const vaultFirstExt = (await ethers.getContractAt(
      "OptimizedAPRVaultFirstExtension",
      vaultAddress,
      deployer
    )) as OptimizedAPRVaultFirstExtension;
    const vaultSecondExt = (await ethers.getContractAt(
      "OptimizedAPRVaultSecondExtension",
      vaultAddress,
      deployer
    )) as OptimizedAPRVaultSecondExtension;
    const flywheelForRewardToken = await vaultSecondExt.callStatic.flywheelForRewardToken(rewardToken);
    if (flywheelForRewardToken != constants.AddressZero) {
      console.log(
        `there is already a flywheel ${flywheelForRewardToken} for reward token ${rewardToken} in the vault at ${vaultAddress}`
      );
    } else {
      const tx = await vaultFirstExt.addRewardToken(rewardToken);
      console.log(`mining tx ${tx.hash}`);
      await tx.wait();
      console.log(`added a flywheel for reward token ${rewardToken} in the vault at ${vaultAddress}`);
    }
  });
