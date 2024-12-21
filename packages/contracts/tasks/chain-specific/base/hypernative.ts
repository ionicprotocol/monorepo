import { task } from "hardhat/config";
import { Address } from "viem";
import { USDC_MARKET } from ".";
import { configureAddress } from "../../../chainDeploy/helpers/liquidators/ionicLiquidator";

const HYPERNATIVE_ORACLE = "0xe753fdceacdd19eeebc3f2528e270ca27370dcf6";

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

task("hypernative:set-address", "Set the address for the hypernative oracle").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const ap = await viem.getContractAt(
      "AddressesProvider",
      (await deployments.get("AddressesProvider")).address as Address
    );
    const publicClient = await viem.getPublicClient();
    await configureAddress(ap, publicClient, deployer, "HYPERNATIVE_ORACLE", HYPERNATIVE_ORACLE);
  }
);