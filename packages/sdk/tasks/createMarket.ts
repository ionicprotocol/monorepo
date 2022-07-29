import { task, types } from "hardhat/config";

// example
// hardhat market:create --pool-name BOMB --creator deployer --symbol BTCB-BOMB --strategy-code BeefyERC4626_BOMBBTCLP --strategy-address 0x6B8B935dfC9Dcd0754eced708b1b633BF73FE854 --network bsc

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
    const midasSdkModule = await import("../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();
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
    if (!assetConfig) {
      throw "No asset config found";
    }

    // TODO needs rewrite

    console.log(
      `Creating market for token ${assetConfig.underlying}, pool ${poolName}, impl: ${enumsModule.DelegateContractName.CErc20Delegate}`
    );

    console.log("Asset config: ", assetConfig);
    const [assetAddress, implementationAddress, interestRateModel, receipt] = await sdk.deployAsset(
      sdk.JumpRateModelConf,
      assetConfig,
      { from: signer.address }
    );

    console.log("CToken: ", assetAddress);
  });
