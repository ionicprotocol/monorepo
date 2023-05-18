import { task, types } from "hardhat/config";

import { CErc20Delegate } from "../../typechain/CErc20Delegate";
import { CErc20RewardsDelegate } from "../../typechain/CErc20RewardsDelegate";
import { Comptroller } from "../../typechain/Comptroller";
import { ComptrollerFirstExtension } from "../../typechain/ComptrollerFirstExtension";
import { ERC20PresetMinterPauser } from "../../typechain/ERC20PresetMinterPauser";
import { LeveredPosition } from "../../typechain/LeveredPosition";
import { LeveredPositionFactory } from "../../typechain/LeveredPositionFactory";
import { LiquidatorsRegistry } from "../../typechain/LiquidatorsRegistry";
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
  .setAction(
    async (
      { collateralMarketAddress, borrowMarketAddress, liquidatorName },
      { ethers, getChainId, deployments, run, getNamedAccounts }
    ) => {
      const { deployer } = await getNamedAccounts();

      const liquidator = await ethers.getContract(liquidatorName);
      const registry = (await ethers.getContract("LiquidatorsRegistry", deployer)) as LiquidatorsRegistry;

      const collateralMarket = (await ethers.getContractAt(
        "CErc20Delegate",
        collateralMarketAddress
      )) as CErc20Delegate;
      const borrowMarket = (await ethers.getContractAt("CErc20Delegate", borrowMarketAddress)) as CErc20Delegate;

      const collateralToken = await collateralMarket.callStatic.underlying();
      const borrowToken = await borrowMarket.callStatic.underlying();

      const factory = (await ethers.getContract("LeveredPositionFactory", deployer)) as LeveredPositionFactory;

      let tx = await registry._setRedemptionStrategies(
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
    }
  );

task("chapel-create-levered-position", "creates and funds a levered position on chapel").setAction(
  async ({}, { ethers, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const testingBombAddress = "0xe45589fBad3A1FB90F5b2A8A3E8958a8BAB5f768"; // TUSD
    const testingBomb = (await ethers.getContractAt(
      "ERC20PresetMinterPauser",
      testingBombAddress,
      deployer
    )) as ERC20PresetMinterPauser;
    const borrowMarketAddress = "0x8c4FaB47f0E5F4263A37e5Dbe65Dd275EAF6687e"; // TUSD market
    const collateralMarketAddress = "0xfa60851E76728eb31EFeA660937cD535C887fDbD"; // BOMB market

    const factory = (await ethers.getContract("LeveredPositionFactory", deployer)) as LeveredPositionFactory;

    const oneEth = ethers.utils.parseEther("1");
    let tx = await testingBomb.approve(factory.address, oneEth);
    await tx.wait();
    console.log(`approved position for 1e18 bomb`);

    tx = await factory.createAndFundPosition(collateralMarketAddress, borrowMarketAddress, testingBombAddress, oneEth);
    await tx.wait();
    console.log(`created a levered position with tx ${tx.hash}`);

    const deployerPositions = await factory.callStatic.getPositionsByAccount(deployer);
    console.log(`position address ${deployerPositions[deployerPositions.length - 1]}`);
  }
);

task("chapel-create-asset-deploy-market", "creates a new asset and deploy a market for it on chapel").setAction(
  async ({}, { ethers, deployments, run, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const ffd = await ethers.getContract("FuseFeeDistributor");
    const jrm = await ethers.getContract("JumpRateModel");
    const rewardsDelegate = await ethers.getContract("CErc20RewardsDelegate");

    const tdaiDep = await deployments.deploy("TestingDAI", {
      contract: "ERC20PresetMinterPauser",
      from: deployer,
      log: true,
      skipIfAlreadyDeployed: true,
      args: ["Testing DAI", "DAI"],
      waitConfirmations: 1,
    });

    const tdai = (await ethers.getContractAt(
      "ERC20PresetMinterPauser",
      tdaiDep.address,
      deployer
    )) as ERC20PresetMinterPauser;

    const ts = await tdai.callStatic.totalSupply();
    if (ts == 0) {
      const mintAmount = ethers.utils.parseEther("87654321");
      const tx = await tdai.mint(deployer, mintAmount);
      await tx.wait();
      console.log(`minted some tokens to the deployer`);
    }

    const chapelMidasPool = "0x044c436b2f3EF29D30f89c121f9240cf0a08Ca4b";
    const spo = (await ethers.getContract("SimplePriceOracle", deployer)) as SimplePriceOracle;
    let tx;

    tx = await spo.setDirectPrice(tdai.address, ethers.utils.parseEther("0.67"));
    await tx.wait();
    console.log(`set the price of the testing DAI`);

    const mpo = (await ethers.getContract("MasterPriceOracle", deployer)) as MasterPriceOracle;
    tx = await mpo.add([tdai.address], [spo.address]);
    await tx.wait();
    console.log(`added the SPO to the MPO for the testing DAI token`);

    const pool = (await ethers.getContractAt("Comptroller", chapelMidasPool, deployer)) as Comptroller;
    const midasPoolAsExt = (await ethers.getContractAt(
      "ComptrollerFirstExtension",
      chapelMidasPool,
      deployer
    )) as ComptrollerFirstExtension;

    const constructorData = new ethers.utils.AbiCoder().encode(
      ["address", "address", "address", "address", "string", "string", "address", "bytes", "uint256", "uint256"],
      [
        tdai.address,
        chapelMidasPool,
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

    const allMarkets = await midasPoolAsExt.callStatic.getAllMarkets();
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

task("chapel-fund-first-levered-position", "funds a levered position on chapel").setAction(
  async ({}, { ethers, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const testingBombAddress = "0xe45589fBad3A1FB90F5b2A8A3E8958a8BAB5f768";
    const testingBomb = (await ethers.getContractAt(
      "ERC20PresetMinterPauser",
      testingBombAddress,
      deployer
    )) as ERC20PresetMinterPauser;

    const factory = (await ethers.getContract("LeveredPositionFactory", deployer)) as LeveredPositionFactory;
    const deployerPositions = await factory.callStatic.getPositionsByAccount(deployer);
    console.log(`position ${deployerPositions[0]}`);

    const leveredPosition = (await ethers.getContractAt(
      "LeveredPosition",
      deployerPositions[0],
      deployer
    )) as LeveredPosition;

    const oneEth = ethers.utils.parseEther("1");
    let tx = await testingBomb.approve(leveredPosition.address, oneEth);
    await tx.wait();
    console.log(`approved position for 1e18 bomb`);

    tx = await leveredPosition.fundPosition(testingBombAddress, oneEth);
    await tx.wait();
    console.log(`funded the levered position`);
  }
);

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
    const testingStable = (await ethers.getContractAt(
      "ERC20PresetMinterPauser",
      stableAddress,
      deployer
    )) as ERC20PresetMinterPauser;
    tx = await testingStable.approve(borrowMarket.address, ethers.constants.MaxUint256);
    await tx.wait();
    console.log(`approved to mint`);

    tx = await testingStable.mint(deployer, ethers.utils.parseEther("54321").mul(1_000_000));
    await tx.wait();
    console.log(`minted stables`);

    tx = await borrowMarket.mint(ethers.utils.parseEther("4321").mul(1_000_000));
    await tx.wait();
    console.log(`minted in the stable market`);
  }
);
