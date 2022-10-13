import { Strategy } from '@midas-capital/types';
import BeefyAPYProvider from './BeefyAPYProvider';

export default {
  [Strategy.Beefy]: BeefyAPYProvider,
};
