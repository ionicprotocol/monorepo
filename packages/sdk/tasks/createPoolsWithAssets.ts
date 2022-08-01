import { task, types } from "hardhat/config";

export default task("pools", "Create Testing Pools")
  .addParam("name", "Name of the pool to be created")
  .addOptionalParam("creator", "Named account from which to create the pool", "deployer", types.string)
  .addOptionalParam("depositAmount", "Amount to deposit", 0, types.int)
  .addOptionalParam("depositSymbol", "Symbol of token to deposit", "ETH")
  .addOptionalParam("depositAccount", "Named account from which to deposit collateral", "deployer", types.string)
  .addOptionalParam("borrowAmount", "Amount to borrow", 0, types.int)
  .addOptionalParam("borrowSymbol", "Symbol of token to borrow", "ETH")
  .addOptionalParam("borrowAccount", "Named account from which to borrow collateral", "deployer", types.string)
  .setAction(async (taskArgs, hre) => {
    const poolAddress = await hre.run("pools:create", { name: taskArgs.name, creator: taskArgs.creator });
    if (taskArgs.depositAmount != 0) {
      await hre.run("pools:deposit", {
        amount: taskArgs.depositAmount,
        symbol: taskArgs.depositSymbol,
        account: taskArgs.depositAccount,
        poolAddress,
      });
    }
    if (taskArgs.borrowAmount != 0) {
      await hre.run("pools:borrow", {
        amount: taskArgs.borrowAmount,
        symbol: taskArgs.borrowSymbol,
        account: taskArgs.borrowAccount,
        poolAddress,
      });
    }
  });

task("pools:create", "Create pool if does not exist")
  .addParam("name", "Name of the pool to be created")
  .addParam("creator", "Named account from which to create the pool", "deployer", types.string)
  .addOptionalParam("priceOracle", "Which price oracle to use", undefined, types.string)
  .addOptionalParam("rewardsDistributorToken", "Token address for rewards distributor", undefined, types.string)
  .addOptionalParam("flywheelToken", "Token address for flywheel rewards", undefined, types.string)
  .addOptionalParam("flywheelMarket", "Token SYMBOL for flywheel market", undefined, types.string)
  .setAction(async (taskArgs, hre) => {
    const signer = await hre.ethers.getNamedSigner(taskArgs.creator);

    // @ts-ignore
    const assetModule = await import("../tests/utils/assets");
    // @ts-ignore
    const poolModule = await import("../tests/utils/pool");
    // @ts-ignore
    const midasSdkModule = await import("../tests/utils/midasSdk");
    const sdk = await midasSdkModule.getOrCreateMidas();

    if (!taskArgs.priceOracle) {
      await hre.run("oracle:set-price", { token: "TOUCH", price: "0.1" });
      await hre.run("oracle:set-price", { token: "TRIBE", price: "0.01" });
      taskArgs.priceOracle = (
        await hre.ethers.getContractAt("MasterPriceOracle", sdk.oracles.MasterPriceOracle.address, signer)
      ).address;
    }

    const existingPool = await poolModule.getPoolByName(taskArgs.name, sdk);
    const fuseFeeDistributor = (
      await hre.ethers.getContractAt("FuseFeeDistributor", sdk.contracts.FuseFeeDistributor.address)
    ).address;

    let poolAddress: string;
    if (existingPool) {
      console.log(`Pool with name ${existingPool.name} exists already, will operate on it`);
      poolAddress = existingPool.comptroller;
    } else {
      [poolAddress] = await poolModule.createPool({
        poolName: taskArgs.name,
        signer,
        priceOracleAddress: taskArgs.priceOracle,
      });
      // Deploy Assets
      const assets = await assetModule.getAssetsConf(
        poolAddress,
        fuseFeeDistributor,
        sdk.irms.JumpRateModel.address,
        hre.ethers
      );
      const deployedAssets = await poolModule.deployAssets(assets, signer);
      const [erc20One, erc20Two] = assets.filter((a) => a.underlying !== hre.ethers.constants.AddressZero);

      const deployedErc20One = deployedAssets.find((a) => a.underlying === erc20One.underlying);
      const deployedErc20Two = deployedAssets.find((a) => a.underlying === erc20Two.underlying);

      const erc20OneUnderlying = await hre.ethers.getContractAt("EIP20Interface", erc20One.underlying);
      const erc20TwoUnderlying = await hre.ethers.getContractAt("EIP20Interface", erc20Two.underlying);

      const marketOne = await hre.ethers.getContractAt("CErc20", deployedErc20One.assetAddress);
      const marketTwo = await hre.ethers.getContractAt("CErc20", deployedErc20Two.assetAddress);

      if (taskArgs.flywheelToken) {
        let flywheelMarket;
        const fwTokenInstance =
          taskArgs.flywheelToken === erc20OneUnderlying.address ? erc20OneUnderlying : erc20TwoUnderlying;
        if (taskArgs.flywheelMarket) {
          flywheelMarket = taskArgs.flywheelMarket === (await erc20OneUnderlying.symbol()) ? marketOne : marketTwo;
        } else {
          flywheelMarket = marketOne;
        }
        const flywheelCoreInstance = await sdk.deployFlywheelCore(fwTokenInstance.address, {
          from: signer.address,
        });
        const fwStaticRewards = await sdk.deployFlywheelStaticRewards(flywheelCoreInstance.address, {
          from: signer.address,
        });
        console.log("Deployed static rewards for: ", await fwTokenInstance.symbol());
        await sdk.setFlywheelRewards(flywheelCoreInstance.address, fwStaticRewards.address, { from: signer.address });
        await sdk.addFlywheelCoreToComptroller(flywheelCoreInstance.address, poolAddress, { from: signer.address });

        // Funding Static Rewards
        await fwTokenInstance.transfer(fwStaticRewards.address, hre.ethers.utils.parseUnits("100", 18), {
          from: signer.address,
        });

        // Setup Rewards, enable and set RewardInfo
        await sdk.addMarketForRewardsToFlywheelCore(flywheelCoreInstance.address, flywheelMarket.address, {
          from: signer.address,
        });
        await sdk.setStaticRewardInfo(
          fwStaticRewards.address,
          flywheelMarket.address,
          {
            rewardsEndTimestamp: 0,
            rewardsPerSecond: hre.ethers.utils.parseUnits("0.000001", 18),
          },
          { from: signer.address }
        );
        console.log(
          `Added static rewards for market ${await flywheelMarket.symbol()}, token rewards: ${await fwTokenInstance.symbol()}`
        );
      }
    }

    await poolModule.logPoolData(poolAddress, sdk);
    return poolAddress;
  });

task("pools:borrow", "Borrow collateral")
  .addParam("account", "Account from which to borrow", "deployer", types.string)
  .addParam("amount", "Amount to borrow", "1", types.string)
  .addParam("symbol", "Symbol of token to be borrowed", "ETH")
  .addParam("poolAddress", "Address of the poll")
  .setAction(async (taskArgs, hre) => {
    // @ts-ignore
    const collateralModule = await import("../tests/utils/collateral");
    const account = await hre.ethers.getNamedSigner(taskArgs.account);
    await collateralModule.borrowCollateral(taskArgs.poolAddress, account.address, taskArgs.symbol, taskArgs.amount);
  });

task("pools:deposit", "Deposit collateral")
  .addParam("account", "Account from which to borrow", "deployer", types.string)
  .addParam("amount", "Amount to deposit", "0", types.string)
  .addParam("symbol", "Symbol of token to be deposited", "ETH")
  .addParam("poolAddress", "Address of the poll")
  .addParam("enableCollateral", "Enable the asset as collateral", false, types.boolean)
  .setAction(async (taskArgs, hre) => {
    // @ts-ignore
    const collateralModule = await import("../tests/utils/collateral");
    const account = await hre.ethers.getNamedSigner(taskArgs.account);
    await collateralModule.addCollateral(
      taskArgs.poolAddress,
      account,
      taskArgs.symbol,
      taskArgs.amount,
      taskArgs.enableCollateral
    );
  });

task("pools:create-unhealthy-token-borrow-eth-collateral", "Borrow TOUCH against ETH")
  .addParam(
    "name",
    "Name of the pool to be created if does not exist",
    "unhealthy-token-borrow-eth-collateral",
    types.string
  )
  .addParam("supplyAccount", "Account from which to supply", "deployer", types.string)
  .addParam("borrowAccount", "Account from which to borrow", "alice", types.string)
  .setAction(async (taskArgs, hre) => {
    await hre.run("wrap-native-token", { account: "deployer", price: "1" });
    await hre.run("oracle:set-price", { token: "WETH", price: "1" });
    await hre.run("oracle:set-price", { token: "TOUCH", price: "0.1" });
    await hre.run("oracle:set-price", { token: "TRIBE", price: "0.01" });

    const poolAddress = await hre.run("pools:create", { name: taskArgs.name });

    // Supply ETH collateral from deployer
    await hre.run("pools:deposit", {
      account: taskArgs.supplyAccount,
      amount: 5,
      symbol: "WETH",
      poolAddress,
      enableCollateral: true,
    });
    console.log("WETH deposited");

    // Supply TOUCH collateral from alice
    await hre.run("pools:deposit", {
      account: taskArgs.borrowAccount,
      amount: 50,
      symbol: "TOUCH",
      poolAddress,
      enableCollateral: true,
    });
    console.log("TOUCH deposited");

    // Borrow TOUCH with ETH as collateral from deployer
    await hre.run("pools:borrow", {
      account: taskArgs.supplyAccount,
      amount: 10,
      symbol: "TOUCH",
      poolAddress,
    });
    console.log(`borrowed TOUCH using ETH as collateral`);
    await hre.run("oracle:set-price", { token: "TOUCH", price: "1", poolAddress });
  });

task("pools:create-unhealthy-eth-borrow-token-collateral", "Borrow ETH against TRIBE")
  .addParam(
    "name",
    "Name of the pool to be created if does not exist",
    "unhealthy-eth-borrow-token-collateral",
    types.string
  )
  .addParam("supplyAccount", "Account from which to supply", "deployer", types.string)
  .addParam("borrowAccount", "Account from which to borrow", "alice", types.string)
  .setAction(async (taskArgs, hre) => {
    await hre.run("oracle:set-price", { token: "ETH", price: "1" });
    await hre.run("oracle:set-price", { token: "TOUCH", price: "1" });
    await hre.run("oracle:set-price", { token: "TRIBE", price: "0.1" });

    const poolAddress = await hre.run("pools:create", { name: taskArgs.name });

    // Supply TRIBE collateral from bob
    await hre.run("pools:deposit", {
      account: taskArgs.supplyAccount,
      amount: 50,
      symbol: "TRIBE",
      poolAddress,
      enableCollateral: true,
    });
    console.log("TRIBE deposited");

    // Supply ETH collateral from alice
    await hre.run("pools:deposit", {
      account: taskArgs.borrowAccount,
      amount: 5,
      symbol: "ETH",
      poolAddress,
      enableCollateral: false,
    });
    console.log("ETH deposited");

    // Borrow ETH with TRIBE as collateral from bob
    await hre.run("pools:borrow", {
      account: taskArgs.supplyAccount,
      amount: 1,
      symbol: "ETH",
      poolAddress,
    });
    console.log(`borrowed ETH using TRIBE as collateral`);
    await hre.run("oracle:set-price", { token: "TRIBE", price: "0.01", poolAddress });
  });

task("pools:create-unhealthy-token-borrow-token-collateral", "Borrow ETH against TRIBE")
  .addParam(
    "name",
    "Name of the pool to be created if does not exist",
    "unhealthy-token-borrow-token-collateral",
    types.string
  )
  .addParam("supplyAccount", "Account from which to supply", "deployer", types.string)
  .addParam("borrowAccount", "Account from which to borrow", "alice", types.string)
  .setAction(async (taskArgs, hre) => {
    await hre.run("oracle:set-price", { token: "ETH", price: "1" });
    await hre.run("oracle:set-price", { token: "TOUCH", price: "0.1" });
    await hre.run("oracle:set-price", { token: "TRIBE", price: "0.01" });

    const poolAddress = await hre.run("pools:create", { name: taskArgs.name });

    // Supply TRIBE collateral from deployer
    await hre.run("pools:deposit", {
      account: taskArgs.supplyAccount,
      amount: 50,
      symbol: "TRIBE",
      poolAddress,
      enableCollateral: true,
    });
    console.log("TRIBE deposited");

    // Supply TOUCH collateral from alice
    await hre.run("pools:deposit", {
      account: taskArgs.borrowAccount,
      amount: 5,
      symbol: "TOUCH",
      poolAddress,
      enableCollateral: false,
    });
    console.log("TOUCH deposited");

    // Borrow TOUCH with TRIBE as collateral from deployer
    await hre.run("pools:borrow", {
      account: taskArgs.supplyAccount,
      amount: 1,
      symbol: "TOUCH",
      poolAddress,
    });
    console.log(`borrowed TOUCH using TRIBE as collateral`);
    await hre.run("oracle:set-price", { token: "TOUCH", price: "1", poolAddress });
  });
