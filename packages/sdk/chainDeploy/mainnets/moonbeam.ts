import { ethers, utils } from "ethers";

import { SupportedChains } from "../../src";
import { assetSymbols, chainSpecificParams, chainSupportedAssets } from "../../src/chainConfig";
import { SupportedAsset } from "../../src/types";
import { ChainDeployConfig, deployUniswapOracle } from "../helpers";
import { deployDiaOracle } from "../helpers/dia";
import { ChainDeployFnParams, DiaAsset } from "../helpers/types";
import { deployUniswapLpOracle } from "../oracles/uniswapLp";

const assets = chainSupportedAssets[SupportedChains.moonbeam];

export const deployConfig: ChainDeployConfig = {
  wtoken: "0xAcc15dC74880C9944775448304B263D191c6077F",
  nativeTokenName: "Moonbeam",
  nativeTokenSymbol: "GLMR",
  blocksPerYear: chainSpecificParams[SupportedChains.moonbeam].blocksPerYear.toNumber(), // 12 second blocks, 5 blocks per minute// 12 second blocks, 5 blocks per minute
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0xe31da4209ffcce713230a74b5287fa8ec84797c9e77e1f7cfeccea015cdc97ea"),
    uniswapV2RouterAddress: "0x96b244391D98B62D19aE89b1A4dCcf0fc56970C7",
    uniswapV2FactoryAddress: "0x985BcA32293A7A496300a48081947321177a86FD",
    uniswapOracleInitialDeployTokens: [
      {
        token: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.GLINT)!.underlying,
        baseToken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.WGLMR)!.underlying,
      },
    ],
    uniswapOracleLpTokens: [
      assets.find((a: SupportedAsset) => a.symbol === assetSymbols["GLMR-USDC"])!.underlying, // GLMR-USDC
      assets.find((a: SupportedAsset) => a.symbol === assetSymbols["GLMR-GLINT"])!.underlying, // GLMR-GLINT
    ],
  },
  minBorrow: utils.parseUnits("200"),
};

const diaAssets: DiaAsset[] = [
  {
    symbol: assetSymbols.ETH,
    underlying: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.ETH)!.underlying,
    feed: "0x1f1BAe8D7a2957CeF5ffA0d957cfEDd6828D728f",
    key: "ETH/USD",
  },
  {
    symbol: assetSymbols.USDC,
    underlying: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.USDC)!.underlying,
    feed: "0x1f1BAe8D7a2957CeF5ffA0d957cfEDd6828D728f",
    key: "USDC/USD",
  },
  {
    symbol: assetSymbols.FTM,
    underlying: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.FTM)!.underlying,
    feed: "0x1f1BAe8D7a2957CeF5ffA0d957cfEDd6828D728f",
    key: "FTM/USD",
  },
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }: ChainDeployFnParams): Promise<void> => {
  console.log("no chain specific deployments to run");
  const { deployer } = await getNamedAccounts();

  //// Uniswap Oracle
  await deployUniswapOracle({ run, ethers, getNamedAccounts, deployments, deployConfig });
  ////
  await deployDiaOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    diaAssets,
    deployConfig,
    diaNativeFeed: { feed: "0x8ae08CB9161A38CE241BB54816b2CbA549C136Ae", key: "GLMR/USD" },
  });

  //// Uniswap Lp Oracle
  await deployUniswapLpOracle({ run, ethers, getNamedAccounts, deployments, deployConfig });

  //// Uniswap Lp token liquidator
  const uniswapLpTokenLiquidator = await deployments.deploy("UniswapLpTokenLiquidator", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  });
  console.log("UniswapLpTokenLiquidator: ", uniswapLpTokenLiquidator.address);
};
