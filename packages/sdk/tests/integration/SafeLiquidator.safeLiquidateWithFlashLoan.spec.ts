import { MarketConfig } from "@midas-capital/types";
import { BigNumber, Contract, providers } from "ethers";
import { deployments, ethers } from "hardhat";

import {
  EIP20Interface,
  FuseFeeDistributor,
  FuseSafeLiquidator,
  MasterPriceOracle,
  SimplePriceOracle,
} from "../../lib/contracts/typechain";
import { ChainLiquidationConfig, ERC20Abi } from "../../src";
import { getChainLiquidationConfig } from "../../src/modules/liquidation/config";
import { setUpLiquidation, setUpPriceOraclePrices, tradeNativeForAsset } from "../utils";
import { getOrCreateMidas } from "../utils/midasSdk";
import { DeployedAsset } from "../utils/pool";
import { liquidateAndVerify, resetPriceOracle, wrapNativeToken } from "../utils/setup";

(process.env.FORK_CHAIN_ID ? describe.only : describe.skip)("#safeLiquidateWithFlashLoan", () => {
  let tx: providers.TransactionResponse;

  let eth: MarketConfig;
  let erc20One: MarketConfig;
  let erc20Two: MarketConfig;
  let oracle: MasterPriceOracle;
  let simplePriceOracle: SimplePriceOracle;

  let deployedEth: DeployedAsset;
  let deployedErc20One: DeployedAsset;
  let deployedErc20Two: DeployedAsset;

  let poolAddress: string;
  let liquidator: FuseSafeLiquidator;

  let fuseFeeDistributor: FuseFeeDistributor;

  let ethUnderlying: EIP20Interface;
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
    const sdk = await getOrCreateMidas();

    liquidationConfigOverrides = {
      ...getChainLiquidationConfig(sdk)[chainId],
    };
    await setUpPriceOraclePrices();
    ({ poolAddress, liquidator, oracle, fuseFeeDistributor, deployedAssets, simplePriceOracle, assets } =
      await setUpLiquidation(poolName));

    eth = assets.find((d) => d.symbol === "WBNB");
    erc20One = assets.find((d) => d.symbol === "BTCB");
    erc20Two = assets.find((d) => d.symbol === "BUSD");

    deployedEth = deployedAssets.find((d) => d.symbol === "WBNB");
    deployedErc20One = deployedAssets.find((d) => d.symbol === "BTCB");
    deployedErc20Two = deployedAssets.find((d) => d.symbol === "BUSD");

    erc20OneOriginalUnderlyingPrice = await oracle.getUnderlyingPrice(deployedErc20One.assetAddress);
    erc20TwoOriginalUnderlyingPrice = await oracle.getUnderlyingPrice(deployedErc20Two.assetAddress);

    ethUnderlying = new Contract(eth.underlying, ERC20Abi, sdk.provider.getSigner()) as EIP20Interface;
    erc20OneUnderlying = new Contract(erc20One.underlying, ERC20Abi, sdk.provider.getSigner()) as EIP20Interface;
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
    const btcbSuply = await sdk.supply(
      deployedErc20One.assetAddress,
      erc20One.underlying,
      poolAddress,
      true,
      ethers.utils.parseEther(supply1Amount),
      {
        from: alice.address,
      }
    );
    console.log(
      `Added ${supply1Amount} ${erc20One.symbol} collateral from ${alice.address}, ERROR: ${btcbSuply.errorCode}`
    );

    const supply2Amount = "8500";
    const busdSupply = await sdk.supply(
      deployedErc20Two.assetAddress,
      erc20Two.underlying,
      poolAddress,
      true,
      ethers.utils.parseEther(supply2Amount),
      {
        from: bob.address,
      }
    );
    console.log(
      `Added ${supply2Amount} ${erc20Two.symbol} collateral from ${bob.address}, ERROR: ${busdSupply.errorCode}`
    );

    const borrowAmount = "0.2";
    const btcbBorrow = await sdk.borrow(deployedErc20One.assetAddress, ethers.utils.parseEther(borrowAmount), {
      from: bob.address,
    });
    console.log(
      `Borrowed ${borrowAmount} ${erc20One.symbol} collateral from ${bob.address}, ERROR: ${btcbBorrow.errorCode}`
    );

    // Set price of tokenOne collateral to 6/10th of what it was
    tx = await simplePriceOracle.setDirectPrice(erc20One.underlying, erc20OneOriginalUnderlyingPrice.mul(10).div(6));
    await tx.wait();

    await liquidateAndVerify(erc20TwoUnderlying, poolName, poolAddress, "bob", liquidator);

    // Set price of tokenOne collateral back to what it was
    tx = await simplePriceOracle.setDirectPrice(erc20One.underlying, erc20OneOriginalUnderlyingPrice);
    await tx.wait();
  });
});
