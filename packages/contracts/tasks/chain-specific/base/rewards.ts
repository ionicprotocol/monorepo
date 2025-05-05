import { task, types } from "hardhat/config";
import {
  AERO_MARKET,
  bsdETH_MARKET,
  cbBTC_MARKET,
  cbETH_MARKET,
  COMPTROLLER,
  EURC_MARKET,
  eUSD,
  eUSD_MARKET,
  ezETH_MARKET,
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
import { Address } from "viem";
import { setRewardsAccumulators } from "../../veION/flywheels";

task("base:flywheel-setup:veion:supply", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts, run }) => {
    await run("flywheel:deploy-dynamic-rewards-fw", {
      name: "veION",
      rewardToken: ION,
      booster: "",
      strategies: [
        weETH_MARKET,
        ezETH_MARKET,
        wstETH_MARKET,
        cbETH_MARKET,
        AERO_MARKET,
        USDC_MARKET,
        eUSD_MARKET,
        WETH_MARKET,
        bsdETH_MARKET,
        hyUSD_MARKET,
        RSR_MARKET,
        wsuperOETH_MARKET,
        wusdm_MARKET,
        usdPlus_MARKET,
        wusdPlus_MARKET,
        USDz_MARKET,
        EURC_MARKET,
        cbBTC_MARKET,
        uSOL_MARKET,
        uSUI_MARKET,
        sUSDz_MARKET,
        fBOMB_MARKET,
        KLIMA_MARKET
      ].join(","),
      pool: COMPTROLLER
    });
  }
);

task("base:flywheel-setup:veion:borrow", "add rewards to a market").setAction(
  async (_, { viem, deployments, getNamedAccounts, run }) => {
    await run("flywheel:deploy-dynamic-rewards-fw", {
      name: "veION_Borrow",
      rewardToken: ION,
      booster: "IonicFlywheelBorrowBooster_ION",
      strategies: [
        weETH_MARKET,
        ezETH_MARKET,
        wstETH_MARKET,
        cbETH_MARKET,
        AERO_MARKET,
        USDC_MARKET,
        eUSD_MARKET,
        WETH_MARKET,
        bsdETH_MARKET,
        hyUSD_MARKET,
        RSR_MARKET,
        wsuperOETH_MARKET,
        wusdm_MARKET,
        usdPlus_MARKET,
        wusdPlus_MARKET,
        USDz_MARKET,
        EURC_MARKET,
        cbBTC_MARKET,
        uSOL_MARKET,
        uSUI_MARKET,
        sUSDz_MARKET,
        fBOMB_MARKET,
        KLIMA_MARKET
      ].join(","),
      pool: COMPTROLLER
    });
  }
);

task("base:flywheel:set-reward-accumulators-and-approve", "Set accumulators and approve").setAction(
  async (_, { deployments, viem }) => {
    const publicClient = await viem.getPublicClient();

    const markets: Address[] = [
      weETH_MARKET,
      ezETH_MARKET,
      wstETH_MARKET,
      cbETH_MARKET,
      AERO_MARKET,
      USDC_MARKET,
      eUSD_MARKET,
      WETH_MARKET,
      bsdETH_MARKET,
      hyUSD_MARKET,
      RSR_MARKET,
      wsuperOETH_MARKET,
      wusdm_MARKET,
      usdPlus_MARKET,
      wusdPlus_MARKET,
      USDz_MARKET,
      EURC_MARKET,
      cbBTC_MARKET,
      uSOL_MARKET,
      uSUI_MARKET,
      sUSDz_MARKET,
      fBOMB_MARKET,
      KLIMA_MARKET
    ];

    await setRewardsAccumulators(deployments, viem, publicClient, ION, markets);
  }
);