import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { BigNumber, constants, ethers, utils } from "ethers";

import { CErc20PluginRewardsDelegate } from "../../lib/contracts/typechain/CErc20PluginRewardsDelegate";
import { DelegateContractName } from "../enums";
import { COMPTROLLER_ERROR_CODES } from "../Fuse/config";
import { FuseBaseConstructor, InterestRateModelConf, MarketConfig } from "../types";

export function withAsset<TBase extends FuseBaseConstructor>(Base: TBase) {
  return class PoolAsset extends Base {
    public COMPTROLLER_ERROR_CODES: Array<string> = COMPTROLLER_ERROR_CODES;

    async deployAsset(
      irmConf: InterestRateModelConf,
      config: MarketConfig,
      options: any
    ): Promise<[string, string, string, TransactionReceipt]> {
      //1. Validate configuration
      await this.#validateConfiguration(config);

      //2. Deploy new asset to existing pool via SDK
      try {
        const [assetAddress, implementationAddress, receipt] = await this.#deployMarket(config, options);

        return [assetAddress, implementationAddress, irmConf.interestRateModel!, receipt];
      } catch (error: any) {
        console.error("Raw Error", error);
        throw Error("Deployment of asset to Fuse pool failed: " + (error.message ? error.message : error));
      }
    }

    async #validateConfiguration(config: MarketConfig) {
      // BigNumbers
      // 10% -> 0.1 * 1e18
      const reserveFactorBN = utils.parseEther((config.reserveFactor / 100).toString());
      // 5% -> 0.05 * 1e18
      const adminFeeBN = utils.parseEther((config.adminFee / 100).toString());
      // 50% -> 0.5 * 1e18
      // TODO: find out if this is a number or string. If its a number, parseEther will not work. Also parse Units works if number is between 0 - 0.9
      const collateralFactorBN = utils.parseEther((config.collateralFactor / 100).toString());
      // Check collateral factor
      if (!collateralFactorBN.gte(constants.Zero) || collateralFactorBN.gt(utils.parseEther("0.9")))
        throw Error("Collateral factor must range from 0 to 0.9.");

      // Check reserve factor + admin fee + Fuse fee
      if (!reserveFactorBN.gte(constants.Zero)) throw Error("Reserve factor cannot be negative.");
      if (!adminFeeBN.gte(constants.Zero)) throw Error("Admin fee cannot be negative.");

      // If reserveFactor or adminFee is greater than zero, we get fuse fee.
      // Sum of reserveFactor and adminFee should not be greater than fuse fee. ? i think
      if (reserveFactorBN.gt(constants.Zero) || adminFeeBN.gt(constants.Zero)) {
        const fuseFee = await this.contracts.FuseFeeDistributor.interestFeeRate();
        if (reserveFactorBN.add(adminFeeBN).add(BigNumber.from(fuseFee)).gt(constants.WeiPerEther))
          throw Error(
            "Sum of reserve factor and admin fee should range from 0 to " + (1 - fuseFee.div(1e18).toNumber()) + "."
          );
      }
    }

    async #deployMarket(config: MarketConfig, options: any): Promise<[string, string, TransactionReceipt]> {
      const abiCoder = new utils.AbiCoder();

      const reserveFactorBN = utils.parseUnits((config.reserveFactor / 100).toString());
      const adminFeeBN = utils.parseUnits((config.adminFee / 100).toString());
      const collateralFactorBN = utils.parseUnits((config.collateralFactor / 100).toString());

      const comptroller = this.getComptrollerInstance(config.comptroller, options);

      // Use Default CErc20Delegate
      let implementationAddress = this.chainDeployment.CErc20Delegate.address;
      let implementationData = "0x00";

      if (config.plugin) {
        implementationAddress = this.chainDeployment[config.plugin.cTokenContract].address;
        implementationData = abiCoder.encode(["address"], [config.plugin.strategyAddress]);
        console.log("updated implementation address:", { implementationAddress, implementationData });
      }

      // Prepare Transaction Data
      const deployArgs = [
        config.underlying,
        config.comptroller,
        config.fuseFeeDistributor,
        config.interestRateModel,
        config.name,
        config.symbol,
        implementationAddress,
        implementationData,
        reserveFactorBN,
        adminFeeBN,
      ];

      const constructorData = abiCoder.encode(
        ["address", "address", "address", "address", "string", "string", "address", "bytes", "uint256", "uint256"],
        deployArgs
      );

      // Test Transaction
      const errorCode = await comptroller.callStatic._deployMarket(false, constructorData, collateralFactorBN);
      if (errorCode.toNumber() !== 0) {
        throw `Unable to _deployMarket: ${this.COMPTROLLER_ERROR_CODES[errorCode.toNumber()]}`;
      }

      // Make actual Transaction
      const tx: ethers.providers.TransactionResponse = await comptroller._deployMarket(
        false,
        constructorData,
        collateralFactorBN
      );

      // Recreate Address of Deployed Market
      const receipt: TransactionReceipt = await tx.wait();
      if (receipt.status != constants.One.toNumber()) {
        console.log("failed to deploy market");
        throw "Failed to deploy market ";
      }
      const saltsHash = utils.solidityKeccak256(
        ["address", "address", "uint"],
        [config.comptroller, config.underlying, receipt.blockNumber]
      );
      const byteCodeHash = utils.keccak256(
        this.artifacts.CErc20Delegator.bytecode.object + constructorData.substring(2)
      );
      const cErc20DelegatorAddress = utils.getCreate2Address(
        this.chainDeployment.FuseFeeDistributor.address,
        saltsHash,
        byteCodeHash
      );

      // Change implementation if needed
      if (config.plugin) {
        const newImplementationAddress = this.chainDeployment[config.plugin.cTokenContract].address;
        console.log(`Setting implementation to ${newImplementationAddress}`);

        const setImplementationTx = await this.getCTokenInstance(cErc20DelegatorAddress)._setImplementationSafe(
          newImplementationAddress,
          false,
          implementationData
        );

        const receipt: TransactionReceipt = await setImplementationTx.wait();
        if (receipt.status != constants.One.toNumber()) {
          throw `Failed set implementation to ${config.plugin.cTokenContract}`;
        }
        implementationAddress = newImplementationAddress;
        console.log(`Implementation successfully set to ${config.plugin.cTokenContract}`);

        // Further actions for `CErc20PluginRewardsDelegate`
        if (config.plugin.cTokenContract === DelegateContractName.CErc20PluginRewardsDelegate) {
          // Add Flywheels as RewardsDistributors to Pool
          const rdsOfComptroller = await comptroller.callStatic.getRewardsDistributors();
          // TODO https://github.com/Midas-Protocol/monorepo/issues/166
          const cToken: CErc20PluginRewardsDelegate = this.getCErc20PluginRewardsInstance(cErc20DelegatorAddress);
          for (const flywheelConfig of config.plugin.flywheels) {
            if (rdsOfComptroller.includes(flywheelConfig.address)) continue;

            const addRdTx = await comptroller._addRewardsDistributor(flywheelConfig.address, {
              from: options.from,
            });
            const addRdTxReceipt: TransactionReceipt = await addRdTx.wait();

            if (addRdTxReceipt.status != constants.One.toNumber()) {
              throw `Failed set add RD to pool ${flywheelConfig.address}`;
            }
            const approveTx = await cToken["approve(address,address)"](
              flywheelConfig.rewardToken,
              flywheelConfig.address,
              {
                from: options.from,
              }
            );
            const approveTxReceipt = await approveTx.wait();
            if (approveTxReceipt.status != constants.One.toNumber()) {
              throw `Failed to approve to pool ${flywheelConfig.address}`;
            }

            console.log(approveTxReceipt.status);
            console.log("Approval succeeded");
          }
        }
      }

      // Return cToken proxy and implementation contract addresses
      return [cErc20DelegatorAddress, implementationAddress, receipt];
    }
  };
}
