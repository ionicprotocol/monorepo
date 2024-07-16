import { SupportedChains } from '@ionicprotocol/types';
import { functionsAlert } from '../../../alert';
import { AbstractAssetAPYProvider, APYProviderInitObject } from './AbstractAssetAPYProvider';

type ProviderMap = {
  [key: string]: AbstractAssetAPYProvider;
};

type ProviderMapForChain = Partial<{
  [key in SupportedChains]: ProviderMap;
}>;

const providerMap: ProviderMapForChain = {};

export async function getAPYProviders(
  chainId: SupportedChains,
  initObj: APYProviderInitObject
): Promise<ProviderMap | ''>  {
  const providersOfChain = providerMap[chainId];

  if (!providersOfChain) {
    console.info(`No APY Providers available for ${chainId}`);
    return {};
  }

  await Promise.all(
    Object.entries(providersOfChain).map(([key, provider]) =>
      provider.init(initObj).catch((error) => {
        functionsAlert(
          `Failed to init Asset APY provider`,
          `asset ${key} on chain: ${chainId}, ${error.message || error}`
        );
        console.error(
          `Failed to init() provider for asset ${key} on chain: ${chainId} ${
            error.message || error
          }`
        );
      })
    )
  );

  return providersOfChain;
}

export default getAPYProviders;
