import { JsonRpcProvider } from "@ethersproject/providers";
import { chainIdToConfig } from "@ionicprotocol/chains";
import { MidasSdk } from "@ionicprotocol/sdk";
import { Signer } from "ethers";

const setUpSdk = (chainId: number, provider: Signer | JsonRpcProvider) => {
  return new MidasSdk(provider, chainIdToConfig[chainId]);
};

export default setUpSdk;
