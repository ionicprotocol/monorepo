import { task } from "hardhat/config";
import { Address } from "viem";
import { prepareAndLogTransaction } from "../../../chainDeploy/helpers/logging";
import { LeveragePair } from "../../../chainDeploy";
import { configureLeveredPairs } from "../../leverage/configurePair";
import { dmBTC_MARKET, ezETH_MARKET, MBTC_MARKET, STONE_MARKET, WEETH_MARKET, WETH_MARKET, wrsETH_MARKET } from ".";

task("mode:leverage:reset-pairs", "Reset leverage pairs").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const factory = await viem.getContractAt(
      "ILeveredPositionFactory",
      (await deployments.get("LeveredPositionFactory")).address as Address
    );
    const configuredCollateralMarkets = await factory.read.getWhitelistedCollateralMarkets();
    for (const collateral of configuredCollateralMarkets) {
      const configuredBorrowableMarkets = await factory.read.getBorrowableMarketsByCollateral([collateral]);
      for (const borrow of configuredBorrowableMarkets) {
        await prepareAndLogTransaction({
          contractInstance: factory,
          functionName: "_setPairWhitelisted",
          args: [collateral, borrow, false],
          description: `Resetting pair: BORROW (market: ${borrow}) - COLLATERAL: (market: ${collateral})`,
          inputs: [
            { internalType: "address", name: "_collateralMarket", type: "address" },
            { internalType: "address", name: "_stableMarket", type: "address" },
            { internalType: "bool", name: "whitelisted", type: "bool" }
          ]
        });
      }
    }
  }
);

task("mode:leverage:configure-pairs", "Configure leverage pairs").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const leveredPairs: LeveragePair[] = [
      { borrow: WETH_MARKET, collateral: wrsETH_MARKET },
      { borrow: WETH_MARKET, collateral: STONE_MARKET },
      { borrow: WETH_MARKET, collateral: ezETH_MARKET },
      { borrow: WETH_MARKET, collateral: WEETH_MARKET },
      { borrow: MBTC_MARKET, collateral: dmBTC_MARKET }
    ];

    await configureLeveredPairs({ viem, deployments, deployer: deployer as Address, leveredPairs });
  }
);

task("mode:leverage:set-positions-extension", "Set positions extension").setAction(
  async (_, { viem, deployments, getNamedAccounts }) => {
    const position = "0x050b390d4970dF426D252614374B2D8A756b6Cc5";
    const factory = await viem.getContractAt(
      "ILeveredPositionFactory",
      (await deployments.get("LeveredPositionFactory")).address as Address
    );
    await prepareAndLogTransaction({
      contractInstance: factory,
      functionName: "_setPositionsExtension",
      args: ["0x93ff897b", position],
      description: `Set positions extension for ${position} to ${factory.address}`,
      inputs: [
        { internalType: "bytes4", name: "selector", type: "bytes4" },
        { internalType: "address", name: "extension", type: "address" }
      ]
    });
  }
);
