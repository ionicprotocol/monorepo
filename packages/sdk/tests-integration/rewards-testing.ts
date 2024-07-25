import { chainIdToConfig } from "@ionicprotocol/chains";
import { config as dotenvConfig } from "dotenv";
import { createPublicClient, createWalletClient, http } from "viem";
import { base } from "viem/chains";

import { IonicSdk } from "../src";

dotenvConfig();

const run = async () => {
  const walletClient = createWalletClient({
    chain: base,
    transport: http()
  });

  const publicClient = createPublicClient({ transport: http(), chain: base });

  const sdk = new IonicSdk(publicClient as any, walletClient, chainIdToConfig[base.id]);
  const rewards = await sdk.getFlywheelRewardsInfoForMarket(
    "0x327410E4D3A32EF37712e77fCB005e5327F082De",
    "0x3d9669de9e3e98db41a1cbf6dc23446109945e3c"
  );
  console.log("rewards: ", rewards);
};

run()
  .then(() => console.log("done!"))
  .catch((e) => console.error(e));
