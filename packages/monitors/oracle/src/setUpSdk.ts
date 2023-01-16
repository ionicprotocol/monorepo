import { JsonRpcProvider } from "@ethersproject/providers";
import { chainIdToConfig } from "@midas-capital/chains";
import { MidasSdk } from "@midas-capital/sdk";
import { Signer } from "ethers";

const setUpSdk = (chainId: number, provider: Signer | JsonRpcProvider) => {
  return new MidasSdk(provider, chainIdToConfig[chainId]);
};

export default setUpSdk;
