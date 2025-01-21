import { SupportedChains } from '@ionicprotocol/types';
import { createAssetMasterDataHandler } from '../controllers/asset-master-data';

export const handler = createAssetMasterDataHandler(SupportedChains.worldchain); 