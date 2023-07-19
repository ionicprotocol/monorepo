import { JsonRpcProvider } from "@ethersproject/providers";
import { bsc, chapel, ethereum, ganache, neon, polygon } from "@ionicprotocol/chains";
import { IonicSdk } from "@ionicprotocol/sdk";
import { ChainConfig } from "@ionicprotocol/types";
import { Signer } from "ethers";

const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [polygon.chainId]: polygon,
  [neon.chainId]: neon,
  [chapel.chainId]: chapel,
  [ganache.chainId]: ganache,
  [ethereum.chainId]: ethereum,
};

const setUpSdk = (chainId: number, provider: Signer | JsonRpcProvider) => {
  return new IonicSdk(provider, chainIdToConfig[chainId]);
};

export default setUpSdk;
