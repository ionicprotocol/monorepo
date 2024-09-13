import { SupportedChains } from '@ionicprotocol/types';
import { createTotalTvlHandler } from '../controllers/total-tvl';

// Call the handler for multiple chains and export them as Netlify function handlers
export const handler = createTotalTvlHandler(SupportedChains.fraxtal);
 