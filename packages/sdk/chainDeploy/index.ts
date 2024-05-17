import { ChainDeployConfig } from "./helpers";
import { deploy as deploy1337, deployConfig as deployConfig1337 } from "./local/local";
import { deploy as deploy8453, deployConfig as deployConfig8453 } from "./mainnets/base";
import { deploy as deploy34443, deployConfig as deployConfig34443 } from "./mainnets/mode";

export const chainDeployConfig: Record<number, { config: ChainDeployConfig; deployFunc: any }> = {
  // mainnets
  34443: { config: deployConfig34443, deployFunc: deploy34443 },
  8453: { config: deployConfig8453, deployFunc: deploy8453 },
  // testnets
  // local
  1337: { config: deployConfig1337, deployFunc: deploy1337 }
};

export * from "./helpers/types";
