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

    const markets = [
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
    const emissionsManager = await deployments.get("EmissionsManager");
    const veIONFlywheelSupply = await deployments.get("IonicFlywheel_veION");
    const veIONFlywheelSupplyContract = await viem.getContractAt(
      "IonicFlywheel",
      veIONFlywheelSupply.address as Address
    );

    const flywheelRewardsContractSupply = await viem.getContractAt(
      "IonicFlywheelDynamicRewards",
      (await deployments.get("IonicFlywheelDynamicRewards_veION")).address as Address
    );

    const veIONFlywheelBorrow = await deployments.get("IonicFlywheelBorrow_veION_Borrow");
    const veIONFlywheelBorrowContract = await viem.getContractAt(
      "IonicFlywheel",
      veIONFlywheelBorrow.address as Address
    );

    // Set emissions manager
    let tx = await veIONFlywheelSupplyContract.write.setEmissionsManager([emissionsManager.address as Address]);
    await publicClient.waitForTransactionReceipt({ hash: tx });
    tx = await veIONFlywheelBorrowContract.write.setEmissionsManager([emissionsManager.address as Address]);
    await publicClient.waitForTransactionReceipt({ hash: tx });

    const flywheelRewardsContractBorrow = await viem.getContractAt(
      "IonicFlywheelDynamicRewards",
      (await deployments.get("IonicFlywheelDynamicRewards_veION_Borrow")).address as Address
    );

    for (const market of markets) {
      const symbol = await(await viem.getContractAt("EIP20Interface", market as Address)).read.symbol();
      console.log("symbol: ", symbol);
      // supply side config
      const _rewardAccumulatorSupply = (await deployments.get(`RewardAccumulator_${market}_0`)).address as Address;
      let tx = await flywheelRewardsContractSupply.write.setRewardAccumulators([
        [market as Address],
        [_rewardAccumulatorSupply]
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tx });

      console.log("Reward accumulator set for market supply: ", market, tx);

      const rewardAccumulator = await viem.getContractAt("RewardAccumulator", _rewardAccumulatorSupply);
      try {
        tx = await rewardAccumulator.write.approve([ION, flywheelRewardsContractSupply.address as Address]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log("Reward accumulator approved for market supply: ", market, tx);
      } catch (e) {
        console.log("Reward accumulator already approved for market supply: ", market, tx);
      }
      // borrow side config
      const _rewardAccumulatorBorrow = (await deployments.get(`RewardAccumulator_${market}_1`)).address as Address;
      tx = await flywheelRewardsContractBorrow.write.setRewardAccumulators([
        [market as Address],
        [_rewardAccumulatorBorrow]
      ]);
      await publicClient.waitForTransactionReceipt({ hash: tx });

      console.log("Reward accumulator set for market borrow: ", market, tx);

      const rewardAccumulatorBorrow = await viem.getContractAt("RewardAccumulator", _rewardAccumulatorBorrow);
      try {
        tx = await rewardAccumulatorBorrow.write.approve([ION, flywheelRewardsContractBorrow.address as Address]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log("Reward accumulator approved for market borrow: ", market, tx);
      } catch (e) {
        console.log("Reward accumulator already approved for market borrow: ", market, tx);
      }
    }
  }
);