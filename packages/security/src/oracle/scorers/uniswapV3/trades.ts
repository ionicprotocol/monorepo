import Decimal from "decimal.js";
import { BigNumber, utils } from "ethers";

import { UniswapV3Fetcher } from "../../fetchers";

import { Direction, Token, Trade, UniswapV3AssetConfig } from "./types";
import { formatPrice, isInverted } from "./utils";

Decimal.set({ precision: 50 });

// TODO only price target
export const searchTrade = async (
  currPrice: BigNumber,
  tokenConfig: UniswapV3AssetConfig,
  ethPrice: number,
  target: Decimal,
  direction: Direction,
  fetcher: UniswapV3Fetcher
): Promise<Trade> => {
  let high = 1_000_000_000;
  let low = 0;
  const tolerance = 0.01;
  const ranges = 20;

  let allTrades: Array<Trade> = []; //await getStandardTrades(currPrice, token, fee, ethPrice, fetcher);
  let best: Trade;

  // TODO improve this hack
  const inverted = isInverted(tokenConfig.token.address, fetcher.W_TOKEN);
  const adjustedDirection = (inverted ? { pump: "dump", dump: "pump" }[direction] : direction) as Direction;

  const getTickTrade = async (tick: number, index: number): Promise<Trade> => {
    const trade = await fetcher.getTrade(currPrice, tokenConfig, ethPrice, tick, adjustedDirection);
    allTrades.push(trade);
    return {
      ...trade,
      // todo: check the types here
      priceImpact: Math.abs(parseFloat(trade.priceImpact)).toFixed(),
      value: tick,
      index,
    };
  };

  const findBest = (samples: Array<Trade>) =>
    samples.reduce((accu: Trade, s: Trade) => {
      const sampleVal = new Decimal(s.priceImpact); // TODO: or sqrtPriceX96After
      const accuVal = new Decimal(accu.priceImpact); // TODO: or sqrtPriceX96After

      if (
        sampleVal
          .log(10)
          .sub(target.log(10))
          .abs()
          .lessThan(accuVal.log(10).sub(target.log(10)).abs())
      ) {
        // console.log(direction, 'found:', s)
        return s;
      }
      return accu;
    });

  let i = 0;
  while (high - low > high * tolerance && high >= 100) {
    const ticks = Array(ranges - 1)
      .fill(null)
      .map((_, i) => low + ((high - low) / ranges) * (i + 1));

    const samples = await Promise.all(ticks.map(getTickTrade));

    best = findBest(samples);
    // console.log(direction, 'best: ', best);

    // best result is to the far right, increase range
    if (i === 0 && best.index === ranges - 2) {
      high *= 1_000_000; // 1000 trillions
      low = ticks[ranges - 3];
    } else if (i === 1 && best.index === ranges - 2 && high > 1_000_000_000) {
      // range was increased already, it's ridiculous to continue
      throw new Error("Max trade value exceeded (1000T USD)");
    } else if (best.index === 0) {
      // no improvement after the first sample - go down the left
      high = ticks[1];
    } else {
      // otherwise make sure the range is not flat
      for (let j = 0; j < best.index; j++) {
        if (samples[j].priceImpact !== best.priceImpact) {
          low = ticks[j];
        }
      }
      high = ticks[best.index + 1] || high;
    }
    // console.log(direction, 'low high: ', low, high);
    i++;
  }
  allTrades = allTrades.sort((a, b) => b.value - a.value);
  const trade = allTrades.find((t) => target.gt(Decimal.abs(t.priceImpact)));
  if (!trade) {
    throw new Error("No trade found");
  }
  return trade;
};

export const binarySearchTradeValues = async (
  currPrice: BigNumber,
  tokenConfig: UniswapV3AssetConfig,
  ethPrice: number,
  target: Decimal,
  fetcher: UniswapV3Fetcher
): Promise<{ execPump: Trade; execDump: Trade }> => {
  let execPump = await searchTrade(currPrice, tokenConfig, ethPrice, target, "pump", fetcher);
  let execDump = await searchTrade(currPrice, tokenConfig, ethPrice, target, "dump", fetcher);
  // todo improve!
  if (tokenConfig.inverted) [execPump, execDump] = [execDump, execPump];
  return { execPump, execDump };
};

export const getCostOfAttack = (trade: Trade, currPrice: BigNumber, ethPrice: number, token: Token, WETH_ADDRESS) => {
  return trade.tokenOut === WETH_ADDRESS
    ? trade.value - parseFloat(utils.formatEther(trade.amountOut)) * ethPrice
    : trade.value -
        parseFloat(utils.formatUnits(trade.amountOut, token.decimals)) *
          parseFloat(formatPrice(currPrice, token)) *
          ethPrice;
};
