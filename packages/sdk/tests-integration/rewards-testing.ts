import { chainIdToConfig } from "@ionicprotocol/chains";
import { config as dotenvConfig } from "dotenv";
import { createPublicClient, createWalletClient, http } from "viem";
import { mode } from "viem/chains";

import { IonicSdk } from "../src";

dotenvConfig();

const run = async () => {
  const walletClient = createWalletClient({
    chain: mode,
    transport: http()
  });

  const publicClient = createPublicClient({ transport: http(), chain: mode });

  const sdk = new IonicSdk(publicClient, walletClient, chainIdToConfig[mode.id]);
  const rewards = await sdk.getFlywheelRewardsInfoForMarket("0x0", "0x0");
  console.log("rewards: ", rewards);
};

run()
  .then(() => console.log("done!"))
  .catch((e) => console.error(e));
