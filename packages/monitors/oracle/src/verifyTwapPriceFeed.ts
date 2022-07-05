import { Provider } from "@ethersproject/providers";
import { Fuse, OracleConfig, OracleTypes } from "@midas-capital/sdk";
import { BigNumber, Contract } from "ethers";

import { logger } from "./index";

export default async function verifyTwapPriceFeed(fuse: Fuse, oracle: OracleTypes, underlying: string) {
  logger.debug(`Verifying Uniswap Twap oracle for ${underlying}`);
  const twapOracle = new Contract(
    fuse.oracles[OracleTypes.UniswapTwapPriceOracleV2].address,
    fuse.oracles[OracleTypes.UniswapTwapPriceOracleV2].abi,
    fuse.provider
  );
  const baseToken = await twapOracle.callStatic.baseToken();
  const uniswapV2Factory = new Contract(
    fuse.chainSpecificAddresses.UNISWAP_V2_FACTORY,
    ["function getPair(address tokenA, address tokenB) external view returns (address pair)"],
    fuse.provider
  )
  const pair = await uniswapV2Factory.callStatic.getPair(underlying, baseToken);
  const uniswapV2Pair = new Contract(
    pair,
    ["function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"],
    fuse.provider
  )
  const [r0, r1, lastBlockTimestamp] = await uniswapV2Pair.callStatic.getReserves()
  

  const rootOracleAddress = await twapOracle.callStatic.rootOracle();
  const rootTwapOracle = new Contract(
    rootOracleAddress,
    fuse.artifacts.UniswapTwapPriceOracleV2Root.abi,
    fuse.provider
  );
  const observationCount = rootTwapOracle.callStatic.observationCount[]
  if (mpoPrice !== oraclePrice) {
    return { price: oraclePrice, valid: false };
  }
  return { price: oraclePrice, valid: true };
}
