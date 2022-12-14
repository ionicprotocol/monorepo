import { JsonRpcProvider } from "@ethersproject/providers";
import { bsc, chapel, evmos, fantom, ganache, moonbeam, neondevnet, polygon } from "@midas-capital/chains";
import { MidasSdk } from "@midas-capital/sdk";
import { ChainConfig } from "@midas-capital/types";
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
};

const setUpSdk = (chainId: number, provider: Signer | JsonRpcProvider) => {
  return new MidasSdk(provider, chainIdToConfig[chainId]);
};

export default setUpSdk;
