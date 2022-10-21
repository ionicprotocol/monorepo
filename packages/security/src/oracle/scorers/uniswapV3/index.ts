import Decimal from "decimal.js";
import { utils } from "ethers";

import { SecurityBaseConstructor } from "../../..";
import { uniswapV3OracleAssetMappings } from "../../constants";
import { UniswapV3Fetcher } from "../../fetchers";

import { binarySearchTradeValues, getCostOfAttack } from "./trades";
import { getTwapRatio } from "./twap";
import { Attack } from "./types";
import { isInverted } from "./utils";

export function withUniswapV3OracleScorer<TBase extends SecurityBaseConstructor>(Base: TBase) {
  return class UniswapV3OracleScorer extends Base {
    fetcher: UniswapV3Fetcher = new UniswapV3Fetcher(this.chainConfig, this.provider);

    async #getPotentialAttack(): Promise<{ pump: Attack; dump: Attack }> {
      const { chainId } = this.chainConfig;
      const uniswapV3Parameters = await uniswapV3OracleAssetMappings[chainId];
      const tokenConfig = uniswapV3Parameters[0];
      const ethPrice = 1344;

      const inverted = isInverted(tokenConfig.token.address, this.fetcher.W_TOKEN);
      tokenConfig.inverted = inverted;

      const { price, sqrtPriceX96 } = await this.fetcher.getSlot0(tokenConfig, this.provider);

      const targetRatio = await getTwapRatio(price, new Decimal(sqrtPriceX96.toString()), tokenConfig);
      console.log({ targetRatio });

      const { execDump, execPump } = await binarySearchTradeValues(
        price,
        tokenConfig,
        ethPrice,
        targetRatio,
        this.fetcher
      );

      return {
        pump: {
          type: "pump",
          amountIn: execPump.amountIn,
          amountOut: execPump.amountOut,
          tokenOut: execPump.tokenOut,
          price: execPump.price,
          after: execPump.after,
          priceImpact: execPump.priceImpact,
          cost: getCostOfAttack(execPump, price, ethPrice, tokenConfig.token, this.fetcher.W_TOKEN),
        },
        dump: {
          type: "dump",
          amountIn: execDump.amountIn,
          amountOut: execDump.amountOut,
          tokenOut: execDump.tokenOut,
          price: execDump.price,
          after: execDump.after,
          priceImpact: execDump.priceImpact,
          cost: getCostOfAttack(execDump, price, ethPrice, tokenConfig.token, this.fetcher.W_TOKEN),
        },
      };
    }
    async getUniswapV3OracleRating(): Promise<Array<null>> {
      const { pump, dump } = await this.#getPotentialAttack();
      console.log("pump", {
        ...pump,
        amountIn: utils.formatEther(pump.amountIn),
        amountOut: utils.formatEther(pump.amountOut),
        price: utils.formatEther(pump.price),
        after: utils.formatEther(pump.after),
      });
      console.log("dump", {
        ...dump,
        amountIn: utils.formatEther(dump.amountIn),
        amountOut: utils.formatEther(dump.amountOut),
        price: utils.formatEther(dump.price),
        after: utils.formatEther(dump.after),
      });
      return [null];
    }
  };
}
