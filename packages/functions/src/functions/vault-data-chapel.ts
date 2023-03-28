import { SupportedChains } from '@midas-capital/types';
import { createVaultDataHandler } from '../controllers/vault-data';

export const handler = createVaultDataHandler(SupportedChains.chapel);
