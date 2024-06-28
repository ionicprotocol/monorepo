import { FundOperationMode, MarketConfig, NativePricedIonicAsset } from "@ionicprotocol/types";
import {
  parseEther,
  TransactionReceipt,
  encodeAbiParameters,
  Address,
  parseAbiParameters,
  keccak256,
  encodePacked,
  getContractAddress,
  formatUnits
} from "viem";

import CErc20DelegatorArtifact from "../../artifacts/CErc20Delegator.sol/CErc20Delegator.json";
import { COMPTROLLER_ERROR_CODES } from "../IonicSdk/config";

import { withCreateContracts } from "./CreateContracts";
import { withFlywheel } from "./Flywheel";

type IonicBaseConstructorWithModules = ReturnType<typeof withCreateContracts> & ReturnType<typeof withFlywheel>;

export function withAsset<TBase extends IonicBaseConstructorWithModules>(Base: TBase) {
  return class PoolAsset extends Base {
    public COMPTROLLER_ERROR_CODES: Array<string> = COMPTROLLER_ERROR_CODES;

    async deployAsset(config: MarketConfig): Promise<[string, string, TransactionReceipt]> {
      //1. Validate configuration
      await this.validateConfiguration(config);

      //2. Deploy new asset to existing pool via SDK
      try {
        const [assetAddress, implementationAddress, receipt] = await this.deployMarket(config);

        return [assetAddress, implementationAddress, receipt];
      } catch (error) {
        this.logger.error(`deployAsset raw error:  ${error} using MarketConfig: ${JSON.stringify(config)}`);
        throw Error("Deployment of asset to Ionic pool failed: " + (error instanceof Error ? error.message : error));
      }
    }

    async validateConfiguration(config: MarketConfig) {
      // BigNumbers
      // 10% -> 0.1 * 1e18
      const reserveFactorBN = parseEther((config.reserveFactor / 100).toString());
      // 5% -> 0.05 * 1e18
      const adminFeeBN = parseEther((config.adminFee / 100).toString());
      // 50% -> 0.5 * 1e18
      // TODO: find out if this is a number or string. If its a number, parseEther will not work. Also parse Units works if number is between 0 - 0.9
      const collateralFactorBN = parseEther((config.collateralFactor / 100).toString());
      // Check collateral factor
      if (!(collateralFactorBN <= BigInt(0)) || collateralFactorBN > parseEther("0.9"))
        throw Error("Collateral factor must range from 0 to 0.9.");

      // Check reserve factor + admin fee + ionic fee
      if (!(reserveFactorBN >= BigInt(0))) throw Error("Reserve factor cannot be negative.");
      if (!(adminFeeBN >= BigInt(0))) throw Error("Admin fee cannot be negative.");

      // If reserveFactor or adminFee is greater than zero, we get ionic fee.
      // Sum of reserveFactor and adminFee should not be greater than ionic fee. ? i think
      if (reserveFactorBN > BigInt(0) || adminFeeBN > BigInt(0)) {
        const ionicFee = await this.contracts.FeeDistributor.read.interestFeeRate();
        if (reserveFactorBN + adminFeeBN + BigInt(ionicFee) > BigInt(1e18))
          throw Error(
            "Sum of reserve factor and admin fee should range from 0 to " + (1 - Number(ionicFee / BigInt(1e18))) + "."
          );
      }
    }

    async deployMarket(config: MarketConfig): Promise<[string, string, TransactionReceipt]> {
      const reserveFactorBN = parseEther((config.reserveFactor / 100).toString());
      const adminFeeBN = parseEther((config.adminFee / 100).toString());
      const collateralFactorBN = parseEther((config.collateralFactor / 100).toString());

      const comptroller = this.createComptroller(config.comptroller as Address, this.publicClient, this.walletClient);

      // Use Default CErc20Delegate
      const implementationAddress = this.chainDeployment.CErc20Delegate.address;
      const delegateType = 1; // regular delegate = CErc20Delegate
      const implementationData = "0x00";

      // Prepare Transaction Data
      const constructorData = encodeAbiParameters(
        parseAbiParameters("address, address, address, address, string, string, uint256, uint256"),
        [
          config.underlying,
          config.comptroller,
          config.feeDistributor,
          config.interestRateModel,
          config.name,
          config.symbol,
          reserveFactorBN,
          adminFeeBN
        ]
      );

      // Test Transaction
      const errorCode = await comptroller.simulate._deployMarket([
        delegateType,
        constructorData,
        implementationData,
        collateralFactorBN
      ]);
      if (errorCode.result !== BigInt(0)) {
        throw `Unable to _deployMarket: ${this.COMPTROLLER_ERROR_CODES[Number(errorCode.result)]}`;
      }

      // Make actual Transaction
      const tx = await comptroller.write._deployMarket(
        [delegateType, constructorData, implementationData, collateralFactorBN],
        { account: this.walletClient.account!.address, chain: this.walletClient.chain }
      );

      // Recreate Address of Deployed Market
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash: tx });
      if (receipt.status !== "success") {
        throw "Failed to deploy market ";
      }
      const marketCounter = await this.contracts.FeeDistributor.read.marketsCounter();

      const saltsHash = keccak256(
        encodePacked(["address", "address", "uint"], [config.comptroller, config.underlying, marketCounter])
      );
      const byteCodeHash = keccak256(
        ((CErc20DelegatorArtifact.bytecode.object as Address) + constructorData.substring(2)) as Address
      );
      const cErc20DelegatorAddress = getContractAddress({
        bytecode: byteCodeHash,
        from: this.chainDeployment.FeeDistributor.address as Address,
        opcode: "CREATE2",
        salt: saltsHash
      });

      // Return cToken proxy and implementation contract addresses
      return [cErc20DelegatorAddress, implementationAddress, receipt];
    }

    async getUpdatedAssets(mode: FundOperationMode, index: number, assets: NativePricedIonicAsset[], amount: bigint) {
      const assetToBeUpdated = assets[index];
      const interestRateModel = await this.getInterestRateModel(assetToBeUpdated.cToken);

      let updatedAsset: NativePricedIonicAsset;

      if (mode === FundOperationMode.SUPPLY) {
        const supplyBalance = assetToBeUpdated.supplyBalance + amount;
        const totalSupply = assetToBeUpdated.totalSupply + amount;
        updatedAsset = {
          ...assetToBeUpdated,
          supplyBalance,
          totalSupply,
          supplyBalanceNative:
            Number(formatUnits(supplyBalance, assetToBeUpdated.underlyingDecimals)) *
            Number(formatUnits(assetToBeUpdated.underlyingPrice, 18)),
          supplyRatePerBlock: interestRateModel.getSupplyRate(
            totalSupply > BigInt(0) ? (assetToBeUpdated.totalBorrow * BigInt(1e18)) / totalSupply : BigInt(0)
          )
        };
      } else if (mode === FundOperationMode.WITHDRAW) {
        const supplyBalance = assetToBeUpdated.supplyBalance - amount;
        const totalSupply = assetToBeUpdated.totalSupply - amount;
        updatedAsset = {
          ...assetToBeUpdated,
          supplyBalance,
          totalSupply,
          supplyBalanceNative:
            Number(formatUnits(supplyBalance, assetToBeUpdated.underlyingDecimals)) *
            Number(formatUnits(assetToBeUpdated.underlyingPrice, 18)),
          supplyRatePerBlock: interestRateModel.getSupplyRate(
            totalSupply > BigInt(0) ? (assetToBeUpdated.totalBorrow * BigInt(1e18)) / totalSupply : BigInt(0)
          )
        };
      } else if (mode === FundOperationMode.BORROW) {
        const borrowBalance = assetToBeUpdated.borrowBalance + amount;
        const totalBorrow = assetToBeUpdated.totalBorrow + amount;
        updatedAsset = {
          ...assetToBeUpdated,
          borrowBalance,
          totalBorrow,
          borrowBalanceNative:
            Number(formatUnits(borrowBalance, assetToBeUpdated.underlyingDecimals)) *
            Number(formatUnits(assetToBeUpdated.underlyingPrice, 18)),
          borrowRatePerBlock: interestRateModel.getBorrowRate(
            assetToBeUpdated.totalSupply > BigInt(0)
              ? (totalBorrow * BigInt(1e18)) / assetToBeUpdated.totalSupply
              : BigInt(0)
          )
        };
      } else if (mode === FundOperationMode.REPAY) {
        const borrowBalance = assetToBeUpdated.borrowBalance - amount;
        const totalBorrow = assetToBeUpdated.totalBorrow - amount;
        const borrowRatePerBlock = interestRateModel.getBorrowRate(
          assetToBeUpdated.totalSupply > BigInt(0)
            ? (totalBorrow * BigInt(1e18)) / assetToBeUpdated.totalSupply
            : BigInt(0)
        );

        updatedAsset = {
          ...assetToBeUpdated,
          borrowBalance,
          totalBorrow,
          borrowBalanceNative:
            Number(formatUnits(borrowBalance, assetToBeUpdated.underlyingDecimals)) *
            Number(formatUnits(assetToBeUpdated.underlyingPrice, 18)),
          borrowRatePerBlock
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
