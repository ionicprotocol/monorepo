import { Address } from "viem";

import { task } from "hardhat/config";
import { COMPTROLLER_MAIN, ION, LSK_MARKET, USDC_MARKET, USDT_MARKET, WBTC_MARKET, WETH_MARKET } from "./index";
import { setRewardsAccumulators } from "../../veION/flywheels";

task("lisk:flywheel-setup:veion:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts, run }) => {
    const veION_MARKETS: Address[] = [LSK_MARKET, USDC_MARKET, USDT_MARKET, WBTC_MARKET, WETH_MARKET];
    console.log(`🚀 ~ veION_MARKETS.join(","):`, veION_MARKETS);
    await run("flywheel:deploy-dynamic-rewards-fw", {
      name: "veION",
      rewardToken: ION,
      booster: "",
      strategies: veION_MARKETS.join(","),
      pool: COMPTROLLER_MAIN
    });
  }
);

task("lisk:flywheel-setup:veion:borrow", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts, run }) => {
    const veION_MARKETS: Address[] = [LSK_MARKET, USDC_MARKET, USDT_MARKET, WBTC_MARKET, WETH_MARKET];
    await run("flywheel:deploy-dynamic-rewards-fw", {
      name: "veION_Borrow",
      rewardToken: ION,
      booster: "IonicFlywheelBorrowBooster_ION",
      strategies: veION_MARKETS.join(","),
      pool: COMPTROLLER_MAIN
    });
  }
);

task("lisk:flywheel:set-reward-accumulators-and-approve", "Set accumulators and approve").setAction(
  async (_, { deployments, viem }) => {
    const veION_MARKETS: Address[] = [LSK_MARKET, USDC_MARKET, USDT_MARKET, WBTC_MARKET, WETH_MARKET];
    const publicClient = await viem.getPublicClient();

    await setRewardsAccumulators(deployments, viem, publicClient, ION, veION_MARKETS);
  }
);