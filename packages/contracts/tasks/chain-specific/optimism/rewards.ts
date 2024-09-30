import { task } from "hardhat/config";
import { Address, parseEther } from "viem";

import { ION, USDC_MARKET, wUSDM_MARKET } from ".";
import { setupRewards } from "../../flywheel/setup";
import { SUPPLY_DURATION } from "..";

task("optimism:add-rewards:supply:epoch2", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const rewardAmount = "49872";
    const market = wUSDM_MARKET;
    const rewardTokenName = "ION";

    // Sending tokens
    const ionToken = await viem.getContractAt("EIP20Interface", ION);
    let balance = await ionToken.read.balanceOf([market]);
    if (balance < parseEther(rewardAmount)) {
      const tx = await ionToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log("Sent rewards: ", tx);
    } else {
      console.log("No rewards sent, already enough");
    }

    await setupRewards("supply", market, rewardTokenName, ION, SUPPLY_DURATION, deployer as Address, viem, deployments);
  }
);
