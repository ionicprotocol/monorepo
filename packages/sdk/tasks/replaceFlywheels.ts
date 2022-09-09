import { constants } from "ethers";
import { task, types } from "hardhat/config";

import { ChainDeployConfig, chainDeployConfig, ChainDeployConfig } from "../chainDeploy";
import { CErc20PluginRewardsDelegate } from "../lib/contracts/typechain/CErc20PluginRewardsDelegate";
import { Comptroller } from "../lib/contracts/typechain/Comptroller";
import { FlywheelCore } from "../lib/contracts/typechain/FlywheelCore";
import { FusePoolDirectory } from "../lib/contracts/typechain/FusePoolDirectory";
import { MidasFlywheelCore } from "../lib/contracts/typechain/MidasFlywheelCore";

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
          const fwc = await deployments.deploy(`MidasFlywheelCore_${fwConfig.name}`, {
            contract: "MidasFlywheelCore",
            from: deployer.address,
            log: true,
            proxy: {
              execute: {
                init: {
                  methodName: "initialize",
                  args: [
                    rewardToken,
                    "0x0000000000000000000000000000000000000009", // need to initialize to address that does NOT have balance, otherwise this fails (i.e. AddressZero)
                    constants.AddressZero,
                    deployer.address,
                  ],
                },
              },
              proxyContract: "OpenZeppelinTransparentProxy",
              owner: deployer.address,
            },
            waitConfirmations: 1,
          });
          console.log("MidasFlywheelCore: ", fwc.address);

          // then we should replace the IFlywheelRewards contract with a new one
          // that refers to the new flywheel

          const fdr = await deployments.deploy(`FuseFlywheelDynamicRewardsPlugin_${fwConfig.name}`, {
            contract: "FuseFlywheelDynamicRewardsPlugin",
            from: deployer.address,
            args: [fwc.address, fwConfig.cycleLength],
            log: true,
            waitConfirmations: 1,
          });
          console.log("FuseFlywheelDynamicRewardsPlugin: ", fdr.address);

          const newFlywheel = (await ethers.getContractAt(
            "MidasFlywheelCore",
            fwc.address,
            deployer
          )) as MidasFlywheelCore;
          let tx = await newFlywheel.setFlywheelRewards(fdr.address, { from: deployer.address });
          await tx.wait();
          console.log("setFlywheelRewards: ", tx.hash);

          tx = await comptroller.replaceFlywheel(oldFlywheelAddress, newFlywheel.address);
          await tx.wait();
          console.log("replaceFlywheel: ", tx.hash);
          console.log(`replaced old flywheel ${oldFlywheelAddress}`);
        } catch (e) {
          console.error(`error while deploying flywheel ${oldFlywheelAddress}`, e);
          break;
        }
      }
    }
  }
);
