import axios, { AxiosResponse } from "axios";

export { fetchChainLinkFeedParameters } from "./chainLinkFeedParameters";

type Headers = Record<string, string>;
const defaultHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export async function http<T>(
  request: string,
  method = "get",
  headers: Headers = defaultHeaders,
  params: Record<string, string> = {}
): Promise<AxiosResponse<T>> {
  let response: AxiosResponse<T>;
  try {
    response = await axios[method](request, { headers, ...params });
  } catch (error) {
    console.log(Object.keys(error), error.message);
    response = error.response;
  }
  return response;
}

export { UniswapV3Fetcher } from "./uniswapV3";
