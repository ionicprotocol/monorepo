import { SupportedChains } from '@ionicprotocol/types';
import { createAssetTvlHandler } from '../controllers/asset-tvl';

export const handler = createAssetTvlHandler(SupportedChains.moonbeam);
