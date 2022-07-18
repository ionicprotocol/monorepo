import { ChainDeployConfig } from "./helpers";
import { deploy as deploy1337, deployConfig as deployConfig1337 } from "./local/local";
import { deploy as deploy56, deployConfig as deployConfig56 } from "./mainnets/bsc";
import { deploy as deploy1284, deployConfig as deployConfig1284 } from "./mainnets/moonbeam";
import { deploy as deploy137, deployConfig as deployConfig137 } from "./mainnets/polygon";
import { deploy as deploy97, deployConfig as deployConfig97 } from "./testnets/chapel";
import { deploy as deploy9000, deployConfig as deployConfig9000 } from "./testnets/evmostestnet";
import { deploy as deploy42, deployConfig as deployConfig42 } from "./testnets/kovan";
import { deploy as deploy1287, deployConfig as deployConfig1287 } from "./testnets/moonbase";
import { deploy as deploy245022926, deployConfig as deployConfig245022926 } from "./testnets/neondevnet";

export const chainDeployConfig: Record<number, { config: ChainDeployConfig; deployFunc: any }> = {
  // mainnets
  56: { config: deployConfig56, deployFunc: deploy56 },
  1284: { config: deployConfig1284, deployFunc: deploy1284 },
  // testnets
  97: { config: deployConfig97, deployFunc: deploy97 },
  9000: { config: deployConfig9000, deployFunc: deploy9000 },
  42: { config: deployConfig42, deployFunc: deploy42 },
  1287: { config: deployConfig1287, deployFunc: deploy1287 },
  245022926: { config: deployConfig245022926, deployFunc: deploy245022926 },
  // local
  1337: { config: deployConfig1337, deployFunc: deploy1337 },
  137: { config: deployConfig137, deployFunc: deploy137 },
};

export * from "./helpers/types";
