import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address, formatEther, parseEther } from "viem";

export const getCycleInfoForAllMarkets = async (
  viem: HardhatRuntimeEnvironment["viem"],
  _comptroller: Address,
  _flywheelRewards: Address
) => {
  const comptroller = await viem.getContractAt("IonicComptroller", _comptroller);
  const cTokens = await comptroller.read.getAllMarkets();
  for (const cToken of cTokens) {
    const cTokenContract = await viem.getContractAt("CErc20RewardsDelegate", cToken);
    const symbol = await cTokenContract.read.symbol();
    const flywheelRewards = await viem.getContractAt("IonicFlywheelDynamicRewards", _flywheelRewards);
    const cycleInfo = await flywheelRewards.read.rewardsCycle([cToken]);
    if (cycleInfo[0] !== 0 && cycleInfo[1] !== 0) {
      console.log(`${symbol}: ${cToken} - Start: ${cycleInfo[0]} - End: ${cycleInfo[1]} - Reward: ${cycleInfo[2]}`);
    }
  }
};

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
