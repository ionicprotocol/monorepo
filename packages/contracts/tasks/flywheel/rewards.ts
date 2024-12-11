import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Address } from "viem";

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
