import { Address } from "viem";

import { task } from "hardhat/config";
import { setupRewards } from "../../flywheel/setup";
import { parseEther } from "viem";
import { SUPPLY_DURATION } from "..";
import { ION, LSK, LSK_MARKET, USDC_MARKET, USDT_MARKET, WBTC_MARKET, WETH_MARKET } from ".";
import { sendRewardsToMarkets } from "../../flywheel/rewards";

task("lisk:send-ion", "send ion to a market").setAction(async (_, { viem, deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();

  const rewardsToSend: { market: Address; amount: string }[] = [
    {
      market: WETH_MARKET,
      amount: "6250"
    },
    {
      market: USDC_MARKET,
      amount: "6250"
    },
    {
      market: USDT_MARKET,
      amount: "6250"
    },
    {
      market: WBTC_MARKET,
      amount: "6250"
    },
    {
      market: LSK_MARKET,
      amount: "6250"
    }
  ];

  await sendRewardsToMarkets(viem, ION, rewardsToSend, deployer as Address);
});

task("lisk:send-lsk", "send lsk to a market").setAction(async (_, { viem, deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();

  const rewardsToSend: { market: Address; amount: string }[] = [
    {
      market: WETH_MARKET,
      amount: "316"
    },
    {
      market: USDC_MARKET,
      amount: "316"
    },
    {
      market: USDT_MARKET,
      amount: "316"
    },
    {
      market: WBTC_MARKET,
      amount: "316"
    }
  ];

  await sendRewardsToMarkets(viem, LSK, rewardsToSend, deployer as Address);
});

task("lisk:add-rewards:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = LSK_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (5_000).toString();

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
      "supply",
      market,
      rewardTokenName,
      rewardToken,
      SUPPLY_DURATION,
      multisig as Address,
      "IonicFlywheel_ION",
      "IonicFlywheelDynamicRewards_ION"
    );
  }
);
