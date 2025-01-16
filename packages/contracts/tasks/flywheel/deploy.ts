import { viem } from "hardhat";
import { task, types } from "hardhat/config";
import { Address, getAddress, zeroAddress } from "viem";

task("flywheel:deploy-static-rewards-fw", "Deploy static rewards flywheel for LM rewards")
  .addParam("name", "String to append to the flywheel contract name", undefined, types.string)
  .addParam("rewardToken", "Reward token of flywheel", undefined, types.string)
  .addParam("strategies", "address of strategy for which to enable the flywheel", undefined, types.string)
  .addParam("booster", "Kind of booster flywheel to use", "LooplessFlywheelBooster", types.string)
  .addParam("pool", "comptroller to which to add the flywheel", undefined, types.string)
  .setAction(
    async ({ signer, name, rewardToken, strategies, pool, booster }, { viem, deployments, run, getNamedAccounts }) => {
      const { deployer } = await getNamedAccounts();
      const publicClient = await viem.getPublicClient();

      const flywheelBooster = await viem.getContractAt(booster, (await deployments.get(booster)).address as Address);

      console.log({ signer, name, rewardToken, strategies, pool });
      const flywheel = await deployments.deploy(`IonicFlywheel_${name}`, {
        contract: "IonicFlywheel",
        from: deployer,
        log: true,
        proxy: {
          proxyContract: "OpenZeppelinTransparentProxy",
          execute: {
            init: {
              methodName: "initialize",
              args: [rewardToken, zeroAddress, flywheelBooster.address, deployer]
            }
          },
          owner: deployer
        },
        waitConfirmations: 1
      });

      console.log(`Deployed flywheel: ${flywheel.address}`);
      const rewards = await run("flywheel:deploy-static-rewards", { flywheel: flywheel.address, signer, name });
      console.log(`Deployed rewards: ${rewards.address}`);
      const _flywheel = await viem.getContractAt("IonicFlywheel", flywheel.address as Address);
      const tx = await _flywheel.write.setFlywheelRewards([rewards.address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });

      console.log(`Set rewards (${rewards.address}) to flywheel (${flywheel.address})`);
      const strategyAddresses = strategies.split(",");
      for (const strategy of strategyAddresses) {
        console.log(`Adding strategy ${strategy} to flywheel ${flywheel.address}`);
        await run("flywheel:add-strategy-for-rewards", { flywheel: flywheel.address, strategy });
        console.log(`Added strategy (${strategy}) to flywheel (${flywheel.address})`);
      }
      await run("flywheel:add-to-pool", { flywheel: flywheel.address, pool });
      console.log(`Added flywheel (${flywheel.address}) to pool (${pool})`);
    }
  );

task("flywheel:deploy-static-rewards", "Deploy static rewards flywheel for LM rewards")
  .addParam("name", "String to append to the flywheel contract name", undefined, types.string)
  .addParam("flywheel", "flywheel to which to add the rewards contract", undefined, types.string)
  .setAction(async ({ name, flywheel }, { viem, deployments, getNamedAccounts }) => {
    const publicClient = await viem.getPublicClient();
    const { deployer } = await getNamedAccounts();
    const rewards = await deployments.deploy(`WithdrawableFlywheelStaticRewards_${name}`, {
      contract: "WithdrawableFlywheelStaticRewards",
      from: deployer,
      log: true,
      args: [
        flywheel, // flywheel
        deployer, // owner
        zeroAddress // Authority
      ],
      waitConfirmations: 1
    });

    const flywheelContract = await viem.getContractAt("IonicFlywheel", flywheel);
    const tx = await flywheelContract.write.setFlywheelRewards([rewards.address as Address]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    return rewards;
  });

task("flywheel:add-strategy-for-rewards", "Create pool if does not exist")
  .addParam("signer", "Named account to use fo tx", "deployer", types.string)
  .addParam("flywheel", "address of flywheel", undefined, types.string)
  .addParam("strategy", "address of strategy", undefined, types.string)
  .addParam("name", "flywheel contract name", undefined, types.string)
  .setAction(async (taskArgs, { viem }) => {
    const publicClient = await viem.getPublicClient();
    let flywheelAddress, strategyAddress, name, contractName;

    try {
      flywheelAddress = getAddress(taskArgs.flywheel);
    } catch {
      throw `Invalid 'flywheel': ${taskArgs.flywheel}`;
    }

    try {
      strategyAddress = getAddress(taskArgs.strategy);
    } catch {
      throw `Invalid 'strategy': ${taskArgs.strategy}`;
    }

    if (taskArgs.name.includes("Borrow")) {
      contractName = "IonicFlywheelBorrow";
    } else contractName = "IonicFlywheel";
  
    const flywheel = await viem.getContractAt(`${contractName}`, flywheelAddress);
    const addTx = await flywheel.write.addStrategyForRewards([strategyAddress]);
    await publicClient.waitForTransactionReceipt({ hash: addTx });
    console.log(addTx);
  });

task("flywheel:add-to-pool", "Create pool if does not exist")
  .addParam("signer", "Named account to use fo tx", "deployer", types.string)
  .addParam("flywheel", "address of flywheel", undefined, types.string)
  .addParam("pool", "address of comptroller", undefined, types.string)
  .setAction(async (taskArgs, { viem }) => {
    const publicClient = await viem.getPublicClient();
    let flywheelAddress, poolAddress;

    try {
      flywheelAddress = getAddress(taskArgs.flywheel);
    } catch {
      throw `Invalid 'flywheel': ${taskArgs.flywheel}`;
    }

    try {
      poolAddress = getAddress(taskArgs.pool);
    } catch {
      throw `Invalid 'pool': ${taskArgs.pool}`;
    }

    const comptroller = await viem.getContractAt("IonicComptroller", poolAddress);
    const rewardsDistributors = (await comptroller.read.getRewardsDistributors()) as Address[];
    if (!rewardsDistributors.map((s) => s.toLowerCase()).includes(flywheelAddress.toLowerCase())) {
      const addTx = await comptroller.write._addRewardsDistributor([flywheelAddress]);
      await publicClient.waitForTransactionReceipt({ hash: addTx });
      console.log({ addTx });
    } else {
      console.log(`Flywheel ${flywheelAddress} already added to pool ${poolAddress}`);
    }
  });

task("flywheel:deploy-dynamic-rewards-fw", "Deploy dynamic rewards flywheel for LM rewards")
  .addParam("name", "String to append to the flywheel contract name", undefined, types.string)
  .addParam("rewardToken", "Reward token of flywheel", undefined, types.string)
  .addParam("booster", "Kind of booster flywheel to use", "IonicFlywheelBorrowBooster", undefined, types.string)
  .addParam("strategies", "address of strategy for which to enable the flywheel", undefined, types.string)
  .addParam("pool", "comptroller to which to add the flywheel", undefined, types.string)
  .setAction(
    async ({ signer, name, rewardToken, strategies, pool, booster }, { viem, deployments, run, getNamedAccounts }) => {
      const { deployer } = await getNamedAccounts();
      const publicClient = await viem.getPublicClient();
      let flywheelBooster;
      let contractName;
      if (booster != "") {
        flywheelBooster = (await deployments.get(booster)).address as Address;
      } else flywheelBooster = zeroAddress;

      if (name.includes("Borrow")) {
        contractName = "IonicFlywheelBorrow";
      } else contractName = "IonicFlywheel";

      const flywheel = await deployments.deploy(`${contractName}_${name}`, {
        contract: contractName,
        from: deployer,
        log: true,
        proxy: {
          proxyContract: "OpenZeppelinTransparentProxy",
          execute: {
            init: {
              methodName: "initialize",
              args: [rewardToken, zeroAddress, flywheelBooster, deployer]
            }
          },
          owner: deployer
        },
        waitConfirmations: 1
      });

      console.log(`Deployed flywheel: ${flywheel.address}`);
      const rewards = await run("flywheel:deploy-dynamic-rewards", { name: name, flywheel: flywheel.address });
      console.log(`Deployed rewards: ${rewards.address}`);
      const _flywheel = await viem.getContractAt(`${contractName}`, flywheel.address as Address);
      const tx = await _flywheel.write.setFlywheelRewards([rewards.address]);
      await publicClient.waitForTransactionReceipt({ hash: tx });

      console.log(`Set rewards (${rewards.address}) to flywheel (${flywheel.address})`);
      const strategyAddresses = strategies.split(",");
      const allFlywheelStrategies = (await _flywheel.read.getAllStrategies()) as Address[];
      for (const strategy of strategyAddresses) {
        if (!allFlywheelStrategies.map((s) => s.toLowerCase()).includes(strategy.toLowerCase())) {
          console.log(`Adding strategy ${strategy} to flywheel ${flywheel.address}`);
          await run("flywheel:add-strategy-for-rewards", {
            flywheel: flywheel.address,
            strategy,
            name: `${contractName}_${name}`
          });
          console.log(`Added strategy (${strategy}) to flywheel (${flywheel.address})`);
        } else console.log(`Strategy (${strategy}) was already added to flywheel (${flywheel.address})`);
      }
      await run("flywheel:add-to-pool", { flywheel: flywheel.address, pool });
      console.log(`Added flywheel (${flywheel.address}) to pool (${pool})`);
    }
  );

task("flywheel:deploy-dynamic-rewards", "Deploy dynamic rewards flywheel for LM rewards")
  .addParam("name", "String to append to the flywheel contract name", undefined, types.string)
  .addParam("flywheel", "flywheel to which to add the rewards contract", undefined, types.string)
  .setAction(async ({ name, flywheel }, { viem, deployments, getNamedAccounts }) => {
    const publicClient = await viem.getPublicClient();
    const { deployer } = await getNamedAccounts();
    let contractName;
    const rewards = await deployments.deploy(`IonicFlywheelDynamicRewards_${name}`, {
      contract: "IonicFlywheelDynamicRewards",
      from: deployer,
      log: true,
      args: [
        flywheel, // flywheel
        2484000 // epoch duration
      ],
      waitConfirmations: 1
    });
  
    if (name.includes("Borrow")) {
      contractName = "IonicFlywheelBorrow";
    } else contractName = "IonicFlywheel";

    const flywheelContract = await viem.getContractAt(
      `${contractName}`,
      (await deployments.get(`${contractName}_${name}`)).address as Address
    );
    const tx = await flywheelContract.write.setFlywheelRewards([rewards.address as Address]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    return rewards;
  });


task("flywheel:deploy-and-replace-withdrawable-dynamic-rewards", "Deploy withdrawable dynamic rewards flywheel for LM rewards")
  .addParam("name", "String to append to the flywheel contract name", undefined, types.string)
  .addParam("flywheel", "flywheel to which to add the rewards contract", undefined, types.string)
  .setAction(async ({ name, flywheel }, { viem, deployments, getNamedAccounts }) => {
    const publicClient = await viem.getPublicClient();
    const { deployer } = await getNamedAccounts();
    let contractName;
    const rewards = await deployments.deploy(`WithdrawableIonicFlywheelDynamicRewards_${name}_withdrawable`, {
      contract: "WithdrawableIonicFlywheelDynamicRewards",
      from: deployer,
      log: true,
      args: [
        flywheel, // flywheel
        2484000 // epoch duration
      ],
      waitConfirmations: 1
    });

    if (name.includes("Borrow")) {
      contractName = "IonicFlywheelBorrow";
    } else contractName = "IonicFlywheel";

    const flywheelContract = await viem.getContractAt(
      `${contractName}`,
      (await deployments.get(`${contractName}_${name}`)).address as Address
    );
    const tx = await flywheelContract.write.setFlywheelRewards([rewards.address as Address]);
    await publicClient.waitForTransactionReceipt({ hash: tx });

    const rewardTokenAddress = await flywheelContract.read.rewardToken() as Address;

    const ionicTokenContract = await viem.getContractAt(
      "IonicToken",
      rewardTokenAddress
    );
    const flywheelRewardsAddress = (await deployments.get(`WithdrawableIonicFlywheelDynamicRewards_${name}_withdrawable`)).address as Address;
    const amount = await ionicTokenContract.read.balanceOf([flywheelRewardsAddress]);

    const flywheelRewardsContract = await viem.getContractAt(
      "WithdrawableIonicFlywheelDynamicRewards",
      flywheelRewardsAddress
    );
    
    const withdrawTx = await flywheelRewardsContract.write.withdraw([amount]);
    await publicClient.waitForTransactionReceipt({ hash: withdrawTx });

    return rewards;
  });

task("flywheel:batch-deploy-and-replace", "Batch deploy and replace withdrawable dynamic rewards flywheels")
  .setAction(async (_, { run }) => {
    const tasks = [
      { name: "ION_epoch7", flywheel: "0xf42dBd423970fd6735a7CE2d850aA85897C79eeE" },
      { name: "hyUSD_v3", flywheel: "0xc39441b305705AfD07de97237bC835a4501AbbEC" },
      { name: "eUSD_v3", flywheel: "0xf638994B1155DfE2cbDd9589365960DD8dcDE6B4" },
      { name: "Borrow_hyUSD", flywheel: "0xC8B73Ea80fBD12e5216F3D2424D3971fAd3e65F9" },
      { name: "hyUSD_epoch5", flywheel: "0xAC717cd20a72470Cb764B518dE561E1fFF41cC22" },
      { name: "eUSD_epoch5", flywheel: "0x1d0a712aE0162431E0573A8a735D02a29805d124" },
      { name: "Borrow_hyUSD_epoch5", flywheel: "0x46F00C2D10fd01a8dc7db996aC4df8FF481B3424" }
    ];

    for (const { name, flywheel } of tasks) {
      console.log(`Running task for name: ${name}, flywheel: ${flywheel}`);
      await run("flywheel:deploy-and-replace-withdrawable-dynamic-rewards", { name, flywheel });
    }
  });

task("flywheel:deploy-borrow-booster", "Deploy flywheel borrow bosster for LM rewards")
  .addParam("name", "String to append to the flywheel contract name", undefined, types.string)
  .setAction(async ({ name, flywheel }, { deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const booster = await deployments.deploy(`IonicFlywheelBorrowBooster_${name}`, {
      contract: "IonicFlywheelBorrowBooster",
      from: deployer,
      log: true,
      args: [],
      waitConfirmations: 1
    });

    return booster;
  });
