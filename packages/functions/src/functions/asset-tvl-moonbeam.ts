import { SupportedChains } from '@midas-capital/types';
import { createAssetTvlHandler } from '../controllers/asset-tvl';

export const handler = createAssetTvlHandler(SupportedChains.moonbeam);
