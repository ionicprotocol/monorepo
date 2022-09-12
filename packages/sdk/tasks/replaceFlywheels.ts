import { task, types } from "hardhat/config";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { Comptroller } from "../lib/contracts/typechain/Comptroller";
import { FlywheelCore } from "../lib/contracts/typechain/FlywheelCore";
import { FuseFlywheelDynamicRewardsPlugin } from "../lib/contracts/typechain/FuseFlywheelDynamicRewardsPlugin.sol";
import { FusePoolDirectory } from "../lib/contracts/typechain/FusePoolDirectory";
import { MidasFlywheel } from "../lib/contracts/typechain/MidasFlywheel";

export default task("flyhwheels:replace", "Replaces an old flyhwheel contract with a new one").setAction(
  async ({}, { ethers, deployments, getChainId }) => {
    const deployer = await ethers.getNamedSigner("deployer");

    const chainId = await getChainId();
    if (!chainDeployConfig[chainId]) {
      throw new Error(`Config invalid for ${chainId}`);
    }
    const { config }: { config: ChainDeployConfig } = chainDeployConfig[chainId];

    const fusePoolDirectory = (await ethers.getContract("FusePoolDirectory", deployer)) as FusePoolDirectory;
    const pools = await fusePoolDirectory.callStatic.getAllPools();
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log("pool name", pool.name);
      const comptroller = (await ethers.getContractAt(
        "Comptroller.sol:Comptroller",
        pool.comptroller,
        deployer
      )) as Comptroller;

      let j = 0;
      while (true) {
        let oldFlywheelAddress;
        try {
          oldFlywheelAddress = await comptroller.callStatic.rewardsDistributors(j++);
        } catch (e) {
          break;
        }

        try {
          const flywheel = (await ethers.getContractAt("FlywheelCore", oldFlywheelAddress, deployer)) as FlywheelCore;
          const rewardToken = await flywheel.callStatic.rewardToken();

          const fwConfig = config.dynamicFlywheels.find((c) => c.rewardToken == rewardToken);

          console.log(`replacing old flywheel ${oldFlywheelAddress}`);
          // first, deploy a replacement flywheel
          const fwc = (await ethers.getContract(`MidasFlywheel_${fwConfig.name}`, deployer)) as MidasFlywheel;
          console.log("MidasFlywheel: ", fwc.address);
          const fdr = (await ethers.getContract(
            `FuseFlywheelDynamicRewardsPlugin_${fwConfig.name}`,
            deployer
          )) as FuseFlywheelDynamicRewardsPlugin;
          // then we should replace the IFlywheelRewards contract with a new one
          // that refers to the new flywheel
          console.log("FuseFlywheelDynamicRewardsPlugin: ", fdr.address);

          let tx = await fwc.setFlywheelRewards(fdr.address, { from: deployer.address });
          await tx.wait();
          console.log("setFlywheelRewards: ", tx.hash);

          tx = await comptroller.replaceFlywheel(oldFlywheelAddress, fwc.address);
          await tx.wait();
          console.log("replaceFlywheel: ", tx.hash);
          console.log(`replaced old flywheel ${oldFlywheelAddress}`);
        } catch (e) {
          console.error(`error while deploying flywheel ${oldFlywheelAddress}`, e);
        }
      }
    }
  }
);
