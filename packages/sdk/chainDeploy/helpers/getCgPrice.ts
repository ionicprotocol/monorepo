import { neon } from "@ionicprotocol/chains";
import axios from "axios";

export const getCgPrice = async (coingeckoId: string) => {
  let usdPrice = NaN;

  try {
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${coingeckoId}`
    );

    if (data[coingeckoId] && data[coingeckoId].usd) {
      usdPrice = data[coingeckoId].usd;
    }
  } catch (e) {
    const { data } = await axios.get(`https://coins.llama.fi/prices/current/coingecko:${coingeckoId}`);

    if (data.coins[`coingecko:${coingeckoId}`] && data.coins[`coingecko:${coingeckoId}`].price) {
      usdPrice = data.coins[`coingecko:${coingeckoId}`].price;
    }
  }

  if (usdPrice) {
    return usdPrice;
  } else {
    if (coingeckoId === neon.specificParams.cgId) {
      return 1.2;
    } else {
      return 1;
    }
  }
};
