import { JsonRpcProvider } from "@ethersproject/providers";
import { moonbeam } from "@midas-capital/chains";
import { assetFilter, assetSymbols, SupportedChains, underlying } from "@midas-capital/types";
import { Wallet } from "ethers";

import { setUpSdk } from "../src";
import { baseConfig } from "../src/config/variables";
import { runVerifier } from "../src/run";
import { LiquidityPoolKind, Services } from "../src/types";

(async function () {
  const chainId: number = process.env.TARGET_CHAIN_ID ? parseInt(process.env.TARGET_CHAIN_ID) : SupportedChains.ganache;
  const provider = new JsonRpcProvider(process.env.WEB3_HTTP_PROVIDER_URL);
  const signer = new Wallet(baseConfig.adminPrivateKey, provider);
  const midasSdk = setUpSdk(chainId, signer);

  const assets = {
    [LiquidityPoolKind.UniswapV2]: [
      // {
      //   token0: underlying(bsc.assets, assetSymbols.stkBNB),
      //   token1: underlying(bsc.assets, assetSymbols.WBNB),
      //   identifier: "PCS stkBNB-WBNB",
      //   affectedAssets: [assetFilter(bsc.assets, assetSymbols.stkBNB)],
      // },
    ],
    [LiquidityPoolKind.UniswapV3]: [],
    [LiquidityPoolKind.Curve]: [
      {
        identifier: "Curve xcDOT-stDOT",
        poolAddress: underlying(moonbeam.assets, assetSymbols["xcDOT-stDOT"]),
        affectedAssets: [
          assetFilter(moonbeam.assets, assetSymbols.xcDOT),
          assetFilter(moonbeam.assets, assetSymbols.wstDOT),
        ],
        minLiquidity: 10e6,
      },
    ],
    [LiquidityPoolKind.Balancer]: [],
  };
  runVerifier(midasSdk, Services.LiquidityDepthVerifier, assets);
})();
