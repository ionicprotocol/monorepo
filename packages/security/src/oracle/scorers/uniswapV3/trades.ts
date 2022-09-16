import Decimal from "decimal.js";
import { BigNumber, Contract } from "ethers";

import { amountsUSD } from "./constants";
import { Direction, ExtendedTrade, PumpAndDump, TargetType, Token, Trade } from "./types";
import { getDump, getPump, getPumpAndDump } from "./uniswapV3";
import { formatPrice, isInverted } from "./utils";

export const getStandardTrades = async (
  currPrice: BigNumber,
  token: Token,
  fee: any,
  ethPrice: number,
  quoter: Contract
): Promise<PumpAndDump[]> => {
  const trades: PumpAndDump[] = [];
  for (const amountUSD of amountsUSD) {
    const trade = await getPumpAndDump(currPrice, token, fee, ethPrice, amountUSD, quoter);
    trades.push(trade);
  }
  return trades;
};

// TODO only price target
export const searchTrade = (
  currPrice: BigNumber,
  currSqrtPriceX96: any,
  token: Token,
  fee: BigNumber,
  ethPrice: number,
  target: { lte: (arg0: string) => any; gte: (arg0: string) => any; log: (arg0: number) => any },
  targetType: TargetType,
  direction: Direction,
  quoter: Contract
) => {
  const currPriceFormatted = formatPrice(currPrice, token);

  if (
    (targetType === "price" &&
      ((direction === "pump" && target.lte(currPriceFormatted)) ||
        (direction === "dump" && target.gte(currPriceFormatted)))) ||
    (targetType === "sqrtPriceX96After" &&
      ((direction === "pump" && target.lte(currSqrtPriceX96)) ||
        (direction === "dump" && target.gte(currSqrtPriceX96))))
  ) {
    return [];
  }

  const exec = async () => {
    let high = 1_000_000_000;
    let low = 0;
    const tolerance = 0.01;
    const ranges = 20;

    let allTrades: Array<Trade> = [];
    let best: ExtendedTrade;

    // TODO improve this hack
    const inverted = isInverted(token.address);
    const adjustedDirection = inverted ? { pump: "dump", dump: "pump" }[direction] : direction;

    const getTrade = adjustedDirection === "pump" ? getPump : getDump;
    const getTickTrade = async (tick: number, index: number): Promise<ExtendedTrade> => {
      const trade = await getTrade(currPrice, token, fee, ethPrice, tick, quoter);
      allTrades.push(trade);
      return {
        ...trade,
        // todo: check the types here
        priceImpact: Math.abs(parseFloat(trade.priceImpact)).toFixed(),
        value: tick,
        index,
      };
    };

    const findBest = (samples: Array<ExtendedTrade>) =>
      samples.reduce((accu, s) => {
        const sampleVal = new Decimal(s[targetType]);
        const accuVal = new Decimal(accu[targetType]);

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
      // console.log(direction, 'ticks: ', ticks);

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

    // take the best trade above target if available
    best = allTrades.find((t) =>
      targetType === "priceImpact" || direction === "pump"
        ? target.lte(Decimal.abs(t[targetType]))
        : target.gte(Decimal.abs(t[targetType]))
    );

    // console.log(direction, 'RESULT', best);
    return {
      best,
      // include trades below and a few over
      trades: allTrades.filter((t) => t.value < Math.max(10_000_000, best.value * 1.2)),
    };
  };
  return exec();
};

export const binarySearchTradeValues = (
  currPrice: BigNumber,
  currSqrtPriceX96: any,
  token: Token,
  fee: BigNumber,
  ethPrice: number,
  target: { lte: (arg0: string) => any; gte: (arg0: string) => any; log: (arg0: number) => any },
  targetType: TargetType,
  quoter: Contract
) => {
  let execPump = searchTrade(currPrice, currSqrtPriceX96, token, fee, ethPrice, target, targetType, "pump", quoter);
  let execDump = searchTrade(currPrice, currSqrtPriceX96, token, fee, ethPrice, target, targetType, "dump", quoter);
  // todo improve!
  if (isInverted(token.address)) [execPump, execDump] = [execDump, execPump];
  return { promise: Promise.all([execPump, execDump]) };
};
