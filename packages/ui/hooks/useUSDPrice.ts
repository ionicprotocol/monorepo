import axios from 'axios';
import { useQuery } from 'react-query';

export function useUSDPrice(coingeckoId: string) {
  return useQuery(
    ['useUSDPrice', coingeckoId],
    async () => {
      let usdPrice: number;

      usdPrice = (
        await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoId}`
        )
      ).data[coingeckoId].usd as number;

      // set 1.0 for undefined token prices in coingecko
      usdPrice = usdPrice ? usdPrice : 1.0;

      // if (asBigNumber) {
      //   return utils.parseUnits(UsdPrice.toString(), 18);
      // }

      return usdPrice;
    },
    { enabled: !!coingeckoId }
  );
}
