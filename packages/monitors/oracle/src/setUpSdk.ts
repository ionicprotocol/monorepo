import { JsonRpcProvider } from "@ethersproject/providers";
import { chainIdToConfig } from "@ionicprotocol/chains";
import { IonicSdk } from "@ionicprotocol/sdk";
import { Signer } from "ethers";

const setUpSdk = (chainId: number, provider: Signer | JsonRpcProvider) => {
  return new IonicSdk(provider, chainIdToConfig[chainId]);
};

export default setUpSdk;
