import { chainIdToConfig } from "@ionicprotocol/chains";
import { IonicSdk } from "@ionicprotocol/sdk";
import { PublicClient, WalletClient } from "viem";

const setUpSdk = (chainId: number, publicClient: PublicClient, walletClient: WalletClient) => {
  return new IonicSdk(publicClient, walletClient, chainIdToConfig[chainId]);
};

export default setUpSdk;
