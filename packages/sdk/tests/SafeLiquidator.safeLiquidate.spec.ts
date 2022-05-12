import { BigNumber, constants, providers, utils } from "ethers";
import { deployments, ethers } from "hardhat";
import { setUpLiquidation, setUpPriceOraclePrices, tradeNativeForAsset } from "./utils";
import { DeployedAsset } from "./utils/pool";
import { addCollateral, borrowCollateral } from "./utils/collateral";
import {
  CErc20,
  CEther,
  EIP20Interface,
  FuseFeeDistributor,
  FuseSafeLiquidator,
  MasterPriceOracle,
  SimplePriceOracle,
} from "../lib/contracts/typechain";
import { cERC20Conf, ChainLiquidationConfig, Fuse, liquidationConfigDefaults, LiquidationStrategy } from "../src";
import { liquidateAndVerify, resetPriceOracle } from "./utils/setup";
import { getOrCreateFuse } from "./utils/fuseSdk";

describe("#SafeLiquidator", () => {
  let eth: cERC20Conf;
  let erc20One: cERC20Conf;
  let erc20Two: cERC20Conf;

  let deployedEth: DeployedAsset;
  let deployedErc20One: DeployedAsset;
  let deployedErc20Two: DeployedAsset;

  let poolAddress: string;
  let simpleOracle: SimplePriceOracle;
  let oracle: MasterPriceOracle;
  let liquidator: FuseSafeLiquidator;
  let fuseFeeDistributor: FuseFeeDistributor;

  let ethCToken: CEther;
  let erc20OneCToken: CErc20;
  let erc20TwoCToken: CErc20;

  let erc20OneUnderlying: EIP20Interface;
  let erc20TwoUnderlying: EIP20Interface;

  let erc20OneOriginalUnderlyingPrice: BigNumber;
  let erc20TwoOriginalUnderlyingPrice: BigNumber;

  let tx: providers.TransactionResponse;

  let chainId: number;
  let poolName: string;
  let coingeckoId: string;

  let liquidationConfigOverrides: ChainLiquidationConfig;

  beforeEach(async () => {
    poolName = "liquidation - no fl - " + Math.random().toString();

    ({ chainId } = await ethers.provider.getNetwork());

    await deployments.fixture("prod");
    const sdk = await getOrCreateFuse();

    coingeckoId = chainId === 1337 ? "ethereum" : "binancecoin";
    liquidationConfigOverrides = {
      ...liquidationConfigDefaults(sdk)[chainId],
      LIQUIDATION_STRATEGY: LiquidationStrategy.DEFAULT,
      SUPPORTED_INPUT_CURRENCIES: liquidationConfigDefaults(sdk)[chainId].SUPPORTED_OUTPUT_CURRENCIES,
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
      oracle,
      simpleOracle,
      fuseFeeDistributor,
    } = await setUpLiquidation({ poolName }));
  });
  afterEach(async () => {
    await resetPriceOracle(erc20One, erc20Two);
  });

  it("should retrieve & liquidate positions for a native borrow for token collateral", async function () {
    const { alice, bob } = await ethers.getNamedSigners();
    console.log("staring with prices: ", utils.formatEther(erc20OneOriginalUnderlyingPrice));

    // get some liquidity via Uniswap
    if (chainId !== 1337) await tradeNativeForAsset({ account: "bob", token: erc20One.underlying, amount: "300" });

    // either use configured whale acct or bob
    // Supply 0.1 tokenOne from other account
    await addCollateral(poolAddress, bob, erc20One.symbol, "0.1", true);
    console.log(`Added ${erc20One.symbol} collateral`);

    // Supply 1 native from other account
    await addCollateral(poolAddress, alice, eth.symbol, "10", false);

    // Borrow 0.5 native using token collateral
    const borrowAmount = "5";
    await borrowCollateral(poolAddress, bob.address, eth.symbol, borrowAmount);

    // Set price of tokenOne collateral to 1/10th of what it was
    tx = await simpleOracle.setDirectPrice(
      deployedErc20One.underlying,
      BigNumber.from(erc20OneOriginalUnderlyingPrice).mul(6).div(10)
    );
    await tx.wait();

    await liquidateAndVerify(
      poolName,
      poolAddress,
      "bob",
      liquidator,
      liquidationConfigOverrides,
      chainId === 1337 ? erc20OneCToken.balanceOf : erc20OneUnderlying.balanceOf
    );

    // return price to what it was
    tx = await simpleOracle.setDirectPrice(deployedErc20One.underlying, erc20OneOriginalUnderlyingPrice);
    await tx.wait();
  });

  // Safe liquidate token borrows
  it("should retrieve & liquidate positions for a token borrow for native collateral", async function () {
    const { alice, bob, rando } = await ethers.getNamedSigners();
    console.log("staring with prices: ", utils.formatEther(erc20OneOriginalUnderlyingPrice));

    // get some liquidity via Uniswap
    if (chainId !== 1337) await tradeNativeForAsset({ account: "alice", token: erc20One.underlying, amount: "300" });

    // Supply native collateral
    await addCollateral(poolAddress, bob, eth.symbol, "10", true);
    console.log(`Added ${eth.symbol} collateral`);

    // Supply tokenOne from other account
    await addCollateral(poolAddress, alice, erc20One.symbol, "0.1", true);
    console.log(`Added ${erc20One.symbol} collateral`);

    // Borrow tokenOne using native as collateral
    const borrowAmount = "0.05";
    await borrowCollateral(poolAddress, bob.address, erc20One.symbol, borrowAmount);
    console.log(`Borrowed ${erc20One.symbol} collateral`);

    // Set price of borrowed token to 10x of what it was
    tx = await simpleOracle.setDirectPrice(
      deployedErc20One.underlying,
      BigNumber.from(erc20OneOriginalUnderlyingPrice).mul(10).div(6)
    );

    tx = await erc20OneUnderlying.connect(alice).transfer(rando.address, utils.parseEther(borrowAmount));
    tx = await erc20OneUnderlying.connect(rando).approve(liquidator.address, constants.MaxUint256);
    await tx.wait();

    await liquidateAndVerify(
      poolName,
      poolAddress,
      "bob",
      liquidator,
      liquidationConfigOverrides,
      chainId === 1337 ? ethCToken.balanceOf : ethers.provider.getBalance
    );

    // return price to what it was
    tx = await simpleOracle.setDirectPrice(deployedErc20One.underlying, erc20OneOriginalUnderlyingPrice);
    await tx.wait();
  });

  it("should retrieve & liquidate positions for a token borrow for token collateral", async function () {
    const { alice, bob, rando } = await ethers.getNamedSigners();
    console.log("staring with prices: ", utils.formatEther(erc20OneOriginalUnderlyingPrice));

    // get some liquidity via Uniswap
    if (chainId !== 1337) {
      await tradeNativeForAsset({ account: "alice", token: erc20One.underlying, amount: "300" });
      await tradeNativeForAsset({ account: "bob", token: erc20Two.underlying, amount: "100" });
      await tradeNativeForAsset({ account: "rando", token: erc20Two.underlying, amount: "100" });
    }

    // Supply tokenOne collateral
    await addCollateral(poolAddress, alice, erc20One.symbol, "0.1", false);
    console.log(`Added ${erc20One.symbol} collateral`);

    // Supply tokenTwo from other account
    await addCollateral(poolAddress, bob, erc20Two.symbol, "4500", true);
    console.log(`Added ${erc20Two.symbol} collateral`);

    // Borrow tokenTwo using tokenOne collateral
    const borrowAmount = "0.06";
    await borrowCollateral(poolAddress, bob.address, erc20One.symbol, borrowAmount);
    console.log(`Borrowed ${erc20Two.symbol} collateral`);

    // Set price of tokenOne collateral to 1/10th of what it was
    tx = await simpleOracle.setDirectPrice(
      deployedErc20One.underlying,
      BigNumber.from(erc20OneOriginalUnderlyingPrice).mul(10).div(6)
    );

    tx = await erc20OneUnderlying.connect(bob).transfer(rando.address, utils.parseEther(borrowAmount));
    tx = await erc20OneUnderlying.connect(rando).approve(liquidator.address, constants.MaxUint256);
    await tx.wait();

    await liquidateAndVerify(
      poolName,
      poolAddress,
      "bob",
      liquidator,
      liquidationConfigOverrides,
      chainId === 1337 ? erc20TwoCToken.balanceOf : erc20TwoUnderlying.balanceOf
    );

    // return price to what it was
    tx = await simpleOracle.setDirectPrice(deployedErc20One.underlying, erc20OneOriginalUnderlyingPrice);
    await tx.wait();
  });
});
