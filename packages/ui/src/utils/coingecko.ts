import axios from 'axios';
import { useQuery } from 'react-query';

interface CoinGeckoHistoricPriceResponse {
  market_data: {
    current_price: {
      usd: number;
    };
  };
}
interface CoinGeckoPriceResponse {
  [key: string]: {
    usd: number;
  };
}

export const fetchCoinGeckoPrice = (apiId: string, date?: string) => {
  return date
    ? axios
        .get<CoinGeckoHistoricPriceResponse>(
          `https://api.coingecko.com/api/v3/coins/${apiId}/history?date=${date}`
        )
        .then((response) => response.data.market_data.current_price.usd)
    : axios
        .get<CoinGeckoPriceResponse>(
          `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${apiId}`
        )
        .then((response) => {
          return response.data[apiId].usd;
        });
};

export const useCoinGeckoPrice = (apiId: string, date?: string) => {
  return useQuery(['CoinGeckoPrice', apiId, date], () => fetchCoinGeckoPrice(apiId, date));
};
