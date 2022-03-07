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
  .setAction(async (taskArgs, hre) => {
    await hre.run("set-price", { token: "ETH", price: "1" });
    await hre.run("set-price", { token: "TOUCH", price: "0.1" });
    await hre.run("set-price", { token: "TRIBE", price: "0.01" });

    const poolModule = await import("../test/utils/pool");
    // @ts-ignore
    const sdkModule = await import("../dist/esm/src");

    const sdk = new sdkModule.Fuse(hre.ethers.provider, sdkModule.SupportedChains.ganache);
    const account = await hre.ethers.getNamedSigner(taskArgs.creator);
    const existingPool = await poolModule.getPoolByName(taskArgs.name, sdk);

    let poolAddress: string;
    if (existingPool !== null) {
      console.log(`Pool with name ${existingPool.name} exists already, will operate on it`);
      poolAddress = existingPool.comptroller;
    } else {
      [poolAddress] = await poolModule.createPool({ poolName: taskArgs.name, signer: account });
      const assets = await poolModule.getPoolAssets(poolAddress);
      await poolModule.deployAssets(assets.assets, account);
    }
    await poolModule.logPoolData(poolAddress, sdk);
    return poolAddress;
  });

task("pools:borrow", "Borrow collateral")
  .addParam("account", "Account from which to borrow", "deployer", types.string)
  .addParam("amount", "Amount to borrow", 0, types.int)
  .addParam("symbol", "Symbol of token to be borrowed", "ETH")
  .addParam("poolAddress", "Address of the poll")
  .setAction(async (taskArgs, hre) => {
    const { chainId } = await hre.ethers.provider.getNetwork();
    const collateralModule = await import("../test/utils/collateral");
    const account = await hre.ethers.getNamedSigner(taskArgs.account);
    await collateralModule.borrowCollateral(
      taskArgs.poolAddress,
      account.address,
      taskArgs.symbol,
      taskArgs.amount.toString()
    );
  });

task("pools:deposit", "Deposit collateral")
  .addParam("account", "Account from which to borrow", "deployer", types.string)
  .addParam("amount", "Amount to deposit", 0, types.int)
  .addParam("symbol", "Symbol of token to be deposited", "ETH")
  .addParam("poolAddress", "Address of the poll")
  .addParam("enableCollateral", "Enable the asset as collateral", false, types.boolean)
  .setAction(async (taskArgs, hre) => {
    const collateralModule = await import("../test/utils/collateral");
    const account = await hre.ethers.getNamedSigner(taskArgs.account);
    const { chainId } = await hre.ethers.provider.getNetwork();
    await collateralModule.addCollateral(
      taskArgs.poolAddress,
      account,
      taskArgs.symbol,
      taskArgs.amount.toString(),
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
    await hre.run("set-price", { token: "ETH", price: "1" });
    await hre.run("set-price", { token: "TOUCH", price: "0.1" });
    await hre.run("set-price", { token: "TRIBE", price: "0.01" });

    const poolAddress = await hre.run("pools:create", { name: taskArgs.name });

    // Supply ETH collateral from deployer
    await hre.run("pools:deposit", {
      account: taskArgs.supplyAccount,
      amount: 5,
      symbol: "ETH",
      poolAddress,
      enableCollateral: true,
    });
    console.log("ETH deposited");

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
    await hre.run("set-price", { token: "TOUCH", price: "1", poolAddress });
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
    await hre.run("set-price", { token: "ETH", price: "1" });
    await hre.run("set-price", { token: "TOUCH", price: "1" });
    await hre.run("set-price", { token: "TRIBE", price: "0.1" });

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
    await hre.run("set-price", { token: "TRIBE", price: "0.01", poolAddress });
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
    await hre.run("set-price", { token: "ETH", price: "1" });
    await hre.run("set-price", { token: "TOUCH", price: "0.1" });
    await hre.run("set-price", { token: "TRIBE", price: "0.01" });

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
    await hre.run("set-price", { token: "TOUCH", price: "1", poolAddress });
  });
