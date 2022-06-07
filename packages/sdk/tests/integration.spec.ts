import { BigNumber, providers, utils } from "ethers";
import { ethers } from "hardhat";

import { EIP20Interface, FuseSafeLiquidator, SimplePriceOracle } from "../lib/contracts/typechain";
import { ChainLiquidationConfig, MarketConfig } from "../src";
import { getChainLiquidationConfig } from "../src/modules/liquidation/config";

import { deployAssets, tradeNativeForAsset } from "./utils";
import { BSC_POOLS, getAssetsConf } from "./utils/assets";
import { addCollateral, borrowCollateral } from "./utils/collateral";
import { getOrCreateFuse } from "./utils/fuseSdk";
import { DeployedAsset } from "./utils/pool";
import { liquidateAndVerify, setUpPools } from "./utils/setup";

describe.skip("#safeLiquidateWithFlashLoan", () => {
  let tx: providers.TransactionResponse;
  let alpacaAssets: MarketConfig[];
  let bombAssets: MarketConfig[];
  let alpacaDeployedAssets: DeployedAsset[];
  let bombDeployedAssets: DeployedAsset[];

  let eth: MarketConfig;
  let erc20One: MarketConfig;
  let erc20Two: MarketConfig;

  let deployedErc20One: DeployedAsset;

  let poolAddress: string;
  let simpleOracle: SimplePriceOracle;
  let liquidator: FuseSafeLiquidator;

  let erc20OneUnderlying: EIP20Interface;
  let erc20TwoUnderlying: EIP20Interface;

  let erc20OneOriginalUnderlyingPrice: BigNumber;
  let erc20TwoOriginalUnderlyingPrice: BigNumber;

  let chainId: number;
  let poolName: string;

  let liquidationConfigOverrides: ChainLiquidationConfig;

  beforeEach(async () => {
    console.log("HERE");
    const { deployer } = await ethers.getNamedSigners();
    ({ chainId } = await ethers.provider.getNetwork());
    const sdk = await getOrCreateFuse();
    const poolAddresses = await setUpPools([BSC_POOLS.ALPACA, BSC_POOLS.BOMB]);

    console.log(
      `deployed pools with addresses:\n - ${BSC_POOLS.ALPACA}: ${poolAddresses[0]}\n - ${BSC_POOLS.BOMB}: ${poolAddresses[1]}`
    );
    alpacaAssets = await getAssetsConf(
      poolAddresses[0],
      sdk.contracts.FuseFeeDistributor.address,
      sdk.irms.JumpRateModel.address,
      ethers,
      BSC_POOLS.ALPACA
    );
    bombAssets = await getAssetsConf(
      poolAddresses[1],
      sdk.contracts.FuseFeeDistributor.address,
      sdk.irms.JumpRateModel.address,
      ethers,
      BSC_POOLS.BOMB
    );

    console.log("----alpacaAssets----\n", alpacaAssets);
    console.log("----bombAssets----\n", bombAssets);

    alpacaDeployedAssets = await deployAssets(alpacaAssets, deployer);
    bombDeployedAssets = await deployAssets(bombAssets, deployer);

    console.log(alpacaDeployedAssets);
    console.log(bombDeployedAssets);

    liquidationConfigOverrides = {
      ...getChainLiquidationConfig(sdk)[chainId],
    };
    // ({
    //   poolAddress,
    //   deployedEth,
    //   deployedErc20One,
    //   deployedErc20Two,
    //   eth,
    //   erc20One,
    //   erc20Two,
    //   ethCToken,
    //   erc20OneCToken,
    //   erc20TwoCToken,
    //   liquidator,
    //   erc20OneUnderlying,
    //   erc20TwoUnderlying,
    //   erc20OneOriginalUnderlyingPrice,
    //   erc20TwoOriginalUnderlyingPrice,
    //   simpleOracle,
    //   fuseFeeDistributor,
    // } = await setUpLiquidation(poolName));
  });

  afterEach(async () => {});

  it("FL - BOMB Pool", async function () {
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
