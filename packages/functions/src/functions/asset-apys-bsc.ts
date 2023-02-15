import { SupportedChains } from '@midas-capital/types';
import { createAssetApyHandler } from '../controllers/asset-apy';

export const handler = createAssetApyHandler(SupportedChains.bsc);
