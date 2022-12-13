import { bsc, chapel, polygon } from '@midas-capital/chains';
import { assetSymbols, SupportedAsset, SupportedChains } from '@midas-capital/types';
import dotenv from 'dotenv';

import { BASE_URL, FORKED_RPC } from '@ui/test/constants/index';

dotenv.config();

const testChainId = process.env.TEST_CHAIN_ID;

export type FundOperationConfig = {
  supplyAmount: string;
  borrowAmount: string;
  repayAmount: string;
  withdrawAmount: string;
  assetSymbol: string;
  asset: SupportedAsset | undefined;
  testUrl: string;
};

export type InitConfig = {
  chainId: number;
  networkName: string;
  symbol: string;
  rpc: string;
};

export type CreatePoolConfig = {
  name: string;
  oracle: string;
  closeFactor: string;
  liquidationIncentive: string;
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
          rpc: chapel.specificParams.metadata.rpcUrls.default.http[0],
        };
      case SupportedChains.bsc:
        return {
          chainId: SupportedChains.bsc,
          networkName: 'ForkedBSC',
          symbol: 'FORK',
          rpc: FORKED_RPC,
        };
      case SupportedChains.polygon:
        return {
          chainId: SupportedChains.polygon,
          networkName: 'ForkedPolygon',
          symbol: 'MATIC',
          rpc: FORKED_RPC,
        };
      default:
        return {
          chainId: SupportedChains.chapel,
          networkName: 'chapel',
          symbol: 'BNB',
          rpc: chapel.specificParams.metadata.rpcUrls.default.http[0],
        };
    }
  }
  public static fundOperation(): FundOperationConfig {
    switch (Number(testChainId)) {
      case SupportedChains.chapel:
        return {
          supplyAmount: '5',
          borrowAmount: '2',
          repayAmount: '1',
          withdrawAmount: '3',
          assetSymbol: assetSymbols.WBNB,
          asset: chapel.assets.find((asset) => asset.symbol === assetSymbols.WBNB),
          testUrl: `${BASE_URL}/97/pool/25`,
        };
      case SupportedChains.bsc:
        return {
          supplyAmount: '5',
          borrowAmount: '2',
          repayAmount: '1',
          withdrawAmount: '3',
          assetSymbol: assetSymbols.WBNB,
          asset: bsc.assets.find((asset) => asset.symbol === assetSymbols.WBNB),
          testUrl: `${BASE_URL}/56/pool/1`, // Jarvis pool
        };
      case SupportedChains.polygon:
        return {
          supplyAmount: '5',
          borrowAmount: '2',
          repayAmount: '1',
          withdrawAmount: '3',
          assetSymbol: assetSymbols.WMATIC,
          asset: polygon.assets.find((asset) => asset.symbol === assetSymbols.WMATIC),
          testUrl: `${BASE_URL}/137/pool/1`,
        };
      // use chapel as default
      default:
        return {
          supplyAmount: '5',
          borrowAmount: '2',
          repayAmount: '1',
          withdrawAmount: '3',
          assetSymbol: assetSymbols.WBNB,
          asset: chapel.assets.find((asset) => asset.symbol === assetSymbols.WBNB),
          testUrl: `${BASE_URL}/97/pool/25`,
        };
    }
  }
  public static createPool(): CreatePoolConfig {
    return {
      name: 'e2e testing',
      oracle: '0xB641c21124546e1c979b4C1EbF13aB00D43Ee8eA',
      closeFactor: '50',
      liquidationIncentive: '8',
      testUrl: `${BASE_URL}/create-pool`,
    };
  }
}
