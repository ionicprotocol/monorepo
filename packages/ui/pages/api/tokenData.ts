import { JsonRpcProvider } from '@ethersproject/providers';
import { SupportedChainsArray } from '@midas-capital/sdk';
import axios from 'axios';
import { Contract, utils } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import Vibrant from 'node-vibrant';
import { erc20ABI } from 'wagmi';
import * as yup from 'yup';

import { CoinGeckoResponse, TokenDataResponse } from '@ui/types/ComponentPropsType';
import { providerURLForChain } from '@ui/utils/web3Providers';

const supportedNetworksRegex = new RegExp(SupportedChainsArray.join('|'));

const querySchema = yup.object().shape({
  chain: yup.string().matches(supportedNetworksRegex, 'Not a support Network').required(),
  address: yup
    .string()
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Not a valid Wallet address')
    .required(),
});

const handler = async (request: NextApiRequest, response: NextApiResponse<TokenDataResponse>) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Cache-Control', 'max-age=3600, s-maxage=3600');

  const { chain, address: rawAddress } = request.body;
  await querySchema.validate(request.body);
  const address = utils.getAddress(rawAddress);
  const tokenContract = new Contract(
    address,
    erc20ABI,
    new JsonRpcProvider(providerURLForChain(Number(chain)))
  );

  let basicTokenInfo: Partial<TokenDataResponse> = { address };
  basicTokenInfo.decimals = await tokenContract.callStatic.decimals().catch(() => 18);

  try {
    const cgData = await axios.get<CoinGeckoResponse>(
      'https://api.coingecko.com/api/v3/coins/ethereum/contract/' + address
    );

    basicTokenInfo = {
      ...basicTokenInfo,
      name: cgData.data.name,
      logoURL: cgData.data.image.small,
      symbol: cgData.data.symbol,
    };
  } catch {
    console.warn(`Unable to fetch token data from coingecko: ${address} on chain:${chain}`);
    try {
      const [name, symbol] = await Promise.all([
        tokenContract.callStatic.name().catch(() => undefined),
        tokenContract.callStatic.symbol(),
      ]);
      basicTokenInfo = {
        ...basicTokenInfo,
        name: name ? name : symbol,
        symbol,
      };
    } catch {
      console.warn(`Unable to fetch token data from contract: ${address} on chain:${chain}`);
    }
  }

  if (!basicTokenInfo.logoURL) {
    basicTokenInfo.logoURL = `https://d1912tcoux65lj.cloudfront.net/token/${basicTokenInfo.symbol?.toLowerCase()}.png`;
    basicTokenInfo.color = '#FFFFFF';
    basicTokenInfo.overlayTextColor = '#000000';
  } else {
    const color = await Vibrant.from(basicTokenInfo.logoURL).getPalette();
    if (color.Vibrant) {
      basicTokenInfo.color = color.Vibrant.getHex();
      basicTokenInfo.overlayTextColor = color.Vibrant.getTitleTextColor();
    }
  }

  response.json(basicTokenInfo as TokenDataResponse);
};

export default handler;
