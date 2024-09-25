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
  RSR_MARKET,
  USDC_MARKET,
  weETH_MARKET,
  WETH_MARKET,
  wstETH_MARKET,
  wsuperOETH_MARKET
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
      { borrow: eUSD_MARKET, collateral: hyUSD_MARKET }
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