import { task } from "hardhat/config";
import {
  AERO_MARKET,
  bsdETH_MARKET,
  cbBTC_MARKET,
  cbETH_MARKET,
  COMPTROLLER,
  EURC_MARKET,
  eUSD,
  eUSD_MARKET,
  fBOMB_MARKET,
  hyUSD,
  hyUSD_MARKET,
  ION,
  KLIMA_MARKET,
  RSR_MARKET,
  sUSDz_MARKET,
  USDC_MARKET,
  usdPlus_MARKET,
  USDz_MARKET,
  uSOL_MARKET,
  uSUI_MARKET,
  weETH_MARKET,
  WETH_MARKET,
  wstETH_MARKET,
  wsuperOETH_MARKET,
  wusdm_MARKET,
  wusdPlus_MARKET
} from ".";
import { Address, formatEther, parseEther } from "viem";
import { setupRewards } from "../../flywheel/setup";
import { BORROW_DURATION, SUPPLY_DURATION } from "..";
import { getCycleInfoForAllMarkets, sendRewardsToMarkets } from "../../flywheel/rewards";

task("base:send-ion", "send ion to a market").setAction(async (_, { viem, deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();

  const rewardsToSend: { market: Address; amount: string }[] = [
    {
      market: eUSD_MARKET,
      amount: "25000"
    },
    {
      market: bsdETH_MARKET,
      amount: "25000"
    },
    {
      market: hyUSD_MARKET,
      amount: "25000"
    },
    {
      market: USDC_MARKET,
      amount: "25000"
    }
  ];

  await sendRewardsToMarkets(viem, ION, rewardsToSend, deployer as Address);
});

task("base:add-rewards:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = KLIMA_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (12500).toString();

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
      deployments,
      multisig as Address,
      "IonicFlywheel_ION",
      "IonicFlywheelDynamicRewards_ION"
    );
  }
);

task("base:add-rewards:borrow", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = USDC_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (87_500).toString();

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
      "IonicFlywheelBorrow_Borrow_ION",
      "IonicFlywheelDynamicRewards_Borrow_ION"
    );
  }
);

task("base:add-rewards:supply:reserve", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = eUSD;
    const rewardTokenName = "eUSD";
    const market = hyUSD_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (1_000).toString();

    console.log("setting rewards for token: ", name, rewardAmount, rewardTokenName);
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
      "IonicFlywheel_eUSD",
      "IonicFlywheelDynamicRewards_eUSD"
    );
  }
);