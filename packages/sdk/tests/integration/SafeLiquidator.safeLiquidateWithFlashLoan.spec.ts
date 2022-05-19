import { BigNumber, providers, utils } from "ethers";
import { deployments, ethers } from "hardhat";
import { setUpLiquidation, setUpPriceOraclePrices, tradeNativeForAsset } from "../utils";
import { addCollateral, borrowCollateral } from "../utils/collateral";
import {
  CErc20,
  CEther,
  EIP20Interface,
  FuseFeeDistributor,
  FuseSafeLiquidator,
  SimplePriceOracle,
} from "../../lib/contracts/typechain";
import { cERC20Conf, ChainLiquidationConfig } from "../../src";
import { DeployedAsset } from "../utils/pool";
import { liquidateAndVerify, resetPriceOracle } from "../utils/setup";
import { getOrCreateFuse } from "../utils/fuseSdk";
import { getChainLiquidationConfig } from "../../src/modules/liquidation/config";

(process.env.FORK_CHAIN_ID ? describe.skip : describe.skip)("#safeLiquidateWithFlashLoan", () => {
  let tx: providers.TransactionResponse;

  let eth: cERC20Conf;
  let erc20One: cERC20Conf;
  let erc20Two: cERC20Conf;

  let deployedEth: DeployedAsset;
  let deployedErc20One: DeployedAsset;
  let deployedErc20Two: DeployedAsset;

  let poolAddress: string;
  let simpleOracle: SimplePriceOracle;
  let liquidator: FuseSafeLiquidator;
  let fuseFeeDistributor: FuseFeeDistributor;

  let ethCToken: CEther;
  let erc20OneCToken: CErc20;
  let erc20TwoCToken: CErc20;

  let erc20OneUnderlying: EIP20Interface;
  let erc20TwoUnderlying: EIP20Interface;

  let erc20OneOriginalUnderlyingPrice: BigNumber;
  let erc20TwoOriginalUnderlyingPrice: BigNumber;

  let chainId: number;
  let poolName: string;

  let liquidationConfigOverrides: ChainLiquidationConfig;

  beforeEach(async () => {
    poolName = "liquidation - fl - " + Math.random().toString();
    ({ chainId } = await ethers.provider.getNetwork());
    await deployments.fixture("prod");
    const sdk = await getOrCreateFuse();

    liquidationConfigOverrides = {
      ...getChainLiquidationConfig(sdk)[chainId],
    };
    await setUpPriceOraclePrices();
    ({
      poolAddress,
      deployedEth,
      deployedErc20One,
      deployedErc20Two,
      eth,
      erc20One,
      erc20Two,
      ethCToken,
      erc20OneCToken,
      erc20TwoCToken,
      liquidator,
      erc20OneUnderlying,
      erc20TwoUnderlying,
      erc20OneOriginalUnderlyingPrice,
      erc20TwoOriginalUnderlyingPrice,
      simpleOracle,
      fuseFeeDistributor,
    } = await setUpLiquidation(poolName));
  });

  afterEach(async () => {
    await resetPriceOracle(erc20One, erc20Two);
  });

  it("FL - should liquidate a native borrow for token collateral", async function () {
    const { alice, bob } = await ethers.getNamedSigners();

    console.log(
      "starting with prices: ",
      utils.formatEther(erc20OneOriginalUnderlyingPrice),
      utils.formatEther(erc20TwoOriginalUnderlyingPrice)
    );
    // get some liquidity via Uniswap
    await tradeNativeForAsset({ account: "alice", token: erc20One.underlying, amount: "300" });

    // Supply 1 tokenOne from other account
    await addCollateral(poolAddress, alice, erc20One.symbol, "0.1", true);
    console.log(`Added ${erc20One.symbol} collateral`);

    // Supply 10 native from other account
    await addCollateral(poolAddress, bob, eth.symbol, "10", false);

    // Borrow 5 native using token collateral
    const borrowAmount = "4.8";
    await borrowCollateral(poolAddress, alice.address, eth.symbol, borrowAmount);

    // Set price of tokenOne collateral to 6/10th of what it was
    tx = await simpleOracle.setDirectPrice(erc20One.underlying, erc20OneOriginalUnderlyingPrice.mul(6).div(10));
    await tx.wait();

    await liquidateAndVerify(
      poolName,
      poolAddress,
      "alice",
      liquidator,
      liquidationConfigOverrides,
      erc20OneUnderlying.balanceOf
    );

    // Set price of tokenOne collateral back to what it was
    tx = await simpleOracle.setDirectPrice(erc20One.underlying, erc20OneOriginalUnderlyingPrice);
    await tx.wait();
  });

  // Safe liquidate token borrows
  it("FL - should liquidate a token borrow for native collateral", async function () {
    const { alice, bob } = await ethers.getNamedSigners();

    console.log("staring with prices: ", utils.formatEther(erc20OneOriginalUnderlyingPrice));
    await tradeNativeForAsset({ account: "alice", token: erc20One.underlying, amount: "150" });
    // Supply native collateral
    await addCollateral(poolAddress, bob, eth.symbol, "10", true);

    // Supply tokenOne from other account
    await addCollateral(poolAddress, alice, erc20One.symbol, "0.1", true);

    // Borrow tokenOne using native as collateral
    const borrowAmount = "0.05";
    await borrowCollateral(poolAddress, bob.address, erc20One.symbol, borrowAmount);

    // Set price of borrowed token to 10/6th of what it was
    tx = await simpleOracle.setDirectPrice(erc20One.underlying, erc20OneOriginalUnderlyingPrice.mul(10).div(6));
    // tx = await simpleOracle.setDirectPrice(deployedErc20One.underlying, BigNumber.from(originalPrice).mul(10).div(6));
    await tx.wait();

    await liquidateAndVerify(
      poolName,
      poolAddress,
      "bob",
      liquidator,
      liquidationConfigOverrides,
      ethers.provider.getBalance
    );

    // Set price of tokenOne collateral back to what it was
    tx = await simpleOracle.setDirectPrice(erc20One.underlying, erc20OneOriginalUnderlyingPrice);
    await tx.wait();
  });

  it("FL - should liquidate a token borrow for token collateral", async function () {
    const { alice, bob } = await ethers.getNamedSigners();
    console.log(
      "staring with prices: ",
      utils.formatEther(erc20OneOriginalUnderlyingPrice),
      utils.formatEther(erc20TwoOriginalUnderlyingPrice)
    );

    await tradeNativeForAsset({ account: "alice", token: erc20One.underlying, amount: "50" });
    await tradeNativeForAsset({ account: "bob", token: erc20Two.underlying, amount: "50" });

    // Supply 0.1 tokenOne from other account
    await addCollateral(poolAddress, alice, erc20One.symbol, "0.1", true);
    console.log(`Added ${erc20One.symbol} collateral`);

    // Supply 1 tokenTwo from other account
    await addCollateral(poolAddress, bob, erc20Two.symbol, "5000", true);
    console.log(`Added ${erc20Two.symbol} collateral`);

    // Borrow tokenOne using tokenTwo as collateral
    const borrowAmount = "0.055";
    await borrowCollateral(poolAddress, bob.address, erc20One.symbol, borrowAmount);

    // Set price of borrowed token to 10x of what it was
    tx = await simpleOracle.setDirectPrice(
      deployedErc20One.underlying,
      BigNumber.from(erc20OneOriginalUnderlyingPrice).mul(2)
    );
    await tx.wait();

    await liquidateAndVerify(
      poolName,
      poolAddress,
      "bob",
      liquidator,
      liquidationConfigOverrides,
      erc20TwoUnderlying.balanceOf
    );

    tx = await simpleOracle.setDirectPrice(deployedErc20One.underlying, erc20OneOriginalUnderlyingPrice);
  });
});
