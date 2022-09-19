import { Contract } from "ethers";

import { SecurityBaseConstructor } from "../../..";
import { uniswapV3OracleAssetMappings } from "../../constants";
import { UniswapV3Fetcher } from "../../fetchers";

import { QUOTER_ABI } from "./constants";
import { binarySearchTradeValues } from "./trades";
import { isInverted, sqrtPriceX96ToPrice } from "./utils";

export function withUniswapV3OracleScorer<TBase extends SecurityBaseConstructor>(Base: TBase) {
  return class UniswapV3OracleScorer extends Base {
    fetcher: UniswapV3Fetcher = new UniswapV3Fetcher(this.chainConfig, this.provider);
    quoter: Contract = new Contract(this.chainConfig.chainAddresses.UNISWAP_V3.QUOTER_V2, QUOTER_ABI, this.provider);

    async getUniswapV3OracleRating(): Promise<Array<null>> {
      const { chainId } = this.chainConfig;
      const uniswapV3Parameters = await uniswapV3OracleAssetMappings[chainId];
      const tokenConfig = uniswapV3Parameters[0];
      const { sqrtPriceX96 } = await this.fetcher.getSlot0(tokenConfig.token, tokenConfig.fee, this.provider);
      const ethPrice = 1300;
      const promise = await binarySearchTradeValues(
        sqrtPriceX96ToPrice(sqrtPriceX96, isInverted(tokenConfig.token.address, this.fetcher.W_TOKEN)),
        tokenConfig.token,
        tokenConfig.fee,
        ethPrice,
        tokenConfig.targetPriceImpact,
        "priceImpact",
        this.fetcher
      );
      console.log(promise);
      return [null];
    }
  };
}
