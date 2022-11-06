import { assetSymbols, MarketConfig, SupportedChains } from "@midas-capital/types";
import { BigNumber, Contract, providers } from "ethers";
import { deployments, ethers } from "hardhat";

import {
  EIP20Interface,
  FuseSafeLiquidator,
  MasterPriceOracle,
  SimplePriceOracle,
} from "../../lib/contracts/typechain";
import { ERC20Abi } from "../../src";
import { setUpLiquidation, setUpPriceOraclePrices, tradeNativeForAsset } from "../utils";
import { getOrCreateMidas } from "../utils/midasSdk";
import { DeployedAsset } from "../utils/pool";
import { liquidateAndVerify, resetPriceOracle, wrapNativeToken } from "../utils/setup";

(process.env.FORK_CHAIN_ID && parseInt(process.env.FORK_CHAIN_ID) == SupportedChains.neon_devnet
  ? describe.only
  : describe.skip)("#safeLiquidateWithFlashLoan", () => {
  let tx: providers.TransactionResponse;

  let erc20One: MarketConfig;
  let erc20Two: MarketConfig;
  let oracle: MasterPriceOracle;
  let simplePriceOracle: SimplePriceOracle;

  let deployedErc20One: DeployedAsset;
  let deployedErc20Two: DeployedAsset;

  let poolAddress: string;
  let liquidator: FuseSafeLiquidator;

  let erc20TwoUnderlying: EIP20Interface;

  let erc20OneOriginalUnderlyingPrice: BigNumber;

  let poolName: string;

  let deployedAssets: DeployedAsset[];
  let assets: MarketConfig[];

  beforeEach(async () => {
    poolName = "liquidation - fl - " + Math.random().toString();
    await deployments.fixture("prod");
    const sdk = await getOrCreateMidas();

    await setUpPriceOraclePrices();
    ({ poolAddress, liquidator, oracle, deployedAssets, simplePriceOracle, assets } = await setUpLiquidation(poolName));

    erc20One = assets.find((d) => d.symbol === assetSymbols.WBTC);
    erc20Two = assets.find((d) => d.symbol === assetSymbols.USDC);

    deployedErc20One = deployedAssets.find((d) => d.symbol === assetSymbols.WBTC);
    deployedErc20Two = deployedAssets.find((d) => d.symbol === assetSymbols.USDC);

    erc20OneOriginalUnderlyingPrice = await oracle.getUnderlyingPrice(deployedErc20One.assetAddress);
    erc20TwoUnderlying = new Contract(erc20One.underlying, ERC20Abi, sdk.provider.getSigner()) as EIP20Interface;
  });

  afterEach(async () => {
    await resetPriceOracle(erc20One, erc20Two);
  });

  it("FL - should liquidate a token borrow for token collateral", async function () {
    const { alice, bob } = await ethers.getNamedSigners();
    const sdk = await getOrCreateMidas();

    // get some liquidity via Uniswap
    await tradeNativeForAsset({ account: "alice", token: erc20One.underlying, amount: "300" });
    await tradeNativeForAsset({ account: "bob", token: erc20Two.underlying, amount: "300" });
    await wrapNativeToken({ account: "bob", amount: "100", weth: undefined });

    // Supply 0.1 tokenOne from other account
    const supply1Amount = "1";

    const btcbSupply = await sdk
      .setSigner(alice)
      .supply(
        deployedErc20One.assetAddress,
        erc20One.underlying,
        poolAddress,
        true,
        ethers.utils.parseEther(supply1Amount)
      );
    console.log(
      `Added ${supply1Amount} ${erc20One.symbol} collateral from ${alice.address}, ERROR: ${btcbSupply.errorCode}`
    );

    const supply2Amount = "8500";
    const busdSupply = await sdk
      .setSigner(bob)
      .supply(
        deployedErc20Two.assetAddress,
        erc20Two.underlying,
        poolAddress,
        true,
        ethers.utils.parseEther(supply2Amount)
      );
    console.log(
      `Added ${supply2Amount} ${erc20Two.symbol} collateral from ${bob.address}, ERROR: ${busdSupply.errorCode}`
    );

    const borrowAmount = "0.2";

    const btcbBorrow = await sdk
      .setSigner(bob)
      .borrow(deployedErc20One.assetAddress, ethers.utils.parseEther(borrowAmount));
    console.log(
      `Borrowed ${borrowAmount} ${erc20One.symbol} collateral from ${bob.address}, ERROR: ${btcbBorrow.errorCode}`
    );

    // Set price of tokenOne collateral to 6/10th of what it was
    tx = await simplePriceOracle.setDirectPrice(erc20One.underlying, erc20OneOriginalUnderlyingPrice.mul(10).div(6));
    await tx.wait();

    await liquidateAndVerify(poolName, poolAddress, "bob", liquidator);

    // Set price of tokenOne collateral back to what it was
    tx = await simplePriceOracle.setDirectPrice(erc20One.underlying, erc20OneOriginalUnderlyingPrice);
    await tx.wait();
  });
});
