import { bsc, chapel, polygon } from '@midas-capital/chains';
import { assetSymbols, SupportedAsset, SupportedChains } from '@midas-capital/types';
import dotenv from 'dotenv';

import { BASE_URL, DEFAULT_AMOUNT, FORKED_RPC } from '@ui/test/constants/index';

dotenv.config();

const testChainId = process.env.TEST_CHAIN_ID;

export type FundOperationConfig = {
  supplyAmount: string;
  assetSymbol: string;
  asset: SupportedAsset | undefined;
};

export type InitConfig = {
  chainId: number;
  networkName: string;
  symbol: string;
  rpc: string;
  testUrl: string;
};

export class Config {
  public static init(): InitConfig {
    switch (Number(testChainId)) {
      case SupportedChains.chapel:
        return {
          chainId: SupportedChains.chapel,
          networkName: 'chapel',
          symbol: 'BNB',
          rpc: chapel.specificParams.metadata.rpcUrls.default,
          testUrl: `${BASE_URL}/97/pool/25`,
        };
      case SupportedChains.bsc:
        return {
          chainId: SupportedChains.bsc,
          networkName: 'ForkedBSC',
          symbol: 'FORK',
          rpc: FORKED_RPC,
          testUrl: `${BASE_URL}/56/pool/1`, // Jarvis pool
        };
      case SupportedChains.polygon:
        return {
          chainId: SupportedChains.polygon,
          networkName: 'ForkedPolygon',
          symbol: 'MATIC',
          rpc: FORKED_RPC,
          testUrl: `${BASE_URL}/137/pool/1`,
        };
      default:
        return {
          chainId: SupportedChains.chapel,
          networkName: 'chapel',
          symbol: 'BNB',
          rpc: chapel.specificParams.metadata.rpcUrls.default,
          testUrl: `${BASE_URL}/97/pool/25`,
        };
    }
  }
  public static fundOperation(): FundOperationConfig {
    switch (Number(testChainId)) {
      case SupportedChains.chapel:
        return {
          supplyAmount: DEFAULT_AMOUNT,
          assetSymbol: assetSymbols.WBNB,
          asset: chapel.assets.find((asset) => asset.symbol === assetSymbols.WBNB),
        };
      case SupportedChains.bsc:
        return {
          supplyAmount: DEFAULT_AMOUNT,
          assetSymbol: assetSymbols.WBNB,
          asset: bsc.assets.find((asset) => asset.symbol === assetSymbols.WBNB),
        };
      case SupportedChains.polygon:
        return {
          supplyAmount: DEFAULT_AMOUNT,
          assetSymbol: assetSymbols.WMATIC,
          asset: polygon.assets.find((asset) => asset.symbol === assetSymbols.WMATIC),
        };
      // use chapel as default
      default:
        return {
          supplyAmount: DEFAULT_AMOUNT,
          assetSymbol: assetSymbols.WBNB,
          asset: chapel.assets.find((asset) => asset.symbol === assetSymbols.WBNB),
        };
    }
  }
}
