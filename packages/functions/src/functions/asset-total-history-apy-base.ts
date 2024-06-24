import { SupportedChains } from '@ionicprotocol/types';
import { createAssetTotalApyHandler } from '../controllers/asset-total-history-apy';

export const handler = createAssetTotalApyHandler(SupportedChains.base);
