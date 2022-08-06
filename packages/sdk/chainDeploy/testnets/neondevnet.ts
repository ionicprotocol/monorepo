/* eslint-disable no-console, @typescript-eslint/no-non-null-assertion */
import { SupportedAsset, SupportedChains } from "@midas-capital/types";
import { ethers, utils } from "ethers";

import { assetSymbols, chainSpecificParams, chainSupportedAssets } from "../../src/chainConfig";
import { ChainDeployConfig } from "../helpers";

const assets = chainSupportedAssets[SupportedChains.neon_devnet];

export const deployConfig: ChainDeployConfig = {
  wtoken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.WNEON).underlying,
  nativeTokenUsdChainlinkFeed: "",
  nativeTokenName: "Neon (Testnet)",
  nativeTokenSymbol: "NEON",
  stableToken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.USDC).underlying,
  wBTCToken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.WBTC).underlying,
  blocksPerYear: chainSpecificParams[SupportedChains.neon_devnet].blocksPerYear.toNumber(),
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0xecba335299a6693cb2ebc4782e74669b84290b6378ea3a3873c7231a8d7d1074"),
    uniswapV2RouterAddress: "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",
    uniswapV2FactoryAddress: "0xB7926C0430Afb07AA7DEfDE6DA862aE0Bde767bc",
    uniswapOracleLpTokens: [],
    uniswapOracleInitialDeployTokens: [],
  },
  // TODO: need to check
  cgId: chainSpecificParams[SupportedChains.neon_devnet].cgId,
};

export const deploy = async ({ ethers, getNamedAccounts, deployments }): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  //// ORACLES
  const simplePO = await deployments.deploy("SimplePriceOracle", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log("SimplePriceOracle: ", simplePO.address);

  const _assets = assets.filter((a) => a.symbol !== assetSymbols.WNEON);

  const masterPriceOracle = await ethers.getContract("MasterPriceOracle", deployer);
  const simplePriceOracle = await ethers.getContract("SimplePriceOracle", deployer);
  let tx;
  for (const a of _assets) {
    let price;
    if (a.symbol === assetSymbols.WBTC) {
      price = utils.parseEther("1").mul(40_000).mul(5);
    } else if (a.symbol === assetSymbols.WETH) {
      price = utils.parseEther("1").mul(2_000).mul(5);
    } else if (a.symbol === assetSymbols.DAI) {
      price = utils.parseEther("1").mul(5);
    } else if (a.symbol === assetSymbols.BAL) {
      price = utils.parseEther("1").mul(10).mul(5);
    } else if (a.symbol === assetSymbols.USDC) {
      price = utils.parseEther("1").mul(5);
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
