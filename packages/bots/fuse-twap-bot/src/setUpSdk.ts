import { JsonRpcProvider } from "@ethersproject/providers";
import { MidasSdk } from "@midas-capital/sdk";
import { FuseAsset } from "@midas-capital/typing";

const setUpSdk = (chainId: number, provider: JsonRpcProvider) => {
  console.log(FuseAsset);
  return new MidasSdk(provider, chainId);
};

export default setUpSdk;
