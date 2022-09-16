import Decimal from "decimal.js";
import { Contract } from "ethers";

import { SecurityBaseConstructor } from "../../..";

import { QUOTER_ABI, UNISWAP_QUOTERV2_ADDRESS } from "./constants";
import { binarySearchTradeValues, getStandardTrades } from "./trades";

export function withUniswapV3OracleScorer<TBase extends SecurityBaseConstructor>(Base: TBase) {
  return class UniswapV3OracleScorer extends Base {
    public quoter: Contract = new Contract(UNISWAP_QUOTERV2_ADDRESS, QUOTER_ABI, this.provider);

    async getUniswapV3OracleRating(): Promise<Array<null>> {
      const { chainId } = this.chainConfig;
    }
    #getQuoterContract = () => {
      return;
    };
    async #getTrades() {
      const trades = await getStandardTrades(currPrice, token, fee, ethPrice, this.quoter);
    }
    async #searchTrades(targetPriceImpact: number) {
      const targetDecimal = new Decimal(targetPriceImpact);
      const promise = binarySearchTradeValues(
        currPrice,
        currSqrtPriceX96,
        token,
        fee,
        ethPrice,
        targetDecimal,
        "priceImpact",
        this.quoter
      );
    }
  };
}
