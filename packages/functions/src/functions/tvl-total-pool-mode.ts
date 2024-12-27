import { SupportedChains } from '@ionicprotocol/types';
import { createTotalTvlPoolHandler } from '../controllers/tvl_total_pool';

// Call the handler for multiple chains and export them as Netlify function handlers
export const handler = createTotalTvlPoolHandler(SupportedChains.mode);
