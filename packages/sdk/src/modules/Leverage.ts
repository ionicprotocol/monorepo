import { NewPosition, OpenPosition, PositionInfo } from "@ionicprotocol/types";
import { BigNumber, constants, ContractTransaction, utils } from "ethers";

import EIP20InterfaceABI from "../../artifacts/EIP20Interface.sol/EIP20Interface.json";
import { getContract } from "../IonicSdk/utils";

import { CreateContractsModule } from "./CreateContracts";

export function withLeverage<TBase extends CreateContractsModule = CreateContractsModule>(Base: TBase) {
  return class Leverage extends Base {
    async getAllLeveredPositions(_: string): Promise<{ openPositions: OpenPosition[]; newPositions: NewPosition[] }> {
      return { newPositions: [], openPositions: [] };
    }

    async getPositionsByAccount(account: string) {
      const leveredPositionFactory = this.createLeveredPositionFactory();
      const [positions, states] = await leveredPositionFactory.callStatic.getPositionsByAccount(account);
      return await Promise.all(
        positions.map(async (position, index) => {
          const positionContract = this.createLeveredPosition(position);
          const state = states[index];
          const [collateralMarket, borrowMarket] = await Promise.all([
            positionContract.callStatic.collateralMarket(),
            positionContract.callStatic.stableMarket()
          ]);

          return { collateralMarket, borrowMarket, position, isClosed: state };
        })
      );
    }

    async getPositionSupplyApy(cTokenAddress: string, amount: BigNumber) {
      const cToken = this.createICErc20(cTokenAddress);

      return await cToken.callStatic.supplyRatePerBlockAfterDeposit(amount);
    }

    async getPositionBorrowApr(
      collateralMarket: string,
      borrowMarket: string,
      leverageRatio: BigNumber,
      amount: BigNumber
    ) {
      const leveredPositionLens = this.createLeveredPositionLens();

      return await leveredPositionLens.callStatic.getBorrowRateAtRatio(
        collateralMarket,
        borrowMarket,
        amount,
        leverageRatio
      );
    }

    async leveredFactoryApprove(collateralUnderlying: string) {
      const token = getContract(collateralUnderlying, EIP20InterfaceABI, this.signer);
      const tx = await token.approve(this.chainDeployment.LeveredPositionFactory.address, constants.MaxUint256);

      return tx;
    }

    async leveredPositionApprove(positionAddress: string, collateralUnderlying: string) {
      const token = getContract(collateralUnderlying, EIP20InterfaceABI, this.signer);
      const tx = await token.approve(positionAddress, constants.MaxUint256);

      return tx;
    }

    async createAndFundPosition(
      collateralMarket: string,
      borrowMarket: string,
      fundingAsset: string,
      fundingAmount: BigNumber
    ) {
      const leveredPositionFactory = this.createLeveredPositionFactory(this.signer);

      return await leveredPositionFactory.createAndFundPosition(
        collateralMarket,
        borrowMarket,
        fundingAsset,
        fundingAmount
      );
    }

    async createAndFundPositionAtRatio(
      collateralMarket: string,
      borrowMarket: string,
      fundingAsset: string,
      fundingAmount: BigNumber,
      leverageRatio: BigNumber
    ) {
      const leveredPositionFactory = this.createLeveredPositionFactory(this.signer);

      return await leveredPositionFactory.createAndFundPositionAtRatio(
        collateralMarket,
        borrowMarket,
        fundingAsset,
        fundingAmount,
        leverageRatio
      );
    }

    async getRangeOfLeverageRatio(address: string) {
      const leveredPosition = this.createLeveredPosition(address);

      return await Promise.all([
        leveredPosition.callStatic.getMinLeverageRatio(),
        leveredPosition.callStatic.getMaxLeverageRatio()
      ]);
    }

    async isPositionClosed(address: string) {
      const leveredPosition = this.createLeveredPosition(address);

      return await leveredPosition.callStatic.isPositionClosed();
    }

    async closeLeveredPosition(address: string, withdrawTo?: string) {
      const isPositionClosed = await this.isPositionClosed(address);
      const leveredPosition = this.createLeveredPosition(address, this.signer);

      if (!isPositionClosed) {
        let tx: ContractTransaction;

        if (withdrawTo) {
          tx = await leveredPosition["closePosition(address)"](withdrawTo);
        } else {
          tx = await leveredPosition["closePosition()"]();
        }

        return tx;
      } else {
        return null;
      }
    }

    async adjustLeverageRatio(address: string, ratio: number) {
      const leveredPosition = this.createLeveredPosition(address, this.signer);

      const tx = await leveredPosition.adjustLeverageRatio(utils.parseUnits(ratio.toString()));

      return tx;
    }

    async fundPosition(positionAddress: string, underlyingToken: string, amount: BigNumber) {
      const leveredPosition = this.createLeveredPosition(positionAddress, this.signer);

      const tx = await leveredPosition.fundPosition(underlyingToken, amount);

      return tx;
    }

    async getNetAPY(
      supplyApy: BigNumber,
      supplyAmount: BigNumber,
      collateralMarket: string,
      borrowableMarket: string,
      leverageRatio: BigNumber
    ) {
      const leveredPositionLens = this.createLeveredPositionLens();

      return await leveredPositionLens.callStatic.getNetAPY(
        supplyApy,
        supplyAmount,
        collateralMarket,
        borrowableMarket,
        leverageRatio
      );
    }

    async getCurrentLeverageRatio(positionAddress: string) {
      const leveredPosition = this.createLeveredPosition(positionAddress);

      return await leveredPosition.callStatic.getCurrentLeverageRatio();
    }

    async getEquityAmount(positionAddress: string) {
      const leveredPosition = this.createLeveredPosition(positionAddress);

      return await leveredPosition.callStatic.getEquityAmount();
    }

    async removeClosedPosition(positionAddress: string) {
      const leveredPositionFactory = this.createLeveredPositionFactory(this.signer);

      const tx = await leveredPositionFactory.removeClosedPosition(positionAddress);

      return tx;
    }

    async getPositionInfo(positionAddress: string, supplyApy: BigNumber): Promise<PositionInfo> {
      const leveredPositionLens = this.createLeveredPositionLens();

      return await leveredPositionLens.getPositionInfo(positionAddress, supplyApy);
    }

    async getNetApyForPositionAfterFunding(positionAddress: string, supplyApy: BigNumber, newFunding: BigNumber) {
      const leveredPositionLens = this.createLeveredPositionLens();

      return await leveredPositionLens.getNetApyForPositionAfterFunding(positionAddress, supplyApy, newFunding);
    }

    async getLeverageRatioAfterFunding(positionAddress: string, newFunding: BigNumber) {
      const leveredPositionLens = this.createLeveredPositionLens();

      return await leveredPositionLens.getLeverageRatioAfterFunding(positionAddress, newFunding);
    }
  };
}
