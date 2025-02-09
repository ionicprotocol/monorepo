import { task, types } from "hardhat/config";
import { COMPTROLLER_MORPHO_IONIC } from ".";
import { Address, encodeAbiParameters, parseAbiParameters, zeroAddress } from "viem";
import { base } from "@ionicprotocol/chains";
import { assetSymbols } from "@ionicprotocol/types";

import { chainIdtoChain } from "@ionicprotocol/chains";
import { prepareAndLogTransaction } from "../../../chainDeploy/helpers/logging";

task("base:morpho:upgrade", "one time setup").setAction(async (_, { viem, run, deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  const erc20MorphoDel = await deployments.deploy("CErc20RewardsDelegateMorpho", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });
  console.log("CErc20RewardsDelegateMorpho: ", erc20MorphoDel.address);

  const assetToUpgrade = assetSymbols.ionicWETH;

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

task("base:morpho:deploy-distributor", "one time setup")
  .addParam("morphoMarket", "Morpho CToken", undefined, types.string)
  .addParam("morphoBribes", "Morpho Bribe Contract", undefined, types.string)
  .setAction(async (taskArgs, { deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();

    let morphoBribeDistributor;
    try {
      console.log("Deploying Morpho Bribe Distributor...");

      morphoBribeDistributor = await deployments.deploy(`MorphoBribeDistributor_${taskArgs.morphoMarket}`, {
        contract: "MorphoBribeDistributor",
        from: deployer,
        log: true,
        proxy: {
          proxyContract: "OpenZeppelinTransparentProxy",
          execute: {
            init: {
              methodName: "initialize",
              args: [taskArgs.morphoMarket, taskArgs.morphoBribes]
            }
          }
        }
      });

      console.log(`Morpho Bribe Distributor deployed at: ${morphoBribeDistributor.address}`);
    } catch (error) {
      console.error("Error deploying Morpho Bribe Distributor:", error);
    }
  });
