import { SupportedChains } from '@midas-capital/types';
import { createAssetTotalApyHandler } from '../controllers/asset-total-apy';

export const handler = createAssetTotalApyHandler(SupportedChains.polygon);
