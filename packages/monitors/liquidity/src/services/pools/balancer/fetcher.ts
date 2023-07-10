import { JsonRpcProvider } from "@ethersproject/providers";
import { ERC20Abi, IonicSdk } from "@ionicprotocol/sdk";
import { ChainConfig } from "@ionicprotocol/types";
import { Contract } from "ethers";

import { Reserve } from "../../../types";

export class BalancerFetcher {
  public chainConfig: ChainConfig;
  public W_TOKEN: string;
  public balancerPool: Contract;
  public provider: JsonRpcProvider;

  public constructor(sdk: IonicSdk, poolAddress: string) {
    this.chainConfig = sdk.chainConfig;
    this.provider = sdk.provider;
    this.balancerPool = new Contract(
      poolAddress,
      ["function getPoolId() public view returns (bytes32)", "function getVault() public view returns (address)"],
      sdk.provider
    );
  }
  getVault = async (): Promise<Contract> => {
    return new Contract(
      await this.balancerPool.callStatic.getVault(),
      ["function getPoolTokens(bytes32 poolId) external view returns (address[], uint256[], uint256)"],
      this.provider
    );
  };

  getReserves = async (): Promise<Reserve[]> => {
    const vault = await this.getVault();
    const poolId = await this.balancerPool.callStatic.getPoolId();
    const reserves: Reserve[] = [];
    const [underlyings, amounts] = await vault.callStatic.getPoolTokens(poolId);
    for (let i = 0; i < underlyings.length; i++) {
      reserves.push({
        underlying: new Contract(underlyings[i], ERC20Abi, this.provider),
        reserves: amounts[i],
      });
    }
    return reserves;
  };
}
