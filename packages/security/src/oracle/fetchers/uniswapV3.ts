import { ChainConfig } from "@ionicprotocol/types";
import Decimal from "decimal.js";
import {
  Address,
  encodeAbiParameters,
  encodePacked,
  formatEther,
  getContract,
  getContractAddress,
  Hash,
  keccak256,
  parseAbi,
  parseAbiParameters,
  parseEther,
  PublicClient,
} from "viem";

import { c1e18, QUOTER_ABI, UNISWAP_V3_POOL_ABI } from "../scorers/uniswapV3/constants";
import { Direction, PumpAndDump, Quote, Slot0, Trade, UniswapV3AssetConfig } from "../scorers/uniswapV3/types";
import { sqrtPriceX96ToPrice } from "../scorers/uniswapV3/utils";

export class UniswapV3Fetcher {
  public quoter;
  public chainConfig: ChainConfig;
  public W_TOKEN: Address;
  public quoterContract: Address;
  public uniV3Factory: Address;
  public uniV3PairInitHash: string;

  public constructor(chainConfig: ChainConfig, publicClient: PublicClient) {
    this.chainConfig = chainConfig;
    this.W_TOKEN = chainConfig.chainAddresses.W_TOKEN as Address;
    if (chainConfig.chainAddresses && chainConfig.chainAddresses.UNISWAP_V3) {
      this.quoterContract = chainConfig.chainAddresses.UNISWAP_V3.QUOTER_V2 as Address;
      this.uniV3Factory = chainConfig.chainAddresses.UNISWAP_V3.FACTORY as Address;
      this.uniV3PairInitHash = chainConfig.chainAddresses.UNISWAP_V3.PAIR_INIT_HASH;
    } else {
      throw new Error("UniswapV3 Config not found");
    }
    this.quoter = getContract({ address: this.quoterContract, abi: parseAbi(QUOTER_ABI), client: publicClient as any });
  }

  getSlot0 = async (tokenConfig: UniswapV3AssetConfig, client: PublicClient): Promise<Slot0> => {
    const { token, fee, inverted } = tokenConfig;
    if (token.address === this.W_TOKEN) {
      throw Error("Token is WNATIVE");
    }
    const poolAddress = this.#computeUniV3PoolAddress(token.address as Address, this.W_TOKEN, fee);
    try {
      const pool = getContract({
        address: poolAddress as Address,
        abi: parseAbi(UNISWAP_V3_POOL_ABI),
        client: client as any,
      }) as any;
      const [sqrtPriceX96, tick, observationIndex] = await pool.read.slot0();
      const res: Slot0 = { sqrtPriceX96, tick, observationIndex, price: 0n };
      return {
        ...res,
        price: sqrtPriceX96ToPrice(res.sqrtPriceX96, inverted),
      };
    } catch (e) {
      throw Error(`current price Error for ${token.symbol}: ${e}`);
    }
  };
  #computeUniV3PoolAddress = (tokenA: Address, tokenB: Address, fee: number) => {
    const [token0, token1] = BigInt(tokenA) < BigInt(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
    const address = getContractAddress({
      bytecode: this.uniV3PairInitHash as Hash,
      from: this.uniV3Factory,
      opcode: "CREATE2",
      salt: keccak256(
        encodePacked(
          ["bytes"],
          [encodeAbiParameters(parseAbiParameters("address,address,uint24"), [token0, token1, fee])]
        )
      ),
    });

    return address;
  };
  getPumpAndDump = async (
    currPrice: bigint,
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
    currPrice: bigint,
    tokenConfig: UniswapV3AssetConfig,
    ethPrice: number,
    tradeValueInUSD: number,
    direction: Direction
  ): Promise<Trade> => {
    const { token, fee, inverted } = tokenConfig;
    if (token.address === this.W_TOKEN)
      return {
        value: tradeValueInUSD,
        price: 0n,
        priceImpact: "0",
        amountIn: 0n,
        amountOut: 0n,
        after: 0n,
        tokenOut: token.address,
        index: 0,
      };

    try {
      const amountIn =
        direction === "pump"
          ? parseEther(new Decimal(tradeValueInUSD / ethPrice).toFixed(18))
          : (parseEther(new Decimal(tradeValueInUSD / ethPrice).toFixed(18)) * c1e18) /
            (currPrice === 0n ? 1n : currPrice);

      const quote: Quote = await this.quoter.callStatic.quoteExactInputSingle({
        tokenIn: direction === "pump" ? this.W_TOKEN : token.address,
        tokenOut: direction === "pump" ? token.address : this.W_TOKEN,
        fee,
        amountIn,
        sqrtPriceLimitX96: 0,
      });

      const after = sqrtPriceX96ToPrice(quote.sqrtPriceX96After, inverted);

      const priceImpact = formatEther(after - ((currPrice * c1e18) / (currPrice === 0n ? 1n : currPrice)) * 100n);
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
