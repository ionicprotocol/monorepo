import { ChainDeployConfig } from "./helpers";
import { deploy as deploy8453, deployConfig as deployConfig8453 } from "./mainnets/base";
import { deploy as deploy60808, deployConfig as deployConfig60808 } from "./mainnets/bob";
import { deploy as deploy34443, deployConfig as deployConfig34443 } from "./mainnets/mode";
import { deploy as deploy10, deployConfig as deployConfig10 } from "./mainnets/optimism";

export const chainDeployConfig: Record<number, { config: ChainDeployConfig; deployFunc: any }> = {
  // mainnets
  34443: { config: deployConfig34443, deployFunc: deploy34443 },
  8453: { config: deployConfig8453, deployFunc: deploy8453 },
  10: { config: deployConfig10, deployFunc: deploy10 },
  60808: { config: deployConfig60808, deployFunc: deploy60808 }
  // testnets
  // local
};

export * from "./helpers/types";
