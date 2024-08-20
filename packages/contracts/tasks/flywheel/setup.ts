import { Deployment } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address, zeroAddress } from "viem";
import { upgradeMarketToSupportFlywheel } from "./upgrade";

export const setupRewards = async (
  type: "supply" | "borrow",
  market: Address,
  rewardTokenName: string,
  rewardToken: Address,
  epochDuration: number,
  deployer: Address,
  viem: HardhatRuntimeEnvironment["viem"],
  deployments: HardhatRuntimeEnvironment["deployments"]
) => {
  const publicClient = await viem.getPublicClient();
  await upgradeMarketToSupportFlywheel(market, viem, deployments);

  let booster: Deployment | undefined;
  let contractName;
  if (type === "borrow") {
    contractName = "IonicFlywheelBorrow";
    booster = await deployments.deploy(`IonicFlywheelBorrowBooster_${rewardTokenName}`, {
      contract: contractName,
      from: deployer,
      log: true,
      waitConfirmations: 1
    });
    console.log(`Deployed booster: ${booster.address}`);
  } else {
    contractName = "IonicFlywheel";
  }

  const _flywheel = await deployments.deploy(`${contractName}_${rewardTokenName}`, {
    contract: contractName,
    from: deployer,
    log: true,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [rewardToken, zeroAddress, type === "borrow" ? booster!.address : zeroAddress, deployer]
        }
      }
    },
    waitConfirmations: 1
  });
  console.log(`Deployed flywheel: ${_flywheel.address}`);

  const flywheelRewards = await deployments.deploy(`IonicFlywheelDynamicRewards_${name}`, {
    contract: "IonicFlywheelDynamicRewards",
    from: deployer,
    log: true,
    args: [
      _flywheel.address, // flywheel
      epochDuration // epoch duration
    ],
    waitConfirmations: 1
  });
  console.log(`Deployed flywheel rewards: ${flywheelRewards.address}`);

  const flywheel = await viem.getContractAt(
    `${contractName}`,
    (await deployments.get(`${contractName}_${rewardTokenName}`)).address as Address
  );

  const txFlywheel = await flywheel.write.setFlywheelRewards([flywheelRewards.address as Address]);
  await publicClient.waitForTransactionReceipt({ hash: txFlywheel });
  console.log(`Set rewards (${flywheelRewards.address}) to flywheel (${flywheel.address})`);

  // Adding strategies to flywheel
  const allFlywheelStrategies = (await flywheel.read.getAllStrategies()) as Address[];
  if (!allFlywheelStrategies.map((s) => s.toLowerCase()).includes(market.toLowerCase())) {
    console.log(`Adding strategy ${market} to flywheel ${flywheel.address}`);
    const addTx = await flywheel.write.addStrategyForRewards([market]);
    await publicClient.waitForTransactionReceipt({ hash: addTx });
    console.log(`Added strategy (${market}) to flywheel (${flywheel.address})`);
  } else console.log(`Strategy (${market}) was already added to flywheel (${flywheel.address})`);

  // Adding flywheel to comptroller
  const cErc20 = await viem.getContractAt("ICErc20", market);
  const _comptroller = await cErc20.read.comptroller();
  const comptroller = await viem.getContractAt("IonicComptroller", _comptroller);
  const rewardsDistributors = (await comptroller.read.getRewardsDistributors()) as Address[];
  if (!rewardsDistributors.map((s) => s.toLowerCase()).includes(flywheel.address.toLowerCase())) {
    const addTx = await comptroller.write._addRewardsDistributor([flywheel.address]);
    await publicClient.waitForTransactionReceipt({ hash: addTx });
    console.log({ addTx });
  } else {
    console.log(`Flywheel ${flywheel.address} already added to pool ${_comptroller}`);
  }
  console.log(`Added flywheel (${flywheel.address}) to pool (${_comptroller})`);

  // Approving token sepening for fwRewards contract
  const _market = await viem.getContractAt("CErc20RewardsDelegate", market);
  const fwRewards = await flywheel.read.flywheelRewards();
  const tx = await _market.write.approve([rewardToken as Address, fwRewards as Address]);
  console.log(`mining tx ${tx}`);
  await publicClient.waitForTransactionReceipt({ hash: tx });
  console.log(`approved flywheel ${flywheel.address} to pull reward tokens from market ${market}`);
};
