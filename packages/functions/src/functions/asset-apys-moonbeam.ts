import { SupportedChains } from '@midas-capital/types';
import { createHandler } from './asset-apys';

export const handler = createHandler(SupportedChains.moonbeam);
