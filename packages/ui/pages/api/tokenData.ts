import { JsonRpcProvider } from '@ethersproject/providers';
import type { SupportedChains } from '@ionicprotocol/types';
import { Contract, utils } from 'ethers';
import type { NextApiRequest, NextApiResponse } from 'next';
import { erc20ABI } from 'wagmi';
import * as yup from 'yup';

import { config } from '@ui/config/index';
import { SUPPORTED_NETWORKS_REGEX } from '@ui/constants/index';
import type { TokenDataResponse } from '@ui/types/ComponentPropsType';
import { providerURLForChain } from '@ui/utils/web3Providers';

const querySchema = yup.object().shape({
  addresses: yup.array().of(
    yup
      .string()
      .matches(/^0x[a-fA-F0-9]{40}$/, 'Not a valid Wallet address')
      .required()
  ),
  chain: yup.string().matches(SUPPORTED_NETWORKS_REGEX, 'Not a supported Network').required()
});

const handler = async (request: NextApiRequest, response: NextApiResponse<TokenDataResponse[]>) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Cache-Control', 'max-age=86400, s-maxage=86400');

  querySchema.validateSync(request.body);

  const { chain, addresses: rawAddresses }: { addresses: string[]; chain: SupportedChains } =
    request.body;
  const addresses = rawAddresses.map((addr) => {
    return utils.getAddress(addr);
  });
  const tokenContracts = addresses.map((addr) => {
    return new Contract(addr, erc20ABI, new JsonRpcProvider(providerURLForChain(Number(chain))));
  });

  const basicTokenInfos: Partial<TokenDataResponse>[] = [];

  try {
    const res = await Promise.all(
      tokenContracts.map((contract) =>
        Promise.all([
          contract.callStatic.name().catch(() => undefined),
          contract.callStatic.symbol(),
          contract.callStatic.decimals().catch(() => 18)
        ])
      )
    );

    res.map((data, i) => {
      basicTokenInfos.push({
        address: addresses[i],
        decimals: data[2],
        logoURL: data[1]
          ? config.iconServerURL + '/token/96x96/' + data[1].toLowerCase() + '.png'
          : undefined,
        name: data[0] || data[1] || 'Undefined',
        symbol: data[1] || data[0] || 'Undefined'
      });
    });
  } catch {
    console.warn(`Unable to fetch token data from contract: ${addresses} on chain:${chain}`);
  }

  response.json(basicTokenInfos as TokenDataResponse[]);
};

export default handler;
