import { ChainDeployConfig } from "./helpers";
import { deploy as deploy8453, deployConfig as deployConfig8453 } from "./mainnets/base";
import { deploy as deploy34443, deployConfig as deployConfig34443 } from "./mainnets/mode";
import { deploy as deploy10, deployConfig as deployConfig10 } from "./mainnets/optimism";
import { deploy as deploy11155420, deployConfig as deployConfig11155420 } from "./testnets/sepolia";

export const chainDeployConfig: Record<number, { config: ChainDeployConfig; deployFunc: any }> = {
  // mainnets
  34443: { config: deployConfig34443, deployFunc: deploy34443 },
  8453: { config: deployConfig8453, deployFunc: deploy8453 },
  10: { config: deployConfig10, deployFunc: deploy10 }
  // testnets
  11155420: { config: deployConfig11155420, deployFunc: deploy11155420 },
  // local
};

export * from "./helpers/types";
