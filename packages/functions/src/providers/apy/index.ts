import { Strategy } from '@midas-capital/types';
import BeefyAPYProvider from './BeefyAPYProvider';
import { ExternalAPYProvider } from './ExternalAPYProvider';

const providerMap: {
  [key in Strategy]?: ExternalAPYProvider;
} = {
  [Strategy.Beefy]: BeefyAPYProvider,
};

export default providerMap;
