import axios from "axios";
import { DeploymentsExtension } from "hardhat-deploy/types";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address, formatEther, GetContractReturnType, parseEther } from "viem";
import { IonicComptroller$Type } from "../../artifacts/contracts/compound/ComptrollerInterface.sol/IonicComptroller";

const LOG = process.env.LOG ? true : false;

type Pool = {
  name: string;
  creator: `0x${string}`;
  comptroller: `0x${string}`;
  blockPosted: bigint;
  timestampPosted: bigint;
};

async function setUpFeeCalculation({ viem, deployments }: HardhatRuntimeEnvironment) {
  const fpd = await viem.getContractAt("PoolDirectory", (await deployments.get("PoolDirectory")).address as Address);
  const mpo = await viem.getContractAt(
    "MasterPriceOracle",
    (await deployments.get("MasterPriceOracle")).address as Address
  );
  const [, pools] = await fpd.read.getActivePools();
  return { pools, fpd, mpo };
}

async function cgPrice(cgId: string) {
  const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${cgId}`);
  return data[cgId].usd;
}

async function createComptroller(
  viem: HardhatRuntimeEnvironment["viem"],
  pool: Pool,
  deployments: DeploymentsExtension
): Promise<GetContractReturnType<IonicComptroller$Type["abi"]> | undefined> {
  const comptroller = await viem.getContractAt("IonicComptroller", pool.comptroller as Address);
  const poolAdmin = await comptroller.read.ionicAdmin();

  if (poolAdmin != (await deployments.get("FeeDistributor")).address) {
    console.log(`Skipping pool: ${pool.name} (${pool.comptroller}) because it is not managed by FeeDistributor`);
    return;
  }
  return comptroller;
}

export default task("revenue:admin:calculate", "Calculate the fees accrued from Admin and Ionic Fees").setAction(
  async (_, hre) => {
    const { pools, mpo } = await setUpFeeCalculation(hre);
    let ionicFeeTotal = 0n;
    let adminFeeTotal = 0n;

    for (const pool of pools) {
      const comptroller = await hre.viem.getContractAt("IonicComptroller", pool.comptroller);
      const markets = await comptroller.read.getAllMarkets();
      let poolIonicFeesTotal = 0n;
      let poolAdminFeesTotal = 0n;

      for (const market of markets) {
        const cToken = await hre.viem.getContractAt("ICErc20", market);
        const underlying = await cToken.read.underlying();
        const underlyingPrice = await mpo.read.getUnderlyingPrice([market]);

        const ionicFee = await cToken.read.totalIonicFees();
        const adminFee = await cToken.read.totalAdminFees();

        if (ionicFee > 0n) {
          const nativeFee = (ionicFee * underlyingPrice) / 10n ** 18n;
          ionicFeeTotal = ionicFeeTotal + nativeFee;
          poolIonicFeesTotal = poolIonicFeesTotal + nativeFee;

          console.log(
            `Pool: ${pool.name} (${
              pool.comptroller
            }) - Market: ${market} (underlying: ${underlying}) - Ionic Fee: ${formatEther(nativeFee)}`
          );
        } else {
          console.log(`Pool: ${pool.name} (${pool.comptroller}) - Market: ${market} - No Ionic Fees`);
        }

        if (adminFee > 0) {
          const nativeFee = (adminFee * underlyingPrice) / 10n ** 18n;
          adminFeeTotal = adminFeeTotal + nativeFee;
          poolAdminFeesTotal = poolAdminFeesTotal + nativeFee;

          console.log(
            `Pool: ${pool.name} (${
              pool.comptroller
            }) - Market: ${market} (underlying: ${underlying}) - Admin Fee: ${formatEther(nativeFee)}`
          );
        } else {
          console.log(`Pool: ${pool.name} (${pool.comptroller}) - Market: ${market} - No Admin Fees`);
        }
      }
      if (LOG) {
        console.log(`Pool: ${pool.name} (${pool.comptroller}) - Total Ionic Fee: ${formatEther(poolIonicFeesTotal)}`);

        console.log(`Pool: ${pool.name} (${pool.comptroller}) - Total Admin Fee: ${formatEther(poolAdminFeesTotal)}`);
      }
    }
    console.log(`Total Ionic Fees: ${formatEther(ionicFeeTotal)}`);
    console.log(`Total Admin Fees: ${formatEther(adminFeeTotal)}`);
    console.log(`Total Fees: ${formatEther(ionicFeeTotal + adminFeeTotal)}`);
    return ionicFeeTotal;
  }
);

task("revenue:reserve:calculate", "Calculate the fees accrued towards Reserves").setAction(async (_, hre) => {
  const { pools, mpo } = await setUpFeeCalculation(hre);
  let reservesTotal = 0n;

  for (const pool of pools) {
    const comptroller = await hre.viem.getContractAt("IonicComptroller", pool.comptroller);
    const markets = await comptroller.read.getAllMarkets();
    let poolReservesTotal = 0n;

    for (const market of markets) {
      const cToken = await hre.viem.getContractAt("ICErc20", market);
      const underlying = await cToken.read.underlying();
      const underlyingPrice = await mpo.read.getUnderlyingPrice([market]);

      const totalReserves = await cToken.read.totalReserves();

      if (totalReserves > 0) {
        const nativeFee = (totalReserves * underlyingPrice) / 10n ** 18n;
        reservesTotal = reservesTotal + nativeFee;
        poolReservesTotal = poolReservesTotal + nativeFee;

        console.log(
          `Pool: ${pool.name} (${
            pool.comptroller
          }) - Market: ${market} (underlying: ${underlying}) - Ionic Fee: ${formatEther(nativeFee)}`
        );
      } else {
        console.log(`Pool: ${pool.name} (${pool.comptroller}) - Market: ${market} - No Ionic Fees`);
      }
    }
    console.log(`Pool: ${pool.name} (${pool.comptroller}) - Total Reserves: ${formatEther(poolReservesTotal)}`);
  }
  console.log(`Total Reserves: ${formatEther(reservesTotal)}`);
  return reservesTotal;
});

task("revenue:flywheels:calculate", "Calculate the fees accrued from 4626 Performance Fees").setAction(
  async (_, hre) => {
    const { pools, mpo } = await setUpFeeCalculation(hre);

    let flywheelFeesTotal = 0n;

    for (const pool of pools) {
      const comptroller = await hre.viem.getContractAt("IonicComptroller", pool.comptroller);
      const flywheels = await comptroller.read.getRewardsDistributors();
      let flywheelFeesPool = 0n;

      for (const flywheel of flywheels) {
        const flywheelContract = await hre.viem.getContractAt("IonicFlywheel", flywheel);

        try {
          await flywheelContract.read.performanceFee();
        } catch {
          console.log(
            `Pool: ${pool.name} (${pool.comptroller}) - Flywheel: ${flywheel} - Not a Performance Fee flywheel`
          );
        }
        try {
          const performanceFeeRewardTokens = (
            await flywheelContract.simulate.rewardsAccrued([await flywheelContract.read.feeRecipient()])
          ).result;
          const rewardToken = await hre.viem.getContractAt("ERC20", await flywheelContract.read.rewardToken());
          const rewardTokenPrice = await mpo.read.price([rewardToken.address]);

          const nativeFee =
            (performanceFeeRewardTokens * rewardTokenPrice) / 10n ** BigInt(await rewardToken.read.decimals());

          flywheelFeesTotal = flywheelFeesTotal + nativeFee;
          flywheelFeesPool = flywheelFeesPool + nativeFee;
        } catch (e) {
          if (LOG)
            console.log(`Pool: ${pool.name} (${pool.comptroller}) - Flywheel: ${flywheel} - No Performance Fees`);
        }
      }
      if (LOG)
        console.log(`Pool: ${pool.name} (${pool.comptroller}) - Total Ionic Fee: ${formatEther(flywheelFeesPool)}`);
    }
    console.log(`Total Flywheel Fees: ${formatEther(flywheelFeesTotal)}`);
    return flywheelFeesTotal;
  }
);

task("revenue:all:calculate", "Calculate the fees accrued from 4626 Performance Fees").setAction(async (_, hre) => {
  const adminFees = await hre.run("revenue:admin:calculate");
  const flywheelFees = await hre.run("revenue:flywheels:calculate");
  console.log(`Total Fees: ${formatEther(adminFees + flywheelFees)}`);
});

task("revenue:admin:withdraw", "Calculate the fees accrued from admin fees")
  .addParam("signer", "The address of the current deployer", "deployer", types.string)
  .addParam("threshold", "Threshold for ionic fee seizing denominated in native", "0.01", types.string)
  .setAction(async (taskArgs, hre) => {
    const publicClient = await hre.viem.getPublicClient();
    const { deployer } = await hre.getNamedAccounts();
    const cgId = "ethereum";

    const { pools, mpo } = await setUpFeeCalculation(hre);
    for (const pool of pools) {
      const comptroller = await hre.viem.getContractAt("IonicComptroller", pool.comptroller);
      const markets = await comptroller.read.getAllMarkets();
      const threshold = parseEther(taskArgs.threshold);
      const priceUsd = await cgPrice(cgId);
      console.log("priceUsd: ", priceUsd);

      for (const market of markets) {
        const cToken = await hre.viem.getContractAt("ICErc20", market);
        const underlying = await cToken.read.underlying();
        const ionicFee = await cToken.read.totalIonicFees();
        const nativePrice = await mpo.read.price([underlying]);
        console.log("native price", formatEther(nativePrice));
        const nativeFee = (ionicFee * nativePrice) / 10n ** 18n;

        console.log("USD FEE VALUE", parseFloat(formatEther(nativeFee)) * priceUsd);
        console.log("USD THRESHOLD VALUE", parseFloat(taskArgs.threshold) * priceUsd);

        // if (ionicFee > threshold) {
        // const accTx = await cToken.accrueInterest();
        // await accTx.wait();
        console.log(`Withdrawing fee from ${await cToken.read.symbol()} (underlying: ${underlying})`);
        console.log("deployer: ", deployer);
        let tx = await cToken.write._withdrawIonicFees([ionicFee]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log("tx: ", tx);
        console.log(
          `Pool: ${comptroller.address} - Market: ${market} (underlying: ${underlying}) - Ionic Fee: ${formatEther(
            nativeFee
          )}`
        );
        // } else {
        //   console.log(`Pool: ${comptroller.address} - Market: ${market} - No Ionic Fees: ${ionicFee}`);
        // }

        const adminFee = await cToken.read.totalAdminFees();
        const nativeFeeAdmin = (adminFee * nativePrice) / 10n ** 18n;

        console.log("USD FEE VALUE", parseFloat(formatEther(nativeFeeAdmin)) * priceUsd);
        console.log("USD THRESHOLD VALUE", parseFloat(taskArgs.threshold) * priceUsd);
        // if (adminFee > threshold) {
        // const accTx = await cToken.accrueInterest();
        // await accTx.wait();
        console.log(`Withdrawing fee from ${await cToken.read.symbol()} (underlying: ${underlying})`);
        tx = await cToken.write._withdrawAdminFees([adminFee]);
         await publicClient.waitForTransactionReceipt({ hash: tx });
         console.log("tx: ", tx);
         console.log(
           `Pool: ${comptroller.address} - Market: ${market} (underlying: ${underlying}) - Admin Fee: ${formatEther(
             nativeFeeAdmin
           )}`
         );
        // } else {
        //   console.log(`Pool: ${comptroller.address} - Market: ${market} - No Ionic Fees: ${ionicFee}`);
        // }
      }
    }
  });
