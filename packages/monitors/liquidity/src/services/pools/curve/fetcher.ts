import { MidasSdk } from "@midas-capital/sdk";
import { SupportedChains } from "@midas-capital/types";
import axios from "axios";

const BASE_CURVE_API = "https://api.curve.fi/api/getPools";

type CurvePoolResponse = {
  data: {
    poolData: Array<{
      usdTotal: number;
      address: string;
    }>;
  };
};

export async function fetchCurvePoolTvl(sdk: MidasSdk, poolAddress: string) {
  console.log("Fetching Curve pool TVL for", poolAddress);
  console.log({ chainId: sdk.chainId });
  const chainName = SupportedChains[sdk.chainId];
  const url = `${BASE_CURVE_API}/${chainName}`;
  const promises: Array<Promise<CurvePoolResponse>> = [];
  for (const kind of ["main", "crypto", "factory"]) {
    promises.push(axios.get(`${url}/${kind}`).then((res) => res.data));
  }
  const [main, crypto, factory] = await Promise.all(promises);
  const pools = [...main.data?.poolData, ...crypto.data?.poolData, ...factory.data?.poolData];
  const pool = pools.find((p) => p.address === poolAddress);

  if (!pool) {
    throw new Error(`No pool found for address ${poolAddress}`);
  }
  return pool.usdTotal;
}
