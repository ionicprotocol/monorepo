import { JsonRpcProvider } from "@ethersproject/providers";
import { chainIdToConfig } from "@ionicprotocol/chains";
import { IonicSdk } from "@ionicprotocol/sdk";
import { Signer } from "ethers";

import { logger } from "../logger";

const setUpSdk = (chainId: number, provider: Signer | JsonRpcProvider) => {
  return new IonicSdk(provider, chainIdToConfig[chainId], logger);
};

export default setUpSdk;
