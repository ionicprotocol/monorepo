import { ERC20Abi, MidasSdk } from "@midas-capital/sdk";
import { OracleTypes } from "@midas-capital/types";
import { BigNumber, Contract, utils, Wallet } from "ethers";

import { config } from "./config";

import { getCgPrice, InvalidReason, logger, SupportedAssetPriceValidity } from "./index";

export default async function verifyTwapPriceFeed(
  midasSdk: MidasSdk,
  oracleAddress: string,
  underlying: string
): Promise<SupportedAssetPriceValidity> {
  logger.debug(`Verifying Uniswap Twap oracle for ${underlying}`);
  const twapOracle = new Contract(
    oracleAddress,
    midasSdk.oracles[OracleTypes.UniswapTwapPriceOracleV2].abi,
    midasSdk.provider
  );
  const baseToken = await twapOracle.callStatic.baseToken();
  const uniswapV2Factory = new Contract(
    midasSdk.chainSpecificAddresses.UNISWAP_V2_FACTORY,
    ["function getPair(address tokenA, address tokenB) external view returns (address pair)"],
    midasSdk.provider
  );
  const pair = await uniswapV2Factory.callStatic.getPair(underlying, baseToken);
  const uniswapV2Pair = new Contract(
    pair,
    ["function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"],
    midasSdk.provider
  );
  const [r0, r1, _] = await uniswapV2Pair.callStatic.getReserves();
  const reserves = {
    r0: {
      reserves: r0,
      underlying: new Contract(underlying, ERC20Abi, midasSdk.provider),
    },
    r1: {
      reserves: r1,
      underlying: new Contract(baseToken, ERC20Abi, midasSdk.provider),
    },
  };
  const rootOracleAddress = await twapOracle.callStatic.rootOracle();
  const rootTwapOracle = new Contract(
    rootOracleAddress,
    midasSdk.artifacts.UniswapTwapPriceOracleV2Root.abi,
    midasSdk.provider
  );
  const workable = await rootTwapOracle.callStatic.workable(
    [pair],
    [baseToken],
    [config.defaultMinPeriod],
    [config.defaultDeviationThreshold]
  );
  if (workable[0]) {
    logger.warn(`Pair is in workable = ${workable[0]} state, this is likely not a good sign`);
    return {
      valid: false,
      invalidReason: InvalidReason.LAST_OBSERVATION_TOO_OLD,
      extraInfo: {
        message: `TWAP oracle is in workable = true state, meaning bot is not updating the values`,
        extraData: {
          workablePair: workable[0],
        },
      },
    };
  }

  const twapDepthUSD = await verifyTwapDepth(midasSdk, reserves);
  if (twapDepthUSD < config.minTwapDepth) {
    return {
      valid: false,
      invalidReason: InvalidReason.TWAP_LIQUIDITY_LOW,
      extraInfo: {
        message: `TWAP oracle has too low liquidity`,
        extraData: {
          twapDepthUSD,
        },
      },
    };
  }
  return {
    valid: true,
    invalidReason: null,
    extraInfo: null,
  };
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

async function verifyTwapDepth(midasSdk: MidasSdk, reserves: Reserves) {
  const signer = new Wallet(config.adminPrivateKey, midasSdk.provider);
  const mpo = await midasSdk.createMasterPriceOracle(signer);
  const r0Price = await mpo.callStatic.price(reserves.r0.underlying.address);
  const r1Price = await mpo.callStatic.price(reserves.r1.underlying.address);
  const nativeTokenPriceUSD = await getCgPrice(midasSdk.chainSpecificParams.cgId);

  const r0decimals = await reserves.r0.underlying.callStatic.decimals();
  const r1decimals = await reserves.r1.underlying.callStatic.decimals();

  const r0reserves = r0Price.mul(reserves.r0.reserves).div(BigNumber.from(10).pow(r0decimals));
  const r1reserves = r1Price.mul(reserves.r1.reserves).div(BigNumber.from(10).pow(r1decimals));

  const totalReservesUsd = parseFloat(utils.formatEther(r0reserves.add(r1reserves))) * nativeTokenPriceUSD;
  logger.info(`Pair is operating with $${totalReservesUsd} of liquidity`);
  return totalReservesUsd;
}
