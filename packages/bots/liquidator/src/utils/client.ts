import { Chain, createPublicClient, fallback, http, PublicClientConfig } from "viem";

export function createIonicPublicClient(chain: Chain, rpcUrls: string[]) {
  const config: PublicClientConfig = {
    chain,
    transport: fallback(rpcUrls.map((url) => http(url))),
    batch: { multicall: { wait: 16 } },
    cacheTime: 4_000,
    pollingInterval: 4_000,
  };

  return createPublicClient(config);
}
