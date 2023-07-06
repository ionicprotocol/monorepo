import { SupportedChains } from '@ionicprotocol/types';
import { createAssetTotalApyHandler } from '../controllers/asset-total-apy';

export const handler = createAssetTotalApyHandler(SupportedChains.fantom);
