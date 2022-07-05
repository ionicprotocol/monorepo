import { Fuse, OracleTypes } from "@midas-capital/sdk";
import axios from "axios";
import { BigNumber, Contract, utils } from "ethers";

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
  );
  const pair = await uniswapV2Factory.callStatic.getPair(underlying, baseToken);
  const uniswapV2Pair = new Contract(
    pair,
    ["function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"],
    fuse.provider
  );
  const [r0, r1, lastBlockTimestamp] = await uniswapV2Pair.callStatic.getReserves();

  const reserves = {
    r0: {
      reserves: r0,
      underlying: underlying,
    },
    r1: {
      reserves: r1,
      underlying: baseToken,
    },
  };
  console.log(lastBlockTimestamp, oracle, "lastBlockTimestamp, oracle");
  const rootOracleAddress = await twapOracle.callStatic.rootOracle();
  const rootTwapOracle = new Contract(
    rootOracleAddress,
    fuse.artifacts.UniswapTwapPriceOracleV2Root.abi,
    fuse.provider
  );
  const observationCount = await rootTwapOracle.callStatic.observationCount(pair);
  const lastObservation = await rootTwapOracle.callStatic.observations(pair, observationCount % 4);
  console.log(lastObservation, "lastObservation");
  await verifyTwapDepth(fuse, reserves);
}

type Reserves = {
  r0: {
    underlying: string;
    reserves: BigNumber;
  };
  r1: {
    underlying: string;
    reserves: BigNumber;
  };
};

async function verifyTwapDepth(fuse: Fuse, reserves: Reserves) {
  const mpo = await fuse.createMasterPriceOracle();
  const r0Price = await mpo.callStatic.getUnderlyingPrice(reserves.r0.underlying);
  const r1Price = await mpo.callStatic.getUnderlyingPrice(reserves.r1.underlying);
  const nativeTokenPrice = await getCgPrice(fuse.chainSpecificParams.cgId);

  const totalReserves = r0Price.mul(reserves.r0.reserves).add(r1Price.mul(reserves.r1.reserves));
  const totalReservesUsd = parseFloat(utils.formatEther(totalReserves)) * nativeTokenPrice;
  return totalReservesUsd > parseFloat(process.env.MINIMAL_TWAP_DEPTH! || "1000000");
}

const getCgPrice = async (coingeckoId: string) => {
  let usdPrice: number;

  usdPrice = (await axios.get(`https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoId}`))
    .data[coingeckoId].usd as number;

  // set 1.0 for undefined token prices in coingecko
  usdPrice = usdPrice ? usdPrice : 1.0;

  return usdPrice;
};
