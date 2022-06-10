export type BlockExplorer = {
  name: string;
  url: string;
};

export interface ChainMetadata {
  chainId: number;
  chainIdHex: string;
  shortName: string;
  name: string;
  img: string;
  enabled: boolean;
  supported: boolean;
  blocksPerMin: number;
  rpcUrls: { [key: string]: string; default: string };
  blockExplorerUrls: {
    [key: string]: BlockExplorer;
    default: BlockExplorer;
  };
  nativeCurrency: {
    symbol: string;
    name: string;
  };
  wrappedNativeCurrency: {
    symbol: string;
    address: string;
    name: string;
    decimals: number;
    color: string;
    overlayTextColor: string;
    logoURL: string;
    coingeckoId: string;
  };
  testnet?: boolean | undefined;
}
