import { task } from "hardhat/config";
import { Address } from "viem";
import { mode } from "@ionicprotocol/chains";
import { prepareAndLogTransaction } from "../../../chainDeploy/helpers/logging";

task("liquidation:set-redemption-strategy", "Set redemption strategy").setAction(
  async (_, { viem, getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts();
    const liquidatorRegistry = await viem.getContractAt(
      "ILiquidatorsRegistry",
      (await deployments.get("LiquidatorsRegistry")).address as Address
    );
    const modeToken = mode.assets.find((asset) => asset.symbol === "MODE");
    const usdtToken = mode.assets.find((asset) => asset.symbol === "USDT");
    if (!modeToken || !usdtToken) {
      throw new Error("Mode or USDT token not found");
    }
    const kimLiquidator = await deployments.get("AlgebraSwapLiquidator");
    const owner = await liquidatorRegistry.read.owner();
    const [strategy] = await liquidatorRegistry.read.getRedemptionStrategy([
      modeToken.underlying,
      usdtToken.underlying
    ]);
    if (strategy.toLowerCase() !== kimLiquidator.address.toLowerCase()) {
      if (owner.toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: liquidatorRegistry,
          functionName: "_setRedemptionStrategy",
          args: [modeToken.underlying, usdtToken.underlying, kimLiquidator.address as Address],
          description: "Set redemption strategy",
          inputs: [
            { internalType: "address", name: "strategy", type: "address" },
            { internalType: "address", name: "inputToken", type: "address" },
            { internalType: "address", name: "outputToken", type: "address" }
          ]
        });
      } else {
        const tx = await liquidatorRegistry.write._setRedemptionStrategy([
          kimLiquidator.address as Address,
          modeToken.underlying,
          usdtToken.underlying
        ]);
        console.log("Transaction sent:", tx);
      }
    } else {
      console.log("Redemption strategy already set");
    }
  }
);
