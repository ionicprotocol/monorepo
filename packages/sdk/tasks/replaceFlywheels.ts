import { task, types } from "hardhat/config";
import { MidasFlywheelCore } from "../lib/contracts/typechain/MidasFlywheelCore";
import { deployConfig } from "../chainDeploy/mainnets/bsc";
import {Comptroller, FusePoolDirectory} from "../lib/contracts/typechain";

export default task("flyhwheels:change", "Replaces an old flyhwheel contract with a new one")
  .addParam("market", "The address of the market", undefined, types.string)
  .setAction(async ({ market: marketAddress }, {ethers}) => {
    const deployer = await ethers.getNamedSigner("deployer");

    const dynamicFlywheels = [];

    for (const config of deployConfig.dynamicFlywheels) {
      if (config) {
        console.log(
          `Deploying MidasFlywheelCore & FuseFlywheelDynamicRewardsPlugin for ${config.rewardToken} reward token`
        );
        const flywheelCore = (await ethers.getContract(
          `MidasFlywheelCore_${config.name}`,
          deployer
        )) as MidasFlywheelCore;
        dynamicFlywheels.push(flywheelCore.address);
      }
    }

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
      const admin = await comptroller.callStatic.admin();
      console.log("pool admin", admin);

      const markets = await comptroller.callStatic.getAllMarkets();
      // console.log("pool assets", assets);
      for (let j = 0; j < markets.length; j++) {
        const market = markets[j];
      }
    }
  });
