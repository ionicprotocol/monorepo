import { basegoerli } from "@midas-capital/chains";
import { assetSymbols, underlying } from "@midas-capital/types";
import { ethers } from "ethers";

import { ChainDeployConfig } from "../helpers";

const assets = basegoerli.assets;
const BN = ethers.utils.parseEther("1");
const BASE_GOERLI_ETH_FIXED_PRICE_USD_BN = BN.mul(10); // 10 USD for 1 ETH

export const deployConfig: ChainDeployConfig = {
  wtoken: underlying(assets, assetSymbols.WETH),
  nativeTokenUsdChainlinkFeed: "",
  nativeTokenName: "Base (Goerli)",
  nativeTokenSymbol: "ETH",
  stableToken: underlying(assets, assetSymbols.USDC),
  blocksPerYear: basegoerli.specificParams.blocksPerYear.toNumber(),
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0x1f475d88284b09799561ca05d87dc757c1ff4a9f48983cdb84d1dd6e209d3ae2"),
    uniswapV2RouterAddress: "0xbdFa4a05372a10172EeEB75075c85FCbff521625",
    uniswapV2FactoryAddress: "",
    uniswapV3FactoryAddress: "0x865412B6cDf424bE36088fE3DeC2A072a26Cc494",
    uniswapOracleLpTokens: [],
    uniswapOracleInitialDeployTokens: [],
    flashSwapFee: 30,
  },
  cgId: basegoerli.specificParams.cgId,
};

export const deploy = async ({ ethers, getNamedAccounts, deployments }): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  const _assets = assets.filter((a) => a.symbol !== assetSymbols.WETH);

  const masterPriceOracle = await ethers.getContract("MasterPriceOracle", deployer);
  const simplePriceOracle = await ethers.getContract("SimplePriceOracle", deployer);
  let tx;

  for (const a of _assets) {
    let price;
    if (a.symbol === assetSymbols.USDC) {
      price = BN.mul(BN).div(BASE_GOERLI_ETH_FIXED_PRICE_USD_BN);
    } else if (a.symbol === assetSymbols.WBTC) {
      // WBTC price: 70 USD
      price = BN.mul(70).mul(BN).div(BASE_GOERLI_ETH_FIXED_PRICE_USD_BN);
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
