import { MidasSdk } from "@midas-capital/sdk";
import { ChainConfig } from "@midas-capital/types";
import { BigNumber, utils } from "ethers";

export class V3Fetcher {
  public chainConfig: ChainConfig;
  public W_TOKEN: string;
  public uniV3Factory: string;
  public uniV3PairInitHash: string;

  public constructor(sdk: MidasSdk) {
    this.chainConfig = sdk.chainConfig;
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
}
