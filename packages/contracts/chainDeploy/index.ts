import { base, fraxtal, mode, optimism, lisk, superseed, worldchain, metalL2 } from "viem/chains";
import { ChainDeployConfig } from "./helpers";
import { deploy as deployBase, deployConfig as deployConfigBase } from "./mainnets/base";
import { deploy as deployMode, deployConfig as deployConfigMode } from "./mainnets/mode";
import { deploy as deployFrax, deployConfig as deployConfigFrax } from "./mainnets/fraxtal";
import { deploy as deployOptimism, deployConfig as deployConfigOptimism } from "./mainnets/optimism";
import { deploy as deployLisk, deployConfig as deployConfigLisk } from "./mainnets/lisk";
import { deploy as deployInk, deployConfig as deployConfigInk } from "./mainnets/ink";
import { deploy as deploySuperseed, deployConfig as deployConfigSuperseed } from "./mainnets/superseed";
import { deploy as deployWorldchain, deployConfig as deployConfigWorldchain } from "./mainnets/worldchain";
import { deploy as deploySwellchain, deployConfig as deployConfigSwellchain } from "./mainnets/swellchain";
import { deploy as deployCampTest, deployConfig as deployConfigCampTest } from "./testnets/camp";
import { deploy as deployOzeantest, deployConfig as deployConfigOzeantest } from "./testnets/ozean";
import { deploy as deploySoneium, deployConfig as deployConfigSoneium } from "./mainnets/soneium";
import { deploy as deployMetalL2, deployConfig as deployConfigMetalL2 } from "./mainnets/metalL2";
export const chainDeployConfig: Record<number, { config: ChainDeployConfig; deployFunc: any }> = {
  // mainnets
  [mode.id]: { config: deployConfigMode, deployFunc: deployMode },
  [base.id]: { config: deployConfigBase, deployFunc: deployBase },
  [fraxtal.id]: { config: deployConfigFrax, deployFunc: deployFrax },
  [optimism.id]: { config: deployConfigOptimism, deployFunc: deployOptimism },
  [lisk.id]: { config: deployConfigLisk, deployFunc: deployLisk },
  57073: { config: deployConfigInk, deployFunc: deployInk },
  [superseed.id]: { config: deployConfigSuperseed, deployFunc: deploySuperseed },
  [worldchain.id]: { config: deployConfigWorldchain, deployFunc: deployWorldchain },
  1923: { config: deployConfigSwellchain, deployFunc: deploySwellchain },
  1868: { config: deployConfigSoneium, deployFunc: deploySoneium },
  [metalL2.id]: { config: deployConfigMetalL2, deployFunc: deployMetalL2 },
  // testnets
  7849306: { config: deployConfigOzeantest, deployFunc: deployOzeantest },
  325000: { config: deployConfigCampTest, deployFunc: deployCampTest }
  // local
};

export * from "./types";
