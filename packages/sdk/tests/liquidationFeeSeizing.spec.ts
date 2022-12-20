import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { MarketConfig } from "@midas-capital/types";
import { expect } from "chai";
import { BigNumber, constants, providers, utils } from "ethers";
import { deployments, ethers } from "hardhat";

import { MidasSdk } from "../src";
import {
  CErc20,
  CEther,
  EIP20Interface,
  FuseFeeDistributor,
  FuseSafeLiquidator,
  MasterPriceOracle,
  SimplePriceOracle,
} from "../typechain";

import { getPositionRatio, setUpLiquidation, setUpPriceOraclePrices, tradeNativeForAsset } from "./utils";
import { setupAndLiquidatePool, setupLiquidatablePool } from "./utils/collateral";
import { FUSE_LIQUIDATION_PROTOCOL_FEE_PER_THOUSAND, FUSE_LIQUIDATION_SEIZE_FEE_PER_THOUSAND } from "./utils/config";
import { getOrCreateMidas } from "./utils/midasSdk";
import { DeployedAsset } from "./utils/pool";
import { resetPriceOracle } from "./utils/setup";

(process.env.FORK_CHAIN_ID ? describe.skip : describe.skip)("Protocol Liquidation Seizing", () => {
  let eth: MarketConfig;
  let erc20One: MarketConfig;
  let erc20Two: MarketConfig;

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
  let sdk: MidasSdk;

  beforeEach(async () => {
    poolName = "liquidation - fee sizing" + Math.random().toString();
    ({ chainId } = await ethers.provider.getNetwork());
    await deployments.fixture("prod");
    sdk = await getOrCreateMidas();
    await setUpPriceOraclePrices();
    ({ poolAddress, liquidator, oracle, fuseFeeDistributor } = await setUpLiquidation(poolName));
  });
  afterEach(async () => {
    await resetPriceOracle(erc20One, erc20Two);
  });

  it("should calculate the right amounts of protocol, fee, total supply after liquidation", async function () {
    this.timeout(120_000);
    const { bob, rando } = await ethers.getNamedSigners();

    const borrowAmount = "5";
    const repayAmount = utils.parseEther(borrowAmount).div(2);

    // get some liquidity via Uniswap, if using mainnet forking
    if (chainId !== 1337) await tradeNativeForAsset({ account: "bob", token: erc20One.underlying, amount: "300" });

    await setupLiquidatablePool(oracle, deployedErc20One, poolAddress, simpleOracle, borrowAmount, bob);
    console.log("pool set up");

    const liquidatorBalanceBefore = await erc20OneCToken.balanceOf(rando.address);
    const borrowerBalanceBefore = await erc20OneCToken.balanceOf(bob.address);
    const totalReservesBefore = await erc20OneCToken.totalReserves();
    const totalSupplyBefore = await erc20OneCToken.totalSupply();
    const feesBefore = await erc20OneCToken.totalFuseFees();

    tx = await erc20OneUnderlying.connect(rando).approve(liquidator.address, constants.MaxUint256);

    const ratioBefore = await getPositionRatio({
      name: poolName,
      userAddress: undefined,
      namedUser: "bob",
    });
    console.log(`Ratio Before: ${ratioBefore}`);

    tx = await liquidator["safeLiquidate(address,address,address,uint256,address,address,address[],bytes[])"](
      bob.address,
      deployedEth.assetAddress,
      deployedErc20One.assetAddress,
      0,
      deployedErc20One.assetAddress,
      constants.AddressZero,
      [],
      [],
      { value: repayAmount, gasLimit: 10000000, gasPrice: utils.parseUnits("10", "gwei") }
    );
    await tx.wait();

    const ratioAfter = await getPositionRatio({
      name: poolName,
      userAddress: undefined,
      namedUser: "bob",
    });
    console.log(`Ratio After: ${ratioAfter}`);

    const exchangeRate = await erc20OneCToken.exchangeRateStored();
    const borrowerBalanceAfter = await erc20OneCToken.balanceOf(bob.address);
    const liquidatorBalanceAfter = await erc20OneCToken.balanceOf(rando.address);
    const totalReservesAfter = await erc20OneCToken.totalReserves();
    const totalSupplyAfter = await erc20OneCToken.totalSupply();
    const feesAfter = await erc20OneCToken.totalFuseFees();

    expect(liquidatorBalanceAfter).to.be.gt(liquidatorBalanceBefore);
    expect(totalReservesAfter).to.be.gt(totalReservesBefore);
    expect(feesAfter).to.be.gt(feesBefore);
    expect(borrowerBalanceBefore).to.be.gt(borrowerBalanceAfter);

    // seized tokens = borrower balance before - borrower balance after
    const seizedTokens = borrowerBalanceBefore.sub(borrowerBalanceAfter);
    const seizedAmount = parseFloat(utils.formatEther(seizedTokens.mul(exchangeRate).div(BigNumber.from(10).pow(18))));

    // protocol seized = seized tokens * 2.8%
    const protocolSeizeTokens = seizedTokens.mul(FUSE_LIQUIDATION_PROTOCOL_FEE_PER_THOUSAND).div(1000);
    const protocolSeizeAmount = parseFloat(
      utils.formatEther(protocolSeizeTokens.mul(exchangeRate).div(BigNumber.from(10).pow(18)))
    );

    // fees seized = seized tokens * 10%
    const feeSeizeTokens = seizedTokens.mul(FUSE_LIQUIDATION_SEIZE_FEE_PER_THOUSAND).div(1000);
    const feeSeizeAmount = parseFloat(
      utils.formatEther(feeSeizeTokens.mul(exchangeRate).div(BigNumber.from(10).pow(18)))
    );

    // liquidator seized tokens = seized tokens - protocol seize tokens - fee seize tokens
    const liquidatorExpectedSeizeTokens = seizedTokens.sub(protocolSeizeTokens).sub(feeSeizeTokens);
    expect(liquidatorExpectedSeizeTokens).to.eq(liquidatorBalanceAfter.sub(liquidatorBalanceBefore));

    // same but with amounts using the exchange rate
    const liquidatorExpectedSeizeAmount = seizedAmount - protocolSeizeAmount - feeSeizeAmount;
    const liquidatorBalanceAfterAmount = parseFloat(
      utils.formatEther(liquidatorBalanceAfter.mul(exchangeRate).div(BigNumber.from(10).pow(18)))
    );
    // approximate
    expect(liquidatorExpectedSeizeAmount - liquidatorBalanceAfterAmount).to.be.lt(10e-9);

    // total supply before = total supply after - (protocol seize + fees seized)
    // rearranging: total supply before - total supply after + protocol seize + fees seized =~ 0
    const reminder = totalSupplyAfter.sub(totalSupplyBefore).add(protocolSeizeTokens).add(feeSeizeTokens);
    expect(reminder).to.be.eq(0);

    // generic
    expect(feesAfter).to.be.gt(feesBefore);
    // Protocol seized amount gets added to reserves
    const reservesDiffAmount = totalSupplyBefore.sub(totalReservesAfter);
    // gt because reserves get added on interest rate accrual
    expect(reservesDiffAmount).to.be.gt(protocolSeizeTokens);
    // return price to what it was
    await tx.wait();

    tx = await simpleOracle.setDirectPrice(deployedErc20One.underlying, erc20OneOriginalUnderlyingPrice);
    await tx.wait();
  });

  it("should be able to withdraw fees to fuseFeeDistributor", async function () {
    this.timeout(120_000);
    const { bob, rando } = await ethers.getNamedSigners();

    const borrowAmount = "5";

    tx = await erc20OneUnderlying.connect(rando).approve(liquidator.address, constants.MaxUint256);
    await tx.wait();

    // get some liquidity via Uniswap
    await tradeNativeForAsset({ account: "bob", token: erc20One.underlying, amount: "300" });

    await setupAndLiquidatePool(
      oracle,
      deployedErc20One,
      deployedEth,
      poolAddress,
      simpleOracle,
      borrowAmount,
      liquidator,
      bob
    );

    const feesAfterLiquidation = await erc20OneCToken.totalFuseFees();
    expect(feesAfterLiquidation).to.be.gt(BigNumber.from(0));
    console.log(feesAfterLiquidation.toString(), "FEES AFTER");

    tx = await erc20OneCToken._withdrawFuseFees(feesAfterLiquidation);
    const receipt: TransactionReceipt = await tx.wait();
    expect(receipt.status).to.eq(1);

    const feesAfterWithdrawal = await erc20OneCToken.totalFuseFees();
    expect(feesAfterLiquidation).to.be.gt(feesAfterWithdrawal);
    expect(feesAfterWithdrawal).to.eq(BigNumber.from(0));

    const fuseFeeDistributorBalance = await erc20OneUnderlying.balanceOf(fuseFeeDistributor.address);
    expect(fuseFeeDistributorBalance).to.eq(feesAfterLiquidation);

    tx = await simpleOracle.setDirectPrice(deployedErc20One.underlying, erc20OneOriginalUnderlyingPrice);
    await tx.wait();
  });
});
