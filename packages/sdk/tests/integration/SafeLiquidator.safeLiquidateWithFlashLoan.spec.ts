import { BigNumber, Contract, providers, utils } from "ethers";
import { deployments, ethers } from "hardhat";

import {
  EIP20Interface,
  FuseFeeDistributor,
  FuseSafeLiquidator,
  MasterPriceOracle,
  SimplePriceOracle,
} from "../../lib/contracts/typechain";
import { ChainLiquidationConfig, ERC20Abi, MarketConfig } from "../../src";
import { getChainLiquidationConfig } from "../../src/modules/liquidation/config";
import { setUpLiquidation, setUpPriceOraclePrices, tradeNativeForAsset } from "../utils";
import { addCollateral, borrowCollateral } from "../utils/collateral";
import { getOrCreateFuse } from "../utils/fuseSdk";
import { DeployedAsset } from "../utils/pool";
import { liquidateAndVerify, resetPriceOracle, wrapNativeToken } from "../utils/setup";

(process.env.FORK_CHAIN_ID ? describe.only : describe.skip)("#safeLiquidateWithFlashLoan", () => {
  let tx: providers.TransactionResponse;

  let eth: MarketConfig;
  let erc20One: MarketConfig;
  let erc20Two: MarketConfig;
  let oracle: MasterPriceOracle;
  let simplePriceOracle: SimplePriceOracle;
  let deployedErc20One: DeployedAsset;
  let deployedErc20Two: DeployedAsset;

  let poolAddress: string;
  let liquidator: FuseSafeLiquidator;

  let fuseFeeDistributor: FuseFeeDistributor;

  let erc20OneUnderlying: EIP20Interface;
  let erc20TwoUnderlying: EIP20Interface;

  let erc20OneOriginalUnderlyingPrice: BigNumber;
  let erc20TwoOriginalUnderlyingPrice: BigNumber;

  let chainId: number;
  let poolName: string;

  let deployedAssets: DeployedAsset[];
  let assets: MarketConfig[];

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
    ({ poolAddress, liquidator, oracle, fuseFeeDistributor, deployedAssets, simplePriceOracle, assets } =
      await setUpLiquidation(poolName));

    eth = assets.find((d) => d.symbol === "WBNB");
    erc20One = assets.find((d) => d.symbol === "BTCB");
    erc20Two = assets.find((d) => d.symbol === "ETH");

    deployedErc20One = deployedAssets.find((d) => d.symbol === "BTCB");
    deployedErc20Two = deployedAssets.find((d) => d.symbol === "ETH");

    erc20OneOriginalUnderlyingPrice = await oracle.getUnderlyingPrice(deployedErc20One.assetAddress);
    erc20TwoOriginalUnderlyingPrice = await oracle.getUnderlyingPrice(deployedErc20Two.assetAddress);

    erc20OneUnderlying = new Contract(erc20One.underlying, ERC20Abi, sdk.provider.getSigner()) as EIP20Interface;
    erc20TwoUnderlying = new Contract(erc20One.underlying, ERC20Abi, sdk.provider.getSigner()) as EIP20Interface;
  });

  afterEach(async () => {
    await resetPriceOracle(erc20One, erc20Two);
  });

  it("FL - should liquidate a native borrow for token collateral", async function () {
    const { alice, bob } = await ethers.getNamedSigners();

    // get some liquidity via Uniswap
    await tradeNativeForAsset({ account: "alice", token: erc20One.underlying, amount: "300" });
    await wrapNativeToken({ account: "bob", amount: "100", weth: undefined });

    // Supply 1 tokenOne from other account

    console.log("Adding collateral");
    await addCollateral(poolAddress, alice, erc20One.symbol, "0.1", true);
    console.log(`Added ${erc20One.symbol} collateral`);

    // Supply 10 native from other account
    await addCollateral(poolAddress, bob, eth.symbol, "10", false);

    // Borrow 5 native using token collateral
    const borrowAmount = "4.8";
    await borrowCollateral(poolAddress, alice.address, eth.symbol, borrowAmount);

    // Set price of tokenOne collateral to 6/10th of what it was
    tx = await simplePriceOracle.setDirectPrice(erc20One.underlying, erc20OneOriginalUnderlyingPrice.mul(6).div(10));
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
    tx = await simplePriceOracle.setDirectPrice(erc20One.underlying, erc20OneOriginalUnderlyingPrice);
    await tx.wait();
  });

  // Safe liquidate token borrows
  // it("FL - should liquidate a token borrow for native collateral", async function () {
  //   const { alice, bob } = await ethers.getNamedSigners();

  //   console.log("staring with prices: ", utils.formatEther(erc20OneOriginalUnderlyingPrice));
  //   await tradeNativeForAsset({ account: "alice", token: erc20One.underlying, amount: "150" });
  //   // Supply native collateral
  //   await addCollateral(poolAddress, bob, eth.symbol, "10", true);

  //   // Supply tokenOne from other account
  //   await addCollateral(poolAddress, alice, erc20One.symbol, "0.1", true);

  //   // Borrow tokenOne using native as collateral
  //   const borrowAmount = "0.05";
  //   await borrowCollateral(poolAddress, bob.address, erc20One.symbol, borrowAmount);

  //   // Set price of borrowed token to 10/6th of what it was
  //   tx = await simpleOracle.setDirectPrice(erc20One.underlying, erc20OneOriginalUnderlyingPrice.mul(10).div(6));
  //   // tx = await simpleOracle.setDirectPrice(deployedErc20One.underlying, BigNumber.from(originalPrice).mul(10).div(6));
  //   await tx.wait();

  //   await liquidateAndVerify(
  //     poolName,
  //     poolAddress,
  //     "bob",
  //     liquidator,
  //     liquidationConfigOverrides,
  //     ethers.provider.getBalance
  //   );

  //   // Set price of tokenOne collateral back to what it was
  //   tx = await simpleOracle.setDirectPrice(erc20One.underlying, erc20OneOriginalUnderlyingPrice);
  //   await tx.wait();
  // });

  // it("FL - should liquidate a token borrow for token collateral", async function () {
  //   const { alice, bob } = await ethers.getNamedSigners();
  //   console.log(
  //     "staring with prices: ",
  //     utils.formatEther(erc20OneOriginalUnderlyingPrice),
  //     utils.formatEther(erc20TwoOriginalUnderlyingPrice)
  //   );

  //   await tradeNativeForAsset({ account: "alice", token: erc20One.underlying, amount: "50" });
  //   await tradeNativeForAsset({ account: "bob", token: erc20Two.underlying, amount: "50" });

  //   // Supply 0.1 tokenOne from other account
  //   await addCollateral(poolAddress, alice, erc20One.symbol, "0.1", true);
  //   console.log(`Added ${erc20One.symbol} collateral`);

  //   // Supply 1 tokenTwo from other account
  //   await addCollateral(poolAddress, bob, erc20Two.symbol, "5000", true);
  //   console.log(`Added ${erc20Two.symbol} collateral`);

  //   // Borrow tokenOne using tokenTwo as collateral
  //   const borrowAmount = "0.055";
  //   await borrowCollateral(poolAddress, bob.address, erc20One.symbol, borrowAmount);

  //   // Set price of borrowed token to 10x of what it was
  //   tx = await simpleOracle.setDirectPrice(
  //     deployedErc20One.underlying,
  //     BigNumber.from(erc20OneOriginalUnderlyingPrice).mul(2)
  //   );
  //   await tx.wait();

  //   await liquidateAndVerify(
  //     poolName,
  //     poolAddress,
  //     "bob",
  //     liquidator,
  //     liquidationConfigOverrides,
  //     erc20TwoUnderlying.balanceOf
  //   );

  //   tx = await simpleOracle.setDirectPrice(deployedErc20One.underlying, erc20OneOriginalUnderlyingPrice);
  // });
});
