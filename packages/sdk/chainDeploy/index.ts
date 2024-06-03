import { ChainDeployConfig } from "./helpers";
import { deploy as deploy1337, deployConfig as deployConfig1337 } from "./local/local";
import { deploy as deploy8453, deployConfig as deployConfig8453 } from "./mainnets/base";
import { deploy as deploy34443, deployConfig as deployConfig34443 } from "./mainnets/mode";
import { deploy as deploy245022934, deployConfig as deployConfig245022934 } from "./mainnets/neon";
import { deploy as deploy137, deployConfig as deployConfig137 } from "./mainnets/polygon";
import { deploy as deploy1101, deployConfig as deployConfig1101 } from "./mainnets/zkevm";
import { deploy as deploy97, deployConfig as deployConfig97 } from "./testnets/chapel";
import { deploy as deploy11155420, deployConfig as deployConfig11155420 } from "./testnets/sepolia";

export const chainDeployConfig: Record<number, { config: ChainDeployConfig; deployFunc: any }> = {
  // mainnets
  34443: { config: deployConfig34443, deployFunc: deploy34443 },
  8453: { config: deployConfig8453, deployFunc: deploy8453 },
  // testnets
  97: { config: deployConfig97, deployFunc: deploy97 },
  245022934: { config: deployConfig245022934, deployFunc: deploy245022934 },
  11155420: { config: deployConfig11155420, deployFunc: deploy11155420 },
  // local
  1337: { config: deployConfig1337, deployFunc: deploy1337 }
};

export * from "./helpers/types";
