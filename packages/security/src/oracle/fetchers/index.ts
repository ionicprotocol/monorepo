// import fetch from "node-fetch";

export { fetchChainLinkFeedParameters } from "./chainLinkFeedParameters";

type Headers = Record<string, string>;
const defaultHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export interface HttpResponse<T> extends Response {
  parsedBody: T;
}
export async function http<T>(
  request: string,
  method = "GET",
  headers: Headers = defaultHeaders
): Promise<HttpResponse<T>> {
  const response: HttpResponse<T> = await fetch(request, { method, headers });

  try {
    // may error if there is no body
    response.parsedBody = await response.json();
  } catch (ex) {}

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response;
}
