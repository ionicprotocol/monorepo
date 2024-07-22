import { chainIdToConfig } from "@ionicprotocol/chains";
import { config } from "dotenv";
import { providers, Wallet } from "ethers";

import { IonicSdk } from "../src";

config();

const provider = new providers.JsonRpcProvider("https://mainnet.mode.network");
const signer = new Wallet(process.env.DEPLOYER!, provider);

const sdk = new IonicSdk(signer, chainIdToConfig[34443]);

const run = async () => {
  const [liquidatablePools, erroredPools] = await sdk.getPotentialLiquidations([]);
  console.log("erroredPools: ", erroredPools);
  console.log("liquidatablePools: ", liquidatablePools);
};

run();
