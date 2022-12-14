import { JsonRpcProvider } from "@ethersproject/providers";
import { ERC20Abi, MidasSdk } from "@midas-capital/sdk";
import { ChainConfig } from "@midas-capital/types";
import { Contract } from "ethers";
import { Reserve, UniswapV2AssetConfig } from "../../../types";
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

  getPairReserves = async (asset: UniswapV2AssetConfig): Promise<[Reserve, Reserve]> => {
    const pairContract = await this.getPairContract(asset.token0, asset.token1);
    const [r0, r1] = await pairContract.callStatic.getReserves();
    return [
      {
        reserves: r0,
        underlying: new Contract(await pairContract.callStatic.token0(), ERC20Abi, this.provider),
      },
      {
        reserves: r1,
        underlying: new Contract(await pairContract.callStatic.token1(), ERC20Abi, this.provider),
      },
    ];
  };
}
