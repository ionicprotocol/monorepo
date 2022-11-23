import { AbstractAssetAPYProvider, APYProviderInitObject } from './AbstractAssetAPYProvider';
import StakedDotAPYProvider from './StakedDotAPYProvider';

type ProviderMap = {
  [key: string]: AbstractAssetAPYProvider;
};

const providerMap: ProviderMap = {
  '0xFA36Fe1dA08C89eC72Ea1F0143a35bFd5DAea108': StakedDotAPYProvider,
  '0x191cf2602Ca2e534c5Ccae7BCBF4C46a704bb949': StakedDotAPYProvider,
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
