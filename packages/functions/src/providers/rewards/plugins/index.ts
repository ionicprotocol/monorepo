import { Strategy } from '@midas-capital/types';
import { AbstractPluginAPYProvider, APYProviderInitObject } from './AbstractPluginAPYProvider';
import BeefyAPYProvider from './BeefyAPYProvider';
import CurveGaugeAPYProvider from './CurveGaugeAPYProvider';
import DotDotAPYProvider from './DotDotAPYProvider';
import HelioAPYProvider from './HelioAPYProvider';
import MimoAPYProvider from './MimoAPYProvider';
import StellaSwapAPYProvider from './StellaSwapAPYProvider';
import ThenaAPYProvider from './ThenaAPYProvider';

type ProviderMap = Partial<{
  [key in Strategy]: AbstractPluginAPYProvider;
}>;

const providerMap: ProviderMap = {
  [Strategy.Beefy]: BeefyAPYProvider,
  [Strategy.Arrakis]: MimoAPYProvider,
  [Strategy.DotDot]: DotDotAPYProvider,
  [Strategy.CurveGauge]: CurveGaugeAPYProvider,
  [Strategy.HelioHAY]: HelioAPYProvider,
  [Strategy.Stella]: StellaSwapAPYProvider,
  [Strategy.ThenaERC4626]: ThenaAPYProvider,
};

export async function getAPYProviders(initObj: APYProviderInitObject): Promise<ProviderMap> {
  await Promise.all(
    Object.entries(providerMap).map(([key, provider]) =>
      provider.init(initObj).catch((exception) => {
        console.info(
          `Unable to init() provider: ${key} for chain ${initObj.chainId}`,
          exception.message || exception
        );
        delete providerMap[key as Strategy];
      })
    )
  );
  return providerMap;
}

export default getAPYProviders;
