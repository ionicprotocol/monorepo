import { task } from "hardhat/config";
import { COMPTROLLER_MORPHO_IONIC } from ".";
import { Address } from "viem";
import { base } from "@ionicprotocol/chains";
import { assetSymbols } from "@ionicprotocol/types";

task("base:morpho:upgrade", "one time setup").setAction(async (_, { viem, run, getNamedAccounts, deployments }) => {
  const assetToUpgrade = assetSymbols.ionicUSDC;

  const { deployer } = await getNamedAccounts();
  const delegate = await deployments.deploy("CErc20RewardsDelegateMorpho", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1
  });

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
