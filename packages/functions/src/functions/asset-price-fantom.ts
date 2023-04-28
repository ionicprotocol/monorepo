import { SupportedChains } from '@midas-capital/types';
import { createAssetPriceHandler } from '../controllers/asset-price';

export const handler = createAssetPriceHandler(SupportedChains.fantom);
