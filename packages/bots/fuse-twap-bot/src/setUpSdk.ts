import { JsonRpcProvider } from "@ethersproject/providers";
import { MidasSdk } from "@midas-capital/sdk";

const setUpSdk = (chainId: number, provider: JsonRpcProvider) => {
  return new Fuse(provider, chainId);
};

export default setUpSdk;
