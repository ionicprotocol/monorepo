import { task, types } from "hardhat/config";

import { CErc20Delegate } from "../../typechain/CErc20Delegate";
import { CErc20RewardsDelegate } from "../../typechain/CErc20RewardsDelegate";
import { Comptroller } from "../../typechain/Comptroller";
import { ComptrollerFirstExtension } from "../../typechain/ComptrollerFirstExtension";
import { ERC20 } from "../../typechain/ERC20";
import { IERC20Mintable } from "../../typechain/IERC20Mintable";
import { ILeveredPositionFactory } from "../../typechain/ILeveredPositionFactory";
import { ILiquidatorsRegistry } from "../../typechain/ILiquidatorsRegistry";
import { LeveredPosition } from "../../typechain/LeveredPosition";
import { LeveredPositionFactory } from "../../typechain/LeveredPositionFactory";
import { LiquidatorsRegistryExtension } from "../../typechain/LiquidatorsRegistryExtension";
import { MasterPriceOracle } from "../../typechain/MasterPriceOracle";
import { SimplePriceOracle } from "../../typechain/SimplePriceOracle";

export default task("levered-positions:configure-pair")
  .addParam("collateralMarketAddress", "Address of the market that will be used as collateral", undefined, types.string)
  .addParam("borrowMarketAddress", "Address of the market that will be used to borrow against", undefined, types.string)
  .addParam(
    "liquidatorName",
    "Name of the redemption strategy used to convert between the two underlying assets",
    undefined,
    types.string
  )
  .setAction(async ({ collateralMarketAddress, borrowMarketAddress, liquidatorName }, { ethers, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const liquidator = await ethers.getContract(liquidatorName);
    const registry = (await ethers.getContract("LiquidatorsRegistry", deployer)) as ILiquidatorsRegistry;
    const registryAsExt = (await ethers.getContractAt(
      "LiquidatorsRegistryExtension",
      registry.address,
      deployer
    )) as LiquidatorsRegistryExtension;

    const collateralMarket = (await ethers.getContractAt("CErc20Delegate", collateralMarketAddress)) as CErc20Delegate;
    const borrowMarket = (await ethers.getContractAt("CErc20Delegate", borrowMarketAddress)) as CErc20Delegate;

    const collateralToken = await collateralMarket.callStatic.underlying();
    const borrowToken = await borrowMarket.callStatic.underlying();

    const factory = (await ethers.getContract("LeveredPositionFactory", deployer)) as LeveredPositionFactory;

    let tx = await registryAsExt._setRedemptionStrategies(
      [liquidator.address, liquidator.address],
      [collateralToken, borrowToken],
      [borrowToken, collateralToken]
    );
    await tx.wait();
    console.log(
      `configured the redemption strategy for the collateral/borrow pair ${collateralToken} / ${borrowToken}`
    );

    tx = await factory._setPairWhitelisted(collateralMarketAddress, borrowMarketAddress, true);
    await tx.wait();
    console.log(
      `configured the markets pair ${collateralMarketAddress} / ${borrowMarketAddress} as whitelisted for levered positions`
    );
  });

task("chapel-borrow-tusd", "creates and funds a levered position on chapel").setAction(
  async ({}, { ethers, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const borrowMarketAddress = "0x8c4FaB47f0E5F4263A37e5Dbe65Dd275EAF6687e"; // TUSD market
    const testingBombAddress = "0xe45589fBad3A1FB90F5b2A8A3E8958a8BAB5f768"; // BOMB
    const testingBomb = (await ethers.getContractAt("ERC20", testingBombAddress, deployer)) as ERC20;
    const collateralMarketAddress = "0xfa60851E76728eb31EFeA660937cD535C887fDbD"; // BOMB market
    const chapelIonicPool = "0x044c436b2f3EF29D30f89c121f9240cf0a08Ca4b";

    // const collateralMarket = (await ethers.getContractAt(
    //   "CErc20Delegate",
    //   collateralMarketAddress,
    //   deployer
    // )) as CErc20Delegate;
    // const fundAmount = ethers.utils.parseEther("300000000000");
    //
    // let tx = await testingBomb.approve(collateralMarket.address, fundAmount);
    // await tx.wait();
    // console.log(`mined approve tx ${tx.hash}`);
    //
    // const errCode = await collateralMarket.callStatic.mint(fundAmount);
    // if (errCode.isZero()) {
    //   let tx = await collateralMarket.mint(fundAmount);
    //   await tx.wait();
    //   console.log(`minted a lot of bomb with tx ${tx.hash}`);
    // } else {
    //   throw new Error(`err code ${errCode}`);
    // }

    let tx;
    const pool = (await ethers.getContractAt("Comptroller", chapelIonicPool, deployer)) as Comptroller;
    tx = await pool.enterMarkets([collateralMarketAddress, borrowMarketAddress]);
    await tx.wait();
    console.log(`entered markets ${tx.hash}`);

    const borrowMarket = (await ethers.getContractAt(
      "CErc20Delegate",
      borrowMarketAddress,
      deployer
    )) as CErc20Delegate;

    const borrowAmount = ethers.utils.parseEther("1000000000000");
    const errCode = await borrowMarket.callStatic.borrow(borrowAmount);
    if (!errCode.isZero()) throw new Error(`err code ${errCode}`);

    tx = await borrowMarket.borrow(borrowAmount);
    await tx.wait();
    console.log(`borrowed a lot of TUSD with ${tx.hash}`);
  }
);

task("chapel-create-levered-position", "creates and funds a levered position on chapel").setAction(
  async ({}, { ethers, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const testingBombAddress = "0xe45589fBad3A1FB90F5b2A8A3E8958a8BAB5f768"; // BOMB
    const testingBomb = (await ethers.getContractAt("ERC20", testingBombAddress, deployer)) as ERC20;
    const borrowMarketAddress = "0x8c4FaB47f0E5F4263A37e5Dbe65Dd275EAF6687e"; // TUSD market
    const collateralMarketAddress = "0xfa60851E76728eb31EFeA660937cD535C887fDbD"; // BOMB market

    const factoryDep = (await ethers.getContract("LeveredPositionFactory")) as LeveredPositionFactory;
    const factory = (await ethers.getContractAt(
      "ILeveredPositionFactory",
      factoryDep.address,
      deployer
    )) as ILeveredPositionFactory;

    const fundAmount = ethers.utils.parseEther("10000000");
    let tx = await testingBomb.approve(factory.address, fundAmount);
    await tx.wait();
    console.log(`approved position for bomb`);

    tx = await factory.createAndFundPosition(
      collateralMarketAddress,
      borrowMarketAddress,
      testingBombAddress,
      fundAmount
    );
    await tx.wait();
    console.log(`created a levered position with tx ${tx.hash}`);

    const [deployerPositions, closed] = await factory.callStatic.getPositionsByAccount(deployer);
    console.log(`position address ${deployerPositions[deployerPositions.length - 1]}`);
  }
);

task("chapel-close-levered-position").setAction(async ({}, { ethers, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  const positionAddress = "0x653BB36eF45BAee27A71C339F12Cc730CFb0EcBe";

  const position = (await ethers.getContractAt("LeveredPosition", positionAddress, deployer)) as LeveredPosition;

  let tx = await position["closePosition()"]();
  await tx.wait();
  console.log(`closed`);

  const factoryDep = (await ethers.getContract("LeveredPositionFactory")) as LeveredPositionFactory;
  const factory = (await ethers.getContractAt(
    "ILeveredPositionFactory",
    factoryDep.address,
    deployer
  )) as ILeveredPositionFactory;

  tx = await factory.removeClosedPosition(positionAddress);
  await tx.wait();
  console.log(`removed a closed levered position with tx ${tx.hash}`);

  const [deployerPositions, closed] = await factory.callStatic.getPositionsByAccount(deployer);
  console.log(`pos ${deployerPositions}`);
  console.log(`closed ${closed}`);
});

task("chapel-close-remove-levered-position").setAction(async ({}, { ethers, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  const positionAddress = "0x263718679A41AafDAa8f3d94425BC80bf72439e5";

  const factoryDep = (await ethers.getContract("LeveredPositionFactory")) as LeveredPositionFactory;
  const factory = (await ethers.getContractAt(
    "ILeveredPositionFactory",
    factoryDep.address,
    deployer
  )) as ILeveredPositionFactory;

  const tx = await factory.closeAndRemoveUserPosition(positionAddress);
  await tx.wait();
  console.log(`removed a closed levered position with tx ${tx.hash}`);
});

task("chapel-create-asset-deploy-market", "creates a new asset and deploy a market for it on chapel").setAction(
  async ({}, { ethers, deployments, run, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const ffd = await ethers.getContract("FuseFeeDistributor");
    const jrm = await ethers.getContract("JumpRateModel");
    const rewardsDelegate = await ethers.getContract("CErc20RewardsDelegate");

    // const tdaiDep = await deployments.deploy("TestingDAI", {
    //   contract: "ERC20PresetMinterPauser",
    //   from: deployer,
    //   log: true,
    //   skipIfAlreadyDeployed: true,
    //   args: ["Testing DAI", "DAI"],
    //   waitConfirmations: 1,
    // });

    const tdai = (await ethers.getContractAt(
      "ERC20",
      "0x8870f7102F1DcB1c35b01af10f1baF1B00aD6805", //tdaiDep.address,
      deployer
    )) as ERC20;

    // const ts = await tdai.callStatic.totalSupply();
    // if (ts == 0) {
    //   const mintAmount = ethers.utils.parseEther("87654321");
    //   const tx = await tdai.mint(deployer, mintAmount);
    //   await tx.wait();
    //   console.log(`minted some tokens to the deployer`);
    // }

    const chapelIonicPool = "0x044c436b2f3EF29D30f89c121f9240cf0a08Ca4b";
    const spo = (await ethers.getContract("SimplePriceOracle", deployer)) as SimplePriceOracle;

    let tx;
    tx = await spo.setDirectPrice(tdai.address, ethers.utils.parseEther("0.67"));
    await tx.wait();
    console.log(`set the price of the testing DAI`);

    const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;
    tx = await mpo.add([tdai.address], [spo.address]);
    await tx.wait();
    console.log(`added the SPO to the MPO for the testing DAI token`);

    const pool = (await ethers.getContractAt("Comptroller", chapelIonicPool, deployer)) as Comptroller;
    const ionicPoolAsExt = (await ethers.getContractAt(
      "ComptrollerFirstExtension",
      chapelIonicPool,
      deployer
    )) as ComptrollerFirstExtension;

    const constructorData = new ethers.utils.AbiCoder().encode(
      ["address", "address", "address", "address", "string", "string", "address", "bytes", "uint256", "uint256"],
      [
        tdai.address,
        chapelIonicPool,
        ffd.address,
        jrm.address,
        "M Testing BOMB",
        "MTB",
        rewardsDelegate.address,
        new ethers.utils.AbiCoder().encode([], []),
        0,
        0,
      ]
    );

    tx = await pool._deployMarket(false, constructorData, ethers.utils.parseEther("0.9"));
    console.log(`mining tx ${tx.hash}`);
    await tx.wait();
    console.log(`deployed a testing DAI market`);

    const allMarkets = await ionicPoolAsExt.callStatic.getAllMarkets();
    const newMarketAddress = allMarkets[allMarkets.length - 1];

    tx = await tdai.approve(newMarketAddress, ethers.constants.MaxUint256);
    await tx.wait();
    console.log(`approved the new market to pull the underlying testing DAI tokens`);

    const newMarket = (await ethers.getContractAt(
      "CErc20RewardsDelegate",
      newMarketAddress,
      deployer
    )) as CErc20RewardsDelegate;
    const errCode = await newMarket.callStatic.mint(ethers.utils.parseEther("2"));
    if (!errCode.isZero()) throw new Error(`unable to mint cTokens from the new testing BOMB market`);
    else {
      tx = await newMarket.mint(ethers.utils.parseEther("7654321"));
      await tx.wait();
      console.log(`minted some cTokens from the testing DAI market`);
    }

    const testingBombMarket = "0xfa60851E76728eb31EFeA660937cD535C887fDbD";
    await run("levered-positions:configure-pair", {
      collateralMarketAddress: testingBombMarket,
      borrowMarketAddress: newMarketAddress,
      liquidatorName: "XBombLiquidatorFunder",
    });
  }
);

task("chapel-fund-levered-position", "funds a levered position on chapel").setAction(
  async ({}, { ethers, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const testingBombAddress = "0xe45589fBad3A1FB90F5b2A8A3E8958a8BAB5f768";
    const testingBomb = (await ethers.getContractAt("ERC20", testingBombAddress, deployer)) as ERC20;

    const factoryDep = (await ethers.getContract("LeveredPositionFactory")) as LeveredPositionFactory;
    const factory = (await ethers.getContractAt(
      "ILeveredPositionFactory",
      factoryDep.address,
      deployer
    )) as ILeveredPositionFactory;
    const [deployerPositions, closed] = await factory.callStatic.getPositionsByAccount(deployer);
    console.log(`position ${deployerPositions[0]}`);

    const leveredPosition = (await ethers.getContractAt(
      "LeveredPosition",
      "0x653BB36eF45BAee27A71C339F12Cc730CFb0EcBe", //deployerPositions[0],
      deployer
    )) as LeveredPosition;

    const fundAmount = ethers.utils.parseEther("10000000");
    let tx = await testingBomb.approve(leveredPosition.address, fundAmount);
    await tx.wait();
    console.log(`approved position for bomb`);

    tx = await leveredPosition.fundPosition(testingBombAddress, fundAmount);
    await tx.wait();
    console.log(`funded the levered position`);
  }
);

task("chapel-adjust-ratio-levered-position").setAction(async ({}, { ethers, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();

  const leveredPosition = (await ethers.getContractAt(
    "LeveredPosition",
    "0x8EfC6FC5A7A29f9E93E1FA9fB1929B52FC812B8A",
    deployer
  )) as LeveredPosition;

  const ratio = ethers.utils.parseEther("1.44");
  const tx = await leveredPosition.adjustLeverageRatio(ratio);
  await tx.wait();
  console.log(`adjusted the ratio`);
});

task("chapel-stables-mint", "mints testing stables in the levered pair borrowing market").setAction(
  async ({}, { ethers, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    const borrowMarketAddress = "0x8c4FaB47f0E5F4263A37e5Dbe65Dd275EAF6687e";

    let tx;
    const borrowMarket = (await ethers.getContractAt(
      "CErc20Delegate",
      borrowMarketAddress,
      deployer
    )) as CErc20Delegate;
    const stableAddress = await borrowMarket.callStatic.underlying();
    const testingStableMintable = (await ethers.getContractAt(
      "IERC20Mintable",
      stableAddress,
      deployer
    )) as IERC20Mintable;

    tx = await testingStableMintable.mint(deployer, ethers.utils.parseEther("54321").mul(1_000_000));
    await tx.wait();
    console.log(`minted stables`);

    const testingStable = (await ethers.getContractAt("ERC20", stableAddress, deployer)) as ERC20;

    tx = await testingStable.approve(borrowMarket.address, ethers.constants.MaxUint256);
    await tx.wait();
    console.log(`approved to mint`);

    tx = await borrowMarket.mint(ethers.utils.parseEther("4321").mul(1_000_000));
    await tx.wait();
    console.log(`minted in the stable market`);
  }
);
