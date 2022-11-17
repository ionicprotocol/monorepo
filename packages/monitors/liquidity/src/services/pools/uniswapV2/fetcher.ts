import { JsonRpcProvider } from "@ethersproject/providers";
import { MidasSdk } from "@midas-capital/sdk";
import { ChainConfig } from "@midas-capital/types";
import { BigNumber, Contract, utils } from "ethers";

export type Reserves = {
  r0: {
    underlying: Contract;
    reserves: BigNumber;
  };
  r1: {
    underlying: Contract;
    reserves: BigNumber;
  };
};

export class V2Fetcher {
  public chainConfig: ChainConfig;
  public W_TOKEN: string;
  public uniswapV2Factory: Contract;
  public provider: JsonRpcProvider;

  public constructor(sdk: MidasSdk, uniswapV2Factory: string) {
    this.chainConfig = sdk.chainConfig;
    this.provider = sdk.provider;
    this.W_TOKEN = this.chainConfig.chainAddresses.W_TOKEN;
    this.uniswapV2Factory = new Contract(
      uniswapV2Factory,
      ["function getPair(address tokenA, address tokenB) external view returns (address pair)"],
      sdk.provider
    );
  }
  getPairContract = async (token0: string, token1: string): Promise<Contract> => {
    const pair = await this.uniswapV2Factory.callStatic.getPair(token0, token1);
    return new Contract(
      pair,
      [
        "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
        "function token0() external view returns (address)",
        "function token1() external view returns (address)",
      ],
      this.provider
    );
  };

  getPairReserves = async (token0: string, token1: string): Promise<Reserves> => {
    const pairContract = await this.getPairContract(token0, token1);
    const [r0, r1] = await pairContract.callStatic.getReserves();
    const reserves = {
      r0: {
        reserves: r0,
        underlying: await pairContract.callStatic.token0(),
      },
      r1: {
        reserves: r1,
        underlying: await pairContract.callStatic.token1(),
      },
    };
    return reserves;
  };
}
