import { task } from "hardhat/config";
import { ION } from ".";
import { Address, parseEther } from "viem";
import { setupRewards } from "../../flywheel/setup";

task("mode:add-rewards:epoch1", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    type Reward = {
      rewardToken: Address;
      rewardTokenName: string;
      market: Address;
      rewardAmount: string;
      type: "supply" | "borrow";
    };
    const rewards: Reward[] = [
      {
        rewardToken: ION,
        rewardTokenName: "ION",
        market: "0xa900A17a49Bc4D442bA7F72c39FA2108865671f0", // USDC
        rewardAmount: "50000",
        type: "supply"
      },
      {
        rewardToken: ION,
        rewardTokenName: "ION",
        market: "0x49420311B518f3d0c94e897592014de53831cfA3", // WETH
        rewardAmount: "50000",
        type: "supply"
      },
      {
        rewardToken: ION,
        rewardTokenName: "ION",
        market: "0xa900A17a49Bc4D442bA7F72c39FA2108865671f0", // USDC
        rewardAmount: "65000",
        type: "borrow"
      },
      {
        rewardToken: ION,
        rewardTokenName: "ION",
        market: "0x49420311B518f3d0c94e897592014de53831cfA3", // WETH
        rewardAmount: "65000",
        type: "borrow"
      }
    ];

    for (const { rewardToken, market, rewardAmount, type, rewardTokenName } of rewards) {
      // Sending tokens
      const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
      let balance = await _rewardToken.read.balanceOf([market]);
      if (balance < parseEther(rewardAmount)) {
        await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      }
      await setupRewards(
        type,
        market,
        rewardTokenName,
        rewardToken,
        type === "supply"
          ? 30 * (24 * 60 * 60) // 30 days
          : 29 * (24 * 60 * 60) + 1 * (23 * 60 * 60), // 29 days 23 hours
        deployer as Address,
        viem,
        deployments
      );
    }
  }
);
