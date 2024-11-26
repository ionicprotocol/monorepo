import { base, fraxtal, mode, optimism, lisk } from "viem/chains";
import { ChainDeployConfig } from "./helpers";
import { deploy as deployBase, deployConfig as deployConfigBase } from "./mainnets/base";
import { deploy as deployMode, deployConfig as deployConfigMode } from "./mainnets/mode";
import { deploy as deployFrax, deployConfig as deployConfigFrax } from "./mainnets/fraxtal";
import { deploy as deployOptimism, deployConfig as deployConfigOptimism } from "./mainnets/optimism";
import { deploy as deployLisk, deployConfig as deployConfigLisk } from "./mainnets/lisk";
import { deploy as deploySuperseed, deployConfig as deployConfigSuperseed } from "./mainnets/superseed";
import { superseed } from "@ionicprotocol/chains";

export const chainDeployConfig: Record<number, { config: ChainDeployConfig; deployFunc: any }> = {
  // mainnets
  [mode.id]: { config: deployConfigMode, deployFunc: deployMode },
  [base.id]: { config: deployConfigBase, deployFunc: deployBase },
  [fraxtal.id]: { config: deployConfigFrax, deployFunc: deployFrax },
  [optimism.id]: { config: deployConfigOptimism, deployFunc: deployOptimism },
  [lisk.id]: { config: deployConfigLisk, deployFunc: deployLisk },
  [superseed.chainId]: { config: deployConfigSuperseed, deployFunc: deploySuperseed }
  // testnets
  // local
};

export * from "./types";
