import { FeedVerifier, PriceChangeVerifier, PriceVerifier } from "../services";
import { Services } from "../types";

export const verifiers = {
  [Services.FeedVerifier]: FeedVerifier,
  [Services.PriceVerifier]: PriceVerifier,
  [Services.PriceChangeVerifier]: PriceChangeVerifier,
};
