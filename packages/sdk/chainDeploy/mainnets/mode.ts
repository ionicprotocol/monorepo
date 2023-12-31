import { mode } from "@ionicprotocol/chains";

import { ChainDeployConfig, deployPythPriceOracle } from "../helpers";

export const deployConfig: ChainDeployConfig = {
  blocksPerYear: mode.specificParams.blocksPerYear.toNumber(),
  cgId: mode.specificParams.cgId,
  nativeTokenName: "Mode",
  nativeTokenSymbol: "ETH",
  stableToken: mode.chainAddresses.STABLE_TOKEN,
  uniswap: {
    flashSwapFee: 30,
    hardcoded: [],
    uniswapData: [],
    uniswapOracleInitialDeployTokens: [],
    uniswapV2FactoryAddress: "", // TODO refactor the liquidations for univ3
    uniswapV2RouterAddress: "" // TODO refactor the liquidations for univ3
  },
  wtoken: mode.chainAddresses.W_TOKEN
};

// TODO add assets https://pyth.network/developers/price-feed-ids
// const pythAssets: PythAsset[] = [
// ];

export const deploy = async ({ run, ethers, getNamedAccounts, deployments }): Promise<void> => {
  const { deployer } = await getNamedAccounts();

  // TODO deploy pyth oracle
  /*
    await deployPythPriceOracle({
      run,
      ethers,
      getNamedAccounts,
      deployments,
      deployConfig,
      //   pythAssets,
      //   pythAddress: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
      //   nativeTokenUsdFeed: "0x",
      //   usdToken: ""
    });
  */
};
