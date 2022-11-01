import { Services } from "../types";

import { configs } from "./variables";
import { verifiers } from "./verifiers";

export const getConfig = () => {
  if (!process.env.SERVICE_TO_RUN) {
    throw new Error("SERVICE_TO_RUN env variable is not set");
  }
  const serviceToRun = process.env.SERVICE_TO_RUN as Services;

  return configs[serviceToRun];
};

export const getVerifier = () => {
  if (!process.env.SERVICE_TO_RUN) {
    throw new Error("SERVICE_TO_RUN env variable is not set");
  }
  const verifierToUse = process.env.SERVICE_TO_RUN as Services;

  return verifiers[verifierToUse];
};

export const config = getConfig();
export const verifier = getVerifier();
