import { Strategy } from '@midas-capital/types';
import { AbstractPluginAPYProvider, APYProviderInitObject } from './AbstractPluginAPYProvider';
import BeefyAPYProvider from './BeefyAPYProvider';
import CurveGaugeAPYProvider from './CurveGaugeAPYProvider';
import DotDotAPYProvider from './DotDotAPYProvider';
import MimoAPYProvider from './MimoAPYProvider';
import StellaSwapAPYProvider from './StellaSwapAPYProvider';

type ProviderMap = {
  [key in Strategy]?: AbstractPluginAPYProvider;
};

const providerMap: ProviderMap = {
  [Strategy.Beefy]: BeefyAPYProvider,
  [Strategy.Arrakis]: MimoAPYProvider,
  [Strategy.DotDot]: DotDotAPYProvider,
  [Strategy.CurveGauge]: CurveGaugeAPYProvider,
  [Strategy.Stella]: StellaSwapAPYProvider,
};

export async function getAPYProviders(initObj: APYProviderInitObject): Promise<ProviderMap> {
  await Promise.all(
    Object.values(providerMap).map((provider) =>
      provider.init(initObj).catch((error) => console.error(`Failed to init() provider: ${error}`))
    )
  );
  return providerMap;
}

export default getAPYProviders;
