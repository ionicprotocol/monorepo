import { neondevnet } from "@midas-capital/chains";
import { assetSymbols, SupportedAsset } from "@midas-capital/types";
import { ethers, utils } from "ethers";

import { ChainDeployConfig } from "../helpers";

const assets = neondevnet.assets;

export const deployConfig: ChainDeployConfig = {
  wtoken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.WNEON).underlying,
  nativeTokenUsdChainlinkFeed: "",
  nativeTokenName: "Neon (Testnet)",
  nativeTokenSymbol: "NEON",
  stableToken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.USDC).underlying,
  wBTCToken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.WBTC).underlying,
  blocksPerYear: neondevnet.specificParams.blocksPerYear.toNumber(),
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0x5e60a73d5771bebe13c2aec4784c2f5bd78d04e8e89e164a5299407beb2d324a"),
    uniswapV2RouterAddress: "0xBD9EbFe0E6e909E56f1Fd3346D0118B7Db49Ca15",
    uniswapV2FactoryAddress: "0xBD9EbFe0E6e909E56f1Fd3346D0118B7Db49Ca15",
    uniswapOracleLpTokens: [],
    uniswapOracleInitialDeployTokens: [],
    flashSwapFee: 30,
  },
  cgId: neondevnet.specificParams.cgId,
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
    } else if (a.symbol === assetSymbols.AAVE) {
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
