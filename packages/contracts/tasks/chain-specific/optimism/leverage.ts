import { task } from "hardhat/config";
import { configureLeveredPairs } from "../../leverage/configurePair";
import { Address } from "viem";
import { LeveragePair } from "../../../chainDeploy";
import { USDC_MARKET, weETH_MARKET, WETH_MARKET, wUSDM_MARKET } from ".";

task("optimism:leverage:configure-pairs", "Configure leverage pairs").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const leveredPairs: LeveragePair[] = [
      { borrow: USDC_MARKET, collateral: wUSDM_MARKET },
      { borrow: WETH_MARKET, collateral: weETH_MARKET }
    ];

    await configureLeveredPairs({ viem, deployments, deployer: deployer as Address, leveredPairs });
  }
);
