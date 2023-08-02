import { ChainDeployConfig } from "./helpers";
import { deploy as deploy1337, deployConfig as deployConfig1337 } from "./local/local";
import { deploy as deploy42161, deployConfig as deployConfig42161 } from "./mainnets/arbitrum";
import { deploy as deploy56, deployConfig as deployConfig56 } from "./mainnets/bsc";
import { deploy as deploy1, deployConfig as deployConfig1 } from "./mainnets/ethereum";
import { deploy as deploy59144, deployConfig as deployConfig59144 } from "./mainnets/linea";
import { deploy as deploy245022934, deployConfig as deployConfig245022934 } from "./mainnets/neon";
import { deploy as deploy137, deployConfig as deployConfig137 } from "./mainnets/polygon";
import { deploy as deploy1101, deployConfig as deployConfig1101 } from "./mainnets/zkevem";
import { deploy as deploy97, deployConfig as deployConfig97 } from "./testnets/chapel";

export const chainDeployConfig: Record<number, { config: ChainDeployConfig; deployFunc: any }> = {
  // mainnets
  1: { config: deployConfig1, deployFunc: deploy1 },
  56: { config: deployConfig56, deployFunc: deploy56 },
  137: { config: deployConfig137, deployFunc: deploy137 },
  42161: { config: deployConfig42161, deployFunc: deploy42161 },
  // testnets
  97: { config: deployConfig97, deployFunc: deploy97 },
  245022934: { config: deployConfig245022934, deployFunc: deploy245022934 },
  // local
  1337: { config: deployConfig1337, deployFunc: deploy1337 },
  59144: { config: deployConfig59144, deployFunc: deploy59144 },
  1101: { config: deployConfig1101, deployFunc: deploy1101 }
};

export * from "./helpers/types";
