import { neondevnet } from "@midas-capital/chains";
import { assetSymbols, underlying } from "@midas-capital/types";
import { ethers } from "ethers";

import { ChainDeployConfig } from "../helpers";

const assets = neondevnet.assets;
const BN = ethers.utils.parseEther("1");
const NEON_FIXED_PRICE_USD_BN = BN.mul(86).div(100);

export const deployConfig: ChainDeployConfig = {
  wtoken: underlying(assets, assetSymbols.WNEON),
  nativeTokenUsdChainlinkFeed: "",
  nativeTokenName: "Neon (Testnet)",
  nativeTokenSymbol: "NEON",
  stableToken: underlying(assets, assetSymbols.USDC),
  blocksPerYear: neondevnet.specificParams.blocksPerYear.toNumber(),
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0x1f475d88284b09799561ca05d87dc757c1ff4a9f48983cdb84d1dd6e209d3ae2"),
    uniswapV2RouterAddress: "0x491FFC6eE42FEfB4Edab9BA7D5F3e639959E081B",
    uniswapV2FactoryAddress: "0x6dcDD1620Ce77B595E6490701416f6Dbf20D2f67",
    uniswapOracleLpTokens: [],
    uniswapOracleInitialDeployTokens: [],
    flashSwapFee: 30,
  },
  cgId: neondevnet.specificParams.cgId,
};

export const deploy = async ({ ethers, getNamedAccounts, deployments }): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const pyth = await deployments.deploy("Pyth", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log("Pyth: ", pyth.address);

  const _assets = assets.filter((a) => a.symbol !== assetSymbols.WNEON);

  const masterPriceOracle = await ethers.getContract("MasterPriceOracle", deployer);
  const simplePriceOracle = await ethers.getContract("SimplePriceOracle", deployer);
  let tx;

  for (const a of _assets) {
    let price;

    // if (a.symbol === assetSymbols.WBTC) {
    //   price = BN.mul(20_000).mul(BN).div(NEON_FIXED_PRICE_USD_BN);
    // } else if (a.symbol === assetSymbols.WETH) {
    //   price = BN.mul(2_000).mul(BN).div(NEON_FIXED_PRICE_USD_BN);
    // } else if (a.symbol === assetSymbols.AAVE) {
    //   price = BN.mul(3).mul(BN).div(NEON_FIXED_PRICE_USD_BN);
    // } else if (a.symbol === assetSymbols.USDC) {
    //   price = BN.mul(1).mul(BN).div(NEON_FIXED_PRICE_USD_BN)
    // }

    if (a.symbol === assetSymbols.USDC) {
      price = BN.mul(1).mul(BN).div(NEON_FIXED_PRICE_USD_BN);
    } else if (a.symbol === assetSymbols.MORA) {
      // MORA's price: 14,6
      price = BN.mul(1460).div(100).mul(BN).div(NEON_FIXED_PRICE_USD_BN);
    }

    tx = await simplePriceOracle.setDirectPrice(a.underlying, price);
    console.log(`setDirectPrice ${a.symbol}`, tx.hash);
    await tx.wait();
    console.log(`setDirectPrice ${a.symbol} mined`, tx.hash);
  }

  // get the ERC20 address of deployed cERC20
  const underlyings = _assets.map((a) => a.underlying);
  const oracles = Array(underlyings.length).fill(simplePriceOracle.address);
  tx = await masterPriceOracle.add(underlyings, oracles);
  await tx.wait();
  console.log(`Master Price Oracle updated for tokens ${underlyings.join(", ")}`);
};
