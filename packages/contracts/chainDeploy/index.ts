import { base, fraxtal, mode, optimism } from "viem/chains";
import { ChainDeployConfig } from "./helpers";
import { deploy as deployBase, deployConfig as deployConfigBase } from "./mainnets/base";
import { deploy as deployMode, deployConfig as deployConfigMode } from "./mainnets/mode";
import { deploy as deployFrax, deployConfig as deployConfigFrax } from "./mainnets/fraxtal";
import { deploy as deployOptimism, deployConfig as deployConfigOptimism } from "./mainnets/optimism";

export const chainDeployConfig: Record<number, { config: ChainDeployConfig; deployFunc: any }> = {
  // mainnets
  [mode.id]: { config: deployConfigMode, deployFunc: deployMode },
  [base.id]: { config: deployConfigBase, deployFunc: deployBase },
  [fraxtal.id]: { config: deployConfigFrax, deployFunc: deployFrax },
  [optimism.id]: { config: deployConfigOptimism, deployFunc: deployOptimism }
  // testnets
  // local
};

export * from "./types";
