import { task, types } from "hardhat/config";
import { COMPTROLLER_MORPHO_IONIC } from ".";
import { Address, encodeAbiParameters, parseAbiParameters, zeroAddress } from "viem";
import { base } from "@ionicprotocol/chains";
import { assetSymbols } from "@ionicprotocol/types";

import { chainIdtoChain } from "@ionicprotocol/chains";
import { prepareAndLogTransaction } from "../../../chainDeploy/helpers/logging";

task("base:morpho:upgrade", "one time setup").setAction(async (_, { viem, run, deployments }) => {
  const assetToUpgrade = assetSymbols.ionicUSDC;

  const delegate = await deployments.get("CErc20RewardsDelegateMorpho");

  const comptroller = await viem.getContractAt("IonicComptroller", COMPTROLLER_MORPHO_IONIC);
  const asset = base.assets.find((asset) => asset.symbol === assetToUpgrade);
  if (!asset) {
    throw `Asset ${assetToUpgrade} not found`;
  }
  const cToken = await comptroller.read.cTokensByUnderlying([asset.underlying]);
  await run("market:upgrade:safe", {
    marketAddress: cToken,
    implementationAddress: delegate.address as Address
  });
});
