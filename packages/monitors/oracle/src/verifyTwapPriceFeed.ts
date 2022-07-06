import { ERC20Abi, Fuse, OracleTypes } from "@midas-capital/sdk";
import axios from "axios";
import { BigNumber, Contract, utils, Wallet } from "ethers";

import { logger } from "./index";

export default async function verifyTwapPriceFeed(fuse: Fuse, oracleAddress: string, underlying: string) {
  logger.debug(`Verifying Uniswap Twap oracle for ${underlying}`);
  const twapOracle = new Contract(oracleAddress, fuse.oracles[OracleTypes.UniswapTwapPriceOracleV2].abi, fuse.provider);
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
  const [r0, r1, _] = await uniswapV2Pair.callStatic.getReserves();
  const reserves = {
    r0: {
      reserves: r0,
      underlying: new Contract(underlying, ERC20Abi, fuse.provider),
    },
    r1: {
      reserves: r1,
      underlying: new Contract(baseToken, ERC20Abi, fuse.provider),
    },
  };
  const rootOracleAddress = await twapOracle.callStatic.rootOracle();
  const rootTwapOracle = new Contract(
    rootOracleAddress,
    fuse.artifacts.UniswapTwapPriceOracleV2Root.abi,
    fuse.provider
  );
  const minPeriod = BigNumber.from(process.env.DEFAULT_MIN_PERIOD! || "1800");
  const deviationThreshold = utils.parseEther(process.env.DEFAULT_DEVIATION_THRESHOLD! || "0.05");
  const workable = await rootTwapOracle.callStatic.workable([pair], [baseToken], [minPeriod], [deviationThreshold]);
  logger.info(`Pair is in workable: ${workable[0]} state`);
  const depthCheck = await verifyTwapDepth(fuse, reserves);
  return depthCheck && !workable[0];
}

type Reserves = {
  r0: {
    underlying: Contract;
    reserves: BigNumber;
  };
  r1: {
    underlying: Contract;
    reserves: BigNumber;
  };
};

async function verifyTwapDepth(fuse: Fuse, reserves: Reserves) {
  const signer = new Wallet(process.env.ETHEREUM_ADMIN_PRIVATE_KEY!, fuse.provider);
  const mpo = await fuse.createMasterPriceOracle(signer);
  const r0Price = await mpo.callStatic.price(reserves.r0.underlying.address);
  const r1Price = await mpo.callStatic.price(reserves.r1.underlying.address);
  const nativeTokenPrice = await getCgPrice(fuse.chainSpecificParams.cgId);

  const r0decimals = await reserves.r0.underlying.callStatic.decimals();
  const r1decimals = await reserves.r1.underlying.callStatic.decimals();

  const r0reserves = r0Price.mul(reserves.r0.reserves).div(BigNumber.from(10).pow(r0decimals));
  const r1reserves = r1Price.mul(reserves.r1.reserves).div(BigNumber.from(10).pow(r1decimals));

  const totalReservesUsd = parseFloat(utils.formatEther(r0reserves.add(r1reserves))) * nativeTokenPrice;
  logger.info(`Pair is operating with $${totalReservesUsd} of liquidity`);
  return totalReservesUsd > parseFloat(process.env.MINIMAL_TWAP_DEPTH! || "1000000");
}

const getCgPrice = async (coingeckoId: string) => {
  let usdPrice: number;

  usdPrice = (await axios.get(`https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoId}`))
    .data[coingeckoId].usd as number;

  usdPrice = usdPrice ? usdPrice : 1.0;

  return usdPrice;
};
