import { mode } from 'viem/chains';

export const getAssetName = (asset: string, chain: number): string =>
  asset === 'weETH' && chain === mode.id ? 'weETH (OLD)' : asset;
