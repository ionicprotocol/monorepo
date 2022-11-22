import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { FundOperationMode, MarketConfig, NativePricedFuseAsset } from "@midas-capital/types";
import { BigNumber, constants, ethers, utils } from "ethers";

import { COMPTROLLER_ERROR_CODES } from "../MidasSdk/config";

import { withCreateContracts } from "./CreateContracts";
import { withFlywheel } from "./Flywheel";

type FuseBaseConstructorWithModules = ReturnType<typeof withCreateContracts> & ReturnType<typeof withFlywheel>;

export function withAsset<TBase extends FuseBaseConstructorWithModules>(Base: TBase) {
  return class PoolAsset extends Base {
    public COMPTROLLER_ERROR_CODES: Array<string> = COMPTROLLER_ERROR_CODES;

    async deployAsset(config: MarketConfig): Promise<[string, string, TransactionReceipt]> {
      //1. Validate configuration
      await this.#validateConfiguration(config);

      //2. Deploy new asset to existing pool via SDK
      try {
        const [assetAddress, implementationAddress, receipt] = await this.#deployMarket(config);

        return [assetAddress, implementationAddress, receipt];
      } catch (error) {
        this.logger.error(`deployAsset raw error:  ${error} using MarketConfig: ${JSON.stringify(config)}`);
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

    async #deployMarket(config: MarketConfig): Promise<[string, string, TransactionReceipt]> {
      const abiCoder = new utils.AbiCoder();

      const reserveFactorBN = utils.parseUnits((config.reserveFactor / 100).toString());
      const adminFeeBN = utils.parseUnits((config.adminFee / 100).toString());
      const collateralFactorBN = utils.parseUnits((config.collateralFactor / 100).toString());

      const comptroller = this.getComptrollerInstance(config.comptroller, this.signer);

      // Use Default CErc20Delegate
      const implementationAddress = this.chainDeployment.CErc20Delegate.address;
      const implementationData = "0x00";

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
        throw "Failed to deploy market ";
      }
      const marketCounter = await this.contracts.FuseFeeDistributor.callStatic.marketsCounter();

      const saltsHash = utils.solidityKeccak256(
        ["address", "address", "uint"],
        [config.comptroller, config.underlying, marketCounter]
      );
      const byteCodeHash = utils.keccak256(
        this.artifacts.CErc20Delegator.bytecode.object + constructorData.substring(2)
      );
      const cErc20DelegatorAddress = utils.getCreate2Address(
        this.chainDeployment.FuseFeeDistributor.address,
        saltsHash,
        byteCodeHash
      );

      // Return cToken proxy and implementation contract addresses
      return [cErc20DelegatorAddress, implementationAddress, receipt];
    }

    async getUpdatedAssets(mode: FundOperationMode, index: number, assets: NativePricedFuseAsset[], amount: BigNumber) {
      const assetToBeUpdated = assets[index];
      const interestRateModel = await this.getInterestRateModel(assetToBeUpdated.cToken);

      let updatedAsset: NativePricedFuseAsset;

      if (mode === FundOperationMode.SUPPLY) {
        const supplyBalance = assetToBeUpdated.supplyBalance.add(amount);
        const totalSupply = assetToBeUpdated.totalSupply.add(amount);
        updatedAsset = {
          ...assetToBeUpdated,
          supplyBalance,
          totalSupply,
          supplyBalanceNative:
            Number(utils.formatUnits(supplyBalance, assetToBeUpdated.underlyingDecimals)) *
            Number(utils.formatUnits(assetToBeUpdated.underlyingPrice, 18)),
          supplyRatePerBlock: interestRateModel.getSupplyRate(
            totalSupply.gt(constants.Zero)
              ? assetToBeUpdated.totalBorrow.mul(constants.WeiPerEther).div(totalSupply)
              : constants.Zero
          ),
        };
      } else if (mode === FundOperationMode.WITHDRAW) {
        const supplyBalance = assetToBeUpdated.supplyBalance.sub(amount);
        const totalSupply = assetToBeUpdated.totalSupply.sub(amount);
        updatedAsset = {
          ...assetToBeUpdated,
          supplyBalance,
          totalSupply,
          supplyBalanceNative:
            Number(utils.formatUnits(supplyBalance, assetToBeUpdated.underlyingDecimals)) *
            Number(utils.formatUnits(assetToBeUpdated.underlyingPrice, 18)),
          supplyRatePerBlock: interestRateModel.getSupplyRate(
            totalSupply.gt(constants.Zero)
              ? assetToBeUpdated.totalBorrow.mul(constants.WeiPerEther).div(totalSupply)
              : constants.Zero
          ),
        };
      } else if (mode === FundOperationMode.BORROW) {
        const borrowBalance = assetToBeUpdated.borrowBalance.add(amount);
        const totalBorrow = assetToBeUpdated.totalBorrow.add(amount);
        updatedAsset = {
          ...assetToBeUpdated,
          borrowBalance,
          totalBorrow,
          borrowBalanceNative:
            Number(utils.formatUnits(borrowBalance, assetToBeUpdated.underlyingDecimals)) *
            Number(utils.formatUnits(assetToBeUpdated.underlyingPrice, 18)),
          borrowRatePerBlock: interestRateModel.getBorrowRate(
            assetToBeUpdated.totalSupply.gt(constants.Zero)
              ? totalBorrow.mul(constants.WeiPerEther).div(assetToBeUpdated.totalSupply)
              : constants.Zero
          ),
        };
      } else if (mode === FundOperationMode.REPAY) {
        const borrowBalance = assetToBeUpdated.borrowBalance.sub(amount);
        const totalBorrow = assetToBeUpdated.totalBorrow.sub(amount);
        const borrowRatePerBlock = interestRateModel.getBorrowRate(
          assetToBeUpdated.totalSupply.gt(constants.Zero)
            ? totalBorrow.mul(constants.WeiPerEther).div(assetToBeUpdated.totalSupply)
            : constants.Zero
        );

        updatedAsset = {
          ...assetToBeUpdated,
          borrowBalance,
          totalBorrow,
          borrowBalanceNative:
            Number(utils.formatUnits(borrowBalance, assetToBeUpdated.underlyingDecimals)) *
            Number(utils.formatUnits(assetToBeUpdated.underlyingPrice, 18)),
          borrowRatePerBlock,
        };
      }

      return assets.map((value, _index) => {
        if (_index === index) {
          return updatedAsset;
        } else {
          return value;
        }
      });
    }
  };
}
