import { task, types } from "hardhat/config";

export default task("market:create", "Create Market")
  .addParam("poolName", "Name of pool", undefined, types.string)
  .addParam("creator", "Signer name", undefined, types.string)
  .addParam("symbol", "Asset symbol", undefined, types.string)
  .addOptionalParam("strategyCode", "If using strategy, pass its code", undefined, types.string)
  .addOptionalParam("strategyAddress", "Override the strategy address", undefined, types.string)
  .addOptionalParam("flywheels", "Override the flywheels", undefined, types.string)
  .addOptionalParam("rewardTokens", "Override the reward tokens", undefined, types.string)

  .setAction(async (taskArgs, hre) => {
    const symbol = taskArgs.symbol;
    const poolName = taskArgs.poolName;

    const signer = await hre.ethers.getNamedSigner(taskArgs.creator);

    // @ts-ignore
    const enumsModule = await import("../src/enums");
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

    if (taskArgs.strategyCode) {
      const plugin = sdk.chainPlugins[assetConfig.underlying].find((p) => p.strategyCode === taskArgs.strategyCode);
      assetConfig.plugin = plugin;
      assetConfig.plugin.cTokenContract = enumsModule.DelegateContractName.CErc20PluginDelegate;

      if (taskArgs.strategyAddress) {
        assetConfig.plugin.strategyAddress = taskArgs.strategyAddress;
      }
      if (taskArgs.flywheels) {
        assetConfig.plugin.cTokenContract = enumsModule.DelegateContractName.CErc20PluginRewardsDelegate;
        const rds: Array<string> = taskArgs.flywheels.split(",");
        const rts: Array<string> = taskArgs.rewardTokens.split(",");
        if (rds.length !== rts.length) {
          throw "Length of RDs and RTs must be equal";
        }
        (assetConfig.plugin as any).flywheels = rds.map((r, i) => {
          return {
            address: r,
            rewardToken: rts[i],
          };
        });
        // @ts-ignore
        console.log("Flywheel config: ", assetConfig.plugin.flywheels);
      }
    }

    console.log(
      `Creating market for token ${assetConfig.underlying}, pool ${poolName}, impl: ${
        assetConfig.plugin ? assetConfig.plugin.cTokenContract : enumsModule.DelegateContractName.CErc20Delegate
      }`
    );

    console.log("Asset config: ", assetConfig);
    const [assetAddress, implementationAddress, interestRateModel, receipt] = await sdk.deployAsset(
      sdk.JumpRateModelConf,
      assetConfig,
      { from: signer.address }
    );

    console.log("CToken: ", assetAddress);
  });
