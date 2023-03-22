import { bsc, chapel, polygon } from '@midas-capital/chains';
import type { SupportedAsset } from '@midas-capital/types';
import { assetSymbols, SupportedChains } from '@midas-capital/types';
import dotenv from 'dotenv';

import { BASE_URL, FORKED_RPC } from '@ui/test/constants/index';

dotenv.config();

const testChainId = process.env.TEST_CHAIN_ID;

export type FundOperationConfig = {
  asset: SupportedAsset | undefined;
  assetSymbol: string;
  borrowAmount: string;
  repayAmount: string;
  supplyAmount: string;
  testUrl: string;
  withdrawAmount: string;
};

export type InitConfig = {
  chainId: number;
  networkName: string;
  rpc: string;
  symbol: string;
};

export type CreatePoolConfig = {
  closeFactor: string;
  liquidationIncentive: string;
  name: string;
  oracle: string;
  testUrl: string;
};

export class Config {
  public static init(): InitConfig {
    switch (Number(testChainId)) {
      case SupportedChains.chapel:
        return {
          chainId: SupportedChains.chapel,
          networkName: 'chapel',
          rpc: chapel.specificParams.metadata.rpcUrls.default.http[0],
          symbol: 'BNB',
        };
      case SupportedChains.bsc:
        return {
          chainId: SupportedChains.bsc,
          networkName: 'ForkedBSC',
          rpc: FORKED_RPC,
          symbol: 'FORK',
        };
      case SupportedChains.polygon:
        return {
          chainId: SupportedChains.polygon,
          networkName: 'ForkedPolygon',
          rpc: FORKED_RPC,
          symbol: 'MATIC',
        };
      default:
        return {
          chainId: SupportedChains.chapel,
          networkName: 'chapel',
          rpc: chapel.specificParams.metadata.rpcUrls.default.http[0],
          symbol: 'BNB',
        };
    }
  }
  public static fundOperation(): FundOperationConfig {
    switch (Number(testChainId)) {
      case SupportedChains.chapel:
        return {
          asset: chapel.assets.find((asset) => asset.symbol === assetSymbols.WBNB),
          assetSymbol: assetSymbols.WBNB,
          borrowAmount: '2',
          repayAmount: '1',
          supplyAmount: '5',
          testUrl: `${BASE_URL}/97/pool/25`,
          withdrawAmount: '3',
        };
      case SupportedChains.bsc:
        return {
          asset: bsc.assets.find((asset) => asset.symbol === assetSymbols.WBNB),
          assetSymbol: assetSymbols.WBNB,
          borrowAmount: '2',
          repayAmount: '1',
          supplyAmount: '5',
          testUrl: `${BASE_URL}/56/pool/1`, // Jarvis pool
          withdrawAmount: '3',
        };
      case SupportedChains.polygon:
        return {
          asset: polygon.assets.find((asset) => asset.symbol === assetSymbols.WMATIC),
          assetSymbol: assetSymbols.WMATIC,
          borrowAmount: '2',
          repayAmount: '1',
          supplyAmount: '5',
          testUrl: `${BASE_URL}/137/pool/1`,
          withdrawAmount: '3',
        };
      // use chapel as default
      default:
        return {
          asset: chapel.assets.find((asset) => asset.symbol === assetSymbols.WBNB),
          assetSymbol: assetSymbols.WBNB,
          borrowAmount: '2',
          repayAmount: '1',
          supplyAmount: '5',
          testUrl: `${BASE_URL}/97/pool/25`,
          withdrawAmount: '3',
        };
    }
  }
  public static createPool(): CreatePoolConfig {
    return {
      closeFactor: '50',
      liquidationIncentive: '8',
      name: 'e2e testing',
      oracle: '0xB641c21124546e1c979b4C1EbF13aB00D43Ee8eA',
      testUrl: `${BASE_URL}/create-pool`,
    };
  }
}
