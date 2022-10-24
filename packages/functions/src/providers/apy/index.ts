import { Strategy } from '@midas-capital/types';
import BeefyAPYProvider from './BeefyAPYProvider';
import { ExternalAPYProvider } from './ExternalAPYProvider';
import MimoAPYProvider from './MimoAPYProvider';

type ProviderMap = {
  [key in Strategy]?: ExternalAPYProvider;
};

const providerMap: ProviderMap = {
  [Strategy.Beefy]: BeefyAPYProvider,
  [Strategy.Mimo]: MimoAPYProvider,
};

export async function getAPYProviders(): Promise<ProviderMap> {
  await Promise.all(
    Object.values(providerMap).map((provider) =>
      provider.init().catch((error) => console.error(`Failed to init() provider: ${error}`))
    )
  );
  return providerMap;
}

export default getAPYProviders;
