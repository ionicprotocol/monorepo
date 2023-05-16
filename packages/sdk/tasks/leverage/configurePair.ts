import { task, types } from "hardhat/config";

import { CErc20Delegate } from "../../typechain/CErc20Delegate";
import { ERC20PresetMinterPauser } from "../../typechain/ERC20PresetMinterPauser";
import { LeveredPosition } from "../../typechain/LeveredPosition";
import { LeveredPositionFactory } from "../../typechain/LeveredPositionFactory";
import { LiquidatorsRegistry } from "../../typechain/LiquidatorsRegistry";

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
