import { ComptrollerWithExtension } from "@ionicprotocol/liquidity-monitor/src/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import axios from "axios";
import { BigNumber, Contract, providers } from "ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import ERC20Abi from "../../artifacts/EIP20Interface.sol/EIP20Interface.json";
import { IonicERC4626 } from "../../typechain/IonicERC4626";
import { PoolDirectory } from "../../typechain/PoolDirectory";

const LOG = process.env.LOG ? true : false;

async function setUpFeeCalculation(hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.ethers.getNamedSigners();
  const fpd = (await hre.ethers.getContract("PoolDirectory", deployer)) as PoolDirectory;
  const mpo = await hre.ethers.getContract("MasterPriceOracle", deployer);
  const [, pools] = await fpd.callStatic.getActivePools();
  return { pools, fpd, mpo };
}

async function cgPrice(cgId: string) {
  const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${cgId}`);
  return data[cgId].usd;
}

async function createComptroller(
  pool: PoolDirectory.PoolStructOutput,
  deployer: SignerWithAddress
): Promise<ComptrollerWithExtension | null> {
  const ionicSdkModule = await import("../ionicSdk");
  const sdk = await ionicSdkModule.getOrCreateIonic(deployer);
  const comptroller = sdk.createComptroller(pool.comptroller);
  const poolAdmin = await comptroller.callStatic.ionicAdmin();

  if (poolAdmin != sdk.contracts.FeeDistributor.address) {
    if (LOG)
      console.log(`Skipping pool: ${pool.name} (${pool.comptroller}) because it is not managed by FeeDistributor`);
    return null;
  }
  return comptroller;
}

export default task("revenue:admin:calculate", "Calculate the fees accrued from Admin and Ionic Fees").setAction(
  async (taskArgs, hre) => {
    const { deployer } = await hre.ethers.getNamedSigners();

    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic();

    const { pools, mpo } = await setUpFeeCalculation(hre);
    let ionicFeeTotal = BigNumber.from(0);
    let adminFeeTotal = BigNumber.from(0);

    for (const pool of pools) {
      const comptroller = await createComptroller(pool, deployer);
      if (comptroller === null) {
        continue;
      }
      const markets = await comptroller.callStatic.getAllMarkets();
      let poolIonicFeesTotal = BigNumber.from(0);
      let poolAdminFeesTotal = BigNumber.from(0);

      for (const market of markets) {
        const cToken = sdk.createICErc20(market, deployer);
        const underlying = await cToken.callStatic.underlying();
        const underlyingPrice = await mpo.callStatic.getUnderlyingPrice(market);

        const ionicFee = await cToken.callStatic.totalIonicFees();
        const adminFee = await cToken.callStatic.totalAdminFees();

        if (ionicFee.gt(0)) {
          const nativeFee = ionicFee.mul(underlyingPrice).div(BigNumber.from(10).pow(18));
          ionicFeeTotal = ionicFeeTotal.add(nativeFee);
          poolIonicFeesTotal = poolIonicFeesTotal.add(nativeFee);

          if (LOG)
            console.log(
              `Pool: ${pool.name} (${
                pool.comptroller
              }) - Market: ${market} (underlying: ${underlying}) - Ionic Fee: ${hre.ethers.utils.formatEther(
                nativeFee
              )}`
            );
        } else {
          if (LOG) console.log(`Pool: ${pool.name} (${pool.comptroller}) - Market: ${market} - No Ionic Fees`);
        }

        if (adminFee.gt(0)) {
          const nativeFee = adminFee.mul(underlyingPrice).div(BigNumber.from(10).pow(18));
          adminFeeTotal = adminFeeTotal.add(nativeFee);
          poolAdminFeesTotal = poolAdminFeesTotal.add(nativeFee);

          if (LOG)
            console.log(
              `Pool: ${pool.name} (${
                pool.comptroller
              }) - Market: ${market} (underlying: ${underlying}) - Ionic Fee: ${hre.ethers.utils.formatEther(
                nativeFee
              )}`
            );
        } else {
          if (LOG) console.log(`Pool: ${pool.name} (${pool.comptroller}) - Market: ${market} - No Ionic Fees`);
        }
      }
      if (LOG) {
        console.log(
          `Pool: ${pool.name} (${pool.comptroller}) - Total Ionic Fee: ${hre.ethers.utils.formatEther(
            poolIonicFeesTotal
          )}`
        );

        console.log(
          `Pool: ${pool.name} (${pool.comptroller}) - Total Admin Fee: ${hre.ethers.utils.formatEther(
            poolAdminFeesTotal
          )}`
        );
      }
    }
    console.log(`Total Ionic Fees: ${hre.ethers.utils.formatEther(ionicFeeTotal)}`);
    console.log(`Total Admin Fees: ${hre.ethers.utils.formatEther(adminFeeTotal)}`);
    console.log(`Total Fees: ${hre.ethers.utils.formatEther(ionicFeeTotal.add(adminFeeTotal))}`);
    return ionicFeeTotal;
  }
);

task("revenue:reserve:calculate", "Calculate the fees accrued towards Reserves").setAction(async (taskArgs, hre) => {
  const { deployer } = await hre.ethers.getNamedSigners();

  const ionicSdkModule = await import("../ionicSdk");
  const sdk = await ionicSdkModule.getOrCreateIonic();

  const { pools, mpo } = await setUpFeeCalculation(hre);
  let reservesTotal = BigNumber.from(0);

  for (const pool of pools) {
    const comptroller = await createComptroller(pool, deployer);
    if (comptroller === null) {
      continue;
    }
    const markets = await comptroller.callStatic.getAllMarkets();
    let poolReservesTotal = BigNumber.from(0);

    for (const market of markets) {
      const cToken = sdk.createICErc20(market, deployer);
      const underlying = await cToken.callStatic.underlying();
      const underlyingPrice = await mpo.callStatic.getUnderlyingPrice(market);

      const totalReserves = await cToken.callStatic.totalReserves();

      if (totalReserves.gt(0)) {
        const nativeFee = totalReserves.mul(underlyingPrice).div(BigNumber.from(10).pow(18));
        reservesTotal = reservesTotal.add(nativeFee);
        poolReservesTotal = poolReservesTotal.add(nativeFee);

        if (LOG)
          console.log(
            `Pool: ${pool.name} (${
              pool.comptroller
            }) - Market: ${market} (underlying: ${underlying}) - Ionic Fee: ${hre.ethers.utils.formatEther(nativeFee)}`
          );
      } else {
        if (LOG) console.log(`Pool: ${pool.name} (${pool.comptroller}) - Market: ${market} - No Ionic Fees`);
      }
    }
    if (LOG) {
      console.log(
        `Pool: ${pool.name} (${pool.comptroller}) - Total Reserves: ${hre.ethers.utils.formatEther(poolReservesTotal)}`
      );
    }
  }
  console.log(`Total Reserves: ${hre.ethers.utils.formatEther(reservesTotal)}`);
  return reservesTotal;
});

task("revenue:4626:calculate", "Calculate the fees accrued from 4626 Performance Fees").setAction(
  async (taskArgs, hre) => {
    const { deployer } = await hre.ethers.getNamedSigners();

    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic();

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
        const cToken = sdk.createICErc20PluginRewards(market, deployer);
        const underlying = await cToken.callStatic.underlying();
        const underlyingDecimals = await cToken.callStatic.decimals();

        let plugin;

        try {
          plugin = await cToken.callStatic.plugin();
        } catch {
          continue;
        }
        try {
          const pluginContract = await hre.ethers.getContractAt("IonicERC4626", plugin);
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
          `Pool: ${pool.name} (${pool.comptroller}) - Total Ionic Fee: ${hre.ethers.utils.formatEther(pluginFeesPool)}`
        );
    }
    console.log(`Total Plugin Fees: ${hre.ethers.utils.formatEther(pluginFeesTotal)}`);
    return pluginFeesTotal;
  }
);

task("revenue:flywheels:calculate", "Calculate the fees accrued from 4626 Performance Fees").setAction(
  async (taskArgs, hre) => {
    const { deployer } = await hre.ethers.getNamedSigners();

    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic();

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
        const flywheelContract = sdk.createIonicFlywheel(flywheel, deployer);

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
          const rewardToken = new Contract(await flywheelContract.callStatic.rewardToken(), ERC20Abi.abi, deployer);
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
          `Pool: ${pool.name} (${pool.comptroller}) - Total Ionic Fee: ${hre.ethers.utils.formatEther(
            flywheelFeesPool
          )}`
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

task("revenue:admin:withdraw", "Calculate the fees accrued from admin fees")
  .addParam("signer", "The address of the current deployer", "deployer", types.string)
  .addParam("threshold", "Threshold for ionic fee seizing denominated in native", "0.01", types.string)
  .setAction(async (taskArgs, hre) => {
    const deployer = await hre.ethers.getNamedSigner("deployer");

    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(deployer);
    const cgId = sdk.chainSpecificParams.cgId;

    const { pools, mpo } = await setUpFeeCalculation(hre);
    for (const pool of pools) {
      const comptroller = await createComptroller(pool, deployer);
      // Skip  Polygon Jarvis jFiat
      if (comptroller === null || comptroller.address === "0xD265ff7e5487E9DD556a4BB900ccA6D087Eb3AD2") {
        continue;
      }
      const markets = await comptroller.callStatic.getAllMarkets();
      const threshold = hre.ethers.utils.parseEther(taskArgs.threshold);
      const priceUsd = await cgPrice(cgId);

      for (const market of markets) {
        const cToken = sdk.createICErc20(market, deployer);
        const underlying = await cToken.callStatic.underlying();
        const ionicFee = await cToken.callStatic.totalIonicFees();
        const nativePrice = await mpo.callStatic.price(underlying);
        console.log("native price", hre.ethers.utils.formatEther(nativePrice));
        const nativeFee = ionicFee.mul(nativePrice).div(BigNumber.from(10).pow(18));

        console.log("USD FEE VALUE", parseFloat(hre.ethers.utils.formatEther(nativeFee)) * priceUsd);
        console.log("USD THRESHOLD VALUE", parseFloat(taskArgs.threshold) * priceUsd);

        if (ionicFee.gt(threshold)) {
          // const accTx = await cToken.accrueInterest();
          // await accTx.wait();
          console.log(`Withdrawing fee from ${await cToken.callStatic.symbol()} (underlying: ${underlying})`);
          const tx = await cToken._withdrawIonicFees(ionicFee);
          await tx.wait();
          if (LOG)
            console.log(
              `Pool: ${comptroller} - Market: ${market} (underlying: ${underlying}) - Ionic Fee: ${hre.ethers.utils.formatEther(
                nativeFee
              )}`
            );
        } else {
          if (LOG) console.log(`Pool: ${comptroller} - Market: ${market} - No Ionic Fees`);
        }
      }
    }
  });

task("revenue:4626:withdraw", "Calculate the fees accrued from 4626 Performance Fees")
  .addParam("signer", "The address of the current deployer", "deployer", types.string)
  .addParam("threshold", "Threshold for ionic fee seizing denominated in native", "0.01", types.string)
  .setAction(async (taskArgs, hre) => {
    let tx: providers.TransactionResponse;
    const deployer = await hre.ethers.getNamedSigner("deployer");

    const ionicSdkModule = await import("../ionicSdk");
    const sdk = await ionicSdkModule.getOrCreateIonic(deployer);
    const plugins = sdk.deployedPlugins;
    const cgId = sdk.chainSpecificParams.cgId;

    const threshold = hre.ethers.utils.parseEther(taskArgs.threshold);

    const priceUsd = await cgPrice(cgId);

    for (const pluginAddress of Object.keys(plugins)) {
      if (
        pluginAddress === "0x7B77E7713FB2950326B0dE483852da0e1d975d4C" ||
        pluginAddress === "0x23bBcF59BF843cD55c4DA9bDB81429695C87f847" ||
        pluginAddress === "0xBE0cCFA6B09eB1f3C0c62D406aE00F528e20594b" ||
        pluginAddress === "0xe38A0F34DB15fCC47510cdB0519E149eC20c8806" ||
        pluginAddress === "0xc2Af1451dBFbf564FB32E57f275d419395F5BC92" ||
        pluginAddress === "0x628C6d2236fC1712D66Df5fbFf9041f7809C959C" ||
        pluginAddress === "0xA331FaA3Bb84A70466c801E9b14523d8f15f328E" ||
        pluginAddress === "0x29b2aB4102d7aF1CDCF9c84D29D18dC2cFf11f1A" ||
        pluginAddress === "0xcfB267a90974a172c38Af238b1010672DE4479Ad" ||
        pluginAddress === "0xCeB429c710D523d8243833018852Bbad2CEA9Bb4" ||
        pluginAddress === "0x643fd5AB2485dF7D9Ad43C4c210AbEc8Ae7e44D8" ||
        pluginAddress === "0x0b4444F3FB85264427397Fede0f94704aa3828b9" ||
        pluginAddress === "0xBCAc816440f7ef66Fea896b307352b86a83F94E8" ||
        pluginAddress === "0xac99ced1a1310fB04618d4801888120ccDD7B87B" ||
        pluginAddress === "0xDE1A82D80082e6b6E9cbe70002857716A09EA18b" ||
        // HelioHAY:execution reverted: fee recipient not initialize
        pluginAddress === "0x369ddC01E8feF7350Eb740f4a32647E8640F0A17" ||
        // sAMM jBRL-BRZ LP Vault :execution reverted: fee recipient not initialize
        pluginAddress === "0x33395bbe8fcA14368003f9aCE2Deb0Ba5103c670"
      ) {
        continue;
      }
      const market = plugins[pluginAddress].market;
      const cToken = sdk.createICErc20(market, deployer);
      // const accTx = await cToken.accrueInterest();
      // await accTx.wait();
      const underlying = await cToken.callStatic.underlying();
      const plugin = (await hre.ethers.getContractAt("IonicERC4626", pluginAddress, deployer)) as IonicERC4626;

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
            } - Market: ${market} (underlying: ${underlying}) - Ionic Fee: ${hre.ethers.utils.formatEther(nativeFee)}`
          );
      } else {
        if (LOG) console.log(`Pool: ${await cToken.callStatic.comptroller()} - Market: ${market} - No Ionic Fees`);
      }
    }
  });
