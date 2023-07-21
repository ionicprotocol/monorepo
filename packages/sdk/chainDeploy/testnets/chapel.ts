import { chapel } from "@ionicprotocol/chains";
import { assetSymbols, SupportedAsset } from "@ionicprotocol/types";
import { ethers } from "ethers";

import {
  ChainDeployConfig,
  ChainlinkFeedBaseCurrency,
  deployChainlinkOracle,
  deployUniswapLpOracle,
  deployUniswapOracle
} from "../helpers";
import { ChainlinkAsset } from "../helpers/types";

const assets = chapel.assets;

export const deployConfig: ChainDeployConfig = {
  wtoken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.WBNB)!.underlying,
  nativeTokenUsdChainlinkFeed: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
  nativeTokenName: "Binance Coin Token (Testnet)",
  nativeTokenSymbol: "TBNB",
  stableToken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.BUSD)!.underlying,
  wBTCToken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.BTCB)!.underlying,
  blocksPerYear: chapel.specificParams.blocksPerYear.toNumber(),
  uniswap: {
    hardcoded: [
      {
        name: "Binance Bitcoin",
        symbol: "BTCB",
        address: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.BTCB)!.underlying
      }
    ],
    uniswapData: [],
    // see: https://bsc.kiemtienonline360.com/ for addresses
    pairInitHashCode: ethers.utils.hexlify("0xecba335299a6693cb2ebc4782e74669b84290b6378ea3a3873c7231a8d7d1074"),
    uniswapV2RouterAddress: "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3",
    uniswapV2FactoryAddress: "0xB7926C0430Afb07AA7DEfDE6DA862aE0Bde767bc",
    uniswapOracleLpTokens: [
      assets.find((a) => a.symbol === assetSymbols["BUSD-USDT"])!.underlying, // BUSD-USDT PCS LP
      assets.find((a) => a.symbol === assetSymbols["WBNB-DAI"])!.underlying, // WBNB-DAI PCS LP
      assets.find((a) => a.symbol === assetSymbols["WBNB-BUSD"])!.underlying // WBNB-BUSD PCS LP
    ],
    uniswapOracleInitialDeployTokens: [],
    flashSwapFee: 30
  },
  cgId: chapel.specificParams.cgId
};

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }): Promise<void> => {
  const { deployer } = await getNamedAccounts();
  ////
  //// ORACLES
  const chainlinkAssets: ChainlinkAsset[] = [
    {
      symbol: "BUSD",
      aggregator: "0x9331b55D9830EF609A2aBCfAc0FBCE050A52fdEa",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    {
      symbol: "BTCB",
      aggregator: "0x5741306c21795FdCBb9b265Ea0255F499DFe515C",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    },
    {
      symbol: "ETH",
      aggregator: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7",
      feedBaseCurrency: ChainlinkFeedBaseCurrency.USD
    }
  ];

  //// ChainLinkV2 Oracle
  await deployChainlinkOracle({
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig,
    assets: assets,
    chainlinkAssets,
    run
  });
  ////

  //// Uniswap Oracle
  await deployUniswapOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig
  });

  //// UniswapLp Oracle
  await deployUniswapLpOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    deployConfig
  });

  //// Liquidator Redemption Strategies
  const uniswapLpTokenLiquidator = await deployments.deploy("UniswapLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  if (uniswapLpTokenLiquidator.transactionHash) {
    await ethers.provider.waitForTransaction(uniswapLpTokenLiquidator.transactionHash);
  }
  console.log("UniswapLpTokenLiquidator: ", uniswapLpTokenLiquidator.address);
};
