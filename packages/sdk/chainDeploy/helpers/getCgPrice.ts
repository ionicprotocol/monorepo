import { neondevnet } from "@midas-capital/chains";
import axios from "axios";

export const getCgPrice = async (coingeckoId: string) => {
  // set neon price hardcoded as 0.05 for now
  if (coingeckoId === neondevnet.specificParams.cgId) return 0.05;

  let usdPrice: number;

  const data = (await axios.get(`https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoId}`))
    .data[coingeckoId];
  usdPrice = data?.usd as number;

  // set 1.0 for undefined token prices in coingecko
  usdPrice = usdPrice ? usdPrice : 1.0;

  return usdPrice;
};
