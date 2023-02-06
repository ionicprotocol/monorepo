import { SupportedChains } from '@midas-capital/types';
import { createPluginRewardsHandler } from '../controllers/plugin-rewards';

export const handler = createPluginRewardsHandler(SupportedChains.bsc);
