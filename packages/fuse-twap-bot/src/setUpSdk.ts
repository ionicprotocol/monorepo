import { JsonRpcProvider } from "@ethersproject/providers";
import { Fuse } from "@midas-capital/sdk";

const setUpSdk = (chainId: number, provider: JsonRpcProvider) => {
  return new Fuse(provider, chainId);
};

export default setUpSdk;
