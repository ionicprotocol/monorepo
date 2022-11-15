import { ERC20Abi, MidasSdk } from "@midas-capital/sdk";
import { SupportedChains } from "@midas-capital/types";
import { BigNumber, Contract, utils, Wallet } from "ethers";

import { logger } from "../../..";
import { baseConfig } from "../../../config/variables";
import { InvalidReason } from "../../../types";
import { getDefiLlamaPrice } from "../../../utils";

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

async function getPairReserves(sdk: MidasSdk, pairAddress: string) {
  const uniswapV2Pair = new Contract(
    pairAddress,
    [
      "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
      "function token0() external view returns (address)",
      "function token1() external view returns (address)",
    ],
    sdk.provider
  );
  const [r0, r1] = await uniswapV2Pair.callStatic.getReserves();
  const reserves = {
    r0: {
      reserves: r0,
      underlying: new Contract(await uniswapV2Pair.callStatic.token0(), ERC20Abi, sdk.provider),
    },
    r1: {
      reserves: r1,
      underlying: new Contract(await uniswapV2Pair.callStatic.token1(), ERC20Abi, sdk.provider),
    },
  };
  return reserves;
}

async function verifyUniswapV2TwapDepth(sdk: MidasSdk, reserves: Reserves) {
  const twapDepthUSD = await verifyTwapDepth(sdk, reserves);
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

async function verifyTwapDepth(sdk: MidasSdk, reserves: Reserves) {
  const signer = new Wallet(baseConfig.adminPrivateKey, sdk.provider);
  const mpo = await sdk.createMasterPriceOracle(signer);
  const r0Price = await mpo.callStatic.price(reserves.r0.underlying.address);
  const r1Price = await mpo.callStatic.price(reserves.r1.underlying.address);

  const chainName = SupportedChains[sdk.chainId];
  const wrappedNativeId = `${chainName}:${sdk.chainSpecificAddresses.W_TOKEN}`;

  const wrappedNativeTokenPriceUSD = await getDefiLlamaPrice(wrappedNativeId);

  if (!wrappedNativeTokenPriceUSD) {
    throw new Error(`No price found for ${wrappedNativeId}`);
  }

  const r0decimals = await reserves.r0.underlying.callStatic.decimals();
  const r1decimals = await reserves.r1.underlying.callStatic.decimals();

  const r0reserves = r0Price.mul(reserves.r0.reserves).div(BigNumber.from(10).pow(r0decimals));
  const r1reserves = r1Price.mul(reserves.r1.reserves).div(BigNumber.from(10).pow(r1decimals));

  const totalReservesUsd = parseFloat(utils.formatEther(r0reserves.add(r1reserves))) * wrappedNativeTokenPriceUSD;
  logger.info(`Pair is operating with $${totalReservesUsd} of liquidity`);
  return totalReservesUsd;
}
