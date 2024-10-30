import { task, types } from "hardhat/config";
import { Address, Hash, parseUnits, zeroAddress } from "viem";
import { prepareAndLogTransaction } from "../../chainDeploy/helpers/logging";

export default task("market:unsupport", "Unsupport a market")
  .addParam("pool", "Comptroller Address", undefined, types.string)
  .addParam("market", "The address of the ctoken to unsupport", undefined, types.string)
  .setAction(async ({ pool, market }, { viem }) => {
    const publicClient = await viem.getPublicClient();
    const comptroller = await viem.getContractAt("IonicComptroller", pool as Address);
    const tx = await comptroller.write._unsupportMarket([market]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log("Unsupported market with status:", receipt.status);
  });

task("market:set:ltv", "Set the LTV (loan to value / collateral factor) of a market")
  .addParam("marketAddress", "Address of the market", undefined, types.string)
  .addParam("ltv", "The LTV as a floating point value between 0 and 1", undefined, types.string)
  .setAction(async ({ marketAddress, ltv }, { viem, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();
    const market = await viem.getContractAt("ICErc20", marketAddress);
    const poolAddress = await market.read.comptroller();
    const pool = await viem.getContractAt("IonicComptroller", poolAddress as Address);
    const ltvMantissa = parseUnits(ltv, 18);
    console.log(`will set the LTV of market ${marketAddress} to ${ltvMantissa}`);

    const _market = await pool.read.markets([marketAddress]);
    const currentLtv = _market[1];
    console.log("currentLtv: ", currentLtv);
    if (currentLtv === ltvMantissa) {
      console.log(`LTV is already set to ${ltvMantissa}`);
      return;
    }

    if ((await pool.read.admin()).toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: pool,
        functionName: "_setCollateralFactor",
        args: [marketAddress, ltvMantissa],
        description: "Set Collateral Factor",
        inputs: [
          { internalType: "address", name: "cToken", type: "address" },
          { internalType: "uint256", name: "newCollateralFactorMantissa", type: "uint256" }
        ]
      });
    } else {
      const tx = await pool.write._setCollateralFactor([marketAddress, ltvMantissa]);
      console.log(`_setCollateralFactor tx ${tx}`);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`mined tx ${tx}`);
    }
  });

task("markets:set:fees", "Set the fees of all markets").setAction(async (_, { viem, deployments, run }) => {
  const DESIRED_ADMIN_FEE = "0";
  const DESIRED_RESERVE_FACTOR = "0.05";

  const poolDirectory = await viem.getContractAt(
    "PoolDirectory",
    (await deployments.get("PoolDirectory")).address as Address
  );

  const [, poolData] = await poolDirectory.read.getActivePools();

  for (const pool of poolData) {
    const comptroller = await viem.getContractAt("IonicComptroller", pool.comptroller);

    const markets = await comptroller.read.getAllMarkets();

    for (const market of markets) {
      await run("market:set:admin-fee", { marketAddress: market, fee: DESIRED_ADMIN_FEE });
      await run("market:set:reserve-factor", { marketAddress: market, factor: DESIRED_RESERVE_FACTOR });
    }
  }
});

task("market:set:admin-fee")
  .addParam("marketAddress", "Address of the market", undefined, types.string)
  .addParam("fee", "The fee as a floating point value between 0 and 1", undefined, types.string)
  .setAction(async ({ marketAddress, fee }, { viem, getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    console.log("deployer: ", deployer);
    const publicClient = await viem.getPublicClient();
    const market = await viem.getContractAt("ICErc20", marketAddress);
    const feeMantissa = parseUnits(fee, 18);
    console.log(`will set the admin fee of market ${marketAddress} to ${feeMantissa}`);
    const currentFee = await market.read.adminFeeMantissa();
    console.log("currentFee: ", currentFee);
    if (currentFee === feeMantissa) {
      console.log(`Admin fee is already set to ${feeMantissa}`);
      return;
    }
    const feeDistributor = await viem.getContractAt(
      "FeeDistributor",
      (await deployments.get("FeeDistributor")).address as Address
    );

    const admin = await feeDistributor.read.owner();
    console.log("admin: ", admin);
    if (admin.toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: market,
        functionName: "_setAdminFee",
        args: [String(feeMantissa)],
        description: "Set Admin Fee",
        inputs: [{ internalType: "uint256", name: "newAdminFeeMantissa", type: "uint256" }]
      });
    } else {
      const tx = await market.write._setAdminFee([feeMantissa]);
      console.log(`_setAdminFee tx ${tx}`);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`mined tx ${tx}`);
    }
  });

task("market:set:reserve-factor")
  .addParam("marketAddress", "Address of the market", undefined, types.string)
  .addParam("factor", "The factor as a floating point value between 0 and 1", undefined, types.string)
  .setAction(async ({ marketAddress, factor }, { viem, getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    console.log("deployer: ", deployer);
    const publicClient = await viem.getPublicClient();
    const market = await viem.getContractAt("ICErc20", marketAddress);
    const factorMantissa = parseUnits(factor, 18);
    console.log(`will set the reserve factor of market ${marketAddress} to ${factorMantissa}`);
    const currentFactor = await market.read.reserveFactorMantissa();
    console.log("currentFactor: ", currentFactor);
    if (currentFactor === factorMantissa) {
      console.log(`Reserve factor is already set to ${factorMantissa}`);
      return;
    }

    const feeDistributor = await viem.getContractAt(
      "FeeDistributor",
      (await deployments.get("FeeDistributor")).address as Address
    );
    const admin = await feeDistributor.read.owner();
    console.log("admin: ", admin);
    if (admin.toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: market,
        functionName: "_setReserveFactor",
        args: [String(factorMantissa)],
        description: "Set Reserve Factor",
        inputs: [{ internalType: "uint256", name: "newReserveFactorMantissa", type: "uint256" }]
      });
    } else {
      const tx = await market.write._setReserveFactor([factorMantissa]);
      console.log(`_setReserveFactor tx ${tx}`);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`mined tx ${tx}`);
    }
  });

task("market:mint-pause", "Pauses minting on a market")
  .addParam("markets", "The address of the CTokens", undefined, types.string)
  .addOptionalParam("paused", "If the market should be paused or not", true, types.boolean)
  .setAction(async (taskArgs, { viem, getNamedAccounts }) => {
    const publicClient = await viem.getPublicClient();
    const { deployer } = await getNamedAccounts();
    let tx: Hash;

    const markets: Address[] = taskArgs.markets.split(",");

    for (const marketAddress of markets) {
      console.log(`Operating on market: ${marketAddress}`);
      const market = await viem.getContractAt("ICErc20", marketAddress);
      const comptroller = await market.read.comptroller();
      const pool = await viem.getContractAt("IonicComptroller", comptroller);

      const currentPauseGuardian = await pool.read.pauseGuardian();
      if (currentPauseGuardian === zeroAddress) {
        tx = await pool.write._setPauseGuardian([deployer as Address]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`Set the pause guardian to ${deployer}`);
      }

      const isPaused: boolean = await pool.read.mintGuardianPaused([market.address]);
      console.log(`The market at ${market.address} minting pause is currently set to ${isPaused}`);

      const admin = await pool.read.admin();
      if (isPaused != taskArgs.paused) {
        if (admin.toLowerCase() !== deployer.toLowerCase()) {
          await prepareAndLogTransaction({
            contractInstance: pool,
            functionName: "_setMintPaused",
            args: [market.address, taskArgs.paused],
            description: "Set Mint Pause",
            inputs: [
              { internalType: "address", name: "cToken", type: "address" },
              { internalType: "bool", name: "state", type: "bool" }
            ]
          });
        } else {
          tx = await pool.write._setMintPaused([market.address, taskArgs.paused]);
        }

        console.log(`Market mint pause tx ${tx}`);
      } else {
        console.log(`No need to set the minting pause to ${taskArgs.paused} as it is already set to that value`);
      }

      const isPausedAfter: boolean = await pool.read.mintGuardianPaused([market.address]);

      console.log(`The market at ${market.address} minting pause has been to ${isPausedAfter}`);
    }
  });

task("markets:borrow-pause", "Pauses borrowing on a market")
  .addParam("markets", "The address of the CToken", undefined, types.string)
  .addOptionalParam("paused", "If the market should be paused or not", true, types.boolean)
  .setAction(async (taskArgs, { viem, getNamedAccounts }) => {
    let tx: Hash;
    const publicClient = await viem.getPublicClient();
    const { deployer } = await getNamedAccounts();
    const markets: Address[] = taskArgs.markets.split(",");

    for (const marketAddress of markets) {
      console.log(`Operating on market: ${marketAddress}`);
      const market = await viem.getContractAt("ICErc20", marketAddress);
      const comptroller = await market.read.comptroller();
      const pool = await viem.getContractAt("IonicComptroller", comptroller);

      const currentPauseGuardian = await pool.read.pauseGuardian();
      console.log(`pool ${pool.address} guardian ${currentPauseGuardian}`);
      if (currentPauseGuardian === zeroAddress) {
        tx = await pool.write._setPauseGuardian([deployer as Address]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`Set the pause guardian to ${deployer}`);
      }

      const isPaused: boolean = await pool.read.borrowGuardianPaused([market.address]);
      const admin = await pool.read.admin();
      if (isPaused != taskArgs.paused) {
        if (admin.toLowerCase() !== deployer.toLowerCase()) {
          await prepareAndLogTransaction({
            contractInstance: pool,
            functionName: "_setBorrowPaused",
            args: [market.address, taskArgs.paused],
            description: "Set Borrow Pause",
            inputs: [
              { internalType: "address", name: "cToken", type: "address" },
              { internalType: "bool", name: "state", type: "bool" }
            ]
          });
        } else {
          tx = await pool.write._setBorrowPaused([market.address, taskArgs.paused]);
        }

        console.log(`Market borrow pause tx ${tx}`);
      } else {
        console.log(`No need to set the borrow pause to ${taskArgs.paused} as it is already set to that value`);
      }

      const isPausedAfter: boolean = await pool.read.borrowGuardianPaused([market.address]);

      console.log(`The market at ${market.address} borrowing pause has been to ${isPausedAfter}`);
    }
  });

task("markets:all:pause", "Pauses borrowing on a market")
  .addOptionalParam("paused", "If the market should be paused or not", true, types.boolean)
  .setAction(async (taskArgs, { viem, getNamedAccounts, deployments, run }) => {
    const poolDirectory = await viem.getContractAt(
      "PoolDirectory",
      (await deployments.get("PoolDirectory")).address as Address
    );

    const [, poolData] = await poolDirectory.read.getActivePools();

    for (const pool of poolData) {
      const poolExtension = await viem.getContractAt("IonicComptroller", pool.comptroller);

      const markets = await poolExtension.read.getAllMarkets();

      await run("markets:borrow-pause", {
        markets: markets.join(","),
        paused: taskArgs.paused
      });
      await run("market:mint-pause", {
        markets: markets.join(","),
        paused: taskArgs.paused
      });
    }
  });
