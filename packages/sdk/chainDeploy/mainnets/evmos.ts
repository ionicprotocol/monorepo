import { SupportedChains } from "../../src";
import { assetSymbols, chainSupportedAssets } from "../../src/chainConfig";
import { SupportedAsset } from "../../src/types";
import { ChainDeployConfig } from "../helpers";
import { deployDiaOracle } from "../helpers/dia";
import { ChainDeployFnParams, DiaAsset } from "../helpers/types";

const assets = chainSupportedAssets[SupportedChains.evmos];

export const deployConfig: ChainDeployConfig = {
  wtoken: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.WEVMOS)!.underlying,
  nativeTokenName: "EMVOS",
  nativeTokenSymbol: "PHO",
  blocksPerYear: 8.6 * 24 * 365 * 60,
  stableToken: "",
  wBTCToken: "",
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: "0x",
    uniswapV2RouterAddress: "",
    uniswapV2FactoryAddress: "",
    uniswapOracleInitialDeployTokens: [],
  },
};

const diaAssets: DiaAsset[] = [
  {
    symbol: assetSymbols.ETH,
    underlying: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.ETH)!.underlying,
    feed: "0x5d60C36A600391C3dFc5d76ad18959163613E6ed",
    key: "ETH/USD",
  },
  {
    symbol: "USDC",
    underlying: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.USDC)!.underlying,
    feed: "0x5d60C36A600391C3dFc5d76ad18959163613E6ed",
    key: "USDC/USD",
  },
  {
    symbol: "USDT",
    underlying: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.USDT)!.underlying,
    feed: "0x5d60C36A600391C3dFc5d76ad18959163613E6ed",
    key: "USDT/USD",
  },
  {
    symbol: "FRAX",
    underlying: assets.find((a: SupportedAsset) => a.symbol === assetSymbols.FRAX)!.underlying,
    feed: "0x5d60C36A600391C3dFc5d76ad18959163613E6ed",
    key: "FRAX/USD",
  },
];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }: ChainDeployFnParams): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  await deployDiaOracle({
    run,
    ethers,
    getNamedAccounts,
    deployments,
    diaAssets,
    deployConfig,
    diaNativeFeed: { feed: "0x8ae08CB9161A38CE241BB54816b2CbA549C136Ae", key: "PHO/USD" },
  });
};
