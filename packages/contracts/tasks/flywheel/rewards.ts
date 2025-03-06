import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address, formatEther, parseEther } from "viem";

export const getCycleInfoForAllMarkets = async (
  viem: HardhatRuntimeEnvironment["viem"],
  deployments: HardhatRuntimeEnvironment["deployments"]
) => {
  const poolDirectory = await viem.getContractAt(
    "PoolDirectory",
    (await deployments.get("PoolDirectory")).address as Address
  );
  const pools = await poolDirectory.read.getAllPools();
  const rewardsCycles: {
    symbol: string;
    cToken: Address;
    start: number;
    end: number;
    reward: bigint;
    flywheelRewards: Address;
    flywheel: Address;
    rewardSymbol: string;
    rewardsLeft: bigint;
  }[] = [];
  let totalIONLeft = 0n;
  let fwrs: string[] = []; 
  for (const pool of pools) {
    const comptroller = await viem.getContractAt("IonicComptroller", pool.comptroller);
    const rewardsDistributors = await comptroller.read.getRewardsDistributors();
    const cTokens = await comptroller.read.getAllMarkets();
    for (const rewardsDistributor of rewardsDistributors) {
      const flywheel = await viem.getContractAt("IonicFlywheel", rewardsDistributor);
      for (const cToken of cTokens) {
        const cTokenContract = await viem.getContractAt("CErc20RewardsDelegate", cToken);
        const symbol = await cTokenContract.read.symbol();
        const fwr = await flywheel.read.flywheelRewards();
        const flywheelRewards = await viem.getContractAt("IonicFlywheelDynamicRewards", fwr);
        const rw = await flywheelRewards.read.rewardToken();
        const rewardToken = await viem.getContractAt("EIP20Interface", rw);
        const rewardSymbol = await rewardToken.read.symbol();
        const cycleInfo = await flywheelRewards.read.rewardsCycle([cToken]);
        const rewardsLeft = await rewardToken.read.balanceOf([flywheelRewards.address]);
        if (rewardSymbol === "ION" && !fwrs.includes(fwr)) {
          totalIONLeft += rewardsLeft;
          fwrs.push(fwr);
        }
        if (cycleInfo[0] !== 0 && cycleInfo[1] !== 0) {
          rewardsCycles.push({
            symbol,
            cToken,
            start: cycleInfo[0],
            end: cycleInfo[1],
            reward: (cycleInfo[2] / BigInt(1e18)),
            flywheelRewards: flywheelRewards.address,
            flywheel : flywheel.address,
            rewardSymbol,
            rewardsLeft: (rewardsLeft / BigInt(1e18)),
          });

          // console.log(
          //   `${symbol}: ${cToken} - Start: ${cycleInfo[0]} - End: ${cycleInfo[1]} - Reward: ${cycleInfo[2]}, from ${flywheelRewards.address} - ${rewardSymbol}`
          // );
        }
      }
    }
  }
  // group by end time and print
  const grouped = rewardsCycles.reduce<Record<number, typeof rewardsCycles>>((acc, reward) => {
    acc[reward.end] = acc[reward.end] || [];
    acc[reward.end].push(reward);
    return acc;
  }, {});

  console.log("\nRewards grouped by end time:");
  console.log("=".repeat(50));
  Object.entries(grouped).forEach(([endTime, rewards]) => {
    console.log(`\nEnd time: ${endTime}`);
    console.log("-".repeat(30));
    rewards.forEach((reward) => {
      console.log(
        `Market: ${reward.symbol} (${reward.cToken}) | Flywheel (${reward.flywheel}) | Reward Token: ${reward.rewardSymbol} | Reward Amount: ${reward.reward} | Tokens Left: ${reward.rewardsLeft} | Start Time: ${reward.start}\n${"-".repeat(20)}`
      );
    });
  });
  console.log(`Total ION Left: ${totalIONLeft / BigInt(1e18)}`);
};

task("flywheel:get_cycle_info", "get cycle info from flywheel").setAction(async (_, { viem, deployments }) => {
  await getCycleInfoForAllMarkets(viem, deployments);
});

export const sendRewardsToMarkets = async (
  viem: HardhatRuntimeEnvironment["viem"],
  rewardToken: Address,
  rewardsToSend: { market: Address; amount: string }[],
  deployer: Address
) => {
  const publicClient = await viem.getPublicClient();
  const rewardContract = await viem.getContractAt("EIP20Interface", rewardToken);
  const totalNeeded = rewardsToSend.reduce((acc, reward) => acc + parseInt(reward.amount), 0);
  console.log("🚀 ~ task ~ totalNeeded:", totalNeeded);
  const balance = await rewardContract.read.balanceOf([deployer as Address]);
  if (balance < parseEther(totalNeeded.toString())) {
    throw new Error(
      `Not enough ${rewardToken} to send to all markets, needed ${totalNeeded}, balance is ${formatEther(balance)}`
    );
  }

  for (const reward of rewardsToSend) {
    const market = reward.market as Address;
    const amount = reward.amount;
    const balance = await rewardContract.read.balanceOf([market]);
    console.log(`balance of ${rewardToken} on ${market}: ${formatEther(balance)}`);
    if (balance < parseEther(amount)) {
      const tx = await rewardContract.write.transfer([market, parseEther(amount) - balance]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`Sent ${amount} ${rewardToken} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardToken} - ${market}`);
    }
  }
};

export const getCurrentRewardsInfo= async (
  viem: HardhatRuntimeEnvironment["viem"],
  deployments: HardhatRuntimeEnvironment["deployments"]
) => {
  const poolDirectory = await viem.getContractAt(
    "PoolDirectory",
    (await deployments.get("PoolDirectory")).address as Address
  );
  const pools = await poolDirectory.read.getAllPools();

  for (const pool of pools) {
    const comptroller = await viem.getContractAt("IonicComptroller", pool.comptroller);
    const rewardsDistributors = await comptroller.read.getRewardsDistributors();
    const cTokens = await comptroller.read.getAllMarkets();
    for (const rewardsDistributor of rewardsDistributors) {
      const flywheel = await viem.getContractAt("IonicFlywheel", rewardsDistributor);
      const fwr = await flywheel.read.flywheelRewards();
      const flywheelRewards = await viem.getContractAt("IonicFlywheelDynamicRewards", fwr);
      console.log(flywheel.address);
      for (const cToken of cTokens) {
        const cTokenContract = await viem.getContractAt("CErc20RewardsDelegate", cToken);
        const totalBorrows = await cTokenContract.read.totalBorrows();
        const symbol = await cTokenContract.read.symbol();
        const blacklistedSupply = await flywheel.read.blacklistedSupply([cToken]);
        const totalSupply = await cTokenContract.read.totalSupply();
        let percentage;
        /*if (flywheel.address === "0x90ffC9786f4757C262A9B529c4a4F6708c94339e"){
          percentage = Number(blacklistedSupply) / Number(totalBorrows) * 100;
          console.log(symbol, blacklistedSupply, totalBorrows, percentage);
        }
        else {
          percentage =  Number(blacklistedSupply) / Number(totalSupply) * 100;
          console.log(symbol, blacklistedSupply, totalSupply, percentage);
        }*/
        const info = await flywheelRewards.read.rewardsCycle([cToken]);
        if (info[2] != 0n){
          console.log(symbol, cToken, info[0], info[1], Number(info[2])/ 1e18);
        }
        }
      }
    }
};

task("flywheel:get_current_rewards_info", "get current flywheel rewards info").setAction(async (_, { viem, deployments }) => {
  await getCurrentRewardsInfo(viem, deployments);
});

