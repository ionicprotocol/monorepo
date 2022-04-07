import { JsonRpcProvider } from '@ethersproject/providers';
import ERC20ABI from '@midas-capital/sdk/dist/cjs/src/Fuse/abi/ERC20.json';
import axios from 'axios';
import { Contract, utils } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import Vibrant from 'node-vibrant';
import { Palette } from 'node-vibrant/lib/color';
import * as yup from 'yup';

import { providerURLForChain } from '@utils/web3Providers';

const supportedNetworks = new RegExp([1, 56, 97, 1337].join('|'));

const querySchema = yup.object().shape({
  chain: yup
    .string()
    .matches(supportedNetworks, 'Not a valid Deep Sky Network token ID')
    .required(),
  address: yup
    .string()
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Not a valid Wallet address')
    .required(),
});

interface CoinGeckoResponse {
  decimals: number;
  name: string;
  symbol: string;
  image: {
    large: string;
    small: string;
    thumb: string;
  };
}

interface TokenDataResponse {
  address: string;
  color: string;
  decimals: number;
  logoURL?: string;
  name: string;
  overlayTextColor: string;
  symbol: string;
}

const handler = async (request: NextApiRequest, response: NextApiResponse<TokenDataResponse>) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Cache-Control', 'max-age=3600, s-maxage=3600');
  const { chain } = request.body;
  await querySchema.validate(request.body);
  const address = utils.getAddress(request.body.address as string);
  const tokenContract = new Contract(
    address,
    ERC20ABI,
    new JsonRpcProvider(providerURLForChain(Number(chain)))
  );
  const [decimals, rawData] = await Promise.all([
    tokenContract.decimals().then((res: string) => parseFloat(res)),
    // TODO queries CoinGecko ethereum api, might not work for other networks
    // also this endpoint does not seem to be document here at least: https://www.coingecko.com/en/api/documentation
    axios
      .get<CoinGeckoResponse>('https://api.coingecko.com/api/v3/coins/ethereum/contract/' + address)
      .catch(() => null),
  ]);
  let name: string;
  let symbol: string;
  let logoURL: string | undefined;

  if (!rawData) {
    name = await tokenContract.name();
    symbol = await tokenContract.symbol();
  } else {
    const {
      symbol: _symbol,
      name: _name,
      image: { small },
    } = rawData.data;

    symbol = _symbol == _symbol.toLowerCase() ? _symbol.toUpperCase() : _symbol;
    name = _name;
    logoURL = small;
  }

  const basicTokenInfo = {
    symbol,
    name,
    decimals,
  };

  let color: Palette;
  try {
    if (logoURL == undefined) {
      // If we have no logo no need to try to get the color
      // just go to the catch block and return the default logo.
      throw 'Go to the catch block';
    }

    color = await Vibrant.from(logoURL).getPalette();
  } catch (error) {
    response.json({
      ...basicTokenInfo,
      color: '#FFFFFF',
      overlayTextColor: '#000',
      logoURL: '',
      address,
    });

    return;
  }

  if (!color.Vibrant) {
    response.json({
      ...basicTokenInfo,
      color: '#FFFFFF',
      overlayTextColor: '#000',
      logoURL,
      address,
    });

    return;
  }

  response.json({
    ...basicTokenInfo,
    color: color.Vibrant.getHex(),
    overlayTextColor: color.Vibrant.getTitleTextColor(),
    logoURL,
    address,
  });
};

export default handler;
