import { ComptrollerWithExtension } from "@midas-capital/liquidity-monitor/src/types";
import { BigNumber, Contract } from "ethers";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { FusePoolDirectory } from "../../lib/contracts/typechain/FusePoolDirectory";

const LOG = process.env.LOG ? true : false;

async function setUpFeeCalculation(hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.ethers.getNamedSigners();
  // @ts-ignore
  const fpd = (await hre.ethers.getContract("FusePoolDirectory", deployer)) as FusePoolDirectory;
  const mpo = await hre.ethers.getContract("MasterPriceOracle", deployer);
  const [, pools] = await fpd.callStatic.getAllPools();
  return { pools, fpd, mpo };
}

async function createComptroller(
  pool: FusePoolDirectory.FusePoolStructOutput
): Promise<ComptrollerWithExtension | null> {
  // @ts-ignore
  const midasSdkModule = await import("../../tests/utils/midasSdk");
  const sdk = await midasSdkModule.getOrCreateMidas();
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
    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const { pools, mpo } = await setUpFeeCalculation(hre);
    let fuseFeeTotal = BigNumber.from(0);

    for (const pool of pools) {
      const comptroller = await createComptroller(pool);
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
    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const { pools, mpo } = await setUpFeeCalculation(hre);
    let pluginFeesTotal = BigNumber.from(0);

    for (const pool of pools) {
      const comptroller = await createComptroller(pool);
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
    // @ts-ignore
    const midasSdkModule = await import("../../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    const { pools, mpo } = await setUpFeeCalculation(hre);
    let flywheelFeesTotal = BigNumber.from(0);

    for (const pool of pools) {
      const comptroller = await createComptroller(pool);
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
          const rewardToken = new Contract(
            await flywheelContract.callStatic.rewardToken(),
            sdk.artifacts.ERC20.abi,
            deployer
          );
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
