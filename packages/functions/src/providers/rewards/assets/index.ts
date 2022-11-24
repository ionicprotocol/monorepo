import { SupportedChains } from '@midas-capital/types';
import { AbstractAssetAPYProvider, APYProviderInitObject } from './AbstractAssetAPYProvider';
import LidoStakedDotAPYProvider from './LidoStakedDotAPYProvider';

type ProviderMap = {
  [key: string]: AbstractAssetAPYProvider;
};

type ProviderMapForChain = {
  [key in SupportedChains]?: ProviderMap;
};

const providerMap: ProviderMapForChain = {
  [SupportedChains.moonbeam]: {
    '0xFA36Fe1dA08C89eC72Ea1F0143a35bFd5DAea108': LidoStakedDotAPYProvider,
    '0x191cf2602Ca2e534c5Ccae7BCBF4C46a704bb949': LidoStakedDotAPYProvider,
  },
};

export async function getAPYProviders(
  chainId: SupportedChains,
  initObj: APYProviderInitObject
): Promise<ProviderMap> {
  const providersOfChain = providerMap[chainId];

  if (!providersOfChain) {
    throw new Error(`No APY Providers available for ${chainId}`);
  }

  await Promise.all(
    Object.values(providersOfChain).map((provider) =>
      provider.init(initObj).catch((error) => console.error(`Failed to init() provider: ${error}`))
    )
  );

  return providersOfChain;
}

export default getAPYProviders;
