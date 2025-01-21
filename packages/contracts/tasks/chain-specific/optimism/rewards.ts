import { task } from "hardhat/config";
import { Address, parseEther } from "viem";

import { ION, SNX_MARKET, USDC_MARKET, weETH_MARKET, WETH_MARKET, wUSDM_MARKET } from ".";
import { setupRewards } from "../../flywheel/setup";
import { BORROW_DURATION, SUPPLY_DURATION } from "..";
import { sendRewardsToMarkets } from "../../flywheel/rewards";

task("optimism:add-rewards:supply:epoch4", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = weETH_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (15_000).toString();

    console.log("setting rewards for token: ", name, rewardAmount);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "supply",
      market,
      rewardTokenName,
      rewardToken,
      SUPPLY_DURATION,
      deployer as Address,
      viem,
      deployments,
      multisig as Address,
      "IonicFlywheel_ION_epoch4",
      "IonicFlywheelDynamicRewards_ION_epoch4"
    );
  }
);

task("optimism:add-rewards:supply:epoch5", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = SNX_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (5_000).toString();

    console.log("setting supply rewards for token: ", name, rewardAmount);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "supply",
      market,
      rewardTokenName,
      rewardToken,
      SUPPLY_DURATION,
      deployer as Address,
      viem,
      deployments,
      multisig as Address,
      "IonicFlywheel_ION_epoch5",
      "IonicFlywheelDynamicRewards_ION_epoch5"
    );
  }
);

task("optimism:add-rewards:epoch5:borrow", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = weETH_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (2_500).toString();

    console.log("setting rewards for token: ", name, rewardAmount);
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "borrow",
      market,
      rewardTokenName,
      rewardToken,
      BORROW_DURATION,
      deployer as Address,
      viem,
      deployments,
      multisig as Address,
      "IonicFlywheelBorrow_Borrow_ION_epoch5",
      "IonicFlywheelDynamicRewards_Borrow_ION_epoch5"
    );
  }
);

task("optimism:add-rewards:supply:epoch5", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = SNX_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (5_000).toString();

    console.log("setting supply rewards for token: ", name, rewardAmount);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "supply",
      market,
      rewardTokenName,
      rewardToken,
      SUPPLY_DURATION,
      deployer as Address,
      viem,
      deployments,
      multisig as Address,
      "IonicFlywheel_ION_epoch5",
      "IonicFlywheelDynamicRewards_ION_epoch5"
    );
  }
);

task("optimism:send-ion:epoch6", "send ion to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const rewardsToSend: { market: Address; amount: string }[] = [
      {
        market: USDC_MARKET,
        amount: "2500"
      },
      {
        market: wUSDM_MARKET,
        amount: "2500"
      },
      {
        market: weETH_MARKET,
        amount: "3250"
      },
      {
        market: WETH_MARKET,
        amount: "5000"
      }
    ];

    await sendRewardsToMarkets(viem, ION, rewardsToSend, deployer as Address);
  }
);

task("optimism:add-rewards:supply:epoch7", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = weETH_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (1625).toString();

    console.log("setting supply rewards for token: ", name, rewardAmount);
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "supply",
      market,
      rewardTokenName,
      rewardToken,
      SUPPLY_DURATION / 2,
      deployer as Address,
      viem,
      deployments,
      multisig as Address,
      "IonicFlywheel_ION_epoch7",
      "IonicFlywheelDynamicRewards_ION_epoch7"
    );
  }
);

task("optimism:add-rewards:epoch7:borrow", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = weETH_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (1250).toString();

    console.log("setting rewards for token: ", name, rewardAmount);
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Sending tokens
    const _rewardToken = await viem.getContractAt("EIP20Interface", rewardToken);
    let balance = await _rewardToken.read.balanceOf([market]);
    console.log("balance: ", balance);
    if (balance < parseEther(rewardAmount)) {
      const tx = await _rewardToken.write.transfer([market, parseEther(rewardAmount) - balance]);
      console.log(`Sent ${rewardAmount} ${rewardTokenName} to ${market} - ${tx}`);
    } else {
      console.log(`Market already has enough ${rewardTokenName} - ${market}`);
    }

    await setupRewards(
      "borrow",
      market,
      rewardTokenName,
      rewardToken,
      BORROW_DURATION / 2,
      deployer as Address,
      viem,
      deployments,
      multisig as Address,
      "IonicFlywheelBorrow_Borrow_ION_epoch7",
      "IonicFlywheelDynamicRewards_Borrow_ION_epoch7"
    );
  }
);