import { task } from "hardhat/config";
import { ION } from ".";
import { Address, parseEther } from "viem";
import { setupRewards } from "../../flywheel/setup";

task("mode:add-rewards:epoch1", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const rewardAmount = "65000";
    const ionUSDC = "0x2BE717340023C9e14C1Bb12cb3ecBcfd3c3fB038";
    const ionWETH = "0x71ef7EDa2Be775E5A7aa8afD02C45F059833e9d2";

    // Sending tokens
    const ionToken = await viem.getContractAt("EIP20Interface", ION);
    let balance = await ionToken.read.balanceOf([ionUSDC]);
    if (balance < parseEther(rewardAmount)) {
      await ionToken.write.transfer([ionUSDC, parseEther(rewardAmount) - balance]);
    }

    await setupRewards("borrow", ionUSDC, "ION", ION, 30 * (24 * 60 * 60), deployer as Address, viem, deployments);

    // Sending tokens
    balance = await ionToken.read.balanceOf([ionWETH]);
    if (balance < parseEther(rewardAmount)) {
      await ionToken.write.transfer([ionWETH, parseEther(rewardAmount) - balance]);
    }

    await setupRewards("borrow", ionWETH, "ION", ION, 30 * (24 * 60 * 60), deployer as Address, viem, deployments);
  }
);
