import { SupportedChains } from '@ionicprotocol/types';
import { createInterestModelHandler } from '../controllers/interest-rates';

export const handler = createInterestModelHandler(SupportedChains.lisk);
