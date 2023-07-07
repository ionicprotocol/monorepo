import { ChainConfig } from "@ionicprotocol/types";
import Decimal from "decimal.js";
import { BigNumber, Contract, utils } from "ethers";

import { SignerOrProvider } from "../..";
import { c1e18, QUOTER_ABI, UNISWAP_V3_POOL_ABI } from "../scorers/uniswapV3/constants";
import { Direction, PumpAndDump, Quote, Slot0, Trade, UniswapV3AssetConfig } from "../scorers/uniswapV3/types";
import { sqrtPriceX96ToPrice } from "../scorers/uniswapV3/utils";

export class UniswapV3Fetcher {
  public quoter: Contract;
  public chainConfig: ChainConfig;
  public W_TOKEN: string;
  public quoterContract: string;
  public uniV3Factory: string;
  public uniV3PairInitHash: string;

  public constructor(chainConfig: ChainConfig, provider: SignerOrProvider) {
    this.chainConfig = chainConfig;
    this.W_TOKEN = chainConfig.chainAddresses.W_TOKEN;
    if (chainConfig.chainAddresses && chainConfig.chainAddresses.UNISWAP_V3) {
      this.quoterContract = chainConfig.chainAddresses.UNISWAP_V3.QUOTER_V2;
      this.uniV3Factory = chainConfig.chainAddresses.UNISWAP_V3.FACTORY;
      this.uniV3PairInitHash = chainConfig.chainAddresses.UNISWAP_V3.PAIR_INIT_HASH;
    } else {
      throw new Error("UniswapV3 Config not found");
    }
    this.quoter = new Contract(this.quoterContract, QUOTER_ABI, provider);
  }

  getSlot0 = async (tokenConfig: UniswapV3AssetConfig, provider: SignerOrProvider): Promise<Slot0> => {
    const { token, fee, inverted } = tokenConfig;
    if (token.address === this.W_TOKEN) {
      throw Error("Token is WNATIVE");
    }
    const poolAddress = this.#computeUniV3PoolAddress(token.address, this.W_TOKEN, fee);
    try {
      const pool = new Contract(poolAddress, UNISWAP_V3_POOL_ABI, provider);
      const res: Slot0 = await pool.callStatic["slot0()"]();
      return {
        ...res,
        price: sqrtPriceX96ToPrice(res.sqrtPriceX96, inverted),
      };
    } catch (e) {
      throw Error(`current price Error for ${token.symbol}: ${e}`);
    }
  };
  #computeUniV3PoolAddress = (tokenA: string, tokenB: string, fee: number) => {
    const [token0, token1] = BigNumber.from(tokenA).lt(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];

    return utils.getCreate2Address(
      this.uniV3Factory,
      utils.solidityKeccak256(
        ["bytes"],
        [utils.defaultAbiCoder.encode(["address", "address", "uint24"], [token0, token1, fee])]
      ),
      this.uniV3PairInitHash
    );
  };
  getPumpAndDump = async (
    currPrice: BigNumber,
    tokenConfig: UniswapV3AssetConfig,
    ethPrice: number,
    tradeValueInUSD: number
  ): Promise<PumpAndDump> => {
    const [pump, dump] = await Promise.all([
      this.getTrade(currPrice, tokenConfig, ethPrice, tradeValueInUSD, "pump"),
      this.getTrade(currPrice, tokenConfig, ethPrice, tradeValueInUSD, "dump"),
    ]);
    return { pump, dump };
  };

  getTrade = async (
    currPrice: BigNumber,
    tokenConfig: UniswapV3AssetConfig,
    ethPrice: number,
    tradeValueInUSD: number,
    direction: Direction
  ): Promise<Trade> => {
    const { token, fee, inverted } = tokenConfig;
    if (token.address === this.W_TOKEN)
      return {
        value: tradeValueInUSD,
        price: BigNumber.from(0),
        priceImpact: "0",
        amountIn: BigNumber.from(0),
        amountOut: BigNumber.from(0),
        after: BigNumber.from(0),
        tokenOut: token.address,
        index: 0,
      };

    try {
      const amountIn =
        direction === "pump"
          ? utils.parseEther(new Decimal(tradeValueInUSD / ethPrice).toFixed(18))
          : utils
              .parseEther(new Decimal(tradeValueInUSD / ethPrice).toFixed(18))
              .mul(c1e18)
              .div(currPrice.eq(0) ? 1 : currPrice);

      const quote: Quote = await this.quoter.callStatic.quoteExactInputSingle({
        tokenIn: direction === "pump" ? this.W_TOKEN : token.address,
        tokenOut: direction === "pump" ? token.address : this.W_TOKEN,
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
        amountIn: amountIn,
        value: tradeValueInUSD,
        priceImpact,
        sqrtPriceX96After: quote.sqrtPriceX96After.toString(),
        price: currPrice,
        after,
        amountOut: quote.amountOut,
        tokenOut: direction === "pump" ? token.address : this.W_TOKEN,
        gasEstimate: quote.gasEstimate,
        index: 0,
      };
    } catch (e) {
      console.log("e dump: ", token.symbol, e);
      throw e;
    }
  };
}
