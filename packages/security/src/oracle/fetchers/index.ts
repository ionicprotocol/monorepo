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
  try {
    const response: AxiosResponse<T> = await axios[method](request, { headers, ...params });
    return response;
  } catch (error) {
    console.log(Object.keys(error), error.message);
  }
}
