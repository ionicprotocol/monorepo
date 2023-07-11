import { SupportedChains } from '@ionicprotocol/types';
import { functionsAlert } from '../../../alert';
import { AbstractAssetAPYProvider, APYProviderInitObject } from './AbstractAssetAPYProvider';
import MockAPYProvider from './MockAPYProvider';
import UniverseStaderlabsAPYProvider from './UniverseStaderlabsAPYProvider';

type ProviderMap = {
  [key: string]: AbstractAssetAPYProvider;
};

type ProviderMapForChain = Partial<{
  [key in SupportedChains]: ProviderMap;
}>;

const providerMap: ProviderMapForChain = {
  [SupportedChains.bsc]: {
    '0x1bdd3Cf7F79cfB8EdbB955f20ad99211551BA275': new MockAPYProvider(0.0592),
    '0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16': new MockAPYProvider(0.052),
  },
  [SupportedChains.polygon]: {
    '0xfa68FB4628DFF1028CFEc22b4162FCcd0d45efb6': UniverseStaderlabsAPYProvider,
  },
};

export async function getAPYProviders(
  chainId: SupportedChains,
  initObj: APYProviderInitObject
): Promise<ProviderMap> {
  const providersOfChain = providerMap[chainId];

  if (!providersOfChain) {
    console.info(`No APY Providers available for ${chainId}`);
    throw new Error(`No APY Providers available for ${chainId}`);
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
