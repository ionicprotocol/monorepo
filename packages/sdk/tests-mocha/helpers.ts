import { ChainConfig, LiquidationStrategy } from "@ionicprotocol/types";
import { Address, Hex, PublicClient, TransactionReceipt, WalletClient } from "viem";

/**
 * Creates an eth-address compatible string with given prefix
 *
 * @param prefix  - (optional) String prefix
 * @returns 24 byte string
 */
export const mkAddress = (prefix = "0x0"): Address => {
  return prefix.padEnd(42, "0") as Address;
};

/**
 * Creates a 32-byte hex string for tests
 *
 * @param prefix - (optional) Prefix of the hex string to pad
 * @returns 32-byte hex string
 */
export const mkBytes32 = (prefix = "0xa"): Hex => {
  return prefix.padEnd(66, "0") as Hex;
};

export const stubbedContract = { address: mkAddress(), abi: [], read: {}, write: {}, simulate: {}, estimateGas: {} };

export const stubbedWalletClient = {
  account: { address: mkAddress("0xabcd") },
  chain: 42069
} as unknown as WalletClient;

export const stubbedPublicClient = {} as unknown as PublicClient;

export const mockChainConfig: ChainConfig = {
  deployedPlugins: {},
  chainDeployments: {
    FeeDistributor: { abi: [], address: mkAddress("0xfcc") },
    IonicFlywheelLensRouter: { abi: [], address: mkAddress("0xabcdef") },
    PoolDirectory: { abi: [], address: mkAddress("0xacc") },
    PoolLens: { abi: [], address: mkAddress("0xbcc") },
    PoolLensSecondary: { abi: [], address: mkAddress("0xdcc") },
    IonicLiquidator: { abi: [], address: mkAddress("0xecc") },
    JumpRateModel: { abi: [], address: mkAddress("0xaac") },
    AddressesProvider: { abi: [], address: mkAddress("0xaad") }
  },
  oracles: [],
  liquidationDefaults: {
    DEFAULT_ROUTER: "",
    ASSET_SPECIFIC_ROUTER: {},
    SUPPORTED_OUTPUT_CURRENCIES: [],
    SUPPORTED_INPUT_CURRENCIES: [],
    LIQUIDATION_STRATEGY: LiquidationStrategy.DEFAULT,
    MINIMUM_PROFIT_NATIVE: 0n,
    LIQUIDATION_INTERVAL_SECONDS: 5,
    jarvisPools: [],
    balancerPools: []
  },
  assets: []
} as unknown as ChainConfig;

export const mockReceipt = {
  status: "success"
} as TransactionReceipt;
