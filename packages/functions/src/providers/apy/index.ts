import { Strategy } from '@midas-capital/types';
import BeefyAPYProvider from './BeefyAPYProvider';
import { ExternalAPYProvider } from './ExternalAPYProvider';

type ProviderMap = {
  [key in Strategy]?: ExternalAPYProvider;
};

const providerMap: ProviderMap = {
  [Strategy.Beefy]: BeefyAPYProvider,
};

export async function getAPYProviders(): Promise<ProviderMap> {
  await Promise.all(
    Object.values(providerMap).map((provider) =>
      provider.init().catch((error) => `Failed to init() provider: ${error}`)
    )
  );
  return providerMap;
}

export default getAPYProviders;
