import { chainIdToConfig, mode } from "@ionicprotocol/chains";
import { config as dotenvConfig } from "dotenv";
import { providers, Wallet } from "ethers";

import { IonicSdk } from "../src";

dotenvConfig();

const run = async () => {
  const provider = new providers.JsonRpcProvider("https://mainnet.mode.network");
  const signer = Wallet.fromMnemonic(process.env.MNEMONIC!).connect(provider);
  const sdk = new IonicSdk(signer, chainIdToConfig[mode.chainId]);
  Object.entries(sdk.contracts).map((contract) => {
    console.log("name: ", contract[0]);
    console.log("contract: ", contract[1].address);
  });
};

run()
  .then(() => console.log("done!"))
  .catch((e) => console.error(e));
