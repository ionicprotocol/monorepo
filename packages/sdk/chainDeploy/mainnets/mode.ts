import { mode } from "@ionicprotocol/chains";
import {ChainDeployConfig, deployPythPriceOracle} from "../helpers";

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
    uniswapV2FactoryAddress: "", // TODO
    uniswapV2RouterAddress: "" // TODO
  },
  wtoken: mode.chainAddresses.W_TOKEN
};

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
      //   pythAddress: "",
      //   nativeTokenUsdFeed: "0x",
      //   usdToken: ""
    });
  */
};
