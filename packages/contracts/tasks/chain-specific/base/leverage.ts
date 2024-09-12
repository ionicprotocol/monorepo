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
  wstETH_MARKET
} from ".";

task("base:leverage:configure-pairs", "Configure leverage pairs").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const collaterals = [
      weETH_MARKET,
      ezETH_MARKET,
      wstETH_MARKET,
      cbETH_MARKET,
      AERO_MARKET,
      bsdETH_MARKET,
      hyUSD_MARKET,
      RSR_MARKET
    ];
    const borrows = [USDC_MARKET, eUSD_MARKET, WETH_MARKET];
    const leveredPairs: LeveragePair[] = collaterals
      .map((collateral) => {
        return borrows.map((borrow) => ({
          collateral: collateral as Address,
          borrow: borrow as Address
        }));
      })
      .flat();

    await configureLeveredPairs({ viem, deployments, deployer: deployer as Address, leveredPairs });
  }
);
