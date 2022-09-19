import Decimal from "decimal.js";
import { BigNumber, utils } from "ethers";

import { UniswapV3Fetcher } from "../../fetchers";

import { amountsUSD } from "./constants";
import { Direction, PumpAndDump, TargetType, Token, Trade } from "./types";
import { isInverted } from "./utils";

export const getStandardTrades = async (
  currPrice: BigNumber,
  token: Token,
  fee: number,
  ethPrice: number,
  fetcher: UniswapV3Fetcher
): Promise<PumpAndDump[]> => {
  const trades: PumpAndDump[] = [];
  for (const amountUSD of amountsUSD) {
    const trade = await fetcher.getPumpAndDump(currPrice, token, fee, ethPrice, amountUSD);
    trades.push(trade);
  }
  return trades;
};

type SearchTrade = {
  best: Trade;
  trades: Array<Trade>;
};

// TODO only price target
export const searchTrade = async (
  currPrice: BigNumber,
  token: Token,
  fee: number,
  ethPrice: number,
  target: Decimal,
  targetType: TargetType,
  direction: Direction,
  fetcher: UniswapV3Fetcher
): Promise<SearchTrade> => {
  console.log("searching trade", direction);

  let high = 1_000_000_000;
  let low = 0;
  const tolerance = 0.01;
  const ranges = 20;

  let allTrades: Array<Trade> = []; //await getStandardTrades(currPrice, token, fee, ethPrice, fetcher);
  let best: Trade;

  // TODO improve this hack
  const inverted = isInverted(token.address, fetcher.W_TOKEN);
  const adjustedDirection = (inverted ? { pump: "dump", dump: "pump" }[direction] : direction) as Direction;

  const getTickTrade = async (tick: number, index: number): Promise<Trade> => {
    const trade = await fetcher.getTrade(currPrice, token, fee, ethPrice, tick, adjustedDirection);
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
      const sampleVal = new Decimal(s[targetType]); // TODO: or sqrtPriceX96After
      const accuVal = new Decimal(accu[targetType]); // TODO: or sqrtPriceX96After

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
        if (samples[j][targetType] !== best[targetType]) {
          low = ticks[j];
        }
      }
      high = ticks[best.index + 1] || high;
    }
    // console.log(direction, 'low high: ', low, high);
    i++;
  }
  allTrades = allTrades.sort((a, b) => a.value - b.value);
  //   console.log(target, "target");
  //   console.log(
  //     allTrades.slice(0, 10).map((a) => {
  //       return {
  //         ...a,
  //         amountIn: utils.formatUnits(a.amountIn, 18),
  //         amountOut: utils.formatUnits(a.amountOut, 18),
  //         after: utils.formatUnits(a.after, 18),
  //         sqrtPriceX96After: utils.formatUnits(a.sqrtPriceX96After, 18),
  //       };
  //     })
  //   );
  best = allTrades.find((t) =>
    direction === "pump" ? target.lte(Decimal.abs(t.priceImpact)) : target.gte(Decimal.abs(t.priceImpact))
  );
  console.log("best trade", best);
  return {
    best,
    // include trades below and a few over
    trades: allTrades.filter((t) => t.value < Math.max(10_000_000, best.value * 1.2)),
  };
};

export const binarySearchTradeValues = async (
  currPrice: BigNumber,
  token: Token,
  fee: number,
  ethPrice: number,
  target: Decimal,
  targetType: TargetType,
  fetcher: UniswapV3Fetcher
): Promise<{ execPump: SearchTrade; execDump: SearchTrade }> => {
  let execPump = await searchTrade(currPrice, token, fee, ethPrice, target, targetType, "pump", fetcher);
  let execDump = await searchTrade(currPrice, token, fee, ethPrice, target, targetType, "dump", fetcher);
  // todo improve!
  if (isInverted(token.address, fetcher.W_TOKEN)) [execPump, execDump] = [execDump, execPump];
  return { execPump, execDump };
};
