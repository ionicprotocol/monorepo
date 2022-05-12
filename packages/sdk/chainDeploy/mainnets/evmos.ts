import { ChainDeployFnParams, DiaAsset } from "../helpers/types";
import { ChainDeployConfig } from "../helpers";
import { deployDiaOracle } from "../helpers/dia";

export const deployConfig: ChainDeployConfig = {
  wtoken: "0xd4949664cd82660aae99bedc034a0dea8a0bd517",
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
    symbol: "ETH",
    underlying: "0x7C598c96D02398d89FbCb9d41Eab3DF0C16F227D",
    feed: "0x5d60C36A600391C3dFc5d76ad18959163613E6ed",
    key: "ETH/USD",
  },
  {
    symbol: "USDC",
    underlying: "0x51e44FfaD5C2B122C8b635671FCC8139dc636E82",
    feed: "0x5d60C36A600391C3dFc5d76ad18959163613E6ed",
    key: "USDC/USD",
  },
  {
    symbol: "USDT",
    underlying: "0xC1Be9a4D5D45BeeACAE296a7BD5fADBfc14602C4",
    feed: "0x5d60C36A600391C3dFc5d76ad18959163613E6ed",
    key: "USDT/USD",
  },
  {
    symbol: "FRAX",
    underlying: "0xE03494D0033687543a80c9B1ca7D6237F2EA8BD8",
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
