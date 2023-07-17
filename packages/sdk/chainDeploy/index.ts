import { ChainDeployConfig } from "./helpers";
import { deploy as deploy1337, deployConfig as deployConfig1337 } from "./local/local";
import { deploy as deploy42161, deployConfig as deployConfig42161 } from "./mainnets/arbitrum";
import { deploy as deploy56, deployConfig as deployConfig56 } from "./mainnets/bsc";
import { deploy as deploy1, deployConfig as deployConfig1 } from "./mainnets/ethereum";
import { deploy as deploy137, deployConfig as deployConfig137 } from "./mainnets/polygon";
import { deploy as deploy97, deployConfig as deployConfig97 } from "./testnets/chapel";
import { deploy as deploy59140, deployConfig as deployConfig59140 } from "./testnets/lineagoerli";
import { deploy as deploy245022926, deployConfig as deployConfig245022926 } from "./testnets/neondevnet";

export const chainDeployConfig: Record<number, { config: ChainDeployConfig; deployFunc: any }> = {
  // mainnets
  1: { config: deployConfig1, deployFunc: deploy1 },
  56: { config: deployConfig56, deployFunc: deploy56 },
  137: { config: deployConfig137, deployFunc: deploy137 },
  42161: { config: deployConfig42161, deployFunc: deploy42161 },
  // testnets
  97: { config: deployConfig97, deployFunc: deploy97 },
  245022926: { config: deployConfig245022926, deployFunc: deploy245022926 },
  // local
  1337: { config: deployConfig1337, deployFunc: deploy1337 },
  59140: { config: deployConfig59140, deployFunc: deploy59140 }
};

export * from "./helpers/types";
