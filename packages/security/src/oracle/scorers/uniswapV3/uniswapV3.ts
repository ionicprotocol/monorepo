import { BigNumber, Contract, utils } from "ethers";

import { c1e18, WETH_ADDRESS } from "./constants";
import { PumpAndDump, Quote, Token, Trade } from "./types";
import { div, formatPrice, isInverted, sqrtPriceX96ToPrice } from "./utils";

export const getDump = async (
  currPrice: BigNumber,
  token: Token,
  fee: BigNumber,
  ethPrice: number,
  tradeValueInUSD: number,
  quoter: Contract
): Promise<Trade> => {
  if (token.address.toLowerCase() === WETH_ADDRESS) return { value: tradeValueInUSD, price: "0", priceImpact: "0" };

  try {
    const inverted = isInverted(token.address);

    const amountIn = utils
      .parseEther(div(tradeValueInUSD, ethPrice).toFixed(18))
      .mul(c1e18)
      .div(currPrice.eq(0) ? 1 : currPrice);
    const quote: Quote = await quoter.callStatic.quoteExactInputSingle({
      tokenIn: token.address,
      tokenOut: WETH_ADDRESS,
      fee,
      amountIn,
      sqrtPriceLimitX96: 0,
    });
    const after = sqrtPriceX96ToPrice(quote.sqrtPriceX96After, inverted);
    const priceImpact = utils.formatEther(
      after
        .sub(currPrice)
        .mul(c1e18)
        .div(currPrice.eq(0) ? 1 : currPrice)
        .mul(100)
    );

    return {
      amountIn,
      value: tradeValueInUSD,
      priceImpact,
      sqrtPriceX96After: quote.sqrtPriceX96After,
      price: formatPrice(after, token),
      after,
      amountOut: quote.amountOut,
      tokenOut: WETH_ADDRESS,
      gasEstimate: quote.gasEstimate,
    };
  } catch (e) {
    console.log("e dump: ", token.symbol, e);
    throw e;
  }
};

export const getPump = async (
  currPrice: BigNumber,
  token: Token,
  fee: any,
  ethPrice: number,
  tradeValueInUSD: number,
  quoter: Contract
): Promise<Trade> => {
  if (token.address.toLowerCase() === WETH_ADDRESS) return { value: tradeValueInUSD, price: "0", priceImpact: "0" };

  try {
    const inverted = isInverted(token.address);

    const amountIn = utils.parseEther(div(tradeValueInUSD, ethPrice).toFixed(18));
    const quote: Quote = await quoter.callStatic.quoteExactInputSingle({
      tokenIn: WETH_ADDRESS,
      tokenOut: token.address,
      fee,
      amountIn,
      sqrtPriceLimitX96: 0,
    });

    const after = sqrtPriceX96ToPrice(quote.sqrtPriceX96After, inverted);

    const priceImpact = utils.formatEther(
      after
        .sub(currPrice)
        .mul(c1e18)
        .div(currPrice.eq(0) ? 1 : currPrice)
        .mul(100)
    );

    return {
      amountIn,
      value: tradeValueInUSD,
      priceImpact,
      sqrtPriceX96After: quote.sqrtPriceX96After,
      price: formatPrice(after, token),
      after,
      amountOut: quote.amountOut,
      tokenOut: token.address,
      gasEstimate: quote.gasEstimate,
    };
  } catch (e) {
    console.log("e pump: ", token.symbol, e);
    throw e;
  }
};

export const getPumpAndDump = async (
  currPrice: BigNumber,
  token: Token,
  fee: any,
  ethPrice: number,
  tradeValueInUSD: number,
  quoter: Contract
): Promise<PumpAndDump> => {
  const [pump, dump] = await Promise.all([
    getPump(currPrice, token, fee, ethPrice, tradeValueInUSD, quoter),
    getDump(currPrice, token, fee, ethPrice, tradeValueInUSD, quoter),
  ]);
  return { pump, dump };
};
