import { Strategy } from '@ionicprotocol/types';
import { AbstractPluginAPYProvider, APYProviderInitObject } from './AbstractPluginAPYProvider';

type ProviderMap = Partial<{
  [key in Strategy]: AbstractPluginAPYProvider;
}>;

const providerMap: ProviderMap = {};

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
