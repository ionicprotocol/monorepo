import { task, types } from "hardhat/config";

import { Comptroller } from "../lib/contracts/typechain/Comptroller";

task("flywheel:addStrategyForRewards", "Create pool if does not exist")
  .addParam("signer", "Named account to use fo tx", "deployer", types.string)
  .addParam("flywheel", "address of flywheel", undefined, types.string)
  .addParam("strategy", "address of strategy", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    let signer, flywheelAddress, strategyAddress;
    try {
      signer = await hre.ethers.getNamedSigner(taskArgs.signer);
    } catch {
      throw `Invalid 'signer': ${taskArgs.signer}`;
    }

    try {
      flywheelAddress = hre.ethers.utils.getAddress(taskArgs.flywheel);
    } catch {
      throw `Invalid 'flywheel': ${taskArgs.flywheel}`;
    }

    try {
      strategyAddress = hre.ethers.utils.getAddress(taskArgs.strategy);
    } catch {
      throw `Invalid 'strategy': ${taskArgs.strategy}`;
    }

    // @ts-ignore
    const midasSdkModule = await import("../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas(signer);

    const addTx = await sdk.addStrategyForRewardsToFlywheelCore(flywheelAddress, strategyAddress);
    console.log(addTx);

    const receipt = await addTx.wait();
    console.log(receipt);
  });

task("flywheel:addToPool", "Create pool if does not exist")
  .addParam("signer", "Named account to use fo tx", "deployer", types.string)
  .addParam("flywheel", "address of flywheel", undefined, types.string)
  .addParam("pool", "address of comptroller", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const chainId = await hre.getChainId();
    console.log({ chainId });
    let signer, flywheelAddress, poolAddress;
    try {
      signer = await hre.ethers.getNamedSigner(taskArgs.signer);
    } catch {
      throw `Invalid 'signer': ${taskArgs.signer}`;
    }

    try {
      flywheelAddress = hre.ethers.utils.getAddress(taskArgs.flywheel);
    } catch {
      throw `Invalid 'flywheel': ${taskArgs.flywheel}`;
    }

    try {
      poolAddress = hre.ethers.utils.getAddress(taskArgs.pool);
    } catch {
      throw `Invalid 'pool': ${taskArgs.pool}`;
    }

    // @ts-ignore
    const midasSdkModule = await import("../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas(signer);
    console.log({ sdk });

    const addTx = await sdk.addFlywheelCoreToComptroller(flywheelAddress, poolAddress);
    console.log({ addTx });

    const receipt = await addTx.wait();
    console.log(receipt);
  });

export default task("flyhwheel:nonaccruing", "Sets a flywheel as non-accruing in the comptroller")
  .addParam("signer", "Named account to use fo tx", "deployer", types.string)
  .addParam("flywheel", "address of flywheel", undefined, types.string)
  .addParam("pool", "address of comptroller", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const deployer = await hre.ethers.getNamedSigner(taskArgs.signer);

    const comptroller = (await hre.ethers.getContractAt(
      "Comptroller.sol:Comptroller",
      taskArgs.pool,
      deployer
    )) as Comptroller;

    const tx = await comptroller.addNonAccruingFlywheel(taskArgs.flywheel);
    await tx.wait();
    console.log(`added the flywheel to the non-accruing with tx ${tx.hash}`);
  });
