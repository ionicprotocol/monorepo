import { task } from "hardhat/config";
import { dmBTC_MARKET, ION, MODE_NATIVE_MARKET, WEETH_MARKET } from ".";
import { Address, formatEther, parseEther } from "viem";
import { setupRewards } from "../../flywheel/setup";

const SUPPLY_DURATION = 29 * (24 * 60 * 60) + 1 * (23 * 60 * 60);
const BORROW_DURATION = 30 * (24 * 60 * 60);

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

    await setupRewards("borrow", ionUSDC, "ION", ION, BORROW_DURATION, deployer as Address, viem, deployments);

    // Sending tokens
    balance = await ionToken.read.balanceOf([ionWETH]);
    if (balance < parseEther(rewardAmount)) {
      await ionToken.write.transfer([ionWETH, parseEther(rewardAmount) - balance]);
    }

    await setupRewards("borrow", ionWETH, "ION", ION, BORROW_DURATION, deployer as Address, viem, deployments);
  }
);

task("mode:add-rewards:supply:epoch1", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const rewardAmount = "25000";
    const market = WEETH_MARKET;
    const rewardTokenName = "ION";

    // Sending tokens
    const ionToken = await viem.getContractAt("EIP20Interface", ION);
    let balance = await ionToken.read.balanceOf([market]);
    if (balance < parseEther(rewardAmount)) {
      await ionToken.write.transfer([market, parseEther(rewardAmount) - balance]);
    }

    await setupRewards("supply", market, rewardTokenName, ION, SUPPLY_DURATION, deployer as Address, viem, deployments);
  }
);

task("mode:add-rewards:supply:epoch2", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const rewardAmount = "35000";
    const market = WEETH_MARKET;
    const rewardTokenName = "ION";

    // Sending tokens
    const ionToken = await viem.getContractAt("EIP20Interface", ION);
    let balance = await ionToken.read.balanceOf([market]);
    if (balance < parseEther(rewardAmount)) {
      await ionToken.write.transfer([market, parseEther(rewardAmount) - balance]);
    }

    await setupRewards("supply", market, rewardTokenName, ION, SUPPLY_DURATION, deployer as Address, viem, deployments);
  }
);

task("mode:add-rewards:borrow:epoch2", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const rewardAmount = "96601";
    const market = WEETH_MARKET;
    const rewardTokenName = "ION";

    // Sending tokens
    const ionToken = await viem.getContractAt("EIP20Interface", ION);
    let balance = await ionToken.read.balanceOf([market]);
    if (balance < parseEther(rewardAmount)) {
      const tx = await ionToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`transferred ${rewardAmount} ION to ${market}: ${tx}`);
    } else {
      console.log(`${rewardAmount} ION already in ${market}: ${formatEther(balance)}`);
    }

    await setupRewards("borrow", market, rewardTokenName, ION, BORROW_DURATION, deployer as Address, viem, deployments);
  }
);
