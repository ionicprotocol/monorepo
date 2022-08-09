import { JsonRpcProvider } from '@ethersproject/providers';
import {
  assetArrayToMap,
  ChainSupportedAssets as ChainSupportedAssetsType,
  SupportedChains,
} from '@midas-capital/types';
import { Contract, utils } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import { erc20ABI } from 'wagmi';
import * as yup from 'yup';

import { SUPPORTED_NETWORKS_REGEX } from '../../constants';

import { config } from '@ui/config/index';
import { TokenDataResponse } from '@ui/types/ComponentPropsType';
import { providerURLForChain } from '@ui/utils/web3Providers';

const ChainSupportedAssets: ChainSupportedAssetsType = {
  [SupportedChains.ganache]: [],
  [SupportedChains.evmos]: [],
  [SupportedChains.evmos_testnet]: [],
  [SupportedChains.bsc]: [],
  [SupportedChains.chapel]: [],
  [SupportedChains.moonbase_alpha]: [],
  [SupportedChains.moonbeam]: [],
  [SupportedChains.aurora]: [],
  [SupportedChains.neon_devnet]: [],
  [SupportedChains.polygon]: [],
};

const ChainSupportedAssetsMap: { [key in SupportedChains]?: ReturnType<typeof assetArrayToMap> } =
  Object.entries(ChainSupportedAssets).reduce((acc, [key, value]) => {
    acc[key] = assetArrayToMap(value);
    return acc;
  }, {});

const querySchema = yup.object().shape({
  chain: yup.string().matches(SUPPORTED_NETWORKS_REGEX, 'Not a supported Network').required(),
  address: yup
    .string()
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Not a valid Wallet address')
    .required(),
});

const handler = async (request: NextApiRequest, response: NextApiResponse<TokenDataResponse>) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Cache-Control', 'max-age=86400, s-maxage=86400');

  querySchema.validateSync(request.body);

  const { chain, address: rawAddress }: { chain: SupportedChains; address: string } = request.body;
  const address = utils.getAddress(rawAddress);
  const tokenContract = new Contract(
    address,
    erc20ABI,
    new JsonRpcProvider(providerURLForChain(Number(chain)))
  );

  let basicTokenInfo: Partial<TokenDataResponse> = { address };

  const hardcodedAsset = (ChainSupportedAssetsMap[chain] || {})[address];
  if (hardcodedAsset) {
    basicTokenInfo.address = hardcodedAsset.underlying;
    basicTokenInfo.symbol = hardcodedAsset.symbol;
    basicTokenInfo.decimals = hardcodedAsset.decimals;
    basicTokenInfo.name = hardcodedAsset.name;
  } else {
    try {
      const [name, symbol, decimals] = await Promise.all([
        tokenContract.callStatic.name().catch(() => undefined),
        tokenContract.callStatic.symbol(),
        tokenContract.callStatic.decimals().catch(() => 18),
      ]);
      basicTokenInfo = {
        ...basicTokenInfo,
        name: name ? name : symbol,
        symbol,
        decimals,
      };
    } catch {
      console.warn(`Unable to fetch token data from contract: ${address} on chain:${chain}`);
    }
  }

  if (!basicTokenInfo.logoURL) {
    if (basicTokenInfo.symbol) {
      basicTokenInfo.logoURL =
        config.iconServerURL + '/token/96x96/' + basicTokenInfo.symbol.toLowerCase() + '.png';
    }
  }

  response.json(basicTokenInfo as TokenDataResponse);
};

export default handler;
