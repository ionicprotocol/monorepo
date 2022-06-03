import { task, types } from "hardhat/config";

import { DelegateContractName, MarketPluginConfig } from "../dist/esm/src";
import { RewardsPluginConfig, StandardPluginConfig } from "../dist/esm/src/types";

// npx hardhat market:create --asset-config Test,deployer,CErc20Delegate,0x90e68fdb102c850D852126Af8fd1419A07636cd7,0x6c7De8de3d8c92246328488aC6AF8f8E46A1628f,0.1,0.9,1,0,true,"","","" --network localhost

export default task("market:create", "Create Market")
  .addParam("poolName", "Name of pool", undefined, types.string)
  .addParam("creator", "Signer name", undefined, types.string)
  .addParam("symbol", "Asset symbol", undefined, types.string)
  .addOptionalParam("delegateContractName", "Delegate contract name", "CErc20Delegate", types.string)
  .addOptionalParam("plugins", "comma separated string or plugins (`param1,param2...`)", undefined, types.string)
  .addOptionalParam(
    "rewardsDistributors",
    "comma separated string or rds (`param1,param2...`)",
    undefined,
    types.string
  )
  .addOptionalParam("rewardTokens", "comma separated string or rts (`param1,param2...`)", undefined, types.string)

  .setAction(async (taskArgs, hre) => {
    const symbol = taskArgs.symbol;
    const poolName = taskArgs.poolName;

    const signer = await hre.ethers.getNamedSigner(taskArgs.creator);

    // @ts-ignore
    const fuseModule = await import("../tests/utils/fuseSdk");
    const sdk = await fuseModule.getOrCreateFuse();
    // @ts-ignore
    const assetModule = await import("../tests/utils/assets");
    // @ts-ignore
    const poolModule = await import("../tests/utils/pool");
    const pool = await poolModule.getPoolByName(poolName, sdk);

    const assets = await assetModule.getAssetsConf(
      pool.comptroller,
      sdk.contracts.FuseFeeDistributor.address,
      sdk.irms.JumpRateModel.address,
      hre.ethers,
      poolName
    );

    const assetConfig = assets.find((a) => a.symbol === symbol);

    // Prepare Custom Plugin if specified
    let plugin: MarketPluginConfig | undefined = undefined;
    if (taskArgs.delegateContractName) {
      switch (taskArgs.delegateContractName) {
        case DelegateContractName.CErc20PluginDelegate:
          {
            plugin = {
              cTokenContract: DelegateContractName.CErc20PluginDelegate,
              strategyAddress: taskArgs.plugin,
              strategyName: "Custom Plugin",
              strategyCode: "custom-plugin",
            } as StandardPluginConfig;
          }
          break;
        case DelegateContractName.CErc20PluginRewardsDelegate:
          {
            let flywheels: RewardsPluginConfig["flywheels"] | undefined = undefined;
            if (taskArgs.rewardsDistributors) {
              const rds: Array<string> = taskArgs.rewardsDistributors.split(",");
              const rts: Array<string> = taskArgs.rewardTokens.split(",");
              if (rds.length !== rts.length) {
                throw "Length of RDs and RTs must be equal";
              }
              flywheels = rds.map((r, i) => {
                return {
                  address: r,
                  rewardToken: rts[i],
                };
              });
            }
            plugin = {
              cTokenContract: DelegateContractName.CErc20PluginRewardsDelegate,
              strategyAddress: taskArgs.plugin,
              strategyName: "Custom Plugin",
              strategyCode: "custom-plugin",
              flywheels,
            } as RewardsPluginConfig;
          }
          break;
        case DelegateContractName.CErc20Delegate: {
          plugin = undefined;
          break;
        }
        default:
          console.warn("Unsupported delegateContractName");
      }
    }

    assetConfig.plugin = plugin;

    console.log(
      `Creating market for token ${assetConfig.underlying}, pool ${poolName}, plugin: ${assetConfig.plugin?.cTokenContract}`
    );

    console.log("Asset config: ", assetConfig);
    const [assetAddress, implementationAddress, interestRateModel, receipt] = await sdk.deployAsset(
      sdk.JumpRateModelConf,
      assetConfig,
      { from: signer.address }
    );

    console.log("CToken: ", assetAddress);
  });
