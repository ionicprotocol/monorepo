import { SupportedChains } from '@ionicprotocol/types';
import { createAssetTotalApyHandler } from '../controllers/asset-total-apy-history';

export const handler = createAssetTotalApyHandler(SupportedChains.mode);
