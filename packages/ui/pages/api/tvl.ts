import { JsonRpcProvider } from '@ethersproject/providers';
import * as ChainConfigs from '@midas-capital/chains';
import { MidasSdk } from '@midas-capital/sdk';
import { SupportedChains } from '@midas-capital/types';
import axios from 'axios';
import { utils } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import * as yup from 'yup';

import { SUPPORTED_NETWORKS_REGEX } from '@ui/constants/index';
import { chainIdToConfig } from '@ui/types/ChainMetaData';

const querySchema = yup.object().shape({
  chains: yup
    .array()
    .of(yup.string().matches(SUPPORTED_NETWORKS_REGEX, 'Not a supported Network').required()),
});

export type PricePerChain = {
  [chainId: string]: {
    price: number;
    symbol: string;
  };
};

interface CrossChainTVL {
  [chainId: string]: {
    value: number;
    symbol: string;
    name: string;
    logo: string;
  };
}

const handler = async (
  request: NextApiRequest,
  response: NextApiResponse<{ chainTVLs: CrossChainTVL } | { error: Error }>
) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Cache-Control', 'max-age=86400, s-maxage=86400');

  querySchema.validateSync(request.body);

  const { chains }: { chains: SupportedChains[] } = request.body;
  try {
    const chainConfigs = Object.values(ChainConfigs);
    const cgIds = chains.map((chainId) => {
      const chainConfig = chainConfigs.find((config) => config.chainId === Number(chainId));
      if (chainConfig) {
        return chainConfig.specificParams.cgId;
      }
    });

    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${cgIds.join(',')}`
    );

    const prices: PricePerChain = {};
    chains.map((chainId) => {
      const chainConfig = chainConfigs.find((config) => config.chainId === Number(chainId));
      if (chainConfig) {
        const cgId = chainConfig.specificParams.cgId;
        const price = data[cgId].usd
          ? data[cgId].usd
          : cgId === ChainConfigs.neondevnet.specificParams.cgId
          ? 0.05
          : 1;
        const symbol = chainConfig.specificParams.metadata.nativeCurrency.symbol;
        prices[chainId.toString()] = { price, symbol };
      }
    });

    const sdks = chains.map((id) => {
      const config = chainIdToConfig[id];

      return new MidasSdk(
        new JsonRpcProvider(config.specificParams.metadata.rpcUrls.default),
        config
      );
    });

    const chainTVLs: CrossChainTVL = {};

    await Promise.all(
      sdks.map(async (sdk) => {
        const tvlNative = await sdk.getTotalValueLocked(false);
        const decimals = sdk.chainSpecificParams.metadata.wrappedNativeCurrency.decimals;
        const tvlNum = Number(utils.formatUnits(tvlNative, decimals));

        chainTVLs[sdk.chainId.toString()] = {
          value: tvlNum * prices[sdk.chainId.toString()].price,
          symbol: prices[sdk.chainId.toString()].symbol,
          name: sdk.chainSpecificParams.metadata.name,
          logo: sdk.chainSpecificParams.metadata.img,
        };
      })
    );

    response.json({ chainTVLs });
  } catch (e) {
    console.error(e);
    response.json({ error: e as Error });
  }
};

export default handler;
