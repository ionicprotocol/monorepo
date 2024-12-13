import { Address } from "viem";

import { task } from "hardhat/config";
import { setupRewards } from "../../flywheel/setup";
import { parseEther } from "viem";
import { SUPPLY_DURATION } from "..";
import { ION, LSK, LSK_MARKET, USDC_MARKET, USDT_MARKET, WBTC_MARKET, WETH_MARKET } from ".";
import { sendRewardsToMarkets } from "../../flywheel/rewards";

task("lisk:add-rewards:epoch5:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = WBTC_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (10_000).toString();

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
      deployer as Address,
      viem,
      deployments
    );
  }
);

task("lisk:add-rewards:epoch5:supply:lsk", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = LSK;
    const rewardTokenName = "LSK";
    const market = WBTC_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (500).toString();

    console.log("setting rewards for token: ", name, rewardAmount, rewardTokenName);
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
      deployer as Address,
      viem,
      deployments
    );
  }
);

task("lisk:send-ion:epoch6", "send ion to a market").setAction(async (_, { viem, deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();

  const rewardsToSend: { market: Address; amount: string }[] = [
    {
      market: WETH_MARKET,
      amount: "10000"
    },
    {
      market: USDC_MARKET,
      amount: "10000"
    },
    {
      market: USDT_MARKET,
      amount: "10000"
    },
    {
      market: WBTC_MARKET,
      amount: "10000"
    },
    {
      market: LSK_MARKET,
      amount: "10000"
    }
  ];

  await sendRewardsToMarkets(viem, ION, rewardsToSend, deployer as Address);
});
