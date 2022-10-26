import { Strategy } from '@midas-capital/types';
import { AbstractAPYProvider } from './AbstractAPYProvider';
import BeefyAPYProvider from './BeefyAPYProvider';
import DotDotAPYProvider from './DotDotAPYProvider';
import MimoAPYProvider from './MimoAPYProvider';

type ProviderMap = {
  [key in Strategy]?: AbstractAPYProvider;
};

const providerMap: ProviderMap = {
  [Strategy.Beefy]: BeefyAPYProvider,
  [Strategy.Mimo]: MimoAPYProvider,
  [Strategy.DotDot]: DotDotAPYProvider,
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
