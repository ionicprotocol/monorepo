import { SupportedChains } from '@ionicprotocol/types';
import { createPluginRewardsHandler } from '../controllers/plugin-rewards';

export const handler = createPluginRewardsHandler(SupportedChains.polygon);
