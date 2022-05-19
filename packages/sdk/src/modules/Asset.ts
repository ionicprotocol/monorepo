import { BigNumber, constants, Contract, ContractFactory, ethers, providers, utils } from "ethers";

import { cERC20Conf, FuseBaseConstructor, InterestRateModelConf, RewardsDistributorConfig } from "../types";
import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { COMPTROLLER_ERROR_CODES } from "../Fuse/config";
import { DelegateContractName } from "../enums";
import { CErc20Delegate } from "../../lib/contracts/typechain/CErc20Delegate";
import { CErc20PluginRewardsDelegate } from "../../lib/contracts/typechain/CErc20PluginRewardsDelegate";

export function withAsset<TBase extends FuseBaseConstructor>(Base: TBase) {
  return class PoolAsset extends Base {
    public COMPTROLLER_ERROR_CODES: Array<string> = COMPTROLLER_ERROR_CODES;
    async deployAsset(
      irmConf: InterestRateModelConf,
      cTokenConf: cERC20Conf,
      options: any
    ): Promise<[string, string, string, TransactionReceipt]> {
      let assetAddress: string;
      let implementationAddress: string;
      let receipt: providers.TransactionReceipt;
      // Deploy new interest rate model via SDK if requested
      if (
        ["WhitePaperInterestRateModel", "JumpRateModel", "DAIInterestRateModelV2"].indexOf(
          irmConf.interestRateModel!
        ) >= 0
      ) {
        try {
          irmConf.interestRateModel = await this.deployInterestRateModel(
            options,
            irmConf.interestRateModel,
            irmConf.interestRateModelParams
          ); // TODO: anchorMantissa
        } catch (error: any) {
          console.error("Raw Error", error);
          throw Error("Deployment of interest rate model failed: " + (error.message ? error.message : error));
        }
      }
      // Deploy new asset to existing pool via SDK
      try {
        [assetAddress, implementationAddress, receipt] = await this.deployCToken(cTokenConf, options);
      } catch (error: any) {
        throw Error("Deployment of asset to Fuse pool failed: " + (error.message ? error.message : error));
      }
      return [assetAddress, implementationAddress, irmConf.interestRateModel!, receipt];
    }

    async deployCToken(conf: cERC20Conf, options: any): Promise<[string, string, TransactionReceipt]> {
      // BigNumbers
      // 10% -> 0.1 * 1e18
      const reserveFactorBN = utils.parseEther((conf.reserveFactor / 100).toString());
      // 5% -> 0.05 * 1e18
      const adminFeeBN = utils.parseEther((conf.adminFee / 100).toString());
      // 50% -> 0.5 * 1e18
      // TODO: find out if this is a number or string. If its a number, parseEther will not work. Also parse Units works if number is between 0 - 0.9
      const collateralFactorBN = utils.parseEther((conf.collateralFactor / 100).toString());
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

      if (!conf.delegateContractName)
        conf.delegateContractName =
          conf.underlying !== undefined &&
          conf.underlying !== null &&
          conf.underlying.length > 0 &&
          !BigNumber.from(conf.underlying).isZero()
            ? DelegateContractName.CErc20Delegate
            : DelegateContractName.CEtherDelegate;

      let implementationAddress;
      switch (conf.delegateContractName) {
        case DelegateContractName.CErc20PluginDelegate:
          implementationAddress =
            this.chainDeployment.CErc20PluginDelegate && this.chainDeployment.CErc20PluginDelegate.address
              ? this.chainDeployment.CErc20PluginDelegate.address
              : null;
          break;
        case DelegateContractName.CErc20PluginRewardsDelegate:
          implementationAddress =
            this.chainDeployment.CErc20PluginRewardsDelegate && this.chainDeployment.CErc20PluginRewardsDelegate.address
              ? this.chainDeployment.CErc20PluginRewardsDelegate.address
              : null;
          break;
        case DelegateContractName.CEtherDelegate:
          implementationAddress =
            this.chainDeployment.CEtherDelegate && this.chainDeployment.CEtherDelegate.address
              ? this.chainDeployment.CEtherDelegate.address
              : null;
          break;
        default:
          implementationAddress =
            this.chainDeployment.CErc20Delegate && this.chainDeployment.CErc20Delegate.address
              ? this.chainDeployment.CErc20Delegate.address
              : null;
          break;
      }
      return conf.underlying !== undefined &&
        conf.underlying !== null &&
        conf.underlying.length > 0 &&
        !BigNumber.from(conf.underlying).isZero()
        ? await this.deployCErc20(conf, options, implementationAddress)
        : await this.deployCEther(conf, options, implementationAddress);
    }

    async deployCEther(
      conf: cERC20Conf,
      options: any,
      implementationAddress: string | null
    ): Promise<[string, string, TransactionReceipt]> {
      const reserveFactorBN = utils.parseUnits((conf.reserveFactor / 100).toString());
      const adminFeeBN = utils.parseUnits((conf.adminFee / 100).toString());
      const collateralFactorBN = utils.parseUnits((conf.collateralFactor / 100).toString());

      // Deploy CEtherDelegate implementation contract if necessary
      if (!implementationAddress) {
        const cEtherDelegateFactory = new ContractFactory(
          this.artifacts.CEtherDelegate.abi,
          this.artifacts.CEtherDelegate.bytecode.object,
          this.provider.getSigner(options.from)
        );

        const cEtherDelegateDeployed = await cEtherDelegateFactory.deploy();
        implementationAddress = cEtherDelegateDeployed.address;
      }

      let deployArgs = [
        conf.comptroller,
        conf.fuseFeeDistributor,
        conf.interestRateModel,
        conf.name,
        conf.symbol,
        implementationAddress,
        "0x00",
        reserveFactorBN,
        adminFeeBN,
      ];
      const abiCoder = new utils.AbiCoder();
      const constructorData = abiCoder.encode(
        ["address", "address", "address", "string", "string", "address", "bytes", "uint256", "uint256"],
        deployArgs
      );
      const comptroller = new Contract(
        conf.comptroller,
        this.artifacts.Comptroller.abi,
        this.provider.getSigner(options.from)
      );

      const comptrollerWithSigner = comptroller.connect(this.provider.getSigner(options.from));
      const errorCode = await comptroller.callStatic._deployMarket(
        ethers.constants.AddressZero,
        constructorData,
        collateralFactorBN
      );
      if (errorCode.toNumber() !== 0) {
        throw `Failed to _deployMarket: ${this.COMPTROLLER_ERROR_CODES[errorCode.toNumber()]}`;
      }

      const tx = await comptrollerWithSigner._deployMarket(
        ethers.constants.AddressZero,
        constructorData,
        collateralFactorBN
      );

      const receipt: TransactionReceipt = await tx.wait();

      if (receipt.status != constants.One.toNumber()) {
        throw "Failed to deploy market ";
      }

      const saltsHash = utils.solidityKeccak256(
        ["address", "address", "uint"],
        [conf.comptroller, ethers.constants.AddressZero, receipt.blockNumber]
      );

      const byteCodeHash = utils.keccak256(
        this.artifacts.CEtherDelegator.bytecode.object + constructorData.substring(2)
      );

      const cEtherDelegatorAddress = utils.getCreate2Address(
        this.chainDeployment.FuseFeeDistributor.address,
        saltsHash,
        byteCodeHash
      );

      // Return cToken proxy and implementation contract addresses
      return [cEtherDelegatorAddress, implementationAddress, receipt];
    }

    async upgradeCErc20(conf: cERC20Conf, cErc20DelegatorAddress: string, implementationData: string): Promise<string> {
      let becomeImplementationAddress: string;
      switch (conf.delegateContractName) {
        case DelegateContractName.CErc20PluginDelegate:
          becomeImplementationAddress = this.chainDeployment[DelegateContractName.CErc20PluginDelegate].address;
          break;
        case DelegateContractName.CErc20PluginRewardsDelegate:
          becomeImplementationAddress = this.chainDeployment[DelegateContractName.CErc20PluginRewardsDelegate].address;
          break;
        default:
          becomeImplementationAddress = this.chainDeployment[DelegateContractName.CErc20Delegate].address;
          break;
      }
      const cToken = new Contract(
        cErc20DelegatorAddress,
        this.chainDeployment[DelegateContractName.CErc20Delegate].abi,
        this.provider.getSigner()
      ) as CErc20Delegate;

      console.log(`Setting implementation to ${becomeImplementationAddress}`);

      const tx = await cToken._setImplementationSafe(becomeImplementationAddress, false, implementationData);
      const receipt: TransactionReceipt = await tx.wait();
      if (receipt.status != constants.One.toNumber()) {
        throw `Failed set implementation to ${conf.delegateContractName}`;
      }
      console.log(`Implementation successfully set to ${conf.delegateContractName}`);
      return becomeImplementationAddress;
    }

    getImplementationData(conf: cERC20Conf): string {
      const abiCoder = new utils.AbiCoder();
      if (
        conf.delegateContractName === DelegateContractName.CErc20PluginDelegate ||
        conf.delegateContractName === DelegateContractName.CErc20PluginRewardsDelegate
      ) {
        if (!conf.plugin) {
          throw "CErc20PluginDelegate needs plugin address";
        }
        return abiCoder.encode(["address"], [conf.plugin]);
      }
      return "0x00";
    }

    async approveRewardsDistributors(
      cToken: string,
      options: any,
      rewardsDistributorConfig: RewardsDistributorConfig[]
    ): Promise<void> {
      console.log(`Approving rewards distributors`);
      const cTokenWithSigner = new Contract(
        cToken,
        this.chainDeployment.CErc20PluginRewardsDelegate.abi,
        this.provider.getSigner(options.from)
      ) as CErc20PluginRewardsDelegate;

      for (const rewardsDistributor of rewardsDistributorConfig) {
        await cTokenWithSigner["approve(address,address)"](
          rewardsDistributor.rewardToken,
          rewardsDistributor.rewardsDistributor
        );
      }
    }

    async deployCErc20(
      conf: cERC20Conf,
      options: any,
      implementationAddress: string | null // cERC20Delegate implementation
    ): Promise<[string, string, TransactionReceipt]> {
      const abiCoder = new utils.AbiCoder();

      const reserveFactorBN = utils.parseUnits((conf.reserveFactor / 100).toString());
      const adminFeeBN = utils.parseUnits((conf.adminFee / 100).toString());
      const collateralFactorBN = utils.parseUnits((conf.collateralFactor / 100).toString());

      // Get Comptroller
      const comptroller = this.getComptrollerInstance(conf.comptroller, options);
      console.log(await comptroller.signer.getAddress());
      // Deploy CErc20Delegate implementation contract if necessary
      if (!implementationAddress) {
        implementationAddress = this.chainDeployment.CErc20Delegate.address;
      }

      const implementationData = this.getImplementationData(conf);
      // Deploy CEtherDelegator proxy contract
      let deployArgs = [
        conf.underlying,
        conf.comptroller,
        conf.fuseFeeDistributor,
        conf.interestRateModel,
        conf.name,
        conf.symbol,
        implementationAddress,
        implementationData,
        reserveFactorBN,
        adminFeeBN,
      ];

      const constructorData = abiCoder.encode(
        ["address", "address", "address", "address", "string", "string", "address", "bytes", "uint256", "uint256"],
        deployArgs
      );

      const errorCode = await comptroller.callStatic._deployMarket(false, constructorData, collateralFactorBN);

      if (errorCode.toNumber() !== 0) {
        throw `Failed to _deployMarket: ${this.COMPTROLLER_ERROR_CODES[errorCode.toNumber()]}`;
      }

      let tx: ethers.providers.TransactionResponse;
      tx = await comptroller._deployMarket(false, constructorData, collateralFactorBN);
      const receipt: TransactionReceipt = await tx.wait();

      if (receipt.status != constants.One.toNumber()) {
        console.log("failed to deploy market");
        throw "Failed to deploy market ";
      }

      const saltsHash = utils.solidityKeccak256(
        ["address", "address", "uint"],
        [conf.comptroller, conf.underlying, receipt.blockNumber]
      );
      const byteCodeHash = utils.keccak256(
        this.artifacts.CErc20Delegator.bytecode.object + constructorData.substring(2)
      );

      const cErc20DelegatorAddress = utils.getCreate2Address(
        this.chainDeployment.FuseFeeDistributor.address,
        saltsHash,
        byteCodeHash
      );

      // needed for Erc4626Plugin and Erc4626PluginDelegate
      if (implementationData !== "0x00" && conf.delegateContractName) {
        implementationAddress = await this.upgradeCErc20(conf, cErc20DelegatorAddress, implementationData);
        if (conf.delegateContractName === DelegateContractName.CErc20PluginRewardsDelegate) {
          if (!conf.rewardsDistributorConfig) {
            throw `${DelegateContractName.CErc20PluginRewardsDelegate} must have a 'rewardsDistributorConfig' defined`;
          }
          await this.approveRewardsDistributors(implementationAddress, options, conf.rewardsDistributorConfig);
        }
      }
      // Return cToken proxy and implementation contract addresses
      return [cErc20DelegatorAddress, implementationAddress, receipt];
    }
  };
}
