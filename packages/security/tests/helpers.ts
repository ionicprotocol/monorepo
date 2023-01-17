import { JsonRpcProvider } from "@ethersproject/providers";
import { chainIdToConfig } from "@midas-capital/chains";
import { SupportedChains } from "@midas-capital/types";

/**
 * Creates an eth-address compatible string with given prefix
 *
 * @param prefix  - (optional) String prefix
 * @returns 24 byte string
 */
export const mkAddress = (prefix = "0x0"): string => {
  return prefix.padEnd(42, "0");
};

/**
 * Creates a 32-byte hex string for tests
 *
 * @param prefix - (optional) Prefix of the hex string to pad
 * @returns 32-byte hex string
 */
export const mkBytes32 = (prefix = "0xa"): string => {
  return prefix.padEnd(66, "0");
};

export const getProvider = (chainId: SupportedChains): JsonRpcProvider => {
  const { specificParams } = chainIdToConfig[chainId];
  const providerUrl = process.env.ETH_PROVIDER_URL || specificParams.metadata.rpcUrls.default.http[0];
  return new JsonRpcProvider(providerUrl);
};
