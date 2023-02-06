import { Strategy } from '@midas-capital/types';
import { AbstractPluginAPYProvider, APYProviderInitObject } from './AbstractPluginAPYProvider';
import BeefyAPYProvider from './BeefyAPYProvider';
import CurveGaugeAPYProvider from './CurveGaugeAPYProvider';
import DotDotAPYProvider from './DotDotAPYProvider';
import MimoAPYProvider from './MimoAPYProvider';
import StellaSwapAPYProvider from './StellaSwapAPYProvider';
import { functionsAlert } from '../../../alert';

type ProviderMap = Partial<{
  [key in Strategy]: AbstractPluginAPYProvider;
}>;

const providerMap: ProviderMap = {
  [Strategy.Beefy]: BeefyAPYProvider,
  [Strategy.Arrakis]: MimoAPYProvider,
  [Strategy.DotDot]: DotDotAPYProvider,
  [Strategy.CurveGauge]: CurveGaugeAPYProvider,
  [Strategy.Stella]: StellaSwapAPYProvider,
};

export async function getAPYProviders(initObj: APYProviderInitObject): Promise<ProviderMap> {
  await Promise.all(
    Object.entries(providerMap).map(([key, provider]) =>
      provider.init(initObj).catch((exception) => {
        functionsAlert(`Failed to init() provider: ${key}`, exception.message);
        delete providerMap[key as Strategy];
      })
    )
  );
  return providerMap;
}

export default getAPYProviders;
