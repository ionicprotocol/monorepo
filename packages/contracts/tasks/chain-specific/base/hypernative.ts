import { task } from "hardhat/config";
import { Address } from "viem";
import { USDC_MARKET } from ".";

task("markets:upgrade-and-setup:hypernative", "Upgrades all markets and sets addresses provider on them").setAction(
  async (_, { viem, deployments, run, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const feeDistributor = await viem.getContractAt(
      "FeeDistributor",
      (await deployments.get("FeeDistributor")).address as Address
    );

    const market = USDC_MARKET;
    const cTokenInstance = await viem.getContractAt("ICErc20", market);
    const [latestImpl] = await feeDistributor.read.latestCErc20Delegate([await cTokenInstance.read.delegateType()]);
    await run("market:upgrade:safe", {
      marketAddress: market,
      implementationAddress: latestImpl
    });
  }
);
