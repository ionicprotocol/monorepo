import axios from "axios";

export const getDefiLlamaPrice = async (defillamaId: string) => {
  let usdPrice: number;
  try {
    usdPrice = (await axios.get(`https://coins.llama.fi/prices/current/${defillamaId}`)).data.coins[defillamaId]
      .price as number;
    usdPrice = usdPrice ? usdPrice : 1.0;
  } catch (e) {
    return null;
  }
  return usdPrice;
};
