import { SupportedChains } from '@ionicprotocol/types';
import { createAssetApyHandler } from '../controllers/asset-apy';

export const handler = createAssetApyHandler(SupportedChains.moonbeam);
