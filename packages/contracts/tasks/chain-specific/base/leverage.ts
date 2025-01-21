import { task } from "hardhat/config";
import { configureLeveredPairs } from "../../leverage/configurePair";
import { Address } from "viem";
import { LeveragePair } from "../../../chainDeploy";
import {
  AERO_MARKET,
  bsdETH_MARKET,
  cbETH_MARKET,
  eUSD_MARKET,
  ezETH_MARKET,
  hyUSD_MARKET,
  USDC_MARKET,
  weETH_MARKET,
  WETH_MARKET,
  wstETH_MARKET,
  wsuperOETH_MARKET,
  wusdm_MARKET
} from ".";

task("base:leverage:configure-pairs", "Configure leverage pairs").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const leveredPairs: LeveragePair[] = [
      { borrow: WETH_MARKET, collateral: wsuperOETH_MARKET },
      { borrow: WETH_MARKET, collateral: weETH_MARKET },
      { borrow: WETH_MARKET, collateral: ezETH_MARKET },
      { borrow: WETH_MARKET, collateral: wstETH_MARKET },
      { borrow: WETH_MARKET, collateral: cbETH_MARKET },
      { borrow: WETH_MARKET, collateral: AERO_MARKET },
      { borrow: WETH_MARKET, collateral: bsdETH_MARKET },
      { borrow: WETH_MARKET, collateral: wsuperOETH_MARKET },
      { borrow: eUSD_MARKET, collateral: hyUSD_MARKET },
      { borrow: USDC_MARKET, collateral: wusdm_MARKET }
    ];

    await configureLeveredPairs({ viem, deployments, deployer: deployer as Address, leveredPairs });
  }
);

task("base:levered-positions:configure-pairs:new").setAction(async (_, { viem, deployments, getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  console.log("deployer: ", deployer);
  const leveredPairs: LeveragePair[] = [{ borrow: WETH_MARKET, collateral: wsuperOETH_MARKET }];
  await configureLeveredPairs({
    viem,
    deployments,
    deployer: deployer as Address,
    leveredPairs
  });
});

task("base:levered-position-factory:set-positions-extension", "Set the positions extension").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const position = "0xf2e4aa37EAe6E946AA907861690F5078B8f37dCF";
    const { deployer } = await getNamedAccounts();
    const leveredPositionFactory = await viem.getContractAt(
      "ILeveredPositionFactory",
      (await deployments.get("LeveredPositionFactory")).address as Address
    );
    const tx = await leveredPositionFactory.write._setPositionsExtension([
      "0x93ff897b", // LeveredPosition.claimRewardsFromRouter.selector",
      position
    ]);
    console.log(`Set positions extension for ${position} to ${leveredPositionFactory.address}: ${tx}`);
  }
);
