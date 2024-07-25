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
  const rewards = await sdk.getFlywheelClaimableRewardsForPool(
    "0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13",
    "0x1155b614971f16758C92c4890eD338C9e3ede6b7"
  );
  console.log("getFlywheelClaimableRewardsForPool: ", rewards);

  const markets = await sdk.getFlywheelClaimableRewardsByMarkets(
    "0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13",
    ["0x9c2A4f9c5471fd36bE3BBd8437A33935107215A1", "0x3D9669DE9E3E98DB41A1CbF6dC23446109945E3C"],
    "0x1155b614971f16758C92c4890eD338C9e3ede6b7"
  );
  console.log("getFlywheelClaimableRewardsForPool: ", markets);

  const fwLensRouter = sdk.createIonicFlywheelLensRouter();

  const tx = await fwLensRouter.simulate.claimRewardsForPool([
    "0x1155b614971f16758C92c4890eD338C9e3ede6b7",
    "0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13"
  ]);
  console.log("tx: ", tx);
};

run()
  .then(() => console.log("done!"))
  .catch((e) => console.error(e));
