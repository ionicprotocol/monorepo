import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { constants, Contract } from "ethers";
import { task, types } from "hardhat/config";

import { CErc20Delegate } from "../lib/contracts/typechain";
import { DelegateContractName } from "../src";

// npx hardhat market:upgrade --network chapel

export default task("market:upgrade", "Upgrades a market's implementation")
  .addParam("poolName", "Name of pool", undefined, types.string)
  .addParam("symbol", "Asset symbol", undefined, types.string)
  .addParam("admin", "Named account that is an admin of the pool", "deployer", types.string)
  .addOptionalParam("newImplementationAddress", "The address of the new implementation", undefined, types.string)
  .addOptionalParam("strategyCode", "If using strategy, pass its code", undefined, types.string)
  .setAction(async (taskArgs, { ethers, getChainId, deployments }) => {
    const poolName = taskArgs.poolName;
    const symbol = taskArgs.symbol;
    const strategyCode = taskArgs.strategyCode;
    const signer = await ethers.getNamedSigner(taskArgs.admin);

    // @ts-ignore
    const assetModule = await import("../tests/utils/assets");
    // @ts-ignore
    const poolModule = await import("../tests/utils/pool");
    // @ts-ignore
    const fuseModule = await import("../tests/utils/fuseSdk");
    const sdk = await fuseModule.getOrCreateFuse();

    const pool = await poolModule.getPoolByName(poolName, sdk);
    const assets = await assetModule.getAssetsConf(
      pool.comptroller,
      sdk.contracts.FuseFeeDistributor.address,
      sdk.irms.JumpRateModel.address,
      ethers,
      poolName
    );

    const assetConfig = assets.find((a) => a.symbol === symbol);

    const newImplementationAddress = taskArgs.newImplementationAddress
      ? taskArgs.newImplementationAddress
      : sdk.chainDeployment[assetConfig.plugin.cTokenContract].address;

    if (strategyCode) {
      assetConfig.plugin = sdk.chainPlugins[assetConfig.underlying].find((p) => p.strategyCode === strategyCode);

      const market = pool.assets.find((a) => a.underlyingSymbol == symbol);
      const cTokenInstance = new Contract(
        market.cToken,
        sdk.chainDeployment[DelegateContractName.CErc20Delegate].abi,
        signer
      ) as CErc20Delegate;

      const abiCoder = new ethers.utils.AbiCoder();
      const implementationData = abiCoder.encode(["address"], [assetConfig.plugin.strategyAddress]);
      console.log(`Setting implementation to ${newImplementationAddress}`);
      const setImplementationTx = await cTokenInstance._setImplementationSafe(
        newImplementationAddress,
        false,
        implementationData
      );

      const receipt: TransactionReceipt = await setImplementationTx.wait();
      if (receipt.status != constants.One.toNumber()) {
        throw `Failed set implementation to ${assetConfig.plugin.cTokenContract}`;
      }
      console.log(`Implementation successfully set to ${assetConfig.plugin.cTokenContract}`);
    }
  });
