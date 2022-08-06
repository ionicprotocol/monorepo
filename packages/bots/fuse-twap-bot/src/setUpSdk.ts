import { JsonRpcProvider } from "@ethersproject/providers";
import { MidasSdk } from "@midas-capital/sdk";

const setUpSdk = (chainId: number, provider: JsonRpcProvider) => {
  return new MidasSdk(provider, chainId);
};

export default setUpSdk;
