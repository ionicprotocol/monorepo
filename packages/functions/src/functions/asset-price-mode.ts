import { SupportedChains } from '@ionicprotocol/types';
import { createAssetPriceHandler } from '../controllers/asset-price';

export const handler = createAssetPriceHandler(SupportedChains.mode);
