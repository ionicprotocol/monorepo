import { SupportedChains } from '@midas-capital/types';
import { createHandler } from './plugin-rewards';

export const handler = createHandler(SupportedChains.bsc);
