import { JsonRpcProvider } from "@ethersproject/providers";
import { ERC20Abi, MidasSdk } from "@midas-capital/sdk";
import { ChainConfig } from "@midas-capital/types";
import { BigNumber, Contract, utils } from "ethers";

import { Reserve, UniswapV3AssetConfig } from "../../../types";

export class V3Fetcher {
  public chainConfig: ChainConfig;
  public W_TOKEN: string;
  public uniV3Factory: string;
  public uniV3PairInitHash: string;
  public provider: JsonRpcProvider;

  public constructor(sdk: MidasSdk) {
    this.chainConfig = sdk.chainConfig;
    this.provider = sdk.provider;
    this.W_TOKEN = this.chainConfig.chainAddresses.W_TOKEN;
    if (this.chainConfig.chainAddresses && this.chainConfig.chainAddresses.UNISWAP_V3) {
      this.uniV3Factory = this.chainConfig.chainAddresses.UNISWAP_V3.FACTORY;
      this.uniV3PairInitHash = this.chainConfig.chainAddresses.UNISWAP_V3.PAIR_INIT_HASH;
    } else {
      throw new Error("UniswapV3 Config not found");
    }
  }
  computeUniV3PoolAddress = (token0: string, token1: string, fee: number) => {
    const [tokenA, tokenB] = BigNumber.from(token0).lt(token1) ? [token0, token1] : [token1, token0];

    return utils.getCreate2Address(
      this.uniV3Factory,
      utils.solidityKeccak256(
        ["bytes"],
        [utils.defaultAbiCoder.encode(["address", "address", "uint24"], [tokenA, tokenB, fee])]
      ),
      this.uniV3PairInitHash
    );
  };
  getPairReserves = async (asset: UniswapV3AssetConfig): Promise<[Reserve, Reserve]> => {
    const token0Erc20 = new Contract(asset.token0, ERC20Abi, this.provider);
    const token1Erc20 = new Contract(asset.token1, ERC20Abi, this.provider);

    const pool = this.computeUniV3PoolAddress(asset.token0, asset.token1, asset.fee);

    const token0balance = await token0Erc20.callStatic.balanceOf(pool);
    const token1balance = await token1Erc20.callStatic.balanceOf(pool);

    return [
      {
        underlying: token0Erc20,
        reserves: token0balance,
      },
      {
        underlying: token1Erc20,
        reserves: token1balance,
      },
    ];
  };
}
