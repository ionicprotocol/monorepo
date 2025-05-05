import { SupportedChains } from '@ionicprotocol/types';
import { createAssetPriceAndRatesHandler } from '../controllers/asset-price-and-rates';

export const handler = createAssetPriceAndRatesHandler(SupportedChains.mode);
