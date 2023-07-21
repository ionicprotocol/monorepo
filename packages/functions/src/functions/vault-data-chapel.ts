import { SupportedChains } from '@ionicprotocol/types';
import { createVaultDataHandler } from '../controllers/vault-data';

export const handler = createVaultDataHandler(SupportedChains.chapel);
