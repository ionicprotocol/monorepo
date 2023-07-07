import { JsonRpcProvider } from "@ethersproject/providers";
import { bsc, chapel, evmos, ethereum, fantom, ganache, moonbeam, neondevnet, polygon } from "@ionicprotocol/chains";
import { MidasSdk } from "@ionicprotocol/sdk";
import { ChainConfig } from "@ionicprotocol/types";
import { Signer } from "ethers";

const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [polygon.chainId]: polygon,
  [moonbeam.chainId]: moonbeam,
  [neondevnet.chainId]: neondevnet,
  [chapel.chainId]: chapel,
  [ganache.chainId]: ganache,
  [evmos.chainId]: evmos,
  [fantom.chainId]: fantom,
  [ethereum.chainId]: ethereum,
};

const setUpSdk = (chainId: number, provider: Signer | JsonRpcProvider) => {
  return new MidasSdk(provider, chainIdToConfig[chainId]);
};

export default setUpSdk;
