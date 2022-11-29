import { ChainDeployConfig } from "./helpers";
import { deploy as deploy1337, deployConfig as deployConfig1337 } from "./local/local";
import { deploy as deploy42161, deployConfig as deployConfig42161 } from "./mainnets/arbitrum";
import { deploy as deploy56, deployConfig as deployConfig56 } from "./mainnets/bsc";
import { deploy as deploy9001, deployConfig as deployConfig9001 } from "./mainnets/evmos";
import { deploy as deploy250, deployConfig as deployConfig250 } from "./mainnets/fantom";
import { deploy as deploy1284, deployConfig as deployConfig1284 } from "./mainnets/moonbeam";
import { deploy as deploy137, deployConfig as deployConfig137 } from "./mainnets/polygon";
import { deploy as deploy97, deployConfig as deployConfig97 } from "./testnets/chapel";
import { deploy as deploy245022926, deployConfig as deployConfig245022926 } from "./testnets/neondevnet";

export const chainDeployConfig: Record<number, { config: ChainDeployConfig; deployFunc: any }> = {
  // mainnets
  56: { config: deployConfig56, deployFunc: deploy56 },
  1284: { config: deployConfig1284, deployFunc: deploy1284 },
  137: { config: deployConfig137, deployFunc: deploy137 },
  42161: { config: deployConfig42161, deployFunc: deploy42161 },
  250: { config: deployConfig250, deployFunc: deploy250 },
  9001: { config: deployConfig9001, deployFunc: deploy9001 },
  // testnets
  97: { config: deployConfig97, deployFunc: deploy97 },
  245022926: { config: deployConfig245022926, deployFunc: deploy245022926 },
  // local
  1337: { config: deployConfig1337, deployFunc: deploy1337 },
};

export * from "./helpers/types";
