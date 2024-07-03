import { ChainDeployConfig } from "./helpers";
import { deploy as deploy1337, deployConfig as deployConfig1337 } from "./local/local";
import { deploy as deploy8453, deployConfig as deployConfig8453 } from "./mainnets/base";
import { deploy as deploy34443, deployConfig as deployConfig34443 } from "./mainnets/mode";
import { deploy as deploy11155420, deployConfig as deployConfig11155420 } from "./testnets/sepolia";
import { deploy as deploy10, deployConfig as deployConfig10 } from "./mainnets/optimism";

export const chainDeployConfig: Record<number, { config: ChainDeployConfig; deployFunc: any }> = {
  // mainnets
  34443: { config: deployConfig34443, deployFunc: deploy34443 },
  8453: { config: deployConfig8453, deployFunc: deploy8453 },
  10: { config: deployConfig10, deployFunc: deploy10 },
  // testnets
  11155420: { config: deployConfig11155420, deployFunc: deploy11155420 },
  // local
  1337: { config: deployConfig1337, deployFunc: deploy1337 }
};

export * from "./helpers/types";
