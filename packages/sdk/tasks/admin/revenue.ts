import { ComptrollerWithExtension } from "@midas-capital/liquidity-monitor/src/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import axios from "axios";
import { BigNumber, Contract, providers } from "ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { default as ERC20Abi } from "../../abis/EIP20Interface";
import { FusePoolDirectory } from "../../typechain/FusePoolDirectory";
import { MidasERC4626 } from "../../typechain/MidasERC4626";

const LOG = process.env.LOG ? true : false;

async function setUpFeeCalculation(hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.ethers.getNamedSigners();
  const fpd = (await hre.ethers.getContract("FusePoolDirectory", deployer)) as FusePoolDirectory;
  const mpo = await hre.ethers.getContract("MasterPriceOracle", deployer);
  const [, pools] = await fpd.callStatic.getActivePools();
  return { pools, fpd, mpo };
}

async function cgPrice(cgId: string) {
  const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${cgId}`);
  return data[cgId].usd;
}

async function createComptroller(
  pool: FusePoolDirectory.FusePoolStructOutput,
  deployer: SignerWithAddress
): Promise<ComptrollerWithExtension | null> {
  const midasSdkModule = await import("../midasSdk");
  const sdk = await midasSdkModule.getOrCreateMidas(deployer);
  const comptroller = sdk.createComptroller(pool.comptroller);
  const poolAdmin = await comptroller.callStatic.fuseAdmin();

  if (poolAdmin != sdk.contracts.FuseFeeDistributor.address) {
    if (LOG)
      console.log(`Skipping pool: ${pool.name} (${pool.comptroller}) because it is not managed by FuseFeeDistributor`);
    return null;
  }
  return comptroller;
}

export default task("revenue:admin:calculate", "Calculate the fees accrued from 4626 Performance Fees").setAction(
  async (taskArgs, hre) => {
    const { deployer } = await hre.ethers.getNamedSigners();

    const midasSdkModule = await import("../midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const { pools, mpo } = await setUpFeeCalculation(hre);
    let fuseFeeTotal = BigNumber.from(0);

    for (const pool of pools) {
      const comptroller = await createComptroller(pool, deployer);
      if (comptroller === null) {
        continue;
      }
      const markets = await comptroller.callStatic.getAllMarkets();
      let poolFuseFeesTotal = BigNumber.from(0);

      for (const market of markets) {
        const cToken = sdk.createCTokenWithExtensions(market, deployer);
        const underlying = await cToken.callStatic.underlying();
        const underlyingPrice = await mpo.callStatic.getUnderlyingPrice(market);

        const fuseFee = await cToken.callStatic.totalFuseFees();

        if (fuseFee.gt(0)) {
          const nativeFee = fuseFee.mul(underlyingPrice).div(BigNumber.from(10).pow(18));
          fuseFeeTotal = fuseFeeTotal.add(nativeFee);
          poolFuseFeesTotal = poolFuseFeesTotal.add(nativeFee);

          if (LOG)
            console.log(
              `Pool: ${pool.name} (${
                pool.comptroller
              }) - Market: ${market} (underlying: ${underlying}) - Fuse Fee: ${hre.ethers.utils.formatEther(nativeFee)}`
            );
        } else {
          if (LOG) console.log(`Pool: ${pool.name} (${pool.comptroller}) - Market: ${market} - No Fuse Fees`);
        }
      }
      if (LOG)
        console.log(
          `Pool: ${pool.name} (${pool.comptroller}) - Total Fuse Fee: ${hre.ethers.utils.formatEther(
            poolFuseFeesTotal
          )}`
        );
    }
    console.log(`Total Fuse Fees: ${hre.ethers.utils.formatEther(fuseFeeTotal)}`);
    return fuseFeeTotal;
  }
);

task("revenue:4626:calculate", "Calculate the fees accrued from 4626 Performance Fees").setAction(
  async (taskArgs, hre) => {
    const { deployer } = await hre.ethers.getNamedSigners();

    const midasSdkModule = await import("../midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const { pools, mpo } = await setUpFeeCalculation(hre);
    let pluginFeesTotal = BigNumber.from(0);

    for (const pool of pools) {
      const comptroller = await createComptroller(pool, deployer);
      if (comptroller === null) {
        continue;
      }
      const markets = await comptroller.callStatic.getAllMarkets();
      let pluginFeesPool = BigNumber.from(0);

      for (const market of markets) {
        const cToken = sdk.createCErc20PluginRewardsDelegate(market, deployer);
        const underlying = await cToken.callStatic.underlying();
        const underlyingDecimals = await cToken.callStatic.decimals();

        let plugin;

        try {
          plugin = await cToken.callStatic.plugin();
        } catch {
          continue;
        }
        try {
          const pluginContract = await hre.ethers.getContractAt("MidasERC4626", plugin);
          const pluginPerformanceFee = await pluginContract.callStatic.performanceFee();

          const shareValue = await pluginContract.callStatic.convertToAssets(
            BigNumber.from(10).pow(underlyingDecimals)
          );
          const supply = await pluginContract.callStatic.totalSupply();
          const vaultShareHWM = await pluginContract.callStatic.vaultShareHWM();

          const performanceFeeShares = pluginPerformanceFee
            .mul(shareValue.sub(vaultShareHWM))
            .mul(supply)
            .div(BigNumber.from(10).pow(36));
          const performanceFeeAssets = await pluginContract.callStatic.previewRedeem(performanceFeeShares);
          const underlyingPrice = await mpo.callStatic.price(underlying);

          const nativeFee = performanceFeeAssets
            .mul(underlyingPrice)
            .mul(BigNumber.from(10).pow(18 - underlyingDecimals))
            .div(BigNumber.from(10).pow(18));

          pluginFeesPool = pluginFeesPool.add(nativeFee);
          pluginFeesTotal = pluginFeesTotal.add(nativeFee);
        } catch (e) {
          if (LOG) console.log(`Pool: ${pool.name} (${pool.comptroller}) - Market: ${market} - No Performance Fees`);
        }
      }
      if (LOG)
        console.log(
          `Pool: ${pool.name} (${pool.comptroller}) - Total Fuse Fee: ${hre.ethers.utils.formatEther(pluginFeesPool)}`
        );
    }
    console.log(`Total Plugin Fees: ${hre.ethers.utils.formatEther(pluginFeesTotal)}`);
    return pluginFeesTotal;
  }
);

task("revenue:flywheels:calculate", "Calculate the fees accrued from 4626 Performance Fees").setAction(
  async (taskArgs, hre) => {
    const { deployer } = await hre.ethers.getNamedSigners();

    const midasSdkModule = await import("../midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const { pools, mpo } = await setUpFeeCalculation(hre);
    let flywheelFeesTotal = BigNumber.from(0);

    for (const pool of pools) {
      const comptroller = await createComptroller(pool, deployer);
      if (comptroller === null) {
        continue;
      }
      const flywheels = await comptroller.callStatic.getRewardsDistributors();
      let flywheelFeesPool = BigNumber.from(0);

      for (const flywheel of flywheels) {
        const flywheelContract = sdk.createMidasFlywheel(flywheel, deployer);

        try {
          await flywheelContract.callStatic.performanceFee();
        } catch {
          if (LOG)
            console.log(
              `Pool: ${pool.name} (${pool.comptroller}) - Flywheel: ${flywheel} - Not a Performance Fee flywheel`
            );
        }
        try {
          const performanceFeeRewardTokens = await flywheelContract.callStatic.rewardsAccrued(
            await flywheelContract.callStatic.feeRecipient()
          );
          const rewardToken = new Contract(await flywheelContract.callStatic.rewardToken(), ERC20Abi, deployer);
          const rewardTokenPrice = await mpo.callStatic.price(rewardToken.address);

          const nativeFee = performanceFeeRewardTokens
            .mul(rewardTokenPrice)
            .div(BigNumber.from(10).pow(await rewardToken.callStatic.decimals()));

          flywheelFeesTotal = flywheelFeesTotal.add(nativeFee);
          flywheelFeesPool = flywheelFeesPool.add(nativeFee);
        } catch (e) {
          if (LOG)
            console.log(`Pool: ${pool.name} (${pool.comptroller}) - Flywheel: ${flywheel} - No Performance Fees`);
        }
      }
      if (LOG)
        console.log(
          `Pool: ${pool.name} (${pool.comptroller}) - Total Fuse Fee: ${hre.ethers.utils.formatEther(flywheelFeesPool)}`
        );
    }
    console.log(`Total Flywheel Fees: ${hre.ethers.utils.formatEther(flywheelFeesTotal)}`);
    return flywheelFeesTotal;
  }
);
task("revenue:all:calculate", "Calculate the fees accrued from 4626 Performance Fees").setAction(
  async (taskArgs, hre) => {
    const pluginFees = await hre.run("revenue:4626:calculate");
    const adminFees = await hre.run("revenue:admin:calculate");
    const flywheelFees = await hre.run("revenue:flywheels:calculate");
    console.log(`Total Fees: ${hre.ethers.utils.formatEther(pluginFees.add(adminFees).add(flywheelFees))}`);
  }
);

task("revenue:admin:withdraw", "Calculate the fees accrued from 4626 Performance Fees")
  .addParam("signer", "The address of the current deployer", "deployer", types.string)
  .addParam("comptroller", "The address of the comptroller", undefined, types.string)
  .addParam("threshold", "Threshold for fuse fee seizing denominated in native", "0.01", types.string)
  .setAction(async (taskArgs, hre) => {
    const deployer = await hre.ethers.getNamedSigner("deployer");

    const midasSdkModule = await import("../midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas(deployer);
    const cgId = sdk.chainSpecificParams.cgId;

    const comptroller = sdk.createComptroller(taskArgs.comptroller, deployer);
    const markets = await comptroller.callStatic.getAllMarkets();

    const threshold = hre.ethers.utils.parseEther(taskArgs.threshold);

    const priceUsd = await cgPrice(cgId);

    for (const market of markets) {
      const cToken = sdk.createCTokenWithExtensions(market, deployer);
      const underlying = await cToken.callStatic.underlying();
      const fuseFee = await cToken.callStatic.totalFuseFees();
      const mpo = sdk.createMasterPriceOracle(deployer);
      const nativePrice = await mpo.callStatic.price(underlying);
      console.log("native price", hre.ethers.utils.formatEther(nativePrice));
      const nativeFee = fuseFee.mul(nativePrice).div(BigNumber.from(10).pow(18));

      console.log("USD FEE VALUE", parseFloat(hre.ethers.utils.formatEther(nativeFee)) * priceUsd);
      console.log("USD THRESHOLD VALUE", parseFloat(taskArgs.threshold) * priceUsd);

      if (fuseFee.gt(threshold)) {
        console.log(`Withdrawing fee from ${await cToken.callStatic.symbol()} (underlying: ${underlying})`);
        const tx = await cToken._withdrawFuseFees(fuseFee);
        await tx.wait();
        if (LOG)
          console.log(
            `Pool: ${comptroller} - Market: ${market} (underlying: ${underlying}) - Fuse Fee: ${hre.ethers.utils.formatEther(
              nativeFee
            )}`
          );
      } else {
        if (LOG) console.log(`Pool: ${comptroller} - Market: ${market} - No Fuse Fees`);
      }
    }
  });

task("revenue:4626:withdraw", "Calculate the fees accrued from 4626 Performance Fees")
  .addParam("signer", "The address of the current deployer", "deployer", types.string)
  .addParam("threshold", "Threshold for fuse fee seizing denominated in native", "0.01", types.string)
  .setAction(async (taskArgs, hre) => {
    let tx: providers.TransactionResponse;
    const deployer = await hre.ethers.getNamedSigner("deployer");

    const midasSdkModule = await import("../midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas(deployer);

    const plugins = sdk.deployedPlugins;
    const cgId = sdk.chainSpecificParams.cgId;

    const comptroller = sdk.createComptroller(taskArgs.comptroller, deployer);

    const threshold = hre.ethers.utils.parseEther(taskArgs.threshold);

    const priceUsd = await cgPrice(cgId);

    for (const pluginAddress of Object.keys(plugins)) {
      const market = plugins[pluginAddress].market;
      const cToken = sdk.createCErc20PluginRewardsDelegate(market, deployer);
      const underlying = await cToken.callStatic.underlying();
      const plugin = (await hre.ethers.getContractAt("MidasERC4636", pluginAddress, deployer)) as MidasERC4626;

      console.log(`Harvesting fees from plugin ${plugins[pluginAddress].name}, (${pluginAddress})`);
      tx = await plugin.takePerformanceFee();
      await tx.wait();

      const totalAssets = await plugin.callStatic.totalAssets();
      const totalSupply = await plugin.callStatic.totalSupply();
      const balance = await plugin.callStatic.balanceOf(deployer.address);
      console.log({ totalAssets, totalSupply, balance });
      const feeValue = balance.mul(totalAssets).div(totalSupply);

      const mpo = sdk.createMasterPriceOracle(deployer);
      const nativePrice = await mpo.callStatic.price(underlying);

      const nativeFee = feeValue.mul(nativePrice).div(BigNumber.from(10).pow(18));

      console.log("USD FEE VALUE", parseFloat(hre.ethers.utils.formatEther(nativeFee)) * priceUsd);
      console.log("USD THRESHOLD VALUE", parseFloat(taskArgs.threshold) * priceUsd);

      if (nativeFee.gt(threshold)) {
        console.log(`Withdrawing fee from ${await cToken.callStatic.symbol()} (underlying: ${underlying})`);
        tx = await plugin.withdrawAccruedFees();
        await tx.wait();
        if (LOG)
          console.log(
            `Plugin: ${
              plugins[pluginAddress].name
            } - Market: ${market} (underlying: ${underlying}) - Fuse Fee: ${hre.ethers.utils.formatEther(nativeFee)}`
          );
      } else {
        if (LOG) console.log(`Pool: ${comptroller} - Market: ${market} - No Fuse Fees`);
      }
    }
  });
