import { AMMLiquidityVerifier } from "../services";
import { Services } from "../types";

export const verifiers = {
  [Services.LiquidityDepthVerifier]: AMMLiquidityVerifier,
};
