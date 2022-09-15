import { task, types } from "hardhat/config";

import { ChainDeployConfig, chainDeployConfig } from "../chainDeploy";
import { Comptroller } from "../lib/contracts/typechain/Comptroller";
import { ERC20 } from "../lib/contracts/typechain/ERC20";
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

      const currentFlywheelsSet = [];
      let j = 0;
      while (true) {
        try {
          const oldFlywheelAddress = await comptroller.callStatic.rewardsDistributors(j++);
          if (currentFlywheelsSet.indexOf(oldFlywheelAddress) < 0) currentFlywheelsSet.push(oldFlywheelAddress);
        } catch (e) {
          break;
        }
      }

      for (let k = 0; k < currentFlywheelsSet.length; k++) {
        const oldFlywheelAddress = currentFlywheelsSet[k];

        try {
          const flywheel = (await ethers.getContractAt("FlywheelCore", oldFlywheelAddress, deployer)) as FlywheelCore;
          const flywheelRewards = await flywheel.callStatic.flywheelRewards();
          const rewardToken = await flywheel.callStatic.rewardToken();
          const erc20 = (await ethers.getContractAt("ERC20", rewardToken, deployer)) as ERC20;
          const balanceOld = await erc20.balanceOf(flywheelRewards);

          if (!balanceOld.isZero()) {
            console.log(
              `OLD DYNAMIC REWARDS ${flywheelRewards} STILL HAS IN IT ${balanceOld} TOKENS OF ${rewardToken}`
            );
          }

          const fwConfig = config.dynamicFlywheels.find((c) => c.rewardToken == rewardToken);

          if (fwConfig) {
            console.log(`replacing old flywheel ${oldFlywheelAddress}`);
            // first, deploy a replacement flywheel
            const fwc = (await ethers.getContract(`MidasFlywheel_${fwConfig.name}`, deployer)) as MidasFlywheel;
            console.log(`MidasFlywheel ${fwConfig.name} ${fwc.address}`);

            if (currentFlywheelsSet.indexOf(fwc.address) < 0) {
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

              const admin = await comptroller.callStatic.admin();
              console.log(`pool admin ${admin}`);

              if (!balanceOld.isZero()) {
                console.log(`adding alongside ${oldFlywheelAddress} the other flywheel ${fwc.address}`);
                tx = await comptroller._addRewardsDistributor(fwc.address);
                await tx.wait();
                console.log("_addRewardsDistributor: ", tx.hash);
              } else if (oldFlywheelAddress != fwc.address) {
                console.log(`replacing flywheel with ${oldFlywheelAddress}`, fwc.address);
                tx = await comptroller.replaceFlywheel(oldFlywheelAddress, fwc.address);
                await tx.wait();
                console.log("replaceFlywheel: ", tx.hash);
              }
              console.log(`replaced old flywheel ${oldFlywheelAddress}`);
            } else {
              console.log(`flywheel already set for the pool`);
            }
          } else {
            console.log(`missing a fw for reward token ${rewardToken} in pool ${pool.name} ${pool.comptroller}`);
          }
        } catch (e) {
          console.error(`error while deploying flywheel ${oldFlywheelAddress}`, e);
        }
      }
    }
  }
);
