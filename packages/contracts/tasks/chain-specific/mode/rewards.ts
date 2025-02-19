import { task } from "hardhat/config";
import {
  COMPTROLLER_NATIVE,
  dmBTC_MARKET,
  ezETH_MARKET,
  ION,
  MBTC_MARKET,
  MODE_NATIVE_MARKET,
  USDC_MARKET,
  USDC_NATIVE_MARKET,
  USDT_MARKET,
  USDT_NATIVE_MARKET,
  wBTC_MARKET,
  WEETH_MARKET,
  WETH_MARKET,
  WETH_NATIVE_MARKET,
  wrsETH_MARKET
} from ".";
import { Address, formatEther, parseEther } from "viem";
import { setupRewards } from "../../flywheel/setup";

const SUPPLY_DURATION = 29 * (24 * 60 * 60) + 1 * (23 * 60 * 60);
const BORROW_DURATION = 30 * (24 * 60 * 60);

task("mode:add-rewards:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = MBTC_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (50_000).toString();

    console.log("setting supply rewards for token: ", name, rewardAmount);
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

task("mode:add-rewards:borrow", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer, multisig } = await getNamedAccounts();
    const rewardToken = ION;
    const rewardTokenName = "ION";
    const market = WEETH_MARKET;
    const _market = await viem.getContractAt("EIP20Interface", market);
    const name = await _market.read.name();

    const rewardAmount = (5_000).toString();

    console.log("setting borrow rewards for token: ", name, rewardAmount);
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
      "IonicFlywheelBorrow_Borrow_ION",
      "IonicFlywheelDynamicRewards_Borrow_ION"
    );
  }
);

task("mode:flywheel-setup:veion:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts, run }) => {
    await run("flywheel:deploy-dynamic-rewards-fw", {
      name: "veION",
      rewardToken: ION,
      booster: "",
      strategies: [MODE_NATIVE_MARKET, WETH_NATIVE_MARKET, USDC_NATIVE_MARKET, USDT_NATIVE_MARKET].join(","),
      pool: COMPTROLLER_NATIVE
    });
  }
);

task("mode:flywheel-setup:veion:borrow", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts, run }) => {
    await run("flywheel:deploy-dynamic-rewards-fw", {
      name: "veION_Borrow",
      rewardToken: ION,
      booster: "IonicFlywheelBorrowBooster_ION",
      strategies: [MODE_NATIVE_MARKET, WETH_NATIVE_MARKET, USDC_NATIVE_MARKET, USDT_NATIVE_MARKET].join(","),
      pool: COMPTROLLER_NATIVE
    });
  }
);
