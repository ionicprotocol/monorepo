import { Contract } from "ethers";

import { SecurityBaseConstructor } from "../../..";

import { QUOTER_ABI, UNISWAP_QUOTERV2_ADDRESS } from "./constants";
import { getStandardTrades } from "./trades";

export function withUniswapV3OracleScorer<TBase extends SecurityBaseConstructor>(Base: TBase) {
  return class UniswapV3OracleScorer extends Base {
    async getUniswapV3OracleRating(): Promise<Array<null>> {
      const { chainId } = this.chainConfig;
      const provider = this.provider;
      const quoter = this.#getQuoterContract();
    }
    #getQuoterContract = () => {
      return new Contract(UNISWAP_QUOTERV2_ADDRESS, QUOTER_ABI, this.provider);
    };
    async #getTrades() {
      const trades = await getStandardTrades();
    }
  };
}
