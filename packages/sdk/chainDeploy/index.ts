import {
  deployConfig as deployConfig56,
  deploy as deploy56,
} from "./mainnets/bsc";
import {
  deployConfig as deployConfig1284,
  deploy as deploy1284,
} from "./mainnets/moonbeam";
import {
  deployConfig as deployConfig9000,
  deploy as deploy9000,
} from "./testnets/evmostestnet";
import {
  deployConfig as deployConfig97,
  deploy as deploy97,
} from "./testnets/chapel";
import {
  deployConfig as deployConfig42,
  deploy as deploy42,
} from "./testnets/kovan";
import {
  deployConfig as deployConfig1287,
  deploy as deploy1287,
} from "./testnets/moonbase";

import { ChainDeployConfig } from "./helpers";
import {
  deployConfig as deployConfig1337,
  deploy as deploy1337,
} from "./local/local";

export const chainDeployConfig: Record<
  number,
  { config: ChainDeployConfig; deployFunc: any }
> = {
  // mainnets
  56: { config: deployConfig56, deployFunc: deploy56 },
  1284: { config: deployConfig1284, deployFunc: deploy1284 },
  // testnets
  97: { config: deployConfig97, deployFunc: deploy97 },
  9000: { config: deployConfig9000, deployFunc: deploy9000 },
  42: { config: deployConfig42, deployFunc: deploy42 },
  1287: { config: deployConfig1287, deployFunc: deploy1287 },
  // local
  1337: { config: deployConfig1337, deployFunc: deploy1337 },
};

export * from "./helpers/types";
