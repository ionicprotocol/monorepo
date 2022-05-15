import { parseEther } from "ethers/lib/utils";

import { task, types } from "hardhat/config";

// npx hardhat market:create --asset-config Test,deployer,CErc20Delegate,0x90e68fdb102c850D852126Af8fd1419A07636cd7,0x6c7De8de3d8c92246328488aC6AF8f8E46A1628f,0.1,0.9,1,0,true,"","","" --network localhost

export default task("market:create", "Create Market")
  .addParam(
    "assetConfig",
    "Whole asset config in a comma separated string (`param1,param2...`)",
    undefined,
    types.string
  )
  .setAction(async (taskArgs, hre) => {
    const [
      poolName,
      creator,
      delegateContractName,
      underlying,
      interestModelAddress,
      initialExchangeRate, // Initial exchange rate scaled by 1e18
      collateralFactor,
      reserveFactor,
      adminFee,
      bypassPriceFeedCheck,
      plugin,
      rewardsDistributor,
      rewardToken,
    ] = taskArgs.assetConfig.split(",");

    const signer = await hre.ethers.getNamedSigner(creator);

    // @ts-ignore
    const fuseModule = await import("../tests/utils/fuseSdk");
    const sdk = await fuseModule.getOrCreateFuse();

    // @ts-ignore
    const poolModule = await import("../tests/utils/pool");
    const pool = await poolModule.getPoolByName(poolName, sdk);

    let symbol = "NATIVE";
    if (!hre.ethers.constants.AddressZero === underlying) {
      const underlyingToken = await hre.ethers.getContractAt("ERC20", underlying);
      symbol = await underlyingToken.callStatic.symbol();
    }

    console.log(`Creating market for token ${underlying}, pool ${poolName}, impl: ${delegateContractName}`);
    const assetConf = {
      delegateContractName: delegateContractName,
      underlying: underlying,
      comptroller: pool.comptroller,
      fuseFeeDistributor: sdk.contracts.FuseFeeDistributor.address,
      interestRateModel: interestModelAddress,
      initialExchangeRateMantissa: parseEther(initialExchangeRate),
      name: `${poolName} ${symbol}`,
      symbol: `m${pool.id}-${symbol}`,
      admin: creator,
      collateralFactor: Number(collateralFactor),
      reserveFactor: Number(reserveFactor),
      adminFee: Number(adminFee),
      bypassPriceFeedCheck: bypassPriceFeedCheck === "true",
      plugin: plugin ? plugin : null,
      rewardsDistributor: rewardsDistributor ? rewardsDistributor : null,
      rewardToken: rewardToken ? rewardToken : null,
    };

    const [assetAddress, implementationAddress, interestRateModel, receipt] = await sdk.deployAsset(
      sdk.JumpRateModelConf,
      assetConf,
      { from: signer.address }
    );

    console.log("CToken: ", assetAddress);
  });
