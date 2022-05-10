import { ChainDeployConfig, deployUniswapOracle } from "../helpers";
import { ethers } from "ethers";
import { ChainDeployFnParams, DiaAsset } from "../helpers/types";
import { deployUniswapLpOracle } from "../oracles/uniswapLp";
import { deployDiaOracle } from "../helpers/dia";

export const deployConfig: ChainDeployConfig = {
  wtoken: "0xAcc15dC74880C9944775448304B263D191c6077F",
  nativeTokenName: "Moonbeam",
  nativeTokenSymbol: "GLMR",
  blocksPerYear: 5 * 24 * 365 * 60, // 12 second blocks, 5 blocks per minute
  uniswap: {
    hardcoded: [],
    uniswapData: [],
    pairInitHashCode: ethers.utils.hexlify("0xe31da4209ffcce713230a74b5287fa8ec84797c9e77e1f7cfeccea015cdc97ea"),
    uniswapV2RouterAddress: "0x96b244391D98B62D19aE89b1A4dCcf0fc56970C7",
    uniswapV2FactoryAddress: "0x985BcA32293A7A496300a48081947321177a86FD",
    uniswapOracleInitialDeployTokens: [
      {
        token: "0xcd3B51D98478D53F4515A306bE565c6EebeF1D58", // GLINT
        baseToken: "0xAcc15dC74880C9944775448304B263D191c6077F", // GLMR
      },
    ],
    uniswapOracleLpTokens: [
      "0xb929914B89584b4081C7966AC6287636F7EfD053", // GLMR-USDC
      "0x99588867e817023162F4d4829995299054a5fC57", // GLMR-GLINT
    ],
  },
};

const diaAssets: DiaAsset[] = [
  {
    symbol: "ETH",
    underlying: "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f",
    feed: "0x1f1BAe8D7a2957CeF5ffA0d957cfEDd6828D728f",
    key: "ETH/USD",
  },
  {
    symbol: "USDC",
    underlying: "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b",
    feed: "0x1f1BAe8D7a2957CeF5ffA0d957cfEDd6828D728f",
    key: "USDC/USD",
  },
  {
    symbol: "FTM",
    underlying: "0xC19281F22A075E0F10351cd5D6Ea9f0AC63d4327",
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
    waitConfirmations: 1
  });
  console.log("UniswapLpTokenLiquidator: ", uniswapLpTokenLiquidator.address);
};
